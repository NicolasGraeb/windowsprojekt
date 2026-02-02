namespace EventTracker.models;

/// <summary>
/// Klasa reprezentująca konferencję.
/// Demonstruje: Dziedziczenie, Polimorfizm
/// </summary>
public class Conference : EventBase
{
    public int? TrackCount { get; set; } // Liczba ścieżek tematycznych
    public bool HasExhibition { get; set; } // Czy ma wystawę
    public decimal? RegistrationFee { get; set; }

    public override string GetEventType() => "Konferencja";

    public override decimal CalculatePrice()
    {
        return RegistrationFee ?? 0m;
    }

    public override string GetEventDetails()
    {
        return $"Konferencja: {Name}, Ścieżki: {TrackCount ?? 0}, Wystawa: {(HasExhibition ? "Tak" : "Nie")}";
    }
}
