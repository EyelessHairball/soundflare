// Abandon hope all ye who enter here.

document.addEventListener("DOMContentLoaded", function () {
  const store = localStorage.getItem("editcontent");
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
  const s = document.getElementById("theme-css");
  const sb = document.getElementById("theme");
  const sb2 = document.querySelector('.settings-button');
  const sbd = document.querySelector('.settings-dropdown');
  const cssm = document.getElementById('css-modal');
  const csse = document.getElementById('css-editor');
  const acssb = document.getElementById('apply-css');
  const rcssb = document.getElementById('reset-css');
  const customStyle = document.createElement('style');
  customStyle.id = 'custom-css';
  if (tpref) {
    s.href = tpref;
  } else {
    s.href = "./dark.css"
  }
  document.head.appendChild(customStyle);
  csse.value = store;
  document.getElementById('custom-css').textContent = store;

  // dictionary


  sb2.addEventListener('click', () => {
    sbd.classList.toggle('show');
  });
  
  document.addEventListener('click', (e) => {
    if (!sb2.contains(e.target) && !sbd.contains(e.target)) {
      sbd.classList.remove('show');
    }
  });
  
  document.getElementById('custom-css-btn').addEventListener('click', () => {
    cssm.style.display = 'block';
    csse.textContent = document.getElementById('custom-css').textContent;
  });
  
  document.querySelector('.close').addEventListener('click', () => {
    cssm.style.display = 'none';
  });
  
  acssb.addEventListener('click', () => {
    document.getElementById('custom-css').textContent = csse.textContent;
    localStorage.setItem("editcontent", csse.innerHTML);
  });
  
  rcssb.addEventListener('click', () => {
    document.getElementById('custom-css').textContent = '';
    csse.textContent = '';
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

  if (isMobile()) {
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
  let originalPlaylistOrder = [];
  let shuffledOrder = [];
  let isPlaying = false;
  let isDragging = false;
  let isLooping = false;
  let isShuffled = false;
  const audio = new Audio("");

  function playNext() {
    if (playlist.length === 0) return;

    if (isShuffled) {
      currentTrackIndex = (currentTrackIndex + 1) % shuffledOrder.length;
      initializePlayer(playlist[shuffledOrder[currentTrackIndex]]);
    } else {
      currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
      initializePlayer(playlist[currentTrackIndex]);
    }
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
      albumHeader.style.backgroundColor = "#0e0e0e";
      albumHeader.textContent = album;
      q.appendChild(albumHeader);
  
      albums[album].forEach(({ track, index }) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${track.name} - ${track.artist}`;
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
      const fileArray = Array.from(files).sort((a, b) =>
        a.webkitRelativePath.localeCompare(b.webkitRelativePath)
      ); 
  
      const newTracks = await Promise.all(
        fileArray.map(async (file) => {
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
  
      playlist.push(...newTracks);
      updateq(); 
  
      if (playlist.length > 0 && currentTrackIndex === playlist.length - newTracks.length) {
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
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const color = `rgb(${r},${g},${b})`;
      if (colors[color]) {
        colors[color]++;
      } else {
        colors[color] = 1;
      }
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
    document.title = track.name;

    if (track.picture) {
      const base64String = arrayBufferToBase64(track.picture.data);
      const albumImage = new Image();
      albumImage.src = `data:${track.picture.format};base64,${base64String}`;

      albumImage.onload = function () {
        a.src = albumImage.src;
        extractDominantColors(albumImage, updateGradientColors); 
      };
    } else {
      a.src = "./noart.png";
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

  window.addEventListener("load", checkOverflow);
  window.addEventListener("resize", checkOverflow);
  f.addEventListener("change", checkOverflow);
  audio.addEventListener("loadedmetadata", updateProgress);
  audio.addEventListener("loadedmetadata", checkOverflow);
  audio.addEventListener("timeupdate", updateProgress);
  play.addEventListener("click", () => {
    isPlaying = !isPlaying;
    const playIcon = play.querySelector("i");
    playIcon.classList.toggle("fa-pause");
    playIcon.classList.toggle("fa-play");

    if (isPlaying) {
      audio.play();
      document.title = track.name;
    } else {
      audio.pause();
      document.title = "SoundFlare";
    }
  });
});
