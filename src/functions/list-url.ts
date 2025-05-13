import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyHandler } from 'aws-lambda'
import { dynamo } from '../dynamodb-client.js'
import { TABLE_NAME, response } from '../utils.js'

interface ListShortUrlQueryParameters {
  userId: string
}

export const handler: APIGatewayProxyHandler = async event => {
  try {
    const { userId } = (event.queryStringParameters ??
      {}) as unknown as Partial<ListShortUrlQueryParameters>

    if (!userId) {
      return response(401, { message: 'userId is required' })
    }

    const result = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'userId-index',
        KeyConditionExpression: '#uid = :uid',
        ExpressionAttributeNames: {
          '#uid': 'userId',
        },
        ExpressionAttributeValues: {
          ':uid': userId,
        },
      })
    )
    const now = Date.now()
    const items = ((result.Items ?? []) as ShortUrl[]).filter(
      item => item.deletedAt === null && item.expireAt > now
    )

    return response(200, items)
  } catch (error) {
    console.error(error)

    return response(500, { message: 'something went wrong' })
  }
}
