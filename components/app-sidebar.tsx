'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard', icon: '◆' },
  { href: '/leads', label: 'Leads', icon: '○' },
  { href: '/activity', label: 'Activity', icon: '▸' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 z-40 h-full w-56 border-r border-zinc-800 bg-sidebar flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-6 pb-8">
        <span className="text-xl text-accent">◆</span>
        <span className="text-sm font-semibold tracking-tight">Real CRM</span>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-white/10 text-foreground font-medium'
                  : 'text-zinc-400 hover:text-foreground hover:bg-white/5'
              }`}
            >
              <span className="w-4 text-center text-xs">{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto px-5 py-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600">v0.1.0</p>
      </div>
    </aside>
  )
}
