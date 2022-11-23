import { APIGatewayProxyResultV2 } from "aws-lambda/trigger/api-gateway-proxy";
import { Cinema } from "./src/cinema";
import { EverymanCinema } from "./src/everyman-cinema";
import { ReelCinema } from "./src/reel-cinema";
import { getRandomElementFromArray } from "./src/utils";
import { VueCinema } from "./src/vue-cinema";

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

export async function handler(): Promise<APIGatewayProxyResultV2> {
    try {
        const randomFilm = await getRandomFilm()

        return {
            statusCode: 200,
            body: JSON.stringify({ link: randomFilm })
        }
    } catch (error) {
        console.log("Failed to find a random film")
        console.error(error)

        return {
            statusCode: 500,
            body: JSON.stringify({ error })
        }
    }
}