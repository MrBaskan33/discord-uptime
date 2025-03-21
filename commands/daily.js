const Discord = require("discord.js")
const { JsonDatabase } = require("wio.db")
const db = new JsonDatabase({databasePath: "./bot/database.json"})
const settings = require("../settings.json")
const emojis = require("../bot/emojis.json")
const locales = {
  "tr": require("../locales/tr.json"),
  "en-US": require("../locales/en-US.json")
}
 
module.exports = {
  data: new Discord.SlashCommandBuilder()    
    .setName("daily")
    .setNameLocalizations({
      "tr": "günlük",
    })
    .setDescription("Daily coin.")
    .setDescriptionLocalizations({
      "tr": "Günlük para.",
    })
    .setDMPermission(false),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
 
    const lastClaimTime = db.fetch(`${interaction.user.id}.lastDailyClaim`)
    const cooldownDuration = 24 * 60 * 60 * 1000
    const currentTime = Date.now()
    const remainingCooldown = Math.max(0, cooldownDuration - (currentTime - lastClaimTime))

    if(remainingCooldown > 0) {
      const remainingHours = Math.floor(remainingCooldown / (60 * 60 * 1000))
      const remainingMinutes = Math.floor((remainingCooldown % (60 * 60 * 1000)) / (60 * 1000))

      const claimed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["daily-claimed"].replace(/\{hours}/, remainingHours).replace(/\{minutes}/g, remainingMinutes)}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [claimed]})
    }
  
    if(currentTime - lastClaimTime < 6 * 60 * 60 * 1000) {
      const remainingHours = Math.floor(remainingCooldown / (60 * 60 * 1000))
      const remainingMinutes = Math.floor((remainingCooldown % (60 * 60 * 1000)) / (60 * 1000))

      const claimed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["daily-claimed"].replace(/\{hours}/, remainingHours).replace(/\{minutes}/g, remainingMinutes)}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [claimed]})
    }
    
    const minCoin = 1
    const maxCoin = 3
    const dailyReward = Math.floor(Math.random() * (maxCoin - minCoin + 1)) + minCoin

    db.add(`${interaction.user.id}.balance`, dailyReward)
    db.set(`${interaction.user.id}.lastDailyClaim`, currentTime)
    
    const claim = new Discord.EmbedBuilder()
      .setColor("Green")
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
      .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["daily-claim"].replace(/\{coin}/, dailyReward)}`)
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    return await interaction.followUp({embeds: [claim]})
    
  }
}
