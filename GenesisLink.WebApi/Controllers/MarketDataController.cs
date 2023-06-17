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
    public class MarketDataController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MarketDataController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/MarketDatas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MarketData>>> GetMarketData()
        {
          if (_context.MarketData == null)
          {
              return NotFound();
          }
            return await _context.MarketData.ToListAsync();
        }

        // GET: api/MarketDatas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MarketData>> GetMarketData(Guid id)
        {
          if (_context.MarketData == null)
          {
              return NotFound();
          }
            var marketData = await _context.MarketData.FindAsync(id);

            if (marketData == null)
            {
                return NotFound();
            }

            return marketData;
        }

        // PUT: api/MarketDatas/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMarketData(Guid id, MarketData marketData)
        {
            if (id != marketData.Id)
            {
                return BadRequest();
            }

            _context.Entry(marketData).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MarketDataExists(id))
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

        // POST: api/MarketDatas
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<MarketData>> PostMarketData(MarketData marketData)
        {
          if (_context.MarketData == null)
          {
              return Problem("Entity set 'AppDbContext.MarketData'  is null.");
          }
            _context.MarketData.Add(marketData);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMarketData", new { id = marketData.Id }, marketData);
        }

        // DELETE: api/MarketDatas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMarketData(Guid id)
        {
            if (_context.MarketData == null)
            {
                return NotFound();
            }
            var marketData = await _context.MarketData.FindAsync(id);
            if (marketData == null)
            {
                return NotFound();
            }

            _context.MarketData.Remove(marketData);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MarketDataExists(Guid id)
        {
            return (_context.MarketData?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
