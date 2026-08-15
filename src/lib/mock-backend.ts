/**
 * There is no real server here — this project is about the *frontend* half
 * of each auth flow. This fetch implementation stands in for a backend so
 * openapi-fetch has something real to talk to (headers in, JSON out).
 */
import { computeDigestResponse, parseAuthorization } from './digest'

export const DEMO_USERNAME = 'admin'
export const DEMO_PASSWORD = 'password123'
export const DIGEST_REALM = 'dummy-app'

const NETWORK_DELAY_MS = 500

function json(status: number, body: unknown, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

function randomHex(byteLength: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function handleBasicMe(request: Request): Response {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Basic ')) {
    return json(401, { message: 'Missing or malformed Authorization header.' })
  }

  const decoded = atob(header.slice('Basic '.length))
  const separatorIndex = decoded.indexOf(':')
  const username = decoded.slice(0, separatorIndex)
  const password = decoded.slice(separatorIndex + 1)

  if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
    return json(401, { message: 'Invalid username or password.' })
  }

  return json(200, { username, role: 'admin', authenticatedVia: 'basic' })
}

/** Live nonces, single-use to demonstrate replay protection: each one is
 * deleted the moment it's checked, whether the check passes or fails. */
const activeNonces = new Set<string>()

function challengeHeader(): string {
  const nonce = randomHex(16)
  const opaque = randomHex(8)
  activeNonces.add(nonce)
  return `Digest realm="${DIGEST_REALM}", qop="auth", nonce="${nonce}", opaque="${opaque}", algorithm=MD5`
}

function digestChallenge(message: string): Response {
  return json(401, { message }, { 'www-authenticate': challengeHeader() })
}

function handleDigestMe(request: Request): Response {
  const header = request.headers.get('authorization')
  if (!header) {
    return digestChallenge('Authentication required.')
  }

  const params = parseAuthorization(header)
  if (!params || !activeNonces.has(params.nonce)) {
    return digestChallenge('Nonce expired or unknown — try again.')
  }
  activeNonces.delete(params.nonce)

  const { response: expected } = computeDigestResponse({
    username: DEMO_USERNAME,
    password: DEMO_PASSWORD,
    realm: DIGEST_REALM,
    method: 'GET',
    uri: params.uri,
    nonce: params.nonce,
    nc: params.nc,
    cnonce: params.cnonce,
    qop: params.qop,
  })

  if (params.username !== DEMO_USERNAME || params.response !== expected) {
    return digestChallenge('Invalid username or password.')
  }

  return json(200, { username: params.username, role: 'admin', authenticatedVia: 'digest' })
}

export async function mockFetch(request: Request): Promise<Response> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  const { pathname } = new URL(request.url)
  switch (pathname) {
    case '/me':
      return handleBasicMe(request)
    case '/digest/me':
      return handleDigestMe(request)
    default:
      return json(404, { message: 'Not found' })
  }
}
