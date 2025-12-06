/**
 * ライフプラン状態管理コンテキスト
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  UserProfile,
  Asset,
  Liability,
  MonthlyExpense,
  LifeEvent,
  InsuranceInfo,
  InvestmentPlan,
  PensionInfo,
  HousingPlan,
  ChildEducationPlan,
  LifePlanRequest,
  LifePlanResponse,
} from '@/types';
import { createLifePlan, getSampleProfile } from '@/lib/api';

interface LifePlanContextType {
  // 入力データ
  profile: UserProfile | null;
  assets: Asset | null;
  liabilities: Liability | null;
  monthlyExpenses: MonthlyExpense | null;
  lifeEvents: LifeEvent[];
  insurance: InsuranceInfo | null;
  investment: InvestmentPlan | null;
  pension: PensionInfo | null;
  housing: HousingPlan | null;
  childEducationPlans: ChildEducationPlan[];

  // 結果データ
  result: LifePlanResponse | null;
  isLoading: boolean;
  error: string | null;

  // アクション
  setProfile: (profile: UserProfile) => void;
  setAssets: (assets: Asset) => void;
  setLiabilities: (liabilities: Liability) => void;
  setMonthlyExpenses: (expenses: MonthlyExpense) => void;
  setLifeEvents: (events: LifeEvent[]) => void;
  addLifeEvent: (event: LifeEvent) => void;
  removeLifeEvent: (index: number) => void;
  setInsurance: (insurance: InsuranceInfo) => void;
  setInvestment: (investment: InvestmentPlan) => void;
  setPension: (pension: PensionInfo) => void;
  setHousing: (housing: HousingPlan | null) => void;
  setChildEducationPlans: (plans: ChildEducationPlan[]) => void;
  
  calculateLifePlan: () => Promise<void>;
  loadSampleData: () => Promise<void>;
  resetAll: () => void;
}

const LifePlanContext = createContext<LifePlanContextType | null>(null);

export function LifePlanProvider({ children }: { children: React.ReactNode }) {
  // 入力データ状態
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assets, setAssets] = useState<Asset | null>(null);
  const [liabilities, setLiabilities] = useState<Liability | null>(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense | null>(null);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [insurance, setInsurance] = useState<InsuranceInfo | null>(null);
  const [investment, setInvestment] = useState<InvestmentPlan | null>(null);
  const [pension, setPension] = useState<PensionInfo | null>(null);
  const [housing, setHousing] = useState<HousingPlan | null>(null);
  const [childEducationPlans, setChildEducationPlans] = useState<ChildEducationPlan[]>([]);

  // 結果データ状態
  const [result, setResult] = useState<LifePlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLifeEvent = useCallback((event: LifeEvent) => {
    setLifeEvents((prev) => [...prev, event]);
  }, []);

  const removeLifeEvent = useCallback((index: number) => {
    setLifeEvents((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const calculateLifePlan = useCallback(async () => {
    if (!profile || !assets || !liabilities || !monthlyExpenses || !insurance || !investment || !pension) {
      setError('必要な情報がすべて入力されていません');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: LifePlanRequest = {
        profile,
        assets,
        liabilities,
        monthly_expenses: monthlyExpenses,
        life_events: lifeEvents,
        insurance,
        investment,
        pension,
        housing: housing || undefined,
        child_education_plans: childEducationPlans,
      };

      const response = await createLifePlan(request);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [profile, assets, liabilities, monthlyExpenses, lifeEvents, insurance, investment, pension, housing, childEducationPlans]);

  const loadSampleData = useCallback(async () => {
    try {
      const data = await getSampleProfile();
      setProfile(data.profile);
      setAssets(data.assets);
      setLiabilities(data.liabilities);
      setMonthlyExpenses(data.monthly_expenses);
      setLifeEvents(data.life_events);
      setInsurance(data.insurance);
      setInvestment(data.investment);
      setPension(data.pension);
      setHousing(data.housing);
      setChildEducationPlans(data.child_education_plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'サンプルデータの読み込みに失敗しました');
    }
  }, []);

  const resetAll = useCallback(() => {
    setProfile(null);
    setAssets(null);
    setLiabilities(null);
    setMonthlyExpenses(null);
    setLifeEvents([]);
    setInsurance(null);
    setInvestment(null);
    setPension(null);
    setHousing(null);
    setChildEducationPlans([]);
    setResult(null);
    setError(null);
  }, []);

  return (
    <LifePlanContext.Provider
      value={{
        profile,
        assets,
        liabilities,
        monthlyExpenses,
        lifeEvents,
        insurance,
        investment,
        pension,
        housing,
        childEducationPlans,
        result,
        isLoading,
        error,
        setProfile,
        setAssets,
        setLiabilities,
        setMonthlyExpenses,
        setLifeEvents,
        addLifeEvent,
        removeLifeEvent,
        setInsurance,
        setInvestment,
        setPension,
        setHousing,
        setChildEducationPlans,
        calculateLifePlan,
        loadSampleData,
        resetAll,
      }}
    >
      {children}
    </LifePlanContext.Provider>
  );
}

export function useLifePlan() {
  const context = useContext(LifePlanContext);
  if (!context) {
    throw new Error('useLifePlan must be used within a LifePlanProvider');
  }
  return context;
}
