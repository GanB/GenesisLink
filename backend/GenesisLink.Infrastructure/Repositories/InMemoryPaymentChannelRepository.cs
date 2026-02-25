using System.Collections.Concurrent;
using GenesisLink.Core.Entities;
using GenesisLink.Core.Interfaces;

namespace GenesisLink.Infrastructure.Repositories;

public class InMemoryPaymentChannelRepository : IPaymentChannelRepository
{
    private readonly ConcurrentDictionary<string, PaymentChannel> _channels = new();

    public Task<PaymentChannel?> GetByIdAsync(string id)
    {
        _channels.TryGetValue(id, out var channel);
        return Task.FromResult(channel);
    }

    public Task<IEnumerable<PaymentChannel>> GetBySenderAsync(string senderAddress)
    {
        var channels = _channels.Values
            .Where(c => c.SenderAddress.Equals(senderAddress, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(channels);
    }

    public Task<IEnumerable<PaymentChannel>> GetAllAsync()
    {
        return Task.FromResult(_channels.Values.AsEnumerable());
    }

    public Task AddAsync(PaymentChannel channel)
    {
        _channels[channel.Id] = channel;
        return Task.CompletedTask;
    }

    public Task UpdateAsync(PaymentChannel channel)
    {
        _channels[channel.Id] = channel;
        return Task.CompletedTask;
    }
}
