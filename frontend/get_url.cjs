const https = require('https');
const options = {
  hostname: 'en.wikipedia.org',
  path: '/w/api.php?action=query&titles=File:Emblem_of_the_Supreme_Court_of_India.svg&prop=imageinfo&iiprop=url&format=json',
  headers: { 'User-Agent': 'MyBot/1.0' }
};
https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        const pages = json.query.pages;
        const page = Object.values(pages)[0];
        console.log(page.imageinfo[0].url);
    } catch(e) {
        console.error(e, data);
    }
  });
});
