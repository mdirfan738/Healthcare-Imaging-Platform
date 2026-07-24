using Microsoft.EntityFrameworkCore;
using PACS.Application.DTOs;
using PACS.Application.Interfaces;
using PACS.Infrastructure.Data;

namespace PACS.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly IJwtService _jwt;
    private readonly IAuditLogService _audit;

    public AuthService(ApplicationDbContext db, IJwtService jwt, IAuditLogService audit)
    {
        _db = db; _jwt = jwt; _audit = audit;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress)
    {
        var user = await _db.Users.Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            await _audit.LogAsync(null, request.Username, "LOGIN_FAILED", "User", null, ipAddress, success: false);
            throw new UnauthorizedAccessException("Invalid username or password.");
        }

        var accessToken = _jwt.GenerateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();
        user.RefreshTokenHash = _jwt.HashRefreshToken(refreshToken);
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7);
        user.LastLoginUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync(user.Id, user.Username, "LOGIN_SUCCESS", "User", user.Id.ToString(), ipAddress);

        return new LoginResponse(accessToken, refreshToken, DateTime.UtcNow.AddMinutes(15),
            user.Username, user.FullName, user.Role?.Name ?? "Unknown");
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var hash = _jwt.HashRefreshToken(request.RefreshToken);
        var user = await _db.Users.Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.RefreshTokenHash == hash);

        if (user is null || user.RefreshTokenExpiresAtUtc < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        var newAccessToken = _jwt.GenerateAccessToken(user);
        var newRefreshToken = _jwt.GenerateRefreshToken();
        user.RefreshTokenHash = _jwt.HashRefreshToken(newRefreshToken);
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7);
        await _db.SaveChangesAsync();

        return new LoginResponse(newAccessToken, newRefreshToken, DateTime.UtcNow.AddMinutes(15),
            user.Username, user.FullName, user.Role?.Name ?? "Unknown");
    }

    public async Task LogoutAsync(RefreshTokenRequest request)
    {
        var hash = _jwt.HashRefreshToken(request.RefreshToken);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.RefreshTokenHash == hash);
        if (user is not null)
        {
            user.RefreshTokenHash = null;
            user.RefreshTokenExpiresAtUtc = null;
            await _db.SaveChangesAsync();
            await _audit.LogAsync(user.Id, user.Username, "LOGOUT", "User", user.Id.ToString(), "n/a");
        }
    }
}
