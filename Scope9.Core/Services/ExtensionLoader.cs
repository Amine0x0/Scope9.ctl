using Microsoft.Extensions.Logging;
using Scope9.Core.Models;

namespace Scope9.Core.Services;

public class ExtensionLoader
{
    private readonly string _extensionsPath;
    private readonly ILogger<ExtensionLoader> _logger;

    public ExtensionLoader(string extensionsPath, ILogger<ExtensionLoader> logger)
    {
        _extensionsPath = extensionsPath;
        _logger = logger;
    }

    public List<Extension> DiscoverExtensions()
    {
        var extensions = new List<Extension>();

        if (!Directory.Exists(_extensionsPath))
        {
            _logger.LogWarning("Extensions directory not found: {Path}", _extensionsPath);
            return extensions;
        }

        foreach (var dir in Directory.GetDirectories(_extensionsPath))
        {
            var ext = LoadExtension(dir);
            if (ext != null) extensions.Add(ext);
        }

        _logger.LogInformation("Discovered {Count} extensions", extensions.Count);
        return extensions;
    }

    private Extension? LoadExtension(string extensionDir)
    {
        try
        {
            var dirName = Path.GetFileName(extensionDir);
            var files = Directory.GetFiles(extensionDir).Select(Path.GetFileName).ToList();

            var extension = new Extension
            {
                Name = dirName,
                Path = dirName,
                Files = files!,
                HasEntry = files.Any(f => f == "_entry.lua")
            };

            foreach (var subDir in Directory.GetDirectories(extensionDir))
            {
                var child = LoadExtension(subDir);
                if (child != null)
                {
                    child.Path = $"{extension.Name}/{child.Name}";
                    extension.Children.Add(child);
                }
            }

            return extension;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading extension from {Dir}", extensionDir);
            return null;
        }
    }

    public Extension? GetExtension(string name)
    {
        return FindByName(DiscoverExtensions(), name);
    }

    private static Extension? FindByName(List<Extension> extensions, string name)
    {
        foreach (var ext in extensions)
        {
            if (ext.Name.Equals(name, StringComparison.OrdinalIgnoreCase))
                return ext;
            var found = FindByName(ext.Children, name);
            if (found != null) return found;
        }
        return null;
    }
}
