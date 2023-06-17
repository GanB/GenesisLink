using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GenesisLink.WebApi.ViewModels
{
    public class SignUpViewModel
    {
        [Required]
        public string? FirstName { get; set; }
        
        [Required]
        public string? LastName { get; set; }
        
        [Required]
        public string? EmailId { get; set; }
        
        [Required]
        public string? Password { get; set; }

        [Required]
        public string? AddressLine1 { get; set; }

        [Required]
        public string? AddressLine2 { get; set; }

        [Required]
        public string? City { get; set; }

        [Required]
        public string? State { get; set; }

        [Required]
        public string? Zip { get; set; }
        public string? ProfilePictureUrl { get; set; }

    }
}
