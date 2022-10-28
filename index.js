const {
  createAudioPlayer,
  joinVoiceChannel,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const { Client, GatewayIntentBits } = require("discord.js");
const ytdl = require("ytdl-core");
const fs = require("fs");
require("dotenv").config();
const { join } = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildIntegrations,
  ],
});
let playerStatus = false;
const player = createAudioPlayer();

player.on(AudioPlayerStatus.Playing, () => {
  playerStatus = true;
});
const playSong = (songname) => {
  playerStatus = true;
  const resource = createAudioResource(
    join(__dirname, "songs", "pisnyary", songname)
  );
  player.play(resource);
};

client.once("ready", () => {
  console.log("ready");
});
let queue = {};

try {
  client.on("voiceStateUpdate", (oldState, newState) => {
    if (newState.member.user.bot || playerStatus) return;
    if (oldState.channelId === null) {
      const isPetuch = Boolean(
        newState.member.roles.cache
          .map((role) => role.name)
          .filter((role) => role === "Петушатник").length
      );
      const songName = isPetuch ? "avrora.mp3" : "podmojsa.mp3";
      const connection = joinVoiceChannel({
        channelId: newState.member.voice.channelId,
        guildId: newState.member.guild.id,
        adapterCreator: newState.member.guild.voiceAdapterCreator,
      });
      const resource = createAudioResource(join(__dirname, "songs", songName));
      player.play(resource);
      const subscription = connection.subscribe(player);
      player.on(AudioPlayerStatus.Idle, () => {
        try {
          subscription && subscription.connection.destroy();
        } catch (e) {
          console.log(e);
        }
      });
    } else {
      return;
    }
  });
  const sendMessage = (message, text) => {
    message.reply(text).then((msg) => {
      setTimeout(() => msg.delete(), 20000);
    });
  };

  client.on("messageCreate", async (message) => {
    if (message.member.user.bot) return;
    if (!message.content.startsWith("!")) return;

    const command = message.content.split("!")[1].split(" ")[0];

    if (message.content === "!") {
      message.reply(
        `Доступні команди:\n!play\n!stop\n!skip <номер> скіпає певну кількість треків\n!p показує список хітів піснярів\n!p <номер> включає трек під номером\n!pr включає рандомний трек піснярів`
      );
      return;
    }

    if (!message.member.voice.channelId) {
      sendMessage(message, "Зайди у войс");
      return;
    }
    const commandsPath = join(__dirname, "commands");
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    const commandFileName = commandFiles.find(
      (cmd) => cmd.split(".")[0] === command
    );

    if (!commandFileName) {
      sendMessage(message, "Такої команди не розумію");
      return;
    } else {
      const cmd = require(join(commandsPath, commandFileName));
      cmd.run(client, message, player, queue, playSong, sendMessage);
      return;
    }
  });

  client.login(process.env.TOKEN);
} catch (e) {
  console.log(e);
}
