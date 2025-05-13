import type { APIGatewayProxyResult } from 'aws-lambda'

export const TABLE_NAME = 'ShortUrls'

export function response(
  statusCode: number,
  body?: unknown
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }
}
