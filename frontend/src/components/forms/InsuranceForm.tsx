import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, Heart, Activity, Briefcase, AlertTriangle } from 'lucide-react';
import { useLifePlan } from '@/contexts/LifePlanContext';
import { formatCurrency, formatInManYen } from '@/lib/utils';
import type { InsuranceInfo } from '@/types';

const defaultInsurance: InsuranceInfo = {
  life_insurance_amount: 30000000,
  medical_insurance: false,
  cancer_insurance: false,
  disability_insurance: false,
  monthly_premium: 15000,
};

export function InsuranceForm() {
  const { insurance, setInsurance, profile } = useLifePlan();
  const [localInsurance, setLocalInsurance] = useState<InsuranceInfo>(insurance || defaultInsurance);

  useEffect(() => {
    if (insurance) setLocalInsurance(insurance);
  }, [insurance]);

  const handleChange = (field: keyof InsuranceInfo, value: number | boolean) => {
    setLocalInsurance({ ...localInsurance, [field]: value });
  };

  const handleSave = () => {
    setInsurance(localInsurance);
  };

  // 簡易的な必要保障額の目安計算
  const estimateNeededCoverage = () => {
    if (!profile) return 0;
    
    const children = profile.family_members.filter(m => m.relationship === '子');
    const hasSpouse = profile.marital_status === 'married';
    
    // 基本生活費（収入の50%を想定）
    const annualLivingCost = profile.annual_income * 0.5;
    
    // 遺族生活費（子供がいる場合は長期、いない場合は短期）
    let livingCostTotal = 0;
    if (children.length > 0) {
      const youngestChildAge = Math.min(...children.map(c => c.age));
      const yearsUntilIndependence = Math.max(0, 22 - youngestChildAge);
      livingCostTotal = annualLivingCost * yearsUntilIndependence;
    } else if (hasSpouse) {
      livingCostTotal = annualLivingCost * 10; // 10年分
    }
    
    // 教育費（子供1人あたり1000万円）
    const educationCost = children.length * 10000000;
    
    // 葬儀費用
    const funeralCost = 3000000;
    
    return livingCostTotal + educationCost + funeralCost;
  };

  const neededCoverage = estimateNeededCoverage();
  const coverageGap = neededCoverage - localInsurance.life_insurance_amount;

  return (
    <div id="insurance" className="space-y-6">
      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">現在の死亡保障額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatInManYen(localInsurance.life_insurance_amount)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">必要保障額（目安）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatInManYen(neededCoverage)}</div>
          </CardContent>
        </Card>
        
        <Card className={coverageGap > 0 ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${coverageGap > 0 ? 'text-yellow-800' : 'text-green-800'}`}>
              保障の過不足
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${coverageGap > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
              {coverageGap > 0 ? `${formatInManYen(coverageGap)} 不足` : '十分な保障'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* アラート */}
      {coverageGap > 5000000 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">保障額が不足している可能性があります</p>
              <p className="text-sm text-yellow-700">
                ご家族の生活を守るため、生命保険の見直しをご検討ください。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 生命保険 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            生命保険
          </CardTitle>
          <CardDescription>
            現在加入している生命保険の情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="life_insurance_amount">死亡保障額</Label>
              <div className="relative">
                <Input
                  id="life_insurance_amount"
                  type="number"
                  min={0}
                  step={1000000}
                  value={localInsurance.life_insurance_amount}
                  onChange={(e) => handleChange('life_insurance_amount', parseInt(e.target.value) || 0)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  円
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ＝ {formatInManYen(localInsurance.life_insurance_amount)}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthly_premium">月額保険料合計</Label>
              <div className="relative">
                <Input
                  id="monthly_premium"
                  type="number"
                  min={0}
                  step={1000}
                  value={localInsurance.monthly_premium}
                  onChange={(e) => handleChange('monthly_premium', parseInt(e.target.value) || 0)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  円
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                年間: {formatCurrency(localInsurance.monthly_premium * 12)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* その他の保険 */}
      <Card>
        <CardHeader>
          <CardTitle>その他の保険加入状況</CardTitle>
          <CardDescription>
            加入している保険にチェックを入れてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <Label htmlFor="medical_insurance" className="cursor-pointer">
                    医療保険
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    入院・手術に備える保険
                  </p>
                </div>
              </div>
              <Switch
                id="medical_insurance"
                checked={localInsurance.medical_insurance}
                onCheckedChange={(checked) => handleChange('medical_insurance', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-purple-500" />
                <div>
                  <Label htmlFor="cancer_insurance" className="cursor-pointer">
                    がん保険
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    がん治療に備える保険
                  </p>
                </div>
              </div>
              <Switch
                id="cancer_insurance"
                checked={localInsurance.cancer_insurance}
                onCheckedChange={(checked) => handleChange('cancer_insurance', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-blue-500" />
                <div>
                  <Label htmlFor="disability_insurance" className="cursor-pointer">
                    就業不能保険
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    働けなくなった時に備える保険
                  </p>
                </div>
              </div>
              <Switch
                id="disability_insurance"
                checked={localInsurance.disability_insurance}
                onCheckedChange={(checked) => handleChange('disability_insurance', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 保険の選び方アドバイス */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">💡 保険選びのポイント</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p>• <strong>死亡保障</strong>: 遺族の生活費 + 教育費 + 葬儀費用 - 遺族年金 - 現在の資産</p>
          <p>• <strong>医療保険</strong>: 高額療養費制度を考慮し、貯蓄で賄えない部分をカバー</p>
          <p>• <strong>就業不能保険</strong>: 長期療養に備え、傷病手当金を補完</p>
          <p>• 定期的な見直しが重要です（ライフステージの変化に合わせて）</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          保険情報を保存
        </Button>
      </div>
    </div>
  );
}
