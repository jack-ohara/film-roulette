export abstract class Cinema {
    abstract findRandomFilm(date: Date): Promise<string>
}