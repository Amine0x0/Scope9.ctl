FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY Scope9.Core/ Scope9.Core/
COPY Scope9.Backend/ Scope9.Backend/
RUN dotnet build Scope9.Backend/Scope9.Backend.csproj -c Release -o /app/build

FROM build AS publish
RUN dotnet publish Scope9.Backend/Scope9.Backend.csproj -c Release -o /app/publish

FROM base AS final
WORKDIR /app/Scope9.Backend
COPY --from=publish /app/publish .
COPY extensions/ /app/extensions/
RUN mkdir -p /app/data /app/logs
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["dotnet", "Scope9.Backend.dll"]
