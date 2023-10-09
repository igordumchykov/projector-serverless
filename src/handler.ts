import { S3Event } from 'aws-lambda'
import http from 'http'
import https from 'https'
import AWSXRay from 'aws-xray-sdk'
import Jimp from "jimp";
import AWS from 'aws-sdk'

AWSXRay.captureHTTPsGlobal(http, true)
AWSXRay.captureHTTPsGlobal(https, true)
AWSXRay.setContextMissingStrategy((msg) => console.error(msg))

const s3 = new AWS.S3()

const { IMAGE_DESTINATION_BUCKET } = process.env

const mimeTypes = [{
    type: Jimp.MIME_BMP,
    fileName: 'new-file.bmp'
}, {
    type: Jimp.MIME_PNG,
    fileName: 'new-file.png'
}, {
    type: Jimp.MIME_GIF,
    fileName: 'new-file.gif'
}]

export const convertFile = async (event: S3Event): Promise<void> => {
    const record = event.Records[0].s3
    const bucket = record.bucket.name
    const fileName = decodeURIComponent(record.object.key.replace(/\+/g, ' '))

    console.debug(`Process file from bucket: ${bucket}, file: ${fileName}`)

    const response = await s3
        .getObject({
            Bucket: bucket,
            Key: fileName,
        })
        .promise()

    console.log(`Got file from bucket ${response.Body}`)

    const img = await Jimp.create(response.Body as Buffer)

    await Promise.all(mimeTypes.map(async (i) => {
        await s3
            .putObject({
                Bucket: IMAGE_DESTINATION_BUCKET,
                Key: i.fileName,
                Body: await img.getBufferAsync(i.type)
            })
            .promise()
    }))
}
