# EventTracker Frontend

Frontend aplikacji EventTracker zbudowany w Next.js i TypeScript.

## Konfiguracja

### 1. Zainstaluj zależności

```bash
npm install
```

### 2. Skonfiguruj URL API

Utwórz plik `.env.local` w katalogu `frontend/eventtracker/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5164/api
```

Lub ustaw zmienną środowiskową:

```bash
export NEXT_PUBLIC_API_URL=http://localhost:5164/api
```

### 3. Uruchom aplikację

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

## Uruchomienie pełnej aplikacji

### Backend (w osobnym terminalu)

```bash
cd EventTracker/EventTracker
dotnet run
```

Backend będzie dostępny pod adresem: `http://localhost:5164`

### Frontend (w osobnym terminalu)

```bash
cd frontend/eventtracker
npm run dev
```

Frontend będzie dostępny pod adresem: `http://localhost:3000`

## Funkcjonalności

- ✅ Lista wydarzeń z backendu
- ✅ Tworzenie i edycja wydarzeń
- ✅ Rejestracja uczestników
- ✅ Harmonogram wydarzeń
- ✅ Monitoring wydarzeń
- ✅ Archiwizacja wydarzeń

## Struktura projektu

- `app/config/api.ts` - Konfiguracja API i typy
- `app/services/apiService.ts` - Serwis komunikacji z API
- `app/hooks/useEventStore.ts` - Store zarządzający stanem aplikacji
- `app/utils/` - Adaptery do mapowania danych z API na modele frontendu
- `app/components/` - Komponenty React
- `app/models/` - Modele danych frontendu
