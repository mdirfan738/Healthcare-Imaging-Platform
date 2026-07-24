using System.Diagnostics;

namespace PACS.Api.Middleware;

// Logs every request (method, path, status, duration, caller identity) via Serilog structured logging.
// Complements the DB-backed AuditLog (which records PHI-relevant business actions specifically).
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        await _next(context);
        sw.Stop();

        _logger.LogInformation(
            "HTTP {Method} {Path} responded {StatusCode} in {Elapsed}ms (user={User}, ip={Ip})",
            context.Request.Method,
            context.Request.Path,
            context.Response.StatusCode,
            sw.ElapsedMilliseconds,
            context.User?.Identity?.Name ?? "anonymous",
            context.Connection.RemoteIpAddress);
    }
}
