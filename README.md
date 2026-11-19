# Jukebox

Egyszerű webes MP3-lejátszó. A zenék a `zene/` mappában vannak, az oldal
automatikusan listázza őket. API-kulcs nem kell. Saját tárhelyre (FTP) és
GitHub Pages-re is feltehető.

**Funkciók**
- számok listája kereséssel, kattintásra lejátszás
- ▶ lejátszás, ⏸ szünet, ⏹ leállítás, ↺ újrajátszás az elejéről, ⏮ / ⏭ előző / következő
- 🔀 **Véletlen sorrend**: egy gombnyomással véletlen sorrendben játssza le az összes számot
- 🔁 **Végtelen ismétlés**: a kiválasztott szám ismétlése, be- és kikapcsolható
- pozíció- és hangerő-csúszka, szóköz billentyű = lejátszás/szünet

## Feltöltés saját tárhelyre FTP-vel (ajánlott)
Feltétel: a tárhely támogassa a PHP-t (a legtöbb webtárhely ilyen).

1. Töltsd le a repót: **Code → Download ZIP**, és csomagold ki.
2. Egy FTP-programmal (pl. [FileZilla](https://filezilla-project.org/)) csatlakozz a tárhelyhez
   a szolgáltatótól kapott adatokkal (szerver, felhasználónév, jelszó).
3. Töltsd fel a tárhely webes mappájába (gyakran `public_html`, `www` vagy `htdocs`),
   pl. egy `jukebox` almappába, ezeket:
   ```
   index.html
   style.css
   app.js
   tracks.php
   zene/        ← ide kerülnek az MP3 fájlok
   ```
4. Az oldal ezután elérhető, pl. `https://sajatdomain.hu/jukebox/`.

Új zenét egyszerűen úgy adhatsz hozzá, hogy FTP-vel bemásolod a `zene/` mappába.
A `tracks.php` minden betöltéskor élőben listázza a mappát, mást nem kell tenni.

**Ha a tárhely nem támogatja a PHP-t:** a saját gépeden, a `zene/` mappa mellett futtasd le a
`python3 scripts/build_tracks.py` parancsot, és a létrejövő `tracks.json` fájlt is töltsd fel.
Új zene feltöltése után ezt meg kell ismételni.

## Zenék hozzáadása (GitHub Pages esetén)
1. A GitHubon nyisd meg a `zene` mappát → **Add file → Upload files**.
2. Húzd be az MP3 fájlokat, majd **Commit changes** (a `main` ágra).
3. Pár perc múlva az új számok megjelennek a weboldalon.

A dal címe a fájlnévből lesz (kiterjesztés nélkül, az `_` szóközzé alakul), pl. `Kedvenc_dal.mp3` → „Kedvenc dal”.
Almappák is használhatók. Egy fájl legfeljebb 100 MB lehet.

## Közzététel GitHub Pages-en (egyszeri beállítás)
A repó oldalán: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Ezután minden `main` ágra történő feltöltéskor a `.github/workflows/pages.yml` elkészíti a
zenelistát (`tracks.json`) és közzéteszi az oldalt itt: `https://FELHASZNALO.github.io/jukebox/`.

## Helyi kipróbálás
```bash
python3 scripts/build_tracks.py
python3 -m http.server 8000
```
Ezután nyisd meg a böngészőben: <http://localhost:8000>.
