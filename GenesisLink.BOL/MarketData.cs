using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenesisLink.BOL
{
    [Table("MarketData")]
    public class MarketData
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public Guid Id { get; set; }

        [Column(TypeName = "NVARCHAR(50)")]
        public string? Symbol { get; set; }

        [Column(TypeName = "Numeric(10,2)")]
        public decimal? LastKnownPrice { get; set; }

        [Column(TypeName = "Numeric(10,0)")]
        public decimal? Volume { get; set; }

        [Column(TypeName = "NVARCHAR(450)")]
        public string? CreatedBy { get; set; } = "System";
        public DateTime? CreatedTS { get; set; } = DateTime.Now;

        [Column(TypeName = "NVARCHAR(450)")]
        public string? UpdatedBy { get; set; } = "System";
        public DateTime? UpdatedTS { get; set; } = DateTime.Now;
    }
}
