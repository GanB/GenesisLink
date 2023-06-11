using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.Intrinsics.X86;
using System.Text;
using System.Threading.Tasks;

namespace GenesisLink.BOL

{
    [Table("Wallets")]
    public class Wallet
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public Guid Id { get; set; }

        [Column(TypeName = "NVARCHAR(450)")]
        public string? WalletAddress { get; set; }

        [Column(TypeName = "NVARCHAR(450)")]
        public string? WalletName { get; set; }

        [Column(TypeName = "NVARCHAR(450)")]
        public string? ChainSource { get; set; }

        [Column(TypeName = "Numeric(10,2)")]
        public decimal? Balance { get; set; }

        [Column(TypeName = "bit")]
        public bool? IsLocked { get; set; }

        [Column(TypeName = "NVARCHAR(450)")]
        public string? CreatedBy { get; set; } = "System";
        public DateTime? CreatedTS { get; set; } = DateTime.Now;

        [Column(TypeName = "NVARCHAR(450)")]
        public string? UpdatedBy { get; set; } = "System";
        public DateTime? UpdatedTS { get; set; } = DateTime.Now;
    }
}
