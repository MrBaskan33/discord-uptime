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
    .setName("premium")
    .setNameLocalizations({
      "tr": "premium",
    })
    .setDescription("Premium system.")
    .setDescriptionLocalizations({
      "tr": "Premium sistemi.",
    })
    .setDMPermission(false)
    .addSubcommand((command) =>
      command
        .setName('give')
        .setNameLocalizations({
          "tr": "ver",
        })
        .setDescription('Gives the user to the premium.')
        .setDescriptionLocalizations({
          "tr": "Bir kullanıcıyı karalisteye ekler.",
        })
        .addUserOption(option =>
          option
            .setName('user')
            .setNameLocalizations({
              "tr": "kullanıcı",
            })
            .setDescription('The user to be gived to the premium.')
            .setDescriptionLocalizations({
              "tr": "premium verilecek kullanıcı.",
            })
            .setRequired(true))
        .addNumberOption(option =>
          option
            .setName('month')
            .setNameLocalizations({
              "tr": "ay",
            })
            .setDescription('Month number.')
            .setDescriptionLocalizations({
              "tr": "Ay sayısı.",
            })
            .setRequired(false))
        .addNumberOption(option =>
          option
            .setName('year')
            .setNameLocalizations({
              "tr": "yıl",
            })
            .setDescription('Year number.')
            .setDescriptionLocalizations({
              "tr": "Yıl sayısı.",
            })
            .setRequired(false)))
    .addSubcommand((command) =>
      command
        .setName('receive')
        .setNameLocalizations({
          "tr": "al",
        })
        .setDescription('Receives the user to the blacklist.')
        .setDescriptionLocalizations({
          "tr": "Bir kullanıcının premiumunu alır.",
        })
        .addUserOption(option =>
          option
            .setName('user')
            .setNameLocalizations({
              "tr": "kullanıcı",
            })
            .setDescription('The user to be received to the premium.')
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
        .setDescription('See a premium list.')
        .setDescriptionLocalizations({
          "tr": "Premium kullanıcıları gösterir.",
        })),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    const option = interaction.options.getSubcommand()
    const premiums = db.fetch(`premiums`) || []
    
    const user = interaction.options.getUser('user')
    
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
    
        const month = interaction.options.getNumber('month') || 0
        const year = interaction.options.getNumber('year') || 0
        
        if(premiums.includes(user.id)) {
          const therePremium = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["there-premium"].replace(/\{user}/g, user.username)}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [therePremium]})
        }
        
        const monthCalc = 30 * 24 * 60 * 60 * month
        const yearCalc = 365 * 24 * 60 * 60 * year
        if(month == 0 && year == 0) {
          db.set(`${user.id}.premium`, "∞")
        } else {
          db.set(`${user.id}.premium`, Math.floor(Date.now() / 1000) + yearCalc + monthCalc)
        }
        
        let pre
        if(db.fetch(`${user.id}.premium`) === "∞") {
          pre = `**∞**`
        } else {
          pre = `**<t:${db.fetch(`${user.id}.premium`)}:f>**`
        }
        
        db.push(`premiums`, user.id)
        db.set(`${user.id}.premiumStartTime`, Math.floor(Date.now() / 1000))
        db.set(`${user.id}.premiumAuthorized`, interaction.user.id)
        db.push(`${user.id}.badges`, `${emojis["diamond"]} \`[ Premium kullanıcı ]\``)
        
        const givedLog = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`> **Bir kullanıcıya premium verildi.**`)
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
              name: `Bitiş zamanı`,
              value: `${pre}`
            })
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        await client.channels.cache.get(logs.premiumLog).send({embeds: [givedLog]})
        
        const added = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium-added"].replace(/\{user}/g, user.username)}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [added]})
        
      }
      break
      case "receive": {
        
        if(!premiums.includes(user.id)) {
          const noPremium = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["no-premium"].replace(/\{user}/g, user.username)}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [noPremium]})
        }
        
        const removedLog = new Discord.EmbedBuilder()
          .setColor("Red")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`> **Bir kullanıcıdan premium alındı.**`)
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
              name: `Premium verilme zamanı`,
              value: `- **<t:${db.fetch(`${user.id}.premiumStartTime`)}:f>**`
            })
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        await client.channels.cache.get(logs.premiumLog).send({embeds: [removedLog]})
        
        db.unpush(`premiums`, user.id)
        db.unpush(`${user.id}.badges`, `${emojis["diamond"]} \`[ Premium kullanıcı ]\``)
        db.delete(`${user.id}.premiumStartTime`)
        db.delete(`${user.id}.premiumAuthorized`)
        db.delete(`${user.id}.premium`)
        
        const userLinks = db.fetch(`${user.id}.links`) || []
        const addLimit = (db.fetch(`${user.id}.linkLimit`) || 0) + 2
        const allLinks = db.fetch('links') || []
     
        if(userLinks.length > addLimit) {
          const linksToKeep = userLinks.slice(0, addLimit)
          const linksToRemove = userLinks.slice(addLimit)
          const updatedLinks = allLinks.filter(link => !linksToRemove.includes(link))
          db.set('links', updatedLinks)
          db.set(`${user.id}.links`, linksToKeep)
        }
        
        const removed = new Discord.EmbedBuilder()
          .setColor("Green")
          .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
          .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium-removed"].replace(/\{user}/g, user.username)}`)
          .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
          .setTimestamp()
        return await interaction.followUp({embeds: [removed]})
        
      }
      break
      case "list": {
       
        let page = 1
        if(!premiums || premiums.length <= 0) {
          const noList = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["no-list"]}`)
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.followUp({embeds: [noList]})
        } else {
          const options = premiums.slice((page - 1) * 3, page * 3)
          
          function pre(x) {
            let preTime
            if(db.fetch(`${x}.premium`) === "∞") {
              preTime = `**∞**`
            } else {
              preTime = `**<t:${db.fetch(`${x}.premium`)}:f>**`
            }
            return preTime
          }
          
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
              .setLabel(`${page} / ${Math.ceil(premiums.length / 3) || 1}`)
              .setStyle(Discord.ButtonStyle.Secondary)
              .setDisabled(true),
            new Discord.ButtonBuilder()
              .setCustomId(`next_${interaction.user.id}`)
              .setEmoji(emojis["next"])
              .setStyle(Discord.ButtonStyle.Primary)
              .setDisabled(page === Math.ceil(`${premiums.length || 1}` / 3)),
            new Discord.ButtonBuilder()
              .setCustomId(`end_${interaction.user.id}`)
              .setEmoji(emojis["end"])
              .setStyle(Discord.ButtonStyle.Primary)
              .setDisabled(page === Math.ceil(`${premiums.length || 1}` / 3)))
     
          const list = new Discord.EmbedBuilder()
            .setColor("Blurple")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .addFields(
              {
                name: `${(locales[interaction.locale] ?? locales[settings.defaultLang])["list-count"].replace(/\{count}/g, premiums.length || 0)}`,
                value: `${options.map(u => `
- <@${u}> \`( ${u} )\`
  - ${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium-list1"]} <t:${db.fetch(`${u}.premiumStartTime`)}:R>
  - ${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium-list2"]} <@${db.fetch(`${u}.premiumAuthorized`)}> \`( ${db.fetch(`${u}.premiumAuthorized`)} )\`
  - ${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium-list3"]} ${pre(u)}
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
              page = Math.ceil(premiums.length / 3)
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
                .setLabel(`${page} / ${Math.ceil(premiums.length / 3) || 1}`)
                .setStyle(Discord.ButtonStyle.Secondary)
                .setDisabled(true),
              new Discord.ButtonBuilder()
                .setCustomId(`next_${interaction.user.id}`)
                .setEmoji(emojis["next"])
                .setStyle(Discord.ButtonStyle.Primary)
                .setDisabled(page === Math.ceil(`${premiums.length || 1}` / 3)),
              new Discord.ButtonBuilder()
                .setCustomId(`end_${interaction.user.id}`)
                .setEmoji(emojis["end"])
                .setStyle(Discord.ButtonStyle.Primary)
                .setDisabled(page === Math.ceil(`${premiums.length || 1}` / 3)))
      
            const newOptions = premiums.slice((page - 1) * 3, page * 3)
          
            const newList = new Discord.EmbedBuilder()
              .setColor("Blurple")
              .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
              .addFields(
                {
                  name: `${(locales[interaction.locale] ?? locales[settings.defaultLang])["list-count"].replace(/\{count}/g, premiums.length || 0)}`,
                  value: `${newOptions.map(u => `
- <@${u}> \`( ${u} )\`
  - ${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium-list1"]} <t:${db.fetch(`${u}.premiumStartTime`)}:R>
  - ${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium-list2"]} <@${db.fetch(`${u}.premiumAuthorized`)}> \`( ${db.fetch(`${u}.premiumAuthorized`)} )\`
  - ${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium-list3"]} ${pre(u)}
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
