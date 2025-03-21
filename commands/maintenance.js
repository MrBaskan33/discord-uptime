const Discord = require("discord.js")
const { JsonDatabase } = require("wio.db")
const db = new JsonDatabase({databasePath: "./bot/database.json"})
const settings = require("../settings.json")
const emojis = require("../bot/emojis.json")
const logs = require("../bot/logs.json")
const locales = {
  "tr": require("../locales/tr.json"),
  "en-US": require("../locales/en-US.json")
}
 
module.exports = {
  data: new Discord.SlashCommandBuilder()    
    .setName("maintenance")
    .setNameLocalizations({
      "tr": "bakım",
    })
    .setDescription("Maintenance system.")
    .setDescriptionLocalizations({
      "tr": "Bakım sistemi.",
    })
    .setDMPermission(false)
    .addSubcommand((command) =>
      command
        .setName('open')
        .setNameLocalizations({
          "tr": "aç",
        })
        .setDescription('You turn on maintenance mode.')
        .setDescriptionLocalizations({
          "tr": "Bakım modunu açarsınız.",
        })
        .addStringOption(option =>
          option
            .setName('reason')
            .setNameLocalizations({
              "tr": "sebep",
            })
            .setDescription('Reason for taking it into maintenance.')
            .setDescriptionLocalizations({
              "tr": "Bakıma alma sebebi.",
            })
            .setRequired(false)))
    .addSubcommand((command) =>
      command
        .setName('close')
        .setNameLocalizations({
          "tr": "kapat",
        })
        .setDescription('You turn off maintenance mode.')
        .setDescriptionLocalizations({
          "tr": "Bakım modunu kapatırsınız.",
        })),
        
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
      case "open": {
        
        const reason = interaction.options.getString('reason') || `No reason`
        const maintenance = db.fetch(`maintenance`) 
        
        if(maintenance) {
          const thereMaintenance = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["there-maintenance"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [thereMaintenance]})
        }
        
        db.set(`maintenance`, true)
        db.set(`maintenanceTime`, Math.floor(Date.now() / 1000))
        
        const openLog = new Discord.EmbedBuilder()
          .setColor("Red")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`> **Bot bakıma alındı.**`)
          .addFields(
            {
              name: `Yetkili bilgileri`,
              value: `- **${interaction.user.username}** \`( ${interaction.user.id} )\``
            },
            {
              name: `Bakım açılma sebebi`,
              value: `- \`${reason}\``
            })
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        await client.channels.cache.get(logs.maintenanceLog).send({embeds: [openLog]})
        
        const maintenanceOpen = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["maintenance-open"].replace(/\{reason}/g, reason)}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [maintenanceOpen]})
        
      }
      break
      case "close": {
        
        const reason = interaction.options.getString('reason') || `No reason`
        const maintenance = db.fetch(`maintenance`) 
        
        if(!maintenance) {
          const noMaintenance = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["no-maintenance"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [noMaintenance]})
        }
        
        const closeLog = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`> **Bot bakımdan çıkartıldı.**`)
          .addFields(
            {
              name: `Yetkili bilgileri`,
              value: `- **${interaction.user.username}** \`( ${interaction.user.id} )\``
            },
            {
              name: `Bakım açılma zamanı`,
              value: `- <t:${db.fetch(`maintenanceTime`)}:f>`
            })
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        await client.channels.cache.get(logs.maintenanceLog).send({embeds: [closeLog]})
        
        db.delete(`maintenance`)
        db.delete(`maintenanceTime`)
        
        const maintenanceClose = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["maintenance-close"]}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [maintenanceClose]})
        
      }
      break
    }
    
  }
}
