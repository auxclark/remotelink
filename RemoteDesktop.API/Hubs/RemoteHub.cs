using Microsoft.AspNetCore.SignalR;
using RemoteDesktop.Shared.Constants;
using RemoteDesktop.Shared.DTOs;

namespace RemoteDesktop.API.Hubs;

public class RemoteHub : Hub
{
    private static readonly Dictionary<string, SessionDto> Sessions = new();

    // Host calls this to create a session
    public async Task<string> CreateSession()
    {
        var code = GenerateSessionCode();
        var session = new SessionDto
        {
            SessionCode = code,
            HostConnectionId = Context.ConnectionId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        Sessions[code] = session;
        await Groups.AddToGroupAsync(Context.ConnectionId, code);
        return code;
    }

    // Viewer calls this to join a session
    public async Task<bool> JoinSession(string sessionCode)
    {
        if (!Sessions.TryGetValue(sessionCode, out var session) || !session.IsActive)
            return false;

        session.ViewerConnectionId = Context.ConnectionId;
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionCode);
        await Clients.Group(sessionCode).SendAsync(HubConstants.SessionJoined, Context.ConnectionId);
        return true;
    }

    // Host sends a screen frame to the viewer
    public async Task SendFrame(string sessionCode, byte[] frameData)
    {
        if (!Sessions.TryGetValue(sessionCode, out var session)) return;
        if (session.ViewerConnectionId == null) return;

        // Convert to base64 string for reliable browser delivery
        var base64Frame = Convert.ToBase64String(frameData);
        await Clients.Client(session.ViewerConnectionId)
            .SendAsync(HubConstants.ReceiveFrame, base64Frame);
    }

    // Viewer sends input (mouse/keyboard) to the host
    public async Task SendInput(string sessionCode, InputEvent input)
    {
        if (!Sessions.TryGetValue(sessionCode, out var session)) return;

        await Clients.Client(session.HostConnectionId)
            .SendAsync(HubConstants.ReceiveInput, input);
    }

    // End a session
    public async Task EndSession(string sessionCode)
    {
        if (Sessions.ContainsKey(sessionCode))
        {
            Sessions.Remove(sessionCode);
            await Clients.Group(sessionCode).SendAsync(HubConstants.SessionEnded);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var session = Sessions.Values
            .FirstOrDefault(s => s.HostConnectionId == Context.ConnectionId);

        if (session != null)
        {
            Sessions.Remove(session.SessionCode);
            await Clients.Group(session.SessionCode).SendAsync(HubConstants.SessionEnded);
        }

        await base.OnDisconnectedAsync(exception);
    }

    private static string GenerateSessionCode()
    {
        var random = new Random();
        string code;
        do { code = random.Next(100_000_000, 999_999_999).ToString(); }
        while (Sessions.ContainsKey(code));
        return code;
    }
}