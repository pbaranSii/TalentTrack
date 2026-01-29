## MVP – System Skautingu Piłkarskiego (PWA)

### 1. Cel projektu

Celem projektu jest stworzenie modułowej, mobilnej aplikacji webowej (PWA) do skautingu piłkarskiego, która:
- Umożliwia skautom szybkie i standaryzowane zbieranie danych o zawodnikach podczas meczów i turniejów.
- Buduje centralną bazę zawodników z historią obserwacji i prostym pipeline’em rekrutacyjnym.
- Wspiera decyzje selekcyjne 2× w roku poprzez shortlisty i podstawowe wskaźniki (KPI).
- Jest modułowa – pozwala w przyszłości łatwo dodawać nowe role, moduły (wideo, analityka, integracje).

Użytkownikiem końcowym MVP jest jeden typ użytkownika: **Skaut** (posiadający wszystkie potrzebne uprawnienia operacyjne).

### 2. Zakres funkcjonalny MVP

#### 2.1 Moduły

1. Autoryzacja i użytkownicy (rola Skaut).
2. Wydarzenia (mecze/turnieje).
3. Zawodnicy (baza talentów).
4. Obserwacje / Raporty meczowe.
5. Pipeline i shortlisty.
6. KPI framework (standaryzacja ocen per pozycja).
7. Zgody / RODO (podstawowy model, dane kontaktowe dopiero od Shortlist/Trial).
8. Dashboardy podstawowe.
9. Konfiguracja i modułowość (fundament pod rozwój).

#### 2.2 Typ aplikacji i technologie

- Aplikacja typu **PWA (Progressive Web App)**:
  - Działa w przeglądarce (desktop + mobile).
  - Może być zainstalowana jako ikona na ekranie telefonu.
  - Layout responsywny, mobile-first.
  - Offline – mile widziane (drafty obserwacji lokalnie i synchronizacja).

- Proponowany stack startowy:
  - Frontend: TypeScript + React + router + system komponentów UI.
  - Backend: Node.js + TypeScript (np. NestJS lub Express), REST API.
  - Baza: PostgreSQL.
  - Autoryzacja: JWT, rola Skaut w MVP.

### 3. Moduły – szczegółowy opis

#### 3.1 Autoryzacja i użytkownicy

- Logowanie (email + hasło).
- Reset hasła.
- Rola Skaut:
  - pełny CRUD na: wydarzeniach, zawodnikach, obserwacjach, statusach pipeline.
  - dostęp do dashboardów.

#### 3.2 Wydarzenia (Events)

- Tworzenie wydarzenia:
  - typ: Mecz / Turniej,
  - data, godzina, miejsce,
  - kategoria wiekowa (U8–U19),
  - drużyny (nasza / przeciwnik).
- Lista wydarzeń z filtrami.
- Szczegóły wydarzenia: dane + lista obserwacji.

#### 3.3 Zawodnicy (Players)

- Dodanie zawodnika (minimum przy pierwszej obserwacji):
  - imię (opcjonalnie nazwisko),
  - rocznik/data urodzenia,
  - klub/akademia,
  - pozycja główna,
  - dominująca noga (lub „nieznane”).
- Uzupełnianie profilu później (pełne dane).
- Profil zawodnika:
  - dane ogólne,
  - historia obserwacji,
  - status w pipeline (Observed → …).

#### 3.4 Obserwacje / Raporty meczowe

- Nowa obserwacja:
  - wybór wydarzenia,
  - wybór/dodanie zawodnika,
  - pozycja w meczu.
- Formularz pozycyjny:
  - oceny KPI (skala 1–5),
  - szybkie tagi (np. pressing, 1v1, podanie progresywne),
  - krótki komentarz,
  - rekomendacja: Monitorować / Shortlist / Trial / Odrzucić,
  - poziom pewności: Niska / Średnia / Wysoka.
- Draft offline (lokalny zapis, synchronizacja po powrocie online).

#### 3.5 Pipeline i shortlisty

- Statusy:
  - Observed, Shortlist, Trial, Offer, Signed, Rejected.
- Zmiana statusu z poziomu profilu zawodnika lub widoku pipeline.
- Priorytet (np. Wysoki / Średni / Niski).
- Widok shortlisty (np. przed selekcją 2× w roku).

#### 3.6 KPI framework (przykład)

- Skala 1–5 dla każdego KPI.
- Profile pozycyjne (przykłady):
  - Bramkarz: gra nogami, pozycjonowanie, gra na przedpolu, reakcja, komunikacja, szybkość.
  - Środkowy obrońca: pozycjonowanie, 1v1, gra głową, wyprowadzenie piłki, decyzje pod pressingiem, koncentracja.
  - Boczny obrońca/wahadłowy: intensywność, ustawienie, 1v1, dośrodkowania, timing wejść, pressing.
  - Środkowy pomocnik: wizja gry, gra pod presją, jakość podań, ruch bez piłki, intensywność w defensywie, decyzyjność.
  - Skrzydłowy: 1v1, wejścia w pole karne, dośrodkowania, pressing, ruch bez piłki, dynamika.
  - Napastnik: wykończenie, ustawienie w polu karnym, gra tyłem, pressing, współpraca z pomocnikami, inteligencja boiskowa.

#### 3.7 Zgody i RODO (MVP)

- Dane kontaktowe opiekuna:
  - zbierane dopiero przy statusie Shortlist/Trial,
  - imię i nazwisko opiekuna, telefon, e-mail.
- Zgody:
  - zgoda na przetwarzanie danych (data, sposób pozyskania),
  - zgoda na wizerunek (data, sposób pozyskania).

#### 3.8 Dashboardy podstawowe

- Liczba zawodników w poszczególnych statusach pipeline.
- Liczba obserwacji w ostatnim tygodniu/miesiącu.
- Najczęściej obserwowane roczniki/pozycje.
- Średni czas od pierwszej obserwacji do Shortlist.

### 4. Struktura modułowa

- Moduły backendowe:
  - auth, users, players, events, observations, pipeline, kpi, consents, analytics.
- Frontend:
  - widoki odpowiadające modułom,
  - wydzielenie komponentów współdzielonych (layout, UI).

### 5. Roadmapa

**Etap 1 (MVP):**
- PWA, jedna rola Skaut, dane tekstowe i liczby (bez wideo), drafty offline (minimum), wszystkie moduły opisane powyżej.

**Etap 2:**
- Nowe role (Koordynator, Head of Scouting, Trener, Analityk),
- Moduł wideo (nagrywanie/upload, powiązanie z obserwacją),
- Rozszerzona analityka i benchmarki,
- Workflow decyzyjny z udziałem wielu ról,
- Integracje (terminarze, eksporty).

