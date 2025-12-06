import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import type { Asset, UserProfile } from "../types";
import { api } from "../lib/api";

interface AssetsPageProps {
  profile: UserProfile | null;
  onDataChange: () => void;
}

export function AssetsPage({ profile, onDataChange }: AssetsPageProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    category: "savings",
    name: "",
    current_value: 0,
    expected_return_rate: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      loadAssets();
    }
  }, [profile?.id]);

  const loadAssets = async () => {
    if (!profile?.id) return;
    try {
      const assetData = await api.getAssets(profile.id);
      setAssets(assetData);
    } catch (error) {
      console.error("資産データの読み込みに失敗しました:", error);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      alert("まずプロフィールを登録してください");
      return;
    }
    try {
      await api.createAsset({ ...newAsset, user_id: profile.id } as Asset);
      setNewAsset({
        category: "savings",
        name: "",
        current_value: 0,
        expected_return_rate: 0,
      });
      loadAssets();
      onDataChange();
    } catch (error) {
      alert("エラーが発生しました: " + (error as Error).message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const totalAssets = assets.reduce((sum, asset) => sum + asset.current_value, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>資産の登録</CardTitle>
          <CardDescription>保有資産を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAsset} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>カテゴリ</Label>
                <Select
                  value={newAsset.category}
                  onValueChange={(value) => setNewAsset({ ...newAsset, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">預貯金</SelectItem>
                    <SelectItem value="investment">投資</SelectItem>
                    <SelectItem value="real_estate">不動産</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>資産名</Label>
                <Input
                  value={newAsset.name || ""}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>現在価値（円）</Label>
                <Input
                  type="number"
                  value={newAsset.current_value || ""}
                  onChange={(e) => setNewAsset({ ...newAsset, current_value: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>期待リターン率（%）</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newAsset.expected_return_rate || ""}
                  onChange={(e) => setNewAsset({ ...newAsset, expected_return_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <Button type="submit">追加</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>資産一覧</CardTitle>
          <CardDescription>総資産: {formatCurrency(totalAssets)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>カテゴリ</TableHead>
                <TableHead>資産名</TableHead>
                <TableHead>現在価値</TableHead>
                <TableHead>期待リターン率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{formatCurrency(asset.current_value)}</TableCell>
                  <TableCell>{asset.expected_return_rate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
