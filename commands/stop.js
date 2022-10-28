module.exports = {
  helpName: "stop",
  run: (client, message, player, queue, playSong) => {
    queue[message.guild.id] = [];
    player.stop();
  },
};
