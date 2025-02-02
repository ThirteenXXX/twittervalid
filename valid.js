const fetch = require('node-fetch');
const fs = require('fs').promises;
const readlineSync = require('readline-sync');
const chalk = require('chalk');

const checking = async (email) => {
    try {
        const response = await fetch(`https://api.x.com/i/users/email_available.json?email=${email}`, {
            method: 'GET',
            headers: {
                "authorization": `Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA`,
                "Origin": `https://x.com`,
                "Referer": "https://x.com/i/flow/signup",
                "Sec-Fetch-Mode": "cors",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
                "x-csrf-token": "ab07b56686b83e0c165ba917731a0927",
                "x-guest-token": "1185937517071060992",
                "x-twitter-active-user": "yes",
                "x-twitter-client-language": "en"
            }
        });

        if (!response.ok) {
            console.log(chalk.red(`[ERROR] Request failed with status ${response.status}`));
            return null;
        }

        const text = await response.text();
        if (!text) {
            console.log(chalk.red(`[ERROR] Empty response for ${email}`));
            return null;
        }

        const result = JSON.parse(text);
        return result;

    } catch (error) {
        console.log(chalk.red(`[ERROR] ${error.message}`));
        return null;
    }
};

(async () => {
    console.log(chalk.yellow('Twitter Valid Email Checker'));
    console.log(chalk.yellow('Powered by Easy to Learn'));
    console.log("");
    
    const file = readlineSync.question(chalk.yellow('Input your file (Ex: list.txt) : '));
    
    try {
        const akun = await fs.readFile(file, 'utf8');
        let listemail = akun.split(/\r?\n/).filter(email => email.trim() !== "");

        if (listemail.length > 0) {
            console.log(chalk.yellow(`Ready to check ${listemail.length} accounts`));
            console.log(chalk.yellow('This may take a few minutes. Please wait...'));
            console.log("");

            for (const email of listemail) {
                const check = await checking(email);
                
                if (check && check.taken === false) {
                    console.log(chalk.green(`[AVAILABLE] ${email}`));
                    await fs.appendFile('notRegistered.txt', `${email}\n`);
                } else if (check && check.taken === true) {
                    console.log(chalk.red(`[TAKEN] ${email}`));
                    await fs.appendFile('registered.txt', `${email}\n`);
                } else {
                    console.log(chalk.red(`[ERROR] Failed to check ${email}`));
                }
            }
        } else {
            console.log(chalk.red("File is empty or does not exist."));
        }
    } catch (err) {
        console.log(chalk.red(`Failed to read file: ${err.message}`));
    }
})();
