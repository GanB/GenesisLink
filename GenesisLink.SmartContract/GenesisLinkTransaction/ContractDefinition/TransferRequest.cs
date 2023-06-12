using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Numerics;
using Nethereum.Hex.HexTypes;
using Nethereum.ABI.FunctionEncoding.Attributes;

namespace GenesisLink.SmartContract.Contracts.GenesisLinkTransaction.ContractDefinition
{
    public partial class TransferRequest : TransferRequestBase { }

    public class TransferRequestBase 
    {
        [Parameter("address", "sender", 1)]
        public virtual string Sender { get; set; }
        [Parameter("address", "receiver", 2)]
        public virtual string Receiver { get; set; }
        [Parameter("uint256", "amount", 3)]
        public virtual BigInteger Amount { get; set; }
        [Parameter("string", "message", 4)]
        public virtual string Message { get; set; }
        [Parameter("uint256", "timestamp", 5)]
        public virtual BigInteger Timestamp { get; set; }
        [Parameter("string", "keyword", 6)]
        public virtual string Keyword { get; set; }
    }
}
