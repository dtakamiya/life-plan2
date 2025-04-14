import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Award, Star, Calendar, Target, Trophy } from 'lucide-react'

export default function BadgesPage() {
  const earnedBadges = [
    {
      id: 1,
      name: 'はじめてのお手伝い',
      description: '初めてお手伝いを完了しました',
      icon: Award,
      date: '2023年4月1日'
    },
    {
      id: 2,
      name: '3日連続達成',
      description: '3日連続でお手伝いを完了しました',
      icon: Calendar,
      date: '2023年4月5日'
    },
    {
      id: 3,
      name: 'お皿洗いマスター',
      description: 'お皿洗いを10回達成しました',
      icon: Star,
      date: '2023年4月10日'
    }
  ]
  
  const unearnedBadges = [
    {
      id: 4,
      name: '7日連続達成',
      description: '7日連続でお手伝いを完了しよう',
      icon: Calendar,
      progress: 70
    },
    {
      id: 5,
      name: '100ポイント達成',
      description: '累計100ポイントを獲得しよう',
      icon: Target,
      progress: 90
    },
    {
      id: 6,
      name: 'お手伝いマスター',
      description: '5種類のお手伝いを完了しよう',
      icon: Trophy,
      progress: 40
    }
  ]
  
  const stats = [
    { label: '累計お手伝い回数', value: '15回' },
    { label: '累計獲得ポイント', value: '150ポイント' },
    { label: '最長継続日数', value: '7日' },
    { label: '獲得バッジ数', value: `${earnedBadges.length}個` }
  ]
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">バッジと実績</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <h2 className="text-2xl font-bold mt-8">獲得したバッジ</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {earnedBadges.map((badge) => {
          const Icon = badge.icon
          
          return (
            <Card key={badge.id}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{badge.name}</CardTitle>
                    <CardDescription>{badge.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">獲得日: {badge.date}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      <h2 className="text-2xl font-bold mt-8">チャレンジ中</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {unearnedBadges.map((badge) => {
          const Icon = badge.icon
          
          return (
            <Card key={badge.id}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <Icon className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <CardTitle>{badge.name}</CardTitle>
                    <CardDescription>{badge.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">進捗</span>
                    <span className="text-sm font-medium">{badge.progress}%</span>
                  </div>
                  <Progress value={badge.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
