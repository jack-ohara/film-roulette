import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

export function getRandomElementFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function dateIsToday(date: Date): boolean {
    const today = new Date()

    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    )
}

export function wait(timeInMiliseconds: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, timeInMiliseconds))
}

export async function saveFileToS3(file: Buffer, name: string) {
    console.log(`Uploading ${name} to s3`)
    const bucketName = process.env.S3_BUCKET_NAME

    if (!bucketName) {
        throw new Error("No bucket name found")
    }

    const s3Client = new S3Client({})
    const command = new PutObjectCommand({Bucket: bucketName, Key: name, Body: file})
    const s3Objet = await s3Client.send(command)

    console.log('put response:', s3Objet)
}