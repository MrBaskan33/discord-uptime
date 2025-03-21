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
    .setName('link')
    .setNameLocalizations({
      "tr": "link",
    })
    .setDescription('Uptime system.')
    .setDescriptionLocalizations({
      "tr": "Uptime sistemi.",
    })
    .setDMPermission(false)
    .addSubcommand((command) =>
      command
        .setName('add')
        .setNameLocalizations({
          "tr": "ekle",
        })
        .setDescription('You add a link to the system.')
        .setDescriptionLocalizations({
          "tr": "Sisteme link eklersiniz.",
        }))
    .addSubcommand((command) =>
      command
        .setName('delete')
        .setNameLocalizations({
          "tr": "sil",
        })
         .setDescription('You delete a link to the system.')
         .setDescriptionLocalizations({
          "tr": "Sistemden link silersiniz.",
        }))
    .addSubcommand((command) =>
      command
        .setName('edit')
        .setNameLocalizations({
          "tr": "düzenle",
        })
        .setDescription('You edit a link to the system.')
        .setDescriptionLocalizations({
          "tr": "Sistemdeki linkinizi düzenlersiniz.",
        }))
    .addSubcommand((command) =>
      command
        .setName('list')
        .setNameLocalizations({
          "tr": "liste",
        })
        .setDescription('You view your links in the system.')
        .setDescriptionLocalizations({
          "tr": "Sistemdeki linklerinizi görüntülersniz.",
        }))
    .addSubcommand((command) =>
      command
        .setName('count')
        .setNameLocalizations({
          "tr": "say",
        })
        .setDescription('Shows the number of links in the system.')
        .setDescriptionLocalizations({
          "tr": "Sistemdeki link sayılarını gösterir.",
        }))
    .addSubcommand((command) =>
      command
        .setName('admin-list')
        .setNameLocalizations({
          "tr": "admin-liste",
        })
        .setDescription('Admin link list.')
        .setDescriptionLocalizations({
          "tr": "Admin link liste.",
        })
        .addUserOption(option =>
          option
            .setName('user')
            .setNameLocalizations({
               "tr": "kullanıcı",
            })
            .setDescription('Select a user.')
            .setDescriptionLocalizations({
              "tr": "Bir kullanıcı seçin.",
            })
            .setRequired(true)))
    .addSubcommand((command) =>
      command
        .setName('admin-delete')
        .setNameLocalizations({
          "tr": "admin-sil",
        })
        .setDescription('Admin link delete.')
        .setDescriptionLocalizations({
          "tr": "Admin link sil.",
        })
        .addUserOption(option =>
          option
            .setName('user')
            .setNameLocalizations({
              "tr": "kullanıcı",
            })
            .setDescription('Select a user.')
            .setDescriptionLocalizations({
              "tr": "Bir kullanıcı seçin.",
            })
            .setRequired(true))),
          
  async execute(client, interaction) { 

    const option = interaction.options.getSubcommand()
   
    switch(option) {
      case "add": {
      
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
        
          await interaction.deferReply()
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
      break
      case "delete": {
      
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
        
          await interaction.deferReply()
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
          
          db.unpush(`${interaction.user.id}.links`, link)
          db.unpush(`links`, link)
          
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
      break
      case "edit": {
      
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
        
          await interaction.deferReply()
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
          
          db.unpush(`${interaction.user.id}.links`, oldLink)
          db.unpush(`links`, oldLink)
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
      break
      case "list": {
      
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
      break
      case "count": {
      
        await interaction.deferReply()
        const addLimit = db.fetch(`${interaction.user.id}.linkLimit`) || 0
        const linkAddLimit = addLimit + 2
        const userLinks = db.fetch(`${interaction.user.id}.links`) || []
        const links = db.fetch(`links`) || []
        const premiums = db.fetch(`premiums`) || []
        
        const linkNumber = new Discord.EmbedBuilder()
          .setColor("Blurple")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .addFields(
            {
              name: `${emojis["all"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["all-links"]}`,
              value: `- **${links.length}**`
            },
            {
              name: `${emojis["link"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["your-links"]}`,
              value: `- **${userLinks.length} / ${premiums.includes(interaction.user.id) ? `∞` : `${linkAddLimit}`}**`
            },
            {
              name: `${emojis["diamond"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium-users"]}`,
              value: `- **${premiums.length}**`
            })
         .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
         .setTimestamp()
       return await interaction.followUp({embeds: [linkNumber]})
      
      }
      break
      case "admin-list": {
      
        await interaction.deferReply({ephemeral: true})
     
        if(!settings.owners.includes(interaction.user.id)) {
          const ownerOnly = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["owner-only"])
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [ownerOnly]})
        }
        
        const user = interaction.options.getUser('user')
        const links = db.fetch(`${user.id}.links`) || []
        
        let link
        if(!links) {
          link = (locales[interaction.locale] ?? locales[settings.defaultLang])["no-system"]
        } else {
          link = `${(db.fetch(`${user.id}.links`) || []).map(l => `- \`${l}\``).join("\n") || (locales[interaction.locale] ?? locales[settings.defaultLang])["no-system"]}`
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
      break
      case "admin-delete": {
      
        const user = interaction.options.getUser('user')
        const linkRemoveModalAdmin = new Discord.ModalBuilder()
          .setCustomId('linkremovemodaladmin')
          .setTitle((locales[interaction.locale] ?? locales[settings.defaultLang])["link-remove-form"])
        const linkRemoveAdmin = new Discord.TextInputBuilder()
          .setCustomId('link')
          .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["removing-link"])
          .setStyle(Discord.TextInputStyle.Short) 
          .setMinLength(20)
          .setMaxLength(40)
          .setPlaceholder('https://example.glitch.me')
          .setRequired(true)
        const linkRemoveReason = new Discord.TextInputBuilder()
          .setCustomId('reason')
          .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["removing-reason"])
          .setStyle(Discord.TextInputStyle.Short) 
          .setPlaceholder('Hatalı link.')
          .setRequired(true)
        const modal = new Discord.ActionRowBuilder().addComponents(linkRemoveAdmin)
        const modal2 = new Discord.ActionRowBuilder().addComponents(linkRemoveReason)
        linkRemoveModalAdmin.addComponents(modal, modal2)
        
        await interaction.showModal(linkRemoveModalAdmin)
        
        await interaction.awaitModalSubmit({filter: (interaction) => interaction.customId === `linkremovemodaladmin`, time: 60000}).then(async (interaction) => {
         
          await interaction.deferReply()
          const link = interaction.fields.getTextInputValue("link")
          const reason = interaction.fields.getTextInputValue("reason")
          const links = db.fetch(`${user.id}.links`) || []
          const premiums = db.fetch(`premiums`) || []
          
          if(!settings.owners.includes(interaction.user.id)) {
            const ownerOnly = new Discord.EmbedBuilder()
              .setColor("Red")
              .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
              .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["owner-only"])
              .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
              .setTimestamp()
            return await interaction.followUp({embeds: [ownerOnly]})
          }
          
          if(!links.includes(link)) {
            const dontLink = new Discord.EmbedBuilder()
              .setColor("Red")
              .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
              .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["not-link"]}`)
              .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
              .setTimestamp()
            return await interaction.followUp({embeds: [dontLink]})
          }
          
          db.unpush(`${user.id}.links`, link)
          db.unpush(`links`, link)
         
          const uptimeLog = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`> **Admin tarafından sistemden bir link kaldırıldı.**`)
            .addFields(
              {
                name: `Kullanıcı bilgileri`, 
                value: `- **${user.username}** \`(${user.id})\``
              },
              {
                name: `Yetkili bilgileri`, 
                value: `- **${interaction.user.username}** \`(${interaction.user.id})\``
              },
              {
                name: `Kullanıcının link sayısı`, 
                value: `- **${(db.fetch(`${user.id}.links`) || []).length}**`
              },
              {
                name: `Toplam link sayısı`, 
                value: `- **${(db.fetch(`links`) || []).length}**`
              },
              {
                name: `Linkin silinme sebebi`, 
                value: `- **${reason}**`
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
      break
    }

  }
}
