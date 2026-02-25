// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title GenesisLoan - DeFi lending contract for GenesisLink
/// @notice Manages loan lifecycle: request → approve → repay/default
contract GenesisLoan is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error ZeroAmount();
    error InvalidTerm();
    error LoanNotFound(uint256 loanId);
    error InvalidLoanState(uint256 loanId, LoanState current, LoanState expected);
    error Unauthorized();
    error InsufficientRepayment(uint256 loanId, uint256 required, uint256 provided);
    error LoanNotExpired(uint256 loanId);

    enum LoanState { PENDING, ACTIVE, REPAID, DEFAULTED }

    struct Loan {
        address borrower;
        uint256 principal;
        uint256 interestRate; // basis points (e.g., 500 = 5%)
        uint256 termDays;
        uint256 collateralAmount;
        uint256 startTime;
        uint256 repaidAmount;
        LoanState state;
    }

    IERC20 public immutable lendingToken;

    uint256 public nextLoanId = 1;
    /// @notice Default interest rate in basis points (5% = 500)
    uint256 public defaultInterestRate = 500;

    /// @notice Loan ID => Loan details
    mapping(uint256 => Loan) public loans;

    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 termDays, uint256 collateralAmount);
    event LoanApproved(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 totalRepaid);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);

    /// @notice Initialize with the ERC-20 token used for lending
    /// @param _lendingToken Address of the ERC-20 lending token
    constructor(address _lendingToken) Ownable(msg.sender) {
        lendingToken = IERC20(_lendingToken);
    }

    /// @notice Request a new loan
    /// @param amount Loan principal amount
    /// @param termDays Loan term in days
    /// @param collateralAmount Amount of collateral pledged
    /// @return loanId The ID of the created loan
    function requestLoan(
        uint256 amount,
        uint256 termDays,
        uint256 collateralAmount
    ) external returns (uint256 loanId) {
        if (amount == 0) revert ZeroAmount();
        if (termDays == 0 || termDays > 365) revert InvalidTerm();

        loanId = nextLoanId++;

        loans[loanId] = Loan({
            borrower: msg.sender,
            principal: amount,
            interestRate: defaultInterestRate,
            termDays: termDays,
            collateralAmount: collateralAmount,
            startTime: 0,
            repaidAmount: 0,
            state: LoanState.PENDING
        });

        emit LoanRequested(loanId, msg.sender, amount, termDays, collateralAmount);
    }

    /// @notice Approve a pending loan and disburse funds (owner only)
    /// @dev Owner must have approved this contract to spend lending tokens
    /// @param loanId The loan to approve
    function approveLoan(uint256 loanId) external onlyOwner nonReentrant {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) revert LoanNotFound(loanId);
        if (loan.state != LoanState.PENDING) {
            revert InvalidLoanState(loanId, loan.state, LoanState.PENDING);
        }

        loan.state = LoanState.ACTIVE;
        loan.startTime = block.timestamp;

        lendingToken.safeTransferFrom(msg.sender, loan.borrower, loan.principal);
        emit LoanApproved(loanId, loan.borrower, loan.principal);
    }

    /// @notice Repay an active loan (principal + interest)
    /// @param loanId The loan to repay
    /// @param amount Amount to repay
    function repayLoan(uint256 loanId, uint256 amount) external nonReentrant {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) revert LoanNotFound(loanId);
        if (loan.state != LoanState.ACTIVE) {
            revert InvalidLoanState(loanId, loan.state, LoanState.ACTIVE);
        }
        if (loan.borrower != msg.sender) revert Unauthorized();
        if (amount == 0) revert ZeroAmount();

        uint256 totalOwed = loan.principal + calculateInterest(
            loan.principal,
            loan.interestRate,
            loan.termDays
        );

        uint256 remaining = totalOwed - loan.repaidAmount;
        if (amount < remaining) {
            revert InsufficientRepayment(loanId, remaining, amount);
        }

        loan.repaidAmount = totalOwed;
        loan.state = LoanState.REPAID;

        lendingToken.safeTransferFrom(msg.sender, owner(), remaining);
        emit LoanRepaid(loanId, msg.sender, totalOwed);
    }

    /// @notice Mark an expired loan as defaulted (owner only)
    /// @param loanId The loan to default
    function markDefault(uint256 loanId) external onlyOwner {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0)) revert LoanNotFound(loanId);
        if (loan.state != LoanState.ACTIVE) {
            revert InvalidLoanState(loanId, loan.state, LoanState.ACTIVE);
        }

        uint256 expiry = loan.startTime + (loan.termDays * 1 days);
        if (block.timestamp < expiry) revert LoanNotExpired(loanId);

        loan.state = LoanState.DEFAULTED;
        emit LoanDefaulted(loanId, loan.borrower);
    }

    /// @notice Get the current state of a loan
    /// @param loanId The loan identifier
    /// @return state The current loan state
    function getLoanStatus(uint256 loanId) external view returns (LoanState) {
        if (loans[loanId].borrower == address(0)) revert LoanNotFound(loanId);
        return loans[loanId].state;
    }

    /// @notice Calculate simple interest
    /// @param principal The loan principal
    /// @param rate Interest rate in basis points (500 = 5%)
    /// @param termDays Loan term in days
    /// @return interest The calculated interest amount
    function calculateInterest(
        uint256 principal,
        uint256 rate,
        uint256 termDays
    ) public pure returns (uint256) {
        return (principal * rate * termDays) / (10000 * 365);
    }

    /// @notice Set the default interest rate (owner only)
    /// @param rate New rate in basis points
    function setDefaultInterestRate(uint256 rate) external onlyOwner {
        defaultInterestRate = rate;
    }
}
