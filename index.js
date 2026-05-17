const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("BOT ONLINE");
});

app.listen(3000, () => {
  console.log("SERVER RUNNING");
});

async function startBot() {

  const { state, saveCreds } =
    await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state
  });

  sock.ev.on("connection.update", (update) => {

    const { connection, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("WHATSAPP CONNECTED");
    }

    if (connection === "close") {
      console.log("RECONNECTING...");
      startBot();
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

startBot();