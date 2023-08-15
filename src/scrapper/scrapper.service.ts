import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { CreateScrapperDto } from './dto/create-scrapper.dto';
import { UpdateScrapperDto } from './dto/update-scrapper.dto';
import { Page } from 'puppeteer';
import userPrefs from 'puppeteer-extra-plugin-user-preferences';
import puppeteerExtra from 'puppeteer-extra';
import path from 'path';

@Injectable()
export class ScrapperService {
  create(createScrapperDto: CreateScrapperDto) {
    return 'This action adds a new scrapper';
  }

  findOne(id: number) {
    return `This action returns a #${id} scrapper`;
  }

  update(id: number, updateScrapperDto: UpdateScrapperDto) {
    return `This action updates a #${id} scrapper`;
  }

  remove(id: number) {
    return `This action removes a #${id} scrapper`;
  }
  // method to access page
  async getdataViaPuppeteer() {
    // const USERNAME_SELECTOR = '#session_key';
    // const PASSWORD_SELECTOR = '#session_password';
    // const CTA_SELECTOR = '#homepage-basic_sign-in-submit';
    // const browser = await puppeteer.launch({ headless: false });

    // const page = await browser.newPage();

    // await page.setViewport({ width: 1500, height: 768 });
    // await page.goto('https://www.linkedin.com/', {
    //   waitUntil: 'domcontentloaded',
    // });

    // // login method

    // // await page.type('#id', CREDS.username);
    // // await page.type('#loginPw', CREDS.password);
    // await page.click(USERNAME_SELECTOR);
    // await page.keyboard.type('rafay.abdul11@gmail.com');
    // await page.click(PASSWORD_SELECTOR);
    // await page.keyboard.type('pass');
    // // await page.click('[type="submit"]');
    // // await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // // click and wait for navigation
    // await Promise.all([
    //   page.click('[type="submit"]'),
    //   page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    // ]);
    // await page.screenshot({ path: 'linkedin.png' });
    // browser.close();

    const path = require('path');
    const downloadPath = path.resolve('D:/Rafay/scrapper/downloads');

    puppeteerExtra.use(
      require('puppeteer-extra-plugin-user-preferences')({
        userPrefs: {
          download: {
            prompt_for_download: false,
            open_pdf_in_system_reader: true,
          },
          plugins: {
            always_open_pdf_externally: true,
          },
        },
      }),
    );
    const browser = await puppeteerExtra.launch({
      headless: 'new',
      // devtools: false,
      // executablePath: 'C:/Program Files/Google/Chrome/Application/Chrome',
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setDefaultNavigationTimeout(60000);
    // Change this to the URL of the website you want to scrape
    const urlDocs = [
      'https://bettercotton.org/documents/summary-towards-sustainable-cotton-farming-india-impact-study-wageningen-university-research/',
      'https://bettercotton.org/documents/towards-sustainable-cotton-farming-india-impact-study-wageningen-university-research/',
      'https://bettercotton.org/documents/the-challenges-of-cooperation-in-multistakeholder-initiatives-competing-policy-concerns-for-the-formulation-on-the-better-cotton-standard-system/',
      'https://bettercotton.org/documents/copenhagen-business-school_the-effects-of-the-better-cotton-initiative-in-india-and-pakistan/',
      'https://bettercotton.org/documents/women-workers-in-global-value-chains-a-case-study-of-the-better-cotton-initiative-in-pakistan/',
    ];
    const url = 'https://bettercotton.org/';
    await page.goto(url, { waitUntil: 'networkidle2' });

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',

      downloadPath: downloadPath, // Specify the directory where the file should be downloaded
    });

    const hrefs = await page.$$eval('a[href]', (els) =>
      Array.from(new Set(els.map((a) => a.href))).filter(
        (href) =>
          href.includes('who-we-are/') ||
          href.includes('what-we-do/') ||
          href.includes('where-is-better-cotton-grown/') ||
          href.includes('field-level-results-impact/') ||
          href.includes('membership/'),
      ),
    );
    const allUrls = hrefs.concat(urlDocs);
    console.log('Total number of URLs: ', allUrls.length);

    const checkCookie = await page.$('[aria-label="I Agree"]');

    if (checkCookie !== null) {
      console.log('Cookie click');
      await page.waitForSelector('[aria-label = "I Agree"]');

      await checkCookie.click();
      // await page.setCookie(checkCookie, chec);
    }

    let countUrl = 0;
    for (const url of allUrls) {
      await page.goto(url, { waitUntil: 'networkidle2' });
      // await new Promise((resolve) => setTimeout(resolve, 6000));
      console.log('URL:', url);
      const detailsElements = await page.$$('summary.gb-accordion-title');

      const pdfLinks = await page.$$(
        'a.btn.btn-outline-primary.btn-sm.mt-2[href$=".pdf"]',
      );
      const pdfLinksGroup = await page.$$(
        'a.list-group-item__download-btn.btn.btn-outline-primary.btn-sm[href$=".pdf"],  a.list-group-item__download-btn.btn.btn-outline-primary.btn-sm[href$=".docx"]',
      );

      if (detailsElements.length !== 0) {
        console.log('detailElement number:', detailsElements.length);
        for (const detailsElement of detailsElements) {
          await detailsElement.evaluate((link) => {
            link.click();
          });
          console.log('Detail Tab Click');
        }
      }

      if (pdfLinksGroup.length !== 0) {
        console.log('Pdf Group exists on this url:', pdfLinksGroup.length);
        for (const pdfLinkG of pdfLinksGroup) {
          console.log('Downloading from group...');
          try {
            await page.evaluate((link) => link.click(), pdfLinkG);
            console.log('Click');
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (e) {
            console.log(e);
          }
        }
      }

      if (pdfLinks.length === 0) {
        console.log('Pdf exists on this url: NONE');
      } else {
        console.log('Pdf exists on this url:', pdfLinks.length);

        for (const pdfLink of pdfLinks) {
          console.log('Downloading pdfs...');
          try {
            await page.evaluate((link) => {
              link.click();
            }, pdfLink);

            // await pdfLink.evaluate((link) => {
            //   link.click(), console.log(link);
            // });
            console.log('Click');
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (e) {
            console.log(e);
          }
        }
      }

      //     await pdfLink
      //       .click()
      //       .then(
      //         async (func) =>
      //           await page
      //             .click('[class = "fas fa-download"]' || '[title*="Download"]')
      //             .then((func) => console.log('downloaded!')),
      //       );
      //     await new Promise((resolve) => setTimeout(resolve, 10000));
      countUrl++;
    }
    console.log(countUrl);
    await browser.close();
  }
}
