using System.ComponentModel.DataAnnotations;

namespace GenesisLink.WebApi.ViewModels
{
    public class SignInViewModel
    {
        [Required]
        public string? EmailId { get; set; }

        [Required]
        public string? Password { get; set; }
    }
}
