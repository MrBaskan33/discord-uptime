const Discord = require('discord.js')
const { readdirSync } = require("fs")
const fetch = require("node-fetch")
const { JsonDatabase } = require("wio.db")
const db = new JsonDatabase({databasePath: `./bot/database.json`})
const settings = require("./settings.json")
const emojis = require("./bot/emojis.json")
const logs = require("./bot/logs.json")
const client = new Discord.Client({
  intents: [98303, 
    Discord.GatewayIntentBits.Guilds, 
    Discord.GatewayIntentBits.GuildMessages, 
    Discord.GatewayIntentBits.GuildPresences, 
    Discord.GatewayIntentBits.GuildMessageReactions, 
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.MessageContent   
  ]
})
const locales = {
  "tr": require("./locales/tr.json")
}
client.login(settings.token)

client.commands = new Discord.Collection()

readdirSync('./events').forEach(async file => {
  const event = await require(`./events/${file}`)
  if(event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
  console.log(`[${file}] Event loaded.`)
})

const commands = []
client.commands = new Discord.Collection()
readdirSync("./commands").forEach(async file => {
  if(file.endsWith('.js')) {
    const command = await require(`./commands/${file}`)
    commands.push(command.data.toJSON())
    client.commands.set(command.data.name, command)
    console.log(`[${file}] slash command loaded.`)
  }
})

const rest = new Discord.REST({version: "10"}).setToken(settings.token)
setTimeout(async () => {
  rest.put(Discord.Routes.applicationCommands(settings.botId), {body: commands}).catch(console.error)
}, 500)

//_____// Eklendim \\_____\\
client.on('guildCreate', async sunucu => {
  const added = new Discord.EmbedBuilder()
     .setColor("Green")
     .setAuthor({name: sunucu.name, iconURL: sunucu.iconURL()}) 
     .setDescription(`> **Bir sunucuya eklendim.**`)
     .addFields(
       {
         name: `Sunucu bilgileri`,
         value: `- **${sunucu}** \`(${sunucu.id})\``
       },
       {
         name: `Sunucu sahibi bilgileri`,
         value: `- **${client.users.cache.get(sunucu.ownerId).username}** \`(${sunucu.ownerId})\``
       },
       {
         name: `Toplam sunucu sayısı`,
         value: `- **${client.guilds.cache.size}**`
       },
       {
         name: `Sunucudaki kullanıcı sayısı`,
         value: `- **${sunucu.memberCount}**`
       })
    .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
    .setTimestamp()
  await client.channels.cache.get(logs.addedLog).send({embeds: [added]})
})
//_____// Eklendim \\_____\\

//_____// Atıldım \\_____\\
client.on('guildDelete', async sunucu => {
  const removed = new Discord.EmbedBuilder()
    .setColor("Red")
    .setAuthor({name: sunucu.name, iconURL: sunucu.iconURL()}) 
    .setDescription(`> **Bir sunucudan atıldım.**`)
    .addFields(
      {
        name: `Sunucu bilgileri`,
        value: `- **${sunucu}** \`(${sunucu.id})\``
      },
      {
        name: `Sunucu sahibi bilgileri`,
        value: `- **${client.users.cache.get(sunucu.ownerId).username}** \`(${sunucu.ownerId})\``
      },
      {
        name: `Toplam sunucu sayısı`,
        value: `- **${client.guilds.cache.size}**`
      },
      {
        name: `Sunucudaki kullanıcı sayısı`,
        value: `- **${sunucu.memberCount}**`
      })
    .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
    .setTimestamp()
  await client.channels.cache.get(logs.removedLog).send({embeds: [removed]})
})
//_____// Atıldım \\_____\\

//_____// Hata log \\_____\\
process.on("unhandledRejection", async hata => { 
  const error = new Discord.EmbedBuilder()
    .setColor("Red")
    .setDescription(`> **Bot bir hata verdi.**\n\n- \`${hata}\``) 
    .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
    .setTimestamp()
  await client.channels.cache.get(logs.errorLog).send({embeds: [error]}) 
})
process.on("uncaughtException", async hata => { 
  const error2 = new Discord.EmbedBuilder()
    .setColor("Red")
    .setDescription(`> **Bot bir hata verdi.**\n\n- \`${hata}\``) 
    .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
    .setTimestamp()
  await client.channels.cache.get(logs.errorLog).send({embeds: [error2]}) 
})
process.on("uncaughtExceptionMonitor", async hata => {
  const error3 = new Discord.EmbedBuilder()
    .setColor("Red")
    .setDescription(`> **Bot bir hata verdi.**\n\n- \`${hata}\``) 
    .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
    .setTimestamp()
  await client.channels.cache.get(logs.errorLog).send({embeds: [error3]}) 
})
//_____// Hata log \\_____\\

//_____// Uptime \\_____\\
setInterval(() => {
  const links = db.fetch("links") || []
  if(links.length <= 0) return
  links.forEach(link => {
    try {
      fetch(link)
    } catch (e) {
      const uptimeError = new Discord.EmbedBuilder()
        .setColor("Red")
        .setDescription(`> **Uptime yapılırken bir hata oluştu.**\n\n- \`${e.message}\` (${link})`) 
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return client.channels.cache.get(logs.uptimeErrorLog).send({embeds: [uptimeError]}) 
    }
  })
}, 120000)
//_____// Uptime \\_____\\

//_____// Link commands \\_____\\
client.on('interactionCreate', async interaction => {
  const collector = interaction.channel.createMessageComponentCollector({time: 60000})
     
  collector.on('collect', async interaction => {
    
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
      if(!settings.owners.includes(interaction.user.id)) return await interaction.reply({embeds: [yourBlacklist], components: [buttons], ephemeral: true})
    }
    
    if(maintenance) {
      const maintenanceOpen = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["maintenance"].replace(/\{time}/, maintenanceTime))
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      if(!settings.owners.includes(interaction.user.id)) return await interaction.reply({embeds: [maintenanceOpen], components: [buttons], ephemeral: true})
    }
    
    if(interaction.customId === `commands`) {
      await interaction.deferReply({ephemeral: true})
      const help = new Discord.EmbedBuilder()
        .setColor("Blurple")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .addFields(
          {
            name: `${emojis["bot"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["bot-commands"]}`,
            value: `${(locales[interaction.locale] ?? locales[settings.defaultLang])["commands"]}`
          })
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      await interaction.followUp({embeds: [help]})
    }
    if(interaction.customId === `add`) {
      
      const linkAddModal = new Discord.ModalBuilder()
        .setCustomId('linkaddmodal')
        .setTitle((locales[interaction.locale] ?? locales[settings.defaultLang])["link-add-form"])
      const linkAdd = new Discord.TextInputBuilder()
        .setCustomId('link')
        .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["ading-link"])
        .setStyle(Discord.TextInputStyle.Short) 
        .setMinLength(20)
        .setMaxLength(70)
        .setPlaceholder('https://example.glitch.me')
        .setRequired(true)
      const modal = new Discord.ActionRowBuilder().addComponents(linkAdd)
      linkAddModal.addComponents(modal)
        
      await interaction.showModal(linkAddModal)
        
      await interaction.awaitModalSubmit({filter: (interaction) => interaction.customId === `linkaddmodal`, time: 60000}).then(async (interaction) => {
      
        await interaction.deferReply({ephemeral: true})
        const addLimit = db.fetch(`${interaction.user.id}.linkLimit`) || 0
        const linkAddLimit = addLimit + 2
        const link = interaction.fields.getTextInputValue("link").toLowerCase().replace(/\s+/g, '')
        const links = db.fetch(`${interaction.user.id}.links`) || []
        const premiums = db.fetch(`premiums`) || []
          
        if(!link.startsWith("https://")) {
          const noLink = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["no-link"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [noLink]})
        }
          
        if(!link.endsWith(".glitch.me") && !link.endsWith(".glitch.me/")) {
          const noGlitch = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["no-glitch"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [noGlitch]})
        }
          
        if(links.includes(link)) {
          const thereLink = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["there-link"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [thereLink]})
        }
          
        if(!premiums.includes(interaction.user.id)) {
          if(links.length >= linkAddLimit) {
            const mostLinkForPremium = new Discord.EmbedBuilder()
              .setColor("Red")
              .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
              .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["most-link"].replace(/\{limit}/g, linkAddLimit)}`)
              .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
              .setTimestamp()
            return await interaction.followUp({embeds: [mostLinkForPremium]})
          }
        } else {
          if(links.length >= 30) {
            const mostLink = new Discord.EmbedBuilder()
              .setColor("Red")
              .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
              .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["more-link"].replace(/\{max}/g, 30)}`)
              .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
              .setTimestamp()
            return await interaction.followUp({embeds: [mostLink]})
          }
        }
          
        db.push(`${interaction.user.id}.links`, link)
        db.push(`links`, link)
        
        const uptimeLog = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`> **Sisteme bir link eklendi.**`)
          .addFields(
            {
              name: `Kullanıcı bilgileri`, 
              value: `- **${interaction.user.username}** \`(${interaction.user.id})\``
            },
            {
              name: `Kullanıcı link sayısı`, 
              value: `- **${(db.fetch(`${interaction.user.id}.links`) || []).length}**`
            },
            {
              name: `Toplam link sayısı`, 
              value: `- **${(db.fetch(`links`) || []).length}**`
            },
            {
              name: `Kullanıcının premiumu bulunuyormu`, 
              value: `- ${premiums.includes(interaction.user.id) ? emojis["check"] : emojis["cross"]}`
            })
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        await client.channels.cache.get(logs.linkLog).send({embeds: [uptimeLog]})
         
        const linkAdd = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["link-add"]}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [linkAdd]})
        
      })
      
    }
    if(interaction.customId === `delete`) {
      
      const linkRemoveModal = new Discord.ModalBuilder()
        .setCustomId('linkremovemodal')
        .setTitle((locales[interaction.locale] ?? locales[settings.defaultLang])["link-remove-form"])
      const linkRemove = new Discord.TextInputBuilder()
        .setCustomId('link')
        .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["removing-link"])
        .setStyle(Discord.TextInputStyle.Short) 
        .setMinLength(20)
        .setMaxLength(70)
        .setPlaceholder('https://example.glitch.me')
        .setRequired(true)
      const modal = new Discord.ActionRowBuilder().addComponents(linkRemove)
      linkRemoveModal.addComponents(modal)
        
      await interaction.showModal(linkRemoveModal)
        
      await interaction.awaitModalSubmit({filter: (interaction) => interaction.customId === `linkremovemodal`, time: 60000}).then(async (interaction) => {
        
        await interaction.deferReply({ephemeral: true})
        const link = interaction.fields.getTextInputValue("link")
        const links = db.fetch(`${interaction.user.id}.links`) || []
        const premiums = db.fetch(`premiums`) || []
          
        if(!links.includes(link)) {
          const dontLink = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["not-link"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [dontLink]})
        }
          
        db.pull(`${interaction.user.id}.links`, (element) => link)
        db.pull(`links`, (element) => link)
          
        const uptimeLog = new Discord.EmbedBuilder()
          .setColor("Red")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`> **Sistemden bir link silindi.**`)
          .addFields(
            {
              name: `Kullanıcı bilgileri`, 
              value: `- **${interaction.user.username}** \`(${interaction.user.id})\``
            },
            {
              name: `Kullanıcı link sayısı`, 
              value: `- **${(db.fetch(`${interaction.user.id}.links`) || []).length}**`
            },
            {
              name: `Toplam link sayısı`, 
              value: `- **${(db.fetch(`links`) || []).length}**`
            },
            {
              name: `Kullanıcının premiumu bulunuyormu`, 
              value: `- ${premiums.includes(interaction.user.id) ? emojis["check"] : emojis["cross"]}`
            })
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        await client.channels.cache.get(logs.linkLog).send({embeds: [uptimeLog]})
         
        const linkRemove = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["link-remove"]}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [linkRemove]})
       
      })
      
    }
    if(interaction.customId === `edit`) {
    
      const linkEditModal = new Discord.ModalBuilder()
        .setCustomId('linkeditmodal')
        .setTitle((locales[interaction.locale] ?? locales[settings.defaultLang])["link-edit-form"])
      const oldLink = new Discord.TextInputBuilder()
        .setCustomId('oldlink')
        .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["removing-link"])
        .setStyle(Discord.TextInputStyle.Short) 
        .setMinLength(20)
        .setMaxLength(70)
        .setPlaceholder('https://example.glitch.me')
        .setRequired(true)
      const newLink = new Discord.TextInputBuilder()
        .setCustomId('newlink')
        .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["ading-link"])
        .setStyle(Discord.TextInputStyle.Short) 
        .setMinLength(20)
        .setMaxLength(40)
        .setPlaceholder('https://example.glitch.me')
        .setRequired(true) 
      const modal = new Discord.ActionRowBuilder().addComponents(oldLink)
      const modal2 = new Discord.ActionRowBuilder().addComponents(newLink)
      linkEditModal.addComponents(modal, modal2)
        
      await interaction.showModal(linkEditModal)
        
      await interaction.awaitModalSubmit({filter: (interaction) => interaction.customId === `linkeditmodal`, time: 60 * 60 * 1000}).then(async (interaction) => {
        
        await interaction.deferReply({ephemeral: true})
        const oldLink = interaction.fields.getTextInputValue("oldlink")
        const newLink = interaction.fields.getTextInputValue("newlink").toLowerCase().replace(/\s+/g, '')
        const links = db.fetch(`${interaction.user.id}.links`) || []
        const premiums = db.fetch(`premiums`) || []
          
        if(!newLink.startsWith("https://")) {
          const noLink = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["no-link"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [noLink]})
        }
        
        if(!newLink.endsWith(".glitch.me") && !newLink.endsWith(".glitch.me/")) {
          const noGlitch = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["no-glitch"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [noGlitch]})
        }
          
        if(links.includes(newLink)) {
          const thereLink = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["there-link"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [thereLink]})
        }
          
        if(!links.includes(oldLink)) {
          const dontLink = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["not-link"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [dontLink]})
        }
        
        db.pull(`${interaction.user.id}.links`, (element) => oldLink)
        db.pull(`links`, (element) => oldLink)
        db.push(`${interaction.user.id}.links`, newLink)
        db.push(`links`, newLink)
        
        const uptimeLog = new Discord.EmbedBuilder()
          .setColor("Yellow")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`> **Sistemdeki bir link düzenlendi.**`)
          .addFields(
            {
              name: `Kullanıcı bilgileri`, 
              value: `- **${interaction.user.username}** \`(${interaction.user.id})\``
            },
            {
              name: `Kullanıcı link sayısı`, 
              value: `- **${(db.fetch(`${interaction.user.id}.links`) || []).length}**`
            },
            {
              name: `Toplam link sayısı`, 
              value: `- **${(db.fetch(`links`) || []).length}**`
            },
            {
              name: `Kullanıcının premiumu bulunuyormu`, 
              value: `- ${premiums.includes(interaction.user.id) ? emojis["check"] : emojis["cross"]}`
            })
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        await client.channels.cache.get(logs.linkLog).send({embeds: [uptimeLog]})
          
        const linkEdit = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["link-edit"]}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [linkEdit]})
       
      })
          
    }
    if(interaction.customId === `list`) {
      
      await interaction.deferReply({ephemeral: true})
      const links = db.fetch(`${interaction.user.id}.links`) || []
        
      let link
      if(!links) {
        link = (locales[interaction.locale] ?? locales[settings.defaultLang])["no-system"]
      } else {
        link = `${(db.fetch(`${interaction.user.id}.links`) || []).map(l => `- \`${l}\``).join("\n") || (locales[interaction.locale] ?? locales[settings.defaultLang])["no-system"]}`
      }
        
      const linkList = new Discord.EmbedBuilder()
        .setColor("Blurple")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .addFields(
          {
            name: `${(locales[interaction.locale] ?? locales[settings.defaultLang])["list-count"].replace(/\{count}/g, links.length)}`,
            value: `${link}`
          })
       .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
       .setTimestamp()
     return await interaction.followUp({embeds: [linkList]})
      
    }
  })
})
//_____// Link commands \\_____\\
