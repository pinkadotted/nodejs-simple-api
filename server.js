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
    // Fetch Bitcoin price in USD (no rate limiting issues)
    const btcResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    
    if (!btcResponse.ok) {
      throw new Error(`Bitcoin API request failed with status: ${btcResponse.status}`);
    }
    
    const btcData = await btcResponse.json();
    
    if (!btcData || !btcData.bitcoin || typeof btcData.bitcoin.usd === 'undefined') {
      throw new Error('Invalid Bitcoin API response structure');
    }
    
    const btcPriceUSD = btcData.bitcoin.usd;
    console.log('Bitcoin price in USD:', btcPriceUSD);
    
    // Fetch USD to SGD conversion rate from Frankfurter API (free, no rate limiting)
    const conversionResponse = await fetch('https://api.frankfurter.app/latest?from=USD&to=SGD');
    
    if (!conversionResponse.ok) {
      throw new Error(`Conversion API request failed with status: ${conversionResponse.status}`);
    }
    
    const conversionData = await conversionResponse.json();
    
    if (!conversionData || !conversionData.rates || typeof conversionData.rates.SGD === 'undefined') {
      throw new Error('Invalid conversion API response structure');
    }
    
    const usdToSgdRate = conversionData.rates.SGD;
    console.log('USD to SGD conversion rate:', usdToSgdRate);
    
    // Convert Bitcoin price to SGD
    const btcPriceSGD = btcPriceUSD * usdToSgdRate;
    
    res.send(`Bitcoin price: S$${btcPriceSGD.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`);
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    res.status(500).send('Error fetching Bitcoin price');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});