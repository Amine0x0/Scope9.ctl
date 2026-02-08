using Microsoft.AspNetCore.Mvc;
using Scope9.Core.Services;

[ApiController]
[Route("api/extensions")]
public class ExtensionsController : ControllerBase
{
    private readonly ExtensionLoader _loader;

    public ExtensionsController(ILoggerFactory loggerFactory)
    {
        var path = Path.Combine(Directory.GetCurrentDirectory(), "..", "extensions");
        _loader = new ExtensionLoader(path, loggerFactory.CreateLogger<ExtensionLoader>());
    }

    [HttpGet]
    public IActionResult GetExtensions()
    {
        var extensions = _loader.DiscoverExtensions();
        return Ok(new { extensions });
    }

    [HttpGet("{name}")]
    public IActionResult GetExtension(string name)
    {
        var extension = _loader.GetExtension(name);
        return extension != null ? Ok(extension) : NotFound(new { error = "Extension not found" });
    }
}
