(function () {
  "use strict";

  const cfg = window.JUKEBOX_CONFIG || {};
  const $ = (id) => document.getElementById(id);

  const audio = $("audio");
  const statusEl = $("status");
  const nowTitle = $("nowTitle");
  const listEl = $("trackList");
  const seek = $("seek");
  const curTime = $("curTime");
  const durTime = $("durTime");
  const shuffleBtn = $("shuffleBtn");
  const loopBtn = $("loopBtn");

  let tracks = [];      // [{ title, url }]
  let order = [];       // lejátszási sorrend (indexek a tracks tömbbe)
  let pos = -1;         // aktuális pozíció az order tömbben
  let shuffle = false;
  let seeking = false;

  // ---------- Számok betöltése ----------

  function prettyName(name) {
    return name.replace(/\.(mp3|m4a|wav|ogg|flac|aac)$/i, "").replace(/_/g, " ");
  }

  async function loadFromDrive() {
    const files = [];
    let pageToken = "";
    do {
      const q = `'${cfg.FOLDER_ID}' in parents and trashed = false and (mimeType contains 'audio/' or name contains '.mp3')`;
      const params = new URLSearchParams({
        q,
        key: cfg.API_KEY,
        fields: "nextPageToken, files(id, name, mimeType)",
        pageSize: "1000",
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
      });
      if (pageToken) params.set("pageToken", pageToken);
      const res = await fetch("https://www.googleapis.com/drive/v3/files?" + params);
      if (!res.ok) {
        let msg = res.status + " " + res.statusText;
        try { msg = (await res.json()).error.message || msg; } catch (e) { /* ignore */ }
        throw new Error("Google Drive hiba: " + msg);
      }
      const data = await res.json();
      files.push(...(data.files || []));
      pageToken = data.nextPageToken || "";
    } while (pageToken);

    return files.map((f) => ({
      title: prettyName(f.name),
      url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(f.id)}?alt=media&key=${encodeURIComponent(cfg.API_KEY)}`,
    }));
  }

  async function loadFromJson() {
    const res = await fetch("tracks.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("A tracks.json nem tölthető be.");
    const data = await res.json();
    return data.map((t) => ({
      title: t.title || prettyName(t.name || t.url || t.id || "Ismeretlen"),
      url: t.url || `https://drive.google.com/uc?export=download&id=${encodeURIComponent(t.id)}`,
    }));
  }

  async function init() {
    try {
      tracks = cfg.API_KEY ? await loadFromDrive() : await loadFromJson();
    } catch (err) {
      setStatus(err.message, true);
      return;
    }
    tracks.sort((a, b) => a.title.localeCompare(b.title, "hu", { numeric: true }));
    if (!tracks.length) {
      setStatus(cfg.API_KEY
        ? "A megosztott mappában nem található zenefájl."
        : "Nincs beállítva API-kulcs (config.js), és a tracks.json is üres.", true);
      return;
    }
    setStatus(tracks.length + " szám");
    order = tracks.map((_, i) => i);
    renderList();
  }

  function setStatus(text, isError) {
    statusEl.textContent = text;
    statusEl.classList.toggle("error", !!isError);
  }

  // ---------- Lista ----------

  function renderList() {
    listEl.innerHTML = "";
    tracks.forEach((t, i) => {
      const li = document.createElement("li");
      li.dataset.index = i;
      const btn = document.createElement("button");
      btn.type = "button";
      const num = document.createElement("span");
      num.className = "num";
      num.textContent = i + 1 + ".";
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = t.title;
      btn.append(num, name);
      btn.addEventListener("click", () => selectTrack(i));
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  function highlight(index) {
    listEl.querySelectorAll("li").forEach((li) => {
      li.classList.toggle("active", Number(li.dataset.index) === index);
    });
  }

  $("filter").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    listEl.querySelectorAll("li").forEach((li) => {
      const t = tracks[Number(li.dataset.index)].title.toLowerCase();
      li.hidden = q && !t.includes(q);
    });
  });

  // ---------- Lejátszás ----------

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function currentIndex() {
    return pos >= 0 ? order[pos] : -1;
  }

  function playAt(newPos) {
    if (newPos < 0 || newPos >= order.length) return;
    pos = newPos;
    const t = tracks[order[pos]];
    audio.src = t.url;
    nowTitle.textContent = t.title;
    highlight(order[pos]);
    audio.play().catch(() => { /* pl. böngésző automatikus lejátszás tiltása */ });
  }

  // A listából kiválasztott szám
  function selectTrack(index) {
    if (shuffle) {
      // a kiválasztott szól először, utána a többi véletlen sorrendben
      order = [index, ...shuffled(tracks.map((_, i) => i).filter((i) => i !== index))];
      playAt(0);
    } else {
      playAt(order.indexOf(index));
    }
  }

  function next() {
    if (pos + 1 < order.length) playAt(pos + 1);
    else stop(); // a lista végén megáll
  }

  function prev() {
    if (audio.currentTime > 3 || pos <= 0) { audio.currentTime = 0; return; }
    playAt(pos - 1);
  }

  function play() {
    if (!tracks.length) return;
    if (pos < 0) { playAt(0); return; }
    audio.play().catch(() => {});
  }

  function pause() { audio.pause(); }

  function stop() {
    audio.pause();
    if (audio.src) audio.currentTime = 0;
  }

  function replay() {
    if (pos < 0) { play(); return; }
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  function setShuffle(on) {
    shuffle = on;
    shuffleBtn.setAttribute("aria-pressed", String(on));
    const cur = currentIndex();
    if (on) {
      if (cur >= 0 && !audio.paused) {
        // a most szóló szám folytatódik, utána véletlen sorrend
        order = [cur, ...shuffled(tracks.map((_, i) => i).filter((i) => i !== cur))];
        pos = 0;
      } else {
        // egy gombnyomással indul a véletlen sorrendű lejátszás
        order = shuffled(tracks.map((_, i) => i));
        playAt(0);
      }
    } else {
      order = tracks.map((_, i) => i);
      pos = cur >= 0 ? cur : -1;
    }
  }

  function setLoop(on) {
    audio.loop = on;
    loopBtn.setAttribute("aria-pressed", String(on));
    loopBtn.textContent = "🔁 Végtelen ismétlés: " + (on ? "BE" : "KI");
  }

  // ---------- Események ----------

  $("playBtn").addEventListener("click", play);
  $("pauseBtn").addEventListener("click", pause);
  $("stopBtn").addEventListener("click", stop);
  $("replayBtn").addEventListener("click", replay);
  $("nextBtn").addEventListener("click", next);
  $("prevBtn").addEventListener("click", prev);
  shuffleBtn.addEventListener("click", () => setShuffle(!shuffle));
  loopBtn.addEventListener("click", () => setLoop(!audio.loop));
  $("volume").addEventListener("input", (e) => { audio.volume = Number(e.target.value); });

  // Ha az ismétlés be van kapcsolva, az audio.loop miatt az "ended" nem fut le.
  audio.addEventListener("ended", next);

  audio.addEventListener("error", () => {
    if (!audio.src || pos < 0) return;
    setStatus("Nem sikerült lejátszani: " + tracks[order[pos]].title + " – következő szám…", true);
    setTimeout(() => { setStatus(tracks.length + " szám"); next(); }, 1500);
  });

  function fmt(s) {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + String(sec).padStart(2, "0");
  }

  audio.addEventListener("loadedmetadata", () => {
    seek.max = audio.duration || 0;
    durTime.textContent = fmt(audio.duration);
  });
  audio.addEventListener("timeupdate", () => {
    if (!seeking) seek.value = audio.currentTime;
    curTime.textContent = fmt(audio.currentTime);
  });
  seek.addEventListener("input", () => { seeking = true; curTime.textContent = fmt(Number(seek.value)); });
  seek.addEventListener("change", () => { audio.currentTime = Number(seek.value); seeking = false; });

  // Szóköz: lejátszás / szünet (ha nem a keresőmezőben gépelünk)
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON") {
      e.preventDefault();
      audio.paused ? play() : pause();
    }
  });

  init();
})();
