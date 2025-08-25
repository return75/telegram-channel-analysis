const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const apiId = 27551667;
const apiHash = "fb00dcbf80562d3444537f792e3762af";

const stringSession = new StringSession("");


(async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
        // proxy: {
        //     ip: "127.0.0.1",
        //     port: 1080,
        //     socksType: 5
        // }
    });

    await client.start({
        phoneNumber: async () => prompt("شماره‌تو وارد کن: "),
        password: async () => prompt("پسورد 2FA (اگه داری): "),
        phoneCode: async () => prompt("کدی که تلگرام فرستاده: "),
        onError: (err) => console.log(err),
    });

    console.log("🚀 لاگین شدی!");
    console.log("🔑 سشن:", client.session.save());

    client.addEventHandler((event) => {
        const msg = event.message;
        console.log("📩 پست جدید:", msg.message);
    }, new client._eventBuilders.NewMessage({ chats: ["@cloud_hesoyam"] }));
})();
