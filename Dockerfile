FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/EsportsArena.API/EsportsArena.API.csproj", "src/EsportsArena.API/"]
COPY ["src/EsportsArena.Application/EsportsArena.Application.csproj", "src/EsportsArena.Application/"]
COPY ["src/EsportsArena.Infrastructure/EsportsArena.Infrastructure.csproj", "src/EsportsArena.Infrastructure/"]
COPY ["src/EsportsArena.Domain/EsportsArena.Domain.csproj", "src/EsportsArena.Domain/"]
RUN dotnet restore "src/EsportsArena.API/EsportsArena.API.csproj"
COPY . .
WORKDIR "/src/src/EsportsArena.API"
RUN dotnet publish "EsportsArena.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "EsportsArena.API.dll"]
