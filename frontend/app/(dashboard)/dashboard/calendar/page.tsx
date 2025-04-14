import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarPage() {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]
  
  const weekDays = ['日', '月', '火', '水', '木', '金', '土']
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  
  const firstDayWeekday = firstDayOfMonth.getDay()
  
  const daysInMonth = lastDayOfMonth.getDate()
  
  const calendarDays = []
  
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }
  
  const weeks = []
  let week = []
  
  calendarDays.forEach((day, index) => {
    week.push(day)
    if ((index + 1) % 7 === 0 || index === calendarDays.length - 1) {
      weeks.push([...week])
      week = []
    }
  })
  
  const completedDays = [3, 5, 8, 12, 15, 20, 25]
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">カレンダー</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {currentYear}年{monthNames[currentMonth]}
          </h2>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>お手伝いカレンダー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* 曜日のヘッダー */}
            {weekDays.map((day, index) => (
              <div 
                key={`weekday-${index}`} 
                className={`text-center py-2 font-medium ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''}`}
              >
                {day}
              </div>
            ))}
            
            {/* カレンダーの日付 */}
            {weeks.map((week, weekIndex) => (
              React.Children.toArray(
                week.map((day, dayIndex) => (
                  <div 
                    className={`
                      aspect-square p-1 border rounded-md flex flex-col items-center justify-center
                      ${day === null ? 'bg-gray-100 text-gray-400' : ''}
                      ${day === currentDate.getDate() ? 'bg-primary/10 border-primary' : ''}
                      ${completedDays.includes(day) ? 'bg-green-100' : ''}
                    `}
                  >
                    {day !== null && (
                      <>
                        <span className={`
                          text-sm font-medium
                          ${(weekIndex === 0 && dayIndex === 0) || ((weekIndex > 0) && dayIndex === 0) ? 'text-red-500' : ''}
                          ${dayIndex === 6 ? 'text-blue-500' : ''}
                        `}>
                          {day}
                        </span>
                        {completedDays.includes(day) && (
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>継続状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>現在の継続日数</span>
              <span className="font-bold text-xl">7日</span>
            </div>
            <div className="flex justify-between items-center">
              <span>今月の達成日数</span>
              <span className="font-bold text-xl">{completedDays.length}日</span>
            </div>
            <div className="flex justify-between items-center">
              <span>最長継続記録</span>
              <span className="font-bold text-xl">10日</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
