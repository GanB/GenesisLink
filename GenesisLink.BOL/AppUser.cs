using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace GenesisLink.BOL
{
    [Table("AppUser")]
    public class AppUser : IdentityUser
    {
        public string? profilePicPath { get; set; }

    }
}