const fs = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');

const execPromise = promisify(exec);

async function webp2png(webpBuffer) {
  // Simpan webpBuffer ke file sementara
  const webpFilePath = 'temp.webp';
  fs.writeFileSync(webpFilePath, webpBuffer);

  // Jalankan perintah konversi menggunakan cwebp
  const pngFilePath = 'temp.png';
  await execPromise(`cwebp -q 100 "${webpFilePath}" -o "${pngFilePath}"`);

  // Baca hasil konversi ke dalam buffer
  const pngBuffer = fs.readFileSync(pngFilePath);

  // Hapus file sementara
  fs.unlinkSync(webpFilePath);
  fs.unlinkSync(pngFilePath);

  return pngBuffer;
}

module.exports = { webp2png };
