using System.Net;
using System.Net.Http.Json;
using GenesisLink.API.DTOs;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace GenesisLink.Tests;

public class LoanControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public LoanControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_ReturnsEmptyList()
    {
        var response = await _client.GetAsync("/api/loan");
        response.EnsureSuccessStatusCode();
        var loans = await response.Content.ReadFromJsonAsync<LoanResponse[]>();
        Assert.NotNull(loans);
    }

    [Fact]
    public async Task Create_ValidLoan_ReturnsCreated()
    {
        var request = new CreateLoanRequest
        {
            BorrowerAddress = "0x1234567890abcdef1234567890abcdef12345678",
            Principal = 100m,
            TermDays = 30,
            CollateralAmount = 150m
        };

        var response = await _client.PostAsJsonAsync("/api/loan", request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var loan = await response.Content.ReadFromJsonAsync<LoanResponse>();
        Assert.NotNull(loan);
        Assert.Equal("0x1234567890abcdef1234567890abcdef12345678", loan.BorrowerAddress);
        Assert.Equal(100m, loan.Principal);
        Assert.Equal("Pending", loan.State);
    }

    [Fact]
    public async Task Create_InvalidAddress_ReturnsBadRequest()
    {
        var request = new CreateLoanRequest
        {
            BorrowerAddress = "not-an-address",
            Principal = 100m,
            TermDays = 30,
            CollateralAmount = 150m
        };

        var response = await _client.PostAsJsonAsync("/api/loan", request);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_NegativePrincipal_ReturnsBadRequest()
    {
        var request = new CreateLoanRequest
        {
            BorrowerAddress = "0x1234567890abcdef1234567890abcdef12345678",
            Principal = -100m,
            TermDays = 30,
            CollateralAmount = 150m
        };

        var response = await _client.PostAsJsonAsync("/api/loan", request);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_ZeroTermDays_ReturnsBadRequest()
    {
        var request = new CreateLoanRequest
        {
            BorrowerAddress = "0x1234567890abcdef1234567890abcdef12345678",
            Principal = 100m,
            TermDays = 0,
            CollateralAmount = 150m
        };

        var response = await _client.PostAsJsonAsync("/api/loan", request);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_TermDaysExceeds365_ReturnsBadRequest()
    {
        var request = new CreateLoanRequest
        {
            BorrowerAddress = "0x1234567890abcdef1234567890abcdef12345678",
            Principal = 100m,
            TermDays = 400,
            CollateralAmount = 150m
        };

        var response = await _client.PostAsJsonAsync("/api/loan", request);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetById_NonExistent_ReturnsNotFound()
    {
        var response = await _client.GetAsync($"/api/loan/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Approve_PendingLoan_ReturnsActive()
    {
        // Create a loan
        var request = new CreateLoanRequest
        {
            BorrowerAddress = "0xabcdef1234567890abcdef1234567890abcdef12",
            Principal = 200m,
            TermDays = 60,
            CollateralAmount = 300m
        };
        var createResponse = await _client.PostAsJsonAsync("/api/loan", request);
        var loan = await createResponse.Content.ReadFromJsonAsync<LoanResponse>();

        // Approve it
        var approveResponse = await _client.PostAsync($"/api/loan/{loan!.Id}/approve", null);
        approveResponse.EnsureSuccessStatusCode();

        var approved = await approveResponse.Content.ReadFromJsonAsync<LoanResponse>();
        Assert.Equal("Active", approved!.State);
        Assert.NotNull(approved.ApprovedAt);
    }

    [Fact]
    public async Task Repay_ActiveLoan_ReturnsRepaid()
    {
        // Create and approve a loan
        var request = new CreateLoanRequest
        {
            BorrowerAddress = "0xdeadbeef1234567890abcdef1234567890abcdef",
            Principal = 50m,
            TermDays = 7,
            CollateralAmount = 75m
        };
        var createResponse = await _client.PostAsJsonAsync("/api/loan", request);
        var loan = await createResponse.Content.ReadFromJsonAsync<LoanResponse>();
        await _client.PostAsync($"/api/loan/{loan!.Id}/approve", null);

        // Repay
        var repayResponse = await _client.PostAsync($"/api/loan/{loan.Id}/repay", null);
        repayResponse.EnsureSuccessStatusCode();

        var repaid = await repayResponse.Content.ReadFromJsonAsync<LoanResponse>();
        Assert.Equal("Repaid", repaid!.State);
        Assert.NotNull(repaid.RepaidAt);
    }

    [Fact]
    public async Task Approve_AlreadyActive_ReturnsBadRequest()
    {
        var request = new CreateLoanRequest
        {
            BorrowerAddress = "0x1111111111111111111111111111111111111111",
            Principal = 100m,
            TermDays = 30,
            CollateralAmount = 150m
        };
        var createResponse = await _client.PostAsJsonAsync("/api/loan", request);
        var loan = await createResponse.Content.ReadFromJsonAsync<LoanResponse>();

        // Approve once
        await _client.PostAsync($"/api/loan/{loan!.Id}/approve", null);

        // Try to approve again
        var response = await _client.PostAsync($"/api/loan/{loan.Id}/approve", null);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetByBorrower_ReturnsFilteredLoans()
    {
        var address = "0x2222222222222222222222222222222222222222";
        var request = new CreateLoanRequest
        {
            BorrowerAddress = address,
            Principal = 100m,
            TermDays = 30,
            CollateralAmount = 150m
        };
        await _client.PostAsJsonAsync("/api/loan", request);

        var response = await _client.GetAsync($"/api/loan/borrower/{address}");
        response.EnsureSuccessStatusCode();
        var loans = await response.Content.ReadFromJsonAsync<LoanResponse[]>();
        Assert.NotNull(loans);
        Assert.All(loans, l => Assert.Equal(address, l.BorrowerAddress));
    }

    [Fact]
    public async Task SecurityHeaders_ArePresent()
    {
        var response = await _client.GetAsync("/api/loan");
        Assert.True(response.Headers.Contains("X-Content-Type-Options"));
        Assert.True(response.Headers.Contains("X-Frame-Options"));
        Assert.True(response.Headers.Contains("Referrer-Policy"));
    }
}
