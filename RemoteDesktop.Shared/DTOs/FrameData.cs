namespace RemoteDesktop.Shared.DTOs;

public class FrameData
{
    public byte[] ImageBytes { get; set; } = Array.Empty<byte>();
    public int Width { get; set; }
    public int Height { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}