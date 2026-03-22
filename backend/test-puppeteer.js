const puppeteer = require('puppeteer');
(async () => {
    try {
        console.log("Launching puppeteer...");
        const browser = await puppeteer.launch({ 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        console.log("Puppeteer works!");
        await browser.close();
    } catch(e) {
        console.error("PUPPETEER ERROR:", e);
        process.exit(1);
    }
})();
