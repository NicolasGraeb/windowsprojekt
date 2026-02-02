namespace EventTracker.models;

/// <summary>
/// Klasa reprezentująca seminarium.
/// Demonstruje: Dziedziczenie, Polimorfizm
/// </summary>
public class Seminar : EventBase
{
    public string? Topic { get; set; } // Temat seminarium
    public int? MaxAttendees { get; set; } // Maksymalna liczba uczestników
    public bool IsInteractive { get; set; } // Czy jest interaktywne

    public override string GetEventType() => "Seminarium";

    public override decimal CalculatePrice()
    {
        // Seminaria są zazwyczaj darmowe
        return 0m;
    }

    public override string GetEventDetails()
    {
        return $"Seminarium: {Name}, Temat: {Topic ?? "Brak"}, Interaktywne: {(IsInteractive ? "Tak" : "Nie")}";
    }
}
