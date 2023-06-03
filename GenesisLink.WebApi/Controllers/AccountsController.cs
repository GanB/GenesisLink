using GenesisLink.BOL;
using GenesisLink.WebApi.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.Intrinsics.X86;

namespace GenesisLink.WebApi.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        UserManager<AppUser> userManager;
        SignInManager<AppUser> signInManager;
        public AccountsController(SignInManager<AppUser> _signInManager, UserManager<AppUser> _userManager)
        {
            signInManager = _signInManager;
            userManager = _userManager;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp(SignUpViewModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var user = new AppUser()
                    {
                        UserName = model.Email,
                        Email = model.Email
                    };

                    var userResult = await userManager.CreateAsync(user, model.Password);
                    if (userResult.Succeeded)
                    {
                        var roleResult = await userManager.AddToRoleAsync(user, "User");
                        if (roleResult.Succeeded)
                        {
                            return Ok(user);
                        }
                    }
                    else
                    {
                        return BadRequest(userResult.Errors);
                    }
                }
                return BadRequest(ModelState);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error! - {ex}");
            }
        }

        [HttpPost("signin")]
        public async Task<IActionResult> SignIn(SignInViewModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var signInResult = await signInManager.PasswordSignInAsync(model.EmailId, model.Password, false, false);

                    if (signInResult.Succeeded)
                    {
                        var user = await userManager.FindByNameAsync(model.EmailId);
                        var roles = await userManager.GetRolesAsync(user);
                        return Ok(new { id = user.Id, userName = user.UserName, role = roles[0] });
                    }
                    else
                    {
                        return BadRequest("Invalid UserName Or Password");
                    }
                }
                return BadRequest(ModelState);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error! - {ex}");
            }
        }

        [HttpPost("signout")]
        public async Task<IActionResult> LogOut()
        {
            await signInManager.SignOutAsync();
            return NoContent();
        }
    }
}
