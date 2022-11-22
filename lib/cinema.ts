import { Page } from "puppeteer"

export abstract class Cinema {
    abstract findRandomFilm(page: Page, date: Date): Promise<string>
}