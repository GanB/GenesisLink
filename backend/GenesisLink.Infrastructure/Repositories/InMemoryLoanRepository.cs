using System.Collections.Concurrent;
using GenesisLink.Core.Entities;
using GenesisLink.Core.Interfaces;

namespace GenesisLink.Infrastructure.Repositories;

public class InMemoryLoanRepository : ILoanRepository
{
    private readonly ConcurrentDictionary<string, Loan> _loans = new();

    public Task<Loan?> GetByIdAsync(string id)
    {
        _loans.TryGetValue(id, out var loan);
        return Task.FromResult(loan);
    }

    public Task<IEnumerable<Loan>> GetByBorrowerAsync(string borrowerAddress)
    {
        var loans = _loans.Values
            .Where(l => l.BorrowerAddress.Equals(borrowerAddress, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(loans);
    }

    public Task<IEnumerable<Loan>> GetAllAsync()
    {
        return Task.FromResult(_loans.Values.AsEnumerable());
    }

    public Task AddAsync(Loan loan)
    {
        _loans[loan.Id] = loan;
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Loan loan)
    {
        _loans[loan.Id] = loan;
        return Task.CompletedTask;
    }
}
