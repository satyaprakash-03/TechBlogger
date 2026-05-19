const https = require('https');

const url = 'https://techblogger.onrender.com/uploads/image-1779178911529.jpeg';

https.get(url, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', res.headers);
}).on('error', (e) => {
  console.error('ERROR:', e.message);
});
