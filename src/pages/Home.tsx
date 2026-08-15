import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authMethods } from '@/lib/auth-methods'

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
