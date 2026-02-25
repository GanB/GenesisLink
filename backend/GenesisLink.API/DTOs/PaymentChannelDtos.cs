using System.ComponentModel.DataAnnotations;

namespace GenesisLink.API.DTOs;

public record CreateChannelRequest
{
    [Required]
    [EthereumAddress]
    public string SenderAddress { get; init; } = string.Empty;

    [Required]
    [EthereumAddress]
    public string RecipientAddress { get; init; } = string.Empty;

    [Range(0.01, (double)1_000_000_000)]
    public decimal Deposit { get; init; }

    [Range(1, 2592000)] // max 30 days in seconds
    public int DurationSeconds { get; init; }
}

public record PaymentChannelResponse
{
    public string Id { get; init; } = string.Empty;
    public string SenderAddress { get; init; } = string.Empty;
    public string RecipientAddress { get; init; } = string.Empty;
    public decimal Deposit { get; init; }
    public DateTime Expiry { get; init; }
    public string State { get; init; } = string.Empty;
    public string? TransactionHash { get; init; }
    public DateTime CreatedAt { get; init; }
}
