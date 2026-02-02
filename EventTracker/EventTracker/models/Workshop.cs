namespace EventTracker.models;

/// <summary>
/// Klasa reprezentująca warsztat.
/// Demonstruje: Dziedziczenie, Polimorfizm
/// </summary>
public class Workshop : EventBase
{
    public string? MaterialsRequired { get; set; } // Wymagane materiały
    public decimal WorkshopFee { get; set; } // Opłata za warsztat
    public int? SkillLevel { get; set; } // Poziom zaawansowania (1-5)

    public override string GetEventType() => "Warsztat";

    public override decimal CalculatePrice()
    {
        return WorkshopFee;
    }

    public override string GetEventDetails()
    {
        return $"Warsztat: {Name}, Opłata: {WorkshopFee:C}, Poziom: {SkillLevel ?? 0}/5, Materiały: {MaterialsRequired ?? "Brak"}";
    }
}
