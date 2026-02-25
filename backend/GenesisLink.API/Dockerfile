FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY GenesisLink.Core/GenesisLink.Core.csproj GenesisLink.Core/
COPY GenesisLink.Infrastructure/GenesisLink.Infrastructure.csproj GenesisLink.Infrastructure/
COPY GenesisLink.API/GenesisLink.API.csproj GenesisLink.API/
RUN dotnet restore GenesisLink.API/GenesisLink.API.csproj

COPY . .
RUN dotnet publish GenesisLink.API/GenesisLink.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "GenesisLink.API.dll"]
