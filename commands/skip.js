module.exports = {
  helpName: "skip",
  run: (client, message, player, queue, playSong) => {
    const number = message.content.split("!")[1].split(" ")[1];
    if (number && queue[message.guild.id].length > number) {
      queue[message.guild.id] = queue[message.guild.id].slice(number - 1);
    } else {
      queue[message.guild.id] = [];
    }
    player.stop();
  },
};
