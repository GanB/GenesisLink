// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title GenesisCollateral - Collateral vault for GenesisLink lending
/// @notice Locks ERC-20 tokens as collateral for loans
contract GenesisCollateral is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error ZeroAmount();
    error LoanNotRepaid(uint256 loanId);
    error NoCollateral(uint256 loanId);
    error LTVBelowThreshold(uint256 loanId, uint256 currentLTV);
    error Unauthorized();

    struct CollateralInfo {
        address depositor;
        uint256 amount;
        bool withdrawn;
    }

    IERC20 public immutable collateralToken;
    /// @notice Loan ID => collateral info
    mapping(uint256 => CollateralInfo) public collaterals;
    /// @notice Loan ID => repaid status (set by loan contract / owner)
    mapping(uint256 => bool) public loanRepaid;
    /// @notice Loan ID => loan principal for LTV calculation
    mapping(uint256 => uint256) public loanPrincipal;

    event CollateralDeposited(uint256 indexed loanId, address indexed depositor, uint256 amount);
    event CollateralWithdrawn(uint256 indexed loanId, address indexed depositor, uint256 amount);
    event LiquidationTriggered(uint256 indexed loanId, uint256 collateralAmount);
    event LoanMarkedRepaid(uint256 indexed loanId);

    /// @notice Initialize with the ERC-20 token used as collateral
    /// @param _collateralToken Address of the ERC-20 collateral token
    constructor(address _collateralToken) Ownable(msg.sender) {
        collateralToken = IERC20(_collateralToken);
    }

    /// @notice Deposit collateral for a loan
    /// @param loanId The loan identifier
    /// @param amount Amount of tokens to lock
    function depositCollateral(uint256 loanId, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        CollateralInfo storage info = collaterals[loanId];
        if (info.depositor == address(0)) {
            // First deposit — set depositor
            info.depositor = msg.sender;
        } else if (info.depositor != msg.sender) {
            // Subsequent deposit must be from original depositor
            revert Unauthorized();
        }
        info.amount += amount;
        info.withdrawn = false;

        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        emit CollateralDeposited(loanId, msg.sender, amount);
    }

    /// @notice Withdraw collateral after loan is repaid
    /// @param loanId The loan identifier
    function withdrawCollateral(uint256 loanId) external nonReentrant {
        CollateralInfo storage info = collaterals[loanId];
        if (info.amount == 0) revert NoCollateral(loanId);
        if (info.depositor != msg.sender) revert Unauthorized();
        if (!loanRepaid[loanId]) revert LoanNotRepaid(loanId);

        uint256 amount = info.amount;
        info.amount = 0;
        info.withdrawn = true;

        collateralToken.safeTransfer(msg.sender, amount);
        emit CollateralWithdrawn(loanId, msg.sender, amount);
    }

    /// @notice Liquidate collateral if LTV exceeds 80% (owner only)
    /// @param loanId The loan identifier
    function liquidate(uint256 loanId) external onlyOwner nonReentrant {
        CollateralInfo storage info = collaterals[loanId];
        if (info.amount == 0) revert NoCollateral(loanId);

        uint256 ltv = getCollateralRatio(loanId);
        if (ltv <= 80) revert LTVBelowThreshold(loanId, ltv);

        uint256 amount = info.amount;
        info.amount = 0;
        info.withdrawn = true;

        collateralToken.safeTransfer(owner(), amount);
        emit LiquidationTriggered(loanId, amount);
    }

    /// @notice Get current LTV percentage for a loan
    /// @param loanId The loan identifier
    /// @return LTV percentage (0-100+). Higher means riskier.
    function getCollateralRatio(uint256 loanId) public view returns (uint256) {
        uint256 collateralAmount = collaterals[loanId].amount;
        uint256 principal = loanPrincipal[loanId];
        if (collateralAmount == 0) return 0;
        if (principal == 0) return 0;
        return (principal * 100) / collateralAmount;
    }

    /// @notice Mark a loan as repaid (owner only)
    /// @param loanId The loan identifier
    function markLoanRepaid(uint256 loanId) external onlyOwner {
        loanRepaid[loanId] = true;
        emit LoanMarkedRepaid(loanId);
    }

    /// @notice Set loan principal for LTV calculation (owner only)
    /// @param loanId The loan identifier
    /// @param principal The loan principal amount
    function setLoanPrincipal(uint256 loanId, uint256 principal) external onlyOwner {
        loanPrincipal[loanId] = principal;
    }
}
