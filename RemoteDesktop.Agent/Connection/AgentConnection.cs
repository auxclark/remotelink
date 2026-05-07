using Microsoft.AspNetCore.SignalR.Client;
using RemoteDesktop.Agent.Capture;
using RemoteDesktop.Shared.Constants;
using RemoteDesktop.Shared.DTOs;

namespace RemoteDesktop.Agent.Connection;

public class AgentConnection
{
    private HubConnection? _connection;
    private readonly ScreenCaptureService _captureService = new();
    private string? _sessionCode;
    private bool _isStreaming = false;

    private const string HubUrl = "https://remotelink-production.up.railway.app/hubs/remote";

    public async Task StartAsync()
    {
        _connection = new HubConnectionBuilder()
            .WithUrl(HubUrl, options =>
            {
                options.HttpMessageHandlerFactory = _ =>
                    new HttpClientHandler
                    {
                        ServerCertificateCustomValidationCallback =
                            HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                    };
            })
            .WithAutomaticReconnect()
            .Build();

        _connection.On<InputEvent>(HubConstants.ReceiveInput, HandleInput);
        _connection.On(HubConstants.SessionEnded, () =>
        {
            Console.WriteLine("Session ended.");
            _isStreaming = false;
        });
        _connection.On<string>(HubConstants.SessionJoined, (viewerId) =>
        {
            Console.WriteLine($"Viewer joined: {viewerId}");
            _isStreaming = true;
            _ = StartStreamingAsync();
        });

        await _connection.StartAsync();
        Console.WriteLine("Connected to hub!");

        _sessionCode = await _connection.InvokeAsync<string>("CreateSession");
        Console.WriteLine($"Your session code: {_sessionCode}");
        Console.WriteLine("Share this code with the viewer!");
    }

    private async Task StartStreamingAsync()
    {
        Console.WriteLine("Starting screen stream...");
        while (_isStreaming && _connection?.State == HubConnectionState.Connected)
        {
            try
            {
                var frame = _captureService.CaptureScreen(quality: 25);
                await _connection.InvokeAsync("SendFrame", _sessionCode, frame);
                await Task.Delay(33); // ~30 FPS
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Stream error: {ex.Message}");
                await Task.Delay(1000);
            }
        }
    }

    private void HandleInput(InputEvent input)
    {
        Console.WriteLine($"Input received: {input.Type} at ({input.X}, {input.Y})");
        // Input simulation will be added in Phase 3
    }
}