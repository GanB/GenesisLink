using GenesisLink.BOL;
using GenesisLink.WebApi.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace GenesisLink.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        UserManager<AppUser> userManager;
        SignInManager<AppUser> signInManager;
        public UsersController(SignInManager<AppUser> _signInManager, UserManager<AppUser> _userManager)
        {
            signInManager = _signInManager;
            userManager = _userManager;
        }

        // GET: api/<UsersController>
        //[HttpGet]
        //public IEnumerable<string> Get()
        //{
        //    return new string[] { "value1", "value2" };
        //}

        // GET api/<UsersController>/5
        [HttpGet("{id}")]
        public async  Task<ActionResult<AppUser>> Get(string id)
        {
            return await userManager.FindByIdAsync(id);
        }

        // POST api/<UsersController>
        //[HttpPost]
        //public void Post([FromBody] string value)
        //{
        //}

        // PUT api/<UsersController>/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(string id, [FromBody] UserViewModel userViewModel)
        {
            try
            {
                if (id != userViewModel.Id)
                {
                    return BadRequest(ModelState);
                }

                var user = await userManager.FindByNameAsync(userViewModel.Emailid);

                if (user == null) { return NotFound(); }

                user.FirstName = userViewModel.FirstName;
                user.LastName = userViewModel.LastName; 
                user.AddressLine1   = userViewModel.AddressLine1;
                user.AddressLine2 = userViewModel.AddressLine2;
                user.City = userViewModel.City;
                user.State = userViewModel.State;
                user.Zip = userViewModel.Zip;
                user.UpdatedBy = userViewModel.UpdatedBy;

                var userResult = await userManager.UpdateAsync(user);

                if (userResult.Succeeded)
                {
                    return NoContent();
                }
                else
                {
                    return BadRequest(userResult.Errors);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error! - {ex}");
            }

        }

        // DELETE api/<UsersController>/5
        //[HttpDelete("{id}")]
        //public void Delete(int id)
        //{
        //}
    }
}
