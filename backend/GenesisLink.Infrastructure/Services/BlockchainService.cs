using GenesisLink.Core.Interfaces;
using Nethereum.Web3;
using Nethereum.Util;
using Nethereum.Contracts;
using Nethereum.ABI.FunctionEncoding.Attributes;

namespace GenesisLink.Infrastructure.Services;

[Function("balanceOf", "uint256")]
public class BalanceOfFunction : FunctionMessage
{
    [Parameter("address", "account", 1)]
    public string Account { get; set; } = string.Empty;
}

public class BlockchainService : IBlockchainService
{
    private readonly Web3 _web3;
    private readonly string _tokenAddress;

    public BlockchainService(string rpcUrl, string tokenAddress)
    {
        _web3 = new Web3(rpcUrl);
        _tokenAddress = tokenAddress;
    }

    public async Task<decimal> GetBalanceAsync(string address)
    {
        var balance = await _web3.Eth.GetBalance.SendRequestAsync(address);
        return Web3.Convert.FromWei(balance.Value);
    }

    public async Task<decimal> GetTokenBalanceAsync(string walletAddress)
    {
        var balanceOfMessage = new BalanceOfFunction { Account = walletAddress };
        var handler = _web3.Eth.GetContractQueryHandler<BalanceOfFunction>();
        var balance = await handler.QueryAsync<System.Numerics.BigInteger>(_tokenAddress, balanceOfMessage);
        return Web3.Convert.FromWei(balance);
    }

    public async Task<string> GetLatestBlockAsync()
    {
        var block = await _web3.Eth.Blocks.GetBlockWithTransactionsByNumber.SendRequestAsync(
            Nethereum.RPC.Eth.DTOs.BlockParameter.CreateLatest());
        return block.Number.Value.ToString();
    }

    public async Task<ulong> GetNetworkChainIdAsync()
    {
        var chainId = await _web3.Eth.ChainId.SendRequestAsync();
        return (ulong)chainId.Value;
    }
}
