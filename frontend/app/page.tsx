import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">お手伝い管理アプリ</h1>
      <p className="text-xl mb-6">家族内でお子様のお手伝いを楽しく管理しましょう</p>
      <div className="flex space-x-4">
        <Button asChild>
          <Link href="/dashboard">ダッシュボード</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/tasks">お手伝い一覧</Link>
        </Button>
      </div>
    </div>
  )
}
