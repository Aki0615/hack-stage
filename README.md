# みちしるべ

**スクールバスの停留所とルートを、先生が説明できる形で決めるためのツール**

公開版：<https://michishirube-bus.vercel.app>

<img src="frontend/public/buddy/normal.svg" alt="キャラクター「そらまる」" width="120">

## 概要

新年度のスクールバスの停留所とルートづくりを手伝います。ルートを1つに決めてしまうのではなく、考え方の違う3つの案を理由つきで並べ、先生が納得して選べるようにします。

## できること

1. **住所の取り込み**：保護者から集めた回答（CSV・Excel）を読み込みます
2. **取り込み結果**：利用者数と、確認が必要な申込を表示します
3. **停留所の候補**：停留所の候補と、その場所を選んだ理由を地図に出します
4. **ルートを比較**：効率重視・公平性重視・安全重視の3つの案を比べます
5. **保護者への案内**：選んだ案から、保護者へ送る案内文を作ります

## 技術スタック

- フロントエンド：Next.js、TypeScript、Tailwind CSS、Google Maps API
- バックエンド：FastAPI、scikit-learn、OR-Tools
- データベース：Supabase
- 公開先：Vercel、Render

## 手元で動かす

それぞれ別のターミナルで、リポジトリのフォルダから実行します。

```bash
# バックエンド（.env.example を .env にコピーして値を入れる）
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --port 8000
```

```bash
# フロントエンド（.env.example を .env.local にコピーして値を入れる）
cd frontend
npm install
npm run dev
```

<http://localhost:3000> を開き、`shared/demo.csv` を読み込むとデモを試せます。
