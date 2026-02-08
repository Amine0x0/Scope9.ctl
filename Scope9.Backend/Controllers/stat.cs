using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Reflection;
using System.Runtime.InteropServices;

[ApiController]
[Route("api/stat")]
public class StatController : ControllerBase
{
    [HttpGet]
    public IActionResult GetSelf()
    {
        var p = Process.GetCurrentProcess();
        var asm = Assembly.GetEntryAssembly();

        var data = new
        {
            process = new
            {
                id = p.Id,
                name = p.ProcessName,
                startTime = p.StartTime,
                sessionId = p.SessionId,
                threads = p.Threads.Count,
                handleCount = p.HandleCount,
                responding = p.Responding
            },

            cpu = new
            {
                totalMs = p.TotalProcessorTime.TotalMilliseconds,
                userMs = p.UserProcessorTime.TotalMilliseconds,
                kernelMs = p.PrivilegedProcessorTime.TotalMilliseconds,
                affinity = p.ProcessorAffinity.ToInt64(),
                priority = p.PriorityClass.ToString()
            },

            memory = new
            {
                workingSet = p.WorkingSet64,
                privateBytes = p.PrivateMemorySize64,
                virtualBytes = p.VirtualMemorySize64,
                peakWorkingSet = p.PeakWorkingSet64,
                pagedMemory = p.PagedMemorySize64
            },

            runtime = new
            {
                framework = RuntimeInformation.FrameworkDescription,
                os = RuntimeInformation.OSDescription,
                architecture = RuntimeInformation.ProcessArchitecture.ToString(),
                is64Bit = Environment.Is64BitProcess,
                processorCount = Environment.ProcessorCount
            },

            environment = new
            {
                processId = Environment.ProcessId,
                commandLine = Environment.CommandLine,
                currentDirectory = Environment.CurrentDirectory,
                machineName = Environment.MachineName,
                userName = Environment.UserName
            },

            assembly = asm == null ? null : new
            {
                name = asm.GetName().Name,
                version = asm.GetName().Version?.ToString(),
                location = asm.Location
            }
        };

        return Ok(data);
    }
}