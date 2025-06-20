import { Client, Message } from "discord.js-selfbot-v13"
import { config } from "dotenv";
import axios from "axios";
import color from "colors"
import path from "path"
import fs from "fs";
config();

const guildID = "1365297460179898398";
const channelID = "1379841934297927681";
const storagePath = "../../ether/Chelsea"

const client = new Client();

client.on("ready", async () => {
  console.log(`Logged in as ${client.user?.username}`);

  const guild = await client.guilds.fetch(guildID);
  const channel = await guild.channels.fetch(channelID);
  const messages = await channel.messages.fetch({ limit: 100 });

  messages.forEach(async (untMsg) => {
    const msg: Message = untMsg

    if (msg.attachments.size > 0) {
      const msgPath = path.resolve(storagePath, msg.id);
      createIfNotExists(msgPath)

      if (msg.content != "") fs.writeFileSync(path.resolve(msgPath, "content.txt"), msg.content);

      msg.attachments.forEach(async (attachment) => {
        const attachmentPath = path.resolve(msgPath, attachment.name || attachment.id)
        await download(attachment.url, attachmentPath)
      });
    }
  });

  process.exit(0);
});

function createIfNotExists(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

async function download(url, path) {
  const response = await axios.get(url, { responseType: "stream" });
  await response.data.pipe(fs.createWriteStream(path));
  console.log(color.green("Downloaded"), path);
}

client.login(process.env.TOKEN);
