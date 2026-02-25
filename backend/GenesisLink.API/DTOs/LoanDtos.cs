using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace GenesisLink.API.DTOs;

public partial class EthereumAddressAttribute : ValidationAttribute
{
    [GeneratedRegex(@"^0x[0-9a-fA-F]{40}$")]
    private static partial Regex EthAddressRegex();

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string addr || !EthAddressRegex().IsMatch(addr))
            return new ValidationResult("Must be a valid Ethereum address (0x + 40 hex chars)");
        return ValidationResult.Success;
    }
}

public record CreateLoanRequest
{
    [Required]
    [EthereumAddress]
    public string BorrowerAddress { get; init; } = string.Empty;

    [Range(0.01, (double)1_000_000_000)]
    public decimal Principal { get; init; }

    [Range(1, 365)]
    public int TermDays { get; init; }

    [Range(0, (double)1_000_000_000)]
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
