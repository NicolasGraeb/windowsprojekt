namespace EventTracker.exceptions;

/// <summary>
/// Wyjątek rzucany gdy rejestracja jest nieprawidłowa.
/// </summary>
public class InvalidRegistrationException : Exception
{
    public InvalidRegistrationException(string message) : base(message) { }
    public InvalidRegistrationException(string message, Exception innerException) : base(message, innerException) { }
}
