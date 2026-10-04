import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const authMethods = [
  {
    slug: 'basic',
    title: 'Basic Authentication',
    tagline: 'Username + password, base64-encoded in a header',
    description:
      'A method for an HTTP user agent (e.g. a web browser) to provide a username and password when making a request.',
    status: 'available',
  },
  {
    slug: 'digest',
    title: 'Digest Authentication',
    tagline: 'Challenge-response hashing, password never sent',
    description:
      'The server issues a nonce in a 401 challenge; the client hashes it together with the password and retries — the password itself never crosses the wire.',
    status: 'available',
  },
  {
    slug: 'session-cookie',
    title: 'Session / Cookie Authentication',
    tagline: 'Server-issued session id stored in a cookie',
    description:
      'The server creates a session after login and the browser sends it back automatically on every request via a cookie.',
    status: 'planned',
  },
  {
    slug: 'bearer-jwt',
    title: 'Bearer Token (JWT)',
    tagline: 'Signed token sent in the Authorization header',
    description:
      'The client stores a token after login and attaches it as "Authorization: Bearer <token>" on every request.',
    status: 'planned',
  },
  {
    slug: 'oauth2',
    title: 'OAuth 2.0 / OIDC',
    tagline: 'Delegated login via a third-party provider',
    description:
      'The user authenticates with a provider (Google, GitHub, ...) and the app receives a token via a redirect flow.',
    status: 'planned',
  },
  {
    slug: 'api-key',
    title: 'API Key',
    tagline: 'A static secret issued per client or app',
    description:
      'A long-lived key sent as a header or query param, typically used for server-to-server or third-party API access.',
    status: 'planned',
  },
  {
    slug: 'mfa-totp',
    title: 'Multi-Factor Auth (TOTP)',
    tagline: 'A time-based one-time code as a second factor',
    description:
      'After a first factor (password) succeeds, the user proves possession of a device via a rotating 6-digit code.',
    status: 'planned',
  },
  {
    slug: 'passkeys',
    title: 'Passkeys / WebAuthn',
    tagline: 'Public-key credentials backed by a device authenticator',
    description:
      'The browser talks to a platform or roaming authenticator to sign a challenge, with no password ever transmitted.',
    status: 'planned',
  },
] as const

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Authentication in the frontend</h1>
        <p className="mt-2 text-muted-foreground">
          A tour of the ways a browser-based app authenticates requests, and what each
          one actually looks like on the wire. Pick a method to see its flow.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {authMethods.map((method) => {
          const isAvailable = method.status === 'available'
          const card = (
            <Card
              className={
                isAvailable
                  ? 'transition-colors hover:border-primary/50 group'
                  : 'opacity-60'
              }
            >
              <CardHeader className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{method.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{method.tagline}</p>
                </div>
                {isAvailable ? (
                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground me-5 opacity-0 group-hover:me-0 group-hover:opacity-100 transition-all" />
                ) : (
                  <Badge variant="secondary" className="shrink-0">
                    Coming soon
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </CardContent>
            </Card>
          )

          return (
            <li key={method.slug}>
              {isAvailable ? <Link to={`/auth/${method.slug}`}>{card}</Link> : card}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
