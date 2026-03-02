# TRIPLE PLANCK — Quest Manager

像素風 Todo List，Next.js 16 + PostgreSQL (Neon) 全端應用。

## 技術棧

| 項目       | 技術                         |
| ---------- | ---------------------------- |
| 框架       | Next.js 16 (App Router)      |
| 認證       | NextAuth.js v5               |
| ORM        | Drizzle ORM                  |
| 資料庫     | Neon PostgreSQL (serverless) |
| Rate Limit | Upstash Redis                |
| 人機驗證   | Cloudflare Turnstile         |
| 部署       | Vercel                       |

---

## 本地開發

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env.local` 並填入實際值：

```bash
cp .env.example .env.local
```

**需要的服務：**

- [Neon](https://neon.tech) — 建立 PostgreSQL 資料庫，取得 `DATABASE_URL`
- [Upstash](https://upstash.com) — 建立 Redis，取得 REST URL 和 Token
- [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) — 取得 Site Key 和 Secret Key
- 執行 `npx auth secret` 產生 `AUTH_SECRET`

> **本地開發 Turnstile 測試 key（已預填在 .env.local）：**
>
> - Site Key: `1x00000000000000000000AA`（永遠通過）
> - Secret Key: `1x0000000000000000000000000000000AA`（永遠通過）

### 3. 初始化資料庫

```bash
npm run db:push
```

### 4. 建立第一個 Admin 帳號

先正常註冊，然後在 Neon console 執行：

```sql
UPDATE users SET role = 'admin' WHERE username = 'your_admin_username';
```

### 5. 啟動開發伺服器

```bash
npm run dev
```

開啟 `http://localhost:3000`

---

## 部署到 Vercel

1. Push 到 GitHub
2. 在 [Vercel](https://vercel.com) import repo
3. 在 **Environment Variables** 填入 `.env.local` 的所有值（生產環境用真實 key）
4. Deploy

### 綁定自訂網域

Vercel Dashboard → 你的專案 → Settings → Domains → 加入你的網域

---

## 資料庫 Schema

```
users         — id, username, password (bcrypt), role, is_banned, created_at
todos         — id, user_id, title, done, priority (low/normal/high), due_date, created/updated_at
login_attempts — 備用 IP 限流紀錄
```

---

## 路由

| 路由                | 說明                 |
| ------------------- | -------------------- |
| `/`                 | 使用者 Todo 主頁     |
| `/login`            | 登入                 |
| `/register`         | 註冊（含 Turnstile） |
| `/admin`            | 後台使用者列表       |
| `/admin/users/[id]` | 查看單一使用者 Todo  |

## API

| 方法   | 路徑                    | 說明                 |
| ------ | ----------------------- | -------------------- |
| POST   | `/api/auth/register`    | 註冊                 |
| GET    | `/api/todos`            | 取得 Todo 列表       |
| POST   | `/api/todos`            | 新增 Todo            |
| PATCH  | `/api/todos/[id]`       | 更新 Todo            |
| DELETE | `/api/todos/[id]`       | 刪除 Todo            |
| GET    | `/api/admin/users`      | Admin 使用者列表     |
| GET    | `/api/admin/users/[id]` | Admin 查看單一使用者 |
| PATCH  | `/api/admin/users/[id]` | Ban/Unban 使用者     |
