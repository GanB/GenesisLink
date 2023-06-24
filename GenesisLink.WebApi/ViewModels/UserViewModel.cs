using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace GenesisLink.WebApi.ViewModels
{
    public class UserViewModel
    {
        public string? Id { get; set; }
        public string? Emailid { get; set; }

        public string? FirstName { get; set; }

        public string? LastName { get; set; }

        public string? AddressLine1 { get; set; }

        public string? AddressLine2 { get; set; }


        public string? City { get; set; }


        public string? State { get; set; }

        public string? Zip { get; set; }

        public string? ProfilePictureUrl { get; set; }

        public string? CreatedBy { get; set; } = "System";
        public DateTime? CreatedTS { get; set; } = DateTime.Now;

        public string? UpdatedBy { get; set; } = "System";
        public DateTime? UpdatedTS { get; set; } = DateTime.Now;
    }
}
