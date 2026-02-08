namespace Scope9.Core.Models;

public class Extension
{
    public string Name { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public List<Extension> Children { get; set; } = new();
    public bool HasEntry { get; set; }
    public List<string> Files { get; set; } = new();
}
