import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Line, AreaChart, Area, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, ComposedChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  PiggyBank, Shield, Calculator, FileText, Target, Lightbulb
} from 'lucide-react';
import { useLifePlan } from '@/contexts/LifePlanContext';
import { formatCurrency, formatInManYen, getRiskBgColor } from '@/lib/utils';

export function LifePlanResult() {
  const { result } = useLifePlan();

  if (!result) {
    return (
      <Card id="result" className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calculator className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">診断結果がありません</h3>
          <p className="text-sm text-muted-foreground mt-2">
            すべての情報を入力して「ライフプラン診断を実行」ボタンをクリックしてください
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    yearly_finances,
    pension_estimate,
    insurance_need,
    tax_calculation,
    total_lifetime_income,
    total_lifetime_expenses,
    final_assets,
    risk_assessment,
    recommendations,
  } = result;

  // チャート用データ作成
  const chartData = yearly_finances.map((yf) => ({
    year: yf.year,
    age: yf.age,
    収入: yf.income,
    支出: yf.expenses,
    資産: yf.total_assets,
    貯蓄: yf.savings,
    年金: yf.pension_income,
  }));

  // 10年ごとのデータ
  const decadeData = chartData.filter((_, index) => index % 5 === 0);

  return (
    <div id="result" className="space-y-6">
      {/* 総合評価 */}
      <Card className={`${getRiskBgColor(risk_assessment.level)} border-2`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6" />
              ライフプラン総合評価
            </CardTitle>
            <Badge
              variant={risk_assessment.level === 'low' ? 'default' : risk_assessment.level === 'medium' ? 'secondary' : 'destructive'}
              className="text-lg px-4 py-1"
            >
              {risk_assessment.score}点
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={risk_assessment.score} className="h-4" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>要改善</span>
              <span>注意</span>
              <span>良好</span>
              <span>優良</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              生涯収入
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatInManYen(total_lifetime_income)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              生涯支出
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatInManYen(total_lifetime_expenses)}</div>
          </CardContent>
        </Card>
        
        <Card className={final_assets >= 0 ? '' : 'border-red-500 bg-red-50'}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${final_assets >= 0 ? 'text-muted-foreground' : 'text-red-800'}`}>
              <PiggyBank className="h-4 w-4" />
              最終資産
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${final_assets >= 0 ? '' : 'text-red-700'}`}>
              {formatInManYen(final_assets)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              年金（年額）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatInManYen(pension_estimate.total_pension)}</div>
          </CardContent>
        </Card>
      </div>

      {/* リスクアラート */}
      {risk_assessment.risks.length > 0 && (
        <div className="space-y-3">
          {risk_assessment.risks.map((risk, index) => (
            <Alert key={index} variant={risk.level === 'high' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                {risk.category}
                <Badge variant={risk.level === 'high' ? 'destructive' : 'secondary'}>
                  {risk.level === 'high' ? '重要' : '注意'}
                </Badge>
              </AlertTitle>
              <AlertDescription>
                <p>{risk.description}</p>
                <p className="mt-1 text-sm font-medium">{risk.suggestion}</p>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* チャート */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assets">資産推移</TabsTrigger>
          <TabsTrigger value="cashflow">キャッシュフロー</TabsTrigger>
          <TabsTrigger value="income">収支バランス</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>資産推移グラフ</CardTitle>
              <CardDescription>
                生涯を通じた資産の変化をシミュレーション
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="age" 
                      tickFormatter={(value) => `${value}歳`}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 10000).toLocaleString()}万`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `${label}歳`}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                    <Area 
                      type="monotone" 
                      dataKey="資産" 
                      stroke="#3b82f6" 
                      fill="#93c5fd"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle>キャッシュフロー推移</CardTitle>
              <CardDescription>
                年間の収入・支出・貯蓄額の推移
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="age" 
                      tickFormatter={(value) => `${value}歳`}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 10000).toLocaleString()}万`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `${label}歳`}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                    <Bar dataKey="収入" fill="#22c55e" opacity={0.7} />
                    <Bar dataKey="支出" fill="#ef4444" opacity={0.7} />
                    <Line 
                      type="monotone" 
                      dataKey="貯蓄" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>収入構成の変化</CardTitle>
              <CardDescription>
                就労収入と年金収入の推移
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="age" 
                      tickFormatter={(value) => `${value}歳`}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 10000).toLocaleString()}万`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `${label}歳`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="収入" 
                      stackId="1"
                      stroke="#22c55e" 
                      fill="#86efac"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="年金" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#93c5fd"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 詳細情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 税金・社会保険 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              税金・社会保険（現在）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span>総収入</span>
                <span className="font-medium">{formatCurrency(tax_calculation.gross_income)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>所得控除</span>
                <span className="font-medium">- {formatCurrency(tax_calculation.income_deductions)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>所得税</span>
                <span className="font-medium text-red-600">- {formatCurrency(tax_calculation.income_tax)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>住民税</span>
                <span className="font-medium text-red-600">- {formatCurrency(tax_calculation.resident_tax)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>社会保険料</span>
                <span className="font-medium text-red-600">- {formatCurrency(tax_calculation.social_insurance)}</span>
              </div>
              <div className="flex justify-between py-2 text-lg">
                <span className="font-medium">手取り収入</span>
                <span className="font-bold text-green-600">{formatCurrency(tax_calculation.net_income)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 必要保障額 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              必要保障額分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span>遺族生活費</span>
                <span className="font-medium">{formatInManYen(insurance_need.calculation_details.total_living_cost)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>教育費</span>
                <span className="font-medium">{formatInManYen(insurance_need.calculation_details.education_cost)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>葬儀費用</span>
                <span className="font-medium">{formatInManYen(insurance_need.calculation_details.funeral_cost)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>遺族年金（概算）</span>
                <span className="font-medium text-green-600">- {formatInManYen(insurance_need.calculation_details.survivor_pension_total)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>現在の資産</span>
                <span className="font-medium text-green-600">- {formatInManYen(insurance_need.calculation_details.current_assets)}</span>
              </div>
              <div className="flex justify-between py-2 border-b text-lg">
                <span className="font-medium">必要保障額</span>
                <span className="font-bold">{formatInManYen(insurance_need.death_benefit_needed)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>現在の保障額</span>
                <span className="font-medium">{formatInManYen(insurance_need.current_coverage)}</span>
              </div>
              {insurance_need.gap > 0 && (
                <div className="flex justify-between py-2 text-lg">
                  <span className="font-medium text-red-600">不足額</span>
                  <span className="font-bold text-red-600">{formatInManYen(insurance_need.gap)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 改善提案 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            改善提案
          </CardTitle>
          <CardDescription>
            FP1級レベルの分析に基づく改善アドバイス
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>現在のライフプランは良好です。このまま継続してください。</span>
            </div>
          ) : (
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* キャッシュフロー表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            キャッシュフロー表
          </CardTitle>
          <CardDescription>
            5年ごとの財務状況一覧
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b">
                  <th className="text-left py-2 px-3">年齢</th>
                  <th className="text-right py-2 px-3">収入</th>
                  <th className="text-right py-2 px-3">支出</th>
                  <th className="text-right py-2 px-3">年間収支</th>
                  <th className="text-right py-2 px-3">資産残高</th>
                  <th className="text-left py-2 px-3">備考</th>
                </tr>
              </thead>
              <tbody>
                {decadeData.map((data) => {
                  const yf = yearly_finances.find(y => y.age === data.age);
                  return (
                    <tr key={data.age} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3 font-medium">{data.age}歳</td>
                      <td className="text-right py-2 px-3">{formatInManYen(data.収入)}</td>
                      <td className="text-right py-2 px-3">{formatInManYen(data.支出)}</td>
                      <td className={`text-right py-2 px-3 ${data.貯蓄 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatInManYen(data.貯蓄)}
                      </td>
                      <td className={`text-right py-2 px-3 font-medium ${data.資産 >= 0 ? '' : 'text-red-600'}`}>
                        {formatInManYen(data.資産)}
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">
                        {yf?.notes.join(', ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
