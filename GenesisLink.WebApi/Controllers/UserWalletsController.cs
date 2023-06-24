using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GenesisLink.BOL;
using GenesisLink.DAL;

namespace GenesisLink.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserWalletsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserWalletsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/UserWallets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserWallet>>> GetUserWallets(string userId)
        {
          if (_context.UserWallets == null)
          {
              return NotFound();
          }
            return await _context.UserWallets.Include(x => x.WalletNav).Where(x => x.UserId == userId).ToListAsync();
        }

        // GET: api/UserWallets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserWallet>> GetUserWallet(Guid id)
        {
          if (_context.UserWallets == null)
          {
              return NotFound();
          }
            var userWallet = await _context.UserWallets.FindAsync(id);

            if (userWallet == null)
            {
                return NotFound();
            }

            return userWallet;
        }

        // PUT: api/UserWallets/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUserWallet(Guid id, UserWallet userWallet)
        {
            if (id != userWallet.Id)
            {
                return BadRequest();
            }

            _context.Entry(userWallet).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserWalletExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/UserWallets
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<UserWallet>> PostUserWallet(UserWallet userWallet)
        {
          if (_context.UserWallets == null)
          {
              return Problem("Entity set 'AppDbContext.UserWallets'  is null.");
          }
            _context.UserWallets.Add(userWallet);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUserWallet", new { id = userWallet.Id }, userWallet);
        }

        // DELETE: api/UserWallets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserWallet(Guid id)
        {
            if (_context.UserWallets == null)
            {
                return NotFound();
            }
            var userWallet = await _context.UserWallets.FindAsync(id);
            if (userWallet == null)
            {
                return NotFound();
            }

            _context.UserWallets.Remove(userWallet);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserWalletExists(Guid id)
        {
            return (_context.UserWallets?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
