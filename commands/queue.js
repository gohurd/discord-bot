module.exports = {
  helpName: "queue",
  run: (client, message, player, queue, playSong) => {
    if (!(queue[message.guild.id] ?? []).length) {
      message.reply("Немає черги");
    } else {
      message.reply("Черга\n" + queue[message.guild.id].join("\n"));
    }
  },
};
