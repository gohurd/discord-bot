const { createAudioPlayer, joinVoiceChannel, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const { Client, GatewayIntentBits } = require("discord.js");
const ytdl = require("ytdl-core")
const fs=require("fs");
require('dotenv').config()
const {join}=require("path")
const client=new Client({intents:[
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildIntegrations,
]})
let playerStatus=false
const player=createAudioPlayer()

player.on(AudioPlayerStatus.Playing,()=>{
    playerStatus=true
})

player.on(AudioPlayerStatus.Idle,()=>{
    playerStatus=false
})

client.once('ready', () => {
	console.log('Ready!');
});


client.on("voiceStateUpdate",(oldState,newState)=>{
    if(newState.member.user.bot)return
    if(oldState.channelId===null){
        const isPetuch=Boolean(newState.member.roles.cache.map(role=>role.name).filter(role=>role==="Петушатник").length)
      
        const songName=
        isPetuch
        ?
        "avrora.mp3"
        :
        "podmojsa.mp3"
        const connection = joinVoiceChannel({
            channelId: newState.member.voice.channelId ,
            guildId: newState.member.guild.id,
            adapterCreator:newState.member.guild.voiceAdapterCreator
        });
        const resource=createAudioResource(join(__dirname,"songs", songName))
        player.play(resource)
        connection.subscribe(player)
        player.on(AudioPlayerStatus.Idle,()=>{
            try{
                connection&&connection.destroy()
                }catch(e){
                    console.log(e);
                }
        })
    }else if(newState.channelId===null){
        const connection=joinVoiceChannel({
            channelId: oldState.member.voice.channelId ,
            guildId: oldState.member.guild.id,
            adapterCreator:oldState.member.guild.voiceAdapterCreator
        });
        const resource=createAudioResource(join(__dirname,"songs","poplil.mp3"))
        player.play(resource)
        connection&&connection.subscribe(player)
        player.on(AudioPlayerStatus.Idle,()=>{
            try{
                connection&&connection.destroy()
                }catch(e){
                    console.log(e);
                }
        } )
    }else{
        if(!newState.member.voice.selfMute)return;
        const connection=joinVoiceChannel({
            channelId: oldState.member.voice.channelId ,
            guildId: oldState.member.guild.id,
            adapterCreator:oldState.member.guild.voiceAdapterCreator
        });
        const resource=createAudioResource(join(__dirname,"songs","gazom.mp3"))
        player.play(resource)
        connection&&connection.subscribe(player)
        player.on(AudioPlayerStatus.Idle,()=>{
            try{
                connection&&connection.destroy()
                }catch(e){
                    console.log(e);
                }
        } )
    }
})

client.on("messageCreate",async (message)=>{
    if(message.member.user.bot)return;
    if(!message.content.startsWith("!"))return;

    const command=message.content.split("!")[1].split(" ")[0]
    const url=message.content.split("!")[1].split(" ")[1]
    if(message.content==="!"){
       return message.reply(`
        Доступні команди:
        !play
        !stop
        !pisnyary`)
    }
    if(message.content.split("!")[1].split(" ")[0]==="play"){
    if(!message.content.split("!")[1].split(" ")[1])return message.reply("Де ссилка курва?")
        const validate=await ytdl.validateURL(url)
        if(!validate)return message.reply("Хуйова ссилка дружочек")
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channelId,
            guildId: message.guildId,
            adapterCreator: message.guild.voiceAdapterCreator,
        });
        const stream=ytdl(url,{filter:"audioandvideo"})
        const resource=createAudioResource(stream)
        player.play(resource)
        connection.subscribe(player)
        player.on(AudioPlayerStatus.Idle,()=>{
            try{
            connection&&connection.destroy()
            }catch(e){
                console.log(e);
            }
        })
    }else if(command==="stop"){
        player.stop()
    }else if(command==="pisnyary"){
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channelId,
            guildId: message.guildId,
            adapterCreator: message.guild.voiceAdapterCreator,
        });
        const songs=[
            "01.Нежность.mp3",
            "02.Серенада.mp3",
            "03.Бутро утерное.mp3",
            "04.Электросталь.mp3",
            "05.Тёща.mp3",
            "06.Сдают нервы.mp3",
            "07.Щитуация SOS.mp3",
            "08.Все тёлки суки.mp3",
            "13.Рыжее пятно.mp3",
            "14.Аутро.mp3"
        ]
        const songname=songs[Math.floor( Math.random()*songs.length)]
        const resource=createAudioResource(join(__dirname,"songs","pisnyary",songname))
        player.play(resource)
        connection.subscribe(player)
        player.on(AudioPlayerStatus.Idle,()=>{
            try{
            connection&&connection.destroy()
            }catch(e){
                console.log(e);
            }
        })

    }else{
        message.reply("Такої команди не розумію")
    }
    
  
})








client.login(process.env.TOKEN)