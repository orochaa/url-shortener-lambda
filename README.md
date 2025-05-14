# URL Shortener Service

A simple, scalable URL shortener service built with **AWS Lambda**, **DynamoDB**, and the **Serverless Framework**, using **TypeScript**.

## ✨ Features

- Generate short URLs from long URLs with expiration support
- Redirect short URLs to the original address
- List all active short URLs for a given user
- Soft delete short URLs
- Built using the latest AWS SDK v3
- Fully typed with TypeScript
- Infrastructure as code via Serverless Framework

---

## 📦 API Endpoints

All endpoints are deployed via AWS API Gateway.

### Create Short URL - `POST /`

**Query Parameters**:

- `userId`: `string` – The ID of the user creating the short URL

**Request Body** (JSON):

```json
{
  "url": "https://example.com",
  "expireAt": 1717000000000 // timestamp in milliseconds
}
```

### List URLs by User - `GET /`

**Query Parameters**:

- `userId`: `string` – The ID of the user creating the short URL

**Response**:

```json
[
  {
    "userId": "123",
    "code": "abc1234",
    "originalUrl": "https://example.com",
    "createdAt": 1716000000000,
    "expireAt": 1717000000000,
    "deletedAt": null
  },
  ...
]
```

### Redirect from Short URL - `GET /{code}`

**Path Parameters**:

- `code`: `string` – The short code

### Soft Delete a URL - `DELETE /{code}`

**Path Parameters**:

- `code`: `string` – The short code

**Query Parameters**:

- `userId`: `string` – The ID of the user deleting the short URL

## 🗃 How to Deploy to AWS

1. Install serverless framework globally

```bash
npm install --global serverless
```

2. Run serverless deploy

```bash
serverless deploy
```

3. After use it, make sure to clean your AWS environment

```bash
serverless remove
```

## 🧪 How to Test

You can test the endpoints using:

### ✅ Option 1: HTTP Request Templates

This project includes a test.http file in the root directory. You can use it with VS Code and the REST Client extension to easily run and test all API endpoints.

#### Steps:

1. Install the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) for VS Code.
2. Open [test.http](./test.http).
3. Replace placeholders like `https://your-api-id.execute-api.region.amazonaws.com/dev` with your deployed URL.
4. Click `"Send Request"` above any HTTP block to run it directly.

### ✅ Option 2: curl or Postman

Example with `curl`:

```bash
curl -X POST "https://your-api-id.execute-api.region.amazonaws.com/dev/create-url?userId=123" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","expireAt":1717000000000}'
```

## 🛠 Tech Stack

- Node.js / TypeScript
- AWS Lambda
- DynamoDB (with GSI)
- Serverless Framework
- AWS SDK v3
