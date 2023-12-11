const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, MessageType, Mimetype } = require("@adiwajshing/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const axios = require('axios');
const path = require("path");
const _ = require('lodash');
const os = require('os');
const gTTS = require('gtts');
const PDF = require('pdfkit');
//const fetch = require('node-fetch');
const imageDataUri = require('image-data-uri');
const ytdl = require('ytdl-core');
const readFileAsync = util.promisify(fs.readFile);
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const { decryptMedia } = require('@open-wa/wa-decrypt');
const { createStickerPack, createSticker } = require('@open-wa/wa-automate');
const { v4: uuidv4 } = require('uuid');
const nekobot = require('nekobot-hentai');
const hentai = nekobot.Hentai;
const { Configuration, OpenAIApi } = require("openai");
const { setApiKey, generateDeepAIImage } = require('./deepai');
const { generateStableDiffusionImage } = require('./stabel');
let setting = require("./key.json");
const { fetchJson, getBuffer } = require('./lib/fetcher');
const { getRandom } = require('./lib/function');
const database = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
const fiturData = JSON.parse(fs.readFileSync('./fitur.json', 'utf8'));
const badWordList = JSON.parse(fs.readFileSync('./kata_kasar.json', 'utf8'));
const now = new Date();
const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'Asia/Jakarta' };
const formattedDate = now.toLocaleDateString('id-ID', dateOptions);
const formattedTime = now.toLocaleTimeString('id-ID', timeOptions);
const ownerName = "YuuXD";
const botName = "LinguaBot";
const ownerNumber = ["6289689075040@s.whatsapp.net"];
const apikey = "NatasyaMine";
const openaiapi = setting.keyopenai;
const dalleimageSize = '1024x1024';
let tebaklagu = []
let kuismath = []
let tebakgambar = []
let tebakkata = []
let tebakkalimat = []
let tebaklirik = []
let tebaktebakan = []
let tebakbendera = []
let tebakbendera2 = []
let tebakkabupaten = []
let tebakkimia = []
let tebakasahotak = []
let tebaksiapakahaku = []
let tebaksusunkata = []
let tebaktekateki = []


function addRequest(from, request) {
  const requestData = fs.readFileSync('request.json', 'utf8');
  let requests = [];

  if (requestData) {
    requests = JSON.parse(requestData);
  }

  requests.push({
    from,
    request
  });

  fs.writeFileSync('request.json', JSON.stringify(requests, null, 2), 'utf8');
}


function getRandomElement(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function getMentions(content) {
  const entities = content.contextInfo?.quotedMessage?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  return entities.map(entity => entity.split('@')[0]);
}
function isBlocked(nomorTujuan) {
  return _.some(database, { nomorTujuan, status: 'blocked' });
}

function containsBadWords(pesan) {
  const words = pesan.toLowerCase().split(' ');
  return words.some((word) => badWordList.includes(word));
}



// Helper function to increment user status and return the updated status
function incrementUserStatus(nomorTujuan) {
  const user = _.find(database, { nomorTujuan });

  if (user) {
    user.status += 1;
    fs.writeFileSync('database.json', JSON.stringify(database, null, 2), 'utf8');
    return user.status;
  } else {
    // If the user is not found, add a new entry to the database
    const newUser = {
      nomorTujuan,
      status: 1,
    };
    database.push(newUser);
    fs.writeFileSync('database.json', JSON.stringify(database, null, 2), 'utf8');
    return 1;
  }
}

async function convertStickerToImage(stickerPath) {
  try {
    const result = await client.getStickerInfo(stickerPath);
    if (result.isAnimated) {
      return null; // Tidak bisa mengonversi stiker animasi.
    }
    const imageBuffer = await client.decryptMedia(result);
    return imageBuffer;
  } catch (error) {
    console.error('Error converting sticker to image:', error);
    return null;
  }
}

// Helper function to block a number
function blockNumber(nomorTujuan) {
  const user = _.find(database, { nomorTujuan });
  if (user) {
    user.status = 'blocked';
    fs.writeFileSync('database.json', JSON.stringify(database, null, 2), 'utf8');
  }
}

function speed() {
  return new Date().getTime();
}

function runtime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours} jam ${minutes} menit ${remainingSeconds} detik`;
}

function formatp(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function isOwner(sender) {
  return ownerNumber.includes(sender);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const stickersDir = path.join(__dirname, "stickers");
if (!fs.existsSync(stickersDir)) {
  fs.mkdirSync(stickersDir);
}

function toM(a) {
  return '@' + a.split('@')[0];
}

async function downloadImage(url, localPath) {
  const response = await fetch(url);
  const buffer = await response.buffer();

  // Get the file extension from the URL
  const fileExtension = path.extname(url);

  // Save the image with the correct file extension
  fs.writeFileSync(localPath + fileExtension, buffer);
}

async function createPdfFromImages(images, outputPath, options) {
  const pdf = new PDF(options);

  // Create a temporary folder to store downloaded images
  const tempFolder = 'temp_images';
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }

  // Download and embed each image in the PDF
  for (let i = 0; i < images.length; i++) {
    const imageUrl = images[i];
    const localPath = `${tempFolder}/image_${i + 1}`;

    await downloadImage(imageUrl, localPath);

    pdf.image(`${localPath}.jpg`, { width: 500 });
    pdf.moveDown();
  }

  pdf.pipe(fs.createWriteStream(outputPath));
  pdf.end();

  // Remove the temporary folder and its contents
  fs.rmdirSync(tempFolder, { recursive: true });

  console.log('PDF created successfully');
}

async function getSoalTebakGambar() {

  // Call API to get quiz data 
  const response = await fetch('https://raw.githubusercontent.com/ramadhankukuh/database/master/src/games/tebakgambar.json');

  // Parse response to JSON
  const data = await response.json();

  // Return array of quiz data
  return data.map(item => {
    return {
      image: item.img,
      caption: item.deskripsi,
      jawaban: item.jawaban
    }
  });

}

const generateDalleImage = async (prompt, numberOfImages) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: prompt,
        n: numberOfImages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiapi}`,
        },
      }
    );

    const generatedImageUrls = response.data.data.map(item => item.url);
    return generatedImageUrls;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

