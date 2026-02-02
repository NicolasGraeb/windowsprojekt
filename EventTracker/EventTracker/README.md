# EventTracker - Instrukcja uruchomienia

## Wymagania
- .NET 10.0 SDK
- PostgreSQL (lub Docker z PostgreSQL)

## Kroki uruchomienia

### 1. Skonfiguruj bazę danych PostgreSQL

Upewnij się, że masz uruchomioną bazę PostgreSQL. Możesz użyć Docker:

```bash
docker run --name postgres-eventtracker -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=eventtracker -p 5432:5432 -d postgres
```

### 2. Zaktualizuj connection string

Edytuj plik `appsettings.json` i ustaw właściwe dane połączenia:

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Port=5432;Database=eventtracker;Username=postgres;Password=postgres"
  }
}
```

### 3. Zainstaluj narzędzia EF Core (jeśli jeszcze nie masz)

```bash
dotnet tool install --global dotnet-ef
```

### 4. Utwórz migracje bazy danych

W katalogu `EventTracker/EventTracker` wykonaj:

```bash
dotnet ef migrations add InitialCreate
```

### 5. Zastosuj migracje do bazy danych

```bash
dotnet ef database update
```

### 6. Uruchom aplikację

```bash
dotnet run
```

Lub w Visual Studio / Rider:
- Naciśnij F5 lub kliknij "Run"

### 7. Sprawdź działanie

Aplikacja będzie dostępna pod adresem:
- HTTP: `http://localhost:5164`
- HTTPS: `https://localhost:7013`

Dokumentacja OpenAPI (Swagger) będzie dostępna pod:
- `http://localhost:5164/openapi/v1.json` (w trybie Development)

## Endpointy API

### Wydarzenia
- `GET /api/Events` - Pobierz wszystkie wydarzenia
- `GET /api/Events/{id}` - Pobierz wydarzenie po ID
- `POST /api/Events` - Utwórz nowe wydarzenie
- `PUT /api/Events/{id}` - Zaktualizuj wydarzenie
- `DELETE /api/Events/{id}` - Usuń wydarzenie
- `POST /api/Events/{id}/archive` - Zarchiwizuj wydarzenie

### Rejestracje
- `POST /api/Registrations/register` - Zarejestruj uczestnika
- `GET /api/Registrations/{id}` - Pobierz rejestrację
- `GET /api/Registrations/event/{eventId}` - Pobierz rejestracje dla wydarzenia
- `POST /api/Registrations/{id}/checkin` - Zaloguj uczestnika
- `POST /api/Registrations/{id}/cancel` - Anuluj rejestrację
- `GET /api/Registrations/event/{eventId}/waiting` - Pobierz listę oczekujących

### Monitoring
- `GET /api/Monitoring/event/{eventId}` - Pobierz dane monitoringu
- `GET /api/Monitoring/event/{eventId}/sessions` - Pobierz aktywne sesje
- `GET /api/Monitoring/event/{eventId}/participants/count` - Pobierz liczbę uczestników

### Harmonogram
- `POST /api/Schedule` - Dodaj element harmonogramu
- `GET /api/Schedule/event/{eventId}` - Pobierz harmonogram wydarzenia
- `GET /api/Schedule/rooms/availability` - Pobierz dostępność sal

## Przykład użycia

### Utworzenie konferencji:
```json
POST /api/Events
{
  "name": "Konferencja IT 2024",
  "description": "Największa konferencja IT w Polsce",
  "startAt": "2024-06-01T09:00:00Z",
  "endAt": "2024-06-03T18:00:00Z",
  "location": "Warszawa, Centrum Kongresowe",
  "maxParticipants": 500,
  "eventType": "Conference",
  "trackCount": 5,
  "hasExhibition": true,
  "registrationFee": 299.99
}
```

### Rejestracja uczestnika:
```json
POST /api/Registrations/register
{
  "eventId": 1,
  "participantId": 1
}
```

## Logi

Logi są zapisywane w katalogu `logs/` w formacie JSON:
- `monitoring_{eventId}_{data}.json` - dane monitoringu
- `events_{eventId}_{data}.json` - zdarzenia (check-in, rejestracje)
