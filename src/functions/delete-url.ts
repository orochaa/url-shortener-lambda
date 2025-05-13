import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyHandler } from 'aws-lambda'
import { dynamo } from '../dynamodb-client.js'
import { TABLE_NAME, response } from '../utils.js'

interface DeleteShortUrlPathParameters {
  code: string
}

interface DeleteShortUrlQueryParameters {
  userId: string
}

export const handler: APIGatewayProxyHandler = async event => {
  try {
    const { code } = (event.pathParameters ??
      {}) as Partial<DeleteShortUrlPathParameters>
    const { userId } = (event.queryStringParameters ??
      {}) as Partial<DeleteShortUrlQueryParameters>

    if (!userId) {
      return response(401, { message: 'userId is required' })
    }

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

    if (!shortUrl) {
      return response(404, { message: 'URL not found' })
    }

    if (shortUrl.userId !== userId) {
      return response(403, { message: 'not authorized to delete this URL' })
    }

    if (shortUrl.expireAt < Date.now()) {
      return response(409, { message: 'URL already expired' })
    }

    if (shortUrl.deletedAt) {
      return response(409, { message: 'URL already deleted' })
    }

    await dynamo.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          code,
        },
        UpdateExpression: 'SET deletedAt = :now',
        ExpressionAttributeValues: {
          ':now': Date.now(),
        },
      })
    )

    return response(200)
  } catch (error) {
    console.error(error)

    return response(500, { message: 'failed to delete URL' })
  }
}
