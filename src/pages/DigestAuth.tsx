import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import {
    buildAuthorizationHeader,
    computeDigestResponse,
    generateCnonce,
    parseWwwAuthenticate
} from '@/lib/digest';
import { DEMO_PASSWORD, DEMO_USERNAME } from '@/lib/mock-backend';

const DIGEST_URI = '/digest/me';

interface DigestLog {
    challengeHeader: string;
    ha1: string;
    ha2: string;
    cnonce: string;
    nc: string;
    authorizationHeader: string;
    status: number;
    ok: boolean;
    body: unknown;
}

export default function DigestAuth() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState<DigestLog | null>(null);
    const [stepError, setStepError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setLoading(true);
        setStepError(null);
        setLog(null);

        // Step 1 — request with no credentials, expect a 401 challenge.
        const initial = await apiClient.GET(DIGEST_URI, {});
        const challengeHeader = initial.response.headers.get('www-authenticate');
        const challenge = challengeHeader ? parseWwwAuthenticate(challengeHeader) : null;

        if (initial.response.status !== 401 || !challengeHeader || !challenge) {
            setStepError('Expected a 401 challenge with a WWW-Authenticate header, got something else.');
            setLoading(false);
            return;
        }

        // Step 2 — hash the challenge with the credentials and retry.
        const nc = '00000001';
        const cnonce = generateCnonce();
        const {ha1, ha2, response: digestResponse} = computeDigestResponse({
            username,
            password,
            realm: challenge.realm,
            method: 'GET',
            uri: DIGEST_URI,
            nonce: challenge.nonce,
            nc,
            cnonce,
            qop: challenge.qop
        });

        const authorizationHeader = buildAuthorizationHeader({
            username,
            realm: challenge.realm,
            nonce: challenge.nonce,
            uri: DIGEST_URI,
            qop: challenge.qop,
            nc,
            cnonce,
            response: digestResponse,
            opaque: challenge.opaque
        });

        const final = await apiClient.GET(DIGEST_URI, {
            headers: {Authorization: authorizationHeader}
        });

        setLog({
            challengeHeader,
            ha1,
            ha2,
            cnonce,
            nc,
            authorizationHeader,
            status: final.response.status,
            ok: final.response.ok,
            body: final.data ?? final.error
        });
        setLoading(false);
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Link
                    to="/"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4"/>
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
                            and{' '}
                            <code className="font-mono text-foreground">HA2 = MD5(method:uri)</code>, then{' '}
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
                        Drives a mocked two-step <code className="font-mono">GET /digest/me</code> flow.
                        Demo credentials: <code className="font-mono">{DEMO_USERNAME}</code> /{' '}
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
                            {loading && <Loader2 className="size-4 animate-spin"/>}
                            Send request
                        </Button>
                    </form>

                    {stepError && (
                        <Alert variant="destructive">
                            <AlertTitle>Unexpected response</AlertTitle>
                            <AlertDescription>{stepError}</AlertDescription>
                        </Alert>
                    )}

                    {log && (
                        <div className="flex flex-col gap-3">
                            <div>
                                <p className="mb-1 text-sm font-medium">Step 1 — server challenge</p>
                                <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                                    WWW-Authenticate: {log.challengeHeader}
                                </pre>
                            </div>

                            <div>
                                <p className="mb-1 text-sm font-medium">Step 2 — computed digest</p>
                                <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                                    {`HA1 = ${log.ha1}\nHA2 = ${log.ha2}\ncnonce = ${log.cnonce}\nnc = ${log.nc}`}
                                </pre>
                            </div>

                            <div>
                                <p className="mb-1 text-sm font-medium">Retry with Authorization header</p>

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
    );
}
