const puppeteer = require('puppeteer-extra');
var userAgent = require('user-agents');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const tracer = require('dd-trace').init({
    service: 'bluesky-rss-api',  
    env: 'production',           
    version: '1.0.0'           
});
puppeteer.use(StealthPlugin());
const express = require("express");
const profile_url = "https://bsky.app/profile/";

const app = express();
const PORT = process.env.SERVER_PORT || 7788;

let browser = null;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    // Launch browser once when the server starts
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
});

app.get('/user/:handle', async (req, res) => {
    let handle = req.params.handle;

    if (!handle) {
        res.status(400).json({"message": "handle query param is required"});
    }

    var page = await browser.newPage();

    try {
        //Randomize viewport size
        await page.setViewport({
            width: 1920 + Math.floor(Math.random() * 100),
            height: 3000 + Math.floor(Math.random() * 100),
            deviceScaleFactor: 1,
            hasTouch: false,
            isLandscape: false,
            isMobile: false,
        });

        await page.evaluateOnNewDocument(() => {
            // Pass webdriver check
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });

        await page.evaluateOnNewDocument(() => {
            // Pass chrome check
            window.chrome = {
                runtime: {},
                // etc.
            };
        });

        await page.evaluateOnNewDocument(() => {
            //Pass notifications check
            const originalQuery = window.navigator.permissions.query;
            return window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });

        await page.evaluateOnNewDocument(() => {
            // Overwrite the `plugins` property to use a custom getter.
            Object.defineProperty(navigator, 'plugins', {
                // This just needs to have `length > 0` for the current test,
                // but we could mock the plugins too if necessary.
                get: () => [1, 2, 3, 4, 5],
            });
        });

        await page.evaluateOnNewDocument(() => {
            // Overwrite the `languages` property to use a custom getter.
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
            });
        });

        await page.setUserAgent(userAgent.random().toString());
        await page.goto(profile_url + handle);

        const rssUrl = await page.evaluate(() => {
            const link = document.querySelector('link[rel="alternate"][type="application/rss+xml"]');
            return link ? link.href : null;
        });

        if (rssUrl) {
            res.json({ rssUrl });
        } else {
            res.status(404).json({ message: "RSS feed not found." });
        }
    } catch(error) {
        console.error("Error fetching BlueSky RSS URL:", error);
        res.status(500).json({ message: "Failed to fetch BlueSky profile" });
    } finally {
        page.close()
    }
    
});

// Close the browser when the server shuts down
process.on('SIGINT', async () => {
    if (browser) {
        await browser.close();
        console.log('Browser closed.');
    }
    process.exit();
});