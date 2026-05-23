const https = require('https');
https.get('https://en.wikipedia.org/wiki/Supreme_Court_of_India', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const match = data.match(/\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[^"]+Emblem_of_the_Supreme_Court_of_India\.svg/);
    if (match) console.log('https:' + match[0]);
    else console.log('Not found');
  });
});
