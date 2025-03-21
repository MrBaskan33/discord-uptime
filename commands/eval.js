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
    .setName("eval")
    .setNameLocalizations({
      "tr": "eval",
    })
    .setDescription("Try a command.")
    .setDescriptionLocalizations({
      "tr": "Kod denersiniz.",
    })
    .setDMPermission(false)
    .addStringOption(option =>
      option
        .setName('code')
        .setNameLocalizations({
          "tr": "kod",
        })
        .setDescription('Code to try.')
        .setDescriptionLocalizations({
          "tr": "Denenecek kod.",
        })
        .setRequired(true)),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    const code = interaction.options.getString('code')
 
    if(!settings.owners.includes(interaction.user.id)) {
      const ownerOnly = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["cross"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["owner-only"]}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [ownerOnly]})
    }
    
    try {
      var evaled = clean(eval(code))
      if(evaled.match(new RegExp(`${client.token}`, "g")));
      const notEval = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .addFields(
          {
            name: `${emojis["code"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["input-code"]}`,
            value: `- \`${code}\``
          },
          {
            name: `${emojis["error"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["error"]}`,
            value: `- \`${(locales[interaction.locale] ?? [settings.defaultLang])["not-token"]}\``
          })
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      if(evaled.includes(client.token)) return await interaction.followUp({embeds: [notEval]})
      const evaling = new Discord.EmbedBuilder()
        .setColor("Blurple")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .addFields(
          {
            name: `${emojis["code"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["input-code"]}`,
            value: `- \`${code}\``
          },
          {
            name: `${emojis["light"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["output"]}`,
            value: `- \`${evaled}\``
          })
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [evaling]})
    } catch(error) {
      const evalError = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .addFields(
          {
            name: `${emojis["code"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["input-code"]}`,
            value: `- \`${code}\``
          },
          {
            name: `${emojis["error"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["error"]}`,
            value: `- \`${error}\``
          })
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [evalError]})
    }
    
    function clean(text) {
      if(typeof text !== "string")
      text = require("util").inspect(text, { depth: 0 })
      text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
      return text
    }
    
  }
}
