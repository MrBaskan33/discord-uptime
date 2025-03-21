const Discord = require("discord.js")
const { JsonDatabase } = require("wio.db")
const db = new JsonDatabase({databasePath: "./bot/database.json"})
const settings = require("../settings.json")
const packageJson = require('../package.json')
const emojis = require("../bot/emojis.json")
const locales = {
  "tr": require("../locales/tr.json"),
  "en-US": require("../locales/en-US.json")
}

module.exports = {
  data: new Discord.SlashCommandBuilder()    
    .setName("balance")
    .setNameLocalizations({
      "tr": "bakiye",
    })
    .setDescription("See a balance.")
    .setDescriptionLocalizations({
      "tr": "Bakiye.",
    })
    .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName('user')
        .setNameLocalizations({
          "tr": "kullanıcı",
        })
        .setDescription('User balance.')
        .setDescriptionLocalizations({
          "tr": "Bakiyesine bakılacak kullanıcı.",
        })
        .setRequired(false)),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    const user = interaction.options.getUser('user') || interaction.user
    const balance = db.fetch(`${user.id}.balance`) || 0
    
    const bal = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
      .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["balance"].replace(/\{user\}/g, user.username).replace(/\{coin\}/g, balance))
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    return await interaction.followUp({embeds: [bal]})
  }
}
