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

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();
app.Run();
