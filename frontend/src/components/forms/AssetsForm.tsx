import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useLifePlan } from '@/contexts/LifePlanContext';
import { formatCurrency } from '@/lib/utils';
import type { Asset, Liability } from '@/types';

const defaultAssets: Asset = {
  cash_deposits: 0,
  stocks: 0,
  investment_trusts: 0,
  bonds: 0,
  real_estate: 0,
  insurance_surrender_value: 0,
  other_assets: 0,
};

const defaultLiabilities: Liability = {
  housing_loan: 0,
  car_loan: 0,
  education_loan: 0,
  credit_card: 0,
  other_loans: 0,
};

export function AssetsForm() {
  const { assets, liabilities, setAssets, setLiabilities } = useLifePlan();
  const [localAssets, setLocalAssets] = useState<Asset>(assets || defaultAssets);
  const [localLiabilities, setLocalLiabilities] = useState<Liability>(liabilities || defaultLiabilities);

  useEffect(() => {
    if (assets) setLocalAssets(assets);
    if (liabilities) setLocalLiabilities(liabilities);
  }, [assets, liabilities]);

  const handleAssetChange = (field: keyof Asset, value: number) => {
    setLocalAssets({ ...localAssets, [field]: value });
  };

  const handleLiabilityChange = (field: keyof Liability, value: number) => {
    setLocalLiabilities({ ...localLiabilities, [field]: value });
  };

  const totalAssets = Object.values(localAssets).reduce((sum, val) => sum + val, 0);
  const totalLiabilities = Object.values(localLiabilities).reduce((sum, val) => sum + val, 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleSave = () => {
    setAssets(localAssets);
    setLiabilities(localLiabilities);
  };

  const assetFields: { key: keyof Asset; label: string; icon: typeof Wallet }[] = [
    { key: 'cash_deposits', label: '現金・預金', icon: Wallet },
    { key: 'stocks', label: '株式', icon: TrendingUp },
    { key: 'investment_trusts', label: '投資信託', icon: TrendingUp },
    { key: 'bonds', label: '債券', icon: TrendingUp },
    { key: 'real_estate', label: '不動産', icon: Wallet },
    { key: 'insurance_surrender_value', label: '保険解約返戻金', icon: Wallet },
    { key: 'other_assets', label: 'その他資産', icon: Wallet },
  ];

  const liabilityFields: { key: keyof Liability; label: string }[] = [
    { key: 'housing_loan', label: '住宅ローン' },
    { key: 'car_loan', label: '自動車ローン' },
    { key: 'education_loan', label: '教育ローン' },
    { key: 'credit_card', label: 'クレジットカード' },
    { key: 'other_loans', label: 'その他ローン' },
  ];

  return (
    <div id="assets" className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">総資産</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(totalAssets)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">総負債</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(totalLiabilities)}
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-br ${netWorth >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${netWorth >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
              純資産
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency(netWorth)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 資産入力 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            資産
          </CardTitle>
          <CardDescription>
            現在お持ちの資産を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetFields.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <div className="relative">
                  <Input
                    id={key}
                    type="number"
                    min={0}
                    step={10000}
                    value={localAssets[key]}
                    onChange={(e) => handleAssetChange(key, parseInt(e.target.value) || 0)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    円
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 負債入力 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            負債
          </CardTitle>
          <CardDescription>
            現在の負債（ローン残高など）を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liabilityFields.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <div className="relative">
                  <Input
                    id={key}
                    type="number"
                    min={0}
                    step={10000}
                    value={localLiabilities[key]}
                    onChange={(e) => handleLiabilityChange(key, parseInt(e.target.value) || 0)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    円
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          資産・負債を保存
        </Button>
      </div>
    </div>
  );
}
