export interface UserProfile {
  id?: number;
  name: string;
  birth_date: string;
  gender: "male" | "female";
  occupation: string;
  spouse_name?: string;
  spouse_birth_date?: string;
  children: Array<{ name: string; birth_date: string }>;
}

export interface Income {
  id?: number;
  user_id: number;
  category: string;
  amount: number;
  frequency: "monthly" | "yearly" | "one_time";
  start_date: string;
  end_date?: string;
  notes?: string;
}

export interface Expense {
  id?: number;
  user_id: number;
  category: string;
  amount: number;
  frequency: "monthly" | "yearly" | "one_time";
  start_date: string;
  end_date?: string;
  notes?: string;
}

export interface Asset {
  id?: number;
  user_id: number;
  category: string;
  name: string;
  current_value: number;
  expected_return_rate: number;
  notes?: string;
}

export interface Liability {
  id?: number;
  user_id: number;
  category: string;
  name: string;
  remaining_balance: number;
  monthly_payment: number;
  interest_rate: number;
  start_date: string;
  end_date: string;
  notes?: string;
}

export interface Insurance {
  id?: number;
  user_id: number;
  type: string;
  name: string;
  premium: number;
  frequency: "monthly" | "yearly";
  coverage_amount?: number;
  start_date: string;
  end_date?: string;
  notes?: string;
}

export interface EducationPlan {
  id?: number;
  user_id: number;
  child_name: string;
  education_type: string;
  expected_cost: number;
  start_year: number;
  end_year: number;
  notes?: string;
}

export interface HousingLoan {
  id?: number;
  user_id: number;
  property_name: string;
  loan_amount: number;
  interest_rate: number;
  loan_period_years: number;
  start_date: string;
  monthly_payment: number;
  notes?: string;
}

export interface RetirementPlan {
  id?: number;
  user_id: number;
  retirement_age: number;
  expected_retirement_benefit: number;
  monthly_pension: number;
  current_retirement_savings: number;
  monthly_contribution: number;
  notes?: string;
}

export interface LifePlanRequest {
  user_profile: UserProfile;
  incomes: Income[];
  expenses: Expense[];
  assets: Asset[];
  liabilities: Liability[];
  insurances: Insurance[];
  education_plans: EducationPlan[];
  housing_loans: HousingLoan[];
  retirement_plans: RetirementPlan[];
  projection_years: number;
}

export interface LifePlanResponse {
  year: number;
  age: number;
  total_income: number;
  total_expense: number;
  net_cashflow: number;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  events: string[];
}
