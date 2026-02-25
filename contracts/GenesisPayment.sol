// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @title GenesisPayment - x402 micropayment channels for GenesisLink
/// @notice Off-chain payment channels with on-chain settlement using EIP-712
contract GenesisPayment is Ownable, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;

    error ZeroAmount();
    error ChannelNotFound(bytes32 channelId);
    error ChannelAlreadyExists(bytes32 channelId);
    error ChannelNotOpen(bytes32 channelId);
    error ChannelNotExpired(bytes32 channelId);
    error Unauthorized();
    error InvalidSignature();
    error AmountExceedsDeposit(uint256 amount, uint256 deposit);
    error InvalidDuration();

    enum ChannelState { OPEN, CLOSED, FORCE_CLOSED }

    struct Channel {
        address sender;
        address recipient;
        uint256 deposit;
        uint256 expiry;
        ChannelState state;
    }

    IERC20 public immutable paymentToken;

    /// @notice Channel ID => Channel info
    mapping(bytes32 => Channel) public channels;

    bytes32 private constant PAYMENT_TYPEHASH =
        keccak256("Payment(bytes32 channelId,uint256 amount,uint256 nonce)");

    event ChannelOpened(bytes32 indexed channelId, address indexed sender, address indexed recipient, uint256 deposit, uint256 expiry);
    event ChannelClosed(bytes32 indexed channelId, uint256 senderRefund, uint256 recipientPayout);
    event ChannelForceClosed(bytes32 indexed channelId, address indexed closer, uint256 refund);

    /// @notice Initialize with the ERC-20 token used for payments
    /// @param _paymentToken Address of the ERC-20 payment token
    constructor(address _paymentToken) Ownable(msg.sender) EIP712("GenesisPayment", "1") {
        paymentToken = IERC20(_paymentToken);
    }

    /// @notice Open a new payment channel
    /// @param recipient The payment recipient
    /// @param deposit Amount to lock in the channel
    /// @param durationSeconds How long the channel stays open
    /// @return channelId The unique channel identifier
    function openChannel(
        address recipient,
        uint256 deposit,
        uint256 durationSeconds
    ) external nonReentrant returns (bytes32 channelId) {
        if (deposit == 0) revert ZeroAmount();
        if (durationSeconds == 0 || durationSeconds > 30 days) revert InvalidDuration();

        channelId = keccak256(abi.encodePacked(msg.sender, recipient, block.timestamp));

        if (channels[channelId].sender != address(0)) revert ChannelAlreadyExists(channelId);

        channels[channelId] = Channel({
            sender: msg.sender,
            recipient: recipient,
            deposit: deposit,
            expiry: block.timestamp + durationSeconds,
            state: ChannelState.OPEN
        });

        paymentToken.safeTransferFrom(msg.sender, address(this), deposit);
        emit ChannelOpened(channelId, msg.sender, recipient, deposit, block.timestamp + durationSeconds);
    }

    /// @notice Close a channel with a signed payment voucher
    /// @param channelId The channel to close
    /// @param amount Amount to pay recipient (rest refunded to sender)
    /// @param nonce Payment nonce for replay protection
    /// @param signature EIP-712 signature from the sender
    function closeChannel(
        bytes32 channelId,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant {
        Channel storage channel = channels[channelId];
        if (channel.sender == address(0)) revert ChannelNotFound(channelId);
        if (channel.state != ChannelState.OPEN) revert ChannelNotOpen(channelId);
        if (msg.sender != channel.recipient) revert Unauthorized();
        if (amount > channel.deposit) revert AmountExceedsDeposit(amount, channel.deposit);

        // Verify EIP-712 signature from sender
        bytes32 structHash = keccak256(abi.encode(PAYMENT_TYPEHASH, channelId, amount, nonce));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        if (signer != channel.sender) revert InvalidSignature();

        channel.state = ChannelState.CLOSED;

        uint256 refund = channel.deposit - amount;
        if (amount > 0) {
            paymentToken.safeTransfer(channel.recipient, amount);
        }
        if (refund > 0) {
            paymentToken.safeTransfer(channel.sender, refund);
        }

        emit ChannelClosed(channelId, refund, amount);
    }

    /// @notice Force-close an expired channel (sender gets full refund)
    /// @param channelId The channel to force-close
    function forceClose(bytes32 channelId) external nonReentrant {
        Channel storage channel = channels[channelId];
        if (channel.sender == address(0)) revert ChannelNotFound(channelId);
        if (channel.state != ChannelState.OPEN) revert ChannelNotOpen(channelId);
        if (msg.sender != channel.sender) revert Unauthorized();
        if (block.timestamp < channel.expiry) revert ChannelNotExpired(channelId);

        channel.state = ChannelState.FORCE_CLOSED;

        paymentToken.safeTransfer(channel.sender, channel.deposit);
        emit ChannelForceClosed(channelId, channel.sender, channel.deposit);
    }

    /// @notice Verify a payment signature off-chain
    /// @param channelId The channel ID
    /// @param amount Payment amount
    /// @param nonce Payment nonce
    /// @param signature The EIP-712 signature
    /// @return valid Whether the signature is valid
    /// @return signer The recovered signer address
    function verifyPayment(
        bytes32 channelId,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external view returns (bool valid, address signer) {
        bytes32 structHash = keccak256(abi.encode(PAYMENT_TYPEHASH, channelId, amount, nonce));
        bytes32 digest = _hashTypedDataV4(structHash);
        signer = ECDSA.recover(digest, signature);

        Channel storage channel = channels[channelId];
        valid = (signer == channel.sender && amount <= channel.deposit);
    }

    /// @notice Get the EIP-712 domain separator (useful for off-chain signing)
    /// @return The domain separator hash
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /// @notice Get the payment type hash (useful for off-chain signing)
    /// @return The payment struct type hash
    function getPaymentTypehash() external pure returns (bytes32) {
        return PAYMENT_TYPEHASH;
    }
}
