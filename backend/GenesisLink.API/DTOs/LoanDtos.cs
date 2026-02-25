using System.ComponentModel.DataAnnotations;

namespace GenesisLink.API.DTOs;

public record CreateLoanRequest
{
    [Required]
    public string BorrowerAddress { get; init; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Principal { get; init; }

    [Range(1, 365)]
    public int TermDays { get; init; }

    [Range(0, double.MaxValue)]
    public decimal CollateralAmount { get; init; }
}

public record LoanResponse
{
    public string Id { get; init; } = string.Empty;
    public string BorrowerAddress { get; init; } = string.Empty;
    public decimal Principal { get; init; }
    public decimal InterestRate { get; init; }
    public int TermDays { get; init; }
    public decimal CollateralAmount { get; init; }
    public string State { get; init; } = string.Empty;
    public string? TransactionHash { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? ApprovedAt { get; init; }
    public DateTime? RepaidAt { get; init; }
}
