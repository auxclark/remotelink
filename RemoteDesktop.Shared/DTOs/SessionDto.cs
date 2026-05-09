namespace RemoteDesktop.Shared.DTOs;

public class SessionDto
{
    public string SessionCode { get; set; } = string.Empty;
    public string HostConnectionId { get; set; } = string.Empty;
    public string? ViewerConnectionId { get; set; }
    public bool IsActive { get; set; }
    public bool ControlGranted { get; set; } = false;
    public DateTime CreatedAt { get; set; }
}