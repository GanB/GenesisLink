using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Numerics;
using Nethereum.Hex.HexTypes;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.Web3;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Contracts.CQS;
using Nethereum.Contracts.ContractHandlers;
using Nethereum.Contracts;
using System.Threading;
using GenesisLink.SmartContract.Contracts.GenesisLinkTransaction.ContractDefinition;

namespace GenesisLink.SmartContract.Contracts.GenesisLinkTransaction
{
    public partial class GenesisLinkTransactionService
    {
        public static Task<TransactionReceipt> DeployContractAndWaitForReceiptAsync(Nethereum.Web3.Web3 web3, GenesisLinkTransactionDeployment genesisLinkTransactionDeployment, CancellationTokenSource cancellationTokenSource = null)
        {
            return web3.Eth.GetContractDeploymentHandler<GenesisLinkTransactionDeployment>().SendRequestAndWaitForReceiptAsync(genesisLinkTransactionDeployment, cancellationTokenSource);
        }

        public static Task<string> DeployContractAsync(Nethereum.Web3.Web3 web3, GenesisLinkTransactionDeployment genesisLinkTransactionDeployment)
        {
            return web3.Eth.GetContractDeploymentHandler<GenesisLinkTransactionDeployment>().SendRequestAsync(genesisLinkTransactionDeployment);
        }

        public static async Task<GenesisLinkTransactionService> DeployContractAndGetServiceAsync(Nethereum.Web3.Web3 web3, GenesisLinkTransactionDeployment genesisLinkTransactionDeployment, CancellationTokenSource cancellationTokenSource = null)
        {
            var receipt = await DeployContractAndWaitForReceiptAsync(web3, genesisLinkTransactionDeployment, cancellationTokenSource);
            return new GenesisLinkTransactionService(web3, receipt.ContractAddress);
        }

        protected Nethereum.Web3.IWeb3 Web3{ get; }

        public ContractHandler ContractHandler { get; }

        public GenesisLinkTransactionService(Nethereum.Web3.Web3 web3, string contractAddress)
        {
            Web3 = web3;
            ContractHandler = web3.Eth.GetContractHandler(contractAddress);
        }

        public GenesisLinkTransactionService(Nethereum.Web3.IWeb3 web3, string contractAddress)
        {
            Web3 = web3;
            ContractHandler = web3.Eth.GetContractHandler(contractAddress);
        }

        public Task<string> AddToBlockchainRequestAsync(AddToBlockchainFunction addToBlockchainFunction)
        {
             return ContractHandler.SendRequestAsync(addToBlockchainFunction);
        }

        public Task<TransactionReceipt> AddToBlockchainRequestAndWaitForReceiptAsync(AddToBlockchainFunction addToBlockchainFunction, CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync(addToBlockchainFunction, cancellationToken);
        }

        public Task<string> AddToBlockchainRequestAsync(string receiver, BigInteger amount, string message, string keyword)
        {
            var addToBlockchainFunction = new AddToBlockchainFunction();
                addToBlockchainFunction.Receiver = receiver;
                addToBlockchainFunction.Amount = amount;
                addToBlockchainFunction.Message = message;
                addToBlockchainFunction.Keyword = keyword;
            
             return ContractHandler.SendRequestAsync(addToBlockchainFunction);
        }

        public Task<TransactionReceipt> AddToBlockchainRequestAndWaitForReceiptAsync(string receiver, BigInteger amount, string message, string keyword, CancellationTokenSource cancellationToken = null)
        {
            var addToBlockchainFunction = new AddToBlockchainFunction();
                addToBlockchainFunction.Receiver = receiver;
                addToBlockchainFunction.Amount = amount;
                addToBlockchainFunction.Message = message;
                addToBlockchainFunction.Keyword = keyword;
            
             return ContractHandler.SendRequestAndWaitForReceiptAsync(addToBlockchainFunction, cancellationToken);
        }

        public Task<GetAllTransactionsOutputDTO> GetAllTransactionsQueryAsync(GetAllTransactionsFunction getAllTransactionsFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryDeserializingToObjectAsync<GetAllTransactionsFunction, GetAllTransactionsOutputDTO>(getAllTransactionsFunction, blockParameter);
        }

        public Task<GetAllTransactionsOutputDTO> GetAllTransactionsQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryDeserializingToObjectAsync<GetAllTransactionsFunction, GetAllTransactionsOutputDTO>(null, blockParameter);
        }

        public Task<BigInteger> GetTransactionCountQueryAsync(GetTransactionCountFunction getTransactionCountFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<GetTransactionCountFunction, BigInteger>(getTransactionCountFunction, blockParameter);
        }

        
        public Task<BigInteger> GetTransactionCountQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<GetTransactionCountFunction, BigInteger>(null, blockParameter);
        }
    }
}
