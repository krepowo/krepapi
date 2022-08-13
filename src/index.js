const express = require('express');
const path = require('path');
const pp = require('puppeteer');
const conf = require('./config/config.json');

const app = express();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"))
})

app.use('/cdn', express.static(path.join(__dirname, 'public')));
(async () => {
    const browser = await pp.launch();
    app.get("/screenshot", async (req, res) => {
        let url = req.query.url;
        if (!url) {
            res.send(`${conf.domain}/screenshot/?url=example.com\n\n`);
            return;
        }
        let awe = /^((http|https|ftp):\/\/)/;
        if (!awe.test(url)) {
            url = "http://" + url;
        }
        // if (!isurl.isUri(url)) return res.status(400).send({
        //     error: true,
        //     message: "Invalid URL provided."
        // })
        let name = randomname(7);
        try {
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'load', timeout: 0 })
            await page.setViewport({ width: 1280, height: 720 })
            await page.screenshot({ path: path.join(__dirname, `public/${name}.png`) });

        } catch (error) {
            return res.status(400).send({
                error: true,
                message: "Invalid URL provided."
            })
        }

        res.send({
            error: false,
            url: `${conf.domain}/cdn/${name}.png`
        })

    })
})()

app.listen(conf.port, () => {
    console.log("[APP] Express server is ready!");
})


//=== function ===//

function randomname(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}