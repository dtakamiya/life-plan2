import { useState } from 'react'
import { LifePlanForm } from './components/LifePlanForm'
import { SimulationResults } from './components/SimulationResults'
import { SimulationResult } from './types/lifeplan'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function App() {
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (plan: LifePlan) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/life-plan/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      })

      if (!response.ok) {
        throw new Error('シミュレーションに失敗しました')
      }

      const result = await response.json()
      setSimulationResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">FP一級ライフプランニング</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            あなたの将来の資産形成とライフプランをシミュレーションします
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-500">
            <CardContent className="pt-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}

        {!simulationResult ? (
          <Card>
            <CardHeader>
              <CardTitle>ライフプラン情報を入力</CardTitle>
              <CardDescription>
                以下のフォームに情報を入力して、シミュレーションを実行してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-lg">シミュレーション実行中...</div>
                </div>
              ) : (
                <LifePlanForm onSubmit={handleSubmit} />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>シミュレーション結果</CardTitle>
                <CardDescription>
                  あなたのライフプランのシミュレーション結果です
                </CardDescription>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setSimulationResult(null)}
                  className="mb-4 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-700"
                >
                  新しいシミュレーションを実行
                </button>
              </CardContent>
            </Card>
            <SimulationResults result={simulationResult} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
