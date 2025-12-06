/**
 * FP1級レベル ライフプランニング 型定義
 */

export type Gender = 'male' | 'female';

export type EmploymentType = 
  | 'company_employee' 
  | 'civil_servant' 
  | 'self_employed' 
  | 'part_time' 
  | 'homemaker' 
  | 'retired';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export type LifeEventType = 
  | 'marriage' 
  | 'childbirth' 
  | 'house_purchase' 
  | 'car_purchase' 
  | 'child_education' 
  | 'child_marriage' 
  | 'retirement' 
  | 'travel' 
  | 'home_renovation' 
  | 'other';

export type EducationType = 'public' | 'private';

export interface FamilyMember {
  name: string;
  age: number;
  relationship: string;
  annual_income: number;
  employment_type?: EmploymentType;
}

export interface LifeEvent {
  event_type: LifeEventType;
  year: number;
  age: number;
  cost: number;
  description?: string;
}

export interface Asset {
  cash_deposits: number;
  stocks: number;
  investment_trusts: number;
  bonds: number;
  real_estate: number;
  insurance_surrender_value: number;
  other_assets: number;
}

export interface Liability {
  housing_loan: number;
  car_loan: number;
  education_loan: number;
  credit_card: number;
  other_loans: number;
}

export interface MonthlyExpense {
  housing: number;
  utilities: number;
  food: number;
  transportation: number;
  communication: number;
  insurance: number;
  education: number;
  entertainment: number;
  clothing: number;
  medical: number;
  other: number;
}

export interface InsuranceInfo {
  life_insurance_amount: number;
  medical_insurance: boolean;
  cancer_insurance: boolean;
  disability_insurance: boolean;
  monthly_premium: number;
}

export interface InvestmentPlan {
  monthly_investment: number;
  expected_return_rate: number;
  risk_tolerance: 'low' | 'moderate' | 'high';
}

export interface PensionInfo {
  enrollment_months_national: number;
  enrollment_months_employee: number;
  average_salary: number;
  ideco_monthly: number;
  corporate_pension: boolean;
}

export interface HousingPlan {
  is_owner: boolean;
  purchase_year?: number;
  purchase_price: number;
  down_payment: number;
  loan_years: number;
  interest_rate: number;
}

export interface ChildEducationPlan {
  child_age: number;
  kindergarten: EducationType;
  elementary: EducationType;
  junior_high: EducationType;
  high_school: EducationType;
  university: EducationType;
  university_type: '文系' | '理系' | '医歯薬系';
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  birth_year: number;
  employment_type: EmploymentType;
  marital_status: MaritalStatus;
  annual_income: number;
  bonus_months: number;
  retirement_age: number;
  life_expectancy: number;
  family_members: FamilyMember[];
}

export interface LifePlanRequest {
  profile: UserProfile;
  assets: Asset;
  liabilities: Liability;
  monthly_expenses: MonthlyExpense;
  life_events: LifeEvent[];
  insurance: InsuranceInfo;
  investment: InvestmentPlan;
  pension: PensionInfo;
  housing?: HousingPlan;
  child_education_plans: ChildEducationPlan[];
}

export interface YearlyFinance {
  year: number;
  age: number;
  income: number;
  income_after_tax: number;
  expenses: number;
  life_event_cost: number;
  savings: number;
  total_assets: number;
  investment_return: number;
  pension_income: number;
  notes: string[];
}

export interface PensionEstimate {
  basic_pension: number;
  employee_pension: number;
  total_pension: number;
  start_age: number;
}

export interface InsuranceNeed {
  death_benefit_needed: number;
  current_coverage: number;
  gap: number;
  emergency_fund_needed: number;
  calculation_details: {
    total_living_cost: number;
    education_cost: number;
    funeral_cost: number;
    survivor_pension_total: number;
    current_assets: number;
  };
}

export interface TaxCalculation {
  gross_income: number;
  income_deductions: number;
  taxable_income: number;
  income_tax: number;
  resident_tax: number;
  social_insurance: number;
  net_income: number;
}

export interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high';
  risks: {
    level: string;
    category: string;
    description: string;
    suggestion: string;
  }[];
}

export interface LifePlanResponse {
  yearly_finances: YearlyFinance[];
  pension_estimate: PensionEstimate;
  insurance_need: InsuranceNeed;
  tax_calculation: TaxCalculation;
  total_lifetime_income: number;
  total_lifetime_expenses: number;
  final_assets: number;
  risk_assessment: RiskAssessment;
  recommendations: string[];
}

export interface LifeEventTemplate {
  event_type: LifeEventType;
  name: string;
  typical_cost: number;
  description: string;
}

// 表示用ラベル
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  company_employee: '会社員',
  civil_servant: '公務員',
  self_employed: '自営業',
  part_time: 'パート・アルバイト',
  homemaker: '専業主婦・主夫',
  retired: '退職者',
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: '未婚',
  married: '既婚',
  divorced: '離婚',
  widowed: '死別',
};

export const LIFE_EVENT_LABELS: Record<LifeEventType, string> = {
  marriage: '結婚',
  childbirth: '出産',
  house_purchase: '住宅購入',
  car_purchase: '車購入',
  child_education: '子供の進学',
  child_marriage: '子供の結婚',
  retirement: '退職',
  travel: '旅行',
  home_renovation: 'リフォーム',
  other: 'その他',
};

export const RELATIONSHIP_OPTIONS = [
  '配偶者',
  '子',
  '親',
  '兄弟姉妹',
  'その他',
];
