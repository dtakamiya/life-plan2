import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar, Heart, Baby, Home, Car, GraduationCap, Plane, Wrench, Gift, MoreHorizontal } from 'lucide-react';
import { useLifePlan } from '@/contexts/LifePlanContext';
import { formatCurrency } from '@/lib/utils';
import type { LifeEvent, LifeEventType } from '@/types';
import { LIFE_EVENT_LABELS } from '@/types';

const currentYear = new Date().getFullYear();

const eventIcons: Record<LifeEventType, typeof Heart> = {
  marriage: Heart,
  childbirth: Baby,
  house_purchase: Home,
  car_purchase: Car,
  child_education: GraduationCap,
  child_marriage: Gift,
  retirement: Calendar,
  travel: Plane,
  home_renovation: Wrench,
  other: MoreHorizontal,
};

const eventColors: Record<LifeEventType, string> = {
  marriage: 'bg-pink-500',
  childbirth: 'bg-blue-500',
  house_purchase: 'bg-green-500',
  car_purchase: 'bg-purple-500',
  child_education: 'bg-orange-500',
  child_marriage: 'bg-rose-500',
  retirement: 'bg-gray-500',
  travel: 'bg-cyan-500',
  home_renovation: 'bg-yellow-500',
  other: 'bg-slate-500',
};

const typicalCosts: Record<LifeEventType, number> = {
  marriage: 3500000,
  childbirth: 500000,
  house_purchase: 5000000, // 頭金
  car_purchase: 3000000,
  child_education: 1000000,
  child_marriage: 1000000,
  retirement: 0,
  travel: 500000,
  home_renovation: 5000000,
  other: 1000000,
};

export function LifeEventsForm() {
  const { lifeEvents, setLifeEvents, profile } = useLifePlan();
  const [localEvents, setLocalEvents] = useState<LifeEvent[]>(lifeEvents);
  const [newEvent, setNewEvent] = useState<Partial<LifeEvent>>({
    event_type: 'marriage',
    year: currentYear + 1,
    cost: typicalCosts.marriage,
    description: '',
  });

  useEffect(() => {
    setLocalEvents(lifeEvents);
  }, [lifeEvents]);

  const currentAge = profile?.age || 35;

  const handleAddEvent = () => {
    if (!newEvent.event_type || !newEvent.year || newEvent.cost === undefined) return;
    
    const age = currentAge + (newEvent.year - currentYear);
    const event: LifeEvent = {
      event_type: newEvent.event_type as LifeEventType,
      year: newEvent.year,
      age,
      cost: newEvent.cost,
      description: newEvent.description,
    };
    
    const updated = [...localEvents, event].sort((a, b) => a.year - b.year);
    setLocalEvents(updated);
    
    // リセット
    setNewEvent({
      event_type: 'marriage',
      year: currentYear + 1,
      cost: typicalCosts.marriage,
      description: '',
    });
  };

  const handleRemoveEvent = (index: number) => {
    setLocalEvents(localEvents.filter((_, i) => i !== index));
  };

  const handleEventTypeChange = (type: LifeEventType) => {
    setNewEvent({
      ...newEvent,
      event_type: type,
      cost: typicalCosts[type],
    });
  };

  const handleSave = () => {
    setLifeEvents(localEvents);
  };

  const totalCost = localEvents.reduce((sum, event) => sum + event.cost, 0);

  return (
    <div id="events" className="space-y-6">
      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">登録済みイベント</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localEvents.length}件</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ライフイベント総費用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 新規イベント追加 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            ライフイベントを追加
          </CardTitle>
          <CardDescription>
            将来予定しているライフイベントを追加してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>イベント種類</Label>
              <Select
                value={newEvent.event_type}
                onValueChange={(value: LifeEventType) => handleEventTypeChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LIFE_EVENT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>予定年</Label>
              <Input
                type="number"
                min={currentYear}
                max={currentYear + 60}
                value={newEvent.year}
                onChange={(e) => setNewEvent({ ...newEvent, year: parseInt(e.target.value) || currentYear })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>予定年齢</Label>
              <Input
                type="number"
                value={currentAge + ((newEvent.year || currentYear) - currentYear)}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label>費用</Label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  step={100000}
                  value={newEvent.cost}
                  onChange={(e) => setNewEvent({ ...newEvent, cost: parseInt(e.target.value) || 0 })}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  円
                </span>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleAddEvent} className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                追加
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <Label>メモ（任意）</Label>
            <Input
              placeholder="詳細メモを入力..."
              value={newEvent.description || ''}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* 登録済みイベント一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            登録済みライフイベント
          </CardTitle>
        </CardHeader>
        <CardContent>
          {localEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              ライフイベントが登録されていません
            </p>
          ) : (
            <div className="space-y-3">
              {localEvents.map((event, index) => {
                const Icon = eventIcons[event.event_type];
                const color = eventColors[event.event_type];
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {LIFE_EVENT_LABELS[event.event_type]}
                          </span>
                          <Badge variant="outline">
                            {event.year}年（{event.age}歳）
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg">
                        {formatCurrency(event.cost)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveEvent(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* タイムライン表示 */}
      {localEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ライフイベントタイムライン</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* タイムラインの線 */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-6">
                {localEvents.map((event, index) => {
                  const Icon = eventIcons[event.event_type];
                  const color = eventColors[event.event_type];
                  
                  return (
                    <div key={index} className="relative flex items-start gap-4 pl-10">
                      <div className={`absolute left-2 p-1.5 rounded-full ${color} -translate-x-1/2`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {LIFE_EVENT_LABELS[event.event_type]}
                          </span>
                          <Badge variant="secondary">
                            {event.year}年
                          </Badge>
                          <Badge variant="outline">
                            {event.age}歳
                          </Badge>
                        </div>
                        <p className="text-lg font-bold mt-1">
                          {formatCurrency(event.cost)}
                        </p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          ライフイベントを保存
        </Button>
      </div>
    </div>
  );
}