module.exports = yuu = async (client, m, chatUpdate, store, chatId) => {
  try {
    var body = m.mtype === "conversation"
      ? m.message.conversation
      : m.mtype == "imageMessage"
        ? m.message.imageMessage.caption
        : m.mtype == "videoMessage"
          ? m.message.videoMessage.caption
          : m.mtype == "extendedTextMessage"
            ? m.message.extendedTextMessage.text
            : m.mtype == "buttonsResponseMessage"
              ? m.message.buttonsResponseMessage.selectedButtonId
              : m.mtype == "listResponseMessage"
                ? m.message.listResponseMessage.singleSelectReply.selectedRowId
                : m.mtype == "templateButtonReplyMessage"
                  ? m.message.templateButtonReplyMessage.selectedId
                  : m.mtype === "messageContextInfo"
                    ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text
                    : "";
    var budy = typeof m.text == "string" ? m.text : "";
    var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
    const isCmd2 = body.startsWith(prefix);
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const botNumber = await client.decodeJid(client.user.id);
    const itsMe = m.sender == botNumber ? true : false;
    let text = (q = args.join(" "));
    const arg = budy.trim().substring(budy.indexOf(" ") + 1);
    const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);
    const isMedia = m.type === 'image' || m.type === 'video';

    const from = m.chat;
    const reply = m.reply;
    const sender = m.sender;
    const mek = chatUpdate.messages[0];

    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };

    const senderContact = sender && sender.contact ? sender.contact : null;

    // Group
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch((e) => { }) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";

    // Push Message To Console
    let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;
    let oldd = 0;
    let neww = 0;
    let fiturData = [];

    // Check if the message has a quoted message
    const quotedMsg = m.quoted || {};
    const isQuotedSticker = quotedMsg.type === 'sticker';
    const stickermsg = m.type === 'sticker';


    if (isCmd2 && !m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`)
      );
    } else if (isCmd2 && m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")}]`),
        chalk.blueBright("IN"),
        chalk.green(groupName)
      );
    }
    if (tebakgambar[m.sender.split('@s.whatsapp.net')[0]] && m.quoted) {

      // Ambil jawaban yg tersimpan
      const jawaban = tebakgambar[m.sender.split('@s.whatsapp.net')[0]].jawaban

      // Cek jawaban
      if (m.quoted.text.toLowerCase() == jawaban.toLowerCase()) {
        reply('Selamat jawaban kamu benar!')
        clearTimeout(tebakgambar[m.sender.split('@s.whatsapp.net')[0]].waktu) // Clear timeout
        delete tebakgambar[m.sender.split('@s.whatsapp.net')[0]] // Hapus sesi
      } else {
        reply('Jawaban salah!')
      }

    }




    if (isCmd2) {
      switch (command) {
        case "help":
        case "menu":
          m.reply(`
╭───「 ${botName} 」
│
│  Hallo kak ${pushname} !
│
│  Owner : ${ownerName}
│  Status: Online
│  📆 ${formattedDate}
│  ⏰ ${formattedTime} WIB
│
├──「 Have Fun 」
│
├ • ${prefix}cekcinta (nama1 dan nama2)
├ • ${prefix}cekgay (nama)
├ • ${prefix}kapan (text)
├ • ${prefix}bisakah (text)
├ • ${prefix}apakah (text)
├ • ${prefix}nilaijoke (text)
├ • ${prefix}truth
├ • ${prefix}dare
├ • ${prefix}katakata
├ • ${prefix}motivasi
│
├──「 PhotoOxy 」
│
├ • ${prefix}flaming
├ • ${prefix}shadow
├ • ${prefix}metallic
├ • ${prefix}naruto
├ • ${prefix}pubg
├ • ${prefix}rainbow
├ • ${prefix}underwater
│
├──「 Search 」
│
├ • ${prefix}pinterest (query)
├ • ${prefix}steam (query)
├ • ${prefix}doujindesu (query)
├ • ${prefix}wikimedia (query)
├ • ${prefix}ytsearch (query)
│
├──「 Downloader 」
│
├ • ${prefix}twtmp3 (url)
├ • ${prefix}twtmp4 (url)
├ • ${prefix}doujindesudl (url)
│
├──「 Random Image 」
│
├ • ${prefix}jkt48 (Maintenance)
├ • ${prefix}loli
├ • ${prefix}cat
├ • ${prefix}milf
├ • ${prefix}cecanchina
├ • ${prefix}cecanvietnam
├ • ${prefix}cecanthailand
├ • ${prefix}cecankorea
├ • ${prefix}cecanjapan
│
├──「 18+ 」
│
├ • ${prefix}ass
├ • ${prefix}cosplay
├ • ${prefix}cukold
├ • ${prefix}cum
├ • ${prefix}ero
├ • ${prefix}paptt
├ • ${prefix}paizuri
├ • ${prefix}neko
├ • ${prefix}trap
├ • ${prefix}oral
├ • ${prefix}waifu
├ • ${prefix}nude
│
├──「 Other 」
│
├ • ${prefix}ping
├ • ${prefix}request (text)
│
├──「 Ai 」
│
├ • ${prefix}ai (text)
├ • ${prefix}simi (text)
├ • ${prefix}img (Maintenance)
│
╰───「 ${ownerName} 」

`)
          break;

        case 'igstalk':
          try {
            if (!args) return reply('Masukkan username Instagram.');

            const response = await axios.get(`https://api-fgmods.ddns.net/api/search/igstalk?username=${args}&apikey=vTFnxdsc`);
            const result = response.data.result;

            if (result) {
              const caption12 = `
                Name: ${result.name || 'Tidak ada nama'}
                Username: ${result.username || 'Tidak ada username'}
                Description: ${result.description || 'Tidak ada deskripsi'}
                Posts: ${result.posts || '0'}
                Followers: ${result.followersH || '0'} (${result.followers || '0'})
                Following: ${result.followingH || '0'} (${result.following || '0'})
              `;

              await client.sendImage(from, result.profilePic, caption12);
            } else {
              reply('Tidak dapat mengambil informasi dari username Instagram tersebut.');
            }
          } catch (err) {
            console.error('Error:', err);
            reply('Terjadi kesalahan saat memproses permintaan.');
          }
          break;


        case 'ytmp3':
          try {
            if (!args) return reply('Masukkan URL YouTube.');

            const response = await axios.get(`https://api-fgmods.ddns.net/api/downloader/ytmp3?url=${args}&apikey=vTFnxdsc`);
            const result = response.data.result;

            if (result) {
              // Kirim thumbnail dengan caption title dan size
              const thumbCaption = `
                Title: ${result.title || 'Tidak ada judul'}
                Size: ${result.size || 'Tidak ada ukuran'}
              `;
              await client.sendImage(from, result.thumb, thumbCaption);

              // Unduh audio dan kirimkan
              const audioBuffer = await axios.get(result.dl_url, { responseType: 'arraybuffer' });
              await client.sendMessage(from, { audio: { url: result.dl_url }, mimetype: 'audio/mp4' }, { quoted: mek });
            } else {
              reply('Tidak dapat mengambil informasi atau audio dari URL YouTube tersebut.');
            }
          } catch (err) {
            console.error('Error:', err);
            reply('Terjadi kesalahan saat memproses permintaan.');
          }
          break;




        case 'ytsearch':
          try {
            if (!args) return reply('Masukkan kata kunci');

            const search = await axios.get(`https://pnggilajacn.my.id/api/search/youtube?query=${args}`)

            const data = search.data;

            if (data.status && data.result && data.result.length > 0) {
              const firstResult = data.result[0];

              const caption = `
                Judul: ${firstResult.title || 'Tidak ada judul'}\nURL: ${firstResult.url || 'Tidak ada URL'}
              `.trim();

              await client.sendImage(from, firstResult.thumbnail, caption);
            } else {
              reply('Tidak ada hasil ditemukan.');
            }
          } catch (err) {
            console.error('Error:', err);
            reply('Terjadi kesalahan saat melakukan pencarian.');
          }
          break;



        case 'joke':
          const jokePath = path.join(__dirname, 'database', 'joke.json');
          const jokes = JSON.parse(fs.readFileSync(jokePath, 'utf-8'));
          // Ambil satu lelucon secara acak
          const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

          // Kirim lelucon ke pengguna
          await reply(randomJoke.joke);
          break;

        case 'tebakgambar':

          // Ambil data soal 
          const data = await getSoalTebakGambar()
          const soal = data[Math.floor(Math.random() * data.length)]

          // Kirim gambar dan deskripsi
          await client.sendImage(m.chat, soal.image, soal.caption)

          // Simpan jawaban di sesi
          tebakgambar[m.sender] = {
            jawaban: soal.jawaban
          }

          // Berikan waktu timeout untuk menjawab
          setTimeout(() => {
            // Jika belum terjawab, jawaban salah
            if (tebakgambar[m.sender]) {
              reply(`Waktu habis, jawabannya adalah ${soal.jawaban}`)
              delete tebakgambar[m.sender]
            }
          }, 60000) // 60 detik

          break;

        case 'cecanchina':

          const apiUrl28 = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/cecan/china?apikey=OnlyNatasya`;

          try {
            // Mengambil foto dari API
            const response = await axios.get(apiUrl28, { responseType: 'arraybuffer' });

            // Mengirim foto ke pengguna
            await client.sendImage(from, response.data, 'Nih Kak...');
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat mengambil gambar.');
          }
          break;

        case 'cecanvietnam':

          const apiUrl29 = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/cecan/vietnam?apikey=OnlyNatasya`;

          try {
            // Mengambil foto dari API
            const response = await axios.get(apiUrl29, { responseType: 'arraybuffer' });

            // Mengirim foto ke pengguna
            await client.sendImage(from, response.data, 'Nih Kak...');
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat mengambil gambar.');
          }
          break;

        case 'cecanthailand':

          const apiUrl30 = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/cecan/thailand?apikey=OnlyNatasya`;

          try {
            // Mengambil foto dari API
            const response = await axios.get(apiUrl30, { responseType: 'arraybuffer' });

            // Mengirim foto ke pengguna
            await client.sendImage(from, response.data, 'Nih Kak...');
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat mengambil gambar.');
          }
          break;

        case 'cecankorea':

          const apiUrl31 = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/cecan/korea?apikey=OnlyNatasya`;

          try {
            // Mengambil foto dari API
            const response = await axios.get(apiUrl31, { responseType: 'arraybuffer' });

            // Mengirim foto ke pengguna
            await client.sendImage(from, response.data, 'Nih Kak...');
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat mengambil gambar.');
          }
          break;

        case 'cecanjapan':

          const apiUrl32 = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/cecan/japan?apikey=OnlyNatasya`;

          try {
            // Mengambil foto dari API
            const response = await axios.get(apiUrl32, { responseType: 'arraybuffer' });

            // Mengirim foto ke pengguna
            await client.sendImage(from, response.data, 'Nih Kak...');
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat mengambil gambar.');
          }
          break;

        case 'ytmp3':
          if (!args[0]) return reply('Urlnya mana kak?')

          try {

            const url = args[0]
            const info = await ytdl.getInfo(url)

            reply(`Sedang diunduh ${info.videoDetails.title}`)

            ytdl(url)
              .pipe(fs.createWriteStream(`./${info.videoDetails.title}.mp3`))
              .on('finish', async () => {

                const buffer = fs.readFileSync(`./${info.videoDetails.title}.mp3`)
                await client.sendMessage(from, { audio: buffer, mimetype: 'audio/mp3' }, { quoted: m })

                fs.unlinkSync(`./${info.videoDetails.title}.mp3`)
              })

          } catch (err) {
            reply('Terjadi kesalahan, coba lagi')
          }

          break;


        case 'simi':
          if (args.length < 1) {
            reply('Harap sertakan pertanyaan yang ingin Anda tanyakan kepada SIMI.');
            return;
          }

          const query16 = args.join(' '); // Menggabungkan argumen menjadi satu pertanyaan
          const apiUrl11 = `https://pnggilajacn.my.id/api/other/simi2?query=${encodeURIComponent(query16)}`;

          axios.get(apiUrl11)
            .then(response => {
              const data = response.data;
              if (data.status && data.result) {
                // Mengambil teks dari respons dan mengirimkannya ke pengguna
                reply(data.result);
              } else {
                // Menampilkan pesan acak jika tidak ada jawaban dari SIMI
                const randomMessages = [
                  'Kata-kata yang bagus, tetapi SIMI tidak memahaminya.. 😕',
                  'SIMI tidak memahami kata-kata itu 😖'
                ];
                const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
                reply(randomMessage);
              }
            })
            .catch(error => {
              console.error('Error:', error);
              reply('Terjadi kesalahan dalam menghubungi SIMI.');
            });
          break;

        case 'githubstalk':
          if (!args[0]) {
            reply('Harap sertakan username GitHub yang ingin Anda stalk.');
            return;
          }

          const username = args[0];
          const apiUrl15 = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/other/github-stalk?username=${username}&apikey=OnlyNatasya`;

          try {
            const response = await axios.get(apiUrl15);
            const data = response.data.result.user;

            // Memeriksa apakah data user tersedia
            if (!data) {
              reply('Tidak dapat menemukan informasi untuk pengguna GitHub tersebut.');
              return;
            }

            // Menyiapkan pesan
            const message = `*GitHub Stalk Result*\n*Username:* ${data.username}\n*Bio:* ${data.bio || 'Tidak ada bio.'}\n*Public Repos:* ${data.publicRepos}\n*Public Gists:* ${data.publicGists}\n*Followers:* ${data.followers}\n*Following:* ${data.following}\n*Created At:* ${data.createdAt}\n*Updated At:* ${data.updatedAt}
            `;

            // Mengirim pesan ke pengguna
            await client.sendImage(from, data.avatarUrl, message);
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat mencari informasi GitHub.');
          }
          break;

        case 'flaming':
          if (!args[0]) {
            reply('Harap sertakan teks yang ingin Anda tambahkan pada efek flaming.');
            return;
          }

          const text12 = encodeURIComponent(args.join(' '));
          const apiUrl12 = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/photooxy/flaming?text=${text12}&apikey=OnlyNatasya`;

          try {
            // Mengambil foto dari API
            const response = await axios.get(apiUrl12, { responseType: 'arraybuffer' });

            // Mengirim foto ke pengguna
            await client.sendImage(from, response.data, 'Berikut adalah foto dengan efek flaming.');
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat memproses efek.');
          }
          break;

        case 'shadow':
          if (!args[0]) {
            reply('Harap sertakan teks yang ingin Anda tambahkan pada efek shadow.');
            return;
          }

          const text22 = encodeURIComponent(args.join(' '));
          const apiUrl22 = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/photooxy/shadow-sky?text=${text22}&apikey=OnlyNatasya`;

          try {
            // Mengambil foto dari API
            const response = await axios.get(apiUrl22, { responseType: 'arraybuffer' });

            // Mengirim foto ke pengguna
            await client.sendImage(from, response.data, 'Berikut adalah foto dengan efek shadow.');
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat memproses efek.');
          }
          break;


        case 'metalic':
          if (!args[0]) {
            reply('Harap sertakan teks yang ingin Anda tambahkan pada efek metalic.');
            return;
          }

          const text23 = encodeURIComponent(args.join(' '));
          const apiUrl23 = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/photooxy/metallic?text=${text23}&apikey=OnlyNatasya`;

          try {
            // Mengambil foto dari API
            const response = await axios.get(apiUrl23, { responseType: 'arraybuffer' });

            // Mengirim foto ke pengguna
            await client.sendImage(from, response.data, 'Berikut adalah foto dengan efek metalic.');
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat memproses efek.');
          }
          break;

        case 'naruto':
          if (!args[0]) {
            reply('Harap sertakan teks yang ingin Anda tambahkan pada efek naruto.');
            return;
          }

          const text24 = encodeURIComponent(args.join(' '));
          const apiUrl24 = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/photooxy/naruto?text=${text24}&apikey=OnlyNatasya`;

          try {
            // Mengambil foto dari API
            const response = await axios.get(apiUrl24, { responseType: 'arraybuffer' });

            // Mengirim foto ke pengguna
            await client.sendImage(from, response.data, 'Berikut adalah foto dengan efek naruto.');
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat memproses efek.');
          }
          break;

        case 'pubg':
          if (args.length < 2) {
            reply(`Example ${prefix}${command} Yuu XD`);
            return;
          }

          const text1 = encodeURIComponent(args[0]);
          const text2 = encodeURIComponent(args[1]);
          const apiUrlPubg = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/photooxy/pubg-mobile?text=${text1}&text2=${text2}&apikey=OnlyNatasya`;

          try {
            // Mengambil foto dari API
            const response = await axios.get(apiUrlPubg, { responseType: 'arraybuffer' });

            // Mengirim foto ke pengguna
            await client.sendImage(from, response.data, 'Berikut adalah foto dengan efek pubg');
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat memproses efek.');
          }
          break;


        case 'rainbow':
          if (!args[0]) {
            reply('Harap sertakan teks yang ingin Anda tambahkan pada efek rainbow.');
            return;
          }

          const text26 = encodeURIComponent(args.join(' '));
          const apiUrl26 = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/photooxy/rainbow?text=${text26}&apikey=OnlyNatasya`;

          try {
            // Mengambil foto dari API
            const response = await axios.get(apiUrl26, { responseType: 'arraybuffer' });

            // Mengirim foto ke pengguna
            await client.sendImage(from, response.data, 'Berikut adalah foto dengan efek rainbow.');
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat memproses efek.');
          }
          break;

        case 'underwater':
          if (!args[0]) {
            reply('Harap sertakan teks yang ingin Anda tambahkan pada efek underwater.');
            return;
          }

          const text27 = encodeURIComponent(args.join(' '));
          const apiUrl27 = `https://yuuxd-rest-api-1.yuuxdrestapi.repl.co/api/photooxy/underwater?text=${text27}&apikey=OnlyNatasya`;

          try {
            // Mengambil foto dari API
            const response = await axios.get(apiUrl27, { responseType: 'arraybuffer' });

            // Mengirim foto ke pengguna
            await client.sendImage(from, response.data, 'Berikut adalah foto dengan efek underwater.');
          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat memproses efek.');
          }
          break;

        case 'ai':
          if (args.length < 1) {
            reply('Harap sertakan pertanyaan yang ingin Anda tanyakan kepada AI.');
            return;
          }

          const query0 = args.join(' '); // Menggabungkan argumen menjadi satu pertanyaan
          const apiUrl1 = `https://pnggilajacn.my.id/api/other/openai?query=${encodeURIComponent(query0)}`;

          axios.get(apiUrl1)
            .then(response => {
              const data = response.data;
              if (data.status && data.result) {
                // Mengambil teks dari respons dan mengirimkannya ke pengguna
                reply(data.result);
              } else {
                // Menampilkan pesan kesalahan jika tidak ada respons dari AI
                reply('Maaf, AI tidak memberikan respons saat ini.');
              }
            })
            .catch(error => {
              console.error('Error:', error);
              reply('Terjadi kesalahan dalam menghubungi AI.');
            });
          break;



        case 'ytmp3':

          if (!args[0]) return reply('Harap sertakan URL video Twitter!')

          const url2 = args[0]

          axios.get(`https://pnggilajacn.my.id/api/download/ytmp3?url=${url2}`)
            .then(async res => {

              const result = res.data.result

              if (result.download) {

                await client.sendMessage(from, { audio: { url: result.download }, mimetype: 'audio/mp4' }, { quoted: mek })

              } else {

                reply('Audio tidak tersedia untuk video ini.')

              }

            })
            .catch(err => {

              reply('Terjadi kesalahan, silahkan coba lagi.')

            })

          break;

        case 'doujindesu':
          if (!args[0]) {
            reply('Harap sertakan kata kunci pencarian untuk doujinshi.');
            return;
          }

          const query7 = args.join(' ');
          const apiUrl8 = `https://pnggilajacn.my.id/api/anime/doujindesu/search?query=${query7}`;

          axios.get(apiUrl8)
            .then(response => {
              reply('Tunggu Sebentar...⌛');
              const doujinshiList = response.data;
              if (doujinshiList && doujinshiList.length > 0) {
                const doujinshi = doujinshiList[0]; // Ambil data dari indeks pertama

                const thumbnail = doujinshi.thumbnail;
                const title = doujinshi.title;
                const type = doujinshi.type;
                const score = doujinshi.score;
                const url = doujinshi.url;

                // Kirim gambar dengan keterangan
                client.sendImage(
                  from,
                  thumbnail,
                  `Doujinshi Title: ${title}\nType: ${type}\nScore: ${score}\nURL: ${url}`
                );
              } else {
                reply('Tidak ada doujin yang ditemukan.');
              }
            })
            .catch(error => {
              console.error('Error:', error);
              reply('Terjadi kesalahan saat mencari doujinshi.');
            });

          break;

        case 'milf':
          try {
            const response = await axios.get('https://api.waifu.im/search?milf');
            if (response.data.images && response.data.images.length > 0) {
              const milfImageUrl = response.data.images[0].url;

              // Kirim gambar "milf" ke pengguna
              await client.sendImage(from, milfImageUrl, 'Ini dia gambar "Milf" 🥰');
            } else {
              // Tangani jika tidak ada gambar "milf" yang ditemukan
              client.reply(from, 'Maaf, tidak ada gambar "milf" yang ditemukan saat ini.');
            }
          } catch (error) {
            console.error('Error:', error);
            // Tangani kesalahan jika terjadi kesalahan saat mengambil gambar "milf"
            client.reply(from, 'Terjadi kesalahan saat mengambil gambar "milf".');
          }
          break;


        case 'cat':
          try {
            const response = await axios.get('https://api.thecatapi.com/v1/images/search');
            if (response.data && response.data.length > 0) {
              const catImageUrl = response.data[0].url;

              // Kirim gambar kucing ke pengguna
              await client.sendImage(from, catImageUrl, 'Meow! 🐱');
            } else {
              // Tangani jika tidak ada gambar kucing yang ditemukan
              reply(from, 'Maaf, tidak ada gambar kucing yang ditemukan saat ini.');
            }
          } catch (error) {
            console.error('Error:', error);
            // Tangani kesalahan jika terjadi kesalahan saat mengambil gambar kucing
            reply(from, 'Terjadi kesalahan saat mengambil gambar kucing.');
          }
          break;

        case 'doujindesudl':
          if (!args[0]) {
            reply('Harap sertakan URL doujin dari Doujindesu yang ingin Anda unduh.');
            return;
          }

          const link = args[0];
          const apiUrl4 = `https://pnggilajacn.my.id/api/anime/doujindesu/detail?url=${link}`;

          axios.get(apiUrl4)
            .then(response => {
              reply('Tunggu Sebentar...⌛');
              const doujinDetail = response.data;
              const title = doujinDetail.title;
              const links = doujinDetail.links;

              if (title && links && links.length > 0) {
                let message = `Title: ${title}\n\nUnduh Chapter:\n`;
                links.forEach((link, index) => {
                  message += `${index + 1}. ${link.title}\n${link.url}\n\n`;
                });

                // Kirim pesan ke pengguna
                client.sendText(from, message);
              } else {
                reply('Tidak ada doujin yang ditemukan.');
              }
            })
            .catch(error => {
              console.error('Error:', error);
              reply('Terjadi kesalahan saat mencari detail doujin.');
            });

          break;




        /*case 'tebakgambar': // case by piyo-chan
                  if (tebakgambar.hasOwnProperty(sender.split('@')[0])) return reply("Selesein yg sebelumnya dulu atuh")
                  get_result = await fetchJson(`https://api.lolhuman.xyz/api/tebak/gambar?apikey=${apikey}`)
                  get_result = get_result.result
                  ini_image = get_result.image
                  jawaban = get_result.answer
                  ini_buffer = await getBuffer(ini_image)
                  await client.sendMessage(from, ini_buffer, image, { quoted: lol, caption: "Jawab gk? Jawab lahhh, masa enggak. 30 detik cukup kan? gk cukup pulang aja" }).then(() => {
                      tebakgambar[sender.split('@')[0]] = jawaban.toLowerCase()
                      fs.writeFileSync("./database/tebakgambar.json", JSON.stringify(tebakgambar))
                  })
                  await sleep(30000)
                  if (tebakgambar.hasOwnProperty(sender.split('@')[0])) {
                      reply("Jawaban: " + jawaban)
                      delete tebakgambar[sender.split('@')[0]]
                      fs.writeFileSync("./database/tebakgambar.json", JSON.stringify(tebakgambar))
                  }
                  break
              case 'canceltebakgambar':
                  if (!tebakgambar.hasOwnProperty(sender.split('@')[0])) return reply("Anda tidak memiliki tebak gambar sebelumnya")
                  delete tebakgambar[sender.split('@')[0]]
                  fs.writeFileSync("./database/tebakgambar.json", JSON.stringify(tebakgambar))
                  reply("Success mengcancel tebak gambar sebelumnya")
                  break*/
        // Fitur 'toimg' (mengonversi sticker ke gambar)

        case 'neko':
          try {
            reply('Tunggu Sebentar...⌛');
            const response = await axios.get('https://api.waifu.pics/nsfw/neko');
            const data = response.data;

            if (data.url) {
              await client.sendImage(from, data.url, 'Warning 🔞');
            } else {
              reply('Maaf, terjadi kesalahan dalam mengambil gambar');
            }
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar');
          }
          break;

        case 'waifu':
          try {
            reply('Tunggu Sebentar...⌛');
            const response = await axios.get('https://api.waifu.pics/nsfw/waifu');
            const data = response.data;

            if (data.url) {
              await client.sendImage(from, data.url, 'Warning 🔞');
            } else {
              reply('Maaf, terjadi kesalahan dalam mengambil gambar');
            }
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar');
          }
          break;
        case 'trap':
          try {
            reply('Tunggu Sebentar...⌛');
            const response = await axios.get('https://api.waifu.pics/nsfw/trap');
            const data = response.data;

            if (data.url) {
              await client.sendImage(from, data.url, 'Warning 🔞');
            } else {
              reply('Maaf, terjadi kesalahan dalam mengambil gambar');
            }
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar');
          }
          break;
        case 'oral':
          try {
            reply('Tunggu Sebentar...⌛');
            const response = await axios.get('https://api.waifu.im/search?included_tags=oral');
            const data = response.data;
            const url = data.images[0].url;

            if (url) {
              await client.sendImage(from, url, 'Warning 🔞');
            } else {
              reply('Maaf, terjadi kesalahan dalam mengambil gambar');
            }
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar');
          }
          break;
        case 'paizuri':
          try {
            reply('Tunggu Sebentar...⌛');
            const response = await axios.get('https://api.waifu.im/search?included_tags=paizuri');
            const data = response.data;
            const url = data.images[0].url;

            if (url) {
              await client.sendImage(from, url, 'Warning 🔞');
            } else {
              reply('Maaf, terjadi kesalahan dalam mengambil gambar');
            }
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar');
          }
          break;
        case 'kuismath':
        case 'math':
          if (kuismath.hasOwnProperty(sender.split('@')[0])) return reply("Masih Ada Sesi Yang Belum Diselesaikan!");
          const {
            genMath,
            modes
          } = require('./lib/math');
          if (!args[0]) return reply(`Mode: ${Object.keys(modes).join(' | ')}\nContoh penggunaan: ${prefix}math medium`);
          const result = await genMath(args[0].toLowerCase());
          await client.sendMessage(chatId, `*Berapa hasil dari: ${result.soal.toLowerCase()}*?\n\nWaktu: ${(result.waktu / 1000).toFixed(2)} detik`);
          kuismath[sender.split('@')[0]] = result.jawaban;

          setTimeout(async () => {
            if (kuismath.hasOwnProperty(sender.split('@')[0])) {
              console.log("Jawaban: " + result.jawaban);
              try {
                reply(`Waktu Habis\nJawaban: ${kuismath[sender.split('@')[0]]}`);
              } catch (error) {
                console.error("Gagal mengirim pesan: " + error.message);
              }
              delete kuismath[sender.split('@')[0]];
            }

          }, result.waktu);

          break;

        case 'request':
          // Mengirimkan request fitur
          const user = m.sender;
          const requestMessage = m.body.slice(8).trim();

          if (!requestMessage) {
            m.reply('Maaf, Anda harus memberikan deskripsi permintaan fitur.');
            return;
          }

          addRequest(user, requestMessage);
          m.reply('Terima kasih atas request fitur! Permintaan Anda telah disimpan.');
          break;

        case 'deleteijin':
          const ownerNumberr = ["6289689075040@s.whatsapp.net"];
          if (!ownerNumberr.includes(sender)) {
            reply('Maaf, hanya owner yang bisa menggunakan perintah ini.');
            return;
          }

          if (args.length < 1) {
            reply('Silakan masukkan nomor yang ingin dihapus dari ijin.');
            return;
          }

          const nomorOwner = args[0] + '@s.whatsapp.net';
          const ijinDataa = JSON.parse(fs.readFileSync('./database/ijin.json'));

          if (ijinDataa.includes(nomorOwner)) {
            // Hapus nomor yang sesuai
            ijinDataa.splice(ijinDataa.indexOf(nomorOwner), 1);
            fs.writeFileSync('./database/ijin.json', JSON.stringify(ijinDataa, null, 2), 'utf8');
            reply(`Nomor ${nomorOwner} telah dihapus dari daftar ijin.`);
          } else {
            reply(`Nomor ${nomorOwner} tidak ditemukan dalam daftar ijin.`);
          }
          break;


        case 'ping':
        case 'botstatus':
        case 'statusbot': {
          const used = process.memoryUsage();
          const cpus = os.cpus().map(cpu => {
            cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0);
            return cpu;
          });
          const cpu = cpus.reduce((last, cpu, _, { length }) => {
            last.total += cpu.total;
            last.speed += cpu.speed / length;
            last.times.user += cpu.times.user;
            last.times.nice += cpu.times.nice;
            last.times.sys += cpu.times.sys;
            last.times.idle += cpu.times.idle;
            last.times.irq += cpu.times.irq;
            return last;
          }, {
            speed: 0,
            total: 0,
            times: {
              user: 0,
              nice: 0,
              sys: 0,
              idle: 0,
              irq: 0
            }
          });

          const timestamp = speed();
          const latensi = speed() - timestamp;
          const runtimeText = runtime(process.uptime());

          const ramUsage = formatp(os.totalmem() - os.freemem());
          const totalRam = formatp(os.totalmem());

          const nodejsMemoryUsage = Object.keys(used)
            .map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v => v.length)), ' ')}: ${formatp(used[key])}`)
            .join('\n');

          const cpuUsageText = cpus[0]
            ? `_Total CPU Usage_
