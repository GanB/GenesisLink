using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenesisLink.BOL
{
    [Table("Transactions")]
    public class Transaction
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("AppUserNav")]
        [Column(TypeName = "NVARCHAR(450)")]
        public string? UserId { get; set; }
        public AppUser? AppUserNav { get; set; }

        [Column(TypeName = "NVARCHAR(450)")]
        public string? SourceWalletAddress { get; set; }

        [Column(TypeName = "NVARCHAR(450)")]
        public string? DestinationWalletAddress { get; set; }

        [Column(TypeName = "Numeric(10,2)")]
        public decimal? Amount { get; set; }

        [Column(TypeName = "NVARCHAR(450)")]
        public string? TransactionMessage { get; set; }

        [Column(TypeName = "NVARCHAR(450)")]
        public string? CreatedBy { get; set; } = "System";
        public DateTime? CreatedTS { get; set; } = DateTime.Now;

        [Column(TypeName = "NVARCHAR(450)")]
        public string? UpdatedBy { get; set; } = "System";
        public DateTime? UpdatedTS { get; set; } = DateTime.Now;
    }
}
