# Jukebox

Egyszerű webes MP3-lejátszó. A zenék ennek a repónak a `zene/` mappájában vannak,
az oldal automatikusan listázza őket. API-kulcs nem kell.

**Funkciók**
- számok listája kereséssel, kattintásra lejátszás
- ▶ lejátszás, ⏸ szünet, ⏹ leállítás, ↺ újrajátszás az elejéről, ⏮ / ⏭ előző / következő
- 🔀 **Véletlen sorrend**: egy gombnyomással véletlen sorrendben játssza le az összes számot
- 🔁 **Végtelen ismétlés**: a kiválasztott szám ismétlése, be- és kikapcsolható
- pozíció- és hangerő-csúszka, szóköz billentyű = lejátszás/szünet

## Zenék hozzáadása
1. A GitHubon nyisd meg a `zene` mappát → **Add file → Upload files**.
2. Húzd be az MP3 fájlokat, majd **Commit changes** (a `main` ágra).
3. Pár perc múlva az új számok megjelennek a weboldalon.

A dal címe a fájlnévből lesz (kiterjesztés nélkül, az `_` szóközzé alakul), pl. `Kedvenc_dal.mp3` → „Kedvenc dal”.
Almappák is használhatók. Egy fájl legfeljebb 100 MB lehet.

## Közzététel (egyszeri beállítás)
A repó oldalán: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Ezután minden `main` ágra történő feltöltéskor a `.github/workflows/pages.yml` elkészíti a
zenelistát (`tracks.json`) és közzéteszi az oldalt itt: `https://FELHASZNALO.github.io/jukebox/`.

## Helyi kipróbálás
```bash
python3 scripts/build_tracks.py
python3 -m http.server 8000
```
Ezután nyisd meg a böngészőben: <http://localhost:8000>.
