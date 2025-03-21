const Discord = require("discord.js")
const { JsonDatabase } = require("wio.db")
const db = new JsonDatabase({databasePath: `./bot/database.json`})
const settings = require("../settings.json")
const emojis = require("../bot/emojis.json")
const logs = require("../bot/logs.json")
const locales = {
  "tr": require("../locales/tr.json")
}
 
module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    
    if(Math.floor(Date.now() / 1000) < 1725138009) {
      const badges = db.fetch(`${interaction.user.id}.badges`) || []
      if(!badges.includes(`${emojis["earlyaccess"]} \`[ Erken erişim ]\``)) db.push(`${interaction.user.id}.badges`, `${emojis["earlyaccess"]} \`[ Erken erişim ]\``)
    }
              
    let client = interaction.client
    const command = client.commands.get(interaction.commandName)
    if(!command) return
    
    const blacklists = db.fetch(`blacklists`) || []
    const maintenance = db.fetch(`maintenance`) 
    const maintenanceTime = db.fetch(`maintenanceTime`) 
    
    const buttons = new Discord.ActionRowBuilder()
      .addComponents(new Discord.ButtonBuilder()        
        .setURL(`https://discord.gg/Mr8Dp2Bwk2`)
        .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["support-server"])
        .setStyle("Link"))
    
    if(blacklists.includes(interaction.user.id)) {
      const yourBlacklist = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["your-blacklist"])
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      if(!settings.owners.includes(interaction.user.id)) return await interaction.reply({embeds: [yourBlacklist], components: [buttons]})
    }
    
    if(maintenance) {
      const maintenanceOpen = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["maintenance"].replace(/\{time}/, maintenanceTime))
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      if(!settings.owners.includes(interaction.user.id)) return await interaction.reply({embeds: [maintenanceOpen], components: [buttons]})
    }
    
    const commandLog = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
      .addFields(
        {
          name: `Komutu kullanan`,
          value: `- **${interaction.user.username}** \`(${interaction.user.id})\``
        },
        {
          name: `Kullanılan sunucu`,
          value: `- **${interaction.guild.name}** \`(${interaction.guild.id})\``
        },
        {
          name: `Kullanılan komut`,
          value: `- **${command.data.name}**`
        })
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    await client.channels.cache.get(logs.commandLog).send({embeds: [commandLog]})
    
    try {
      command.execute(client, interaction)
    } catch (error) {
      console.error(error)
    }
    
  }
}
