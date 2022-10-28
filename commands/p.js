const {
  joinVoiceChannel,
  AudioPlayerStatus,
  createAudioResource,
} = require("@discordjs/voice");
const fs = require("fs");
const { join } = require("path");

module.exports = {
  helpName: "p",
  run: (client, message, player, queue, playSong, sendMessage) => {
    const number = message.content.split("!")[1].split(" ")[1];
    const songs = fs.readdirSync(join(__dirname, "..", "songs", "pisnyary"));
    if (number === undefined) {
      sendMessage(
        message,
        songs.reduce((prev, curr) => {
          return prev + curr + "\n";
        }, "")
      );
      return;
    }

    const songname = songs[number - 1];
    if (!songname) {
      sendMessage(message, "Хуйовий номер");
      return;
    }
    const resource = createAudioResource(
      join(__dirname, "..", "songs", "pisnyary", songname)
    );
    if (!queue[message.guild.id]) {
      queue[message.guild.id] = [];
    }
    if (queue[message.guild.id]?.length) {
      queue[message.guild.id].push(songname);
      return;
    }
    const connection = joinVoiceChannel({
      channelId: message.member.voice.channelId,
      guildId: message.guildId,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
    queue[message.guild.id].push(songname);
    player.play(resource);
    connection.subscribe(player);
    sendMessage(message, `🍌🍌 Зараз грає\n${songname}`);

    playerStatus = true;

    player.on(AudioPlayerStatus.Idle, () => {
      if (!queue[message.guild.id].length) {
        playerStatus = false;
        player.stop();
        connection && connection.destroy();
        return;
      } else {
        player.stop();
        playSong(queue[message.guild.id][0]);
        message.reply("Зараз грає " + queue[message.guild.id][0]);
        queue[message.guild.id] = queue[message.guild.id].slice(1);
      }
    });
  },
};
