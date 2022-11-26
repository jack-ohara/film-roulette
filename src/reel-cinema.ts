import { Page } from "puppeteer-core"
import chromium from "@sparticuz/chrome-aws-lambda"
import { Cinema } from "./cinema";
import { dateIsToday } from "./utils";

export class ReelCinema extends Cinema {
    private location: string;

    constructor(location: string) {
        super()

        this.location = location
    }

    async findRandomFilm(date: Date): Promise<string> {
        const executablePath = await chromium.executablePath
        const browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath,
            headless: false,
            ignoreHTTPSErrors: true,
        })

        try {
            console.log(`Finding random film at Reel ${this.location}`)

            const page = await browser.newPage()

            console.log("Loading home page...")
            await page.goto(`https://reelcinemas.co.uk`)
            await page.waitForNetworkIdle()

            await this.selectRequestedLocation(page);

            await page.evaluate(() => {
                (document.querySelector('.nav-bar .menu li a[href$="out-now"]') as HTMLElement).click()
            })
            await page.waitForNetworkIdle()

            if (!dateIsToday(date)) {
                await this.selectRequestedDate(page, date)
            }

            await page.evaluate(() => {
                const allFilms = Array.from(document.querySelectorAll(".movie-wrapper .movie .poster-wrapper button:first-of-type"));

                (allFilms[Math.floor(Math.random() * allFilms.length)] as HTMLElement).click()
            },)

            await page.waitForNetworkIdle()

            return page.url()
        } finally {
            await browser.close()
        }
    }


    private async selectRequestedLocation(page: Page) {
        console.log(`Selecting ${this.location} as the location`)
        await page.click(".select-cinema-modal .ui-select-container span.btn");

        const requestedLocationFound = await page.evaluate((requestedLocation) => {
            (document.querySelector(".select-cinema-modal .ui-select-container span.btn") as HTMLElement).click();

            const allLocations = Array.from(document.querySelectorAll(".select-cinema-modal ul.ui-select-choices > li > .ui-select-choices-row"));

            const requestedLocationElement = allLocations.find(loc => loc.querySelector("span")?.textContent?.toLowerCase() === requestedLocation);

            if (!requestedLocationElement) {
                return false;
            }

            (requestedLocationElement as HTMLElement).click();

            (document.querySelector(".select-cinema-modal .modal-body button") as HTMLElement).click();

            return true;
        }, this.location.toLowerCase());

        if (!requestedLocationFound)
            throw Error(`Could not find location ${this.location} in the list`);

        await page.waitForNetworkIdle();
    }

    private async selectRequestedDate(page: Page, date: Date) {
        console.log(`Selecting ${date.toLocaleDateString('en-GB')} as the date`)

        const requestedDayFound = await page.evaluate((dateToEvaluate) => {
            const allClickableDays = Array.from(document.querySelectorAll('#out-now .day-wrapper .day'))

            const dayToClick = allClickableDays.find(
                day => Array.from(day.querySelectorAll("span"))
                    .some(s => s.textContent === dateToEvaluate)
            )

            if (!dayToClick) {
                return false
            }

            (dayToClick as HTMLElement).click()

            return true
        }, date.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' }))

        if (!requestedDayFound) throw Error("Could not find requested date in the list")

        await page.waitForNetworkIdle()
    }
}
