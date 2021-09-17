/**
 * Do not use this function in production unless you have some form of access control
 * It can be a security risk, as it may expose sensitive data from your datastore.
 */

import { prepareFilesystem, getGraphQLEngine } from '../../../src/utils'
import { serveStatic } from './static'
import { Handler, HandlerResponse } from '@netlify/functions'

function errorResponse(message: string): HandlerResponse {
  return {
    statusCode: 400,
    body: JSON.stringify({
      errors: [{ message }],
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }
}

export const handler: Handler = async function handler(event, context) {
  if (event.httpMethod === 'GET') {
    return serveStatic(event)
  }
  prepareFilesystem()

  if (!event.body) {
    return errorResponse('No query provided')
  }
  let query: string

  try {
    query = JSON.parse(event.body).query
  } catch (e) {
    return errorResponse('Invalid query format')
  }

  if (!query) {
    return errorResponse('No query provided')
  }

  try {
    const result = await getGraphQLEngine().runQuery(query, {})
    return {
      statusCode: 200,
      body: JSON.stringify({ extensions: {}, ...result }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  } catch (e) {
    return errorResponse(e.message)
  }
}
