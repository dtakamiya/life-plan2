import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">おかえりなさい、ユーザー様</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>今日のお手伝い</CardTitle>
            <CardDescription>3件中1件完了</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={33} className="h-2 mb-2" />
            <Button variant="outline" size="sm" asChild className="mt-2">
              <Link href="/dashboard/tasks" className="flex items-center">
                すべて確認 <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>累計ポイント</CardTitle>
            <CardDescription>目標まであと50ポイント</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">150</div>
            <Progress value={75} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>継続日数</CardTitle>
            <CardDescription>素晴らしい継続です！</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7日</div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mt-8">最近のお手伝い</h2>
      <div className="rounded-md border">
        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">お皿洗い</div>
            <div className="text-sm text-muted-foreground">2023年4月14日 完了</div>
          </div>
          <div className="font-medium">10ポイント</div>
        </div>
        <div className="border-t p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">リビング掃除</div>
            <div className="text-sm text-muted-foreground">2023年4月13日 完了</div>
          </div>
          <div className="font-medium">15ポイント</div>
        </div>
      </div>
    </div>
  )
}
