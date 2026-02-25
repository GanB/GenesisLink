using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using GenesisLink.Core.Interfaces;
using GenesisLink.Infrastructure.Repositories;
using GenesisLink.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<ILoanRepository, InMemoryLoanRepository>();
builder.Services.AddSingleton<IPaymentChannelRepository, InMemoryPaymentChannelRepository>();
builder.Services.AddSingleton<IBlockchainService>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var rpcUrl = config["Ethereum:RpcUrl"] ?? "http://localhost:8545";
    var tokenAddress = config["Ethereum:TokenAddress"] ?? "";
    return new BlockchainService(rpcUrl, tokenAddress);
});

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["X-XSS-Protection"] = "0";
    context.Response.Headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";
    context.Response.Headers.Remove("Server");
    await next();
});

app.UseCors();
app.UseRateLimiter();
app.MapControllers().RequireRateLimiting("fixed");
app.Run();

public partial class Program { }
