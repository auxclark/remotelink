using Microsoft.AspNetCore.SignalR;
using RemoteDesktop.Shared.Constants;
using RemoteDesktop.Shared.DTOs;

namespace RemoteDesktop.API.Hubs;

public class RemoteHub : Hub
{
    private static readonly Dictionary<string, SessionDto> Sessions = new();

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

    public async Task<bool> JoinSession(string sessionCode)
    {
        if (!Sessions.TryGetValue(sessionCode, out var session) || !session.IsActive)
            return false;

        session.ViewerConnectionId = Context.ConnectionId;
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionCode);
        await Clients.Group(sessionCode)
            .SendAsync(HubConstants.SessionJoined, Context.ConnectionId);
        return true;
    }

    public async Task SendFrame(string sessionCode, string base64Frame)
    {
        if (!Sessions.TryGetValue(sessionCode, out var session)) return;
        if (session.ViewerConnectionId == null) return;

        await Clients.Client(session.ViewerConnectionId)
            .SendAsync(HubConstants.ReceiveFrame, base64Frame);
    }

    public async Task SendInput(string sessionCode, InputEvent input)
    {
        if (!Sessions.TryGetValue(sessionCode, out var session)) return;
        if (!session.ControlGranted) return;

        await Clients.Client(session.HostConnectionId)
            .SendAsync(HubConstants.ReceiveInput, input);
    }

    // Viewer requests control from host
    public async Task RequestControl(string sessionCode)
    {
        if (!Sessions.TryGetValue(sessionCode, out var session)) return;

        await Clients.Client(session.HostConnectionId)
            .SendAsync(HubConstants.PermissionRequested);
    }

    // Host accepts or denies control request
    public async Task RespondToControl(string sessionCode, bool granted)
    {
        if (!Sessions.TryGetValue(sessionCode, out var session)) return;
        if (session.ViewerConnectionId == null) return;

        session.ControlGranted = granted;

        if (granted)
            await Clients.Client(session.ViewerConnectionId)
                .SendAsync(HubConstants.PermissionGranted);
        else
            await Clients.Client(session.ViewerConnectionId)
                .SendAsync(HubConstants.PermissionDenied);
    }

    // Either side can revoke control
    public async Task RevokeControl(string sessionCode)
    {
        if (!Sessions.TryGetValue(sessionCode, out var session)) return;

        session.ControlGranted = false;
        await Clients.Group(sessionCode)
            .SendAsync(HubConstants.ControlRevoked);
    }

    public async Task EndSession(string sessionCode)
    {
        if (Sessions.ContainsKey(sessionCode))
        {
            Sessions.Remove(sessionCode);
            await Clients.Group(sessionCode)
                .SendAsync(HubConstants.SessionEnded);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var session = Sessions.Values
            .FirstOrDefault(s => s.HostConnectionId == Context.ConnectionId);

        if (session != null)
        {
            Sessions.Remove(session.SessionCode);
            await Clients.Group(session.SessionCode)
                .SendAsync(HubConstants.SessionEnded);
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