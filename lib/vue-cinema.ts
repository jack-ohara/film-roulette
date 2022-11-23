import puppeteer from "puppeteer"
import { Cinema } from "./cinema";
import { dateIsToday, wait } from "./utils";

export class VueCinema extends Cinema {
    private location: string

    constructor(location: string) {
        super();
        this.location = location
    }

    async findRandomFilm(date: Date): Promise<string> {
        const browser = await puppeteer.launch()

        try {
            console.log(`Finding random film at Vue ${this.location}`)

            const page = await browser.newPage()

            console.log("Loading home page...")
            await page.goto(`https://www.myvue.com/cinema/${this.location}/whats-on`)
            await page.waitForNetworkIdle()

            try {
                await page.click(".accept-btn-container button")
                console.log("Accepted cookies")
            } catch (e) {
                console.log("Failed to accept cookies")
                console.log(e)
            }

            if (!dateIsToday(date)) {
                const shortDayFormat = date.toLocaleDateString('en-GB', { weekday: 'short' })

                console.log(`Changing the day in the date picker to ${shortDayFormat}`)
                const dayChanged = await page.evaluate((shortDayFormat) => {
                    const allDaySelections = Array.from(document.querySelectorAll('.day-selector ul li label'))
                    const requestedDayButton = allDaySelections.find(x => (x as HTMLLabelElement).textContent === shortDayFormat)

                    if (!requestedDayButton) {
                        return false
                    }

                    (requestedDayButton as HTMLElement).click()

                    return true
                }, shortDayFormat)

                if (!dayChanged) throw Error("Unable to change the day")
                console.log("Changed the day")
                await page.screenshot({ path: "after-click-before-wait.png", fullPage: true })
                await wait(500)
                await page.screenshot({ path: "after-click-after-wait.png", fullPage: true })
            }

            console.log("Querying page")
            const randomFilmSlug = await page.evaluate(() => {
                const allFilms = Array.from(document.querySelectorAll(".filmlist__item"))
                const randomFilmItem = allFilms[Math.floor(Math.random() * allFilms.length)]
                const randomFilmAnchor = randomFilmItem.querySelector(".filmlist__wrap a")

                if (!randomFilmAnchor) throw new Error("Unable to find anchor for random file")

                const randomFilmLink = (randomFilmAnchor as HTMLAnchorElement).href

                return randomFilmLink.split('/').at(-1)
            })

            if (!randomFilmSlug) throw new Error(`Failed to find slug for a random film at Vue ${this.location}`)

            return this.getFilmTimesUrl(randomFilmSlug)
        } finally {
            await browser.close()
        }
    }

    private getFilmTimesUrl(filmName: string): string {
        return `https://www.myvue.com/cinema/${this.location}/film/${filmName}/times`
    }
}