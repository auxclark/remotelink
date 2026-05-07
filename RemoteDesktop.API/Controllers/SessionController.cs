using Microsoft.AspNetCore.Mvc;

namespace RemoteDesktop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "API is running", time = DateTime.UtcNow });
}