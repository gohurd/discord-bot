module.exports = {
  helpName: "play",
  run: async (client, message, player, queue, playSong) => {
    const url = message.content.split("!")[1].split(" ")[1];
    if (!message.content.split("!")[1].split(" ")[1])
      return message.reply("Де ссилка курва?");
    const validate = await ytdl.validateURL(url);
    if (!validate) {
      sendMessage(message, "Хуйова ссилка дружочек");
      return;
    }
    const info = await ytdl.getInfo(url);
    const connection = joinVoiceChannel({
      channelId: message.member.voice.channelId,
      guildId: message.member.guild.id,
      adapterCreator: message.member.guild.voiceAdapterCreator,
    });
    const stream = await ytdl(url, { filter: "audioandvideo" });
    const resource = await createAudioResource(stream);
    player.play(resource);
    const subscription = connection.subscribe(player);
    player.on(AudioPlayerStatus.Idle, async () => {
      subscription.connection.destroy();
    });
  },
};
