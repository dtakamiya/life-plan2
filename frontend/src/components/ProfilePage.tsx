import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { UserProfile } from "../types";
import { api } from "../lib/api";
import { Plus, Trash2 } from "lucide-react";

interface ProfilePageProps {
  profile: UserProfile | null;
  onProfileChange: (profile: UserProfile) => void;
}

export function ProfilePage({ profile, onProfileChange }: ProfilePageProps) {
  const [formData, setFormData] = useState<UserProfile>(
    profile || {
      name: "",
      birth_date: "",
      gender: "male",
      occupation: "",
      spouse_name: "",
      spouse_birth_date: "",
      children: [],
    }
  );

  const [newChild, setNewChild] = useState({ name: "", birth_date: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const savedProfile = await api.createUserProfile(formData);
      onProfileChange(savedProfile);
      alert("プロフィールを保存しました");
    } catch (error) {
      alert("エラーが発生しました: " + (error as Error).message);
    }
  };

  const addChild = () => {
    if (newChild.name && newChild.birth_date) {
      setFormData({
        ...formData,
        children: [...formData.children, { ...newChild }],
      });
      setNewChild({ name: "", birth_date: "" });
    }
  };

  const removeChild = (index: number) => {
    setFormData({
      ...formData,
      children: formData.children.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ユーザープロフィール</CardTitle>
          <CardDescription>基本情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">お名前 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">生年月日 *</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">性別 *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as "male" | "female" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男性</SelectItem>
                    <SelectItem value="female">女性</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">職業 *</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">配偶者情報（任意）</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spouse_name">配偶者名</Label>
                  <Input
                    id="spouse_name"
                    value={formData.spouse_name || ""}
                    onChange={(e) => setFormData({ ...formData, spouse_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spouse_birth_date">配偶者生年月日</Label>
                  <Input
                    id="spouse_birth_date"
                    type="date"
                    value={formData.spouse_birth_date || ""}
                    onChange={(e) => setFormData({ ...formData, spouse_birth_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">お子様情報（任意）</h3>
              {formData.children.map((child, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input value={child.name} disabled />
                    <Input type="date" value={child.birth_date} disabled />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeChild(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    placeholder="お子様名"
                    value={newChild.name}
                    onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  />
                  <Input
                    type="date"
                    placeholder="生年月日"
                    value={newChild.birth_date}
                    onChange={(e) => setNewChild({ ...newChild, birth_date: e.target.value })}
                  />
                </div>
                <Button type="button" onClick={addChild}>
                  <Plus className="w-4 h-4 mr-2" />
                  追加
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full">保存</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
