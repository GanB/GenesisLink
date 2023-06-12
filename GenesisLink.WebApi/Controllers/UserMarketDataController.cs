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
    public class UserMarketDataController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserMarketDataController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/UserMarketData
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserMarketData>>> GetUserMarketData()
        {
          if (_context.UserMarketData == null)
          {
              return NotFound();
          }
            return await _context.UserMarketData.ToListAsync();
        }

        // GET: api/UserMarketData/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserMarketData>> GetUserMarketData(Guid id)
        {
          if (_context.UserMarketData == null)
          {
              return NotFound();
          }
            var userMarketData = await _context.UserMarketData.FindAsync(id);

            if (userMarketData == null)
            {
                return NotFound();
            }

            return userMarketData;
        }

        // PUT: api/UserMarketData/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUserMarketData(Guid id, UserMarketData userMarketData)
        {
            if (id != userMarketData.Id)
            {
                return BadRequest();
            }

            _context.Entry(userMarketData).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserMarketDataExists(id))
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

        // POST: api/UserMarketData
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<UserMarketData>> PostUserMarketData(UserMarketData userMarketData)
        {
          if (_context.UserMarketData == null)
          {
              return Problem("Entity set 'AppDbContext.UserMarketData'  is null.");
          }
            _context.UserMarketData.Add(userMarketData);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUserMarketData", new { id = userMarketData.Id }, userMarketData);
        }

        // DELETE: api/UserMarketData/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserMarketData(Guid id)
        {
            if (_context.UserMarketData == null)
            {
                return NotFound();
            }
            var userMarketData = await _context.UserMarketData.FindAsync(id);
            if (userMarketData == null)
            {
                return NotFound();
            }

            _context.UserMarketData.Remove(userMarketData);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserMarketDataExists(Guid id)
        {
            return (_context.UserMarketData?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
