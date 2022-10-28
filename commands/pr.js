const { joinVoiceChannel, AudioPlayerStatus } = require("@discordjs/voice");
const fs = require("fs");
const { join } = require("path");

module.exports = {
  helpName: "pr",
  run: (client, message, player, queue, playSong) => {
    const songs = fs.readdirSync(join(__dirname, "..", "songs", "pisnyary"));
    queue[message.guild.id] = [
      ...(queue[message.guild.id] ?? []),
      ...songs.sort(function () {
        return Math.random() - 0.5;
      }),
    ];
    const connection = joinVoiceChannel({
      channelId: message.member.voice.channelId,
      guildId: message.guildId,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
    connection.subscribe(player);
    message.reply("Зараз грає" + queue[message.guild.id][0]);

    playSong(queue[message.guild.id][0]);
    player.on(AudioPlayerStatus.Idle, () => {
      if (!queue[message.guild.id].length) {
        playerStatus = false;
        player.stop();
        connection && connection.destroy();
        return;
      } else {
        playSong(queue[message.guild.id][0]);
        message.reply("Зараз грає " + queue[message.guild.id][0]);
        queue[message.guild.id] = queue[message.guild.id].slice(1);
      }
    });
    queue[message.guild.id] = queue[message.guild.id].slice(1);
    return;
  },
};
