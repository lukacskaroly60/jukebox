# Jukebox

Egyszerű webes MP3-lejátszó, amely egy megosztott Google Drive mappában lévő zenéket játssza le.

**Funkciók**
- számok listája kereséssel, kattintásra lejátszás
- ▶ lejátszás, ⏸ szünet, ⏹ leállítás, ↺ újrajátszás az elejéről, ⏮ / ⏭ előző / következő
- 🔀 **Véletlen sorrend**: egy gombnyomással véletlen sorrendben játssza le az összes számot
- 🔁 **Végtelen ismétlés**: a kiválasztott szám ismétlése, be- és kikapcsolható
- pozíció- és hangerő-csúszka, szóköz billentyű = lejátszás/szünet

Csak statikus fájlokból áll (`index.html`, `style.css`, `app.js`, `config.js`), szerver nem kell hozzá.

## Beállítás

### 1. A Drive mappa megosztása
A Google Drive-ban a mappán: **Megosztás → Általános hozzáférés → „Bárki, aki rendelkezik a linkkel” (Megtekintő)**.
A mappa azonosítója a link `/folders/` utáni része. Ez már be van írva a `config.js` fájlba.

### 2. Google API-kulcs létrehozása (ingyenes)
1. Nyisd meg: <https://console.cloud.google.com/> és hozz létre egy projektet.
2. **APIs & Services → Library**: keresd meg a **Google Drive API**-t, majd **Enable**.
3. **APIs & Services → Credentials → Create credentials → API key**.
4. Ajánlott korlátozni a kulcsot:
   - *API restrictions*: csak **Google Drive API**
   - *Application restrictions → Websites*: a weboldalad címe, pl. `https://FELHASZNALO.github.io/*`
5. Másold be a kulcsot a `config.js` fájl `API_KEY` mezőjébe.

> Az API-kulcs látható lesz a weboldal forráskódjában. Ez nyilvános, csak olvasható mappánál rendben van, de a fenti korlátozásokat érdemes beállítani.

### 3. Közzététel GitHub Pages-en
A repó oldalán: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, válaszd ki az ágat és a `/ (root)` mappát.
Néhány perc múlva az oldal elérhető lesz: `https://FELHASZNALO.github.io/jukebox/`.

## Kézi lejátszási lista (API-kulcs nélkül)
Ha az `API_KEY` üres, az oldal a `tracks.json` fájlból olvassa a számokat:

```json
[
  { "title": "Első dal", "id": "GOOGLE_DRIVE_FAJL_AZONOSITO" },
  { "title": "Második dal", "url": "zene/masodik.mp3" }
]
```

Az `id` egy Drive-fájl azonosítója (a fájl linkjében a `/d/` utáni rész). Az `url` bármilyen közvetlen MP3-link vagy a repóban lévő fájl útvonala lehet.

## Helyi kipróbálás
```bash
python3 -m http.server 8000
```
Ezután nyisd meg a böngészőben: <http://localhost:8000>.
