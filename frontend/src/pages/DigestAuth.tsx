import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DigestAuth() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to menu
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">Digest Authentication</h1>
        <p className="mt-2 text-muted-foreground">
          A challenge-response scheme: the server issues a nonce, the client hashes it
          together with the password, and only the hash is ever sent — the password
          itself never crosses the wire, even unencrypted.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How the flow works</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <ol className="list-inside list-decimal space-y-1">
            <li>Client requests a protected resource with no credentials.</li>
            <li>
              Server replies <code className="font-mono text-foreground">401</code> with a{' '}
              <code className="font-mono text-foreground">WWW-Authenticate: Digest</code>{' '}
              header containing a <code className="font-mono text-foreground">realm</code> and a
              fresh, single-use <code className="font-mono text-foreground">nonce</code>.
            </li>
            <li>
              Client computes{' '}
              <code className="font-mono text-foreground">HA1 = MD5(username:realm:password)</code>{' '}
              and <code className="font-mono text-foreground">HA2 = MD5(method:uri)</code>, then{' '}
              <code className="font-mono text-foreground">
                response = MD5(HA1:nonce:nc:cnonce:qop:HA2)
              </code>
              .
            </li>
            <li>
              Client retries with an{' '}
              <code className="font-mono text-foreground">Authorization: Digest ...</code>{' '}
              header carrying that response hash, plus its own client nonce (
              <code className="font-mono text-foreground">cnonce</code>).
            </li>
          </ol>
          <ul className="mt-2 list-inside list-disc">
            <li>The password never leaves the browser — only a hash derived from it does.</li>
            <li>Single-use nonces block simple replay attacks, unlike Basic auth.</li>
            <li>
              Still considered weak today: MD5 is broken for collision resistance, and by
              default nothing protects the response body — modern apps use bearer tokens
              or session cookies over TLS instead.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Try it</CardTitle>
          <CardDescription>
            Frontend only for now. We will connect this form when we reach the Digest
            Authentication backend lesson.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            onSubmit={(event) => event.preventDefault()}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" autoComplete="username" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="self-start">
              Send request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
