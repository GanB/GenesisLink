namespace GenesisLink.Core.Entities;

public enum ChannelState
{
    Open,
    Closed,
    ForceClosed
}

public class PaymentChannel
{
    public string Id { get; set; } = string.Empty;
    public string SenderAddress { get; set; } = string.Empty;
    public string RecipientAddress { get; set; } = string.Empty;
    public decimal Deposit { get; set; }
    public DateTime Expiry { get; set; }
    public ChannelState State { get; set; } = ChannelState.Open;
    public string? TransactionHash { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
