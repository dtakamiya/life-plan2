import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">設定</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-3">
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
          <TabsTrigger value="family">家族メンバー</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>プロフィール設定</CardTitle>
              <CardDescription>
                あなたのプロフィール情報を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="プロフィール画像" />
                  <AvatarFallback>ユ</AvatarFallback>
                </Avatar>
                <Button>画像を変更</Button>
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">名前</Label>
                  <Input id="name" defaultValue="ユーザー名" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="age">年齢</Label>
                  <Input id="age" type="number" defaultValue="10" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="family" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>家族メンバー管理</CardTitle>
              <CardDescription>
                家族メンバーを追加・管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>親</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">親アカウント</p>
                      <p className="text-sm text-muted-foreground">管理者</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">編集</Button>
                </div>
                
                <div className="border-t p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>子</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">子供アカウント</p>
                      <p className="text-sm text-muted-foreground">10歳</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">編集</Button>
                </div>
              </div>
              
              <Button>家族メンバーを追加</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>
                通知の設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">お手伝い完了通知</p>
                  <p className="text-sm text-muted-foreground">お手伝いが完了したときに通知を受け取る</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">バッジ獲得通知</p>
                  <p className="text-sm text-muted-foreground">新しいバッジを獲得したときに通知を受け取る</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">目標達成通知</p>
                  <p className="text-sm text-muted-foreground">目標を達成したときに通知を受け取る</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">リマインダー</p>
                  <p className="text-sm text-muted-foreground">お手伝いのリマインダーを受け取る</p>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter>
              <Button>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
