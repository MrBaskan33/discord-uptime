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
    .setName("blacklist")
    .setNameLocalizations({
      "tr": "karaliste",
    })
    .setDescription("Blacklist system.")
    .setDescriptionLocalizations({
      "tr": "Karaliste sistemi.",
    })
    .setDMPermission(false)
    .addSubcommand((command) =>
      command
        .setName('add')
        .setNameLocalizations({
          "tr": "ekle",
        })
        .setDescription('Adds the user to the blacklist.')
        .setDescriptionLocalizations({
          "tr": "Bir kullanıcıyı karalisteye ekler.",
        })
        .addUserOption(option =>
          option
            .setName('user')
            .setNameLocalizations({
              "tr": "kullanıcı",
            })
            .setDescription('The user to be added to the blacklist.')
            .setDescriptionLocalizations({
              "tr": "Karalisteye eklenecek kullanıcı.",
            })
            .setRequired(true))
        .addStringOption(option =>
          option
            .setName('reason')
            .setNameLocalizations({
              "tr": "sebep",
            })
            .setDescription('Reason for being added to the blacklist.')
            .setDescriptionLocalizations({
              "tr": "Karalisteye eklenme sebebi.",
            })
            .setRequired(false)))
    .addSubcommand((command) =>
      command
        .setName('remove')
        .setNameLocalizations({
          "tr": "kaldır",
        })
        .setDescription('Removes the user to the blacklist.')
        .setDescriptionLocalizations({
          "tr": "Bir kullanıcıyı karalisteden kaldırır.",
        })
        .addUserOption(option =>
          option
            .setName('user')
            .setNameLocalizations({
              "tr": "kullanıcı",
            })
            .setDescription('The user to be removed to the blacklist.')
            .setDescriptionLocalizations({
              "tr": "Karalisteden kaldırılacak kullanıcı.",
            })
            .setRequired(true)))
    .addSubcommand((command) =>
      command
        .setName('list')
        .setNameLocalizations({
          "tr": "liste",
        })
        .setDescription('See a blacklist list.')
        .setDescriptionLocalizations({
          "tr": "Karalistedeki kullanıcıları gösterir.",
        })),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    const option = interaction.options.getSubcommand()
    const blacklists = db.fetch(`blacklists`) || []
    const premiums = db.fetch(`premiums`) || []
    const links = db.fetch(`links`) || []
    
    const user = interaction.options.getUser('user')
    const reason = interaction.options.getString('reason') || `No reason`
        
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
      case "add": {
    
        if(settings.owners.includes(user.id)) {
          const ownerOnly = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["no-owner"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [ownerOnly]})
        }
        
        if(blacklists.includes(user.id)) {
          const thereBlacklist = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["there-blacklist"].replace(/\{user}/g, user.username)}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [thereBlacklist]})
        }
        
        db.push(`blacklists`, user.id)
        const userLinks = db.fetch(`${user.id}.links`) || []
        if(userLinks.length > 0) {
          const updatedLinks = links.filter(link => !userLinks.includes(link))
          db.set('links', updatedLinks)
          db.delete(`${user.id}`)
        }
        db.set(`${user.id}.blacklistReason`, reason)
        db.set(`${user.id}.blacklistTime`, Math.floor(Date.now() / 1000))
        db.set(`${user.id}.blacklistAuthorized`, interaction.user.id)
        if(premiums.includes(user.id)) {
          db.unpush(`premiums`, user.id)
        }
        db.push(`${user.id}.badges`, `${emojis["blacklist"]} \`[ Yasaklı kullanıcı ]\``)
        
        const addedLog = new Discord.EmbedBuilder()
          .setColor("Red")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`> **Bir kullanıcı karalisteye alındı.**`)
          .addFields(
            {
              name: `Kullanıcı bilgileri`,
              value: `- **${user.username}** \`( ${user.id} )\``
            },
            {
              name: `Yetkili bilgileri`,
              value: `- **${interaction.user.username}** \`( ${interaction.user.id} )\``
            },
            {
              name: `Karaliste alınma sebebi`,
              value: `- \`${reason}\``
            })
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        await client.channels.cache.get(logs.blacklistLog).send({embeds: [addedLog]})
        
        const added = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["blacklist-added"].replace(/\{user}/g, user.username).replace(/\{reason}/g, reason)}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [added]})
        
      }
      break
      case "remove": {
        
        if(!blacklists.includes(user.id)) {
          const noBlacklist = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["no-blacklist"].replace(/\{user}/g, user.username)}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [noBlacklist]})
        }
        
        const removedLog = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`> **Bir kullanıcı karalisteden çıkartıldı.**`)
          .addFields(
            {
              name: `Kullanıcı bilgileri`,
              value: `- **${user.username}** \`( ${user.id} )\``
            },
            {
              name: `Yetkili bilgileri`,
              value: `- **${interaction.user.username}** \`( ${interaction.user.id} )\``
            },
            {
              name: `Karaliste alınma zamanı`,
              value: `- <t:${db.fetch(`${user.id}.blacklistTime`)}:f>`
            })
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        await client.channels.cache.get(logs.blacklistLog).send({embeds: [removedLog]})
        
        db.unpush(`blacklists`, user.id)
        db.delete(`${user.id}.blacklistReason`)
        db.delete(`${user.id}.blacklistTime`)
        db.delete(`${user.id}.blacklistAuthorized`)
        db.unpush(`${user.id}.badges`,`${emojis["blacklist"]} \`[ Yasaklı kullanıcı ]\``)
         
        const removed = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["blacklist-removed"].replace(/\{user}/g, user.username)}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [removed]})
        
      }
      break
      case "list": {
       
        let page = 1
        if(!blacklists || blacklists.length <= 0) {
          const noList = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["no-list"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [noList]})
        } else {
          const options = blacklists.slice((page - 1) * 3, page * 3)
          
          const buttons = new Discord.ActionRowBuilder()
            .addComponents(new Discord.ButtonBuilder()
              .setCustomId(`first_${interaction.user.id}`)
              .setEmoji(emojis["first"])
              .setStyle(Discord.ButtonStyle.Primary)
              .setDisabled(page === 1),
            new Discord.ButtonBuilder()
              .setCustomId(`previous_${interaction.user.id}`)
              .setEmoji(emojis["previous"])
              .setStyle(Discord.ButtonStyle.Primary)
              .setDisabled(page === 1),
            new Discord.ButtonBuilder()
              .setCustomId(`pages_${interaction.user.id}`)
              .setLabel(`${page} / ${Math.ceil(blacklists.length / 3) || 1}`)
              .setStyle(Discord.ButtonStyle.Secondary)
              .setDisabled(true),
            new Discord.ButtonBuilder()
              .setCustomId(`next_${interaction.user.id}`)
              .setEmoji(emojis["next"])
              .setStyle(Discord.ButtonStyle.Primary)
              .setDisabled(page === Math.ceil(`${blacklists.length || 1}` / 3)),
            new Discord.ButtonBuilder()
              .setCustomId(`end_${interaction.user.id}`)
              .setEmoji(emojis["end"])
              .setStyle(Discord.ButtonStyle.Primary)
              .setDisabled(page === Math.ceil(`${blacklists.length || 1}` / 3)))
     
          const list = new Discord.EmbedBuilder()
            .setColor("Blurple")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .addFields(
              {
                name: `${(locales[interaction.locale] ?? locales[settings.defaultLang])["list-count"].replace(/\{count}/g, blacklists.length || 0)}`,
                value: `${options.map(u => `
- <@${u}> \`( ${u} )\`
  - ${(locales[interaction.locale] ?? locales[settings.defaultLang])["blacklist-list1"]} \`${db.fetch(`${u}.blacklistReason`)}\`
  - ${(locales[interaction.locale] ?? locales[settings.defaultLang])["blacklist-list2"]} <t:${db.fetch(`${u}.blacklistTime`)}:R>
  - ${(locales[interaction.locale] ?? locales[settings.defaultLang])["blacklist-list3"]} <@${db.fetch(`${u}.blacklistAuthorized`)}> \`( ${db.fetch(`${u}.blacklistAuthorized`)} )\`
`).join("\n")}`
              })
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          await interaction.followUp({embeds: [list], components: [buttons]})
    
          const collector = interaction.channel.createMessageComponentCollector({time: 60000})
     
          collector.on('collect', async interaction => {
            await interaction.deferUpdate()
            if(interaction.customId === `previous_${interaction.user.id}`) {
              page --
            } else if(interaction.customId === `next_${interaction.user.id}`) {
              page ++
            } else if(interaction.customId === `first_${interaction.user.id}`) {
              page = 1
            } else if(interaction.customId === `end_${interaction.user.id}`) {
              page = Math.ceil(blacklists.length / 3)
            } 
       
            const newButtons = new Discord.ActionRowBuilder()
              .addComponents(new Discord.ButtonBuilder()
                .setCustomId(`first_${interaction.user.id}`)
                .setEmoji(emojis["first"])
                .setStyle(Discord.ButtonStyle.Primary)
                .setDisabled(page === 1),
              new Discord.ButtonBuilder()
                .setCustomId(`previous_${interaction.user.id}`)
                .setEmoji(emojis["previous"])
                .setStyle(Discord.ButtonStyle.Primary)
                .setDisabled(page === 1),
              new Discord.ButtonBuilder()
                .setCustomId(`pages_${interaction.user.id}`)
                .setLabel(`${page} / ${Math.ceil(blacklists.length / 3) || 1}`)
                .setStyle(Discord.ButtonStyle.Secondary)
                .setDisabled(true),
              new Discord.ButtonBuilder()
                .setCustomId(`next_${interaction.user.id}`)
                .setEmoji(emojis["next"])
                .setStyle(Discord.ButtonStyle.Primary)
                .setDisabled(page === Math.ceil(`${blacklists.length || 1}` / 3)),
              new Discord.ButtonBuilder()
                .setCustomId(`end_${interaction.user.id}`)
                .setEmoji(emojis["end"])
                .setStyle(Discord.ButtonStyle.Primary)
                .setDisabled(page === Math.ceil(`${blacklists.length || 1}` / 3)))
      
            const newOptions = blacklists.slice((page - 1) * 3, page * 3)
          
            const newList = new Discord.EmbedBuilder()
              .setColor("Blurple")
              .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
              .addFields(
                {
                  name: `${(locales[interaction.locale] ?? locales[settings.defaultLang])["list-count"].replace(/\{count}/g, blacklists.length || 0)}`,
                  value: `${newOptions.map(u => `
- <@${u}> \`( ${u} )\`
  - ${(locales[interaction.locale] ?? locales[settings.defaultLang])["blacklist-list1"]} \`${db.fetch(`${u}.blacklistReason`)}\`
  - ${(locales[interaction.locale] ?? locales[settings.defaultLang])["blacklist-list2"]} <t:${db.fetch(`${u}.blacklistTime`)}:R>
  - ${(locales[interaction.locale] ?? locales[settings.defaultLang])["blacklist-list3"]} <@${db.fetch(`${u}.blacklistAuthorized`)}> \`( ${db.fetch(`${u}.blacklistAuthorized`)} )\`
`).join("\n")}`
                })
              .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
              .setTimestamp() 
            await interaction.editReply({ embeds: [newList], components: [newButtons]})
          })
        
          collector.on('end', async collected => {
            return await interaction.editReply({components: []})
          })
        }
        
      } 
      break
    }
    
  }
}
