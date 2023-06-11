using Microsoft.AspNetCore.Identity;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace GenesisLink.BOL
{
    [Table("AppUsers")]
    public class AppUser : IdentityUser
    {
        [Column(TypeName = "VARCHAR(100)")]
        public string? FirstName { get; set; }

        [Column(TypeName = "VARCHAR(100)")]
        public string? LastName { get; set; }

        [Column(TypeName = "VARCHAR(100)")]
        public string? AddressLine1 { get; set; }

        [Column(TypeName = "VARCHAR(100)")]
        public string? AddressLine2 { get; set; }

        [Column(TypeName = "VARCHAR(100)")]
        public string? City { get; set; }

        [Column(TypeName = "VARCHAR(50)")]
        public string? State { get; set; }

        [Column(TypeName = "VARCHAR(50)")]
        public string? Zip { get; set; }

        [Column(TypeName = "VARCHAR(MAX)")]
        public string? ProfilePictureUrl { get; set; }

        [Column(TypeName = "NVARCHAR(450)")]
        public string? CreatedBy { get; set; } = "System";
        public DateTime? CreatedTS { get; set; } = DateTime.Now;

        [Column(TypeName = "NVARCHAR(450)")]
        public string? UpdatedBy { get; set; } = "System";
        public DateTime? UpdatedTS { get; set; } = DateTime.Now;

    }
}