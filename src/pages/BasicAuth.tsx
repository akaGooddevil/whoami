import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { apiClient } from '@/lib/api-client'
import { DEMO_PASSWORD, DEMO_USERNAME } from '@/lib/mock-backend'

interface RequestLog {
  authorizationHeader: string
  status: number
  ok: boolean
  body: unknown
}

export default function BasicAuth() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState<RequestLog | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)

    const authorizationHeader = `Basic ${btoa(`${username}:${password}`)}`

    const { data, error, response } = await apiClient.GET('/me', {
      headers: { Authorization: authorizationHeader },
    })

    setLog({
      authorizationHeader,
      status: response.status,
      ok: response.ok,
      body: data ?? error,
    })
    setLoading(false)
  }

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
        <h1 className="text-2xl font-semibold">Basic Authentication</h1>
        <p className="mt-2 text-muted-foreground">
          Basic Authentication is a method for an HTTP user agent (e.g. a web browser)
          to provide a username and password when making a request.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How the flow works</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            The client joins <code className="font-mono text-foreground">username:password</code>{' '}
            with a colon and base64-encodes the result, then sends it on every request in
            an <code className="font-mono text-foreground">Authorization</code> header:
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs text-foreground">
            Authorization: Basic {btoa('username:password')}
          </pre>
          <ul className="mt-2 list-inside list-disc">
            <li>Base64 is encoding, not encryption — this must run over HTTPS.</li>
            <li>Stateless: there's no session, so the header is resent on every request.</li>
            <li>
              A browser hitting a Basic-protected endpoint directly (no fetch) triggers
              the native username/password prompt via the{' '}
              <code className="font-mono text-foreground">WWW-Authenticate</code> response
              header — most apps instead build a custom login form, like below, and
              attach the header themselves.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Try it</CardTitle>
          <CardDescription>
            Calls a mocked <code className="font-mono">GET /me</code> endpoint. Demo
            credentials: <code className="font-mono">{DEMO_USERNAME}</code> /{' '}
            <code className="font-mono">{DEMO_PASSWORD}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="self-start">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Send request
            </Button>
          </form>

          {log && (
            <div className="flex flex-col gap-3">
              <div>
                <p className="mb-1 text-sm font-medium">Request header sent</p>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                  Authorization: {log.authorizationHeader}
                </pre>
              </div>

              {log.ok ? (
                <Alert>
                  <AlertTitle>200 OK</AlertTitle>
                  <AlertDescription>
                    <pre className="overflow-x-auto font-mono text-xs">
                      {JSON.stringify(log.body, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTitle>{log.status} Unauthorized</AlertTitle>
                  <AlertDescription>
                    <pre className="overflow-x-auto font-mono text-xs">
                      {JSON.stringify(log.body, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
