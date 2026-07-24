# ============================================================================
# PACS.Api - multi-stage Docker build
# ============================================================================

# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files first for better layer caching
COPY src/PACS.Domain/PACS.Domain.csproj src/PACS.Domain/
COPY src/PACS.Application/PACS.Application.csproj src/PACS.Application/
COPY src/PACS.Infrastructure/PACS.Infrastructure.csproj src/PACS.Infrastructure/
COPY src/PACS.Api/PACS.Api.csproj src/PACS.Api/
RUN dotnet restore src/PACS.Api/PACS.Api.csproj

# Copy the rest and publish
COPY src/ src/
RUN dotnet publish src/PACS.Api/PACS.Api.csproj -c Release -o /app/publish --no-restore

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Create a non-root user for defense-in-depth
RUN groupadd -r pacs && useradd -r -g pacs pacsuser \
    && mkdir -p /dicom-storage /var/log/pacs \
    && chown -R pacsuser:pacs /app /dicom-storage /var/log/pacs

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_EnableDiagnostics=0
EXPOSE 8080

USER pacsuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "PACS.Api.dll"]
