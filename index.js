import { TelegramClient } from 'telegram';
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import fs from "fs";
import path from 'path';
import AdmZip from 'adm-zip';
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
         let text = convertTextBufferToText(buffer)
         handleTextContent(text)
    } else if (extension === 'zip') {
        const buffer = await client.downloadMedia(media, { workers: 1 });
        handleZipBuffer(buffer)
    }
}

const handleZipBuffer = buffer => {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    zipEntries.forEach(entry => {
        const fileName = path.basename(entry.entryName);
        if (fileName === 'All Passwords.txt') {
            const content = entry.getData().toString('utf8');
            handleTextContent(content)
        }
    });
}

const convertTextBufferToText = (buffer) => {
    return buffer.toString("utf-8");
}

const handleTextContent = text => {
    let fileType = analyzeText(text)
    let userPassRecords = []
    if (fileType === 'multiLine') {
       userPassRecords = extractDataFromType1File(text);
    } else if (fileType === 'colonFormat') {
       userPassRecords = extractDataFromType2File(text);
    }
    insertRecordsInDataBase(userPassRecords)
}

const analyzeText = fileContent => {
    const first100Lines = fileContent.split(/\r?\n/).slice(0, 100);

    const isMultiLineFormat = first100Lines.some(line => line.startsWith('SOFT:'))
    if (isMultiLineFormat)  return 'multiLine'

    const isColonFormat = first100Lines.some(line => /^https?:\/\/.+?:.+?:.+$/.test(line));
    if (isColonFormat)  return 'colonFormat'

    return '';
}

const extractDataFromType1File = (fileContent) => {
    const lines = fileContent.split(/\r?\n/);
    const records = [];
    let currentRecord = {};

    for (const line of lines) {
        const urlMatch = line.match(/^URL:\s*(.+)$/);
        const userMatch = line.match(/^USER:\s*(.+)$/);
        const passMatch = line.match(/^PASS:\s*(.+)$/);

        if (urlMatch) currentRecord.url = urlMatch[1].trim();
        if (userMatch) currentRecord.username = userMatch[1].trim();
        if (passMatch) {
            currentRecord.password = passMatch[1].trim();
            records.push({ ...currentRecord });
            currentRecord = {};
        }
    }

    return records;
}

const extractDataFromType2File = (fileContent) => {
    const lines = fileContent.split(/\r?\n/);
    const records = [];

    for (const line of lines) {
        const match = line.match(/^(https?:\/\/.+?):(.+?):(.+)$/);
        if (match) {
            const [_, url, username, password] = match;
            records.push({
                url: url.trim(),
                username: username.trim(),
                password: password.trim()
            });
        }
    }

    return records;
}

const insertRecordsInDataBase = (records) => {
    console.log('records', records)
}

const analyzeZipFile = () => {
    const filePath = './my-zip.zip';
    const buffer = fs.readFileSync(filePath);
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    zipEntries.forEach(entry => {
        const fileName = path.basename(entry.entryName);
        if (fileName === 'All Passwords.txt') {
            const content = entry.getData().toString('utf8');
            handleTextContent(content)
        }
    });
}


//run()
analyzeZipFile()