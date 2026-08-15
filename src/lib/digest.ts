import { md5 } from './md5'

export interface DigestChallenge {
  realm: string
  nonce: string
  qop: string
  opaque?: string
  algorithm: string
}

/** Parses the comma-separated `key="value"` pairs shared by both the
 * `WWW-Authenticate: Digest ...` and `Authorization: Digest ...` headers. */
function parseDigestParams(raw: string): Record<string, string> {
  const params: Record<string, string> = {}
  const pattern = /(\w+)=(?:"([^"]*)"|([^,\s]+))/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(raw))) {
    params[match[1]] = match[2] ?? match[3]
  }
  return params
}

export function parseWwwAuthenticate(header: string): DigestChallenge | null {
  if (!header.startsWith('Digest ')) return null
  const params = parseDigestParams(header.slice('Digest '.length))
  if (!params.realm || !params.nonce) return null
  return {
    realm: params.realm,
    nonce: params.nonce,
    qop: params.qop ?? 'auth',
    opaque: params.opaque,
    algorithm: params.algorithm ?? 'MD5',
  }
}

export interface DigestAuthorizationParams {
  username: string
  realm: string
  nonce: string
  uri: string
  qop: string
  nc: string
  cnonce: string
  response: string
  opaque?: string
}

export function parseAuthorization(header: string): DigestAuthorizationParams | null {
  if (!header.startsWith('Digest ')) return null
  const p = parseDigestParams(header.slice('Digest '.length))
  if (!p.username || !p.realm || !p.nonce || !p.uri || !p.response || !p.nc || !p.cnonce) {
    return null
  }
  return {
    username: p.username,
    realm: p.realm,
    nonce: p.nonce,
    uri: p.uri,
    qop: p.qop ?? 'auth',
    nc: p.nc,
    cnonce: p.cnonce,
    response: p.response,
    opaque: p.opaque,
  }
}

export function generateCnonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export interface ComputeDigestInput {
  username: string
  password: string
  realm: string
  method: string
  uri: string
  nonce: string
  nc: string
  cnonce: string
  qop: string
}

export interface ComputeDigestResult {
  ha1: string
  ha2: string
  response: string
}

/** RFC 2617 digest computation: response = MD5(HA1:nonce:nc:cnonce:qop:HA2) */
export function computeDigestResponse(input: ComputeDigestInput): ComputeDigestResult {
  const ha1 = md5(`${input.username}:${input.realm}:${input.password}`)
  const ha2 = md5(`${input.method}:${input.uri}`)
  const response = md5(`${ha1}:${input.nonce}:${input.nc}:${input.cnonce}:${input.qop}:${ha2}`)
  return { ha1, ha2, response }
}

export function buildAuthorizationHeader(params: DigestAuthorizationParams): string {
  const parts = [
    `username="${params.username}"`,
    `realm="${params.realm}"`,
    `nonce="${params.nonce}"`,
    `uri="${params.uri}"`,
    `qop=${params.qop}`,
    `nc=${params.nc}`,
    `cnonce="${params.cnonce}"`,
    `response="${params.response}"`,
  ]
  if (params.opaque) parts.push(`opaque="${params.opaque}"`)
  return `Digest ${parts.join(', ')}`
}
