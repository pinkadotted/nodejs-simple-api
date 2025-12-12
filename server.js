const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Root path - returns Hello World
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Time path - returns current date and time in Singapore
app.get('/time', (req, res) => {
  const singaporeTime = new Date().toLocaleString('en-SG', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  res.send(singaporeTime);
});

// Bitcoin path - returns current price of bitcoin in Singapore dollars
app.get('/btc', async (req, res) => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=sgd');
    const data = await response.json();
    const btcPrice = data.bitcoin.sgd;
    res.send(`Bitcoin price: S$${btcPrice.toLocaleString()}`);
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    res.status(500).send('Error fetching Bitcoin price');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});