namespace PACS.Application.DTOs;

public record LoginRequest(string Username, string Password);
public record LoginResponse(string AccessToken, string RefreshToken, DateTime ExpiresAtUtc, string Username, string FullName, string Role);
public record RefreshTokenRequest(string RefreshToken);
public record LogoutRequest(string RefreshToken);
