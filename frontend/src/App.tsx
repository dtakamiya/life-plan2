import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calculator, User, Wallet, Receipt, Calendar, Shield, TrendingUp,
  BarChart3, PlayCircle, RotateCcw, Download, Loader2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { LifePlanProvider, useLifePlan } from '@/contexts/LifePlanContext';
import { Header } from '@/components/layout/Header';
import { ProfileForm } from '@/components/forms/ProfileForm';
import { AssetsForm } from '@/components/forms/AssetsForm';
import { ExpensesForm } from '@/components/forms/ExpensesForm';
import { LifeEventsForm } from '@/components/forms/LifeEventsForm';
import { InsuranceForm } from '@/components/forms/InsuranceForm';
import { InvestmentForm } from '@/components/forms/InvestmentForm';
import { LifePlanResult } from '@/components/results/LifePlanResult';

const tabs = [
  { id: 'profile', label: '基本情報', icon: User },
  { id: 'assets', label: '資産・負債', icon: Wallet },
  { id: 'expenses', label: '支出', icon: Receipt },
  { id: 'events', label: 'ライフイベント', icon: Calendar },
  { id: 'insurance', label: '保険', icon: Shield },
  { id: 'investment', label: '投資・年金', icon: TrendingUp },
  { id: 'result', label: '診断結果', icon: BarChart3 },
];

function LifePlanApp() {
  const [activeTab, setActiveTab] = useState('profile');
  const {
    profile, assets, liabilities, monthlyExpenses, insurance, investment, pension,
    isLoading, error,
    calculateLifePlan, loadSampleData, resetAll
  } = useLifePlan();

  // 入力完了度の計算
  const getCompletionProgress = () => {
    let completed = 0;
    const total = 6;
    
    if (profile) completed++;
    if (assets && liabilities) completed++;
    if (monthlyExpenses) completed++;
    if (insurance) completed++;
    if (investment) completed++;
    if (pension) completed++;
    
    return (completed / total) * 100;
  };

  const progress = getCompletionProgress();

  const handleCalculate = async () => {
    if (progress < 100) {
      toast.error('すべての情報を入力してください');
      return;
    }
    
    try {
      await calculateLifePlan();
      toast.success('ライフプラン診断が完了しました');
      setActiveTab('result');
    } catch {
      toast.error('診断中にエラーが発生しました');
    }
  };

  const handleLoadSample = async () => {
    try {
      await loadSampleData();
      toast.success('サンプルデータを読み込みました');
    } catch {
      toast.error('サンプルデータの読み込みに失敗しました');
    }
  };

  const handleReset = () => {
    resetAll();
    setActiveTab('profile');
    toast.success('すべてのデータをリセットしました');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            FP1級レベルの
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              ライフプランニング
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            専門家レベルの分析で、あなたの人生設計をサポートします。
            キャッシュフロー分析、年金シミュレーション、保険設計など、
            包括的なライフプランを作成できます。
          </p>
        </div>

        {/* 進捗バー */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">入力進捗</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* エラー表示 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* アクションボタン */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <Button
            size="lg"
            onClick={handleCalculate}
            disabled={isLoading || progress < 100}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                診断中...
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5" />
                ライフプラン診断を実行
              </>
            )}
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={handleLoadSample}
            className="gap-2"
          >
            <Download className="h-5 w-5" />
            サンプルデータ読込
          </Button>
          
          <Button
            size="lg"
            variant="ghost"
            onClick={handleReset}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <RotateCcw className="h-5 w-5" />
            リセット
          </Button>
        </div>

        {/* メインコンテンツ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 h-auto p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-xs hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileForm />
          </TabsContent>

          <TabsContent value="assets" className="mt-6">
            <AssetsForm />
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <ExpensesForm />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <LifeEventsForm />
          </TabsContent>

          <TabsContent value="insurance" className="mt-6">
            <InsuranceForm />
          </TabsContent>

          <TabsContent value="investment" className="mt-6">
            <InvestmentForm />
          </TabsContent>

          <TabsContent value="result" className="mt-6">
            <LifePlanResult />
          </TabsContent>
        </Tabs>

        {/* ナビゲーションボタン */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => {
              const currentIndex = tabs.findIndex((t) => t.id === activeTab);
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1].id);
              }
            }}
            disabled={activeTab === 'profile'}
          >
            ← 前へ
          </Button>
          
          <Button
            onClick={() => {
              const currentIndex = tabs.findIndex((t) => t.id === activeTab);
              if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1].id);
              }
            }}
            disabled={activeTab === 'result'}
          >
            次へ →
          </Button>
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t bg-background mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <Calculator className="inline-block h-4 w-4 mr-1" />
              FP1級レベル ライフプランナー
            </p>
            <p>
              ※ このツールは参考情報を提供するものであり、具体的な金融・税務アドバイスではありません。
              重要な決定の際は専門家にご相談ください。
            </p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <LifePlanProvider>
      <LifePlanApp />
    </LifePlanProvider>
  );
}

export default App;
