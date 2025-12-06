import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, User, Users } from 'lucide-react';
import { useLifePlan } from '@/contexts/LifePlanContext';
import type { UserProfile, FamilyMember, EmploymentType, MaritalStatus, Gender } from '@/types';
import { EMPLOYMENT_TYPE_LABELS, MARITAL_STATUS_LABELS, RELATIONSHIP_OPTIONS } from '@/types';

const currentYear = new Date().getFullYear();

const defaultProfile: UserProfile = {
  name: '',
  age: 35,
  gender: 'male',
  birth_year: currentYear - 35,
  employment_type: 'company_employee',
  marital_status: 'single',
  annual_income: 5000000,
  bonus_months: 2.0,
  retirement_age: 65,
  life_expectancy: 90,
  family_members: [],
};

export function ProfileForm() {
  const { profile, setProfile } = useLifePlan();
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile || defaultProfile);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(profile?.family_members || []);

  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
      setFamilyMembers(profile.family_members);
    }
  }, [profile]);

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    const updated = { ...localProfile, [field]: value };
    
    // 年齢と誕生年を同期
    if (field === 'age') {
      updated.birth_year = currentYear - (value as number);
    }
    
    setLocalProfile(updated);
  };

  const addFamilyMember = () => {
    setFamilyMembers([
      ...familyMembers,
      { name: '', age: 30, relationship: '配偶者', annual_income: 0 },
    ]);
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string | number) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedProfile = { ...localProfile, family_members: familyMembers };
    setProfile(updatedProfile);
  };

  return (
    <div id="profile" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            基本情報
          </CardTitle>
          <CardDescription>
            あなたの基本的な情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <Input
                id="name"
                placeholder="山田太郎"
                value={localProfile.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">年齢</Label>
              <Input
                id="age"
                type="number"
                min={18}
                max={100}
                value={localProfile.age}
                onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">性別</Label>
              <Select
                value={localProfile.gender}
                onValueChange={(value: Gender) => handleChange('gender', value)}
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
              <Label htmlFor="employment_type">職業</Label>
              <Select
                value={localProfile.employment_type}
                onValueChange={(value: EmploymentType) => handleChange('employment_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="marital_status">婚姻状況</Label>
              <Select
                value={localProfile.marital_status}
                onValueChange={(value: MaritalStatus) => handleChange('marital_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MARITAL_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="annual_income">年収（税込）</Label>
              <div className="relative">
                <Input
                  id="annual_income"
                  type="number"
                  min={0}
                  step={100000}
                  value={localProfile.annual_income}
                  onChange={(e) => handleChange('annual_income', parseInt(e.target.value) || 0)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  円
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bonus_months">ボーナス（月数）</Label>
              <Input
                id="bonus_months"
                type="number"
                min={0}
                max={12}
                step={0.5}
                value={localProfile.bonus_months}
                onChange={(e) => handleChange('bonus_months', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retirement_age">定年退職年齢</Label>
              <Input
                id="retirement_age"
                type="number"
                min={50}
                max={75}
                value={localProfile.retirement_age}
                onChange={(e) => handleChange('retirement_age', parseInt(e.target.value) || 65)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="life_expectancy">想定寿命</Label>
              <Input
                id="life_expectancy"
                type="number"
                min={70}
                max={120}
                value={localProfile.life_expectancy}
                onChange={(e) => handleChange('life_expectancy', parseInt(e.target.value) || 90)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              家族構成
            </span>
            <Button onClick={addFamilyMember} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </CardTitle>
          <CardDescription>
            配偶者や子供など、同居している家族を追加してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          {familyMembers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              家族を追加するには上の「追加」ボタンをクリックしてください
            </p>
          ) : (
            <div className="space-y-4">
              {familyMembers.map((member, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-muted/30"
                >
                  <div className="space-y-2">
                    <Label>名前</Label>
                    <Input
                      placeholder="名前"
                      value={member.name}
                      onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>続柄</Label>
                    <Select
                      value={member.relationship}
                      onValueChange={(value) => updateFamilyMember(index, 'relationship', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((rel) => (
                          <SelectItem key={rel} value={rel}>
                            {rel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>年齢</Label>
                    <Input
                      type="number"
                      min={0}
                      max={120}
                      value={member.age}
                      onChange={(e) => updateFamilyMember(index, 'age', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>年収</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        value={member.annual_income}
                        onChange={(e) => updateFamilyMember(index, 'annual_income', parseInt(e.target.value) || 0)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        円
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeFamilyMember(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          基本情報を保存
        </Button>
      </div>
    </div>
  );
}
