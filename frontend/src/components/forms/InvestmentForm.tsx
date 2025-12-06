import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { TrendingUp, PiggyBank, Building, Wallet } from 'lucide-react';
import { useLifePlan } from '@/contexts/LifePlanContext';
import { formatCurrency, formatInManYen } from '@/lib/utils';
import type { InvestmentPlan, PensionInfo } from '@/types';

const defaultInvestment: InvestmentPlan = {
  monthly_investment: 30000,
  expected_return_rate: 4.0,
  risk_tolerance: 'moderate',
};

const defaultPension: PensionInfo = {
  enrollment_months_national: 0,
  enrollment_months_employee: 0,
  average_salary: 0,
  ideco_monthly: 0,
  corporate_pension: false,
};

const riskToleranceLabels = {
  low: { label: '安定型', description: '元本重視、低リスク低リターン', rate: '1-3%' },
  moderate: { label: 'バランス型', description: 'リスクとリターンのバランス', rate: '3-5%' },
  high: { label: '積極型', description: '高リスク高リターン', rate: '5-8%' },
};

export function InvestmentForm() {
  const { investment, pension, setInvestment, setPension, profile } = useLifePlan();
  const [localInvestment, setLocalInvestment] = useState<InvestmentPlan>(investment || defaultInvestment);
  const [localPension, setLocalPension] = useState<PensionInfo>(pension || defaultPension);

  useEffect(() => {
    if (investment) setLocalInvestment(investment);
    if (pension) setLocalPension(pension);
  }, [investment, pension]);

  // 投資シミュレーション計算
  const simulateInvestment = () => {
    const years = profile ? Math.max(0, 65 - profile.age) : 30;
    const monthlyRate = localInvestment.expected_return_rate / 100 / 12;
    const months = years * 12;
    
    if (monthlyRate === 0) {
      return localInvestment.monthly_investment * months;
    }
    
    // 積立投資の将来価値
    const futureValue = localInvestment.monthly_investment * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    
    return Math.round(futureValue);
  };

  const projectedValue = simulateInvestment();
  const totalInvested = localInvestment.monthly_investment * 12 * 
    (profile ? Math.max(0, 65 - profile.age) : 30);
  const investmentReturn = projectedValue - totalInvested;

  // 年金シミュレーション
  const estimatePension = () => {
    const totalMonths = localPension.enrollment_months_national + localPension.enrollment_months_employee;
    const basicPension = Math.round(816000 * Math.min(totalMonths, 480) / 480);
    
    let employeePension = 0;
    if (localPension.enrollment_months_employee > 0 && localPension.average_salary > 0) {
      employeePension = Math.round(
        localPension.average_salary * (5.481 / 1000) * localPension.enrollment_months_employee
      );
    }
    
    return {
      basic: basicPension,
      employee: employeePension,
      total: basicPension + employeePension,
    };
  };

  const pensionEstimate = estimatePension();

  const handleInvestmentChange = (field: keyof InvestmentPlan, value: number | string) => {
    setLocalInvestment({ ...localInvestment, [field]: value });
  };

  const handlePensionChange = (field: keyof PensionInfo, value: number | boolean) => {
    setLocalPension({ ...localPension, [field]: value });
  };

  const handleSave = () => {
    setInvestment(localInvestment);
    setPension(localPension);
  };

  // iDeCoの上限額計算
  const getIdecoLimit = () => {
    if (!profile) return 23000;
    
    switch (profile.employment_type) {
      case 'self_employed':
        return 68000;
      case 'company_employee':
        return localPension.corporate_pension ? 12000 : 23000;
      case 'civil_servant':
        return 12000;
      default:
        return 23000;
    }
  };

  const idecoLimit = getIdecoLimit();

  return (
    <div id="investment" className="space-y-6">
      {/* 投資シミュレーション結果 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">投資総額（65歳時点）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatInManYen(projectedValue)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              元本 {formatInManYen(totalInvested)} + 運用益 {formatInManYen(investmentReturn)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">年金（年額・概算）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatInManYen(pensionEstimate.total)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              月額約 {formatCurrency(Math.round(pensionEstimate.total / 12))}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">iDeCo節税効果（年間）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              約 {formatCurrency(Math.round(localPension.ideco_monthly * 12 * 0.3))}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              所得税・住民税の軽減額
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 資産運用設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            資産運用プラン
          </CardTitle>
          <CardDescription>
            毎月の積立投資と運用方針を設定してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="monthly_investment">月額積立額</Label>
              <div className="relative">
                <Input
                  id="monthly_investment"
                  type="number"
                  min={0}
                  step={5000}
                  value={localInvestment.monthly_investment}
                  onChange={(e) => handleInvestmentChange('monthly_investment', parseInt(e.target.value) || 0)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  円
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                年間: {formatCurrency(localInvestment.monthly_investment * 12)}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>リスク許容度</Label>
              <Select
                value={localInvestment.risk_tolerance}
                onValueChange={(value: 'low' | 'moderate' | 'high') => handleInvestmentChange('risk_tolerance', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(riskToleranceLabels).map(([value, { label, description, rate }]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex flex-col">
                        <span>{label} ({rate})</span>
                        <span className="text-xs text-muted-foreground">{description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label>期待リターン: {localInvestment.expected_return_rate}%</Label>
            <Slider
              value={[localInvestment.expected_return_rate]}
              onValueChange={([value]) => handleInvestmentChange('expected_return_rate', value)}
              min={0}
              max={10}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%（預金）</span>
              <span>5%（株式）</span>
              <span>10%（積極運用）</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 年金情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            年金情報
          </CardTitle>
          <CardDescription>
            公的年金の加入状況を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="enrollment_months_national">国民年金加入月数</Label>
              <Input
                id="enrollment_months_national"
                type="number"
                min={0}
                max={480}
                value={localPension.enrollment_months_national}
                onChange={(e) => handlePensionChange('enrollment_months_national', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                約 {Math.floor(localPension.enrollment_months_national / 12)}年
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="enrollment_months_employee">厚生年金加入月数</Label>
              <Input
                id="enrollment_months_employee"
                type="number"
                min={0}
                max={528}
                value={localPension.enrollment_months_employee}
                onChange={(e) => handlePensionChange('enrollment_months_employee', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                約 {Math.floor(localPension.enrollment_months_employee / 12)}年
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="average_salary">平均標準報酬月額</Label>
              <div className="relative">
                <Input
                  id="average_salary"
                  type="number"
                  min={0}
                  step={10000}
                  value={localPension.average_salary}
                  onChange={(e) => handlePensionChange('average_salary', parseInt(e.target.value) || 0)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  円
                </span>
              </div>
            </div>
          </div>

          {/* 年金内訳 */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium">年金の内訳（概算）</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>老齢基礎年金:</span>
                <span className="font-medium">{formatCurrency(pensionEstimate.basic)}/年</span>
              </div>
              <div className="flex justify-between">
                <span>老齢厚生年金:</span>
                <span className="font-medium">{formatCurrency(pensionEstimate.employee)}/年</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* iDeCo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            iDeCo（個人型確定拠出年金）
          </CardTitle>
          <CardDescription>
            iDeCoの拠出額と企業年金の有無を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ideco_monthly">iDeCo月額拠出額</Label>
              <div className="relative">
                <Input
                  id="ideco_monthly"
                  type="number"
                  min={0}
                  max={idecoLimit}
                  step={1000}
                  value={localPension.ideco_monthly}
                  onChange={(e) => handlePensionChange('ideco_monthly', parseInt(e.target.value) || 0)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  円
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                上限: {formatCurrency(idecoLimit)}/月
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-blue-500" />
                <div>
                  <Label htmlFor="corporate_pension" className="cursor-pointer">
                    企業年金（DB/DC）
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    勤務先に企業年金制度がある
                  </p>
                </div>
              </div>
              <Switch
                id="corporate_pension"
                checked={localPension.corporate_pension}
                onCheckedChange={(checked) => handlePensionChange('corporate_pension', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アドバイス */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">💡 資産運用のポイント</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p>• <strong>NISA</strong>: 年間360万円まで非課税で運用可能（2024年〜）</p>
          <p>• <strong>iDeCo</strong>: 掛金全額が所得控除、運用益も非課税</p>
          <p>• <strong>分散投資</strong>: 国内外の株式・債券に分散してリスクを軽減</p>
          <p>• <strong>長期投資</strong>: 複利効果を活かすため、早く始めることが重要</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          投資・年金情報を保存
        </Button>
      </div>
    </div>
  );
}
