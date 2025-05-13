import { GetCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyHandler } from 'aws-lambda'
import { dynamo } from '../dynamodb-client.js'
import { TABLE_NAME, response } from '../utils.js'

interface RedirectPathParameters {
  code: string
}

export const handler: APIGatewayProxyHandler = async event => {
  try {
    const { code } = (event.pathParameters ??
      {}) as unknown as Partial<RedirectPathParameters>

    if (!code) {
      return response(400, { message: 'code is required' })
    }

    const result = await dynamo.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          code,
        },
      })
    )
    const shortUrl = result.Item as ShortUrl | undefined

    if (!shortUrl || shortUrl.expireAt < Date.now() || shortUrl.deletedAt) {
      return response(404, { message: 'URL not found' })
    }

    return {
      statusCode: 301,
      headers: {
        Location: shortUrl.originalUrl,
      },
      body: '',
    }
  } catch (error) {
    console.error(error)

    return response(500, { message: 'something went wrong' })
  }
}
