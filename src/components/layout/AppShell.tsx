import { Link, Outlet } from 'react-router-dom'
import { KeyRound } from 'lucide-react'

export function AppShell() {
  return (
    <div className="min-h-svh text-foreground">
      <header className="border-b border-border bg-background/70 backdrop-blur-sm sticky top-0">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <KeyRound className="size-5" />
            Frontend Auth Playground
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
