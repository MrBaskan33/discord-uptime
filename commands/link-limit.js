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
    .setName("link-limit")
    .setNameLocalizations({
      "tr": "link-limit",
    })
    .setDescription("Link limit system.")
    .setDescriptionLocalizations({
      "tr": "Link limit sistemi.",
    })
    .setDMPermission(false)
    .addSubcommand((command) =>
      command
        .setName('give')
        .setNameLocalizations({
          "tr": "ver",
        })
        .setDescription('You give link limit to a user.')
        .setDescriptionLocalizations({
          "tr": "Bir kullanıcıya link ekleme hakkı verirsiniz.",
        })
        .addUserOption(option =>
          option
            .setName('user')
            .setNameLocalizations({
              "tr": "kullanıcı",
            })
            .setDescription('User to be given link limit.')
            .setDescriptionLocalizations({
              "tr": "Link ekleme hakkı verilecek kullanıcı.",
            })
            .setRequired(true))
        .addNumberOption(option =>
          option
            .setName('amount')
            .setNameLocalizations({
              "tr": "miktar",
            })
            .setDescription('Amount to be given.')
            .setDescriptionLocalizations({
              "tr": "Verilecek miktar.",
            })
            .setRequired(true)))
    .addSubcommand((command) =>
      command
        .setName('receive')
        .setNameLocalizations({
          "tr": "al",
        })
        .setDescription('You receive link limit from a user.')
        .setDescriptionLocalizations({
          "tr": "Bir kullanıcıdan link ekleme hakkı alırsınız.",
        })
        .addUserOption(option =>
          option
            .setName('user')
            .setNameLocalizations({
              "tr": "kullanıcı",
            })
            .setDescription('User to receive link limit from.')
            .setDescriptionLocalizations({
              "tr": "Link ekleme hakkı alınacak kullanıcı.",
            })
            .setRequired(true))
        .addNumberOption(option =>
          option
            .setName('amount')
            .setNameLocalizations({
              "tr": "miktar",
            })
            .setDescription('Amount to be received.')
            .setDescriptionLocalizations({
              "tr": "Alınacak miktar.",
            })
            .setRequired(true))),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    const option = interaction.options.getSubcommand()
    
    if(!settings.owners.includes(interaction.user.id)) {
      const ownerOnly = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["owner-only"]}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [ownerOnly]})
    }
        
    switch(option) {
      case "give": {
        
        const user = interaction.options.getUser('user')
        const amount = interaction.options.getNumber('amount')
        
        db.add(`${user.id}.linkLimit`, amount)
        
        const added = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["limit-added"].replace(/\{user}/g, user.username).replace(/\{amount}/g, amount)}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [added]})
        
      }
      break
      case "receive": {
        
        const user = interaction.options.getUser('user')
        const amount = interaction.options.getNumber('amount')
        const linkLimit = db.fetch(`${user.id}.linkLimit`) || 0
        
        if(linkLimit < amount) {
          const notCash = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["not-limit"].replace(/\{user}/g, user.username).replace(/\{amount}/g, amount)}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [notCash]})
        }
        
        db.substract(`${user.id}.linkLimit`, amount)
        
        const removed = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["limit-removed"].replace(/\{user}/g, user.username).replace(/\{amount}/g, amount)}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [removed]})
        
      }
      break
    }
    
  }
}
