using FluentAssertions;
using Microsoft.Extensions.Configuration;
using PACS.Domain.Entities;
using PACS.Infrastructure.Security;
using Xunit;

namespace PACS.UnitTests.Services;

public class JwtServiceTests
{
    private static JwtService CreateService()
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Secret"] = "unit-test-super-secret-key-min-32-characters-long",
            ["Jwt:Issuer"] = "PACS.Api.Test",
            ["Jwt:Audience"] = "RIS.Frontend.Test",
            ["Jwt:AccessTokenMinutes"] = "15"
        }).Build();
        return new JwtService(config);
    }

    [Fact]
    public void GenerateAccessToken_ThenValidate_ShouldReturnSameUserId()
    {
        var svc = CreateService();
        var user = new User { Id = Guid.NewGuid(), Username = "drsmith", FullName = "Dr Smith", Role = new Role { Name = "Radiologist" } };

        var token = svc.GenerateAccessToken(user);
        var resolvedId = svc.ValidateAccessTokenAndGetUserId(token);

        resolvedId.Should().Be(user.Id);
    }

    [Fact]
    public void ValidateAccessTokenAndGetUserId_ShouldReturnNull_ForGarbageToken()
    {
        var svc = CreateService();
        svc.ValidateAccessTokenAndGetUserId("not-a-real-jwt").Should().BeNull();
    }

    [Fact]
    public void HashRefreshToken_ShouldBeDeterministic()
    {
        var svc = CreateService();
        var raw = svc.GenerateRefreshToken();
        svc.HashRefreshToken(raw).Should().Be(svc.HashRefreshToken(raw));
    }
}
