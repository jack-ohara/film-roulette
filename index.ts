import puppeteer from "puppeteer"
import { Cinema } from "./lib/cinema"
import { EverymanCinema } from "./lib/everyman-cinema"
import { ReelCinema } from "./lib/reel-cinema"
import { getRandomElementFromArray } from "./lib/utils"
import { VueCinema } from "./lib/vue-cinema"

const cinemasToChooseFrom: Cinema[] = [
    new VueCinema("accrington"),
    new VueCinema("blackburn"),
    new VueCinema("preston"),
    new EverymanCinema("clitheroe"),
    new ReelCinema("burnley"),
    new ReelCinema("blackburn"),
]

async function getRandomFilm() {
    const randomCinema = getRandomElementFromArray(cinemasToChooseFrom)

    const link = await randomCinema.findRandomFilm(new Date('11/26/2022'))

    return link
}

async function main() {
    const randomFilm = await getRandomFilm()

    console.log(randomFilm)
}

main()