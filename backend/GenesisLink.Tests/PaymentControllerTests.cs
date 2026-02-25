using System.Net;
using System.Net.Http.Json;
using GenesisLink.API.DTOs;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace GenesisLink.Tests;

public class PaymentControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public PaymentControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/payment");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Create_ValidChannel_ReturnsCreated()
    {
        var request = new CreateChannelRequest
        {
            SenderAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            RecipientAddress = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            Deposit = 50m,
            DurationSeconds = 86400
        };

        var response = await _client.PostAsJsonAsync("/api/payment", request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var channel = await response.Content.ReadFromJsonAsync<PaymentChannelResponse>();
        Assert.NotNull(channel);
        Assert.Equal("Open", channel.State);
    }

    [Fact]
    public async Task Create_InvalidSenderAddress_ReturnsBadRequest()
    {
        var request = new CreateChannelRequest
        {
            SenderAddress = "invalid",
            RecipientAddress = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            Deposit = 50m,
            DurationSeconds = 86400
        };

        var response = await _client.PostAsJsonAsync("/api/payment", request);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_InvalidRecipientAddress_ReturnsBadRequest()
    {
        var request = new CreateChannelRequest
        {
            SenderAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            RecipientAddress = "not-hex",
            Deposit = 50m,
            DurationSeconds = 86400
        };

        var response = await _client.PostAsJsonAsync("/api/payment", request);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_ZeroDuration_ReturnsBadRequest()
    {
        var request = new CreateChannelRequest
        {
            SenderAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            RecipientAddress = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            Deposit = 50m,
            DurationSeconds = 0
        };

        var response = await _client.PostAsJsonAsync("/api/payment", request);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Close_OpenChannel_ReturnsClosed()
    {
        var request = new CreateChannelRequest
        {
            SenderAddress = "0xcccccccccccccccccccccccccccccccccccccccc",
            RecipientAddress = "0xdddddddddddddddddddddddddddddddddddddddd",
            Deposit = 100m,
            DurationSeconds = 3600
        };
        var createResponse = await _client.PostAsJsonAsync("/api/payment", request);
        var responseBody = await createResponse.Content.ReadAsStringAsync();
        Assert.True(createResponse.StatusCode == HttpStatusCode.Created, $"Expected Created but got {createResponse.StatusCode}: {responseBody}");
        var channel = System.Text.Json.JsonSerializer.Deserialize<PaymentChannelResponse>(responseBody, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        Assert.NotNull(channel);
        Assert.False(string.IsNullOrEmpty(channel.Id), "Channel ID should not be empty");

        var closeResponse = await _client.PostAsync($"/api/payment/{channel.Id}/close", null);
        Assert.Equal(HttpStatusCode.OK, closeResponse.StatusCode);

        var closed = await closeResponse.Content.ReadFromJsonAsync<PaymentChannelResponse>();
        Assert.Equal("Closed", closed!.State);
    }

    [Fact]
    public async Task Close_AlreadyClosed_ReturnsBadRequest()
    {
        var request = new CreateChannelRequest
        {
            SenderAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            RecipientAddress = "0xffffffffffffffffffffffffffffffffffffffff",
            Deposit = 25m,
            DurationSeconds = 3600
        };
        var createResponse = await _client.PostAsJsonAsync("/api/payment", request);
        var channel = await createResponse.Content.ReadFromJsonAsync<PaymentChannelResponse>();

        await _client.PostAsync($"/api/payment/{channel!.Id}/close", null);
        var response = await _client.PostAsync($"/api/payment/{channel.Id}/close", null);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetById_NonExistent_ReturnsNotFound()
    {
        var response = await _client.GetAsync($"/api/payment/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetBySender_ReturnsFilteredChannels()
    {
        var sender = "0x1111111111111111111111111111111111111111";
        var request = new CreateChannelRequest
        {
            SenderAddress = sender,
            RecipientAddress = "0x2222222222222222222222222222222222222222",
            Deposit = 10m,
            DurationSeconds = 3600
        };
        await _client.PostAsJsonAsync("/api/payment", request);

        var response = await _client.GetAsync($"/api/payment/sender/{sender}");
        response.EnsureSuccessStatusCode();
        var channels = await response.Content.ReadFromJsonAsync<PaymentChannelResponse[]>();
        Assert.NotNull(channels);
        Assert.All(channels, c => Assert.Equal(sender, c.SenderAddress));
    }
}
