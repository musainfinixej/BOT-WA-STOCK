const { GoogleSpreadsheet } = require("google-spreadsheet");

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

  // =========================
  // FITUR !stok
  // =========================

  sock.ev.on("messages.upsert", async ({ messages }) => {

    const msg = messages[0];

    if (!msg.message) return;

    const text =
  msg.message.conversation ||
  msg.message.extendedTextMessage?.text ||
  "";

    const from = msg.key.remoteJid;

    console.log("PESAN MASUK:", text);

    // COMMAND
    if (text === "!stok") {

      try {

        // Spreadsheet
        const doc = new GoogleSpreadsheet(
          "1-YH8NuZBQ86nUVPF-tzwIsR6qNrX1jLZQhpILWVy-Tg"
        );

        // API KEY
        await doc.useApiKey(
          "AIzaSyAPEbgpe0g8bbHnVI3b-ixfw9CPioVrS-E"
        );

        // Load Spreadsheet
        await doc.loadInfo();

        // Sheet pertama
        const sheet = doc.sheetsByIndex[0];

        // Ambil semua row
        const rows = await sheet.getRows();

        let reply = "*DATA STOK*\n\n";

        rows.forEach((row) => {

          reply +=
            `${row.Barang} - ${row.Stok}\n`;

        });

        // Kirim balasan
        await sock.sendMessage(from, {
          text: reply
        });

      } catch (err) {

        console.log("ERROR:", err);

        await sock.sendMessage(from, {
          text: "Gagal mengambil data spreadsheet"
        });
      }
    }
  });
}

startBot();