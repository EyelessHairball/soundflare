// Abandon hope all ye who enter here.

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
    const cm = document.getElementById("console-modal");
    const ce = document.getElementById("console-editor");
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
    const navbar = document.getElementById('navbar');
    const s = document.getElementById("theme-css");
    const sb = document.getElementById("theme");
    const sb2 = document.querySelector('.settings-button');
    const sbd = document.querySelector('.settings-dropdown');
    const cssm = document.getElementById('css-modal');
    const jsm = document.getElementById('js-modal');
    const csse = document.getElementById('css-editor');
    const jse = document.getElementById('js-editor');
    const acssb = document.getElementById('apply-css');
    const rcssb = document.getElementById('reset-css');
    const ajsb = document.getElementById('apply-js');
    const rjsb = document.getElementById('reset-js');
    const customStyle = document.createElement('style');
    const customScript = document.createElement('script');
    const timePopup = document.querySelector('.time-popup');
    const currentTimeEl = timePopup.querySelector('.current-time');
    const remainingTimeEl = timePopup.querySelector('.remaining-time');
    const playbackModal = document.getElementById('playback-modal');
    const playbackSettingsBtn = document.getElementById('playback-settings-btn');
    const playbackSpeed = document.getElementById('playback-speed');
    const reverseAudio = document.getElementById('reverse-audio');
    const monoAudio = document.getElementById('mono-audio');
    const bassBoost = document.getElementById('bass-boost');
    const volumeNormalization = document.getElementById('volume-normalization');
    const resetPlayback = document.getElementById('reset-playback');
    const midBoost = document.getElementById('mid-boost');
    const trebleBoost = document.getElementById('treble-boost');
    const toggleMiniplayer = document.getElementById('toggle-miniplayer');
    
    console.stdlog = console.log.bind(console);
    console.logs = [];
    console.log = function(){
        console.logs.push(Array.from(arguments));
        console.stdlog.apply(console, arguments);
    }

    
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
    
    let popupTimeout;
    customScript.id = 'custom-js';
    customStyle.id = 'custom-css';
    if (tpref) {
      s.href = tpref;
    } else {
      s.href = "./dark.css"
    }
    document.head.appendChild(customStyle);
    csse.value = store;
    document.getElementById('custom-css').textContent = store;
    document.head.appendChild(customScript);
    jse.value = storesrc;
    document.getElementById('custom-js').textContent = storesrc;
    function loadError(oError) {
      oError.target.remove();
    }
    document.getElementById('custom-js').onerror = loadError;
    const width = window.innerWidth;
  
 
    function loadPlaybackSettings() {
      const settings = JSON.parse(localStorage.getItem('playbackSettings') || '{}');
      
      if (playbackSpeed) playbackSpeed.value = settings.speed || 1;
      if (reverseAudio) reverseAudio.checked = settings.reverse || false;
      if (monoAudio) monoAudio.checked = settings.mono || false;
      if (bassBoost) bassBoost.value = settings.bass || 0;
      if (volumeNormalization) volumeNormalization.value = settings.normalization || 'none';
      
      updateSpeedDisplay();
      updateBassDisplay();
      applyAudioSettings();
    }

    function savePlaybackSettings() {
      const settings = {
        speed: parseFloat(playbackSpeed.value),
        reverse: reverseAudio.checked,
        mono: monoAudio ? monoAudio.checked : false,
        bass: parseInt(bassBoost.value),
        normalization: volumeNormalization.value
      };
      
      localStorage.setItem('playbackSettings', JSON.stringify(settings));
    }

    function applyAudioSettings() {
      audio.playbackRate = playbackSpeed.value;
      if (reverseAudio && reverseAudio.checked) {
        audio.playbackRate = Math.abs(audio.playbackRate);
        audio.currentTime = audio.duration - audio.currentTime;
      } else {
        audio.playbackRate = Math.abs(audio.playbackRate);
      }
      if (monoAudio && monoAudio.checked) {
        audio.setAttribute('crossorigin', 'anonymous');
        if (source) source.channelCount = 1;
      } else {
        if (source) source.channelCount = 2;
      }  
      if (bassBoostNode && bassBoostNode.gain) {
        bassBoostNode.gain.value = bassBoost.value;
      }
      if (volumeNormalization && volumeNormalization.value !== 'none' && analyser && dataArray) {
        analyser.getByteTimeDomainData(dataArray);
        const normalizationType = volumeNormalization.value;
        if (normalizationType === 'peak') {
          const maxVolume = Math.max(...dataArray) / 255;
          gainNode.gain.value = maxVolume > 0 ? 1 / maxVolume : 1;
        } else if (normalizationType === 'rms') {
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
        midBoostNode.gain.value = midBoost.value;
      }
      if (trebleBoostNode && trebleBoostNode.gain) {
        trebleBoostNode.gain.value = trebleBoost.value;
      }
    }
    // dictionary


    function initAudioContext() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        
        bassBoostNode = audioContext.createBiquadFilter();
        bassBoostNode.type = 'lowshelf';
        bassBoostNode.frequency.value = 150;
    
        midBoostNode = audioContext.createBiquadFilter();
        midBoostNode.type = 'peaking';
        midBoostNode.frequency.value = 1000;
        midBoostNode.Q.value = 1;
    
        trebleBoostNode = audioContext.createBiquadFilter();
        trebleBoostNode.type = 'highshelf';
        trebleBoostNode.frequency.value = 3000;
        
        if (!mediaElementSource) {
          mediaElementSource = audioContext.createMediaElementSource(audio);
          mediaElementSource
            .connect(bassBoostNode)
            .connect(midBoostNode)
            .connect(trebleBoostNode)
            .connect(gainNode)
            .connect(audioContext.destination);
        }
      }
    }
    
    // Initialize trebleBoostNode if not already initialized
    if (!audioContext) {
      initAudioContext();
    }
    
    if (!trebleBoostNode) {
      trebleBoostNode = audioContext.createBiquadFilter();
      trebleBoostNode.type = 'highshelf';
      trebleBoostNode.frequency.value = 3000;
    }

    playbackSettingsBtn.addEventListener('click', () => {
      playbackModal.style.display = 'block';
      initAudioContext();
    });

    sb2.addEventListener('click', () => {
      sbd.classList.toggle('show');
    });
    
    document.addEventListener('click', (e) => {
      if (!sb2.contains(e.target) && !sbd.contains(e.target)) {
        sbd.classList.remove('show');
      }
    });
    document.getElementById('clear-cache').addEventListener('click', () => {
      if (window.confirm("Are you sure you want to clear the cache? This will remove all your settings and data.")) {
        localStorage.clear();
        location.reload();
      }
    });

    document.getElementById('toggle-miniplayer').addEventListener('click', () => {
      window.open('./index.html','Miniplayer','width=800,height=900');
    });

    document.getElementById('custom-css-btn').addEventListener('click', () => {
      cssm.style.display = 'block';
      csse.textContent = document.getElementById('custom-css').textContent;
    });


    document.getElementById('console').addEventListener('click', () => {
      cm.style.display = 'block';
      ce.textContent = console.logs.toString();
    });

    document.getElementById('custom-js-btn').addEventListener('click', () => {
      jsm.style.display = 'block';
      jse.textContent = document.getElementById('custom-js').textContent;
    });
    
    document.getElementById('close-css').addEventListener('click', () => {
      cssm.style.display = 'none';
    });
    
     document.getElementById('close-console').addEventListener('click', () => {
      cm.style.display = 'none';
    });

    document.getElementById('close-js').addEventListener('click', () => {
      jsm.style.display = 'none';
    });

    document.getElementById('close-pb').addEventListener('click', () => {
      playbackModal.style.display = 'none';
    });
    
    acssb.addEventListener('click', () => {
      document.getElementById('custom-css').textContent = csse.textContent;
      localStorage.setItem("editcontent", csse.innerHTML);
    });
    
    rcssb.addEventListener('click', () => {
      document.getElementById('custom-css').textContent = '';
      csse.textContent = '';
      localStorage.setItem("editcontent", '');
    });


    ajsb.addEventListener('click', () => {
      if (window.confirm("are you sure you want to apply? This will close the window and in turn remove your uploaded songs. Don't apply scripts you dont understand.", "I know what im doing.")){
        document.getElementById('custom-js').textContent = jse.textContent;
        localStorage.setItem("editcontentjs", jse.innerHTML);
        window.close();
      } else {
      }
    });
    
    rjsb.addEventListener('click', () => {
      document.getElementById('custom-js').textContent = '';
      jse.textContent = '';
      localStorage.setItem("editcontentjs", '');
    });
    
  
  function toggleTheme() {
    if (s.href.includes('light')) {
      s.href = './dark.css';
      sb.innerHTML = '<i class="fas fa-moon"></i> Theme';
      localStorage.setItem("localpref", "./dark.css");
    } else {
      s.href = 'light.css';
      localStorage.setItem("localpref", "./light.css");
      sb.innerHTML = '<i class="fas fa-sun"></i> Theme';
    }
  }
    
    sb.addEventListener('click', toggleTheme);
  
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
      q.querySelectorAll("li").forEach(li => li.style.width = "100%");
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
  
      log.addEventListener("click", debounce(function () {
        if (sidebar.style.display === "none" || sidebar.style.display === "") {
          sidebar.style.display = "flex";
        } else {
          sidebar.style.display = "none";
        }
      }, 100));
      }
  
    const progressRing = document.querySelector(".progress-ring-circle");
    const radius = progressRing.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRing.style.strokeDashoffset = circumference;
    let playlist = [];
    let currentTrackIndex = 0;
    // let originalPlaylistOrder = [];
    let shuffledOrder = [];
    let isPlaying = false;
    let isDragging = false;
    let isLooping = false;
    let isShuffled = false;
  
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

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
      navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
      navigator.mediaSession.setActionHandler('play', () => {
      if (!isPlaying) play.click();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
      if (isPlaying) play.click();
      });
    }
  
    volUp.addEventListener("click", () => {
      audio.volume = Math.min(audio.volume + 0.1, 1);
    });
  
    volDown.addEventListener("click", () => {
      audio.volume = Math.max(audio.volume - 0.1, 0);
    });
  
    function updateq() {
      q.innerHTML = "";
      let albums = {};
        playlist.forEach((track, index) => {
        const album = track.album || "Unknown Album";
        if (!albums[album]) {
          albums[album] = [];
        }
        albums[album].push({ track, index });
      });
        const sortedAlbums = Object.keys(albums).sort();
        sortedAlbums.forEach((album) => {
          const albumHeader = document.createElement("h3");
          albumHeader.textContent = album;
          q.appendChild(albumHeader);

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
            q.appendChild(listItem);
          });
        });
    }
  
    f.addEventListener("change", async function (e) {
      const files = e.target.files;
      if (files.length > 0) {
      // Only keep audio files
      const audioFiles = Array.from(files).filter(file =>
        file.type.startsWith("audio/")
      ).sort((a, b) =>
        a.webkitRelativePath.localeCompare(b.webkitRelativePath)
      );

      if (audioFiles.length === 0) return;

      const existingFiles = new Set(
        playlist.map(track => `${track.file.name}_${track.file.size}`)
      );

      const newTracks = await Promise.all(
        audioFiles.map(async (file) => {
        return new Promise((resolve) => {
          new jsmediatags.Reader(file)
          .setTagsToRead(["title", "artist", "album", "picture"])
          .read({
            onSuccess: (tag) => {
            const url = URL.createObjectURL(file);
            resolve({
              url: url,
              file: file,
              name: tag.tags.title || file.name.replace(/\.[^/.]+$/, ""), 
              artist: tag.tags.artist || "Unknown Artist",
              album: tag.tags.album || "Unknown Album",
              picture: tag.tags.picture,
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
              ),
              },
            });
            },
          });
        });
        })
      );

      const uniqueNewTracks = newTracks.filter(track => {
        const key = `${track.file.name}_${track.file.size}`;
        if (existingFiles.has(key)) {
        return false;
        }
        existingFiles.add(key);
        return true;
      });

      playlist.push(...uniqueNewTracks);
      updateq(); 

      if (playlist.length > 0 && currentTrackIndex === playlist.length - uniqueNewTracks.length) {
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
      const dominantColors = sortedColors.map((color) => color[0]);
  
      callback(dominantColors);
    }
  
    function updateGradientColors(dominantColors) {
      const gradient = document.getElementById("progressGradient");
      const stops = gradient.querySelectorAll("stop");
  
      if (dominantColors.length >= 2) {
        stops[0].setAttribute("stop-color", dominantColors[0]);
        stops[1].setAttribute("stop-color", dominantColors[1]);
      }
    }
  
    function initializePlayer(track) {
      audio.src = track.url;
      t.textContent = track.name;
      ar.textContent = track.artist;
      document.title = track.name + " - " + track.artist;

      let artwork = [];
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
        artwork = [
          { src: "./noart.png", sizes: "512x512", type: "image/png" }
        ];
      }

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: track.name,
          artist: track.artist,
          album: track.album || "",
          artwork: artwork  || "./noart.png"
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
    }
    
    function drawVisualizer() {
      if (!analyser || !isVisualizerVisible) return;
      
      requestAnimationFrame(drawVisualizer);
      
      analyser.getByteFrequencyData(dataArray);
      visualizerCtx.fillStyle = 'rgb(0, 0, 0)';
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
      
      const barCount = 32; 
      const spacing = 2;
      const totalSpacing = spacing * (barCount - 1);
      const barWidth = (visualizerCanvas.width - totalSpacing) / barCount;
      const barHeightStep = 10;
      const levels = Math.floor(visualizerCanvas.height / barHeightStep);
      const totalBarWidth = barCount * barWidth + (barCount - 1) * spacing;
      const offsetX = (visualizerCanvas.width - totalBarWidth) / 2;
      
      for (let i = 0; i < barCount; i++) {
        const logIndex = Math.floor(Math.pow(i / barCount, 2) * (dataArray.length - 1));
        
        let sum = 0;
        const avgRange = 2;
        for (let j = 0; j < avgRange; j++) {
          sum += dataArray[Math.min(logIndex + j, dataArray.length - 1)];
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
    
    function toggleVisualizer() {
      isVisualizerVisible = !isVisualizerVisible;
      visualizerCanvas.style.display = isVisualizerVisible ? 'block' : 'none';
      
      if (isVisualizerVisible) {
        initVisualizer();
      }
    }
    
  
    shuffle.addEventListener("click", () => {
      isShuffled = !isShuffled; 
      shuffle.classList.toggle("active", isShuffled);
      shuffle.querySelector("i").style.color = isShuffled
        ? "#1db954"
        : "#ffffff";
    
      if (isShuffled) {
        shuffledOrder = [...Array(playlist.length).keys()];
        for (let i = shuffledOrder.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOrder[i], shuffledOrder[j]] = [shuffledOrder[j], shuffledOrder[i]];
        }
      } else {
        shuffledOrder = [...Array(playlist.length).keys()]; 
      }
        initializePlayer(playlist[currentTrackIndex]);
    });
  
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
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    function updateTimePopup(progress) {
      if (!audio.duration) return;
      
      const currentTime = progress * audio.duration;
      const remainingTime = audio.duration - currentTime;
      
      currentTimeEl.textContent = formatTime(currentTime);
      remainingTimeEl.textContent = `-${formatTime(remainingTime)}`;
      
      timePopup.classList.add('show');
      clearTimeout(popupTimeout);
      popupTimeout = setTimeout(() => {
        timePopup.classList.remove('show');
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
      l.querySelector("i").style.color = isLooping
        ? "#1db954"
        : "#ffffff";
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
  

    function updateSpeedDisplay() {
      document.getElementById('speed-value').textContent = 
        `${playbackSpeed.value}x`;
      if (playbackSpeed.value == 1) {
        document.getElementById('speed-value').textContent = 
        `1.0x`;
      }
      if (playbackSpeed.value == 2) {
        document.getElementById('speed-value').textContent = 
        `2.0x`;
      }
    }
    
    function updateBassDisplay() {
      document.getElementById('bass-value').textContent = 
        `${bassBoost.value}dB`;
    }
    
    // Event Listeners
    playbackSpeed.addEventListener('input', () => {
      updateSpeedDisplay();
      applyAudioSettings();
      savePlaybackSettings();
    });
    
    //reverseAudio.addEventListener('change', () => {
     // applyAudioSettings();
     // savePlaybackSettings();
    //});
    document.getElementById('toggle-visualizer').addEventListener('click', () => {
      toggleVisualizer();
      if (isVisualizerVisible) {
        navbar.style.backgroundColor = 'black';
        document.body.style.overflow = 'hidden';
        const settingsIcon = document.querySelector('.settings-button i');
        if (settingsIcon) {
          settingsIcon.style.setProperty('color', 'white', 'important');
        }
      } else {
        navbar.style.backgroundColor = '';
        document.body.style.overflow = '';
        const settingsIcon = document.querySelector('.settings-button i');
        if (settingsIcon) {
          settingsIcon.style.color = '';
        }
      }
    });

    window.addEventListener('resize', () => {
      if (isVisualizerVisible) {
      resizeVisualizer();
      }
    });

    audio.addEventListener('play', () => {
      if (isVisualizerVisible) {
        if (!analyser) {
          initVisualizer();
        }
      }
    });

    monoAudio.addEventListener('change', () => {
      applyAudioSettings();
      savePlaybackSettings();
    });
    
    bassBoost.addEventListener('input', () => {
      updateBassDisplay();
      applyAudioSettings();
      savePlaybackSettings();
    });

    function updateMidDisplay() {
      document.getElementById('mid-value').textContent = 
      `${midBoost.value}dB`;
    }

    function updateTrebleDisplay() {
      document.getElementById('treble-value').textContent = 
      `${trebleBoost.value}dB`;
    }

    midBoost.addEventListener('input', () => {
      updateMidDisplay();
      applyAudioSettings();
      savePlaybackSettings();
    });

    trebleBoost.addEventListener('input', () => {
      updateTrebleDisplay();
      applyAudioSettings();
      savePlaybackSettings();
    });
    
    volumeNormalization.addEventListener('change', () => {
      savePlaybackSettings();
    });
    
    resetPlayback.addEventListener('click', () => {
      playbackSpeed.value = 1;
      reverseAudio.checked = false;
      monoAudio.checked = false;
      bassBoost.value = 0;
      volumeNormalization.value = 'none';
      applyAudioSettings();
      savePlaybackSettings();
      updateSpeedDisplay();
      updateBassDisplay();
    });

    loadPlaybackSettings();

    audio.addEventListener('play', () => {
      if (!audioContext) initAudioContext();
    });
    
document.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.id == "css-editor" || e.target.id == "js-editor") return;
  if (e.code === 'Space') {
    e.preventDefault();
    play.click();
  }
    if (e.ctrlKey && e.code === 'ArrowLeft') {
    e.preventDefault();
    playPrevious();
  }
  if (e.ctrlKey && e.code === 'ArrowRight') {
    e.preventDefault();
    playNext();
  }
  if (e.ctrlKey && e.code === 'ArrowUp') {
    e.preventDefault();
    audio.volume = Math.min(audio.volume + 0.1, 1);
  }
  if (e.ctrlKey && e.code === 'ArrowDown') {
    e.preventDefault();
    audio.volume = Math.max(audio.volume - 0.1, 0);
  }
  if (e.shiftKey && e.code === 'ArrowLeft') {
    e.preventDefault();
    if (!isNaN(audio.duration)) {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
      updateTimePopup(audio.currentTime / audio.duration);
    }
  }
  if (e.shiftKey && e.code === 'ArrowRight') {
    e.preventDefault();
    if (!isNaN(audio.duration)) {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
      updateTimePopup(audio.currentTime / audio.duration);
    }
  }
  if (e.ctrlKey && e.code === 'KeyL') {
    e.preventDefault();
    l.click();
  }
  if (e.ctrlKey && e.code === 'KeyS') {
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
            document.title = playlist[currentTrackIndex].name + " - " + playlist[currentTrackIndex].artist;
          }
        } else {
          audio.pause();
          document.title = "SoundFlare";
        }
      });
    }    
  });
