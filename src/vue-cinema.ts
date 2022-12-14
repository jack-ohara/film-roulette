import chromium from "@sparticuz/chrome-aws-lambda"
import { Cinema } from "./cinema";
import { dateIsToday, saveFileToS3, wait } from "./utils";

export class VueCinema extends Cinema {
    private location: string

    constructor(location: string) {
        super();
        this.location = location
    }

    async findRandomFilm(date: Date): Promise<string> {
        const executablePath = await chromium.executablePath
        const browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        })

        try {
            console.log(`Finding random film at Vue ${this.location}`)

            const page = await browser.newPage()

            console.log("Loading home page...")
            await page.goto(`https://www.myvue.com/cinema/${this.location}/whats-on`)
            await page.waitForNetworkIdle()

            await wait(1000)

            await saveFileToS3(await page.screenshot() as Buffer, "vue-home-page.png")

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
                await wait(500)
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
