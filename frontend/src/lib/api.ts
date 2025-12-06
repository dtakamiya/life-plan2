/**
 * API クライアント
 */
import type { 
  LifePlanRequest, LifePlanResponse, LifeEventTemplate,
  UserProfile, Asset, Liability, MonthlyExpense, LifeEvent,
  InsuranceInfo, InvestmentPlan, PensionInfo, HousingPlan, ChildEducationPlan
} from '@/types';

export interface SampleProfileResponse {
  profile: UserProfile;
  assets: Asset;
  liabilities: Liability;
  monthly_expenses: MonthlyExpense;
  life_events: LifeEvent[];
  insurance: InsuranceInfo;
  investment: InvestmentPlan;
  pension: PensionInfo;
  housing: HousingPlan;
  child_education_plans: ChildEducationPlan[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function createLifePlan(request: LifePlanRequest): Promise<LifePlanResponse> {
  return fetchApi<LifePlanResponse>('/api/life-plan', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function calculateTax(
  annualIncome: number,
  employmentType: string,
  familyCount: number = 1,
  hasSpouse: boolean = false,
  spouseIncome: number = 0
) {
  const params = new URLSearchParams({
    annual_income: annualIncome.toString(),
    employment_type: employmentType,
    family_count: familyCount.toString(),
    has_spouse: hasSpouse.toString(),
    spouse_income: spouseIncome.toString(),
  });
  
  return fetchApi(`/api/tax-calculation?${params}`, {
    method: 'POST',
  });
}

export async function simulatePension(
  age: number,
  employmentType: string,
  annualIncome: number,
  enrollmentMonthsNational: number = 0,
  enrollmentMonthsEmployee: number = 0
) {
  const params = new URLSearchParams({
    age: age.toString(),
    employment_type: employmentType,
    annual_income: annualIncome.toString(),
    enrollment_months_national: enrollmentMonthsNational.toString(),
    enrollment_months_employee: enrollmentMonthsEmployee.toString(),
  });
  
  return fetchApi(`/api/pension-simulation?${params}`, {
    method: 'POST',
  });
}

export async function calculateHousingLoan(
  purchasePrice: number,
  downPayment: number,
  loanYears: number = 35,
  interestRate: number = 1.0
) {
  const params = new URLSearchParams({
    purchase_price: purchasePrice.toString(),
    down_payment: downPayment.toString(),
    loan_years: loanYears.toString(),
    interest_rate: interestRate.toString(),
  });
  
  return fetchApi(`/api/housing-loan?${params}`, {
    method: 'POST',
  });
}

export async function simulateInvestment(
  initialAmount: number = 0,
  monthlyInvestment: number = 30000,
  years: number = 20,
  returnRate: number = 5.0
) {
  const params = new URLSearchParams({
    initial_amount: initialAmount.toString(),
    monthly_investment: monthlyInvestment.toString(),
    years: years.toString(),
    return_rate: returnRate.toString(),
  });
  
  return fetchApi(`/api/investment-simulation?${params}`, {
    method: 'POST',
  });
}

export async function calculateEducationCost(
  childAge: number,
  kindergarten: string = 'public',
  elementary: string = 'public',
  juniorHigh: string = 'public',
  highSchool: string = 'public',
  university: string = 'public',
  universityType: string = '文系'
) {
  const params = new URLSearchParams({
    child_age: childAge.toString(),
    kindergarten,
    elementary,
    junior_high: juniorHigh,
    high_school: highSchool,
    university,
    university_type: universityType,
  });
  
  return fetchApi(`/api/education-cost?${params}`, {
    method: 'POST',
  });
}

export async function getLifeEventTemplates(): Promise<{ templates: LifeEventTemplate[] }> {
  return fetchApi('/api/life-events/templates');
}

export async function getDefaultValues() {
  return fetchApi('/api/defaults');
}

export async function getSampleProfile(): Promise<SampleProfileResponse> {
  return fetchApi<SampleProfileResponse>('/api/sample-profile');
}

export async function healthCheck() {
  return fetchApi('/healthz');
}
