const Discord = require("discord.js")
const settings = require("../settings.json")
const logs = require("../bot/logs.json")
const { JsonDatabase } = require("wio.db")
const db = new JsonDatabase({databasePath: `./bot/database.json`})

module.exports = {
  name: 'ready',
  async execute(client, interaction, addPremiumTimeout) {
    
    setInterval(function () {
      client.user.setPresence({
        activities: [
          {
            name: `Linkleri çalıyor :/`, 
            type: Discord.ActivityType.Custom
          }
        ],
        "status": "idle"
      })
    }, 10000)
  
    console.log(`[${client.user.tag}] active.`)
    
  }
}
