// Abandon hope all ye who enter here.
//im ultrakilling it right now
document.addEventListener("DOMContentLoaded", function () {
  const store = localStorage.getItem("editcontent");
  const storesrc = localStorage.getItem("editcontentjs");
  const visualizerCanvas = document.getElementById("visualizer");
  const visualizerCtx = visualizerCanvas.getContext("2d");
  const tpref = localStorage.getItem("localpref");
  const f = document.getElementById("file-input");
  const ar = document.getElementById("artist-name");
  const t = document.getElementById("song-title");
  //hhehehe fart
  const a = document.getElementById("album-art");
  const ab = document.getElementById("album-art-container");
  const c = document.getElementById("controls");
  const b = document.getElementById("bottom-controls");
  const play = document.getElementById("play");
  const volUp = document.getElementById("volup");
  const volDown = document.getElementById("voldown");
  const l = document.getElementById("loop");
  const next = document.getElementById("next");
  const prev = document.getElementById("prev");
  const shuffle = document.getElementById("shuffle");
  const sidebar = document.getElementById("sidebar");
  const q = document.getElementById("queue");
  const log = document.getElementById("nav-logo");
  const navbar = document.getElementById("navbar");
  const s = document.getElementById("theme-css");
  const sb = document.getElementById("theme");
  const sb2 = document.querySelector(".settings-button");
  const sbd = document.querySelector(".settings-dropdown");
  const cssm = document.getElementById("css-modal");
  const jsm = document.getElementById("js-modal");
  const csse = document.getElementById("css-editor");
  const jse = document.getElementById("js-editor");
  const acssb = document.getElementById("apply-css");
  const rcssb = document.getElementById("reset-css");
  const ajsb = document.getElementById("apply-js");
  const rjsb = document.getElementById("reset-js");
  const css = document.createElement("style");
  const csr = document.createElement("script");
  const tp = document.querySelector(".time-popup");
  const cte = tp.querySelector(".current-time");
  const rte = tp.querySelector(".remaining-time");
  const pbm = document.getElementById("playback-modal");
  const pbsb = document.getElementById("playback-settings-btn");
  const pbs = document.getElementById("playback-speed");
  const rev = document.getElementById("reverse-audio");
  const mono = document.getElementById("mono-audio");
  const bb = document.getElementById("bass-boost");
  const vn = document.getElementById("volume-normalization");
  const rpb = document.getElementById("reset-playback");
  const mb = document.getElementById("mid-boost");
  const tb = document.getElementById("treble-boost");
  const trb = document.getElementById("traditional-bar-toggle");
  const trc = document.getElementById("traditional-controls");
  const trpc = document.getElementById("trad-progress-container");
  const trpb = document.getElementById("trad-progress-bar");
  const trpt = document.getElementById("trad-progress-thumb");
  const trvc = document.getElementById("trad-volume-container");
  const trvb = document.getElementById("trad-volume-bar");
  const trvt = document.getElementById("trad-volume-thumb");
  const stereoSlider = document.getElementById("stereo-separation");
  const stereoValueDisplay = document.getElementById("stereo-separation-value");
  const spriteSheet = new Image();
  spriteSheet.src = 'assets/Dance.png'; 

  const SPRITE_WIDTH = 256;
  const SPRITE_HEIGHT = 256;
  const SPRITE_COLUMNS = 8;

  let frameIndex = 0;
  let frameTimer = 0;
  let frameInterval = 6;
  let currentRow = 0; 
  

  var cssEditor = CodeMirror(document.getElementById("css-editor"), {
    value: localStorage.getItem("editcontent") || "",
    mode: "css",
    lineNumbers: true,
    theme: "default"
  });
  var jsEditor = CodeMirror(document.getElementById("js-editor"), {
    value: localStorage.getItem("editcontentjs") || "",
    mode: "javascript",
    lineNumbers: true,
    theme: "default"
  });

  const sfx = {
    pickup: new Audio("assets/sfx/pickup.wav"),
    drop: new Audio("assets/sfx/drop.wav"),
    holdLoop: new Audio("assets/sfx/hold_loop.wav"),
    unfreeze: new Audio("assets/sfx/unfreeze.mp3")
  };
  
  sfx.pickup.volume = 0.5;
  sfx.drop.volume = 0.5;
  sfx.unfreeze.volume = 0.5;
  sfx.holdLoop.volume = 0.3;
  sfx.holdLoop.loop = true;

  const audio = new Audio("");
  let audioContext;
  let analyser;
  let mediaElementSource;
  let isVisualizerVisible = false;
  let dataArray;
  let source;
  let gainNode;
  let bassBoostNode;
  let midBoostNode;
  let trebleBoostNode;
  let pitchShift = 0;
  let pitchBend = 0;
  let pitchNode;
  let tradDragging = false;
  let tradVolumeDragging = false;
  let tradVolume = 1;
  let visualizerMode = 0;
  let splitter;
  let analyserL;
  let analyserR;
  let dataArrayR;
  let dataArrayL;
  let bufferLength;
  let angle = 0;
  let hue = 0;  
  let fruityDanceStarted = false;
  let lastLeftPoints = [];
  let lastRightPoints = [];
  

  const visualizers = [
    drawBarVisualizer,
    drawWaveformVisualizer,
    drawSpectrogramVisualizer
  ];

  function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}


  function setTradProgress(percent) {
    trpb.style.width = `${percent * 100}%`;
    trpt.style.left = `${percent * 100}%`;
  }

  let popupTimeout;
  csr.id = "custom-js";
  css.id = "custom-css";
  if (tpref) {
    s.href = tpref;
  } else {
    s.href = "./dark.css";
  }
  document.head.appendChild(css);
  function stripHtmlTags(str) {
    if (!str) return "";
    return str.replace(/<[^>]*>/g, "");
  }

  csse.value = stripHtmlTags(store);
  document.getElementById("custom-css").textContent = stripHtmlTags(store);

  document.head.appendChild(csr);

  jse.value = stripHtmlTags(storesrc);
  document.getElementById("custom-js").textContent = stripHtmlTags(storesrc);

  function loadError(oError) {
    oError.target.remove();
  }
  document.getElementById("custom-js").onerror = loadError;
  const width = window.innerWidth;

  function loadPlaybackSettings() {
    const settings = JSON.parse(
      localStorage.getItem("playbackSettings") || "{}"
    );

    if (pbs) pbs.value = settings.speed || 1;
    if (rev) rev.checked = settings.reverse || false;
    if (mono) mono.checked = settings.mono || false;
    if (bb) bb.value = settings.bass || 0;
    if (mb) mb.value = settings.mid || 0;
    if (tb) tb.value = settings.treble || 0;
    if (vn) vn.value = settings.normalization || "none";

    updateSpeedDisplay();
    updateBassDisplay();
    applyAudioSettings();
  }

  function savePlaybackSettings() {
    const settings = {
      speed: parseFloat(pbs.value),
      mono: mono ? mono.checked : false,
      bass: bb ? parseInt(bb.value) : 0,
      mid: mb ? parseInt(mb.value) : 0,
      treble: tb ? parseInt(tb.value) : 0,
      normalization: vn.value,
      reverse: rev ? rev.checked : false
    };

    localStorage.setItem("playbackSettings", JSON.stringify(settings));
  }

  if (trb && trc) {
    const useTraditional = localStorage.getItem("useTraditionalBar") === "true";
    trb.checked = useTraditional;
    setControlBarMode(useTraditional);

    trb.addEventListener("change", () => {
      setControlBarMode(trb.checked);
      localStorage.setItem("useTraditionalBar", trb.checked);
    });
  }

  function setControlBarMode(useTraditional) {
    if (useTraditional) {
      if (c) c.style.display = "none";
      if (b) b.style.display = "none";
      if (trc) trc.style.display = "flex";
    } else {
      if (c) c.style.display = "";
      if (b) b.style.display = "";
      if (trc) trc.style.display = "none";
    }
  }

  if (trpc) {
    trpc.addEventListener("mousedown", (e) => {
      tradDragging = true;
      updateTradSlider(e);
    });
    window.addEventListener("mousemove", (e) => {
      if (tradDragging) updateTradSlider(e);
    });
    window.addEventListener("mouseup", () => {
      tradDragging = false;
    });
    trpc.addEventListener("click", updateTradSlider);
  }

  if (trvc) {
    trvc.addEventListener("mousedown", (e) => {
      tradVolumeDragging = true;
      updateTradVolumeSlider(e);
    });
    window.addEventListener("mousemove", (e) => {
      if (tradVolumeDragging) updateTradVolumeSlider(e);
    });
    window.addEventListener("mouseup", () => {
      tradVolumeDragging = false;
    });
    trvc.addEventListener("click", updateTradVolumeSlider);
  }

  function setTradVolume(percent) {
    tradVolume = percent;
    trvb.style.width = `${percent * 100}%`;
    trvt.style.left = `${percent * 100}%`;
    if (typeof audio !== "undefined") {
      audio.volume = percent;
    }
  }

  function updateTradSlider(e) {
    const rect = trpc.getBoundingClientRect();
    let x = e.touches ? e.touches[0].clientX : e.clientX;
    let percent = (x - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    setTradProgress(percent);
    
    if (typeof audio !== "undefined" && audio.duration) {
      audio.currentTime = percent * audio.duration;
    }
  }

  function updateTradVolumeSlider(e) {
    const rect = trvc.getBoundingClientRect();
    let x = e.touches ? e.touches[0].clientX : e.clientX;
    let percent = (x - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    setTradVolume(percent);
  }

  if (typeof audio !== "undefined") {
    audio.addEventListener("timeupdate", () => {
      if (!tradDragging && audio.duration) {
        setTradProgress(audio.currentTime / audio.duration);
      }
    });
  }

  if (trc) {
    const tp = document.getElementById("trad-play");
    const tv = document.getElementById("trad-prev");
    const tn = document.getElementById("trad-next");
    const tvu = document.getElementById("trad-volup");
    const tvd = document.getElementById("trad-voldown");
    const tct = document.getElementById("trad-current-time");
    const tdu = document.getElementById("trad-duration");
    const tfi = document.getElementById("trad-file-input");
    const tvo = document.getElementById("trad-volume");
    const tlo = document.getElementById("trad-loop");
    const tub = document.getElementById("trad-upload-btn");
    function updateQueuePadding() {
      if (trc.style.display === "flex" || trc.style.display === "") {
        q.style.paddingBottom = trc.offsetHeight + "px";
      } else {
        q.style.paddingBottom = "";
      }
    }
    updateQueuePadding();
    const trcObserver = new MutationObserver(updateQueuePadding);
    trcObserver.observe(trc, { attributes: true, attributeFilter: ["style"] });
    window.addEventListener("resize", updateQueuePadding);

    if (tp && play) tp.addEventListener("click", () => play.click());
    if (tv && prev) tv.addEventListener("click", () => prev.click());
    if (tn && next) tn.addEventListener("click", () => next.click());
    if (tvu && volUp) tvu.addEventListener("click", () => volUp.click());
    if (tvd && volDown) tvd.addEventListener("click", () => volDown.click());
    if (tlo && l) tlo.addEventListener("click", () => l.click());
    if (tub && f) tub.addEventListener("click", () => f.click());
    if (tfi && f) {
      tfi.addEventListener("change", () => {
        f.files = tfi.files;
        const event = new Event("change", { bubbles: true });
        f.dispatchEvent(event);
      });
    }
    if (tct && tdu && typeof audio !== "undefined") {
      function updateTradTimeDisplay() {
        tct.textContent = formatTime(audio.currentTime || 0);
        tdu.textContent = isNaN(audio.duration)
          ? "--:--"
          : formatTime(audio.duration);
      }
      audio.addEventListener("timeupdate", updateTradTimeDisplay);
      audio.addEventListener("loadedmetadata", updateTradTimeDisplay);
      tct.addEventListener("click", () => {
        if (!isNaN(audio.duration)) {
          const newTime = prompt(
            "Jump to time (seconds):",
            Math.floor(audio.currentTime)
          );
          if (newTime !== null && !isNaN(newTime)) {
            audio.currentTime = Math.min(
              Math.max(Number(newTime), 0),
              audio.duration
            );
          }
        }
      });
      updateTradTimeDisplay();
    }

    if (tp) {
      play.addEventListener("click", () => {
        const tpIcon = tp.querySelector("i");
        if (tpIcon) {
          if (isPlaying) {
            tpIcon.classList.remove("fa-play");
            tpIcon.classList.add("fa-pause");
          } else {
            tpIcon.classList.remove("fa-pause");
            tpIcon.classList.add("fa-play");
          }
        }
      });

      audio.addEventListener("play", () => {
        const tpIcon = tp.querySelector("i");
        if (tpIcon) {
          tpIcon.classList.remove("fa-play");
          tpIcon.classList.add("fa-pause");
        }
      });
      audio.addEventListener("pause", () => {
        const tpIcon = tp.querySelector("i");
        if (tpIcon) {
          tpIcon.classList.remove("fa-pause");
          tpIcon.classList.add("fa-play");
        }
      });
    }

    if (tvo && typeof audio !== "undefined") {
      tvo.addEventListener("input", () => {
        audio.volume = tvo.value;
      });
      audio.addEventListener("volumechange", () => {
        tvo.value = audio.volume;
      });
    }
  }

  function applyAudioSettings() {
    audio.playbackRate = pbs.value;
    updatePitch();
    if (rev && rev.checked) {
      audio.playbackRate = Math.abs(audio.playbackRate);
      audio.currentTime = audio.duration - audio.currentTime;
    } else {
      audio.playbackRate = Math.abs(audio.playbackRate);
    }
    if (mono && mono.checked) {
      audio.setAttribute("crossorigin", "anonymous");
      if (source) source.channelCount = 1;
    } else {
      if (source) source.channelCount = 2;
    }
    if (bassBoostNode && bassBoostNode.gain) {
      bassBoostNode.gain.value = bb.value;
    }
    if (vn && vn.value !== "none" && analyser && dataArray) {
      analyser.getByteTimeDomainData(dataArray);
      const normalizationType = vn.value;
      if (normalizationType === "peak") {
        const maxVolume = Math.max(...dataArray) / 255;
        gainNode.gain.value = maxVolume > 0 ? 1 / maxVolume : 1;
      } else if (normalizationType === "rms") {
        const rms = Math.sqrt(
          dataArray.reduce((sum, value) => {
            const norm = (value - 128) / 128;
            return sum + norm * norm;
          }, 0) / dataArray.length
        );
        gainNode.gain.value = rms > 0 ? 1 / rms : 1;
      }
    } else {
      gainNode.gain.value = 1;
    }
    if (midBoostNode && midBoostNode.gain) {
      midBoostNode.gain.value = mb.value;
    }
    if (trebleBoostNode && trebleBoostNode.gain) {
      trebleBoostNode.gain.value = tb.value;
    }
  }
  // dictionary

  function semitonesToPlaybackRate(semitones) {
    return Math.pow(2, semitones / 12);
  }

  function initAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioContext.createGain();

      bassBoostNode = audioContext.createBiquadFilter();
      bassBoostNode.type = "lowshelf";
      bassBoostNode.frequency.value = 150;

      midBoostNode = audioContext.createBiquadFilter();
      midBoostNode.type = "peaking";
      midBoostNode.frequency.value = 1000;
      midBoostNode.Q.value = 1;

      trebleBoostNode = audioContext.createBiquadFilter();
      trebleBoostNode.type = "highshelf";
      trebleBoostNode.frequency.value = 3000;

      pitchNode = audioContext.createBufferSource
        ? null
        : audioContext.createDelay();
      splitter = audioContext.createChannelSplitter(2);
      analyserL = audioContext.createAnalyser();
      analyserR = audioContext.createAnalyser();

      analyserL.fftSize = 2048;
      analyserR.fftSize = 2048;

      bufferLength = analyserL.frequencyBinCount;
      dataArrayL = new Uint8Array(bufferLength);
      dataArrayR = new Uint8Array(bufferLength);

      if (!mediaElementSource) {
        mediaElementSource = audioContext.createMediaElementSource(audio);
        mediaElementSource.connect(bassBoostNode);
        bassBoostNode.connect(midBoostNode);
        midBoostNode.connect(trebleBoostNode);
        trebleBoostNode.connect(gainNode);
        gainNode.connect(splitter);
        splitter.connect(analyserL, 0);
        splitter.connect(analyserR, 1);
        analyserL.connect(audioContext.destination);
        analyserR.connect(audioContext.destination);
      }
    }
  }

  // Initialize trebleBoostNode if not already initialized
  if (!audioContext) {
    initAudioContext();
  }

  if (!trebleBoostNode) {
    trebleBoostNode = audioContext.createBiquadFilter();
    trebleBoostNode.type = "highshelf";
    trebleBoostNode.frequency.value = 3000;
  }

  pbsb.addEventListener("click", () => {
    pbm.style.display = "block";
    initAudioContext();
  });

  sb2.addEventListener("click", () => {
    sbd.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!sb2.contains(e.target) && !sbd.contains(e.target)) {
      sbd.classList.remove("show");
    }
  });
  document.getElementById("clear-cache").addEventListener("click", () => {
    if (
      window.confirm(
        "Are you sure you want to clear the cache? This will remove all your settings and data."
      )
    ) {
      localStorage.clear();
      location.reload();
    }
  });

  document.getElementById("toggle-miniplayer").addEventListener("click", () => {
    window.open("./index.html", "Miniplayer", "width=800,height=900");
  });

  document.getElementById("custom-css-btn").addEventListener("click", () => {
    cssm.style.display = "block";
    cssEditor.setValue(document.getElementById("custom-css").textContent);
  });

  document.getElementById("custom-js-btn").addEventListener("click", () => {
    jsm.style.display = "block";
    jsEditor.setValue(document.getElementById("custom-js").textContent);
  });

  document.getElementById("close-css").addEventListener("click", () => {
    cssm.style.display = "none";
  });

  document.getElementById("close-js").addEventListener("click", () => {
    jsm.style.display = "none";
  });

  document.getElementById("close-pb").addEventListener("click", () => {
    pbm.style.display = "none";
  });

  acssb.addEventListener("click", () => {
    document.getElementById("custom-css").textContent = cssEditor.getValue();
    localStorage.setItem("editcontent", cssEditor.getValue());
  });

  rcssb.addEventListener("click", () => {
    document.getElementById("custom-css").textContent = "";
    cssEditor.setValue("");
    localStorage.setItem("editcontent", "");
  });

  ajsb.addEventListener("click", () => {
    if (
      window.confirm(
        "Are you sure you want to apply? This will reload the page and remove your uploaded songs. Don't apply scripts you don't understand."
      )
    ) {
      document.getElementById("custom-js").textContent = jsEditor.getValue();
      localStorage.setItem("editcontentjs", jsEditor.getValue());
      window.location.reload();
    }
  });

  rjsb.addEventListener("click", () => {
    document.getElementById("custom-js").textContent = "";
    jsEditor.setValue("");
    localStorage.setItem("editcontentjs", "");
  });
  function toggleTheme() {
    if (s.href.includes("light")) {
      s.href = "./dark.css";
      sb.innerHTML = '<i class="fas fa-moon"></i> Theme';
      localStorage.setItem("localpref", "./dark.css");
    } else {
      s.href = "light.css";
      localStorage.setItem("localpref", "./light.css");
      sb.innerHTML = '<i class="fas fa-sun"></i> Theme';
    }
  }

  sb.addEventListener("click", toggleTheme);

  function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  if (isMobile() || width < 800) {
    sidebar.style.width = "100%";
    q.style.width = "100%";
    q.style.paddingRight = "0";
    ab.style.height = "200px";
    b.style.height = "100px";
    c.style.margin = "unset";
    q.querySelectorAll("li").forEach((li) => (li.style.width = "100%"));
    log.style.display = "block";
    log.style.left = "unset";
    function debounce(func, wait) {
      let timeout;
      audio.playbackRate = -Math.abs(audio.playbackRate);
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }

    log.addEventListener(
      "click",
      debounce(function () {
        if (sidebar.style.display === "none" || sidebar.style.display === "") {
          sidebar.style.display = "flex";
        } else {
          sidebar.style.display = "none";
        }
      }, 100)
    );
  }

  const progressRing = document.querySelector(".progress-ring-circle");
  const radius = progressRing.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
  progressRing.style.strokeDashoffset = circumference;
  let playlist = [];
  let playlists = {
    "Main Queue": playlist
  };
  let playlistMeta = {
    "Main Queue": {
      name: "Main Queue",
      image: "./noart.png"
    }
  };
  let currentPlaylistName = "Main Queue";

  function switchToPlaylist(name) {
    playlist = playlists[name];
    currentPlaylistName = name;
    currentTrackIndex = 0;
    updateq();
    if (playlist.length > 0) {
      initializePlayer(playlist[currentTrackIndex]);
    }
  }
  let currentTrackIndex = 0;
  // let originalPlaylistOrder = [];
  let shuffledOrder = [];
  let isPlaying = false;
  let isDragging = false;
  let isLooping = false;
  let isShuffled = false;

  const pitchShiftSlider = document.getElementById("pitch-shift");
  const pitchShiftValue = document.getElementById("pitch-shift-value");
  const pitchBendSlider = document.getElementById("pitch-bend");
  const pitchBendStatus = document.getElementById("pitch-bend-status");

  if (pitchShiftSlider) {
    pitchShiftSlider.addEventListener("input", () => {
      pitchShift = parseInt(pitchShiftSlider.value, 10) || 0;
      pitchShiftValue.textContent = pitchShift;
      updatePitch();
    });
  }

  if (pitchBendSlider) {
    pitchBendSlider.addEventListener("input", () => {
      pitchBend = parseInt(pitchBendSlider.value, 10) || 0;
      pitchBendStatus.textContent =
        pitchBend !== 0 ? `Bending: ${pitchBend}` : "";
      updatePitch();
    });

    pitchBendSlider.addEventListener("change", () => {
      setTimeout(() => {
        pitchBend = 0;
        pitchBendSlider.value = 0;
        pitchBendStatus.textContent = "";
        updatePitch();
      }, 100);
    });
  }

  function updatePitch() {
    const totalSemitones = pitchShift + pitchBend;
    audio.playbackRate =
      semitonesToPlaybackRate(totalSemitones) * (parseFloat(pbs.value) || 1);
  }

  function playNext() {
    if (playlist.length === 0) return;

    if (isShuffled) {
      currentTrackIndex = (currentTrackIndex + 1) % shuffledOrder.length;
      initializePlayer(playlist[shuffledOrder[currentTrackIndex]]);
    } else {
      currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
      initializePlayer(playlist[currentTrackIndex]);
    }
    applyAudioSettings();
  }

  function playPrevious() {
    if (playlist.length === 0) return;

    if (isShuffled) {
      currentTrackIndex =
        (currentTrackIndex - 1 + shuffledOrder.length) % shuffledOrder.length;
      initializePlayer(playlist[shuffledOrder[currentTrackIndex]]);
    } else {
      currentTrackIndex =
        (currentTrackIndex - 1 + playlist.length) % playlist.length;
      initializePlayer(playlist[currentTrackIndex]);
    }
  }
  next.addEventListener("click", playNext);
  prev.addEventListener("click", playPrevious);

  if (!isMobile() && "mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("nexttrack", playNext);
    navigator.mediaSession.setActionHandler("previoustrack", playPrevious);
    navigator.mediaSession.setActionHandler("play", () => {
      if (!isPlaying) play.click();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      if (isPlaying) play.click();
    });
  }

  volUp.addEventListener("click", () => {
    audio.volume = Math.min(audio.volume + 0.1, 1);
  });

  volDown.addEventListener("click", () => {
    audio.volume = Math.max(audio.volume - 0.1, 0);
  });

  (function () {
    const searchBox = document.getElementById("search-box");
    const blurOverlay = document.getElementById("search-blur");
    let lastHighlighted = null;

    function clearHighlight() {
      if (lastHighlighted) {
        lastHighlighted.classList.remove("highlight");
        lastHighlighted = null;
      }
    }

    function findAndScroll(query) {
      clearHighlight();
      if (!query) return;
      const items = Array.from(
        document.querySelectorAll("#queue li, #queue h3")
      );
      const found = items.find((el) =>
        el.textContent.toLowerCase().includes(query.toLowerCase())
      );
      if (found) {
        found.scrollIntoView({ behavior: "smooth", block: "center" });
        found.classList.add("highlight");
        lastHighlighted = found;
      }
    }

    document.addEventListener("keydown", function (e) {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.id === "css-editor" ||
        e.target.id === "js-editor"
      )
        return;
      if (e.ctrlKey && e.code === "KeyF") {
        e.preventDefault();
        searchBox.value = "";
        searchBox.style.display = "block";
        blurOverlay.style.display = "block";
        searchBox.focus();
        clearHighlight();
      }
      if (e.key === "Escape" && searchBox.style.display === "block") {
        searchBox.style.display = "none";
        blurOverlay.style.display = "none";
        clearHighlight();
      }
    });

    searchBox.addEventListener("input", function () {
      findAndScroll(searchBox.value);
    });

    searchBox.addEventListener("blur", function () {
      setTimeout(() => {
        searchBox.style.display = "none";
        blurOverlay.style.display = "none";
        clearHighlight();
      }, 200);
    });
  })();

  function updateq() {
    q.innerHTML = "";
    let albums = {};
    playlists[currentPlaylistName] = playlist;
    playlist.forEach((track, index) => {
      const album = track.album || "Unknown Album";
      if (!albums[album]) {
        albums[album] = [];
      }
      albums[album].push({ track, index });
    });
    const sortedAlbums = Object.keys(albums).sort();

    let contextMenu = document.getElementById("context-menu");
    let contextSongIndex = null;
    let contextAlbumName = null;

    function hideContextMenu() {
      contextMenu.style.display = "none";
    }

    document.addEventListener("click", hideContextMenu);
    window.addEventListener("scroll", hideContextMenu);
    window.addEventListener("resize", hideContextMenu);

    sortedAlbums.forEach((album) => {
      const albumHeader = document.createElement("h3");
      albumHeader.textContent = album;
      q.appendChild(albumHeader);

      albumHeader.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        contextSongIndex = null;
        contextAlbumName = album;
        contextMenu.style.display = "block";
        contextMenu.style.position = "fixed";
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.visibility = "hidden";
        contextMenu.style.top = "0px";
        const rect = contextMenu.getBoundingClientRect();
        contextMenu.style.visibility = "";
        let top = e.clientY - rect.height;
        if (top < 0) top = 0;
        contextMenu.style.top = `${top}px`;
      });

      albums[album].forEach(({ track, index }) => {
        const listItem = document.createElement("li");

        const nameSpan = document.createElement("span");
        nameSpan.className = "track-name";
        nameSpan.textContent = track.name;

        const artistSpan = document.createElement("span");
        artistSpan.className = "track-artist";
        artistSpan.textContent = track.artist;

        listItem.appendChild(nameSpan);
        listItem.appendChild(artistSpan);

        listItem.addEventListener("click", () => {
          currentTrackIndex = index;
          initializePlayer(playlist[currentTrackIndex]);
          if (isPlaying) {
            audio.play();
          }
        });

        listItem.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          contextSongIndex = index;
          contextAlbumName = album;
          contextMenu.style.display = "block";
          contextMenu.style.position = "fixed";
          contextMenu.style.left = `${e.clientX}px`;
          contextMenu.style.visibility = "hidden";
          contextMenu.style.top = "0px";
          const rect = contextMenu.getBoundingClientRect();
          contextMenu.style.visibility = "";
          let top = e.clientY - rect.height;
          if (top < 0) top = 0;
          contextMenu.style.top = `${top}px`;
        });

        q.appendChild(listItem);
      });
    });

    contextMenu.querySelector("#delete-song").onclick = function () {
      if (contextSongIndex !== null) {
        playlist.splice(contextSongIndex, 1);
        if (currentTrackIndex >= playlist.length) {
          currentTrackIndex = Math.max(0, playlist.length - 1);
        }
        updateq();
        if (playlist.length > 0) {
          initializePlayer(playlist[currentTrackIndex]);
        } else {
          audio.pause();
          audio.src = "";
          t.textContent = "";
          ar.textContent = "";
          a.src = "./noart.png";
          document.title = "SoundFlare";
        }
      }
      contextMenu.style.display = "none";
    };

    contextMenu.querySelector("#delete-album").onclick = function () {
      if (contextAlbumName) {
        playlist = playlist.filter(
          (track) => (track.album || "Unknown Album") !== contextAlbumName
        );
        if (currentTrackIndex >= playlist.length) {
          currentTrackIndex = Math.max(0, playlist.length - 1);
        }
        updateq();
        if (playlist.length > 0) {
          initializePlayer(playlist[currentTrackIndex]);
        } else {
          audio.pause();
          audio.src = "";
          t.textContent = "";
          ar.textContent = "";
          a.src = "./noart.png";
          document.title = "SoundFlare";
        }
      }
      contextMenu.style.display = "none";
    };

    contextMenu.querySelector("#edit-song").onclick = function () {
      if (contextSongIndex !== null) {
        const track = playlist[contextSongIndex];
        const modal = document.getElementById("edit-song-modal");
        document.getElementById("edit-song-title").value = track.name || "";
        document.getElementById("edit-song-artist").value = track.artist || "";
        document.getElementById("edit-song-album").value = track.album || "";
        const preview = document.getElementById("edit-song-art-preview");
        if (track.picture) {
          const base64 = arrayBufferToBase64(track.picture.data);
          preview.src = `data:${track.picture.format};base64,${base64}`;
          preview.style.display = "block";
        } else {
          preview.style.display = "none";
        }
        document.getElementById("edit-song-art").value = "";
        modal.style.display = "block";

        // Handle album art preview
        document.getElementById("edit-song-art").onchange = function (e) {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function (ev) {
              preview.src = ev.target.result;
              preview.style.display = "block";
            };
            reader.readAsDataURL(file);
          }
        };

        // Save changes
        document.getElementById("edit-song-form").onsubmit = async function (
          e
        ) {
          e.preventDefault();
          track.name = document.getElementById("edit-song-title").value;
          track.artist = document.getElementById("edit-song-artist").value;
          track.album = document.getElementById("edit-song-album").value;
          const artFile = document.getElementById("edit-song-art").files[0];
          if (artFile) {
            const arrayBuffer = await artFile.arrayBuffer();
            track.picture = {
              format: artFile.type,
              data: arrayBuffer
            };
          }
          modal.style.display = "none";
          updateq();
          if (currentTrackIndex === contextSongIndex) {
            initializePlayer(track);
          }
        };
        document.getElementById("close-edit-song-modal").onclick = function () {
          modal.style.display = "none";
        };
      }
      contextMenu.style.display = "none";
    };

    contextMenu.querySelector("#edit-album").onclick = function () {
      if (contextAlbumName) {
        // Find first track in album for preview
        const albumTracks = playlist.filter(
          (track) => (track.album || "Unknown Album") === contextAlbumName
        );
        const modal = document.getElementById("edit-album-modal");
        document.getElementById("edit-album-name").value = contextAlbumName;
        const preview = document.getElementById("edit-album-art-preview");
        if (albumTracks[0] && albumTracks[0].picture) {
          const base64 = arrayBufferToBase64(albumTracks[0].picture.data);
          preview.src = `data:${albumTracks[0].picture.format};base64,${base64}`;
          preview.style.display = "block";
        } else {
          preview.style.display = "none";
        }
        document.getElementById("edit-album-art").value = "";
        modal.style.display = "block";

        document.getElementById("edit-album-art").onchange = function (e) {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function (ev) {
              preview.src = ev.target.result;
              preview.style.display = "block";
            };
            reader.readAsDataURL(file);
          }
        };

        document.getElementById("edit-album-form").onsubmit = async function (
          e
        ) {
          e.preventDefault();
          const newAlbumName = document.getElementById("edit-album-name").value;
          const artFile = document.getElementById("edit-album-art").files[0];
          for (const track of playlist) {
            if ((track.album || "Unknown Album") === contextAlbumName) {
              track.album = newAlbumName;
              if (artFile) {
                const arrayBuffer = await artFile.arrayBuffer();
                track.picture = {
                  format: artFile.type,
                  data: arrayBuffer
                };
              }
            }
          }
          modal.style.display = "none";
          updateq();
          // If current track is in this album, update player
          if (
            playlist[currentTrackIndex] &&
            (playlist[currentTrackIndex].album || "Unknown Album") ===
              newAlbumName
          ) {
            initializePlayer(playlist[currentTrackIndex]);
          }
        };
        document.getElementById(
          "close-edit-album-modal"
        ).onclick = function () {
          modal.style.display = "none";
        };
      }
      contextMenu.style.display = "none";
    };

    contextMenu.querySelector("#add-to-favorites").onclick = function () {
      if (!playlists["Favorites"]) {
        playlists["Favorites"] = [];
        playlistMeta["Favorites"] = {
          name: "Favorites",
          image: "./favorites.png"
        };
      }
      if (contextSongIndex !== null) {
        const track = playlist[contextSongIndex];
        const isDuplicate = playlists["Favorites"].some((favTrack) => {
          return (
            favTrack.file &&
            track.file &&
            favTrack.file.name === track.file.name &&
            favTrack.file.size === track.file.size
          );
        });
        if (!isDuplicate) {
          playlists["Favorites"].push(track);
        }
      }
      contextMenu.style.display = "none";
    };
  }

  document
    .getElementById("delete-playlist")
    .addEventListener("click", function () {
      const nameInput = document.getElementById("edit-playlist-name");
      const playlistName = nameInput.value.trim();
      if (!playlistName || !playlists[playlistName]) return;
      if (
        !confirm(
          `Are you sure you want to delete the playlist "${playlistName}"? This cannot be undone.`
        )
      )
        return;
      delete playlists[playlistName];
      delete playlistMeta[playlistName];
      if (currentPlaylistName === playlistName) {
        const fallback = Object.keys(playlists)[0] || "Main Queue";
        if (!playlists[fallback]) playlists[fallback] = [];
        currentPlaylistName = fallback;
        playlist = playlists[currentPlaylistName];
        currentTrackIndex = 0;
        updateq();
        if (playlist.length > 0) {
          initializePlayer(playlist[currentTrackIndex]);
        } else {
          audio.pause();
          audio.src = "";
          t.textContent = "";
          ar.textContent = "";
          a.src = "./noart.png";
          document.title = "SoundFlare";
        }
      }
      document.getElementById("edit-playlist-modal").style.display = "none";
      updatePlaylistUI && updatePlaylistUI();
    });

  function updatePlaylistUI() {
    const playlistListDiv = document.getElementById("playlist-list");
    if (!playlistListDiv) return;
    playlistListDiv.innerHTML = "";
    Object.keys(playlists).forEach((name) => {
      const container = document.createElement("div");
      container.className = "playlist-item";

      const img = document.createElement("img");
      img.className = "playlist-image";
      img.src =
        (playlistMeta[name] && playlistMeta[name].image) || "./noart.png";
      img.alt = name + " image";
      const btn = document.createElement("p");
      btn.className = "playlist-option";
      if (name === currentPlaylistName) {
        btn.innerHTML = `${name} <span class="current-label">(Current)</span>`;
      } else {
        btn.textContent = name;
      }
      container.addEventListener("click", () => {
        switchToPlaylist(name);
        switchModal.style.display = "none";
      });

      const editBtn = document.createElement("button");
      editBtn.className = "edit-playlist";
      editBtn.textContent = "Edit";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        switchModal.style.display = "none";
        openEditPlaylistModal(name);
      };

      const saveBtn = document.createElement("button");
      saveBtn.className = "edit-playlist";
      saveBtn.textContent = "Save";
      saveBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          let JSZip = window.JSZip;
          const tracks = playlists[name];
          const zip = new JSZip();
          const filesFolder = zip.folder("files");
          const serializedTracks = await Promise.all(
            tracks.map(async (track, idx) => {
              let fileName = null;
              let fileType = null;
              let fileSize = null;
              let filePath = null;
              if (
                track.file &&
                typeof track.file === "object" &&
                typeof track.file.name === "string"
              ) {
                fileName = track.file.name;
                fileType = track.file.type;
                fileSize = track.file.size;
                filePath = `files/${fileName}`;
                // Add file to zip
                const fileData = await track.file.arrayBuffer();
                filesFolder.file(fileName, fileData);
              }
              return {
                name: track.name,
                artist: track.artist,
                album: track.album,
                picture: track.picture,
                fileName: fileName,
                fileType: fileType,
                fileSize: fileSize,
                filePath: filePath // reference for later
              };
            })
          );
          const playlistExport = {
            meta: playlistMeta[name] || {},
            tracks: serializedTracks
          };
          zip.file(
            "playlist.soundflareplaylist.json",
            JSON.stringify(playlistExport, null, 2)
          );

          const blob = await zip.generateAsync({ type: "blob" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `${name}.soundflareplaylist.zip`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
          }, 100);
        } catch (err) {
          alert("Failed to export playlist: " + err.message);
        }
      });

      container.appendChild(img);
      container.appendChild(btn);
      container.appendChild(editBtn);
      container.appendChild(saveBtn);
      playlistListDiv.appendChild(container);
    });
  }

  // Load Playlist Handler
  // Load Playlist Handler
  document
    .getElementById("load-playlist")
    .addEventListener("change", async function (e) {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const playlistImport = JSON.parse(text);
        if (!playlistImport.tracks || !Array.isArray(playlistImport.tracks)) {
          alert("Invalid playlist file.");
          return;
        }
        // Ask for playlist name
        let newName =
          playlistImport.meta && playlistImport.meta.name
            ? playlistImport.meta.name
            : prompt("Enter a name for the imported playlist:");
        if (!newName) return;
        if (playlists[newName]) {
          if (!confirm("A playlist with this name exists. Overwrite?")) return;
        }

        // Prompt user to select a directory of music files
        let dirInput = document.createElement("input");
        dirInput.type = "file";
        dirInput.webkitdirectory = true;
        dirInput.multiple = true;
        dirInput.style.display = "none";
        document.body.appendChild(dirInput);

        dirInput.addEventListener("change", async function handleDir(e2) {
          const files = Array.from(e2.target.files);
          // Build a map of files by name/size/type for quick lookup
          const fileMap = {};
          files.forEach((f) => {
            fileMap[`${f.name}_${f.size}_${f.type}`] = f;
          });

          // Try to match imported tracks to files in the directory
          const tracks = await Promise.all(
            playlistImport.tracks.map(async (track) => {
              let matchedFile = null;
              // Try to match by fileName, fileSize, fileType if available
              if (track.fileName && track.fileSize && track.fileType) {
                matchedFile =
                  fileMap[
                    `${track.fileName}_${track.fileSize}_${track.fileType}`
                  ];
              }
              // If not found, try to match by metadata (title/artist/album)
              if (!matchedFile && track.name && track.artist) {
                matchedFile = files.find((f) => {
                  // Only check audio files
                  if (!f.type.startsWith("audio/")) return false;
                  return f.name.replace(/\.[^/.]+$/, "") === track.name;
                });
              }
              // If still not found, leave as null
              let url = matchedFile ? URL.createObjectURL(matchedFile) : "";
              // If no file found, mark as missing
              let missing = !matchedFile;
              return {
                url,
                file: matchedFile,
                name: track.name,
                artist: track.artist,
                album: track.album,
                picture: track.picture,
                missing
              };
            })
          );

          // Replace queue with matched tracks
          playlists[newName] = tracks;
          playlistMeta[newName] = playlistImport.meta || {
            name: newName,
            image: "./noart.png"
          };
          updatePlaylistUI && updatePlaylistUI();

          // Show a summary of missing tracks
          const missingCount = tracks.filter((t) => t.missing).length;
          if (missingCount > 0) {
            alert(
              `Playlist loaded, but ${missingCount} track(s) could not be matched to files in the selected directory.`
            );
          } else {
            alert("Playlist loaded!");
          }
          e.target.value = "";
          document.body.removeChild(dirInput);
        });
        setTimeout(() => {
          try {
            dirInput.click();
          } catch (e) {
            alert(
              "Please click the directory picker to select your music folder."
            );
            document.body.appendChild(dirInput);
          }
        }, 0);
      } catch (err) {
        alert("Failed to load playlist: " + err.message);
        e.target.value = "";
      }
    });

  f.addEventListener("change", async function (e) {
    const files = e.target.files;
    playlists[currentPlaylistName] = playlist;
    if (files.length > 0) {
      const supportedFiles = Array.from(files)
        .filter(
          (file) =>
            file.type.startsWith("audio/") ||
            file.type.startsWith("video/") ||
            file.type.startsWith("image/")
        )
        .sort((a, b) =>
          a.webkitRelativePath.localeCompare(b.webkitRelativePath)
        );

      if (supportedFiles.length === 0) return;

      const existingFiles = new Set(
        playlist.map((track) => `${track.file.name}_${track.file.size}`)
      );

      const newTracks = await Promise.all(
        supportedFiles.map(async (file) => {
          if (file.type.startsWith("audio/")) {
            return new Promise((resolve) => {
              new jsmediatags.Reader(file)
                .setTagsToRead(["title", "artist", "album", "picture"])
                .read({
                  onSuccess: (tag) => {
                    const url = URL.createObjectURL(file);
                    resolve({
                      url: url,
                      file: file,
                      name:
                        tag.tags.title || file.name.replace(/\.[^/.]+$/, ""),
                      artist: tag.tags.artist || "Unknown Artist",
                      album: tag.tags.album || "Unknown Album",
                      picture: tag.tags.picture
                    });
                  },
                  onError: async () => {
                    const url = URL.createObjectURL(file);
                    resolve({
                      url: url,
                      file: file,
                      name: file.name.replace(/\.[^/.]+$/, ""),
                      artist: "Unknown Artist",
                      album: "Unknown Album",
                      picture: {
                        format: "image/png",
                        data: await fetch("./noart.png").then((res) =>
                          res.arrayBuffer()
                        )
                      }
                    });
                  }
                });
            });
          }
          if (file.type.startsWith("video/")) {
            const url = URL.createObjectURL(file);
            return {
              url: url,
              file: file,
              name: file.name.replace(/\.[^/.]+$/, ""),
              artist: "Unknown Artist",
              album: "Unknown Album",
              picture: null
            };
          }

          if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            return {
              url: url,
              file: file,
              name: file.name.replace(/\.[^/.]+$/, ""),
              artist: "Image",
              album: "Images",
              picture: {
                format: file.type,
                data: await file.arrayBuffer()
              }
            };
          }
        })
      );

      const uniqueNewTracks = newTracks.filter((track) => {
        const key = `${track.file.name}_${track.file.size}`;
        if (existingFiles.has(key)) {
          return false;
        }
        existingFiles.add(key);
        return true;
      });

      playlist.push(...uniqueNewTracks);
      updateq();

      if (
        playlist.length > 0 &&
        currentTrackIndex === playlist.length - uniqueNewTracks.length
      ) {
        initializePlayer(playlist[currentTrackIndex]);
        if (isPlaying) audio.play();
      }
    }
  });
  function extractDominantColors(image, callback) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let colors = {};
    const step = 100;
    for (let i = 0; i < data.length; i += step * 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const color = `rgb(${r},${g},${b})`;
      colors[color] = (colors[color] || 0) + 1;
    }

    const sortedColors = Object.entries(colors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    function brighten(rgbStr) {
      const match = rgbStr.match(/rgb\((\d+),(\d+),(\d+)\)/);
      if (!match) return rgbStr;
      let [r, g, b] = [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3])
      ];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      if (brightness < 80) {
        r = Math.round(r + (255 - r) * 0.5);
        g = Math.round(g + (255 - g) * 0.5);
        b = Math.round(b + (255 - b) * 0.5);
      }
      return `rgb(${r},${g},${b})`;
    }
    const dominantColors = sortedColors.map((color) => brighten(color[0]));
    callback(dominantColors);
  }

  function updateGradientColors(dominantColors) {
    const gradient = document.getElementById("progressGradient");
    const stops = gradient.querySelectorAll("stop");

    if (dominantColors.length >= 2) {
      stops[0].setAttribute("stop-color", dominantColors[0]);
      stops[1].setAttribute("stop-color", dominantColors[1]);
    }

    const trpb = document.getElementById("trad-progress-bar");
    const trpt = document.getElementById("trad-progress-thumb");
    if (trpb && trpt && dominantColors.length > 0) {
      trpb.style.background = dominantColors[0];
      trpt.style.borderColor = dominantColors[0];
      trpt.style.boxShadow = `0 0 4px ${dominantColors[0]}`;
    }
  }

  function initializePlayer(track) {
    audio.src = track.url;
    t.textContent = track.name;
    ar.textContent = track.artist;
    document.title = track.name + " - " + track.artist;

    const prevVideo = document.getElementById("album-video");
    if (prevVideo) prevVideo.remove();

    let artwork = [];
    if (track.file && track.file.type && track.file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.id = "album-video";
      video.src = track.url;
      video.muted = true;
      video.autoplay = false;
      video.loop = false;
      video.playsInline = true;
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";
      video.style.borderRadius = "inherit";
      video.controls = false;

      a.style.display = "none";
      ab.appendChild(video);

      audio.addEventListener("play", () => video.play());
      audio.addEventListener("pause", () => video.pause());
      audio.addEventListener("seeked", () => {
        video.currentTime = audio.currentTime;
      });
      audio.addEventListener("timeupdate", () => {
        if (Math.abs(video.currentTime - audio.currentTime) > 0.1) {
          video.currentTime = audio.currentTime;
        }
      });
      video.addEventListener("loadedmetadata", () => {
        video.currentTime = audio.currentTime;
      });

      video.addEventListener("loadeddata", function extractFrameOnce() {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = new window.Image();
        img.src = canvas.toDataURL();
        img.onload = function () {
          extractDominantColors(img, updateGradientColors);
        };
        video.removeEventListener("loadeddata", extractFrameOnce);
      });

      artwork = [{ src: "", sizes: "512x512", type: track.file.type }];
    } else {
      a.style.display = "";
      if (track.picture) {
        const base64String = arrayBufferToBase64(track.picture.data);
        const albumImage = new Image();
        albumImage.src = `data:${track.picture.format};base64,${base64String}`;
        artwork = [
          { src: albumImage.src, sizes: "512x512", type: track.picture.format }
        ];
        albumImage.onload = function () {
          a.src = albumImage.src;
          extractDominantColors(albumImage, updateGradientColors);
        };
      } else {
        a.src = "./noart.png";
        artwork = [{ src: "./noart.png", sizes: "512x512", type: "image/png" }];
      }
    }

    
    if (!isMobile() && "mediaSession" in navigator) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.name,
        artist: track.artist,
        album: track.album || "",
        artwork: artwork || "./noart.png"
      });
    }

    audio.load();
    progressRing.style.strokeDashoffset = circumference;

    if (isPlaying) {
      audio.play();
    }
  }

  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function initVisualizer() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (!mediaElementSource) {
      mediaElementSource = audioContext.createMediaElementSource(audio);
      mediaElementSource.connect(audioContext.destination);
    }
    if (!analyser) {
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      mediaElementSource.connect(analyser);
    }

    resizeVisualizer();
    drawVisualizer();
  }

  function resizeVisualizer() {
    visualizerCanvas.width = window.innerWidth;
    visualizerCanvas.height = window.innerHeight;
    visualizerCtx.fillStyle = "rgb(0, 0, 0)";
    visualizerCtx.fillRect(
      0,
      0,
      visualizerCanvas.width,
      visualizerCanvas.height
    );
  }

