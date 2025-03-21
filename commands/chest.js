const Discord = require("discord.js")
const { JsonDatabase } = require("wio.db")
const db = new JsonDatabase({databasePath: "./bot/database.json"})
const settings = require("../settings.json")
const emojis = require("../bot/emojis.json")
const wait = require('node:timers/promises').setTimeout
const locales = {
  "tr": require("../locales/tr.json"),
  "en-US": require("../locales/en-US.json")
}
 
module.exports = {
  data: new Discord.SlashCommandBuilder()    
    .setName("chest")
    .setNameLocalizations({
      "tr": "kasa",
    })
    .setDescription("Open the chest.")
    .setDescriptionLocalizations({
      "tr": "Kasa açarsınız.",
    })
    .setDMPermission(false),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    const chest = db.fetch(`${interaction.user.id}.chest`) || 0
    const key = db.fetch(`${interaction.user.id}.key`) || 0
    
    if(chest <= 0) {
      const notChest = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["not-chest"]}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [notChest]})
    }
    
    if(key <= 0) {
      const notKey = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["not-key"]}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [notKey]})
    }
    
    const chestOpening = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
      .setDescription(`${emojis["wait"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["chest-opening"]}`)
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    await interaction.followUp({embeds: [chestOpening]})
    await wait(3000)
    
    var coins = ['15','16','17','18','19','20','21','22','23','24','25']
    var count = coins[Math.floor(Math.random() * coins.length)]
    
    db.add(`${interaction.user.id}.balance`, count)
    db.substract(`${interaction.user.id}.chest`, 1)
    db.substract(`${interaction.user.id}.key`, 1)
    
    const open = new Discord.EmbedBuilder()
      .setColor("Green")
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
      .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["chest-open"].replace(/\{count}/g, count)}`)
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    return await interaction.followUp({embeds: [open]})
      
  }
}
