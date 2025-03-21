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
    .setName("profile")
    .setNameLocalizations({
      "tr": "profil",
    })
    .setDescription("See a profile.")
    .setDescriptionLocalizations({
      "tr": "Kullanıcı profilini görüntülersiniz.",
    })
    .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName('user')
        .setNameLocalizations({
          "tr": "kullanıcı",
        })
        .setDescription('User profile.')
        .setDescriptionLocalizations({
          "tr": "Profiline bakılacak kullanıcı.",
        })
        .setRequired(false)),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    const user = interaction.options.getUser('user') || interaction.user
    const addLimit = db.fetch(`${user.id}.linkLimit`) || 0
    const linkAddLimit = addLimit + 2
    const allLinks = db.fetch(`links`) || []
    const links = db.fetch(`${user.id}.links`) || []
    const premiums = db.fetch(`premiums`) || []
    const badges = db.fetch(`${user.id}.badges`) || []
    const balance = db.fetch(`${user.id}.balance`) || 0
    const chest = db.fetch(`${user.id}.chest`) || 0
    const key = db.fetch(`${user.id}.key`) || 0
      
    let badge
    if(badges.length <= 0) {
      if(user.bot) {
        badge = `${emojis["bot"]} \`[ Bot ]\``
      } else {
        badge = `${emojis["user"]} \`[ Kullanıcı ]\`` 
      }
    } else {
      if(user.bot) {
        badge = `${emojis["bot"]} \`[ Bot ]\`\n` + badges.map((b) => `- ${b}`).join("\n")
      } else {
        badge = `${emojis["user"]} \`[ Kullanıcı ]\`\n` + badges.map((b) => `- ${b}`).join("\n")
      }
    }
    
    let topUser = client.users.cache
    .filter(x => (db.fetch(`${x.id}.balance`) || 0) && !settings.owners.includes(x.id))
    .sort((x, y) => (db.fetch(`${y.id}.balance`) || 0) - (db.fetch(`${x.id}.balance`) || 0))
    .first()

    if(topUser) {
      if(topUser.id === user.id) {
        badge += `\n- ${emojis["moneyking"]} \`[ Sıralama 1.si ]\``
      }
    } 
    
    let pre
    if(premiums.includes(user.id)) {
      if(db.fetch(`${user.id}.premium`) === "∞") {
        pre = `${emojis["check"]} **| ∞**`
      } else {
        pre = `${emojis["check"]} **| <t:${db.fetch(`${user.id}.premium`)}:f>**`
      }
    } else {
      pre = `${emojis["cross"]}`
    }
    
    const profile = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
      .addFields(
        {
          name: (locales[interaction.locale] ?? locales[settings.defaultLang])["user-informations"],
          value: `- **${user.username}** \`(${user.id})\``
        }, 
        {
          name: (locales[interaction.locale] ?? locales[settings.defaultLang])["link-count"],
          value: `- **${links.length} / ${premiums.includes(user.id) ? `∞` : linkAddLimit}**`
        },
        {
          name: (locales[interaction.locale] ?? locales[settings.defaultLang])["premium-member"],
          value: `- ${pre}`
        },
        {
          name: (locales[interaction.locale] ?? locales[settings.defaultLang])["total-balance"],
          value: `- **${balance} LC**`
        },
        {
          name: `${emojis["chest"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["chest"]}`,
          value: `- **${chest}**`
        },
        {
          name: `${emojis["key"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["key"]}`,
          value: `- **${key}**`
        },
        {
          name: (locales[interaction.locale] ?? locales[settings.defaultLang])["badges"],
          value: `- ${badge}`
        })
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    return await interaction.followUp({embeds: [profile]})
  }
}
