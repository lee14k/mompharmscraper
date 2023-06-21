const Crawler = require('crawler');
const cheerio = require('cheerio');

const baseUrl = 'https://www.medicinesinpregnancy.org/Medicine--pregnancy/';
const medicationUrls = [];

const crawler = new Crawler({
  maxConnections: 10, // Maximum number of concurrent requests
  callback: (error, res, done) => {
    if (error) {
      console.log(error);
    } else {
      const $ = cheerio.load(res.body);

      // Find the paragraphs that start with "What are the risks"
      const paragraphs = [];
      $('p').each((index, element) => {
        const paragraph = $(element).text().trim();
        if (paragraph.startsWith('What are the risks')) {
          paragraphs.push(paragraph);
        }
      });

      console.log(`Medication URL: ${res.request.uri.href}`);
      console.log(`Safety Information: ${paragraphs.join('\n')}`);

      // Save or process the retrieved information as needed

      // Find and follow links to other medication pages
      $('a').each((index, element) => {
        const href = $(element).attr('href');
        if (href && href.startsWith('/Medicine--pregnancy/')) {
          const medicationUrl = baseUrl + href.substring(1);
          if (!medicationUrls.includes(medicationUrl)) {
            medicationUrls.push(medicationUrl);
            crawler.queue(medicationUrl);
            console.log(`Queued URL: ${medicationUrl}`);
          }
        }
      });
    }
    done();
  },
});

// Event handlers for crawler events
crawler.on('drain', () => {
  console.log('Crawling process finished.');
});

crawler.on('error', (error) => {
  console.log(`Crawler error: ${error}`);
});

// Start the crawling process with the initial URL
crawler.queue(baseUrl);
console.log(`Crawling started with URL: ${baseUrl}`);

// Control the crawling depth or add more configuration as needed
