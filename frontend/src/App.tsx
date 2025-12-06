import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { ProfilePage } from "./components/ProfilePage";
import { IncomeExpensePage } from "./components/IncomeExpensePage";
import { AssetsPage } from "./components/AssetsPage";
import { LifePlanPage } from "./components/LifePlanPage";
import type { UserProfile, Income, Expense, Asset } from "./types";
import { api } from "./lib/api";

function App() {
  const [currentPage, setCurrentPage] = useState("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    // ローカルストレージからプロフィールを読み込む（簡易実装）
    const savedProfileId = localStorage.getItem("profileId");
    if (savedProfileId) {
      loadProfile(parseInt(savedProfileId));
    }
  }, []);

  const loadProfile = async (userId: number) => {
    try {
      const userProfile = await api.getUserProfile(userId);
      setProfile(userProfile);
      loadAllData(userId);
    } catch (error) {
      console.error("プロフィールの読み込みに失敗しました:", error);
    }
  };

  const loadAllData = async (userId: number) => {
    try {
      const [incomeData, expenseData, assetData] = await Promise.all([
        api.getIncomes(userId),
        api.getExpenses(userId),
        api.getAssets(userId),
      ]);
      setIncomes(incomeData);
      setExpenses(expenseData);
      setAssets(assetData);
    } catch (error) {
      console.error("データの読み込みに失敗しました:", error);
    }
  };

  const handleProfileChange = (newProfile: UserProfile) => {
    setProfile(newProfile);
    if (newProfile.id) {
      localStorage.setItem("profileId", newProfile.id.toString());
      loadAllData(newProfile.id);
    }
  };

  const handleDataChange = () => {
    if (profile?.id) {
      loadAllData(profile.id);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "profile":
        return <ProfilePage profile={profile} onProfileChange={handleProfileChange} />;
      case "income-expense":
        return <IncomeExpensePage profile={profile} onDataChange={handleDataChange} />;
      case "assets":
        return <AssetsPage profile={profile} onDataChange={handleDataChange} />;
      case "lifeplan":
        return (
          <LifePlanPage
            profile={profile}
            incomes={incomes}
            expenses={expenses}
            assets={assets}
            onDataChange={handleDataChange}
          />
        );
      default:
        return <ProfilePage profile={profile} onProfileChange={handleProfileChange} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
