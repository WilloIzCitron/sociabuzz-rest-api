const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const express = require('express');
const request = require('request');
const app = express();

const port = process.env.PORT || 3000
app.set("view engine", "ejs");
app.use(express.static("public"));
app.disable("x-powered-by");



app.get('/sociabuzz', (req, res) => {
    let qname = req.query.name;
    res.header("Content-Type", "application/json");
    let url = 'https://www.sociabuzz.com/' +qname+ '/tribe'
    request(url, (error, response, html) => {
        (async () => {
            const puppetapp = await puppeteer.launch({headless: true});
            const page = await puppetapp.newPage();
            await page.goto(url)
            await page.waitForTimeout(12000)
            const pageData = await page.evaluate(() =>{ 
                return{ 
                    reshtml: document.body.innerHTML
                };
            });
        
    
        if (!error && response.statusCode == 200) {
            let $ = cheerio.load(pageData.reshtml);
            let cover = $('body > main > div.set-cover > div > img').attr("src");
            let profile = $('body > main > div.set-profile > section > img').attr("src");
            let name = $('body > main > div.set-profile > section > h1').text;
            let bio = $('body > main > div.set-profile > section > p.talent-description').text;
            let about = $('body > main > div.set-abs > section > div').text;

          let json = {
            cover: cover,
            profile: profile,
            name: name,
            bio: bio,
            about: about
          };
          res.send(JSON.stringify(json));
          console.log(url);
          console.log(qname)
          await page.close();
        } else {
            res.status(404).send(
            JSON.stringify({
              error: "404 Not Found",
            }));
        }
    })();

    });
});

app.listen(port, () => {
    console.log('server started');
  });

