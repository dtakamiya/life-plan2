# FP1級レベル ライフプラン設計フロントエンド

React + TypeScript + Vite で構築したシングルページアプリです。  
FastAPI バックエンドの `/plan` エンドポイントへ入力条件を送信し、長期キャッシュフローやリスク警告、ゴール達成状況をダッシュボード表示します。

## 主な機能

- 世帯プロフィール / キャッシュフロー / リスク管理 / ゴール設定のマルチセクションフォーム（React Hook Form + Zod）
- 教育・住宅など最大 6 件のゴールをダイナミックに追加
- Recharts を使った資産・収入・支出の推移グラフ
- ゴール達成率、ライフプラン健全度スコア、FIRE 推定年齢、ストレステスト結果の可視化
- API 連携先は `VITE_API_BASE_URL` で変更可能（デフォルト `http://localhost:8000`）

## セットアップ

```bash
cd frontend
npm install

# 開発サーバー
npm run dev

# 型チェック + ビルド
npm run build

# ESLint
npm run lint
```

Vite サーバーは `http://localhost:5173` で起動します。

## バックエンド連携

`.env` もしくは `VITE_API_BASE_URL` を設定すると API のベース URL を切り替えられます。

```bash
echo 'VITE_API_BASE_URL=http://localhost:8000' > .env
```

バックエンドは `POST /plan` で `PlanResponse` を返す想定です。  
レスポンスの主要フィールドは `src/App.tsx` の `PlanResponse` 型を参照してください。

## ビルド成果物

```bash
npm run build
# dist/ に index.html とアセットを出力
```

そのまま `vite preview` で動作確認できます。
