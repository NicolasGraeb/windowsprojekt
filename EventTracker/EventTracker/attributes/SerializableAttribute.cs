namespace EventTracker.attributes;

/// <summary>
/// Atrybut do oznaczania klas do serializacji w logach.
/// Demonstruje: Atrybuty
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Property)]
public class LoggableAttribute : Attribute
{
    public bool IncludeInLog { get; set; } = true;
    public string? LogName { get; set; }
}
