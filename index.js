import { TelegramClient } from 'telegram';
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import fs from "fs";
import PromptSync from 'prompt-sync';


const prompt = PromptSync();
const apiId = 27551667;
const apiHash = "fb00dcbf80562d3444537f792e3762af";

let run = async () => {
    const sessionString = fs.readFileSync("session.txt", "utf-8")
    const session = sessionString ? new StringSession(sessionString) : new StringSession("")
    let client = new TelegramClient(session, apiId, apiHash, {
        connectionRetries: 5,
    });
    await startClient(client)
    listenToChats(client, ['@CloudHesoyam', '@soloAnalyze'])
}

let startClient = async (client) => {
    await client.start({
        phoneNumber: async () => prompt("شماره‌تو وارد کن: "),
        password: async () => prompt("پسورد 2FA (اگه داری): "),
        phoneCode: async () => prompt("کدی که تلگرام فرستاده: "),
        onError: (err) => console.log(err),
    });
    const sessionString = client.session.save();
    fs.writeFileSync("session.txt", sessionString);
    console.log("Session Started");
}

let listenToChats = (client, chats) => {
    client.addEventHandler(async (event) => {
        const message = event.message;
        console.log("new Message:", message.text);
    }, new NewMessage({chats}));
}

run()