function drawVisualizer() {
  if (!analyser || !isVisualizerVisible) return;
  requestAnimationFrame(drawVisualizer);

  const currentVisualizer = visualizers[visualizerMode];
  const visualizerCanvas = document.getElementById("visualizer");
  let fruityCanvas = document.getElementById("fruityCanvas");

  if (typeof currentVisualizer === "function") {
    if (currentVisualizer.name === "FruityDanceVisualizer") {
      fruityCanvas.style.display = "block";

      if (!fruityDanceStarted) {
        fruityDanceStarted = true;
        currentVisualizer();
      }
    } else {
      if (fruityDanceStarted) {
        fruityDanceStarted = false;
      }
      currentVisualizer();
    }
  } else {
    visualizerMode = 0;
    drawBarVisualizer();
  }
}


  function drawBarVisualizer() {
    analyser.getByteFrequencyData(dataArray);
    const bassGain = bb ? parseFloat(bb.value) || 0 : 0;
    const midGain = mb ? parseFloat(mb.value) || 0 : 0;
    const trebleGain = tb ? parseFloat(tb.value) || 0 : 0;
    let visArray = new Uint8Array(dataArray);
    const barCount = 32;
    const spacing = 2;
    const totalSpacing = spacing * (barCount - 1);
    const barWidth = (visualizerCanvas.width - totalSpacing) / barCount;
    const barHeightStep = 10;
    const levels = Math.floor(visualizerCanvas.height / barHeightStep);
    const totalBarWidth = barCount * barWidth + (barCount - 1) * spacing;
    const offsetX = (visualizerCanvas.width - totalBarWidth) / 2;

    for (let i = 0; i < visArray.length; i++) {
      const freq = ((i / visArray.length) * analyser.context.sampleRate) / 2;
      let gain = 0;
      if (freq < 250) {
        gain = bassGain;
      } else if (freq < 2000) {
        gain = midGain;
      } else {
        gain = trebleGain;
      }
      const linear = Math.pow(10, gain / 20);
      visArray[i] = Math.min(255, visArray[i] * linear);
    }

    const trailToggle = document.getElementById("trailtoggle");
const trailsEnabled = trailToggle && trailToggle.checked;

if (trailsEnabled) {
  const trailAlpha = 0.08; 
  visualizerCtx.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`;
} else {
  visualizerCtx.fillStyle = "black"; 
}

visualizerCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);


    const gradientColors = [
      "#00ff00",
      "#33ff00",
      "#66ff00",
      "#99ff00",
      "#ccff00",
      "#ffff00",
      "#ffcc00",
      "#ffaa00",
      "#ff8000",
      "#ff5500",
      "#ff2a00",
      "#ff0000"
    ];

    for (let i = 0; i < barCount; i++) {
      const logIndex = Math.floor(
        Math.pow(i / barCount, 2) * (visArray.length - 1)
      );
      let sum = 0;
      const avgRange = 2;
      for (let j = 0; j < avgRange; j++) {
        sum += visArray[Math.min(logIndex + j, visArray.length - 1)];
      }
      const avg = sum / avgRange;
      const filled = Math.floor((avg / 255) * levels);

      for (let j = 0; j < filled; j++) {
        const colorIndex = Math.floor((j / levels) * gradientColors.length);
        visualizerCtx.fillStyle = gradientColors[colorIndex];

        visualizerCtx.fillRect(
          offsetX + i * (barWidth + spacing),
          visualizerCanvas.height - (j + 1) * barHeightStep,
          Math.floor(barWidth),
          barHeightStep - 1
        );
      }
    }
  }

  function drawSpectrogramVisualizer() {
    const width = visualizerCanvas.width;
    const height = visualizerCanvas.height;

    const freqDataL = new Uint8Array(analyserL.frequencyBinCount);
    const freqDataR = new Uint8Array(analyserR.frequencyBinCount);
    analyserL.getByteFrequencyData(freqDataL);
    analyserR.getByteFrequencyData(freqDataR);

    const imageData = visualizerCtx.getImageData(1, 0, width - 1, height);
    visualizerCtx.putImageData(imageData, 0, 0);

    visualizerCtx.fillStyle = "black";
    visualizerCtx.fillRect(width - 1, 0, 1, height);

    const separationSlider = document.getElementById("stereo-separation");
    const separation = separationSlider ? parseInt(separationSlider.value) : 0;
    const sepOffset = (Math.min(separation, 100) / 100) * (height / 2);

    const drawHeatmapColumn = (data, yOffset) => {
      const len = data.length;
      for (let i = 0; i < len; i++) {
        const value = data[i] / 255;
        const y = Math.floor(((i / len) * height) / 2 + yOffset);
        visualizerCtx.fillStyle = getHeatmapColor(value);
        visualizerCtx.fillRect(width - 1, y, 1, 1);
      }
    };

    drawHeatmapColumn(freqDataL, height / 2 - sepOffset - freqDataL.length / 2);
    drawHeatmapColumn(freqDataR, height / 2 + sepOffset - freqDataR.length / 2);
  }

  function getHeatmapColor(value) {
    value = Math.max(0, Math.min(1, value));

    const colormap = [
      { val: 0.0, r: 0, g: 0, b: 0 },
      { val: 0.25, r: 80, g: 0, b: 100 },
      { val: 0.5, r: 200, g: 0, b: 0 },
      { val: 0.75, r: 255, g: 140, b: 0 },
      { val: 1.0, r: 255, g: 255, b: 255 }
    ];

    for (let i = 0; i < colormap.length - 1; i++) {
      const left = colormap[i];
      const right = colormap[i + 1];
      if (value >= left.val && value <= right.val) {
        const range = (value - left.val) / (right.val - left.val);
        const r = Math.floor(left.r + range * (right.r - left.r));
        const g = Math.floor(left.g + range * (right.g - left.g));
        const b = Math.floor(left.b + range * (right.b - left.b));
        return `rgb(${r}, ${g}, ${b})`;
      }
    }

    return "rgb(0,0,0)";
  }

function FruityDanceVisualizer() {
  const canvas = document.getElementById("fruityCanvas");
  const ctx = canvas.getContext('2d');
  const cols = 8, rows = 10;
  const spriteImage = new Image();
  spriteImage.src = 'assets/Dance.png';

  let frameWidth, frameHeight;
  let currentFrame = 0;
  let currentRow = 0;
  let previousRow = 0;
  let lastFrameTime = 0;
  let frameSpeed = 120;

  let pos = { x: parseInt(canvas.style.left, 10) || 100, y: parseInt(canvas.style.top, 10) || 100 };
  let vel = { x: 0, y: 0 };
  let acc = { x: 0, y: 0.5 };
  let rotation = 0;
  let angularVel = 0;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let prevMouse = { x: 0, y: 0 };
  let lastDragTime = 0;
  let physicsEnabled = true;

  let isHovering = false;
  canvas.addEventListener("mouseenter", () => isHovering = true);
  canvas.addEventListener("mouseleave", () => isHovering = false);

  canvas.onmousedown = (e) => {
    if (e.button === 2) {
      if (isDragging) {
        physicsEnabled = !physicsEnabled;
        if (!physicsEnabled) {
          vel = { x: 0, y: 0 };
          angularVel = 0;
          rotation = 0;
        }
        sfx.unfreeze.currentTime = 0;
        sfx.unfreeze.play();
      } else {
        currentRow = (currentRow + 1) % rows;
        previousRow = currentRow;
      }
    } else if (e.button === 0) {
      isDragging = true;
      dragOffset.x = e.offsetX;
      dragOffset.y = e.offsetY;
      prevMouse.x = e.pageX;
      prevMouse.y = e.pageY;
      lastDragTime = performance.now();
      canvas.style.cursor = 'grabbing';

      previousRow = currentRow;
      currentRow = 9;

      if (!physicsEnabled) {
        vel = { x: 0, y: 0 };
        angularVel = 0;
        rotation = 0;
      }

      sfx.pickup.currentTime = 0;
      sfx.pickup.play();
      sfx.holdLoop.currentTime = 0;
      sfx.holdLoop.play();
    }
  };

  function stopDragging(e) {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = 'grab';

      if (physicsEnabled) {
        const now = performance.now();
        const dt = now - lastDragTime || 16;
        vel.x = (e.pageX - prevMouse.x) / dt * 16;
        vel.y = (e.pageY - prevMouse.y) / dt * 16;
        angularVel = vel.x * 0.05;
      } else {
        vel = { x: 0, y: 0 };
        angularVel = 0;
        rotation = 0;
      }

      lastDragTime = 0;
      currentRow = previousRow;

      sfx.drop.currentTime = 0;
      sfx.drop.play();
      sfx.holdLoop.pause();
      sfx.holdLoop.currentTime = 0;
    }
  }
  window.addEventListener('mouseup', stopDragging);

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      pos.x = e.pageX - dragOffset.x;
      pos.y = e.pageY - dragOffset.y;

      vel.x = e.pageX - prevMouse.x;
      vel.y = e.pageY - prevMouse.y;

      prevMouse.x = e.pageX;
      prevMouse.y = e.pageY;
      lastDragTime = performance.now();
    }
  });

  canvas.oncontextmenu = (e) => e.preventDefault();

  window.addEventListener("keydown", (e) => {
    if (isHovering && e.key.toLowerCase() === "r") {
      physicsEnabled = true;
      sfx.unfreeze.currentTime = 0;
      sfx.unfreeze.play();
    }
  });

  let lastBeatTime = 0;
  const beatCooldown = 100;
  function getBeatIntensity(timestamp) {
    if (!analyser) return 0;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const lowFreqCount = Math.floor(bufferLength / 8);
    let sum = 0;
    for (let i = 0; i < lowFreqCount; i++) sum += dataArray[i];
    const avg = sum / lowFreqCount;

    const normalized = Math.min(avg / 255, 1);
    if (timestamp - lastBeatTime > beatCooldown && normalized > 0.2) {
      lastBeatTime = timestamp;
      return normalized;
    }
    return 0;
  }

  function loop(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const elapsed = timestamp - lastFrameTime;

    const beatIntensity = getBeatIntensity(timestamp);
    const minSpeed = 40, maxSpeed = 150;
    frameSpeed = maxSpeed - (maxSpeed - minSpeed) * beatIntensity;

    if (elapsed > frameSpeed) {
      currentFrame = (currentFrame + 1) % cols;
      lastFrameTime = timestamp;
    }

    if (!isDragging && physicsEnabled) {
      vel.x *= 0.98;
      vel.y *= 0.98;
      vel.x += acc.x;
      vel.y += acc.y;
      pos.x += vel.x;
      pos.y += vel.y;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      if (pos.x < 0) {
        pos.x = 0;
        vel.x *= -0.7;
        angularVel *= -0.5;
      } else if (pos.x + frameWidth > windowWidth) {
        pos.x = windowWidth - frameWidth;
        vel.x *= -0.7;
        angularVel *= -0.5;
      }
      if (pos.y < 0) {
        pos.y = 0;
        vel.y *= -0.7;
        angularVel *= -0.5;
      } else if (pos.y + frameHeight > windowHeight) {
        pos.y = windowHeight - frameHeight;
        vel.y *= -0.7;
        angularVel *= -0.5;
      }

      rotation += angularVel;
      angularVel *= 0.98;
    } else if (isDragging) {
      rotation = 0;
      angularVel = 0;
    }

    canvas.style.left = `${pos.x}px`;
    canvas.style.top = `${pos.y}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(frameWidth / 2, frameHeight / 2);
    ctx.rotate(rotation);
    ctx.drawImage(
      spriteImage,
      currentFrame * frameWidth,
      currentRow * frameHeight,
      frameWidth,
      frameHeight,
      -frameWidth / 2,
      -frameHeight / 2,
      frameWidth,
      frameHeight
    );
    ctx.restore();

    requestAnimationFrame(loop);
  }

  spriteImage.onload = () => {
    frameWidth = spriteImage.width / cols;
    frameHeight = spriteImage.height / rows;
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    requestAnimationFrame(loop);
  };
}

  function drawWaveformVisualizer() {
    const isPaused = audio.paused;

    if (!isPaused) {
      analyserL.getByteTimeDomainData(dataArrayL);
      analyserR.getByteTimeDomainData(dataArrayR);
    }

    const trailToggle = document.getElementById("trailtoggle");
const trailsEnabled = trailToggle && trailToggle.checked;

if (trailsEnabled) {
  const trailAlpha = 0.1; 
  visualizerCtx.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`;
} else {
  visualizerCtx.fillStyle = "black"; 
}

visualizerCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);


    const waveColorInput = document.getElementById("wave-color");
    const waveColor = waveColorInput ? waveColorInput.value : "#ffffff";
    const separationSlider = document.getElementById("stereo-separation");
    const separation = separationSlider ? parseInt(separationSlider.value) : 0;

    const width = visualizerCanvas.width;
    const height = visualizerCanvas.height;
    const centerY = height / 2;

    const sliceWidth = width / dataArrayL.length;
    const maxSeparation = centerY;
    const sepOffset = (Math.min(separation, 100) / 100) * maxSeparation;

    const fadeThreshold = 10;
    let fillAlpha = 0;
    if (separation <= 0) {
      fillAlpha = 0.2;
    } else if (separation < fadeThreshold) {
      fillAlpha = 0.2 * (1 - separation / fadeThreshold);
    }

    const alphaHex = Math.floor(fillAlpha * 255)
      .toString(16)
      .padStart(2, "0");
    const fillColor = waveColor + alphaHex;

    const leftPoints = [];
    const rightPoints = [];

    for (let i = 0; i < dataArrayL.length; i++) {
 const x = i * sliceWidth;

const fadeMarginPercent = 0.05;
const fadeMargin = width * fadeMarginPercent;

let vL = dataArrayL[i] / 128.0;
let vR = dataArrayR[i] / 128.0;

let yL, yR;

function getBlendFactor(x) {
  if (x < fadeMargin) {
    return easeInOutQuad(x / fadeMargin);
  } else if (x > width - fadeMargin) {
    return easeInOutQuad((width - x) / fadeMargin);
  } else {
    return 1;
  }
}

const blend = getBlendFactor(x);

const baseY_L = centerY - sepOffset;
const baseY_R = centerY + sepOffset;

const oscY_L = centerY + (vL - 1) * centerY / 2 - sepOffset;
const oscY_R = centerY + (vR - 1) * centerY / 2 + sepOffset;

yL = baseY_L * (1 - blend) + oscY_L * blend;
yR = baseY_R * (1 - blend) + oscY_R * blend;

      leftPoints.push({ x, y: yL });
      rightPoints.push({ x, y: yR });
    }

    if (!isPaused) {
      lastLeftPoints = leftPoints;
      lastRightPoints = rightPoints;
    }

    const drawLeft = isPaused ? lastLeftPoints : leftPoints;
    const drawRight = isPaused ? lastRightPoints : rightPoints;

    if (fillAlpha > 0 && drawLeft.length && drawRight.length) {
      visualizerCtx.beginPath();
      visualizerCtx.moveTo(drawLeft[0].x, drawLeft[0].y);
      for (let i = 1; i < drawLeft.length; i++) {
        visualizerCtx.lineTo(drawLeft[i].x, drawLeft[i].y);
      }
      for (let i = drawRight.length - 1; i >= 0; i--) {
        visualizerCtx.lineTo(drawRight[i].x, drawRight[i].y);
      }
      visualizerCtx.closePath();
      visualizerCtx.fillStyle = fillColor;
      visualizerCtx.fill();
    }

    visualizerCtx.lineWidth = 2;
    visualizerCtx.strokeStyle = waveColor;

    visualizerCtx.beginPath();
    visualizerCtx.moveTo(drawLeft[0].x, drawLeft[0].y);
    for (let i = 1; i < drawLeft.length; i++) {
      visualizerCtx.lineTo(drawLeft[i].x, drawLeft[i].y);
    }
    visualizerCtx.stroke();

    visualizerCtx.beginPath();
    visualizerCtx.moveTo(drawRight[0].x, drawRight[0].y);
    for (let i = 1; i < drawRight.length; i++) {
      visualizerCtx.lineTo(drawRight[i].x, drawRight[i].y);
    }
    visualizerCtx.stroke();
  }

  function toggleVisualizer() {
    isVisualizerVisible = !isVisualizerVisible;
    visualizerCanvas.style.display = isVisualizerVisible ? "block" : "none";

    if (isVisualizerVisible) {
      initVisualizer();
    }
  }

  function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffle.classList.toggle("active", isShuffled);
    shuffle.querySelector("i").style.color = isShuffled ? "#1db954" : "#ffffff";
    const tsh = document.getElementById("trad-shuffle");
    if (tsh) {
      tsh.classList.toggle("active", isShuffled);
      const tshIcon = tsh.querySelector("i");
      if (tshIcon) {
        tshIcon.style.color = isShuffled ? "#1db954" : "#ffffff";
      }
    }

    if (isShuffled) {
      shuffledOrder = [...Array(playlist.length).keys()];
      for (let i = shuffledOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOrder[i], shuffledOrder[j]] = [
          shuffledOrder[j],
          shuffledOrder[i]
        ];
      }
    } else {
      shuffledOrder = [...Array(playlist.length).keys()];
    }
    initializePlayer(playlist[currentTrackIndex]);
  }

  shuffle.addEventListener("click", toggleShuffle);

  const tsh = document.getElementById("trad-shuffle");
  if (tsh) {
    tsh.addEventListener("click", toggleShuffle);
  }

  function setProgress(progress) {
    const offset = circumference - progress * circumference;
    progressRing.style.strokeDashoffset = offset;
  }

  function updateProgress() {
    if (isDragging) return;
    const progress = audio.duration ? audio.currentTime / audio.duration : 0;
    setProgress(progress);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function updateTimePopup(progress) {
    if (!audio.duration) return;

    const currentTime = progress * audio.duration;
    const remainingTime = audio.duration - currentTime;

    cte.textContent = formatTime(currentTime);
    rte.textContent = `-${formatTime(remainingTime)}`;

    tp.classList.add("show");
    clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => {
      tp.classList.remove("show");
    }, 1000);
  }

  function handleDrag(e) {
    const rect = progressRing.getBoundingClientRect();
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;

    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    const progress = Math.min(Math.max(angle / (2 * Math.PI), 0), 1);

    if (audio.duration) {
      audio.currentTime = progress * audio.duration;
    }
    setProgress(progress);
    updateTimePopup(progress);
  }

  const savedMode = localStorage.getItem("visualizerMode");
  if (savedMode !== null) {
    visualizerMode = parseInt(savedMode);
  }

  const ghostMode = localStorage.getItem("ghostMode");
  const ghostCheckbox = document.getElementById("trailtoggle");
  if (ghostMode !== null && ghostCheckbox) {
    ghostCheckbox.checked = ghostMode === "true";
  }

  document.getElementById("trailtoggle").addEventListener("change", (e) => {
  localStorage.setItem("ghostMode", e.target.checked);
});


stereoValueDisplay.textContent = `${stereoSlider.value}px`;

stereoSlider.addEventListener("input", () => {
  stereoValueDisplay.textContent = `${stereoSlider.value}px`;
});



  window.addEventListener("keydown", (e) => {
  if (e.shiftKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
    visualizerCtx.fillStyle = "black";
    visualizerCtx.fillRect(
      0,
      0,
      visualizerCanvas.width,
      visualizerCanvas.height
    );
    const direction = e.key === "ArrowUp" ? 1 : -1;
    const totalModes = visualizers.length;
    visualizerMode = (visualizerMode + direction + totalModes) % totalModes;

    localStorage.setItem("visualizerMode", visualizerMode); 
  }
});

  progressRing.addEventListener("mousedown", (e) => {
    isDragging = true;
    handleDrag(e);
  });

  progressRing.addEventListener("touchstart", (e) => {
    isDragging = true;
    handleDrag(e);
  });

  l.addEventListener("click", () => {
    isLooping = !isLooping;
    audio.loop = isLooping;
    l.classList.toggle("active", isLooping);
    l.querySelector("i").style.color = isLooping ? "#1db954" : "#ffffff";
    const tlo = document.getElementById("trad-loop");
    if (tlo) {
      tlo.classList.toggle("active", isLooping);
      const tloIcon = tlo.querySelector("i");
      if (tloIcon) {
        tloIcon.style.color = isLooping ? "#1db954" : "#ffffff";
      }
    }
  });

  audio.addEventListener("ended", () => {
    if (!isLooping) {
      playNext();
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (isDragging) handleDrag(e);
  });

  window.addEventListener("touchmove", (e) => {
    if (isDragging) handleDrag(e);
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  window.addEventListener("touchend", () => {
    isDragging = false;
  });

  document.addEventListener("contextmenu", function (e) {
    if (e.target.closest("li")) {
      Object.keys(playlists).forEach((name) => {
        if (name !== currentPlaylistName) {
        }
      });
    }
  });

  function enableMarquee(element) {
    const container = document.createElement("span");
    container.className = "marquee-container";
    const marquee = document.createElement("span");
    marquee.className = "marquee";
    marquee.textContent = element.textContent;
    container.appendChild(marquee);
    element.innerHTML = "";
    element.appendChild(container);
  }

  function checkOverflow() {
    const title = document.querySelector(".song-title");
    const artist = document.querySelector(".artist-name");

    [title, artist].forEach((element) => {
      if (element.scrollWidth > element.offsetWidth) {
        if (!element.querySelector(".marquee-container")) {
          enableMarquee(element);
        }
      } else {
        const container = element.querySelector(".marquee-container");
        if (container) {
          element.textContent = container.querySelector(".marquee").textContent;
        }
      }
    });
  }

  function openEditPlaylistModal(playlistName) {
    const modal = document.getElementById("edit-playlist-modal");
    const nameInput = document.getElementById("edit-playlist-name");
    const imageInput = document.getElementById("edit-playlist-image");
    const previewImg = document.getElementById("playlist-image-preview");

    nameInput.value = playlistName;
    previewImg.style.display = "none";

    // Show existing image if available
    if (playlistMeta[playlistName] && playlistMeta[playlistName].image) {
      previewImg.src = playlistMeta[playlistName].image;
      previewImg.style.display = "block";
    }

    imageInput.value = "";
    modal.style.display = "block";

    // Handle image preview
    imageInput.onchange = function () {
      if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImg.src = e.target.result;
          previewImg.style.display = "block";
        };
        reader.readAsDataURL(imageInput.files[0]);
      }
    };

    // Save changes
    document.getElementById("edit-playlist-form").onsubmit = function (e) {
      e.preventDefault();
      const newName = nameInput.value.trim();
      if (!newName) return;

      // Update playlist name if changed
      if (newName !== playlistName && !playlists[newName]) {
        playlists[newName] = playlists[playlistName];
        delete playlists[playlistName];
        playlistMeta[newName] = playlistMeta[playlistName] || {};
        delete playlistMeta[playlistName];
        if (currentPlaylistName === playlistName) {
          currentPlaylistName = newName;
        }
      }

      if (previewImg.src && previewImg.style.display === "block") {
        playlistMeta[newName] = playlistMeta[newName] || {};
        playlistMeta[newName].image = previewImg.src;
      }

      playlistMeta[newName] = playlistMeta[newName] || {};
      playlistMeta[newName].name = newName;

      modal.style.display = "none";
      updatePlaylistUI && updatePlaylistUI();
    };
  }

  document.getElementById("make-playlist").addEventListener("click", () => {
    openEditPlaylistModal("");
    const nameInput = document.getElementById("edit-playlist-name");
    const imageInput = document.getElementById("edit-playlist-image");
    const previewImg = document.getElementById("playlist-image-preview");
    nameInput.value = "";
    imageInput.value = "";
    previewImg.style.display = "none";

    // Overwrite the submit handler for creation
    document.getElementById("edit-playlist-form").onsubmit = function (e) {
      e.preventDefault();
      const newName = nameInput.value.trim();
      if (!newName || playlists[newName]) return;
      playlists[newName] = [];
      playlistMeta[newName] = playlistMeta[newName] || {};
      playlistMeta[newName].name = newName;
      if (previewImg.src && previewImg.style.display === "block") {
        playlistMeta[newName].image = previewImg.src;
      }
      document.getElementById("edit-playlist-modal").style.display = "none";
      updatePlaylistUI && updatePlaylistUI();
    };
  });

  const switchModal = document.getElementById("playlist-switch-modal");
  const playlistListDiv = document.getElementById("playlist-list");
  document.getElementById("switch-playlist").addEventListener("click", () => {
    playlistListDiv.innerHTML = "";
    Object.keys(playlists).forEach((name) => {
      const btn = document.createElement("button");
      btn.textContent =
        name + (name === currentPlaylistName ? " (Current)" : "");
      btn.className = "playlist-option";
      btn.onclick = () => {
        switchToPlaylist(name);
        switchModal.style.display = "none";
      };
      playlistListDiv.appendChild(btn);
    });
    switchModal.style.display = "block";
  });
  document.getElementById("close-switch-modal").onclick = () => {
    switchModal.style.display = "none";
  };

  function updateSpeedDisplay() {
    document.getElementById("speed-value").textContent = `${pbs.value}x`;
    if (pbs.value == 1) {
      document.getElementById("speed-value").textContent = `1.0x`;
    }
    if (pbs.value == 2) {
      document.getElementById("speed-value").textContent = `2.0x`;
    }
  }

  function updateBassDisplay() {
    document.getElementById("bass-value").textContent = `${bb.value}dB`;
  }

  document.getElementById("close-edit-playlist-modal").onclick = function () {
    document.getElementById("edit-playlist-modal").style.display = "none";
  };

  // Event Listeners
  pbs.addEventListener("input", () => {
    updateSpeedDisplay();
    applyAudioSettings();
    savePlaybackSettings();
  });

  //rev.addEventListener('change', () => {
  // applyAudioSettings();
  // savePlaybackSettings();
  //});
  const switchPlaylistIcon = document.querySelector("#switch-playlist i");
  const makePlaylistIcon = document.querySelector("#make-playlist i");

  document.getElementById("toggle-visualizer").addEventListener("click", () => {
  toggleVisualizer();

  if (isVisualizerVisible) {
    navbar.style.backgroundColor = "black";
    document.body.style.overflow = "hidden";

    const settingsIcon = document.querySelector(".settings-button i");
    if (settingsIcon) {
      settingsIcon.style.setProperty("color", "white", "important");
    }
    if (switchPlaylistIcon) {
      switchPlaylistIcon.style.setProperty("color", "white", "important");
    }
    if (makePlaylistIcon) {
      makePlaylistIcon.style.setProperty("color", "white", "important");
    }
  } else { 
    navbar.style.backgroundColor = "";
    document.body.style.overflow = "";

    const settingsIcon = document.querySelector(".settings-button i");
    if (settingsIcon) {
      settingsIcon.style.color = "";
    }
    if (switchPlaylistIcon) {
      switchPlaylistIcon.style.color = "";
    }
    if (makePlaylistIcon) {
      makePlaylistIcon.style.color = "";
    }
  }
});

  window.addEventListener("resize", () => {
    if (isVisualizerVisible) {
      resizeVisualizer();
    }
  });

  audio.addEventListener("play", () => {
    if (isVisualizerVisible) {
      if (!analyser) {
        initVisualizer();
      }
    }
  });

  mono.addEventListener("change", () => {
    applyAudioSettings();
    savePlaybackSettings();
  });

  bb.addEventListener("input", () => {
    updateBassDisplay();
    applyAudioSettings();
    savePlaybackSettings();
  });

  function updateMidDisplay() {
    document.getElementById("mid-value").textContent = `${mb.value}dB`;
  }

  function updateTrebleDisplay() {
    document.getElementById("treble-value").textContent = `${tb.value}dB`;
  }

  mb.addEventListener("input", () => {
    updateMidDisplay();
    applyAudioSettings();
    savePlaybackSettings();
  });

  document.getElementById("switch-playlist").addEventListener("click", () => {
    updatePlaylistUI();
    switchModal.style.display = "block";
  });

  tb.addEventListener("input", () => {
    updateTrebleDisplay();
    applyAudioSettings();
    savePlaybackSettings();
  });

  vn.addEventListener("change", () => {
    savePlaybackSettings();
  });

  rpb.addEventListener("click", () => {
    pbs.value = 1;
    rev.checked = false;
    mono.checked = false;
    bb.value = 0;
    vn.value = "none";
    applyAudioSettings();
    savePlaybackSettings();
    updateSpeedDisplay();
    updateBassDisplay();
  });

  loadPlaybackSettings();

  audio.addEventListener("play", () => {
    if (!audioContext) initAudioContext();
  });

  document.addEventListener("keydown", function (e) {
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.id == "css-editor" ||
      e.target.id == "js-editor"
    )
      return;
    if (e.code === "Space") {
      e.preventDefault();
      play.click();
    }
    if (e.ctrlKey && e.code === "ArrowLeft") {
      e.preventDefault();
      playPrevious();
    }
    if (e.ctrlKey && e.code === "ArrowRight") {
      e.preventDefault();
      playNext();
    }
    if (e.ctrlKey && e.code === "ArrowUp") {
      e.preventDefault();
      audio.volume = Math.min(audio.volume + 0.1, 1);
    }
    if (e.ctrlKey && e.code === "ArrowDown") {
      e.preventDefault();
      audio.volume = Math.max(audio.volume - 0.1, 0);
    }
    if (e.shiftKey && e.code === "ArrowLeft") {
      e.preventDefault();
      if (!isNaN(audio.duration)) {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
        updateTimePopup(audio.currentTime / audio.duration);
      }
    }
    if (e.shiftKey && e.code === "ArrowRight") {
      e.preventDefault();
      if (!isNaN(audio.duration)) {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        updateTimePopup(audio.currentTime / audio.duration);
      }
    }
    if (e.ctrlKey && e.code === "KeyL") {
      e.preventDefault();
      l.click();
    }
    if (e.ctrlKey && e.code === "KeyS") {
      e.preventDefault();
      shuffle.click();
    }
  });

  window.addEventListener("load", checkOverflow);
  window.addEventListener("resize", checkOverflow);
  f.addEventListener("change", checkOverflow);
  audio.addEventListener("loadedmetadata", updateProgress);
  audio.addEventListener("loadedmetadata", checkOverflow);
  audio.addEventListener("timeupdate", updateProgress);
  if (play) {
    play.addEventListener("click", () => {
      isPlaying = !isPlaying;
      const playIcon = play.querySelector("i");
      playIcon.classList.toggle("fa-pause");
      playIcon.classList.toggle("fa-play");

      if (isPlaying) {
        audio.play();
        if (playlist[currentTrackIndex]) {
          document.title =
            playlist[currentTrackIndex].name +
            " - " +
            playlist[currentTrackIndex].artist;
        }
      } else {
        audio.pause();
        document.title = "SoundFlare";
      }
    });
  }
});
