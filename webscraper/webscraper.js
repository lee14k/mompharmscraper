const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const pg = require('pg')

const url = 'https://www.medicinesinpregnancy.org/Medicine--pregnancy/Amoxicillin/';

async function scrapeData() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const listItems = $('#mainContent');
    
    // Find the header element containing the text you're looking for
    const headerElement = $(listItems).find('h2:contains("Is it safe to use")');
    
    // Use the 'next' method to get the paragraph element immediately following the header element
    const paragraphElement = $(headerElement).next('p');
    
    // Push the selected paragraph to the array
    const paragraph = $(paragraphElement).text().trim();
    const paragraphs = [paragraph];
    
    console.dir(paragraphs);

    // Connect to the PostgreSQL database and insert the scraped data
    const pool = new pg.Pool({
      user: 'Kailee',
      host: 'localhost',
      database: 'MomPharmScraper',
      password: 'Valerie15',
      port: 5432 // or the port you are using
    });
    
    const query = 'INSERT INTO medication_info."MedInfo" (medication_name, safety_info, source_url) VALUES ($1, $2, $3)';
    const values = ['Amoxicillin', paragraph, url];
    await pool.query(query, values);
    
    fs.writeFile('paragraphs.json', JSON.stringify(paragraphs, null, 2), (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('Data inserted successfully.');
    });
  } catch (err) {
    console.log(err);
  }
}

scrapeData();
