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
    .setName("stat")
    .setNameLocalizations({
      "tr": "istatistik",
    })
    .setDescription("Statysticts.")
    .setDescriptionLocalizations({
      "tr": "İstatistik bilgileri gösterir.",
    })
    .setDMPermission(false),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    
    const addLimit = db.fetch(`${interaction.user.id}.linkLimit`) || 0
    const linkAddLimit = addLimit + 2
    const allLinks = db.fetch(`links`) || []
    const links = db.fetch(`${interaction.user.id}.links`) || []
    const premiums = db.fetch(`premiums`) || []
    
    const statystics = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
      .addFields(
        {
          name: `${emojis["crown"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["developers"]}`,
          value: `-  ${emojis["mr"]} **[MrBaşkan](https://discord.com/users/873182701061021696)**`,
          inline: true
        },
        {
          name: `${emojis["js"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["library"]}`,
          value: `- **Discord.js v${Discord.version}**`,
          inline: true
        },
        {
          name: `${emojis["node"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["nodejs-version"]}`,
          value: `- **Node.js ${process.version}**`,
          inline: true
        },
        { 
          name: `${emojis["wait"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["uptime"]}`,
          value: `- <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`, 
          inline: true 
        },
        {
          name: `${emojis["server"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["guilds"]}`,
          value: `- **${client.guilds.cache.size}**`,
          inline: true
        },
        {
          name: `${emojis["users"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["users"]}`,
          value: `- **${client.users.cache.size}**`,
          inline: true
        },
        {
          name: `${emojis["all"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["all-links"]}`,
          value: `- **${allLinks.length}**`,
          inline: true
        },
        {
          name: `${emojis["link"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["your-links"]}`,
          value: `- **${links.length} / ${premiums.includes(interaction.user.id) ? `∞` : linkAddLimit}**`,
          inline: true
        },
        {
          name: `${emojis["diamond"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium-users"]}`,
          value: `- **${premiums.length}**`,
          inline: true
        })
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    return await interaction.followUp({embeds: [statystics]})
  }
}
