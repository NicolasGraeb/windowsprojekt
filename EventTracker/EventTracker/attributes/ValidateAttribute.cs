namespace EventTracker.attributes;

/// <summary>
/// Atrybut do walidacji właściwości.
/// Demonstruje: Atrybuty
/// </summary>
[AttributeUsage(AttributeTargets.Property)]
public class ValidateAttribute : Attribute
{
    public int MinLength { get; set; }
    public int MaxLength { get; set; }
    public bool Required { get; set; }
    public string? Pattern { get; set; } // Regex pattern
}
