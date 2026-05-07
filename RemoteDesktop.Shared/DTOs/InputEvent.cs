namespace RemoteDesktop.Shared.DTOs;

public class InputEvent
{
    public string Type { get; set; } = string.Empty; // "mousemove", "mousedown", "mouseup", "keydown", "keyup"
    public int X { get; set; }
    public int Y { get; set; }
    public string? Key { get; set; }
    public int Button { get; set; }
}