import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Star } from 'lucide-react'

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">お手伝い一覧</h1>
        <Button>新しいお手伝いを追加</Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Input className="max-w-sm" placeholder="お手伝いを検索..." />
        <Button variant="outline">検索</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((task) => (
          <Card key={task}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>お皿洗い</CardTitle>
                <div className="flex">
                  {Array(3).fill(0).map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <CardDescription>キッチンの食器を洗いましょう</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">対象年齢</span>
                  <span>5歳以上</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">目安時間</span>
                  <span>10分</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ポイント</span>
                  <span className="font-medium">10ポイント</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">お手伝いする</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
