import React from 'react'
import Link from 'next/link'
import { 
  Home, 
  ListTodo, 
  Calendar, 
  Award, 
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'ホーム', icon: Home },
  { href: '/dashboard/tasks', label: 'お手伝い一覧', icon: ListTodo },
  { href: '/dashboard/calendar', label: 'カレンダー', icon: Calendar },
  { href: '/dashboard/badges', label: 'バッジと実績', icon: Award },
  { href: '/dashboard/settings', label: '設定', icon: Settings },
]

export function Sidebar() {
  return (
    <div className="w-64 border-r h-[calc(100vh-4rem)]">
      <div className="py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-md',
                  'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
