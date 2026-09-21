# NeoPlan — Nowoczesny Plan Lekcji

Aplikacja planu lekcji nowej generacji dla dowolnej szkoły korzystającej z systemu **VULCAN Optivum**.

Zbudowana przy użyciu:

- **Next.js 16 (App Router + Turbopack)**
- **React 19**
- **Tailwind CSS v4** + styl `base-nova` z shadcn/ui
- **@wulkanowy/timetable-parser**
- Natywny **Service Worker (PWA offline)**

---

## ✨ Funkcje aplikacji

- ⚡ **Błyskawiczne działanie**: Wszystkie plany są pre-renderowane statycznie (SSG) i odświeżane w tle (ISR co 1 godzinę).
- 🏫 **Dowolny plan VULCAN Optivum**: Podłącz dowolną szkołę podając link do planu w `.env`.
- 🔗 **Inteligentna normalizacja linków**: Możesz wkleić dowolny adres skopiowany z przeglądarki (np. z `index.html`, bezpośrednio z podglądu oddziału `plany/o1.html` czy katalogu bazowego) — aplikacja automatycznie odnajdzie właściwy katalog i plik `lista.html`.
- 🌐 **Automatyczne wykrywanie kodowania**: Obsługa `windows-1250`, `iso-8859-2` oraz `utf-8` z automatycznym wykrywaniem na podstawie nagłówków i zawartości HTML.
- 🛡️ **Odporność na certyfikaty SSL**: Automatyczny fallback w przypadku przestarzałych lub nieważnych certyfikatów TLS serwerów szkolnych.
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

## ⚙️ Podłączanie planu lekcji Twojej szkoły

Wystarczy w pliku `.env` podać adres URL do planu lekcji:

```env
# Możesz wkleić link do planu Optivum, np.:

TIMETABLE_BASE_URL=https://zs2lancut.pl/plan-lekcji

```

### Opcje zaawansowane (.env)

- `TIMETABLE_PROXY_URL=http://localhost:8080` — opcjonalne proxy (np. CORS Anywhere lub własny serwer pośredniczący), jeśli serwer szkoły blokuje zapytania.
- `TIMETABLE_INSECURE_TLS=true` — ignorowanie błędów certyfikatu SSL (przydatne, jeśli strona szkoły ma wygasły lub nieprawidłowo skonfigurowany certyfikat SSL).

### Konfiguracja szkoły (`school.config.js`)

W pliku `school.config.js` możesz dostosować nazwę szkoły, logo i kolory motywu:

```javascript
export const schoolConfig = {
  name: 'Zespół Szkół Nr 2 im. Jana Kochanowskiego w Łańcucie',
  shortName: 'ZS2 Łańcut',
  timetableUrl: process.env.TIMETABLE_BASE_URL,
  encoding: 'auto', // 'auto' (wykrywa automatycznie), 'utf-8', 'windows-1250', 'iso-8859-2'

  branding: {
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    logo: '/logo.svg',
  },

  meta: {
    title: 'NeoPlan ZS2 Łańcut',
    description: 'Błyskawiczny plan lekcji dla uczniów i nauczycieli',
  },
}
```
