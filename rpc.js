const rpc = require("discord-rich-presence")("1336133540211068978");

function updatePresence(title, artist, playing, position = 0) {
  const presence = {
    details: title,
    state: artist,
    largeImageKey: "soundflarelogo",
    instance: true,
  };

  if (playing) {
    presence.startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(position);
  }

  rpc.updatePresence(presence);
}

module.exports = { updatePresence };
