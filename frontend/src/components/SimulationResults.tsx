import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { SimulationResult } from "../types/lifeplan";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

interface SimulationResultsProps {
  result: SimulationResult;
}

export function SimulationResults({ result }: SimulationResultsProps) {
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()}万円`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>退職年齢</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{result.retirement_age}歳</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>退職時資産</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(result.retirement_assets)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>年金不足額</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {result.pension_shortfall ? formatCurrency(result.pension_shortfall) : "なし"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>資産推移</CardTitle>
          <CardDescription>年齢別の資産・負債・純資産の推移</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={result.yearly_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: "年齢", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "金額（万円）", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="assets" stackId="1" stroke="#8884d8" fill="#8884d8" name="資産" />
              <Area type="monotone" dataKey="liabilities" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="負債" />
              <Line type="monotone" dataKey="net_worth" stroke="#ff7300" strokeWidth={3} name="純資産" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>収支推移</CardTitle>
          <CardDescription>年齢別の収入・支出の推移</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={result.yearly_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: "年齢", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "金額（万円）", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#8884d8" strokeWidth={2} name="収入" />
              <Line type="monotone" dataKey="expense" stroke="#82ca9d" strokeWidth={2} name="支出" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>詳細データ</CardTitle>
          <CardDescription>年次シミュレーション結果の詳細</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">年</th>
                  <th className="text-left p-2">年齢</th>
                  <th className="text-right p-2">収入</th>
                  <th className="text-right p-2">支出</th>
                  <th className="text-right p-2">資産</th>
                  <th className="text-right p-2">負債</th>
                  <th className="text-right p-2">純資産</th>
                  <th className="text-right p-2">税金</th>
                </tr>
              </thead>
              <tbody>
                {result.yearly_data.map((data, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{data.year}</td>
                    <td className="p-2">{data.age}歳</td>
                    <td className="text-right p-2">{formatCurrency(data.income)}</td>
                    <td className="text-right p-2">{formatCurrency(data.expense)}</td>
                    <td className="text-right p-2">{formatCurrency(data.assets)}</td>
                    <td className="text-right p-2">{formatCurrency(data.liabilities)}</td>
                    <td className="text-right p-2 font-semibold">{formatCurrency(data.net_worth)}</td>
                    <td className="text-right p-2">{formatCurrency(data.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
