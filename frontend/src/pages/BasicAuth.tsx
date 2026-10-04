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

export default function BasicAuth() {
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
            <li>Stateless: there&apos;s no session, so the header is resent on every request.</li>
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
            Frontend only for now. We will connect this form when we build the first
            backend authentication route together.
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
