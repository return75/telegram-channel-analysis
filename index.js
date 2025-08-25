import { TelegramClient } from 'telegram';
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events";

import PromptSync from 'prompt-sync';
const prompt = PromptSync();

const apiId = 27551667;
const apiHash = "fb00dcbf80562d3444537f792e3762af";

const stringSession = new StringSession("");

let run = async () => {
    let client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    await startClient(client)
    listenToChats(client, ['@CloudHesoyam'])
}

let startClient = async (client) => {
    await client.start({
        phoneNumber: async () => prompt("شماره‌تو وارد کن: "),
        password: async () => prompt("پسورد 2FA (اگه داری): "),
        phoneCode: async () => prompt("کدی که تلگرام فرستاده: "),
        onError: (err) => console.log(err),
    });
    const sessionString = client.session.save();
    console.log("Session saved:", sessionString);
}

let listenToChats = (client, chats) => {
    client.addEventHandler(async (event) => {
        const message = event.message;
        console.log("پیام جدید:", message.text);
    }, new NewMessage({}));
}

run()