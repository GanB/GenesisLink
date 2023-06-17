using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenesisLink.BOL
{
    [Table("UserMarketData")]
    public class UserMarketData
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("AppUserNav")]
        [Column(TypeName = "NVARCHAR(450)")]
        public string? UserId { get; set; }
        public AppUser? AppUserNav { get; set; }

        [ForeignKey("MarketDataNav")]
        public Guid? MarketDataId { get; set; }
        public MarketData? MarketDataNav { get; set; }

        [Column(TypeName = "NVARCHAR(450)")]
        public string? CreatedBy { get; set; } = "System";
        public DateTime? CreatedTS { get; set; } = DateTime.Now;

        [Column(TypeName = "NVARCHAR(450)")]
        public string? UpdatedBy { get; set; } = "System";
        public DateTime? UpdatedTS { get; set; } = DateTime.Now;
    }
}
