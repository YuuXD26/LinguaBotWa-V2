const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, MessageType} = require("@adiwajshing/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const axios = require('axios');
const path = require("path");
const sharp = require("sharp");
const _ = require('lodash');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
const { decryptMedia } = require('@open-wa/wa-decrypt');
const { createStickerPack, createSticker } = require('@open-wa/wa-automate');
const { v4: uuidv4 } = require('uuid');
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
const ownerNumber = ["6289689075040"];
const apikey = "NatasyaMine";
const tebakgambar = JSON.parse(fs.readFileSync('./database/tebakgambar.json'))

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



const stickersDir = path.join(__dirname, "stickers");
if (!fs.existsSync(stickersDir)) {
  fs.mkdirSync(stickersDir);
}

module.exports = yuu = async (client, m, chatUpdate, store) => {
  try {
    var body =
      m.mtype === "conversation"
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
    // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
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
    
    const from = m.chat;
    const reply = m.reply;
    const sender = m.sender;
    const mek = chatUpdate.messages[0];
    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };

    const senderContact = sender && sender.contact ? sender.contact : null;

    // Group
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch((e) => {}) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";

    // Push Message To Console
    let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;
    let oldd = 0;
    let neww = 0;
    let fiturData = [];

    /*const mention = typeof(mentionByTag) == 'string' ? [mentionByTag] : mentionByTag
            mention != undefined ? mention.push(mentionByReply) : []
    const mentionUser = mention != undefined ? mention.filter(n => n) : []
    for (let x of mentionUser) {
    if (tebakgambar.hasOwnProperty(sender.split('@')[0]) && !isCmd && budy.match(/[1-9]{1}/)) {
      kuis = true
      jawaban = tebakgambar[sender.split('@')[0]]
      if (budy.toLowerCase() == jawaban) {
          reply("Jawaban Anda Benar!")
          delete tebakgambar[sender.split('@')[0]]
          fs.writeFileSync("./database/tebakgambar.json", JSON.stringify(tebakgambar))
      } else {
          reply("Jawaban Anda Salah!")
      }
  }
}*/

    if (isCmd2 && !m.isGroup) {
      console.log(chalk.black(chalk.bgWhite("[ LOGS ]")), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`));
    } else if (isCmd2 && m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName)
      );
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
├ • ${prefix}cekcinta 
├ • ${prefix}cekgay
├ • ${prefix}kapan
├ • ${prefix}bisakah
├ • ${prefix}apakah
├ • ${prefix}nilaijoke
├ • ${prefix}truth
├ • ${prefix}dare
├ • ${prefix}jkt48
│
├──「 Other 」
│
├ • ${prefix}ping
├ • ${prefix}request
│
├──「 Chatgpt 」
│
├ • Cmd: ${prefix}ai 
├ • Cmd: ${prefix}img
│
╰───「 ${ownerName} 」

`)
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
        const filterData = require("./filter.json");
        const nama = args.slice(0).join(" ");
        const randomPercentage = Math.floor(Math.random() * 101);
        const filtered = filterData.filter((kata) => nama.toLowerCase().includes(kata.toLowerCase()));

        if (filtered.length > 0) {
          reply('Maaf ya sayang, Kata ini dilarang oleh owner !');
        } else {
          const response = `Hasil cekgay dari ${nama} adalah ${randomPercentage}%`;
          reply(response);
        }
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
  }

  // Process the confess message
  // ...
  // Your logic for sending the confess message to the destination number

  // Save the confession data to the fitur.json file
  const newConfessData = {
    nomorTujuan,
    pesan,
    status: 'waiting_reply',
  };
  fiturData.push(newConfessData);
  fs.writeFileSync('fitur.json', JSON.stringify(fiturData, null, 2), 'utf8');

  // Send response to the user
  reply('Pesan Anda telah dikirim. Terima kasih telah menggunakan fitur confess.');
}
break;


          
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
          break;
          
          // Reply to destination number
          case 'reply': {
            const nomorTujuan = args[0];
            const replyMessage = args.slice(1).join(' ');
          
            // Find the corresponding confession data
            const confession = _.find(fiturData, { nomorTujuan });
          
            // Check if there is a pending confession and it is waiting for a reply
            if (confession && confession.status === 'waiting_reply') {
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
          }
          break;

          case 'toimage':
case 'toimg': {
  if (!m.quoted) throw 'Reply to an image/sticker message.'
  const quotedMessage = await yuu.getMessageById(m.chat, m.quoted.id)
  const media = await yuu.downloadMediaMessage(quotedMessage)
  const mimeType = quotedMessage.mimetype || ''
  if (!/webp/.test(mimeType)) throw `Reply to a sticker with caption *${prefix + command}*`
  reply(mess.wait)
  const filePath = './image.png' // Ubah sesuai dengan path file yang diinginkan
  const ran = await getRandom('.png')
  exec(`ffmpeg -i ${media} ${filePath}`, (err) => {
    fs.unlinkSync(media)
    if (err) throw err
    const buffer = fs.readFileSync(filePath)
    yuu.sendMessage(m.chat, buffer, 'imageMessage', { quoted: m })
    fs.unlinkSync(filePath)
  })
}
break;

          

          case "hidetag":
  if (!isGroupMsg) {
    return reply("Fitur ini hanya dapat digunakan dalam grup.");
  }

  if (!isGroupAdmin && !ownerNumber.includes(sender.id)) {
    return reply("Hanya admin grup dan owner bot yang dapat menggunakan fitur ini.");
  }

  const mentionedMembers = await getGroupMembers(groupId);
  const tagString = mentionedMembers.map((member) => `@${member.id.replace(/@c.us/g, "")}`).join(" ");

  reply(`Pesan tersembunyi\n${tagString}`);
  break;
*/
// ...

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
    const jawabanAcak = ['5 Hari Lagi', '10 Hari Lagi', '15 Hari Lagi','20 Hari Lagi', '25 Hari Lagi','30 Hari Lagi','5 Bulan Lagi', '10 Bulan Lagi', '1 Tahun Lagi','2 Tahun Lagi','3 Tahun Lagi','4 Tahun Lagi','5 Tahun Lagi','Besok','Lusa']; // Ganti dengan jawaban acak yang diinginkan
  
    const jawaban = jawabanAcak[Math.floor(Math.random() * jawabanAcak.length)];
    const hasilJawaban = `Pertanyaan: ${pertanyaan}\nJawaban: ${jawaban}`;
    reply(hasilJawaban);
    break;
    case "bisakah":
      if (args.length === 0) {
        return reply(`Format yang benar: ${prefix}kapan {pertanyaan}`);
      }
    
      const pertanyaan1 = args.join(" ");
      const jawabanAcak1 = ['Bisa','Gak Bisa','Mugkin Bisa', 'Gak', 'TENTU PASTI KAMU BISA!!!!']; // Ganti dengan jawaban acak yang diinginkan
    
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
        const kataDilarang = require("./filter.json"); // Mengimpor daftar kata yang dilarang dari filter.json
      
        // Memeriksa apakah pertanyaan mengandung kata yang dilarang
        /*const kataDitemukan = kataDilarang.some(kata => pertanyaan4.toLowerCase().includes(kata.toLowerCase()));
      
        if (kataDitemukan) {
          return reply("Kata ini dilarang oleh owner saya!");
        }*/
      
        const jawabanAcak4 = ['Iya', 'Tidak', 'Mungkin tidak', 'Bisa Jadi', 'Betul', 'Tidak sama sekali'];
      
        const jawaban4 = jawabanAcak4[Math.floor(Math.random() * jawabanAcak4.length)];
        const hasilJawaban4 = `Pertanyaan: ${pertanyaan4}\nJawaban: ${jawaban4}`;
        reply(hasilJawaban4);
      break;
      /*case "apakah2":
  if (args.length === 0) {
    return reply(`Format yang benar: ${prefix}apakah {pertanyaan}`);
  }

  const pertanyaan4 = args.join(" ");
  const kataDilarang = require("./filter.json"); // Mengimpor daftar kata yang dilarang dari filter.json

  // Memeriksa apakah pertanyaan mengandung kata yang dilarang
  const kataDitemukan = kataDilarang.some(kata => pertanyaan4.toLowerCase().includes(kata.toLowerCase()));

  if (kataDitemukan) {
    return reply("Kata ini dilarang oleh owner saya!");
  }

  const jawabanAcak4 = ['Iya', 'Tidak', 'Mungkin tidak', 'Bisa Jadi', 'Betul', 'Tidak sama sekali'];

  const jawaban4 = jawabanAcak4[Math.floor(Math.random() * jawabanAcak4.length)];
  const hasilJawaban4 = `Pertanyaan: ${pertanyaan4}\nJawaban: ${jawaban4}`;
  reply(hasilJawaban4);
  break;*/

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
  } else {
    reply(`Kirim gambar dengan caption ${prefix}sticker atau tag gambar yang sudah dikirim`);
  }
  break;*/


  

  case 'pixiv':
			if (args.length == 0) return reply(`Example: ${prefix + command} loli kawaii`)
			reply("Please Wait...")
			axios.get(`https://api.lolhuman.xyz/api/pixiv?apikey=${apikey}&query=${full_args}`).then(({ data }) => {
				sock.sendMessage(from, { image: { url: data.result[0].image } })
			})
			break

  case 'pinterest':
  if (args.length === 0) {
    return reply(`Contoh: ${prefix + command} loli kawaii`);
  }

  try {
    const query = args.join(" ");
    const response = await axios.get(`https://api.lolhuman.xyz/api/pinterest?apikey=${apikey}&query=${query}`, { responseType: 'arraybuffer' });
    const mediaMessage = await prepareWAMessageMedia(response.data, MessageType.image, { thumbnail: response.data });
    const messageContent = generateWAMessageContent(mediaMessage, {});
    const waMessage = generateWAMessage(messageContent);
    await client.sendMessage(from, waMessage, MessageType.extendedText, { quoted: lol });
  } catch (error) {
    console.error(error);
    reply("Maaf, terjadi kesalahan saat mengambil gambar dari Pixiv.");
  }
  break;

      

  case 'owner':
    const ownerNumber = "6289689075040";
  const ownerDisplayName = "YuuXD";
  const ownerProfilePicture = "https://i.ibb.co/XjznqDn/adf451b7-b0ec-4e18-953b-a6835f00f9cc.jpg";
  
    function createVCard(number, displayName, profilePicture) {
      const vCard = `BEGIN:VCARD
  VERSION:3.0
  N:${displayName}
  TEL;TYPE=CELL:${number}
  PHOTO;VALUE=URL;TYPE=JPEG:${profilePicture}
  END:VCARD`;
      return vCard;
    }
  
    function sendVCard(number, vCard) {
      const jid = `${number}@s.whatsapp.net`;
      const message = {
        key: {
          remoteJid: jid,
          fromMe: false,
          id: uuidv4(), // Menghasilkan ID pesan secara acak
        },
        message: {
          contactMessage: {
            displayName: "Owner",
            vcard: vCard,
          },
        },
      };
      client.sendMessage(jid, message, MessageType.contact, {
        quoted: m,
        contextInfo: { forwardingScore: 999, isForwarded: true },
      });
    }
  
    const ownerVCard = createVCard(ownerNumber, ownerDisplayName, ownerProfilePicture);
    sendVCard(sender, ownerVCard);
    break;
  

  
  
  
  
  
  

  
    case "ai": case "openai":
      try {
        if (setting.keyopenai === "null") return reply("Apikey belum diisi\n\nSilahkan isi terlebih dahulu apikeynya di file key.json\n\nApikeynya bisa dibuat di website: https://beta.openai.com/account/api-keys");
        if (!text) return reply(`Chat dengan AI.\n\nContoh:\n${prefix}${command} Apa itu resesi`);
        const configuration = new Configuration({
          apiKey: setting.keyopenai,
        });
        const openai = new OpenAIApi(configuration);
    
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: text,
          temperature: 0, // Higher values means the model will take more risks.
          max_tokens: 2048, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
          top_p: 1, // alternative to sampling with temperature, called nucleus sampling
          frequency_penalty: 0.3, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
          presence_penalty: 0 // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
        });
    
        m.reply(`${response.data.choices[0].text}`);
      } catch (error) {
        if (error.response) {
          console.log(error.responses.status);
          console.log(error.responses.data);
          console.log(`${error.responses.status}\n\n${error.responses.data}`);
        } else {
          console.log(error);
          m.reply("Maaf, sepertinya ada yang error :"+ error.message);
        }
      }
      break;

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
  //     case "deepai":
  // try {
  //   if (setting.keydeepai === "null") return reply("Apikey DeepAI belum diisi\n\nSilakan isi terlebih dahulu apikeynya di file key.json\n\nAnda dapat membuat API key di situs web DeepAI: https://deepai.org/signup");

  //   if (typeof text !== 'string' || !text.trim()) {
  //     return reply(`Chat dengan DeepAI.\n\nContoh:\n${prefix}${command} Apa itu resesi`);
  //   }

  //   setApiKey(setting.keydeepai);

  //   const response = await generateDeepAIImage(text);

  //   m.reply({
  //     url: response.output_url,
  //     caption: "Gambar yang dihasilkan oleh DeepAI:",
  //   });
  // } catch (error) {
  //   console.log(error);
  //   m.reply("Maaf, sepertinya ada yang error: " + error.message);
  // }
  // break;

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
    const axios = require('axios');

    // URL data dare
    const dareURL = 'https://raw.githubusercontent.com/ramadhankukuh/database/master/src/kata-kata/dare.json';

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
      const axios = require('axios');
  
      // URL data dare
      const truthURL = 'https://raw.githubusercontent.com/ramadhankukuh/database/master/src/kata-kata/truth.json';
  
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

    case 'jkt48':
      try {
        // Baca data JSON dari file jkt48.json
        const jkt48Data = require('./database/jkt48.json');
    
        // Pilih URL gambar secara acak
        const randomImage = getRandomElement(jkt48Data.images);
    
        // Kirimkan URL gambar ke pengguna
        await client.sendImage(from, randomImage);
      } catch (error) {
        console.error('Error:', error);
        m.reply('Maaf, terjadi kesalahan dalam mengambil gambar.');
      }
      break;
  
  case "img": case "ai-img": case "image": case "images":
    try {
      if (setting.keyopenai === "null") return reply("Apikey belum diisi\n\nSilahkan isi terlebih dahulu apikeynya di file key.json\n\nApikeynya bisa dibuat di website: https://beta.openai.com/account/api-keys");
      if (!text) return reply(`Membuat gambar dari AI.\n\nContoh:\n${prefix}${command} Wooden house on snow mountain`);
      const configuration = new Configuration({
        apiKey: setting.keyopenai,
      });
      const openai = new OpenAIApi(configuration);
      const response = await openai.createImage({
        prompt: text,
        n: 1,
        size: "512x512",
      });
  
      if (response.error && response.error.code === 'content_policy_violation') {
        return reply('Permintaan Anda ditolak karena isi prompt melanggar ketentuan keamanan.');
      }
  
      client.sendImage(from, response.data.data[0].url, text, mek);
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
        console.log(`${error.response.status}\n\n${error.response.data}`);
      } else {
        console.log(error);
        m.reply("Maaf, sepertinya ada yang error: "+ error.message);
      }
    }
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
