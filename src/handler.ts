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

    await s3
        .putObject({
            Bucket: IMAGE_DESTINATION_BUCKET,
            Key: 'new-file.bmp',
            Body: await img.getBufferAsync(Jimp.MIME_BMP)
        })
        .promise()

    await s3
        .putObject({
            Bucket: IMAGE_DESTINATION_BUCKET,
            Key: 'new-file.png',
            Body: await img.getBufferAsync(Jimp.MIME_PNG)
        })
        .promise()

    await s3
        .putObject({
            Bucket: IMAGE_DESTINATION_BUCKET,
            Key: 'new-file.gif',
            Body: await img.getBufferAsync(Jimp.MIME_GIF)
        })
        .promise()
}