${cpus[0].model.trim()} (${cpu.speed} MHZ)
${Object.keys(cpu.times)
              .map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`)
              .join('\n')}
CPU Core(s) Usage (${cpus.length} Core CPU)
${cpus
              .map(
                (cpu, i) => `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)
${Object.keys(cpu.times)
                    .map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`)
                    .join('\n')}`
              )
              .join('\n\n')}`
            : '';

          const response = `
Kecepatan Respon ${latensi.toFixed(4)} Second
${oldd - neww} miliseconds

Runtime: ${runtimeText}

💻 Info Server
RAM: ${ramUsage} / ${totalRam}

NodeJS Memory Usage
${nodejsMemoryUsage}

${cpuUsageText}
`.trim();

          reply(response);
        }
          break;
        case 'cekgay':
          if (args.length === 0) {
            reply(`Format penggunaan salah. Contoh penggunaan: ${prefix}cekgay (nama)`);
          } else {
            const text123 = args.join(" ");
            const filterData = require("./filter.json");
            const nama = args.slice(0).join(" ");
            const randomPercentage = Math.floor(Math.random() * 101);
            const filtered = filterData.filter((kata) => nama.toLowerCase().includes(kata.toLowerCase()));

            if (filtered.length > 0) {
              reply(`Maaf ya sayang, ${text123} bukan orang gay !`);
            } else {
              const response = `Hasil cekgay dari ${nama} adalah ${randomPercentage}%`;
              reply(response);
            }
          }
          break;

        case 'ero':
          try {
            reply('Tunggu Sebentar...⌛');
            const jkt48Data = require('./database/ero.json');

            const randomImage = getRandomElement(jkt48Data.images);

            await client.sendImage(from, randomImage, 'Warning 🔞');
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar.');
          }
          break;

        case 'loli':
          try {
            reply('Tunggu Sebentar...⌛');
            const jkt48Data = require('./database/loli.json');

            const randomImage = getRandomElement(jkt48Data.images);

            await client.sendImage(from, randomImage, 'Nih say...');
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar.');
          }
          break;


        case 'ass':
          try {
            reply('Tunggu Sebentar...⌛');
            const jkt48Data = require('./database/ass.json');

            const randomImage = getRandomElement(jkt48Data.images);

            await client.sendImage(from, randomImage, 'Warning 🔞');
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar.');
          }
          break;

        case 'cukold':
          try {
            reply('Tunggu Sebentar...⌛');
            const jkt48Data = require('./database/cukold.json');

            const randomImage = getRandomElement(jkt48Data.images);

            await client.sendImage(from, randomImage, 'Warning 🔞');
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar.');
          }
          break;

        case 'cosplay':
          try {
            reply('Tunggu Sebentar...⌛');
            const jkt48Data = require('./database/cosplay.json');

            const randomImage = getRandomElement(jkt48Data.images);

            await client.sendImage(from, randomImage, 'Warning 🔞');
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar.');
          }
          break;

        case 'cum':
          try {
            reply('Tunggu Sebentar...⌛');
            const jkt48Data = require('./database/cum.json');

            const randomImage = getRandomElement(jkt48Data.images);

            await client.sendImage(from, randomImage, 'Warning 🔞');
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar.');
          }
          break;


        case 'paptt':
          try {
            reply('Tunggu Sebentar...⌛');
            const jkt48Data = require('./database/paptt.json');

            const randomImage = getRandomElement(jkt48Data.images);

            await client.sendImage(from, randomImage, 'Warning 🔞');
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar.');
          }
          break;

        case 'nude':
          try {
            reply('Tunggu Sebentar...⌛');
            const jkt48Data = require('./database/nude.json');

            const randomImage = getRandomElement(jkt48Data.images);

            await client.sendImage(from, randomImage, 'Warning 🔞');
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam mengambil gambar.');
          }
          break;


        case 'steam':
          if (!args[0]) {
            reply('Silakan masukkan kata kunci pencarian game, contoh: /steam Cyberpunk 2077');
            return;
          }

          try {
            const query = args.join(' ');
            const apiKey = 'Onlasdan'; // Gantilah dengan API Key yang sesuai
            const response = await axios.get(`https://ll--lasdanon.repl.co/api/search/steam?q=${query}&apikey=${apiKey}`);
            const games = response.data.data; // Mengambil array game dari respons

            if (!games || games.length === 0) {
              reply('Tidak ada hasil game yang ditemukan untuk pencarian ini.');
            } else {
              const game = games[0]; // Mengambil game pertama dari array

              const gameDetails = `Nama Game: ${game.judul}\nHarga: ${game.harga}\nTanggal Rilis: ${game.rilis}\nRating: ${game.rating}\nLink: ${game.link}`;

              reply(gameDetails);
            }
          } catch (error) {
            console.error('Error:', error);
            reply('Maaf, terjadi kesalahan dalam melakukan pencarian game.');
          }
          break;



        case 'nhentai':
          if (args.length == 0) return reply(`Example: ${prefix + command} 63456028`)
          sock.sendMessage(from, { image: { url: `https://api.lolhuman.xyz/api/nhentaisearch?apikey=${apikey}&query=${full_args}` } })
          break
        case 'nilaijoke': {
          // Cek apakah ada argumen yang diberikan
          if (args.length === 0) {
            reply(`Maaf, format yang benar adalah ${prefix}nilaijoke (joke)`);
            return;
          }

          // Menggabungkan argumen menjadi satu string dengan spasi
          const joke = args.join(' ');

          // Menghasilkan tingkat kelucuan secara acak antara 0 hingga 100%
          const tingkatKelucuan = Math.floor(Math.random() * 101);

          // Membuat pesan respons dengan tingkat kelucuan dan joke yang diberikan
          const response = `Joke: ${joke}\nTingkat Kelucuan: ${tingkatKelucuan}%`;

          // Mengirimkan respons ke pengguna
          reply(response);
        }
          break;




        /*case 'confess': {
          const nomorTujuan = args[0];
          const pesan = args.slice(1).join(' ');
        
          // Check if the number and message are provided
          if (!nomorTujuan || !pesan) {
            reply(`Format salah. Contoh penggunaan: ${prefix}confess <nomor tujuan> <pesan>`);
            return;
          }
        
          // Check if the number is blocked
          if (isBlocked(nomorTujuan)) {
            reply(`Maaf, nomor ${nomorTujuan} telah diblokir.`);
            return;
          }
          
          // Check for bad words
          if (containsBadWords(pesan)) {
            const userStatus = incrementUserStatus(nomorTujuan);
            if (userStatus === 'blocked') {
              blockNumber(nomorTujuan);
              reply(`Maaf, nomor ${nomorTujuan} telah diblokir karena mengirimkan pesan kasar.`);
            } else {
              reply(`Pesan Anda mengandung kata kasar. Ini peringatan ke-${userStatus}. Harap berhati-hati dengan penggunaan kata-kata.`);
            }
            return;
            
            
          // Process the confess message
          // ...
          // Your logic for sending the confess message to the destination number
          
             Save the confession data to the fitur.json file
            nst newConfessData = {
              morTujuan,
              san,
            status: 'waiting_reply',
              
            turData.push(newConfessData);
            .writeFileSync('fitur.json', JSON.stringify(fiturData, null, 2), 'utf8');
          
          // Send response to the user
          reply('Pesan Anda telah dikirim. Terima kasih telah menggunakan fitur confess.');
          
          eak;
        
          
                  
                  // Get reply from destination number
                  case 'getreply': {
                    const nomorTujuan = args[0];
                  
                    // Find the corresponding confession data
                    const confession = _.find(fiturData, { nomorTujuan });
                  
                    // Check if there is a reply from the destination number
                    if (confession && confession.status === 'replied') {
                      // Get the reply message
                      const replyMessage = confession.reply;
                  
                      // Send the reply message to the user
                      reply(`Balasan dari nomor ${nomorTujuan}: ${replyMessage}`);
                    } else {
                      reply(`Belum ada balasan dari nomor ${nomorTujuan}. Harap bersabar.`);
                    }
                  }
                    eak;
                    
                  // Reply to destination number
                    se 'reply': {
                    const nomorTujuan = args[0];
                      nst replyMessage = args.slice(1).join(' ');
                      
                    // Find the corresponding confession data
                      nst confession = _.find(fiturData, { nomorTujuan });
                      
                    // Check if there is a pending confession and it is waiting for a reply
                       (confession && confession.status === 'waiting_reply') {
                      // Update the confession data with the reply message
                      confession.reply = replyMessage;
                      confession.status = 'replied';
                  
                      // Save the updated fitur data to the fitur.json file
                      fs.writeFileSync('fitur.json', JSON.stringify(fiturData, null, 2), 'utf8');
                    
                      // Send confirmation to the user
                      reply(`Balasan Anda telah dikirim ke nomor ${nomorTujuan}.`);
                    } else {
                      reply(`Tidak ada pesan yang menunggu balasan dari nomor ${nomorTujuan}.`);
                    }
                    
                    eak;
                      
                       'toimage':
                      {
                 quoted) throw 'Reply to an image/sticker message.'
                      Message = await yuu.getMessageById(m.chat, m.quoted.id)
                      = await yuu.downloadMediaMessage(quotedMessage)
                 imeType = quotedMessage.mimetype || ''
                      test(mimeType)) throw `Reply to a sticker with caption *${prefix + command}*`
                      ait)
                    Path = './image.png' // Ubah sesuai dengan path file yang diinginkan
                      await getRandom('.png')
                    eg -i ${media} ${filePath}`, (err) => {
                  inkSync(media)
                  r) throw err
            const buffer = fs.readFileSync(filePath)
                  ndMessage(m.chat, buffer, 'imageMessage', { quoted: m })
            fs.unlinkSync(filePath)
          })
          
          eak;
          
          
                  
          
                  case "hidetag":
          if (!isGroupMsg) {
            return reply("Fitur ini hanya dapat digunakan dalam grup.");
            
            
             (!isGroupAdmin && !ownerNumber.includes(sender.id)) {
            return reply("Hanya admin grup dan owner bot yang dapat menggunakan fitur ini.");
          }
        
          const mentionedMembers = await getGroupMembers(groupId);
          const tagString = mentionedMembers.map((member) => `@${member.id.replace(/@c.us/g, "")}`).join(" ");
        
                 Pesan tersembunyi\n${tagString}`);
          break;
                  
           ...
            
          
        // case 'toimage':
             case 'toimg': {
               if (!m.quoted) throw 'Reply to an image/sticker message.'
               const quotedMessage = await client.getMessageById(m.chat, m.quoted.id)
        //     const media = await client.downloadMediaMessage(quotedMessage)
               const mimeType = quotedMessage.mimetype || ''
               if (!/webp/.test(mimeType)) throw `Reply to a sticker with caption *${prefix + command}*`
        //     reply(mess.wait)
               const filePath = './image.png' // Ubah sesuai dengan path file yang diinginkan
               const ran = await getRandom('.png')
        //     exec(`ffmpeg -i ${media} ${filePath}`, (err) => {
        //       fs.unlinkSync(media)
        //       if (err) throw err
        //       const buffer = fs.readFileSync(filePath)
        //       client.sendMessage(m.chat, buffer, 'imageMessage', { quoted: m })
        //       fs.unlinkSync(filePath)
        //     })
        //   }
        //   break;
 
        // Dalam file yuu.js atau di mana Anda menangani pesan
        case 'addijin':
          if (!isOwner(sender)) return reply('Hanya pemilik bot yang dapat menambahkan nomor ke ijin.');
          if (args.length < 1) return reply('Format pesan salah. Gunakan: *addijin [nomor]*');
 
          const nomorIjin = `${args[0]}@s.whatsapp.net`;
          // Lakukan pengecekan apakah nomor sudah ada di dalam ijin.json
          const ijinData = JSON.parse(fs.readFileSync('./database/ijin.json', 'utf8'));
          if (ijinData.includes(nomorIjin)) return reply(`Nomor ${nomorIjin} sudah ada dalam daftar ijin.`);
 
          // Tambahkan nomor ke dalam ijin.json
          ijinData.push(nomorIjin);
          fs.writeFileSync('./database/ijin.json', JSON.stringify(ijinData, null, 2), 'utf8');
          reply(`Nomor ${nomorIjin} telah ditambahkan ke dalam daftar ijin.`);
          break;*/








        case "cekcinta":
        case "cinta":
          if (args.length < 3 || (!args.includes("dan") && !args.includes("dengan"))) {
            return reply(`Format yang benar: ${prefix}cekcinta (nama kamu) dan (nama pasangan)`);
          }

          let separator = "dan";
          if (args.includes("dengan")) {
            separator = "dengan";
          }

          const namaKamu = args.slice(0, args.indexOf(separator)).join(" ");
          const namaPasangan = args.slice(args.indexOf(separator) + 1).join(" ");
          const persentaseCinta = Math.floor(Math.random() * 101); // Generate angka acak antara 0 dan 100

          const hasilCekCinta = `Rasa Cinta antara ${namaKamu} ${separator} ${namaPasangan} adalah ${persentaseCinta}%`;
          reply(hasilCekCinta);
          break;




        case "kapan":
          if (args.length === 0) {
            return reply(`Format yang benar: ${prefix}kapan {pertanyaan}`);
          }

          const pertanyaan = args.join(" ");
          const jawabanAcak = ['5 Hari Lagi', '10 Hari Lagi', '15 Hari Lagi', '20 Hari Lagi', '25 Hari Lagi', '30 Hari Lagi', '5 Bulan Lagi', '10 Bulan Lagi', '1 Tahun Lagi', '2 Tahun Lagi', '3 Tahun Lagi', '4 Tahun Lagi', '5 Tahun Lagi', 'Besok', 'Lusa']; // Ganti dengan jawaban acak yang diinginkan

          const jawaban = jawabanAcak[Math.floor(Math.random() * jawabanAcak.length)];
          const hasilJawaban = `Pertanyaan: ${pertanyaan}\nJawaban: ${jawaban}`;
          reply(hasilJawaban);
          break;
        case "bisakah":
          if (args.length === 0) {
            return reply(`Format yang benar: ${prefix}kapan {pertanyaan}`);
          }

          const pertanyaan1 = args.join(" ");
          const jawabanAcak1 = ['Bisa', 'Gak Bisa', 'Mugkin Bisa', 'Gak', 'TENTU PASTI KAMU BISA!!!!']; // Ganti dengan jawaban acak yang diinginkan

          const jawaban1 = jawabanAcak1[Math.floor(Math.random() * jawabanAcak1.length)];
          const hasilJawaban1 = `Pertanyaan: ${pertanyaan1}\nJawaban: ${jawaban1}`;
          reply(hasilJawaban1);
          break;
        case "siapakah":
          if (args.length === 0) {
            return reply(`Format yang benar: ${prefix}kapan {pertanyaan}`);
          }

          const pertanyaan3 = args.join(" ");
          const jawabanAcak3 = ['Tidak ada', 'Orang lain', 'Teman kamu', 'Mungkin kamu', 'Kamu']; // Ganti dengan jawaban acak yang diinginkan

          const jawaban3 = jawabanAcak3[Math.floor(Math.random() * jawabanAcak3.length)];
          const hasilJawaban3 = `Pertanyaan: ${pertanyaan3}\nJawaban: ${jawaban3}`;
          reply(hasilJawaban3);
          break;
        case "apakah":
          if (args.length === 0) {
            return reply(`Format yang benar: ${prefix}apakah {pertanyaan}`);
          }

          const pertanyaan4 = args.join(" ");
          //const kataDilarang = require("./filter.json"); // Mengimpor daftar kata yang dilarang dari filter.json

          // Memeriksa apakah pertanyaan mengandung kata yang dilarang
          /*const kataDitemukan = kataDilarang.some(kata => pertanyaan4.toLowerCase().includes(kata.toLowerCase()));
        
          if (kataDitemukan) {
            return reply("Kata ini dilarang oleh owner saya!");
          }
  
  
        /*case "apakah2":
    if (args.length === 0) {
          rn reply(`Format yang benar: ${prefix}apakah {pertanyaan}`);*/


          //pertanyaan4 = args.join(" ");
          //kataDilarang = require("./filter.json"); // Mengimpor daftar kata yang dilarang dari filter.json

          // Memeriksa apakah pertanyaan mengandung kata yang dilarang
          //const kataDitemukan = kataDilarang.some(kata => pertanyaan4.toLowerCase().includes(kata.toLowerCase()));

          // if (kataDitemukan) {
          // return reply("Kata ini dilarang oleh owner saya!");
          //}

          const jawabanAcak4 = ['Iya', 'Tidak', 'Mungkin tidak', 'Bisa Jadi', 'Betul', 'Tidak sama sekali'];

          const jawaban4 = jawabanAcak4[Math.floor(Math.random() * jawabanAcak4.length)];
          const hasilJawaban4 = `Pertanyaan: ${pertanyaan4}\nJawaban: ${jawaban4}`;
          reply(hasilJawaban4);
          break;

        /*case "s":
          case 'sticker':
          if ((isQuotedImage || isQuotedVideo) && args.length === 0) {
            const mediaData = await client.downloadAndSaveMediaMessage(quotedMsg);
            const randomName = getRandom('.webp');
            await ffmpeg(`./${mediaData}`)
              .input(mediaData)
              .on('error', (err) => {
                fs.unlinkSync(mediaData);
                console.error(err);
                reply('Terjadi kesalahan saat mengconvert sticker.');
              })
              .on('end', async () => {
                await client.sendMessage(from, { url: `data:image/webp;base64,${fs.readFileSync(randomName).toString('base64')}` }, MessageType.sticker, { quoted: quotedMsg });
                fs.unlinkSync(mediaData);
                fs.unlinkSync(randomName);
              })
              .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
              .toFormat('webp')
              .save(randomName);
              se {
              ply(`Kirim gambar dengan caption ${prefix}sticker atau tag gambar yang sudah dikirim`);
                
                */

        case 'pixiv':
          if (!args[0]) {
            reply('Harap berikan query pencarian untuk Wikipedia.');
            return;
          }

          try {
            const query = args[0];
            // Pixiv API search endpoint
            const endpoint = 'https://app-api.pixiv.net/v1/search/illustrations'

            // Request param 
            const params = {
              word: query, // kata kunci
              mode: 'safe', // mode safe search
              per_page: 100 // maks hasil 
            }

            // Hit API
            const { data } = await axios.get(endpoint, { params })

            // Ambil salah satu gambar secara acak
            const index = Math.floor(Math.random() * data.illustrations.length)
            const imageUrl = data.illustrations[index].image_urls.large

            // Kirim gambar 
            await conn.sendFile(jid, imageUrl, 'pixiv.jpg', '', id)

            reply('berhasil mengirim gambar pixiv!')

          } catch (err) {
            reply('terjadi kesalahan, coba lagi!');
            console.log(err)
          }

          break;



        // ... (kode lainnya)

        case 'wikimedia':
          if (!args[0]) {
            reply('Harap berikan query pencarian untuk Wikipedia.');
            return;
          }

          const query = args[0]; // Mengambil query dari pesan pengguna
          const apiUrl = `https://random.stockakunpolos.repl.co/api/wikimedia?query=${query}&apikey=YuuXD`;

          try {
            const response = await axios.get(apiUrl);
            const results = response.data;

            // Mengambil hasil secara acak
            const randomResult = results[Math.floor(Math.random() * results.length)];

            const title = randomResult.title;
            const source = randomResult.source;
            const image = randomResult.image;

            // Kirim gambar dan tautan ke pengguna
            await client.sendImage(from, image, `Sumber: ${source}`);

          } catch (error) {
            console.error('Error:', error);
            reply('Terjadi kesalahan saat mencari di Wikipedia.');
          }
          break;


        case 'twtmp4':

          if (!args[0]) return reply('Harap sertakan URL video Twitter yang ingin diunduh!')

          const url = args[0]

          axios.get(`https://random.stockakunpolos.repl.co/api/twitterdl?link=${url}&apikey=YuuXD`)
            .then(async res => {
              const result = res.data.result
              if (result.HD) {
                await client.sendMessage(from, { video: { url: result.HD } }, { quoted: mek })
              } else {
                reply('Video HD tidak tersedia untuk URL yang diberikan.')
              }
            })
            .catch(err => {
              reply('Terjadi kesalahan, silahkan coba lagi.')
            })

          break;

        // Kode untuk command /tts
        // Handler untuk command /tts
        case 'tts':

          // Cek input text
          if (!args[0])
            return reply('Masukkan teks yang ingin diubah menjadi suara!')

          // Dapatkan text
          const text = args.join(' ')

          // Cek apakah file tts sudah ada
          const filePath = './media/tts.mp3'
          if (fs.existsSync(filePath)) {
            // Jika ada, kirim file tts
            return client.sendMessage(from, { audio: fs.readFileSync(filePath) })
          }

          // Jika belum ada, buat file tts
          try {
            const tts = new gTTS(text, 'id')
            tts.save(filePath)

            // Kirim file tts yang sudah dibuat
            client.sendMessage(from, { audio: fs.readFileSync(filePath) })

          } catch (err) {
            // Handle error
            reply('Maaf, terjadi kesalahan saat membuat sound!')
          }

          break;

        // ... (kode lainnya)
        case 'twtmp3':

          if (!args[0]) return reply('Harap sertakan URL video Twitter!')

          const url1 = args[0]

          axios.get(`https://random.stockakunpolos.repl.co/api/twitterdl?link=${url1}&apikey=YuuXD`)
            .then(async res => {

              const result = res.data.result

              if (result.audio) {

                await client.sendMessage(from, { audio: { url: result.audio }, mimetype: 'audio/mp4' }, { quoted: mek })

              } else {

                reply('Audio tidak tersedia untuk video ini.')

              }

            })
            .catch(err => {

              reply('Terjadi kesalahan, silahkan coba lagi.')

            })

          break;

        case 'pinterest2':
          reply('Please Wait...')

          let msgId; // ID message "Please wait"
          let waitingText = 'Loading ';

          for (let i = 0; i <= 100; i++) {
            waitingText += i + '%';

            const response = await client.sendMessage(from, {
              text: waitingText
            }, {
              quoted: {
                key: {
                  fromMe: false,
                  participant: '0@s.whatsapp.net',
                  ...(from ? { remoteJid: from } : {})
                },
                message: {
                  conversation: 'Please wait...'
                }
              }
            });

            // Set msgId on the first iteration
            if (i === 0) {
              msgId = response.key.id;
            }

            await sleep(200); // 0.2 detik
          }

          // Ambil gambar dll
          const text123 = args.join(" ");
          const image123 = await getImageFromPinterest(text123);

          // Hapus "Loading..."
          await client.deleteMessage(from, msgId);

          // Kirim gambar
          await client.sendImage(from, image123, text123, mek);

          break;


        case 'pinterest':
          if (args.length === 0) {
            return reply(`Contoh: ${prefix + command} loli kawaii`);
          }

          try {
            reply('Tunggu Sebentar...⌛');
            const text = args.join(" ");
            const response = await axios.get(`https://random.stockakunpolos.repl.co/api/pinterest?query=${text}&apikey=YuuXD`, { responseType: 'json' });
            const results = response.data.result;

            if (results.length === 0) {
              return reply('Tidak ada gambar yang ditemukan.');
            }

            const randomIndex = Math.floor(Math.random() * results.length);
            const imageUrl = results[randomIndex];

            await client.sendImage(from, imageUrl, text, mek);
          } catch (error) {
            console.error(error);
            reply("Maaf, terjadi kesalahan saat mengambil gambar dari Pinterest.");
          }
          break;

        // Handler command owner
        case 'owner':
          // Data owner
          const ownerNumber1 = "6289689075040";
          const ownerName1 = "YuuXD";

          // Buat VCARD
          const vcard =
            'BEGIN:VCARD\n'

            + ' VERSION:3.0 \n'

            + 'FN:YuuXD\n'

            + 'item1.TEL;waid=6289689075040:6289689075040\n'

            + 'END:VCARD'

          // Kirim kontak owner 
          await client.sendMessage(m.chat, {
            contacts: {
              displayname: "YuuXD",
              contacts: [{ vcard }]
            }
          }, { quoted: m })

          break













        //     case "stable":
        // try {
        //   if (!text) return reply(`Membuat gambar dari AI.\n\nContoh:\n${prefix}${command} Wooden house on snow mountain`);

        //   const response = await generateStableDiffusionImage(text);

        //   client.sendImage(from, response.url, text, mek);
        // } catch (error) {
        //   if (error.response) {
        //     console.log(error.response.status);
        //     console.log(error.response.data);
        //     console.log(`${error.response.status}\n\n${error.response.data}`);
        //   } else {
        //     console.log(error);
        //     m.reply("Maaf, sepertinya ada yang error: " + error.message);
        //   }
        // }
        // break;
        // Switch case untuk fitur "deepai"
        // Switch case untuk fitur "deepai"
        // Switch case untuk fitur "deepai"


        case 'katakata':
          try {
            const kataKataList = require('./database/katakata.json'); // Impor berkas katakata.json

            // Pilih kata-kata secara acak
            const randomIndex = Math.floor(Math.random() * kataKataList.length);
            const selectedKata = kataKataList[randomIndex];

            // Kirim kata-kata dan penulisnya sebagai pesan balasan
            const response = `Kata-kata:\n${selectedKata.kata}\nAuthor: ${selectedKata.tokoh}`;
            m.reply(response);
          } catch (error) {
            console.error(error);
            m.reply("Maaf, terjadi kesalahan dalam mengambil kata-kata.");
          }
          break;

        case 'motivasi':
          try {
            const kataKataList = require('./database/motivasi.json'); // Impor berkas katakata.json

            // Pilih kata-kata secara acak
            const randomIndex = Math.floor(Math.random() * kataKataList.length);
            const selectedKata = kataKataList[randomIndex];

            // Kirim kata-kata dan penulisnya sebagai pesan balasan
            const response = `Kata motivasi:\n${selectedKata.kata}\nAuthor: ${selectedKata.tokoh}`;
            m.reply(response);
          } catch (error) {
            console.error(error);
            m.reply("Maaf, terjadi kesalahan dalam mengambil kata-kata.");
          }
          break;

        case 'dare':
          try {
            // URL data dare
            const dareURL = 'https://raw.githubusercontent.com/YuuXD26/database/main/game/dare.json';

            // Gunakan axios untuk mengambil data dare dari URL
            axios.get(dareURL)
              .then((response) => {
                const dareData = response.data;

                // Pilih kalimat dare secara acak
                const randomIndex = Math.floor(Math.random() * dareData.length);
                const selectedDare = dareData[randomIndex];

                // Kirim kalimat dare sebagai pesan balasan
                m.reply(selectedDare);
              })
              .catch((error) => {
                console.error(error);
                m.reply("Maaf, terjadi kesalahan dalam mengambil dare.");
              });
          } catch (error) {
            console.error(error);
            m.reply("Maaf, terjadi kesalahan dalam mengambil dare.");
          }
          break;

        case 'truth':
          try {

            // URL data dare
            const truthURL = 'https://raw.githubusercontent.com/YuuXD26/database/main/game/truth.json';

            // Gunakan axios untuk mengambil data dare dari URL
            axios.get(truthURL)
              .then((response) => {
                const truthData = response.data;

                // Pilih kalimat dare secara acak
                const randomIndex = Math.floor(Math.random() * truthData.length);
                const selectedTruth = truthData[randomIndex];

                // Kirim kalimat dare sebagai pesan balasan
                m.reply(selectedTruth);
              })
              .catch((error) => {
                console.error(error);
                m.reply("Maaf, terjadi kesalahan dalam mengambil truth.");
              });
          } catch (error) {
            console.error(error);
            m.reply("Maaf, terjadi kesalahan dalam mengambil truth.");
          }
          break;

        case 'dalle':
          if (args.length === 0) {
            return reply(`Contoh: ${prefix + command} a cute woman`);
          }

          const dallePrompt = args.join(' ');

          try {
            reply('Waiting generate image...');
            const apiKey1 = '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';
            const numberOfImages = 1;
            const imageSize = '1024x1024';

            const response = await axios.post(
              'https://api.openai.com/v1/images/generations',
              {
                prompt: dallePrompt,
                n: numberOfImages,
                size: imageSize,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey1}`,
                },
              }
            );

            const generatedImageUrls = response.data.data.map((data) => data.url);

            if (generatedImageUrls.length > 0) {
              const imageUrl = generatedImageUrls[0];
              await client.sendImage(from, imageUrl, dallePrompt, mek);
            } else {
              reply('Failed to generate image using DALL·E');
            }
          } catch (err) {
            console.error('Error:', err);
            reply('Failed to generate image using DALL·E');
          }
          break;


        case 'jkt48':
          reply('This fitur under maintenance.');
          break;

        case "img": case "ai-img": case "image": case "images":
          reply('This fitur under maintenance.');
          break;

        case "sc": case "script": case "scbot":
          m.reply("Bot ini menggunakan script dari LinguaBot, jika ingin membeli script ini anda bisa mengirimkan pesan /owner");
          break


        default: {
          if (isCmd2 && budy.toLowerCase() != undefined) {
            if (m.chat.endsWith("broadcast")) return;
            if (m.isBaileys) return;
            if (!budy.toLowerCase()) return;
            if (argsLog || (isCmd2 && !m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              reply(`Maaf ya say\nCommand ${prefix}${command} tidak tersedia dimenu\nKetik ${prefix}help untuk melihat daftar menu`);
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            } else if (argsLog || (isCmd2 && m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            }
          }

        }
      }
    }
  } catch (err) {
    m.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
