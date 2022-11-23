import { Cinema } from "./src/cinema"
import { EverymanCinema } from "./src/everyman-cinema"
import { ReelCinema } from "./src/reel-cinema"
import { getRandomElementFromArray } from "./src/utils"
import { VueCinema } from "./src/vue-cinema"

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