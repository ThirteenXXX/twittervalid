const fetch = require('node-fetch');
const fs = require('async-file');
const readlineSync = require('readline-sync');
const chalk = require('chalk');
// const email = "erzaganteng@gmail.com";
const checking = (email) => new Promise((resolve, reject) => {

    fetch(`https://api.x.com/i/users/email_available.json?email=${email}`, {
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
    })
    .then(res => res.json())
    .then(result => {
        resolve(result)
    })
    .catch(err => {
        reject(err)
    })
});
// checking()
(async () => {
	console.log(chalk.yellow('Twitter Valid Email Checker'));
    console.log(chalk.yellow('Powered by Easy to Learn'));
    console.log("")
    const file = await readlineSync.question(chalk.yellow('Input your file (Ex: list.txt) : '));
    
    const akun = await fs.readFile(file, 'utf8');
    let listemail = [];
	await listemail.push(akun.toString().replace(/\r\n|\r|\n/g, " ").split(" "));
    if(listemail[0].length > 0) {
        console.log(chalk.yellow('Ready to check '+listemail[0].length+' accounts'));
        console.log(chalk.yellow('This may take a few minutes. Please wait a moment...'))
        console.log("")
	    for (var i = 0; i < listemail[0].length; i++) {
        
            const akunn = listemail[0][i];
	    const pecah = akunn.split('|');
	    const email = pecah[0];
        const check = await checking(email);
        if(check.taken === false){
            //console.log(chalk.green(`[LIVE] ${email} ${check.msg}`));
            console.log(chalk.green(`[AVAILABLE] ${email}`));
            const goodlist = await fs.appendFile('notRegistered.txt',`${email}\n`, function (err) {
                if (err) throw err;
                console.log('Failed to save list, boss!');});
        }else{
            //console.log(chalk.red(`[BAD] ${email} ${check.msg}`));
            console.log(chalk.red(`[TAKEN] ${email}`));
            const badlist = await fs.appendFile('registered.txt',`${email}\n`, function (err) {
                if (err) throw err;
                console.log('Failed to save list, boss!');});
            
        }
        
        
	   }
    } else {
    	console.log("File doesn't exist");
    }
})();
