using RemoteDesktop.Agent.Connection;

Console.WriteLine("Remote Desktop Agent starting...");

var agentConnection = new AgentConnection();
await agentConnection.StartAsync();

Console.WriteLine("Press any key to exit...");
Console.ReadKey();