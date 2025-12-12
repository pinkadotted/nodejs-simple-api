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

// Helper function to fetch Bitcoin price with multiple API fallbacks
async function getBitcoinPriceUSD() {
  const apis = [
    { 
      name: 'CryptoCompare', 
      url: 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD',
      parsePrice: (data) => data.USD
    },
    { 
      name: 'Binance', 
      url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
      parsePrice: (data) => parseFloat(data.price)
    },
    { 
      name: 'CoinPaprika', 
      url: 'https://api.coinpaprika.com/v1/tickers/btc-bitcoin',
      parsePrice: (data) => data.quotes.USD.price
    }
  ];

  // Create array of promises for parallel requests
  const promises = apis.map(async (api) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(api.url, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BitcoinAPI/1.0)',
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const price = api.parsePrice(data);
      
      if (price && !isNaN(price) && price > 0) {
        console.log(`✅ ${api.name} success: $${price}`);
        return { price, source: api.name };
      } else {
        throw new Error('Invalid price data');
      }
    } catch (error) {
      console.log(`❌ ${api.name} failed: ${error.message}`);
      return null;
    }
  });

  // Wait for first successful response
  for (const promise of promises) {
    const result = await promise;
    if (result) {
      return result;
    }
  }

  throw new Error('All Bitcoin APIs failed');
}

// Bitcoin path - returns current price of bitcoin in Singapore dollars
app.get('/btc', async (req, res) => {
  try {
    console.log('🔄 Fetching Bitcoin price with fallback APIs...');
    
    // Get Bitcoin price in USD using multiple APIs
    const { price: btcPriceUSD, source } = await getBitcoinPriceUSD();
    console.log(`📊 Using price from ${source}: $${btcPriceUSD}`);
    
    // Fetch USD to SGD conversion rate from Frankfurter API (free, no rate limiting)
    const conversionResponse = await fetch('https://api.frankfurter.app/latest?from=USD&to=SGD', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BitcoinAPI/1.0)',
        'Accept': 'application/json'
      }
    });
    
    if (!conversionResponse.ok) {
      throw new Error(`Conversion API request failed with status: ${conversionResponse.status}`);
    }
    
    const conversionData = await conversionResponse.json();
    
    if (!conversionData || !conversionData.rates || typeof conversionData.rates.SGD === 'undefined') {
      throw new Error('Invalid conversion API response structure');
    }
    
    const usdToSgdRate = conversionData.rates.SGD;
    console.log(`💱 USD to SGD conversion rate: ${usdToSgdRate}`);
    
    // Convert Bitcoin price to SGD
    const btcPriceSGD = btcPriceUSD * usdToSgdRate;
    
    const result = `Bitcoin price: S$${btcPriceSGD.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} (Source: ${source})`;
    
    console.log(`🎯 Final result: ${result}`);
    res.send(result);
  } catch (error) {
    console.error('💥 Error fetching Bitcoin price:', error.message);
    res.status(500).send('Error fetching Bitcoin price. Please try again in a moment.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});