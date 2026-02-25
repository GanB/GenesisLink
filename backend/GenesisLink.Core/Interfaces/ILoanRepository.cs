using GenesisLink.Core.Entities;

namespace GenesisLink.Core.Interfaces;

public interface ILoanRepository
{
    Task<Loan?> GetByIdAsync(string id);
    Task<IEnumerable<Loan>> GetByBorrowerAsync(string borrowerAddress);
    Task<IEnumerable<Loan>> GetAllAsync();
    Task AddAsync(Loan loan);
    Task UpdateAsync(Loan loan);
}
