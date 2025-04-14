import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MoonIcon, SunIcon, User } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/dashboard" className="font-bold text-xl">お手伝い管理</Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">テーマ切替</span>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </div>
      </div>
    </header>
  )
}
