using GenesisLink.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GenesisLink.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlockchainController : ControllerBase
{
    private readonly IBlockchainService _blockchainService;
    private readonly ILogger<BlockchainController> _logger;

    public BlockchainController(IBlockchainService blockchainService, ILogger<BlockchainController> logger)
    {
        _blockchainService = blockchainService;
        _logger = logger;
    }

    [HttpGet("balance/{address}")]
    public async Task<ActionResult> GetBalance(string address)
    {
        try
        {
            var balance = await _blockchainService.GetBalanceAsync(address);
            return Ok(new { address, balance });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get balance for {Address}", address);
            return StatusCode(503, new { error = "Blockchain service unavailable" });
        }
    }

    [HttpGet("token-balance/{address}")]
    public async Task<ActionResult> GetTokenBalance(string address)
    {
        try
        {
            var balance = await _blockchainService.GetTokenBalanceAsync(address);
            return Ok(new { address, balance });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get token balance for {Address}", address);
            return StatusCode(503, new { error = "Blockchain service unavailable" });
        }
    }

    [HttpGet("latest-block")]
    public async Task<ActionResult> GetLatestBlock()
    {
        try
        {
            var block = await _blockchainService.GetLatestBlockAsync();
            return Ok(new { blockNumber = block });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get latest block");
            return StatusCode(503, new { error = "Blockchain service unavailable" });
        }
    }

    [HttpGet("chain-id")]
    public async Task<ActionResult> GetChainId()
    {
        try
        {
            var chainId = await _blockchainService.GetNetworkChainIdAsync();
            return Ok(new { chainId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get chain ID");
            return StatusCode(503, new { error = "Blockchain service unavailable" });
        }
    }
}
