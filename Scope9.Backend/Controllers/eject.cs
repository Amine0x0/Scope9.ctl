using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Text;

[ApiController]
[Route("api/eject")]
public class EjectController : ControllerBase
{
    private readonly ILogger<EjectController> _logger;
    private readonly string _scriptsPath;
    private readonly bool _dockerAvailable;

    private static readonly HashSet<string> AllowedScripts = new(StringComparer.OrdinalIgnoreCase)
    {
        "build.sh", "clean.sh", "start.sh", "stop.sh",
        "rebuild-backend.sh", "restart-all.sh", "restart-backend.sh",
        "health-check.sh", "logs-all.sh", "logs-backend.sh"
    };

    public EjectController(ILogger<EjectController> logger)
    {
        _logger = logger;
        _scriptsPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "scripts");
        _dockerAvailable = System.IO.File.Exists("/usr/bin/docker") || System.IO.File.Exists("/usr/local/bin/docker");
    }

    private bool ScriptRequiresDocker(string filePath)
    {
        var content = System.IO.File.ReadAllText(filePath);
        return content.Contains("docker ", StringComparison.OrdinalIgnoreCase);
    }

    [HttpGet("available")]
    public IActionResult GetAvailableScripts()
    {
        if (!Directory.Exists(_scriptsPath))
            return Ok(new { scripts = Array.Empty<string>() });

        var scripts = Directory.GetFiles(_scriptsPath, "*.sh")
            .Where(f => AllowedScripts.Contains(Path.GetFileName(f)!))
            .Where(f => _dockerAvailable || !ScriptRequiresDocker(f))
            .Select(Path.GetFileName)
            .ToList();

        return Ok(new { scripts });
    }

    [HttpPost("{scriptName}")]
    public async Task<IActionResult> ExecuteScript(string scriptName)
    {
        if (!AllowedScripts.Contains(scriptName))
            return BadRequest(new { error = "Script not allowed" });

        var scriptPath = Path.Combine(_scriptsPath, scriptName);
        if (!System.IO.File.Exists(scriptPath))
            return NotFound(new { error = "Script not found" });

        if (!_dockerAvailable && ScriptRequiresDocker(scriptPath))
            return BadRequest(new { error = "This script requires docker which is not available in this environment" });

        _logger.LogInformation("Executing script: {Script}", scriptName);

        var psi = new ProcessStartInfo
        {
            FileName = "/bin/bash",
            Arguments = scriptPath,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
            WorkingDirectory = Path.Combine(Directory.GetCurrentDirectory(), "..")
        };

        using var process = Process.Start(psi);
        if (process == null)
            return StatusCode(500, new { error = "Failed to start process" });

        var stdout = process.StandardOutput.ReadToEndAsync();
        var stderr = process.StandardError.ReadToEndAsync();
        await Task.WhenAll(stdout, stderr);
        process.WaitForExit(30000);

        return Ok(new
        {
            script = scriptName,
            exitCode = process.ExitCode,
            output = (await stdout),
            errors = (await stderr) is { Length: > 0 } err ? err : null
        });
    }
}
