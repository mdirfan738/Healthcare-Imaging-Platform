using PACS.Domain.Entities;

namespace PACS.Application.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    string HashRefreshToken(string refreshToken);
    Guid? ValidateAccessTokenAndGetUserId(string token);
}
