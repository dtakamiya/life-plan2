# FP一級ライフプランニングWebアプリ

FP一級レベルのライフプランニング機能を提供するWebアプリケーションです。

## 機能

- **ユーザープロフィール管理**: 基本情報、家族構成の登録
- **収支管理**: 収入・支出の記録と管理
- **資産管理**: 預貯金、投資、不動産などの資産情報の管理
- **ライフプラン計算**: 将来の資産形成をシミュレーション
- **グラフ表示**: 資産推移とキャッシュフローを視覚化

## 技術スタック

### バックエンド
- FastAPI
- PostgreSQL
- Python 3.12

### フロントエンド
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts

## セットアップ

### バックエンド

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload
```

環境変数 `DATABASE_URL` を設定してください（デフォルト: `postgresql://postgres:postgres@localhost:5432/lifeplan`）

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

環境変数 `VITE_API_URL` を設定してください（デフォルト: `http://localhost:8000`）

## 使い方

1. **プロフィール登録**: 基本情報、配偶者情報、お子様情報を入力
2. **収支管理**: 収入と支出を登録
3. **資産管理**: 保有資産を登録
4. **ライフプラン計算**: 予測年数を設定してライフプランを計算
5. **結果確認**: グラフと表で将来の資産推移を確認

## ライセンス

MIT
