const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

const url = 'https://www.medicinesinpregnancy.org/Medicine--pregnancy/Amoxicillin/';

async function scrapeData() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const listItems = $('#mainContent');
    const paragraphs = [];

    // Find the header element containing the text you're looking for
    const headerElement = $(listItems).find('h2:contains("Is it safe to use")');

    // Use the 'next' method to get the paragraph element immediately following the header element
    const paragraphElement = $(headerElement).next('p');

    // Push the selected paragraph to the array
    paragraphs.push($(paragraphElement).text().trim());

    console.dir(paragraphs);
    fs.writeFile('paragraphs.json', JSON.stringify(paragraphs, null, 2), (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('yay!');
    });
  } catch (err) {
    console.log(err);
  }
}

scrapeData();
