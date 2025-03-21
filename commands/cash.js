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
    .setName("cash")
    .setNameLocalizations({
      "tr": "para",
    })
    .setDescription("Cash system.")
    .setDescriptionLocalizations({
      "tr": "Para sistemi.",
    })
    .setDMPermission(false)
    .addSubcommand((command) =>
      command
        .setName('give')
        .setNameLocalizations({
          "tr": "ver",
        })
        .setDescription('You give money to a user.')
        .setDescriptionLocalizations({
          "tr": "Bir kullanıcıya para verirsiniz.",
        })
        .addUserOption(option =>
          option
            .setName('user')
            .setNameLocalizations({
              "tr": "kullanıcı",
            })
            .setDescription('User to be given money.')
            .setDescriptionLocalizations({
              "tr": "Para verilecek kullanıcı.",
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
        .setDescription('You receive money from a user.')
        .setDescriptionLocalizations({
          "tr": "Bir kullanıcıdan para alırsınız.",
        })
        .addUserOption(option =>
          option
            .setName('user')
            .setNameLocalizations({
              "tr": "kullanıcı",
            })
            .setDescription('User to receive money from.')
            .setDescriptionLocalizations({
              "tr": "Para alınacak kullanıcı.",
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
            .setRequired(true)))
    .addSubcommand((command) =>
      command
        .setName('top')
        .setNameLocalizations({
          "tr": "sıralama",
        })
        .setDescription('Users with the most money.')
        .setDescriptionLocalizations({
          "tr": "En çok parası bulunan kullanıcılar.",
         })),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    const option = interaction.options.getSubcommand()
    
    switch(option) {
      case "give": {
        
        if(!settings.owners.includes(interaction.user.id)) {
          const ownerOnly = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["owner-only"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [ownerOnly]})
        }
        
        const user = interaction.options.getUser('user')
        const amount = interaction.options.getNumber('amount')
        
        db.add(`${user.id}.balance`, amount)
        
        const added = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["cash-added"].replace(/\{user}/g, user.username).replace(/\{amount}/g, amount)}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [added]})
        
      }
      break
      case "receive": {
        
        if(!settings.owners.includes(interaction.user.id)) {
          const ownerOnly = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["owner-only"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [ownerOnly]})
        }
        
        const user = interaction.options.getUser('user')
        const amount = interaction.options.getNumber('amount')
        const balance = db.fetch(`${user.id}.balance`) || 0
        
        if(balance < amount) {
          const notCash = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["not-amount"].replace(/\{user}/g, user.username).replace(/\{amount}/g, amount)}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [notCash]})
        }
        
        db.substract(`${user.id}.balance`, amount)
        
        const removed = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["cash-removed"].replace(/\{user}/g, user.username).replace(/\{amount}/g, amount)}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [removed]})
        
      }
      break
      case "top": {
        
        let count = 1
        let end = client.users.cache
        .filter(x => (db.fetch(`${x.id}.balance`) || 0) && !settings.owners.includes(x.id))
        .sort((x,y) => (db.fetch(`${y.id}.balance`) || 0) - (db.fetch(`${x.id}.balance`)) || 0)
        .map((x) => {
          return `\`${count++}.\` ${x.username} - **${db.fetch(`${x.id}.balance`) || 0} LC**`
        })
      
        const top = new Discord.EmbedBuilder()
          .setColor("Blurple")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .addFields({
            name: `${(locales[interaction.locale] ?? locales[settings.defaultLang])["top"]}`,
            value: `${end.slice(0, 10).join("\n") || `${(locales[interaction.locale] ?? locales[settings.defaultLang])["not-top"]}`}`
          })
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [top]})
        
      }
      break
    }
    
  }
}
