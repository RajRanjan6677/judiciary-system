const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 1400, height: 900});
  await page.goto('http://localhost:5176/login');
  
  await page.type('input[type="email"]', 'admin@court.com');
  await page.type('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  const layout = await page.evaluate(() => {
    const main = document.querySelector('main');
    const container = document.querySelector('main > div');
    const computedMain = main ? window.getComputedStyle(main) : null;
    const computedContainer = container ? window.getComputedStyle(container) : null;
    return {
      main: main ? {
        x: main.getBoundingClientRect().x, 
        width: main.getBoundingClientRect().width,
        display: computedMain.display,
        justifyContent: computedMain.justifyContent,
        alignItems: computedMain.alignItems
      } : null,
      container: container ? {
        x: container.getBoundingClientRect().x, 
        width: container.getBoundingClientRect().width,
        classes: container.className,
        maxWidth: computedContainer.maxWidth,
        margin: computedContainer.margin
      } : null,
      windowWidth: window.innerWidth
    };
  });
  console.log(JSON.stringify(layout, null, 2));
  await browser.close();
})();
