# NeoPlan — Nowoczesny Plan Lekcji

Aplikacja planu lekcji nowej generacji dla szkół korzystających z systemu **VULCAN Optivum** (skonfigurowana domyślnie dla **ZS2 Łańcut**).

Zbudowana przy użyciu:

- **Next.js 16 (App Router + Turbopack)**
- **React 19**
- **Tailwind CSS v4** + styl `base-nova` z shadcn/ui
- **@wulkanowy/timetable-parser**
- Natywny **Service Worker (PWA offline)**

---

## ✨ Funkcje aplikacji

- ⚡ **Błyskawiczne działanie**: Wszystkie plany są pre-renderowane statycznie (SSG) i odświeżane w tle (ISR co 1 godzinę).
- 🏫 **Konfiguracja szkoły w jednym pliku**: Cała szkoła skonfigurowana w `school.config.js`. Chcesz podłączyć inną szkołę? Zmień jeden adres URL.
- 📱 **Widok responsywny**:
  - **Desktop**: Pełna siatka tygodniowa (Poniedziałek – Piątek) z podświetlaniem aktualnej lekcji i dnia.
  - **Mobile**: Wygodne zakładki dni z kartami godzin (brak konieczności uciążliwego przewijania w poziomie).
- ⏱️ **Lekcja na żywo w czasie rzeczywistym**: Pasek informacyjny wskazuje aktualnie trwającą lekcję lub przerwę z dokładnym odliczaniem minut do dzwonka.
- 👥 **Filtrowanie grup**: Uczeń technikum może wybrać swoją grupę (np. `1/2`), a plan przygasi niepotrzebne lekcje.
- 🔗 **Interaktywne cross-referencje**: Kliknięcie inicjałów nauczyciela w planie klasy przenosi bezpośrednio do planu tego nauczyciela; kliknięcie sali przenosi do rozkładu sali.
- 🔍 **Wyszukiwarka Command (`Ctrl+K`)**: Szybkie wyszukiwanie klas, nauczycieli i sal odporne na polskie znaki diakrytyczne.
- ⭐ **Ulubione**: Zapisywanie ulubionych oddziałów, nauczycieli i sal gwiazdką (w `localStorage`).
- 🌙 **Tryb ciemny / jasny**: Płynne przełączanie motywów z zapamiętywaniem preferencji (`next-themes`).
- 🖨️ **Dedykowany wydruk**: Przycisk drukowania optymalizuje tabelę do czytelnego formatu A4 bez elementów nawigacji.
- 📲 **PWA (Offline)**: Możliwość instalacji aplikacji na telefonie lub komputerze oraz podgląd wcześniej odwiedzonych planów bez dostępu do Internetu.

---

## 🚀 Uruchomienie lokalne

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev

# Zbudowanie wersji produkcyjnej
npm run build

# Uruchomienie serwera produkcyjnego
npm start
```

Aplikacja będzie dostępna pod adresem: [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Konfiguracja szkoły

Wszystkie ustawienia znajdują się w pliku `school.config.js`:

```javascript
export const schoolConfig = {
  name: 'Zespół Szkół Nr 2 w Łańcucie',
  shortName: 'ZS2 Łańcut',
  timetableUrl: process.env.TIMETABLE_BASE_URL,
  encoding: 'utf-8', // lub 'windows-1250' dla starszych stron

  branding: {
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    logo: '/logo.svg',
  },
}
```

Aby ustawić plan lekcji wystarczy ustawić zmienną środowiskową:

```env
TIMETABLE_BASE_URL=https://twoja-szkola.pl/plan-lekcji
```
