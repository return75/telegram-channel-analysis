import { TelegramClient } from 'telegram';
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import fs from "fs";
import PromptSync from 'prompt-sync';


const prompt = PromptSync();
const apiId = 27551667;
const apiHash = "fb00dcbf80562d3444537f792e3762af";

const run = async () => {
    const sessionString = fs.readFileSync("session.txt", "utf-8")
    const session = sessionString ? new StringSession(sessionString) : new StringSession("")
    let client = new TelegramClient(session, apiId, apiHash, {
        connectionRetries: 5,
    });
    await startClient(client)
    listenToChats(client, ['@CloudHesoyam', '@soloAnalyze'])
}

const startClient = async (client) => {
    await client.start({
        phoneNumber: async () => prompt("Enter your phone number in international format: (like +989154326509): "),
        password: async () => prompt("Enter your 2FA password: "),
        phoneCode: async () => prompt("Enter telegram code: "),
        onError: (err) => console.log(err),
    });
    const sessionString = client.session.save();
    fs.writeFileSync("session.txt", sessionString);
    console.log("Session Started");
}

const listenToChats = (client, chats) => {
    client.addEventHandler(async (event) => {
        const message = event.message;
        handleMedia(message.media, client)
       // console.log("event: ", event);
    }, new NewMessage({chats}));
}

const handleMedia = (media, client) => {
    if (!media) return
    handleMediaDocument(media, client)
}

const handleMediaDocument = async (media, client) => {
    if (!media.document) return

    const fileNameAttr = media.document.attributes.find(attr => attr.className === "DocumentAttributeFilename");
    const fileName = fileNameAttr ? fileNameAttr.fileName : "unknown";
    const extension = fileName.split(".").pop();
    console.log("fileName & extension:", fileName , extension);

    if (extension === 'txt') {
         const buffer = await client.downloadMedia(media, { workers: 1 });
         handleTextBuffer(buffer)
    }
}

const handleTextBuffer = buffer => {
    const text = buffer.toString("utf-8");
    analyzeText(text)
}

const analyzeText = text => {

}

run()