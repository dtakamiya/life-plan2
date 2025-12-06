export type Gender = "male" | "female";
export type InsuranceType = "life" | "medical" | "disability" | "nursing";
export type LifeEventType = "marriage" | "birth" | "education" | "house_purchase" | "retirement" | "death";

export interface UserProfile {
  name: string;
  birth_date: string;
  gender: Gender;
  spouse_name?: string;
  spouse_birth_date?: string;
  children: string[];
}

export interface Income {
  annual_salary: number;
  bonus: number;
  other_income: number;
  retirement_age: number;
}

export interface Expense {
  living_expenses: number;
  housing_expenses: number;
  education_expenses: number;
  insurance_premiums: number;
  other_expenses: number;
}

export interface Asset {
  cash: number;
  stocks: number;
  bonds: number;
  real_estate: number;
  other_assets: number;
}

export interface Liability {
  mortgage: number;
  other_loans: number;
}

export interface Insurance {
  type: InsuranceType;
  coverage_amount: number;
  annual_premium: number;
  term?: number;
}

export interface Pension {
  basic_pension: number;
  employee_pension?: number;
  corporate_pension?: number;
  start_age: number;
}

export interface RetirementBenefit {
  amount: number;
  payment_age: number;
}

export interface LifeEvent {
  type: LifeEventType;
  year: number;
  amount?: number;
  description?: string;
}

export interface LifePlan {
  profile: UserProfile;
  income: Income;
  expense: Expense;
  assets: Asset;
  liabilities: Liability;
  insurances: Insurance[];
  pension?: Pension;
  retirement_benefit?: RetirementBenefit;
  life_events: LifeEvent[];
}

export interface YearlySimulation {
  year: number;
  age: number;
  income: number;
  expense: number;
  assets: number;
  liabilities: number;
  net_worth: number;
  tax: number;
}

export interface SimulationResult {
  yearly_data: YearlySimulation[];
  retirement_age: number;
  retirement_assets: number;
  pension_shortfall?: number;
}
