using GenesisLink.API.DTOs;
using GenesisLink.Core.Entities;
using GenesisLink.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GenesisLink.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentChannelRepository _channelRepo;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(IPaymentChannelRepository channelRepo, ILogger<PaymentController> logger)
    {
        _channelRepo = channelRepo;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaymentChannelResponse>>> GetAll()
    {
        var channels = await _channelRepo.GetAllAsync();
        return Ok(channels.Select(MapToResponse));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PaymentChannelResponse>> GetById(string id)
    {
        var channel = await _channelRepo.GetByIdAsync(id);
        if (channel is null) return NotFound();
        return Ok(MapToResponse(channel));
    }

    [HttpGet("sender/{address}")]
    public async Task<ActionResult<IEnumerable<PaymentChannelResponse>>> GetBySender(string address)
    {
        var channels = await _channelRepo.GetBySenderAsync(address);
        return Ok(channels.Select(MapToResponse));
    }

    [HttpPost]
    public async Task<ActionResult<PaymentChannelResponse>> Create([FromBody] CreateChannelRequest request)
    {
        var channel = new PaymentChannel
        {
            Id = Guid.NewGuid().ToString(),
            SenderAddress = request.SenderAddress,
            RecipientAddress = request.RecipientAddress,
            Deposit = request.Deposit,
            Expiry = DateTime.UtcNow.AddSeconds(request.DurationSeconds),
            State = ChannelState.Open
        };

        await _channelRepo.AddAsync(channel);
        _logger.LogInformation("Payment channel {ChannelId} created", channel.Id);

        return CreatedAtAction(nameof(GetById), new { id = channel.Id }, MapToResponse(channel));
    }

    [HttpPost("{id}/close")]
    public async Task<ActionResult<PaymentChannelResponse>> Close(string id)
    {
        var channel = await _channelRepo.GetByIdAsync(id);
        if (channel is null) return NotFound();
        if (channel.State != ChannelState.Open) return BadRequest("Channel is not open");

        channel.State = ChannelState.Closed;
        await _channelRepo.UpdateAsync(channel);

        _logger.LogInformation("Payment channel {ChannelId} closed", id);
        return Ok(MapToResponse(channel));
    }

    private static PaymentChannelResponse MapToResponse(PaymentChannel channel) => new()
    {
        Id = channel.Id,
        SenderAddress = channel.SenderAddress,
        RecipientAddress = channel.RecipientAddress,
        Deposit = channel.Deposit,
        Expiry = channel.Expiry,
        State = channel.State.ToString(),
        TransactionHash = channel.TransactionHash,
        CreatedAt = channel.CreatedAt
    };
}
