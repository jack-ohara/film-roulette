import puppeteer from "puppeteer"
import { Cinema } from "./cinema";
import { dateIsToday, getRandomElementFromArray, wait } from "./utils";

export class EverymanCinema extends Cinema {
    private location: string;

    constructor(location: string) {
        super()

        this.location = location
    }

    async findRandomFilm(date: Date): Promise<string> {
        const browser = await puppeteer.launch()

        try {
            console.log(`Finding random film at Everyman ${this.location}`)

            const page = await browser.newPage()

            console.log("Loading home page...")
            await page.goto(`https://www.everymancinema.com/${this.location}`)
            await page.waitForNetworkIdle()

            try {
                await page.click(".cookieInfo button")
                await page.waitForNetworkIdle()
            } catch {
                console.log("Failed to accept cookies")
            }

            if (!dateIsToday(date)) {
                await page.click(".dateListCal", { button: 'left' })
                await page.waitForSelector(".dateListCal .datepicker .datepicker-days thead tr:first-child th:nth-child(2)")

                // Get to correct month
                const currentMonthAndYear = await page.evaluate(() => {
                    const dateAndYearField = document.querySelector(".dateListCal .datepicker .datepicker-days thead tr:first-child th:nth-child(2)")

                    return dateAndYearField?.textContent
                })

                if (!currentMonthAndYear) throw Error("Could not find the month and year in the date picker")

                const selectedMonthAndYear = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

                if (
                    selectedMonthAndYear.toLowerCase().replace(/\s/, '') !==
                    currentMonthAndYear.toLowerCase().replace(/\s/, '')) {
                    console.log("Changing the month in the datepicker")
                    await page.click(".dateListCal .datepicker .datepicker-days thead tr:first-child .next")
                }

                console.log("Changing the day in the date picker")
                const didChangeDay = await page.evaluate((requestedDateAsString) => {
                    const availableDays = Array.from(document.querySelectorAll(".dateListCal .datepicker .datepicker-days tbody td:not(.disabled):not(.old)"))

                    const intendedCalendarDay = availableDays.find(element => element.textContent === requestedDateAsString)

                    if (!intendedCalendarDay) {
                        return false
                    }

                    (intendedCalendarDay as HTMLElement).click()

                    return true
                }, date.getDate().toString())

                if (!didChangeDay) throw Error("Unable to find the requested day in the calendar")

                await wait(500)
            }

            console.log("Getting all films showing")
            const allFilms = await page.evaluate(() =>
                [...document.querySelectorAll("#nowShowingContainer > li:not(.dn):has(*:not(.dn) > .filmTimes:not(.dn) li) .filmItemTitle a")]
                    .map((element) => (element as HTMLAnchorElement).href)
            )

            return getRandomElementFromArray(allFilms)
        } finally {
            await browser.close()
        }
    }
}