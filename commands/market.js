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
    .setName("market")
    .setNameLocalizations({
      "tr": "pazar",
    })
    .setDescription("See a market")
    .setDescriptionLocalizations({
      "tr": "Pazarı görüntülersiniz.",
    })
    .setDMPermission(false),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    const linkLimit = (db.fetch(`${interaction.user.id}.linkLimit`) || 0) + 2
    const chest = db.fetch(`${interaction.user.id}.chest`) || 0
    const key = db.fetch(`${interaction.user.id}.key`) || 0
    const premiums = db.fetch(`premiums`) || []
    const balance = db.fetch(`${interaction.user.id}.balance`) || 0
   
    let pre
    if(premiums.includes(interaction.user.id)) {
      if(db.fetch(`${interaction.user.id}.premium`) === "∞") {
        pre = `${emojis["check"]} **| ∞**`
      } else {
        pre = `${emojis["check"]} **| <t:${db.fetch(`${interaction.user.id}.premium`)}:f>**`
      }
    } else {
      pre = `${emojis["cross"]}`
    }
    
    const buttons = new Discord.ActionRowBuilder()
      .addComponents(new Discord.ButtonBuilder()
        .setLabel(`${(locales[interaction.locale] ?? locales[settings.defaultLang])["link-limit"]}`)
        .setStyle(Discord.ButtonStyle.Primary)
        .setCustomId(`linkLimit_${interaction.user.id}`)
        .setDisabled(balance < 30),
      new Discord.ButtonBuilder()
        .setLabel(`${(locales[interaction.locale] ?? locales[settings.defaultLang])["chest"]}`)
        .setStyle(Discord.ButtonStyle.Primary)
        .setCustomId(`chest_${interaction.user.id}`)
        .setDisabled(balance < 10),
      new Discord.ButtonBuilder()
        .setLabel(`${(locales[interaction.locale] ?? locales[settings.defaultLang])["key"]}`)
        .setStyle(Discord.ButtonStyle.Primary)
        .setCustomId(`key_${interaction.user.id}`)
        .setDisabled(balance < 10),
      new Discord.ButtonBuilder()
        .setLabel(`${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium"]}`)
        .setStyle(Discord.ButtonStyle.Primary)
        .setCustomId(`premium_${interaction.user.id}`)
        .setDisabled(balance < 500))
    
    const market = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
      .addFields(
        {
          name: `${emojis["link"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["link-limit"]}`,
          value: `${(locales[interaction.locale] ?? locales[settings.defaultLang])["link-limit-info"].replace(/\{linkLimit}/g, linkLimit).replace(/\{cost}/, 30)}`
        },
        {
          name: `${emojis["chest"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["chest"]}`,
          value: `${(locales[interaction.locale] ?? locales[settings.defaultLang])["chest-info"].replace(/\{chestCount}/g, chest).replace(/\{cost}/, 10)}`
        },
        {
          name: `${emojis["key"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["key"]}`,
          value: `${(locales[interaction.locale] ?? locales[settings.defaultLang])["key-info"].replace(/\{keyCount}/g, key).replace(/\{cost}/, 10)}`
        },
        {
          name: `${emojis["diamond"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium"]}`,
          value: `${(locales[interaction.locale] ?? locales[settings.defaultLang])["premium-info"].replace(/\{premiumTime}/g, pre).replace(/\{cost}/, 500)}`
        })
    
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    await interaction.followUp({embeds: [market], components: [buttons]})
 
    const collector = interaction.channel.createMessageComponentCollector({time: 60000})
     
    collector.on('collect', async interaction => {
      await interaction.deferUpdate()
      if(interaction.customId === `linkLimit_${interaction.user.id}`) {
        const bal = db.fetch(`${interaction.user.id}.balance`) || 0
        if(bal < 30) {
          const noBalance = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["no-balance"])
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          await interaction.editReply({embeds: [noBalance], components: []})
        } else {
          db.add(`${interaction.user.id}.linkLimit`, 1)
          db.substract(`${interaction.user.id}.balance`, 30)
        
          const buying = new Discord.EmbedBuilder()
            .setColor("Green")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["buying"].replace(/\{result}/g, "1 link ekleme hakkı"))
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.editReply({embeds: [buying], components: []})
        }
      } else if(interaction.customId === `chest_${interaction.user.id}`) {
        const bal = db.fetch(`${interaction.user.id}.balance`) || 0
        if(bal < 10) {
          const noBalance = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["no-balance"])
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.editReply({embeds: [noBalance], components: []})
        } else {
          db.add(`${interaction.user.id}.chest`, 1)
          db.substract(`${interaction.user.id}.balance`, 10)
        
          const buying = new Discord.EmbedBuilder()
            .setColor("Green")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["buying"].replace(/\{result}/g, "1 sandık"))
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.editReply({embeds: [buying], components: []})
        }
      } else if(interaction.customId === `key_${interaction.user.id}`) {
        const bal = db.fetch(`${interaction.user.id}.balance`) || 0
        if(bal < 10) {
          const noBalance = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["no-balance"])
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.editReply({embeds: [noBalance], components: []})
        } else {
          db.add(`${interaction.user.id}.key`, 1)
          db.substract(`${interaction.user.id}.balance`, 10)
        
          const buying = new Discord.EmbedBuilder()
            .setColor("Green")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["buying"].replace(/\{result}/g, "1 anahtar"))
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
         return await interaction.editReply({embeds: [buying], components: []})
        }
      } else if(interaction.customId === `premium_${interaction.user.id}`) {
        const bal = db.fetch(`${interaction.user.id}.balance`) || 0
        if(bal < 500) {
          const noBalance = new Discord.EmbedBuilder()
            .setColor("Red")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
            .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["no-balance"])
            .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
            .setTimestamp()
          return await interaction.editReply({embeds: [noBalance], components: []})
        } else {
          const premiums = db.fetch(`premiums`) || []
          if(premiums.includes(interaction.user.id)) {
            const therePremium = new Discord.EmbedBuilder()
              .setColor("Red")
              .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
              .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["premium-there"])
              .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
              .setTimestamp()
            return await interaction.editReply({embeds: [therePremium], components: []})
          } else {
            db.set(`${interaction.user.id}.premium`, "∞")
            db.push(`premiums`, interaction.user.id)
            db.set(`${interaction.user.id}.premiumStartTime`, Math.floor(Date.now() / 1000))
            db.set(`${interaction.user.id}.premiumAuthorized`, interaction.user.id)
            db.push(`${interaction.user.id}.badges`, `${emojis["diamond"]} \`[ Premium kullanıcı ]\``)
            db.substract(`${interaction.user.id}.balance`, 500)
        
            let pre
            if(db.fetch(`${interaction.user.id}.premium`) === "∞") {
              pre = `**∞**`
            } else {
              pre = `**<t:${db.fetch(`${interaction.user.id}.premium`)}:f>**`
            }
            
            const buyingLog = new Discord.EmbedBuilder()
              .setColor("Green")
              .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
              .setDescription(`> **Bir kullanıcı premium satın aldı.**`)
              .addFields(
                {
                  name: `Kullanıcı bilgileri`,
                  value: `- **${interaction.user.username}** \`( ${interaction.user.id} )\``
                },
                {
                  name: `Bitiş zamanı`,
                  value: `${pre}`
                })
              .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
              .setTimestamp()
            await client.channels.cache.get(logs.premiumLog).send({embeds: [buyingLog]})
        
            const buying = new Discord.EmbedBuilder()
              .setColor("Green")
              .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
              .setDescription((locales[interaction.locale] ?? locales[settings.defaultLang])["buying"].replace(/\{result}/g, "Sınırsız premium üyelik"))
              .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
              .setTimestamp()
            return await interaction.editReply({embeds: [buying], components: []})
        
          }
          
        }
        
      } 
      
    })
    collector.on('end', async collected => {
      return await interaction.editReply({components: []})
    })
    
  }
}
