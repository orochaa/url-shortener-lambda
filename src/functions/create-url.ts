import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyHandler } from 'aws-lambda'
import { nanoid } from 'nanoid'
import { dynamo } from '../dynamodb-client.js'
import { TABLE_NAME, response } from '../utils.js'

interface CreateShortUrlBody {
  url: string
  expireAt: number
}

interface CreateShortUrlQueryParameters {
  userId: string
}

export const handler: APIGatewayProxyHandler = async event => {
  try {
    const { url: originalUrl, expireAt } = JSON.parse(
      event.body ?? '{}'
    ) as Partial<CreateShortUrlBody>
    const { userId } = (event.queryStringParameters ??
      {}) as Partial<CreateShortUrlQueryParameters>

    if (!userId) {
      return response(401, { message: 'userId is required' })
    }

    if (!originalUrl) {
      return response(400, { message: 'url is required' })
    }

    if (!expireAt) {
      return response(400, { message: 'expireAt is required' })
    }

    const expireAtDate = new Date(expireAt)

    if (
      Number.isNaN(expireAtDate.getTime()) ||
      expireAtDate.getTime() < Date.now()
    ) {
      return response(400, { message: 'expireAt is invalid' })
    }

    const shortUrl: ShortUrl = {
      userId,
      originalUrl,
      code: await generateCode(),
      createdAt: Date.now(),
      expireAt: expireAtDate.getTime(),
      deletedAt: null,
    }

    await dynamo.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: shortUrl,
      })
    )

    return response(201, shortUrl)
  } catch (error) {
    console.error(error)

    return response(500, { message: 'failed to create URL' })
  }
}

async function generateCode(attempts = 5): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    const code = nanoid(9)

    const result = await dynamo.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          code,
        },
      })
    )

    const isCodeDuplicated = !!result.Item

    if (isCodeDuplicated) {
      continue
    }

    return code
  }

  throw new Error(`Failed to generate unique code after ${attempts} attempts`)
}
