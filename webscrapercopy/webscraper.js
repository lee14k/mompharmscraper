const Crawler = require('crawler');
const cheerio = require('cheerio');
const { Pool } = require('pg');

const baseUrl = 'https://www.medicinesinpregnancy.org/Medicine--pregnancy/';
const medicationUrls = [];

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'MomPharm',
  password: 'Valerie15',
  port: 5432 // or the port you are using
});

const crawler = new Crawler({
  maxConnections: 10, // Maximum number of concurrent requests
  callback: (error, res, done) => {
    if (error) {
      console.log(error);
    } else {
      const $ = cheerio.load(res.body);

      // Extract the medication name from the URL
      const medicationName = getMedicationNameFromUrl(res.request.uri.href);

      // Find the 'risks' heading and extract the paragraph that follows
      const risksHeading = $('h2:contains("risks")');
      const paragraph = risksHeading.next('p').text().trim();

      console.log(`Medication URL: ${res.request.uri.href}`);
      console.log(`Medication Name: ${medicationName}`);
      console.log(`Safety Information: ${paragraph}`);

      // Save the retrieved information to the database
      const query = 'INSERT INTO meds.med_info ("medication_name", "safety_info", "source_url") VALUES ($1, $2, $3)';
      const values = [medicationName, paragraph, res.request.uri.href];

      pool
        .query(query, values)
        .then(() => {
          console.log('Medication saved to the database');
        })
        .catch((error) => {
          console.log('Error saving medication to the database:', error);
        });

      // Find and follow links to other medication pages
      $('a').each((index, element) => {
        const href = $(element).attr('href');
        if (href && href.startsWith('/Medicine--pregnancy/')) {
          const medicationUrl = baseUrl + href.substring('/Medicine--pregnancy/'.length);
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

// Function to extract the medication name from the URL
function getMedicationNameFromUrl(url) {
  const parts = url.split('/');
  const medicationName = parts[parts.length - 1].replace(/-/g, ' '); // Replace hyphens with spaces
  return medicationName;
}
