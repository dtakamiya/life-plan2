import type {
  UserProfile,
  Income,
  Expense,
  Asset,
  Liability,
  Insurance,
  EducationPlan,
  HousingLoan,
  RetirementPlan,
  LifePlanRequest,
  LifePlanResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // ライフプラン計算
  calculateLifePlan: (request: LifePlanRequest): Promise<LifePlanResponse[]> =>
    fetchAPI<LifePlanResponse[]>("/api/lifeplan/calculate", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  // ユーザープロフィール
  createUserProfile: (profile: UserProfile): Promise<UserProfile> =>
    fetchAPI<UserProfile>("/api/user/profile", {
      method: "POST",
      body: JSON.stringify(profile),
    }),

  getUserProfile: (userId: number): Promise<UserProfile> =>
    fetchAPI<UserProfile>(`/api/user/profile/${userId}`),

  // 収入
  createIncome: (income: Income): Promise<Income> =>
    fetchAPI<Income>("/api/incomes", {
      method: "POST",
      body: JSON.stringify(income),
    }),

  getIncomes: (userId: number): Promise<Income[]> =>
    fetchAPI<Income[]>(`/api/incomes/${userId}`),

  // 支出
  createExpense: (expense: Expense): Promise<Expense> =>
    fetchAPI<Expense>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    }),

  getExpenses: (userId: number): Promise<Expense[]> =>
    fetchAPI<Expense[]>(`/api/expenses/${userId}`),

  // 資産
  createAsset: (asset: Asset): Promise<Asset> =>
    fetchAPI<Asset>("/api/assets", {
      method: "POST",
      body: JSON.stringify(asset),
    }),

  getAssets: (userId: number): Promise<Asset[]> =>
    fetchAPI<Asset[]>(`/api/assets/${userId}`),
};
