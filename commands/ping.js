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
    .setName("ping")
    .setNameLocalizations({
      "tr": "ping",
    })
    .setDescription("Ping menu.")
    .setDescriptionLocalizations({
      "tr": "Ping değerlerini gösterir.",
    })
    .setDMPermission(false),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    
    let start = Date.now()
    const pingCalculated = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
      .setDescription(`${emojis["wait"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["ping-calculated"]}`)
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    await interaction.followUp({embeds: [pingCalculated]})
    let end = Date.now()
    await wait(3000)
    
    let ping = client.ws.ping
    
    let color
    if(ping < 50) color = `Green`
    if(ping >= 50 && ping < 100) color = `Yellow`
    if(ping >= 100 && ping < 500) color = `Red`
    if(ping >= 500) color = `Black`
    
    const pingMessage = new Discord.EmbedBuilder()
      .setColor(color)
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
      .addFields(
        {
          name: `${emojis["bot"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["bot-ping"]}`,
          value: `- **${ping}ms**`
        },
        {
          name: `${emojis["message"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["message-ping"]}`,
          value: `- **${end - start}ms**`
        })
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    return await interaction.editReply({embeds: [pingMessage]})
  }
}
