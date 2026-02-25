namespace GenesisLink.Core.Entities;

public enum LoanState
{
    Pending,
    Active,
    Repaid,
    Defaulted
}

public class Loan
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BorrowerAddress { get; set; } = string.Empty;
    public decimal Principal { get; set; }
    public decimal InterestRate { get; set; }
    public int TermDays { get; set; }
    public decimal CollateralAmount { get; set; }
    public LoanState State { get; set; } = LoanState.Pending;
    public string? TransactionHash { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedAt { get; set; }
    public DateTime? RepaidAt { get; set; }
}
