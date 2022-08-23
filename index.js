import axios from "axios";
import puppeteer from "puppeteer";

const apiKey = process.env.API_KEY
const USER_ID = process.env.USER_ID
const sitekey = '32F41B72-B632-4273-BD6E-9F487499B5B3'
const surl='https://client.arkoselabs.com'
const url=`https://gtop100.com/topsites/MapleStory/sitedetails/MapleMS-Old-School-with-Modern-Features-Progressive-EXP--Linked-Stats--No-HP-Washing-101025?vote=1&pingUsername=${USER_ID}`

async function webSubmit (token) {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('#FunCaptcha')
    await page.$eval("input[name='fc-token']", (el, token) => el.value = token, token)
    await page.click('#votebutton')
    setTimeout(() => {
        browser.close()
    }, 5000)
}

function checkStatus (id) {
    axios.get(`http://2captcha.com/res.php?key=${apiKey}&action=get&id=${id}`)
    .then(response => {
        if (response.data === 'CAPCHA_NOT_READY') {
            console.log("Captcha not ready, retrying in 10 seconds...")
            setTimeout(() => {
                checkStatus(id)
            }, 10000)
        } else {
            const token = response.data.slice(3)
            console.log(`Captcha is ready! Token is: ${token}`)
            webSubmit(token)
        }
    })
    .catch(e => console.log(e))
}

function post() {
    const postUrl = `http://2captcha.com/in.php?key=${apiKey}&method=funcaptcha&publickey=${sitekey}&surl=${surl}&pageurl=${url}`
    axios.post(postUrl)
    .then(response => {
        const id = response.data.slice(3)
        console.log("Captcha received, ID = " + id)
        setTimeout(() => {
            console.log("Checking if captcha is ready...")
            checkStatus(id)
        }, 30000)
    })
    .catch(error => console.log(error))
}

post()
// webSubmit()