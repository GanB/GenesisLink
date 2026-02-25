using GenesisLink.Core.Entities;

namespace GenesisLink.Core.Interfaces;

public interface IPaymentChannelRepository
{
    Task<PaymentChannel?> GetByIdAsync(string id);
    Task<IEnumerable<PaymentChannel>> GetBySenderAsync(string senderAddress);
    Task<IEnumerable<PaymentChannel>> GetAllAsync();
    Task AddAsync(PaymentChannel channel);
    Task UpdateAsync(PaymentChannel channel);
}
