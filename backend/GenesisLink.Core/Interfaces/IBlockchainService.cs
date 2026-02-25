namespace GenesisLink.Core.Interfaces;

public interface IBlockchainService
{
    Task<decimal> GetBalanceAsync(string address);
    Task<decimal> GetTokenBalanceAsync(string walletAddress);
    Task<string> GetLatestBlockAsync();
    Task<ulong> GetNetworkChainIdAsync();
}
