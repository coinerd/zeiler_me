# Migration Guide

## Voraussetzungen

- Node.js 18–22 und npm 8+
- Lokale Kopie dieses Repos (`zeiler_me`)
- Laufendes Strapi-Backend (`/cms`) mit Administrator-Zugang

## Einrichtung

1. **Dependencies installieren**

   ```bash
   npm install
   cd cms && npm install
   ```

2. **Umgebungsvariablen setzen**
   - `cms/.env` aus `.env.example` kopieren und alle `changeme`-Werte ersetzen.
   - `STRAPI_URL` (Basis-URL, standard: `http://localhost:1337`).
   - `STRAPI_TOKEN`: Admin Token (Settings → API Tokens → „Full Access“).

3. **Strapi starten**

   ```bash
   cd cms
   npm run develop
   ```

   Admin-Panel ist anschließend unter `${STRAPI_URL}/admin` verfügbar.

## Migration durchführen

Alle Skripte laufen im Repository-Root.

```bash
npm run migrate:collect     # 01 - Inhalte einsammeln & normalisieren
npm run migrate:upload      # 02 - Medien zu Strapi hochladen
npm run migrate:structure   # 03 - Section/Page-Struktur importieren
npm run migrate:redirects   # 04 - Redirects anlegen

# oder alles in einem Schritt
npm run migrate:all
```

### Details zu den Schritten

1. **collect** – liest Markdown/HTML aus `out/www.zeiler.me` bzw. `www.zeiler.me`, erzeugt `migration/content.json` & `migration/media-map.json`.
2. **upload** – lädt referenzierte Assets via Strapi Upload API hoch und ersetzt Links im Markdown.
3. **structure** – upsertet Sections, Pages, Autoren (idempotent via `externalId`).
4. **redirects** – legt Weiterleitungen (`Redirect`-Collection) für alte `.html`-Pfade an.

Alle JSON-Dateien werden vor jedem Lauf automatisch nach `migration/.backup/` gesichert.

## Qualitätssicherung

- `npm run lint:migration` – Grundvalidierung von `content.json` (IDs, Sections, etc.).
- `npm run lint:links` – prüft interne Links in den Markdown-Bodies.

Zusätzlich empfiehlt sich ein manueller Stichprobentest im Strapi Admin (Sections/Pages vergleichen) sowie ein visueller Check der hochgeladenen Medien.

## Redaktionshinweise

- **Sections** strukturieren das Portal (Titel, Intro, Sortierung).
- **Pages**
  - `title`, `slug`, `order` steuern die Navigation.
  - `body` nutzt das Markdown-Feld (`plugin::markdown-field.markdown`).
  - `parent` ermöglicht hierarchische Unterseiten.
  - `images` verknüpfen Strapi-Medien (Mehrfachauswahl).
- **Home** Single Type: Hero-Headline, Intro, Highlights (Komponente `Highlight`).
- **Settings** Single Type: Basis-Metadaten, Social Links, OG-Image.
- **Redirects**: Pflege für Alt-URLs → Neue Slugs (Standard `301`).

## Re-Import / Aktualisierung

Die Pipeline ist idempotent:

- Inhalte erneut einsammeln (`npm run migrate:collect`), optional Änderungen an `content.json` vornehmen.
- Medien werden nur hochgeladen, wenn in `migration/media-map.json` kein Strapi-Eintrag vorhanden ist.
- Sections/Pages/Redirects werden via `externalId` aktualisiert statt dupliziert.

## Troubleshooting

- Fehlender Token → `STRAPI_TOKEN` setzen oder erneuern.
- Upload-Fehler bei Remote-Assets → URL in `migration/media-map.json` prüfen.
- Konsistenz-Probleme → letzte Sicherung in `migration/.backup/` zurückspielen.

## Weiterführend

- GraphQL-Endpunkt für Abnehmer: `${STRAPI_URL}/graphql`
- REST-API Beispiel: `${STRAPI_URL}/api/pages?populate=images,section,parent`

Bitte aktualisiere `migration/REPORT.md` nach jedem Lauf mit neuen Erkenntnissen und offenen Punkten.
