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
    .setName("invite")
    .setNameLocalizations({
      "tr": "davet",
    })
    .setDescription("Bot links.")
    .setDescriptionLocalizations({
      "tr": "Bot linkleri.",
    })
    .setDMPermission(false),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
  
    const buttons = new Discord.ActionRowBuilder()
      .addComponents(new Discord.ButtonBuilder()        
        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${settings.bot}&permissions=8&scope=bot%20applications.commands`)
        .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["add-server"])
        .setStyle("Link"))
      .addComponents(new Discord.ButtonBuilder()        
        .setURL(settings.supportServer)
        .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["support-server"])
        .setStyle("Link"))
      .addComponents(new Discord.ButtonBuilder()        
        .setURL(`https://top.gg/bot/${settings.bot}/vote`)
        .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["vote"])
        .setStyle("Link"))
        
    const links = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
      .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["invite-message"])
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    return await interaction.followUp({embeds: [links], components: [buttons]})
  }
}
