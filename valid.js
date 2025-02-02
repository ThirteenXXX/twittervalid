const fetch = require('node-fetch');
const fs = require('fs').promises;
const readlineSync = require('readline-sync');
const chalk = require('chalk');

const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

// Fungsi untuk mendapatkan guest token terbaru
const getGuestToken = async () => {
    try {
        const res = await fetch("https://api.x.com/1.1/guest/activate.json", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${BEARER_TOKEN}`
            }
        });
        const data = await res.json();
        return data.guest_token || null;
    } catch (err) {
        console.log(chalk.red("[ERROR] Gagal mendapatkan guest token"));
        return null;
    }
};

// Fungsi untuk mengecek ketersediaan email
const checking = async (email, guestToken, retries = 3) => {
    try {
        const res = await fetch(`https://api.x.com/i/users/email_available.json?email=${email}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${BEARER_TOKEN}`,
                "x-guest-token": guestToken,
                "Origin": "https://x.com",
                "Referer": "https://x.com/i/flow/signup",
                "Sec-Fetch-Mode": "cors",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
            }
        });

        if (res.status === 429) {
            if (retries > 0) {
                console.log(chalk.yellow(`[RETRY] Rate limit kena, tunggu 5 detik... (${retries} retries left)`));
                await new Promise(r => setTimeout(r, 5000));
                return checking(email, await getGuestToken(), retries - 1);
            } else {
                console.log(chalk.red(`[ERROR] Rate limit habis untuk ${email}`));
                return null;
            }
        }

        const result = await res.json();
        return result;
    } catch (err) {
        console.log(chalk.red(`[ERROR] Gagal cek ${email}: ${err.message}`));
        return null;
    }
};

// Fungsi utama
(async () => {
    console.log(chalk.yellow('Twitter Valid Email Checker'));
    console.log(chalk.yellow('Powered by Easy to Learn'));
    console.log("");

    const file = readlineSync.question(chalk.yellow('Input your file (Ex: list.txt) : '));

    try {
        const akun = await fs.readFile(file, 'utf8');
        let listemail = akun.split(/\r?\n/).filter(email => email.trim() !== "");

        if (listemail.length > 0) {
            console.log(chalk.yellow(`Siap cek ${listemail.length} akun`));
            console.log(chalk.yellow('Tunggu sebentar, ini mungkin memakan waktu...'));
            console.log("");

            let guestToken = await getGuestToken();
            if (!guestToken) {
                console.log(chalk.red("[ERROR] Tidak bisa mendapatkan guest token, keluar..."));
                return;
            }

            for (const email of listemail) {
                const check = await checking(email, guestToken);
                if (check) {
                    if (check.taken === false) {
                        console.log(chalk.green(`[AVAILABLE] ${email}`));
                        await fs.appendFile('notRegistered.txt', `${email}\n`);
                    } else {
                        console.log(chalk.red(`[TAKEN] ${email}`));
                        await fs.appendFile('registered.txt', `${email}\n`);
                    }
                } else {
                    console.log(chalk.red(`[ERROR] Gagal cek ${email}`));
                }
                await new Promise(r => setTimeout(r, 5000)); // Delay 5 detik agar tidak terkena rate limit
            }
        } else {
            console.log(chalk.red("File kosong atau tidak ditemukan."));
        }
    } catch (err) {
        console.log(chalk.red(`Gagal membaca file: ${err.message}`));
    }
})();
