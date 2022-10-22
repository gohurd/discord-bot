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

player.on(AudioPlayerStatus.Idle, () => {
  playerStatus = false;
});

client.once("ready", () => {
  console.log("Ready!");
});

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
    connection.subscribe(player);
    player.on(AudioPlayerStatus.Idle, () => {
      try {
        connection.disconnect();
      } catch (e) {
        console.log(e);
      }
    });
  } else if (newState.channelId === null) {
    // const connection = joinVoiceChannel({
    //   channelId: oldState.member.voice.channelId,
    //   guildId: oldState.member.guild.id,
    //   adapterCreator: oldState.member.guild.voiceAdapterCreator,
    // });
    // const resource = createAudioResource(
    //   join(__dirname, "songs", "poplil.mp3")
    // );
    // player.play(resource);
    // connection && connection.subscribe(player);
    // player.on(AudioPlayerStatus.Idle, () => {
    //   try {
    //     connection.disconnect();
    //   } catch (e) {
    //     console.log(e);
    //   }
    // });
  } else {
    // if (!newState.member.voice.selfMute) return;
    // const connection = joinVoiceChannel({
    //   channelId: oldState.member.voice.channelId,
    //   guildId: oldState.member.guild.id,
    //   adapterCreator: oldState.member.guild.voiceAdapterCreator,
    // });
    // const resource = createAudioResource(join(__dirname, "songs", "gazom.mp3"));
    // player.play(resource);
    // connection && connection.subscribe(player);
    // player.on(AudioPlayerStatus.Idle, () => {
    //   try {
    //     connection.disconnect();
    //   } catch (e) {
    //     console.log(e);
    //   }
    // });
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
  if (!message.member.voice.channelId) {
    sendMessage(message, "Зайди у войс");
    return;
  }
  if (message.content === "!") {
    message.reply(
      message,
      `Доступні команди:\n!play\n!stop\n!p показує список хітів піснярів\n!p <номер> включає трек під номером\n!pr включає рандомний трек піснярів`
    );
    return;
  }
  if (message.content.split("!")[1].split(" ")[0] === "play") {
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
    connection.subscribe(player);
    player.on(AudioPlayerStatus.Idle, async () => {
      connection.disconnect();
    });
  } else if (command === "stop") {
    player.stop();
  } else if (command === "p" || "pr") {
    const number = message.content.split("!")[1].split(" ")[1];
    const songs = fs.readdirSync(join(__dirname, "songs", "pisnyary"));
    if (command === "pr") {
      const connection = joinVoiceChannel({
        channelId: message.member.voice.channelId,
        guildId: message.guildId,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
      const songname = songs[Math.floor(Math.random() * songs.length)];
      const resource = createAudioResource(
        join(__dirname, "songs", "pisnyary", songname)
      );
      player.play(resource);
      connection.subscribe(player);
      playerStatus = true;
      sendMessage(message, `🍌🍌 Зараз грає\n${songname}`);
      player.on(AudioPlayerStatus.Idle, () => {
        playerStatus = false;
        connection.disconnect();
      });
      return;
    }
    if (number === undefined) {
      sendMessage(
        message,
        songs.reduce((prev, curr) => {
          return prev + curr + "\n";
        }, "")
      );
      return;
    }

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channelId,
      guildId: message.guildId,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
    const songname = songs[number - 1];
    if (!songname) {
      sendMessage(message, "Хуйовий номер");
      return;
    }
    const resource = createAudioResource(
      join(__dirname, "songs", "pisnyary", songname)
    );
    player.play(resource);
    connection.subscribe(player);
    sendMessage(message, `🍌🍌 Зараз грає\n${songname}`);
    playerStatus = true;
    player.on(AudioPlayerStatus.Idle, () => {
      playerStatus = false;
      connection.disconnect();
    });
  } else {
    sendMessage(message, "Такої команди не розумію");
  }
});

client.login(process.env.TOKEN);
