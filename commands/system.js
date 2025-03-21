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
    .setName("uptime-system")
    .setNameLocalizations({
      "tr": "uptime-sistemi",
    })
    .setDescription("Uptime channel system.")
    .setDescriptionLocalizations({
      "tr": "Uptime kanal sistemi.",
    })
    .setDMPermission(false)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setNameLocalizations({
          "tr": "kanal",
        })
        .setDescription('Set to channel.')
        .setDescriptionLocalizations({
          "tr": "Ayarlanacak kanal.",
        })
        .setRequired(false)),
        
  async execute(client, interaction) { 
  
    await interaction.deferReply()
    const channel = interaction.options.getChannel('channel') || interaction.channel
 
    if(!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
      const noAuthorized = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["cross"]} ${(locales[interaction.loacale] ?? locales[settings.defaultLang])["no-perm"]}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [noAuthorized]})
    }

    if(channel.type !== Discord.ChannelType.GuildText) {
      const noTextChannel = new Discord.EmbedBuilder()
        .setColor("Red")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
        .setDescription(`${emojis["cross"]} ${(locales[interaction.loacale] ?? locales[settings.defaultLang])["no-channel"]}`)
        .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
        .setTimestamp()
      return await interaction.followUp({embeds: [noTextChannel]})
    }
    
    const buttons1 = new Discord.ActionRowBuilder()
      .addComponents(new Discord.ButtonBuilder()
        .setEmoji(emojis["add"])
        .setStyle(Discord.ButtonStyle.Success)
        .setCustomId(`add`),
      new Discord.ButtonBuilder()
        .setEmoji(emojis["trash"])
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId(`delete`),
      new Discord.ButtonBuilder()
        .setEmoji(emojis["pencil"])
        .setStyle(Discord.ButtonStyle.Primary)
        .setCustomId(`edit`),
      new Discord.ButtonBuilder()
        .setEmoji(emojis["link"])
        .setStyle(Discord.ButtonStyle.Secondary)
        .setCustomId(`list`),
      new Discord.ButtonBuilder()
        .setEmoji(emojis["bot"])
        .setStyle(Discord.ButtonStyle.Secondary)
        .setCustomId(`commands`))
    const buttons2 = new Discord.ActionRowBuilder()
      .addComponents(new Discord.ButtonBuilder()        
        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${settings.bot}&permissions=8&scope=bot%20applications.commands`)
        .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["add-server"])
        .setStyle("Link"))
      .addComponents(new Discord.ButtonBuilder()        
        .setURL(settings.supportServer)
        .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["support-server"])
        .setStyle("Link"))
      .addComponents(new Discord.ButtonBuilder()        
        .setURL(`https://top.gg/bot/${settings.bot}/vote`)
        .setLabel((locales[interaction.locale] ?? locales[settings.defaultLang])["vote"])
        .setStyle("Link"))
    
    const system = new Discord.EmbedBuilder()
      .setColor("Blurple")
      .setTitle(`${(locales[interaction.locale] ?? locales[settings.defaultLang])["title"]}`)
      .setDescription(`${(locales[interaction.locale] ?? locales[settings.defaultLang])["system"].replace(/\{add}/g, emojis["add"]).replace(/\{delete}/g, emojis["trash"]).replace(/\{edit}/g, emojis["pencil"]).replace(/\{list}/g, emojis["link"]).replace(/\{bot}/g, emojis["bot"])}`)
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    await client.channels.cache.get(channel.id).send({embeds: [system], components: [buttons1, buttons2]})
  
    const set = new Discord.EmbedBuilder()
      .setColor("Green")
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()}) 
      .setDescription(`${emojis["check"]} ${(locales[interaction.locale] ?? locales[settings.defaultLang])["system-set"].replace(/\{channel}/g, channel.id)}`)
      .setFooter({text: client.user.username, iconURL: client.user.avatarURL()}) 
      .setTimestamp()
    await interaction.followUp({embeds: [set]})
  
  }
}
