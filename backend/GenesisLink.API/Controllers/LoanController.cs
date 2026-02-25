using GenesisLink.API.DTOs;
using GenesisLink.Core.Entities;
using GenesisLink.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GenesisLink.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoanController : ControllerBase
{
    private readonly ILoanRepository _loanRepo;
    private readonly ILogger<LoanController> _logger;

    public LoanController(ILoanRepository loanRepo, ILogger<LoanController> logger)
    {
        _loanRepo = loanRepo;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LoanResponse>>> GetAll()
    {
        var loans = await _loanRepo.GetAllAsync();
        return Ok(loans.Select(MapToResponse));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LoanResponse>> GetById(string id)
    {
        var loan = await _loanRepo.GetByIdAsync(id);
        if (loan is null) return NotFound();
        return Ok(MapToResponse(loan));
    }

    [HttpGet("borrower/{address}")]
    public async Task<ActionResult<IEnumerable<LoanResponse>>> GetByBorrower(string address)
    {
        var loans = await _loanRepo.GetByBorrowerAsync(address);
        return Ok(loans.Select(MapToResponse));
    }

    [HttpPost]
    public async Task<ActionResult<LoanResponse>> Create([FromBody] CreateLoanRequest request)
    {
        var loan = new Loan
        {
            BorrowerAddress = request.BorrowerAddress,
            Principal = request.Principal,
            InterestRate = 5.0m, // 5% default
            TermDays = request.TermDays,
            CollateralAmount = request.CollateralAmount,
            State = LoanState.Pending
        };

        await _loanRepo.AddAsync(loan);
        _logger.LogInformation("Loan {LoanId} created for {Borrower}", loan.Id, loan.BorrowerAddress);

        return CreatedAtAction(nameof(GetById), new { id = loan.Id }, MapToResponse(loan));
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult<LoanResponse>> Approve(string id)
    {
        var loan = await _loanRepo.GetByIdAsync(id);
        if (loan is null) return NotFound();
        if (loan.State != LoanState.Pending) return BadRequest("Loan is not in pending state");

        loan.State = LoanState.Active;
        loan.ApprovedAt = DateTime.UtcNow;
        await _loanRepo.UpdateAsync(loan);

        _logger.LogInformation("Loan {LoanId} approved", id);
        return Ok(MapToResponse(loan));
    }

    [HttpPost("{id}/repay")]
    public async Task<ActionResult<LoanResponse>> Repay(string id)
    {
        var loan = await _loanRepo.GetByIdAsync(id);
        if (loan is null) return NotFound();
        if (loan.State != LoanState.Active) return BadRequest("Loan is not active");

        loan.State = LoanState.Repaid;
        loan.RepaidAt = DateTime.UtcNow;
        await _loanRepo.UpdateAsync(loan);

        _logger.LogInformation("Loan {LoanId} repaid", id);
        return Ok(MapToResponse(loan));
    }

    private static LoanResponse MapToResponse(Loan loan) => new()
    {
        Id = loan.Id,
        BorrowerAddress = loan.BorrowerAddress,
        Principal = loan.Principal,
        InterestRate = loan.InterestRate,
        TermDays = loan.TermDays,
        CollateralAmount = loan.CollateralAmount,
        State = loan.State.ToString(),
        TransactionHash = loan.TransactionHash,
        CreatedAt = loan.CreatedAt,
        ApprovedAt = loan.ApprovedAt,
        RepaidAt = loan.RepaidAt
    };
}
