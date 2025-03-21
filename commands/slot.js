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
    .setName("slot")
    .setNameLocalizations({
      "tr": "slot",
    })
    .setDescription("Play a slot.")
    .setDescriptionLocalizations({
      "tr": "Slot oynarsınız.",
    })
    .setDMPermission(false)
    .addNumberOption(option =>
      option
        .setName('amount')
        .setNameLocalizations({
          "tr": "miktar",
        })
        .setDescription('Amount to bet.')
        .setDescriptionLocalizations({
          "tr": "Oynanacak miktar.",
        })
        .setRequired(true)),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    const amount = interaction.options.getNumber('amount')
    const balance = db.fetch(`${interaction.user.id}.balance`) || 0
     
    if(balance < amount) {
      const notCash = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["not-balance"]}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [notCash]})
    }
    
    if(amount <= 0) {
      const notCount = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["not-count"]}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [notCount]})
    }
    
    if(amount > 50) {
      const notCount = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["most-count"]}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [notCount]})
    }
    
    const lucks = [emojis["hearth"], emojis["star"], emojis["thunderbolt"]]

    var luck1 = lucks[Math.floor(Math.random() * lucks.length)]
    var luck2 = lucks[Math.floor(Math.random() * lucks.length)]
    var luck3 = lucks[Math.floor(Math.random() * lucks.length)]
      
    db.substract(`${interaction.user.id}.balance`, amount)
    
    const slotwait = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL()}) 
      .setDescription(`${emojis["slotgif"]} | ${emojis["slotgif"]} | ${emojis["slotgif"]}`)
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    await interaction.followUp({embeds: [slotwait]})
    
    await wait(3000)
    const slotwait2 = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL()}) 
      .setDescription(`${luck1} | ${emojis["slotgif"]} | ${emojis["slotgif"]}`)
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    await interaction.editReply({embeds: [slotwait2]})
    
    await wait(3000)
    const slotwait3 = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL()}) 
      .setDescription(`${luck1} | ${luck2} | ${emojis["slotgif"]}`)
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    await interaction.editReply({embeds: [slotwait3]})
    
    await wait(3000)
    const slotwait4 = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL()}) 
      .setDescription(`${luck1} | ${luck2} | ${luck3}`)
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    await interaction.editReply({embeds: [slotwait4]})
    
    if(luck1 === luck2 === luck3) {
      db.add(`${interaction.user.id}.balance`, amount * 3)
      
      const slotWin = new Discord.EmbedBuilder()
        .setColor("Green")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["slot-win"].replace(/\{amount}/g, amount * 3).replace(/\{luck1 luck2 luck3}/, luck1 + "   " + luck2 + "   " + luck3)}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [slotWin]})
    } else {
      const slotLoss = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["slot-loss"].replace(/\{luck1 luck2 luck3}/, luck1 + "   " + luck2 + "   " + luck3)}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [slotLoss]})
    }
    
  }
}
