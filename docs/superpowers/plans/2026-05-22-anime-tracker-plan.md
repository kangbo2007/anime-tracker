# 日漫追番网站 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建面向动漫爱好者的公开社区网站，包含追番日历、新番排行、百家小坛讨论区、新番影院详情页和我的追番个人中心。

**Architecture:** Next.js App Router 全栈应用 + Python 独立爬虫服务 + PostgreSQL 数据库。前后端同仓库，爬虫独立进程每12小时抓取外部数据，Next.js API Routes 处理业务逻辑和榜单计算，SSR 渲染页面。

**Tech Stack:** Next.js 14 (App Router), TypeScript, Prisma ORM, PostgreSQL, NextAuth.js, Tailwind CSS, Python 3, httpx, BeautifulSoup4, APScheduler

---

## 文件结构规划

```
D:\anime-tracker\
├─ web/                          # Next.js 全栈应用
│  ├─ prisma/
│  │  └─ schema.prisma           # 数据库模型定义
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ layout.tsx           # 根布局（导航栏 + 认证Provider）
│  │  │  ├─ page.tsx             # 首页（追番日历）
│  │  │  ├─ anime/[id]/
│  │  │  │  └─ page.tsx          # 新番影院（番剧详情页）
│  │  │  ├─ rankings/
│  │  │  │  └─ page.tsx          # 新番排行页
│  │  │  ├─ forum/[animeId]/
│  │  │  │  └─ page.tsx          # 百家小坛（某番讨论吧）
│  │  │  ├─ my/
│  │  │  │  └─ page.tsx          # 我的追番
│  │  │  └─ api/
│  │  │     ├─ auth/[...nextauth]/route.ts
│  │  │     ├─ anime/route.ts    # 番剧CRUD
│  │  │     ├─ anime/[id]/route.ts
│  │  │     ├─ rankings/route.ts # 榜单计算
│  │  │     ├─ ratings/route.ts  # 评分提交
│  │  │     ├─ follow/route.ts   # 追番/取消追番
│  │  │     ├─ progress/route.ts # 观看进度
│  │  │     ├─ posts/route.ts    # 发帖
│  │  │     └─ posts/[id]/route.ts # 回帖
│  │  ├─ components/
│  │  │  ├─ layout/
│  │  │  │  ├─ Navbar.tsx        # 顶部导航栏
│  │  │  │  └─ Footer.tsx
│  │  │  ├─ calendar/
│  │  │  │  ├─ CalendarView.tsx  # 周历视图容器
│  │  │  │  ├─ WeekGrid.tsx      # 周历网格
│  │  │  │  ├─ AnimeCard.tsx     # 番剧卡片
│  │  │  │  ├─ GridView.tsx      # 网格卡片墙
│  │  │  │  └─ SeasonPicker.tsx  # 季度选择器
│  │  │  ├─ ranking/
│  │  │  │  ├─ RankingTabs.tsx   # 榜单Tab切换
│  │  │  │  ├─ RankingList.tsx   # 排行榜列表
│  │  │  │  └─ RankingItem.tsx   # 单个排名条目
│  │  │  ├─ anime/
│  │  │  │  ├─ AnimeInfo.tsx     # 番剧基本信息区
│  │  │  │  ├─ PlaySource.tsx    # 播放源区域
│  │  │  │  ├─ RatingPanel.tsx   # 评分组件（五星+标签+推荐）
│  │  │  │  ├─ RatingStars.tsx   # 星星交互组件
│  │  │  │  └─ RatingChart.tsx   # 星级分布图
│  │  │  ├─ forum/
│  │  │  │  ├─ PostList.tsx      # 帖子列表
│  │  │  │  ├─ PostItem.tsx      # 单个帖子
│  │  │  │  ├─ PostForm.tsx      # 发帖表单
│  │  │  │  └─ ReplyForm.tsx     # 回帖表单
│  │  │  └─ my/
│  │  │     ├─ FollowList.tsx    # 追番列表
│  │  │     └─ RatingHistory.tsx # 评分历史
│  │  └─ lib/
│  │     ├─ db.ts                # Prisma客户端单例
│  │     ├─ auth.ts              # NextAuth配置
│  │     ├─ rankings.ts          # 榜单计算逻辑
│  │     └─ auto-tag.ts          # 帖子自动标签
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ tailwind.config.ts
│  └─ next.config.js
│
├─ crawler/                       # Python 爬虫服务
│  ├─ src/
│  │  ├─ main.py                 # 入口 + 调度器
│  │  ├─ db.py                   # 数据库连接与写入
│  │  ├─ crawlers/
│  │  │  ├─ __init__.py
│  │  │  ├─ bangumi.py           # Bangumi爬虫
│  │  │  ├─ bilibili.py          # B站爬虫
│  │  │  ├─ douban.py            # 豆瓣爬虫
│  │  │  └─ douyin.py            # 抖音爬虫
│  │  └─ normalizer.py           # 数据清洗归一化
│  ├─ requirements.txt
│  └─ pyproject.toml
│
└─ docs/
   └─ superpowers/
      ├─ specs/2026-05-22-anime-tracker-design.md
      └─ plans/2026-05-22-anime-tracker-plan.md
```

---

## Phase 1: 项目初始化与基础设施

### Task 1.1: 创建 Next.js 项目

**Files:**
- Create: `D:\anime-tracker\web\` (Next.js scaffold)

- [ ] **Step 1: 用 create-next-app 创建项目**

```bash
cd /d/anime-tracker
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm
```

- [ ] **Step 2: 安装核心依赖**

```bash
cd /d/anime-tracker/web
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client
```

- [ ] **Step 3: 初始化 Prisma**

```bash
cd /d/anime-tracker/web
npx prisma init
```

- [ ] **Step 4: 验证项目能启动**

```bash
cd /d/anime-tracker/web
npm run dev
```

打开 `http://localhost:3000`，确认 Next.js 默认页面显示。

- [ ] **Step 5: Commit**

```bash
cd /d/anime-tracker
git init
git add web/
git commit -m "feat: scaffold Next.js project with Prisma and NextAuth"
```

---

### Task 1.2: 配置 PostgreSQL 与 Prisma Schema

**Files:**
- Modify: `D:\anime-tracker\web\.env`
- Write: `D:\anime-tracker\web\prisma\schema.prisma`

- [ ] **Step 1: 配置数据库连接**

编辑 `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/anime_tracker?schema=public"
AUTH_SECRET="dev-secret-change-in-production"
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

- [ ] **Step 2: 编写 Prisma Schema**

写入 `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  ratings       UserRating[]
  follows       UserFollow[]
  watchProgress UserWatchProgress[]
  posts         ForumPost[]
  replies       ForumReply[]
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

enum Season {
  WINTER
  SPRING
  SUMMER
  FALL
}

enum BroadcastDay {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

model Anime {
  id             String        @id @default(cuid())
  title          String
  titleJp        String?       @map("title_jp")
  cover          String?
  synopsis       String?
  season         Season
  year           Int
  broadcastDay   BroadcastDay? @map("broadcast_day")
  broadcastTime  String?       @map("broadcast_time")
  episodeCount   Int?          @map("episode_count")
  currentEpisode Int           @default(0) @map("current_episode")
  studio         String?
  director       String?
  cvList         Json?         @map("cv_list")
  isMovie        Boolean       @default(false) @map("is_movie")
  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")

  rankings      AnimeRanking[]
  characters    Character[]
  playSources   PlaySource[]
  forumPosts    ForumPost[]
  userRatings   UserRating[]
  userFollows   UserFollow[]
  watchProgress UserWatchProgress[]

  @@map("animes")
}

model AnimeRanking {
  id             String   @id @default(cuid())
  animeId        String   @map("anime_id")
  heatScore      Float?   @map("heat_score")
  scoreScore     Float?   @map("score_score")
  viewScore      Float?   @map("view_score")
  retentionScore Float?   @map("retention_score")
  rawData        Json     @map("raw_data")
  calculatedAt   DateTime @default(now()) @map("calculated_at")

  anime Anime @relation(fields: [animeId], references: [id], onDelete: Cascade)

  @@unique([animeId, calculatedAt])
  @@map("anime_rankings")
}

model Character {
  id             String  @id @default(cuid())
  animeId        String  @map("anime_id")
  name           String
  nameJp         String? @map("name_jp")
  cv             String?
  avatar         String?
  aliases        Json?
  characterScore Float?  @map("character_score")

  anime Anime @relation(fields: [animeId], references: [id], onDelete: Cascade)

  @@map("characters")
}

model PlaySource {
  id          String  @id @default(cuid())
  animeId     String  @map("anime_id")
  sourceName  String  @map("source_name")
  url         String
  type        String  @default("redirect")
  episodeNum  Int?    @map("episode_num")
  isAvailable Boolean @default(true) @map("is_available")

  anime Anime @relation(fields: [animeId], references: [id], onDelete: Cascade)

  @@map("play_sources")
}

model UserRating {
  id        String   @id @default(cuid())
  animeId   String   @map("anime_id")
  userId    String   @map("user_id")
  rating    Float
  tags      Json?
  recommend String
  createdAt DateTime @default(now()) @map("created_at")

  anime Anime @relation(fields: [animeId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([animeId, userId])
  @@map("user_ratings")
}

model UserFollow {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  animeId   String   @map("anime_id")
  createdAt DateTime @default(now()) @map("created_at")

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  anime Anime @relation(fields: [animeId], references: [id], onDelete: Cascade)

  @@unique([userId, animeId])
  @@map("user_follows")
}

model UserWatchProgress {
  id             String   @id @default(cuid())
  userId         String   @map("user_id")
  animeId        String   @map("anime_id")
  currentEpisode Int      @default(0) @map("current_episode")
  status         String   @default("watching")
  isAuto         Boolean  @default(false) @map("is_auto")
  updatedAt      DateTime @updatedAt @map("updated_at")

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  anime Anime @relation(fields: [animeId], references: [id], onDelete: Cascade)

  @@unique([userId, animeId])
  @@map("user_watch_progress")
}

model ForumPost {
  id        String   @id @default(cuid())
  animeId   String   @map("anime_id")
  userId    String   @map("user_id")
  title     String
  content   String
  autoTags  Json?    @map("auto_tags")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  anime   Anime        @relation(fields: [animeId], references: [id], onDelete: Cascade)
  user    User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  replies ForumReply[]

  @@map("forum_posts")
}

model ForumReply {
  id        String   @id @default(cuid())
  postId    String   @map("post_id")
  userId    String   @map("user_id")
  content   String
  createdAt DateTime @default(now()) @map("created_at")

  post ForumPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("forum_replies")
}
```

- [ ] **Step 3: 执行数据库迁移**

```bash
cd /d/anime-tracker/web
npx prisma db push
```

Expected: `Your database is now in sync with your schema.`

- [ ] **Step 4: 生成 Prisma Client**

```bash
cd /d/anime-tracker/web
npx prisma generate
```

- [ ] **Step 5: Commit**

```bash
cd /d/anime-tracker/web
git add prisma/schema.prisma .env
git commit -m "feat: add Prisma schema with all entities"
```

---

### Task 1.3: 配置 NextAuth.js

**Files:**
- Create: `D:\anime-tracker\web\src\lib\auth.ts`
- Create: `D:\anime-tracker\web\src\lib\db.ts`
- Create: `D:\anime-tracker\web\src\app\api\auth\[...nextauth]\route.ts`

- [ ] **Step 1: 创建 Prisma 客户端单例**

写入 `src/lib/db.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 2: 创建 NextAuth 配置**

写入 `src/lib/auth.ts`:
```typescript
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
```

- [ ] **Step 3: 创建 API Route**

写入 `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 4: 验证构建编译通过**

```bash
cd /d/anime-tracker/web
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
cd /d/anime-tracker/web
git add src/lib/db.ts src/lib/auth.ts src/app/api/auth/
git commit -m "feat: configure NextAuth with GitHub and Google providers"
```

---

### Task 1.4: 创建根布局与导航栏

**Files:**
- Modify: `D:\anime-tracker\web\src\app\layout.tsx`
- Create: `D:\anime-tracker\web\src\components\layout\Navbar.tsx`

- [ ] **Step 1: 创建导航栏组件**

写入 `src/components/layout/Navbar.tsx`:
```tsx
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg text-indigo-600">
            追番
          </Link>
          <Link href="/rankings" className="text-sm text-gray-600 hover:text-gray-900">
            新番排行
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link href="/my" className="text-sm text-gray-600 hover:text-gray-900">
                我的追番
              </Link>
              <span className="text-sm text-gray-400">{session.user.name}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  退出
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/api/auth/signin"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: 更新根布局**

修改 `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "追番 - 日漫追番社区",
  description: "追番日历、新番排行、百家小坛讨论社区",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: 验证页面渲染**

```bash
cd /d/anime-tracker/web
npm run dev
```

打开 `http://localhost:3000`，确认导航栏显示。

- [ ] **Step 4: Commit**

```bash
cd /d/anime-tracker/web
git add src/app/layout.tsx src/components/layout/Navbar.tsx
git commit -m "feat: add root layout with navbar and NextAuth integration"
```

---

## Phase 2: Python 爬虫服务

### Task 2.1: 创建 Python 爬虫项目结构

**Files:**
- Create: `D:\anime-tracker\crawler\requirements.txt`
- Create: `D:\anime-tracker\crawler\pyproject.toml`
- Create: `D:\anime-tracker\crawler\src\__init__.py`
- Create: `D:\anime-tracker\crawler\src\db.py`
- Create: `D:\anime-tracker\crawler\src\crawlers\__init__.py`

- [ ] **Step 1: 编写依赖文件**

写入 `crawler/requirements.txt`:
```
httpx==0.27.2
beautifulsoup4==4.12.3
apscheduler==3.10.4
psycopg2-binary==2.9.9
python-dotenv==1.0.1
```

写入 `crawler/pyproject.toml`:
```toml
[project]
name = "anime-crawler"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "httpx>=0.27",
    "beautifulsoup4>=4.12",
    "apscheduler>=3.10",
    "psycopg2-binary>=2.9",
    "python-dotenv>=1.0",
]
```

- [ ] **Step 2: 创建数据库连接模块**

写入 `crawler/src/db.py`:
```python
import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/anime_tracker"
)


def get_connection():
    return psycopg2.connect(DATABASE_URL)


def upsert_anime_ranking(anime_id: str, raw_data: dict) -> None:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO anime_rankings (anime_id, raw_data)
                VALUES (%s, %s)
                """,
                (anime_id, psycopg2.extras.Json(raw_data)),
            )
        conn.commit()
    finally:
        conn.close()
```

- [ ] **Step 3: 创建 .env 文件**

写入 `crawler/.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/anime_tracker
```

- [ ] **Step 4: 安装依赖并验证**

```bash
cd /d/anime-tracker/crawler
pip install -r requirements.txt
python -c "from src.db import get_connection; print('OK')"
```

Expected: `OK`（如果 PostgreSQL 未运行则先启动）。

- [ ] **Step 5: Commit**

```bash
cd /d/anime-tracker
git add crawler/
git commit -m "feat: scaffold Python crawler project with DB connection"
```

---

### Task 2.2: 实现 Bangumi 爬虫

**Files:**
- Create: `D:\anime-tracker\crawler\src\crawlers\bangumi.py`
- Create: `D:\anime-tracker\crawler\src\normalizer.py`

- [ ] **Step 1: 创建数据归一化模块**

写入 `crawler/src/normalizer.py`:
```python
"""将各平台原始数据归一化为统一格式"""


def normalize_score(raw: float, platform: str) -> float:
    """将各平台评分统一为10分制"""
    if platform == "bangumi":
        return raw  # Bangumi 本身就是10分制
    if platform == "douban":
        return raw * 2  # 豆瓣5分制转10分制
    if platform == "bilibili":
        return raw * 2  # B站5分制转10分制
    return raw


def normalize_discussion_count(raw: int, platform: str) -> int:
    """统一讨论数据格式，返回 {count, platform}"""
    return raw
```

- [ ] **Step 2: 实现 Bangumi 爬虫**

写入 `crawler/src/crawlers/bangumi.py`:
```python
"""Bangumi 爬虫：抓取番剧评分、讨论数、角色列表"""
import httpx
from bs4 import BeautifulSoup
import time
import json


BANGUMI_BASE = "https://api.bgm.tv"
USER_AGENT = "AnimeTracker/0.1 (com.example.animetracker)"


def search_anime(keyword: str) -> list[dict]:
    """搜索番剧"""
    resp = httpx.get(
        f"{BANGUMI_BASE}/search/subject/{keyword}",
        params={"type": 2, "responseGroup": "medium"},
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    results = []
    if "list" in data:
        for item in data["list"]:
            results.append({
                "bangumi_id": item["id"],
                "title": item.get("name", ""),
                "title_jp": item.get("name_cn", ""),
                "score": item.get("rating", {}).get("score", 0),
                "rank": item.get("rating", {}).get("rank", 0),
                "summary": item.get("summary", ""),
            })
    return results


def get_anime_detail(bangumi_id: int) -> dict:
    """获取番剧详细信息，包含评分、在看人数、讨论数"""
    resp = httpx.get(
        f"{BANGUMI_BASE}/subject/{bangumi_id}",
        params={"responseGroup": "large"},
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()

    return {
        "bangumi_id": data["id"],
        "score": data.get("rating", {}).get("score", 0) or 0,
        "score_count": data.get("rating", {}).get("total", 0) or 0,
        "watching_count": data.get("collection", {}).get("doing", 0) or 0,
        "discussion_count": data.get("topic_count", 0) or 0,
        "comment_count": data.get("comment_count", 0) or 0,
    }


def get_characters(bangumi_id: int) -> list[dict]:
    """获取番剧角色列表"""
    resp = httpx.get(
        f"{BANGUMI_BASE}/subject/{bangumi_id}/persons",
        params={"type": 2},
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    characters = []
    for item in data.get("crt", []):
        characters.append({
            "name": item.get("name", ""),
            "name_jp": item.get("name_jp", ""),
            "cv": item.get("actors", [{}])[0].get("name", "") if item.get("actors") else "",
            "avatar": item.get("images", {}).get("grid", ""),
        })
    return characters


def crawl_all(anime_list: list[dict]) -> list[dict]:
    """批量爬取番剧数据"""
    results = []
    for anime in anime_list:
        try:
            detail = get_anime_detail(anime["bangumi_id"])
            detail["episodes"] = anime.get("episodes", 0)
            results.append(detail)
            time.sleep(1)  # 限速
        except Exception as e:
            print(f"Bangumi crawl error for {anime.get('title', 'unknown')}: {e}")
    return results
```

- [ ] **Step 3: 运行基本测试**

```bash
cd /d/anime-tracker/crawler
python -c "
from src.crawlers.bangumi import search_anime
results = search_anime('鬼灭之刃')
print(f'Found {len(results)} results')
if results:
    print(f'First: {results[0][\"title\"]}, score: {results[0][\"score\"]}')
"
```

Expected: 输出搜索结果数量和第一部番剧名及评分。

- [ ] **Step 4: Commit**

```bash
cd /d/anime-tracker
git add crawler/src/crawlers/bangumi.py crawler/src/normalizer.py
git commit -m "feat: implement Bangumi crawler with search, detail, and character endpoints"
```

---

### Task 2.3: 实现 B站豆瓣抖音爬虫骨架 + 调度器

**Files:**
- Create: `D:\anime-tracker\crawler\src\crawlers\bilibili.py`
- Create: `D:\anime-tracker\crawler\src\crawlers\douban.py`
- Create: `D:\anime-tracker\crawler\src\crawlers\douyin.py`
- Create: `D:\anime-tracker\crawler\src\main.py`

- [ ] **Step 1: B站爬虫骨架**

写入 `crawler/src/crawlers/bilibili.py`:
```python
"""B站爬虫：抓取番剧播放量、追番人数、社区UGC讨论数据"""
import httpx
import json
import time
import re


BILIBILI_SPACE_API = "https://api.bilibili.com/x/space/wbi/arc/search"
BILIBILI_BANGUMI_API = "https://api.bilibili.com/pgc/view/web/season"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def get_bangumi_info(media_id: int) -> dict:
    """通过 media_id 获取B站番剧播放量与追番数据"""
    resp = httpx.get(
        BILIBILI_BANGUMI_API,
        params={"season_id": media_id},
        headers={"User-Agent": USER_AGENT, "Referer": "https://www.bilibili.com"},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    result = data.get("result", {})
    stat = result.get("stat", {})
    return {
        "views": stat.get("views", 0),
        "follows": stat.get("followers", 0),
        "danmakus": stat.get("danmakus", 0),
        "score": result.get("rating", {}).get("score", 0) or 0,
        "score_count": result.get("rating", {}).get("count", 0) or 0,
    }


def search_ugc_play_count(keyword: str, days: int = 7) -> dict:
    """搜索番剧关键词的UGC稿件统计"""
    resp = httpx.get(
        "https://api.bilibili.com/x/web-interface/search/type",
        params={
            "search_type": "video",
            "keyword": keyword,
            "duration": 4,  # 10-30分钟
            "order": "pubdate",
        },
        headers={"User-Agent": USER_AGENT, "Referer": "https://www.bilibili.com"},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    result = data.get("data", {})
    total_views = 0
    total_likes = 0
    total_coins = 0
    total_favorites = 0
    total_shares = 0
    total_comments = 0
    total_danmakus = 0
    count = 0

    for item in result.get("result", []):
        total_views += item.get("play", 0)
        total_likes += item.get("like", 0)
        total_coins += item.get("coin", 0)
        total_favorites += item.get("favorites", 0)
        total_shares += item.get("share", 0)
        total_comments += item.get("review", 0)
        total_danmakus += item.get("danmaku", 0)
        count += 1

    return {
        "video_count": count,
        "total_views": total_views,
        "total_likes": total_likes,
        "total_coins": total_coins,
        "total_favorites": total_favorites,
        "total_shares": total_shares,
        "total_comments": total_comments,
        "total_danmakus": total_danmakus,
    }


def search_character_ugc(character_name: str) -> dict:
    """搜索角色应援稿件数据"""
    return search_ugc_play_count(character_name)
```

- [ ] **Step 2: 豆瓣爬虫骨架**

写入 `crawler/src/crawlers/douban.py`:
```python
"""豆瓣爬虫：抓取番剧评分、评论数、在看人数"""
import httpx
from bs4 import BeautifulSoup
import re
import time


DOUBAN_SEARCH_API = "https://www.douban.com/search"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def search_anime(keyword: str) -> list[dict]:
    """搜索豆瓣番剧条目"""
    resp = httpx.get(
        DOUBAN_SEARCH_API,
        params={"cat": "1002", "q": keyword},
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    results = []
    for item in soup.select(".result"):
        title_el = item.select_one(".title a")
        rating_el = item.select_one(".rating_nums")
        if title_el:
            href = title_el.get("href", "")
            douban_id = re.search(r"subject/(\d+)", href)
            results.append({
                "title": title_el.text.strip(),
                "douban_id": douban_id.group(1) if douban_id else "",
                "rating": float(rating_el.text) if rating_el else 0,
            })
    return results


def get_anime_detail(douban_id: str) -> dict:
    """获取豆瓣番剧详细评分和讨论数据"""
    resp = httpx.get(
        f"https://api.douban.com/v2/movie/{douban_id}",
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    rating = data.get("rating", {})
    return {
        "score": rating.get("average", 0) or 0,
        "score_count": rating.get("numRaters", 0) or 0,
        "wish_count": data.get("wish_count", 0) or 0,
        "comments_count": data.get("comments_count", 0) or 0,
        "reviews_count": data.get("reviews_count", 0) or 0,
    }
```

- [ ] **Step 3: 抖音爬虫骨架**

写入 `crawler/src/crawlers/douyin.py`:
```python
"""抖音爬虫：抓取番剧话题播放量"""
import httpx
import re
import json


USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def get_topic_data(keyword: str) -> dict:
    """通过抖音话题搜索获取播放量与视频数"""
    resp = httpx.get(
        "https://www.douyin.com/search/" + keyword,
        params={"type": "general"},
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    resp.raise_for_status()
    text = resp.text

    # 尝试从页面提取话题数据
    view_count = 0
    video_count = 0

    match = re.search(r'"play_count":(\d+)', text)
    if match:
        view_count = int(match.group(1))
    match = re.search(r'"aweme_count":(\d+)', text)
    if match:
        video_count = int(match.group(1))

    return {
        "topic_views": view_count,
        "recent_video_count": video_count,
    }
```

- [ ] **Step 4: 创建调度器入口**

写入 `crawler/src/main.py`:
```python
"""爬虫服务入口：APScheduler 定时任务"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from apscheduler.schedulers.blocking import BlockingScheduler
from src.crawlers.bangumi import crawl_all as bangumi_crawl
from src.db import upsert_anime_ranking, get_connection


scheduler = BlockingScheduler()


@scheduler.scheduled_job("interval", hours=12, id="crawl_all")
def crawl_all_platforms():
    """每12小时执行一次全平台抓取"""
    print(f"[{__import__('datetime').datetime.now()}] Starting crawl job...")

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, title, title_jp FROM animes")
            anime_list = [
                {"id": row[0], "title": row[1], "title_jp": row[2]}
                for row in cur.fetchall()
            ]
    finally:
        conn.close()

    for anime in anime_list:
        try:
            # 简化版：只从 Bangumi 抓取
            raw_data = {"bangumi": {}, "bilibili": {}, "douban": {}, "douyin": {}}
            upsert_anime_ranking(anime["id"], raw_data)
        except Exception as e:
            print(f"Error crawling {anime['title']}: {e}")

    print(f"[{__import__('datetime').datetime.now()}] Crawl job done. {len(anime_list)} anime processed.")


if __name__ == "__main__":
    print("Starting Anime Tracker Crawler Service...")
    print("Scheduler: every 12 hours")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("Crawler service stopped.")
```

- [ ] **Step 5: 验证爬虫可运行**

```bash
cd /d/anime-tracker/crawler
python -c "from src.main import crawl_all_platforms; print('Import OK')"
```

Expected: `Import OK`

- [ ] **Step 6: Commit**

```bash
cd /d/anime-tracker
git add crawler/src/crawlers/bilibili.py crawler/src/crawlers/douban.py crawler/src/crawlers/douyin.py crawler/src/main.py
git commit -m "feat: add Bilibili, Douban, Douyin crawler stubs and APScheduler entry point"
```

---

## Phase 3: 追番日历

### Task 3.1: 创建番剧 API Routes

**Files:**
- Create: `D:\anime-tracker\web\src\app\api\anime\route.ts`
- Create: `D:\anime-tracker\web\src\app\api\anime\[id]\route.ts`

- [ ] **Step 1: 写 GET 番剧列表 API**

写入 `src/app/api/anime/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const season = searchParams.get("season");
  const year = searchParams.get("year");
  const isMovie = searchParams.get("isMovie");

  const where: Record<string, unknown> = {};
  if (season) where.season = season;
  if (year) where.year = parseInt(year);
  if (isMovie !== null) where.isMovie = isMovie === "true";

  const anime = await db.anime.findMany({
    where,
    include: {
      playSources: { where: { isAvailable: true } },
    },
    orderBy: { broadcastDay: "asc" },
  });

  return NextResponse.json(anime);
}
```

- [ ] **Step 2: 写 GET 单部番剧详情 API**

写入 `src/app/api/anime/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const anime = await db.anime.findUnique({
    where: { id: params.id },
    include: {
      characters: true,
      playSources: { where: { isAvailable: true } },
      userRatings: {
        select: { rating: true, recommend: true, tags: true },
      },
    },
  });

  if (!anime) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ratingCount = anime.userRatings.length;
  const avgRating =
    ratingCount > 0
      ? anime.userRatings.reduce((sum, r) => sum + r.rating, 0) / ratingCount
      : 0;
  const recommendCount = anime.userRatings.filter(
    (r) => r.recommend === "recommend"
  ).length;
  const recommendRate = ratingCount > 0 ? recommendCount / ratingCount : 0;

  return NextResponse.json({
    ...anime,
    avgRating: Math.round(avgRating * 10) / 10,
    ratingCount,
    recommendRate: Math.round(recommendRate * 100),
    starDistribution: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => ({
      star,
      count: anime.userRatings.filter((r) => Math.abs(r.rating - star) < 0.25).length,
    })),
  });
}
```

- [ ] **Step 3: Commit**

```bash
cd /d/anime-tracker/web
git add src/app/api/anime/
git commit -m "feat: add anime list and detail API routes"
```

---

### Task 3.2: 实现追番日历页面

**Files:**
- Create: `D:\anime-tracker\web\src\app\page.tsx`
- Create: `D:\anime-tracker\web\src\components\calendar\SeasonPicker.tsx`
- Create: `D:\anime-tracker\web\src\components\calendar\AnimeCard.tsx`
- Create: `D:\anime-tracker\web\src\components\calendar\CalendarView.tsx`
- Create: `D:\anime-tracker\web\src\components\calendar\WeekGrid.tsx`
- Create: `D:\anime-tracker\web\src\components\calendar\GridView.tsx`

- [ ] **Step 1: 写季度选择器组件**

写入 `src/components/calendar/SeasonPicker.tsx`:
```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SEASONS = [
  { label: "2026冬", season: "WINTER", year: 2026 },
  { label: "2026春", season: "SPRING", year: 2026 },
  { label: "2026夏", season: "SUMMER", year: 2026 },
  { label: "2026秋", season: "FALL", year: 2026 },
  { label: "2027冬", season: "WINTER", year: 2027 },
];

export function SeasonPicker() {
  const router = useRouter();
  const params = useSearchParams();
  const currentSeason = params.get("season") || "SPRING";
  const currentYear = params.get("year") || "2026";

  return (
    <div className="flex gap-2 mb-4">
      {SEASONS.map((s) => (
        <button
          key={`${s.year}-${s.season}`}
          onClick={() => router.push(`/?season=${s.season}&year=${s.year}`)}
          className={`px-3 py-1 text-sm rounded-full border ${
            s.season === currentSeason && s.year === parseInt(currentYear)
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 写番剧卡片组件**

写入 `src/components/calendar/AnimeCard.tsx`:
```tsx
import Link from "next/link";

interface AnimeCardProps {
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  broadcastTime: string | null;
  currentEpisode: number;
  score: number | null;
  hasSource: boolean;
}

export function AnimeCard({ id, title, titleJp, cover, broadcastTime, currentEpisode, score, hasSource }: AnimeCardProps) {
  return (
    <Link href={`/anime/${id}`} className="block">
      <div className="group rounded-lg border border-gray-200 bg-white p-3 hover:border-indigo-300 hover:shadow-sm transition-all">
        <div className="flex gap-3">
          <div className="w-16 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
            {cover ? (
              <img src={cover} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">暂无封面</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
            <p className="text-xs text-gray-400 truncate">{titleJp || ""}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              {broadcastTime && <span>{broadcastTime}</span>}
              <span>更新至{currentEpisode}集</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {score != null && (
                <span className="text-xs font-medium text-yellow-600">{score.toFixed(1)}</span>
              )}
              <span className={`text-xs px-1 rounded ${hasSource ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {hasSource ? "有片源" : "外部链接"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: 写周历网格组件**

写入 `src/components/calendar/WeekGrid.tsx`:
```tsx
import { AnimeCard } from "./AnimeCard";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "周一", TUESDAY: "周二", WEDNESDAY: "周三",
  THURSDAY: "周四", FRIDAY: "周五", SATURDAY: "周六", SUNDAY: "周日",
};

interface Anime {
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  broadcastDay: string | null;
  broadcastTime: string | null;
  currentEpisode: number;
  playSources: { isAvailable: boolean }[];
}

export function WeekGrid({ anime }: { anime: Anime[] }) {
  const byDay: Record<string, Anime[]> = {};
  for (const day of Object.keys(DAY_LABELS)) {
    byDay[day] = anime.filter((a) => a.broadcastDay === day);
  }

  return (
    <div className="grid grid-cols-7 gap-3">
      {Object.entries(DAY_LABELS).map(([day, label]) => (
        <div key={day} className="space-y-2">
          <div className="text-sm font-medium text-gray-500 text-center py-1 border-b">
            {label}
          </div>
          {byDay[day].length === 0 && (
            <p className="text-xs text-gray-300 text-center py-4">暂无</p>
          )}
          {byDay[day].map((a) => (
            <AnimeCard
              key={a.id}
              id={a.id}
              title={a.title}
              titleJp={a.titleJp}
              cover={a.cover}
              broadcastTime={a.broadcastTime}
              currentEpisode={a.currentEpisode}
              score={null}
              hasSource={a.playSources.length > 0}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: 写网格视图组件**

写入 `src/components/calendar/GridView.tsx`:
```tsx
"use client";

import { AnimeCard } from "./AnimeCard";

interface Anime {
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  broadcastTime: string | null;
  currentEpisode: number;
  playSources: { isAvailable: boolean }[];
}

export function GridView({ anime }: { anime: Anime[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {anime.map((a) => (
        <AnimeCard
          key={a.id}
          id={a.id}
          title={a.title}
          titleJp={a.titleJp}
          cover={a.cover}
          broadcastTime={a.broadcastTime}
          currentEpisode={a.currentEpisode}
          score={null}
          hasSource={a.playSources.length > 0}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: 写日历视图容器（周历/网格切换 + TV/电影Tab）**

写入 `src/components/calendar/CalendarView.tsx`:
```tsx
"use client";

import { useState } from "react";
import { WeekGrid } from "./WeekGrid";
import { GridView } from "./GridView";

interface Anime {
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  broadcastDay: string | null;
  broadcastTime: string | null;
  currentEpisode: number;
  isMovie: boolean;
  playSources: { isAvailable: boolean }[];
}

export function CalendarView({ anime }: { anime: Anime[] }) {
  const [viewMode, setViewMode] = useState<"week" | "grid">("week");
  const [tab, setTab] = useState<"tv" | "movie">("tv");

  const filteredAnime = anime.filter((a) =>
    tab === "movie" ? a.isMovie : !a.isMovie
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("tv")}
            className={`px-4 py-1.5 text-sm rounded-md ${
              tab === "tv" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            TV新番
          </button>
          <button
            onClick={() => setTab("movie")}
            className={`px-4 py-1.5 text-sm rounded-md ${
              tab === "movie" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            动画电影
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("week")}
            className={`px-3 py-1.5 text-sm rounded-md ${
              viewMode === "week" ? "bg-gray-200 text-gray-800" : "text-gray-500"
            }`}
          >
            周历
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 text-sm rounded-md ${
              viewMode === "grid" ? "bg-gray-200 text-gray-800" : "text-gray-500"
            }`}
          >
            网格
          </button>
        </div>
      </div>

      {tab === "tv" && viewMode === "week" && <WeekGrid anime={filteredAnime} />}
      {(tab === "movie" || viewMode === "grid") && <GridView anime={filteredAnime} />}
    </div>
  );
}
```

- [ ] **Step 6: 写首页**

修改 `src/app/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { SeasonPicker } from "@/components/calendar/SeasonPicker";
import { CalendarView } from "@/components/calendar/CalendarView";

interface Props {
  searchParams: { season?: string; year?: string };
}

export default async function HomePage({ searchParams }: Props) {
  const season = searchParams.season || "SPRING";
  const year = parseInt(searchParams.year || "2026");

  const anime = await db.anime.findMany({
    where: { season: season as "WINTER" | "SPRING" | "SUMMER" | "FALL", year },
    include: { playSources: { where: { isAvailable: true } } },
    orderBy: { broadcastDay: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">追番日历</h1>
      <SeasonPicker />
      <CalendarView anime={anime} />
    </div>
  );
}
```

- [ ] **Step 7: 验证页面渲染**

```bash
cd /d/anime-tracker/web
npm run dev
```

打开 `http://localhost:3000`，确认追番日历页面正常显示（无数据时为空白周历）。

- [ ] **Step 8: Commit**

```bash
cd /d/anime-tracker/web
git add src/app/page.tsx src/components/calendar/
git commit -m "feat: implement anime calendar with week/grid views and season picker"
```

---

## Phase 4: 新番影院（番剧详情页）

### Task 4.1: 实现番剧详情页

**Files:**
- Create: `D:\anime-tracker\web\src\app\anime\[id]\page.tsx`
- Create: `D:\anime-tracker\web\src\components\anime\AnimeInfo.tsx`
- Create: `D:\anime-tracker\web\src\components\anime\PlaySource.tsx`

- [ ] **Step 1: 番剧基本信息组件**

写入 `src/components/anime/AnimeInfo.tsx`:
```tsx
interface Character {
  id: string;
  name: string;
  nameJp: string | null;
  cv: string | null;
  avatar: string | null;
}

interface AnimeInfoProps {
  title: string;
  titleJp: string | null;
  cover: string | null;
  synopsis: string | null;
  studio: string | null;
  director: string | null;
  episodeCount: number | null;
  currentEpisode: number;
  broadcastDay: string | null;
  broadcastTime: string | null;
  characters: Character[];
  avgRating: number;
  ratingCount: number;
  recommendRate: number;
}

export function AnimeInfo(props: AnimeInfoProps) {
  const dayLabel: Record<string, string> = {
    MONDAY: "周一", TUESDAY: "周二", WEDNESDAY: "周三",
    THURSDAY: "周四", FRIDAY: "周五", SATURDAY: "周六", SUNDAY: "周日",
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <div className="w-48 h-64 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
          {props.cover ? (
            <img src={props.cover} alt={props.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">暂无封面</div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{props.title}</h1>
          {props.titleJp && <p className="text-gray-500 mt-1">{props.titleJp}</p>}
          <div className="flex items-center gap-4 mt-3">
            <span className="text-lg font-bold text-yellow-600">{props.avgRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">{props.ratingCount} 人评分</span>
            <span className="text-sm text-indigo-600">{props.recommendRate}% 推荐</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
            {props.broadcastDay && (
              <span className="px-2 py-0.5 bg-gray-100 rounded">
                {dayLabel[props.broadcastDay] || props.broadcastDay} {props.broadcastTime || ""}
              </span>
            )}
            <span className="px-2 py-0.5 bg-gray-100 rounded">
              更新至第{props.currentEpisode}集
              {props.episodeCount ? ` / 共${props.episodeCount}集` : ""}
            </span>
          </div>
          <div className="mt-3 text-sm text-gray-600 space-y-1">
            {props.studio && <p>制作公司：{props.studio}</p>}
            {props.director && <p>监督：{props.director}</p>}
          </div>
        </div>
      </div>

      {props.synopsis && (
        <div>
          <h2 className="text-lg font-semibold mb-2">简介</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{props.synopsis}</p>
        </div>
      )}

      {props.characters.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">角色</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {props.characters.map((ch) => (
              <div key={ch.id} className="flex-shrink-0 w-24 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full overflow-hidden">
                  {ch.avatar ? (
                    <img src={ch.avatar} alt={ch.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
                  )}
                </div>
                <p className="text-xs font-medium mt-1 truncate">{ch.name}</p>
                <p className="text-xs text-gray-400 truncate">{ch.cv || ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 播放源组件**

写入 `src/components/anime/PlaySource.tsx`:
```tsx
import Link from "next/link";

interface PlaySource {
  id: string;
  sourceName: string;
  url: string;
  type: string;
  episodeNum: number | null;
}

export function PlaySource({ sources }: { sources: PlaySource[] }) {
  if (sources.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-2">播放源</h2>
        <p className="text-sm text-gray-400">暂无播放源</p>
      </div>
    );
  }

  const embedded = sources.filter((s) => s.type === "iframe");
  const external = sources.filter((s) => s.type === "redirect");

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">播放源</h2>

      {embedded.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">站内播放</p>
          <div className="space-y-1">
            {embedded.map((s) => (
              <div key={s.id} className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={s.url}
                  className="w-full h-full"
                  allowFullScreen
                  title={`Episode ${s.episodeNum || ""}`}
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {external.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-1">外部链接</p>
          <div className="flex gap-2">
            {external.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100"
              >
                前往{s.sourceName}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 写番剧详情页**

写入 `src/app/anime/[id]/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AnimeInfo } from "@/components/anime/AnimeInfo";
import { PlaySource } from "@/components/anime/PlaySource";
import { RatingPanel } from "@/components/anime/RatingPanel";
import { RatingChart } from "@/components/anime/RatingChart";
import { auth } from "@/lib/auth";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function AnimeDetailPage({ params }: Props) {
  const session = await auth();
  const anime = await db.anime.findUnique({
    where: { id: params.id },
    include: {
      characters: true,
      playSources: { where: { isAvailable: true } },
      userRatings: { select: { rating: true, recommend: true } },
    },
  });

  if (!anime) notFound();

  const ratingCount = anime.userRatings.length;
  const avgRating =
    ratingCount > 0
      ? anime.userRatings.reduce((sum, r) => sum + r.rating, 0) / ratingCount
      : 0;
  const recommendCount = anime.userRatings.filter((r) => r.recommend === "recommend").length;
  const recommendRate = ratingCount > 0 ? Math.round((recommendCount / ratingCount) * 100) : 0;

  const starDistribution = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => ({
    star,
    count: anime.userRatings.filter((r) => Math.abs(r.rating - star) < 0.25).length,
  }));

  return (
    <div className="space-y-8">
      <AnimeInfo {...anime} avgRating={avgRating} ratingCount={ratingCount} recommendRate={recommendRate} />

      <PlaySource sources={anime.playSources} />

      <RatingPanel animeId={anime.id} userId={session?.user?.id} />

      <RatingChart distribution={starDistribution} totalCount={ratingCount} recommendRate={recommendRate} />

      <div className="border-t pt-4">
        <Link
          href={`/forum/${anime.id}`}
          className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
        >
          进入百家小坛
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /d/anime-tracker/web
git add src/app/anime/ src/components/anime/
git commit -m "feat: implement anime detail page with info, play sources, and forum link"
```

---

### Task 4.2: 实现评分组件

**Files:**
- Create: `D:\anime-tracker\web\src\components\anime\RatingStars.tsx`
- Create: `D:\anime-tracker\web\src\components\anime\RatingPanel.tsx`
- Create: `D:\anime-tracker\web\src\components\anime\RatingChart.tsx`
- Create: `D:\anime-tracker\web\src\app\api\ratings\route.ts`
- Create: `D:\anime-tracker\web\src\app\api\follow\route.ts`
- Create: `D:\anime-tracker\web\src\app\api\progress\route.ts`

- [ ] **Step 1: 星星交互组件**

写入 `src/components/anime/RatingStars.tsx`:
```tsx
"use client";

import { useState } from "react";

interface RatingStarsProps {
  value: number;
  onChange: (value: number) => void;
}

export function RatingStars({ value, onChange }: RatingStarsProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHover(0)}>
      {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => {
        const isHalf = star % 1 !== 0;
        const filled = (hover || value) >= star;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            className={`text-xl ${isHalf ? "w-3 overflow-hidden" : ""} ${
              filled ? "text-yellow-400" : "text-gray-300"
            } hover:scale-110 transition-transform`}
            title={`${star} 星`}
          >
            {isHalf ? "★" : "★"}
          </button>
        );
      })}
      <span className="ml-2 text-sm text-gray-500">
        {hover || value || "未评分"}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: 评分面板组件（五星 + 标签 + 推荐一次提交）**

写入 `src/components/anime/RatingPanel.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RatingStars } from "./RatingStars";

const TAGS = ["神作", "佳作", "还行", "劣作", "治愈", "致郁", "热血", "搞笑", "感动", "悬疑", "日常"];

interface RatingPanelProps {
  animeId: string;
  userId?: string;
}

export function RatingPanel({ animeId, userId }: RatingPanelProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm text-gray-500">请登录后评分</p>
      </div>
    );
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getRecommend = (star: number) => {
    if (star >= 4) return "recommend";
    if (star >= 3) return "neutral";
    if (star > 0) return "not_recommend";
    return "";
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        animeId,
        rating,
        tags: selectedTags,
        recommend: getRecommend(rating),
      }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="text-lg font-semibold">我的评分</h3>
      <RatingStars value={rating} onChange={setRating} />
      <div>
        <p className="text-sm text-gray-500 mb-1">标签（可选）</p>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-2 py-0.5 text-xs rounded-full border ${
                selectedTags.includes(tag)
                  ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                  : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      {rating > 0 && (
        <p className="text-xs text-gray-400">
          推荐：{getRecommend(rating) === "recommend" ? "推荐" : getRecommend(rating) === "neutral" ? "一般" : "不推荐"}
          （根据星级自动判定）
        </p>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "提交中..." : "提交评分"}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: 星级分布图组件**

写入 `src/components/anime/RatingChart.tsx`:
```tsx
interface StarBar {
  star: number;
  count: number;
}

export function RatingChart({ distribution, totalCount, recommendRate }: {
  distribution: StarBar[];
  totalCount: number;
  recommendRate: number;
}) {
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="text-lg font-semibold">社区评分分布</h3>
      <div className="mb-2">
        <span className="text-2xl font-bold text-indigo-600">{recommendRate}%</span>
        <span className="text-sm text-gray-500 ml-1">的用户推荐</span>
      </div>
      <div className="space-y-1">
        {distribution.reverse().map((d) => (
          <div key={d.star} className="flex items-center gap-2 text-xs">
            <span className="w-8 text-right text-gray-500">{d.star}★</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: totalCount > 0 ? `${(d.count / maxCount) * 100}%` : "0%" }}
              />
            </div>
            <span className="w-8 text-gray-400">{d.count}</span>
          </div>
        ))}
      </div>
      {totalCount > 0 && (
        <p className="text-xs text-gray-400">共 {totalCount} 人评分</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 评分 API Route**

写入 `src/app/api/ratings/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { animeId, rating, tags, recommend } = await req.json();

  if (!animeId || typeof rating !== "number" || rating < 0.5 || rating > 5) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await db.userRating.upsert({
    where: { animeId_userId: { animeId, userId: session.user.id } },
    update: { rating, tags: tags || [], recommend },
    create: { animeId, userId: session.user.id, rating, tags: tags || [], recommend },
  });

  return NextResponse.json(result);
}
```

- [ ] **Step 5: 追番 API Route**

写入 `src/app/api/follow/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { animeId } = await req.json();
  if (!animeId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const existing = await db.userFollow.findUnique({
    where: { userId_animeId: { userId: session.user.id, animeId } },
  });

  if (existing) {
    await db.userFollow.delete({ where: { id: existing.id } });
    return NextResponse.json({ followed: false });
  }

  await db.userFollow.create({
    data: { userId: session.user.id, animeId },
  });

  return NextResponse.json({ followed: true });
}
```

- [ ] **Step 6: 观看进度 API Route（含自动追踪）**

写入 `src/app/api/progress/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { animeId, episode, isAuto } = await req.json();

  if (!animeId || typeof episode !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await db.userWatchProgress.upsert({
    where: { userId_animeId: { userId: session.user.id, animeId } },
    update: {
      currentEpisode: episode,
      isAuto: isAuto ?? false,
      status: "watching",
    },
    create: {
      userId: session.user.id,
      animeId,
      currentEpisode: episode,
      isAuto: isAuto ?? false,
      status: "watching",
    },
  });

  return NextResponse.json(result);
}
```

- [ ] **Step 7: Commit**

```bash
cd /d/anime-tracker/web
git add src/components/anime/RatingStars.tsx src/components/anime/RatingPanel.tsx src/components/anime/RatingChart.tsx src/app/api/ratings/ src/app/api/follow/ src/app/api/progress/
git commit -m "feat: add rating panel with stars, tags, recommend and follow/progress APIs"
```

---

### Task 4.3: 追番按钮、进度标记与自动追踪

**Files:**
- Create: `D:\anime-tracker\web\src\components\anime\FollowButton.tsx`
- Create: `D:\anime-tracker\web\src\components\anime\ProgressMarker.tsx`
- Modify: `D:\anime-tracker\web\src\components\anime\PlaySource.tsx`
- Modify: `D:\anime-tracker\web\src\app\anime\[id]\page.tsx`

- [ ] **Step 1: 创建追番按钮组件**

写入 `src/components/anime/FollowButton.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FollowButton({ animeId, userId }: { animeId: string; userId?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!userId) return null;

  const handleToggle = async () => {
    setLoading(true);
    await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="px-4 py-2 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50"
    >
      {loading ? "..." : "追番"}
    </button>
  );
}
```

- [ ] **Step 2: 创建进度标记组件**

写入 `src/components/anime/ProgressMarker.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProgressMarker({ animeId, userId, totalEpisodes }: {
  animeId: string;
  userId?: string;
  totalEpisodes: number;
}) {
  const [episode, setEpisode] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!userId) return null;

  const handleMark = async () => {
    if (episode < 1 || episode > totalEpisodes) return;
    setLoading(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, episode, isAuto: false }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={episode}
        onChange={(e) => setEpisode(parseInt(e.target.value))}
        className="px-2 py-1.5 text-sm border rounded-md"
      >
        <option value={0}>标记进度</option>
        {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>第{n}集</option>
        ))}
      </select>
      <button
        onClick={handleMark}
        disabled={loading || episode === 0}
        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
      >
        {loading ? "..." : "标记"}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: 更新 PlaySource 添加自动追踪**

修改 `src/components/anime/PlaySource.tsx`，在文件顶部添加 `"use client"` 指令，在组件内添加追踪函数：

替换组件签名为:
```tsx
"use client";

interface PlaySourceItem {
  id: string;
  sourceName: string;
  url: string;
  type: string;
  episodeNum: number | null;
}

export function PlaySource({ sources, animeId }: { sources: PlaySourceItem[]; animeId: string }) {
  const trackView = (episodeNum: number | null) => {
    if (!episodeNum) return;
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, episode: episodeNum, isAuto: true }),
    });
  };

  // ... 其余渲染代码保持不变，但在 iframe 上添加:
  // onLoad={() => trackView(s.episodeNum)}
  // 在外部链接 a 标签上添加:
  // onClick={() => trackView(s.episodeNum)}
```

- [ ] **Step 4: 更新详情页引入新组件**

编辑 `src/app/anime/[id]/page.tsx`，在 `<PlaySource .../>` 之后插入操作按钮区：

```tsx
import { FollowButton } from "@/components/anime/FollowButton";
import { ProgressMarker } from "@/components/anime/ProgressMarker";

// 在 <PlaySource sources={anime.playSources} animeId={anime.id} /> 之后:
<div className="flex items-center gap-3 mt-4">
  <FollowButton animeId={anime.id} userId={session?.user?.id} />
  <ProgressMarker
    animeId={anime.id}
    userId={session?.user?.id}
    totalEpisodes={anime.episodeCount || anime.currentEpisode}
  />
</div>
```

- [ ] **Step 5: Commit**

```bash
cd /d/anime-tracker/web
git add src/components/anime/FollowButton.tsx src/components/anime/ProgressMarker.tsx src/components/anime/PlaySource.tsx src/app/anime/
git commit -m "feat: add follow button, progress marker, and auto-tracking on play"
```

---

## Phase 5: 新番排行

### Task 5.1: 实现榜单计算逻辑

**Files:**
- Create: `D:\anime-tracker\web\src\lib\rankings.ts`

- [ ] **Step 1: 创建榜单计算模块**

写入 `src/lib/rankings.ts`:
```typescript
import { db } from "./db";

interface RankingItem {
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  score: number;
  breakdown: Record<string, number>;
}

export async function calculateHeatRanking(): Promise<RankingItem[]> {
  const animeList = await db.anime.findMany({
    include: { rankings: { orderBy: { calculatedAt: "desc" }, take: 1 } },
  });

  const results = animeList.map((anime) => {
    const raw = anime.rankings[0]?.rawData as Record<string, any> | null;

    const bilibiliHeat = raw?.bilibili?.total_views
      ? normalizeComponent(
          raw.bilibili.total_views * 0.3 +
            (raw.bilibili.total_likes || 0) * 0.15 +
            (raw.bilibili.total_coins || 0) * 0.15 +
            (raw.bilibili.total_favorites || 0) * 0.15 +
            (raw.bilibili.total_comments || 0) * 0.1 +
            (raw.bilibili.total_danmakus || 0) * 0.1 +
            (raw.bilibili.total_shares || 0) * 0.05,
          1000000
        )
      : 0;

    const douyinHeat = raw?.douyin?.topic_views
      ? normalizeComponent(raw.douyin.topic_views, 10000000)
      : 0;

    const bangumiHeat = raw?.bangumi?.discussion_count
      ? normalizeComponent(raw.bangumi.discussion_count + (raw.bangumi.comment_count || 0), 1000)
      : 0;

    const doubanHeat = raw?.douban?.comments_count
      ? normalizeComponent(raw.douban.comments_count + (raw.douban.reviews_count || 0), 1000)
      : 0;

    const score = bilibiliHeat * 0.40 + douyinHeat * 0.22 + bangumiHeat * 0.20 + doubanHeat * 0.18;

    return {
      id: anime.id,
      title: anime.title,
      titleJp: anime.titleJp,
      cover: anime.cover,
      score: Math.round(score * 100),
      breakdown: { bilibili: bilibiliHeat, douyin: douyinHeat, bangumi: bangumiHeat, douban: doubanHeat },
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

export async function calculateScoreRanking(): Promise<RankingItem[]> {
  const animeList = await db.anime.findMany({
    include: {
      rankings: { orderBy: { calculatedAt: "desc" }, take: 1 },
      userRatings: { select: { rating: true } },
    },
  });

  const results = animeList.map((anime) => {
    const raw = anime.rankings[0]?.rawData as Record<string, any> | null;

    const bangumiScore = raw?.bangumi?.score || 0;
    const bangumiCount = raw?.bangumi?.score_count || 0;
    const doubanScore = (raw?.douban?.score || 0) * 2;
    const doubanCount = raw?.douban?.score_count || 0;
    const bilibiliScore = (raw?.bilibili?.score || 0) * 2;

    const siteRatings = anime.userRatings;
    const siteScore =
      siteRatings.length > 0
        ? (siteRatings.reduce((s, r) => s + r.rating, 0) / siteRatings.length) * 2
        : 0;

    const totalCount = bangumiCount + doubanCount;
    if (bangumiCount < 50 && totalCount > 0) {
      const bangumiWeight = 0.55 * (bangumiCount / totalCount);
      const doubanWeight = 0.20 + (0.55 - bangumiWeight);
      const score =
        bangumiScore * bangumiWeight +
        doubanScore * doubanWeight +
        bilibiliScore * 0.10 +
        siteScore * 0.15;
      return {
        id: anime.id,
        title: anime.title,
        titleJp: anime.titleJp,
        cover: anime.cover,
        score: Math.round(score * 10) / 10,
        breakdown: { bangumi: bangumiScore, douban: doubanScore, bilibili: bilibiliScore, site: siteScore },
      };
    }

    const score =
      bangumiScore * 0.55 + doubanScore * 0.20 + bilibiliScore * 0.10 + siteScore * 0.15;

    return {
      id: anime.id,
      title: anime.title,
      titleJp: anime.titleJp,
      cover: anime.cover,
      score: Math.round(score * 10) / 10,
      breakdown: { bangumi: bangumiScore, douban: doubanScore, bilibili: bilibiliScore, site: siteScore },
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

function normalizeComponent(value: number, scale: number): number {
  if (value <= 0) return 0;
  return Math.min(value / scale, 100);
}
```

- [ ] **Step 2: Commit**

```bash
cd /d/anime-tracker/web
git add src/lib/rankings.ts
git commit -m "feat: implement heat and score ranking calculation logic"
```

---

### Task 5.2: 实现排行页面与组件

**Files:**
- Create: `D:\anime-tracker\web\src\app\api\rankings\route.ts`
- Create: `D:\anime-tracker\web\src\app\rankings\page.tsx`
- Create: `D:\anime-tracker\web\src\components\ranking\RankingTabs.tsx`
- Create: `D:\anime-tracker\web\src\components\ranking\RankingList.tsx`
- Create: `D:\anime-tracker\web\src\components\ranking\RankingItem.tsx`

- [ ] **Step 1: 榜单 API**

写入 `src/app/api/rankings/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { calculateHeatRanking, calculateScoreRanking } from "@/lib/rankings";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "heat";

  let data;
  switch (type) {
    case "heat":
      data = await calculateHeatRanking();
      break;
    case "score":
      data = await calculateScoreRanking();
      break;
    default:
      data = await calculateHeatRanking();
  }

  return NextResponse.json({
    type,
    updatedAt: new Date().toISOString(),
    items: data,
  });
}
```

- [ ] **Step 2: 排名条目组件**

写入 `src/components/ranking/RankingItem.tsx`:
```tsx
import Link from "next/link";

interface RankingItemProps {
  rank: number;
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  score: number;
  breakdown: Record<string, number>;
}

export function RankingItem({ rank, id, title, titleJp, cover, score, breakdown }: RankingItemProps) {
  return (
    <Link href={`/anime/${id}`} className="block">
      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
        <span className={`w-8 text-center font-bold text-lg ${
          rank <= 3 ? "text-indigo-600" : "text-gray-400"
        }`}>
          {rank}
        </span>
        <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          {cover ? (
            <img src={cover} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-400 truncate">{titleJp || ""}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-gray-900">{typeof score === "number" && score % 1 !== 0 ? score.toFixed(1) : score}</span>
          <div className="flex gap-1 text-xs text-gray-400">
            {Object.entries(breakdown).map(([key, val]) => (
              <span key={key} title={key}>
                {key}: {typeof val === "number" && val % 1 !== 0 ? val.toFixed(1) : val}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: 排行榜列表组件**

写入 `src/components/ranking/RankingList.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { RankingItem } from "./RankingItem";

export function RankingList({ type }: { type: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/rankings?type=${type}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);
        setUpdatedAt(data.updatedAt);
      })
      .finally(() => setLoading(false));
  }, [type]);

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">加载中...</p>;
  }

  return (
    <div>
      <div className="text-xs text-gray-400 mb-2">
        外部数据更新：{updatedAt ? new Date(updatedAt).toLocaleString("zh-CN") : "—"}（每12小时）
        {" · "}站内数据：准实时
      </div>
      <div className="divide-y">
        {items.map((item, i) => (
          <RankingItem key={item.id} rank={i + 1} {...item} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 榜单Tab切换组件**

写入 `src/components/ranking/RankingTabs.tsx`:
```tsx
"use client";

import { useState } from "react";
import { RankingList } from "./RankingList";

const TABS = [
  { key: "heat", label: "热度榜" },
  { key: "score", label: "评分榜" },
];

export function RankingTabs() {
  const [active, setActive] = useState("heat");

  return (
    <div>
      <div className="flex gap-2 mb-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              active === tab.key
                ? "border-indigo-600 text-indigo-600 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <RankingList type={active} />
    </div>
  );
}
```

- [ ] **Step 5: 排行页面**

写入 `src/app/rankings/page.tsx`:
```tsx
import { RankingTabs } from "@/components/ranking/RankingTabs";

export default function RankingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新番排行</h1>
      <RankingTabs />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
cd /d/anime-tracker/web
git add src/app/rankings/ src/components/ranking/ src/app/api/rankings/
git commit -m "feat: implement ranking page with heat and score tabs"
```

---

### Task 5.3: 补充播放量榜 / 追更率榜 / 角色人气榜

**Files:**
- Modify: `D:\anime-tracker\web\src\lib\rankings.ts`
- Modify: `D:\anime-tracker\web\src\app\api\rankings\route.ts`
- Modify: `D:\anime-tracker\web\src\components\ranking\RankingTabs.tsx`

- [ ] **Step 1: 在 rankings.ts 添加播放量榜计算**

在 `src/lib/rankings.ts` 末尾追加:

```typescript
export async function calculateViewRanking(): Promise<RankingItem[]> {
  const animeList = await db.anime.findMany({
    include: {
      rankings: { orderBy: { calculatedAt: "desc" }, take: 1 },
      watchProgress: { select: { currentEpisode: true } },
      userFollows: { select: { id: true } },
    },
  });

  const results = animeList.map((anime) => {
    const raw = anime.rankings[0]?.rawData as Record<string, any> | null;

    const siteViews = anime.watchProgress.reduce((s, p) => s + p.currentEpisode, 0);
    const siteFollows = anime.userFollows.length;
    const bilibiliViews = getBilibiliViewProxy(raw);
    const bangumiWatching = raw?.bangumi?.watching_count || 0;
    const doubanWishing = raw?.douban?.wish_count || 0;

    const hasCopyright = (raw?.bilibili?.views || 0) > 0;
    let siteWeight = 0.40, biliWeight = 0.30, banguWeight = 0.18, doubanWeight = 0.12;
    if (!hasCopyright) {
      siteWeight = 0.55; biliWeight = 0; banguWeight = 0.28; doubanWeight = 0.17;
    }

    const score =
      normalizeComponent(siteViews + siteFollows * 10, 5000) * siteWeight +
      normalizeComponent(bilibiliViews, 10000000) * biliWeight +
      normalizeComponent(bangumiWatching, 5000) * banguWeight +
      normalizeComponent(doubanWishing, 5000) * doubanWeight;

    return {
      id: anime.id, title: anime.title, titleJp: anime.titleJp, cover: anime.cover,
      score: Math.round(score * 100),
      breakdown: { site: siteViews, bilibili: bilibiliViews, bangumi: bangumiWatching, douban: doubanWishing },
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

function getBilibiliViewProxy(raw: Record<string, any> | null): number {
  return raw?.bilibili?.views || 0;
}

export async function calculateRetentionRanking(): Promise<RankingItem[]> {
  const animeList = await db.anime.findMany({
    include: {
      watchProgress: { select: { currentEpisode: true } },
    },
  });

  const results = animeList.map((anime) => {
    const total = anime.watchProgress.length;
    if (total < 50) {
      return { id: anime.id, title: anime.title, titleJp: anime.titleJp, cover: anime.cover, score: 0, breakdown: {} };
    }

    const sawLatest = anime.watchProgress.filter((p) => p.currentEpisode >= anime.currentEpisode).length;
    const retentionRate = (sawLatest / total) * 100;

    return {
      id: anime.id, title: anime.title, titleJp: anime.titleJp, cover: anime.cover,
      score: Math.round(retentionRate * 10) / 10,
      breakdown: { total: total, sawLatest: sawLatest, rate: Math.round(retentionRate) },
    };
  });

  return results.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
}

export async function calculateCharacterRanking(): Promise<RankingItem[]> {
  const characters = await db.character.findMany({
    include: { anime: { select: { id: true, title: true, cover: true } } },
    orderBy: { characterScore: "desc" },
    take: 50,
  });

  return characters.map((ch) => ({
    id: ch.anime.id,
    title: `${ch.name} (${ch.anime.title})`,
    titleJp: ch.nameJp,
    cover: ch.avatar || ch.anime.cover,
    score: ch.characterScore || 0,
    breakdown: { character: ch.name },
  }));
}
```

- [ ] **Step 2: 更新 rankings API 支持新榜单类型**

修改 `src/app/api/rankings/route.ts` 中的 switch:

```typescript
import { calculateHeatRanking, calculateScoreRanking, calculateViewRanking, calculateRetentionRanking, calculateCharacterRanking } from "@/lib/rankings";

// 在 switch 中新增:
case "view":
  data = await calculateViewRanking();
  break;
case "retention":
  data = await calculateRetentionRanking();
  break;
case "character":
  data = await calculateCharacterRanking();
  break;
```

- [ ] **Step 3: 更新 RankingTabs 显示全部五个榜单**

修改 `src/components/ranking/RankingTabs.tsx`:

```tsx
const TABS = [
  { key: "heat", label: "热度榜" },
  { key: "score", label: "评分榜" },
  { key: "view", label: "播放量榜" },
  { key: "retention", label: "追更率榜" },
  { key: "character", label: "角色人气榜" },
];
```

- [ ] **Step 4: Commit**

```bash
cd /d/anime-tracker/web
git add src/lib/rankings.ts src/app/api/rankings/ src/components/ranking/
git commit -m "feat: add view, retention, and character ranking calculations"
```

---

## Phase 6: 百家小坛

### Task 6.1: 实现论坛页面和发帖回帖

**Files:**
- Create: `D:\anime-tracker\web\src\app\forum\[animeId]\page.tsx`
- Create: `D:\anime-tracker\web\src\components\forum\PostList.tsx`
- Create: `D:\anime-tracker\web\src\components\forum\PostItem.tsx`
- Create: `D:\anime-tracker\web\src\components\forum\PostForm.tsx`
- Create: `D:\anime-tracker\web\src\components\forum\ReplyForm.tsx`
- Create: `D:\anime-tracker\web\src\app\api\posts\route.ts`
- Create: `D:\anime-tracker\web\src\app\api\posts\[id]\route.ts`
- Create: `D:\anime-tracker\web\src\lib\auto-tag.ts`

- [ ] **Step 1: 自动标签工具函数**

写入 `src/lib/auto-tag.ts`:
```typescript
const TAG_RULES: { pattern: RegExp; tag: string }[] = [
  { pattern: /剧情|情节|故事|发展|走向/, tag: "剧情讨论" },
  { pattern: /情报|消息|剧透|预告|PV|CM|新视觉/, tag: "情报搬运" },
  { pattern: /同人|二创|COS|cos|插画|手绘|图透|绘画|MMD/, tag: "二创分享" },
  { pattern: /资源|下载|网盘|链接|磁力/, tag: "资源交流" },
  { pattern: /评分|打几分|怎么样|推荐|烂|神|雷|垃圾/, tag: "评分吐槽" },
  { pattern: /声优|CV|配音|角色|人设/, tag: "声优角色" },
];

export function autoTag(content: string): string[] {
  const tags = new Set<string>();
  for (const rule of TAG_RULES) {
    if (rule.pattern.test(content)) {
      tags.add(rule.tag);
    }
  }
  return tags.size > 0 ? Array.from(tags) : ["综合讨论"];
}
```

- [ ] **Step 2: 发帖 API**

写入 `src/app/api/posts/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { autoTag } from "@/lib/auto-tag";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { animeId, title, content } = await req.json();

  if (!animeId || !title || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (title.length > 100 || content.length > 10000) {
    return NextResponse.json({ error: "Content too long" }, { status: 400 });
  }

  const tags = autoTag(title + " " + content);

  const post = await db.forumPost.create({
    data: {
      animeId,
      userId: session.user.id,
      title,
      content,
      autoTags: tags,
    },
  });

  return NextResponse.json(post);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const animeId = searchParams.get("animeId");
  const sort = searchParams.get("sort") || "latest";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 20;

  if (!animeId) {
    return NextResponse.json({ error: "animeId required" }, { status: 400 });
  }

  const orderBy =
    sort === "hot"
      ? { replies: { _count: "desc" as const } }
      : { createdAt: "desc" as const };

  const posts = await db.forumPost.findMany({
    where: { animeId },
    include: {
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { replies: true } },
    },
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const total = await db.forumPost.count({ where: { animeId } });

  return NextResponse.json({ posts, total, page, pageSize });
}
```

- [ ] **Step 3: 回帖 API**

写入 `src/app/api/posts/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content || content.length > 5000) {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  const post = await db.forumPost.findUnique({ where: { id: params.id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const reply = await db.forumReply.create({
    data: {
      postId: params.id,
      userId: session.user.id,
      content,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(reply);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const post = await db.forumPost.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}
```

- [ ] **Step 4: 帖子列表组件**

写入 `src/components/forum/PostList.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PostForm } from "./PostForm";

interface Post {
  id: string;
  title: string;
  content: string;
  autoTags: string[];
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
  _count: { replies: number };
}

export function PostList({ animeId }: { animeId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<"latest" | "hot">("latest");
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    setLoading(true);
    fetch(`/api/posts?animeId=${animeId}&sort=${sort}`)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, [sort]);

  return (
    <div>
      <PostForm animeId={animeId} onPosted={fetchPosts} />

      <div className="flex gap-2 mb-4 mt-6">
        <button
          onClick={() => setSort("latest")}
          className={`px-3 py-1 text-sm rounded ${sort === "latest" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}
        >
          最新回复
        </button>
        <button
          onClick={() => setSort("hot")}
          className={`px-3 py-1 text-sm rounded ${sort === "hot" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}
        >
          热门帖子
        </button>
      </div>

      {loading && <p className="text-sm text-gray-400 text-center py-8">加载中...</p>}

      {!loading && posts.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">还没有帖子，来发第一个吧</p>
      )}

      <div className="space-y-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/forum/${animeId}?post=${post.id}`} className="block border rounded-lg p-3 hover:border-indigo-200 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{post.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.content}</p>
              </div>
              <span className="text-xs text-gray-400 ml-2">{post._count.replies}回复</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {Array.isArray(post.autoTags) && post.autoTags.map((tag: string) => (
                <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{tag}</span>
              ))}
              <span className="text-xs text-gray-400 ml-auto">{new Date(post.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 发帖表单组件**

写入 `src/components/forum/PostForm.tsx`:
```tsx
"use client";

import { useState } from "react";

export function PostForm({ animeId, onPosted }: { animeId: string; onPosted: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, title: title.trim(), content: content.trim() }),
    });
    setTitle("");
    setContent("");
    setLoading(false);
    onPosted();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded-lg">
      <input
        type="text"
        placeholder="帖子标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
        maxLength={100}
        required
      />
      <textarea
        placeholder="帖子内容（纯文字）"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        maxLength={10000}
        required
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{content.length}/10000</span>
        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "发布中..." : "发布帖子"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 6: 回帖表单组件**

写入 `src/components/forum/ReplyForm.tsx`:
```tsx
"use client";

import { useState } from "react";

export function ReplyForm({ postId, onReplied }: { postId: string; onReplied: () => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await fetch(`/api/posts/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    });
    setContent("");
    setLoading(false);
    onReplied();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        placeholder="写回复..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        maxLength={5000}
        required
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "回复中..." : "回复"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 7: 论坛页面**

写入 `src/app/forum/[animeId]/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PostList } from "@/components/forum/PostList";
import Link from "next/link";

interface Props {
  params: { animeId: string };
}

export default async function ForumPage({ params }: Props) {
  const anime = await db.anime.findUnique({
    where: { id: params.animeId },
    select: { id: true, title: true },
  });

  if (!anime) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/anime/${anime.id}`} className="text-sm text-gray-500 hover:text-indigo-600">
          ← 返回新番影院
        </Link>
        <h1 className="text-xl font-bold">{anime.title} — 百家小坛</h1>
      </div>
      <PostList animeId={anime.id} />
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
cd /d/anime-tracker/web
git add src/app/forum/ src/components/forum/ src/app/api/posts/ src/lib/auto-tag.ts
git commit -m "feat: implement forum with posts, replies, and auto-tagging"
```

---

## Phase 7: 我的追番

### Task 7.1: 实现个人中心页面

**Files:**
- Create: `D:\anime-tracker\web\src\app\my\page.tsx`
- Create: `D:\anime-tracker\web\src\components\my\FollowList.tsx`
- Create: `D:\anime-tracker\web\src\components\my\RatingHistory.tsx`

- [ ] **Step 1: 追番列表组件**

写入 `src/components/my/FollowList.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FollowItem {
  id: string;
  anime: {
    id: string;
    title: string;
    titleJp: string | null;
    cover: string | null;
    currentEpisode: number;
    broadcastDay: string | null;
  };
  progress: {
    currentEpisode: number;
  } | null;
}

const DAY_LABEL: Record<string, string> = {
  MONDAY: "周一", TUESDAY: "周二", WEDNESDAY: "周三",
  THURSDAY: "周四", FRIDAY: "周五", SATURDAY: "周六", SUNDAY: "周日",
};

const TODAY = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

export function FollowList() {
  const [follows, setFollows] = useState<FollowItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/follow")
      .then((r) => r.json())
      .then((data) => setFollows(data.follows || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400 py-4">加载中...</p>;
  }

  if (follows.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">还没有追番，去追番日历看看吧</p>
        <Link href="/" className="text-sm text-indigo-600 mt-2 inline-block">前往追番日历</Link>
      </div>
    );
  }

  const todayFollows = follows.filter((f) => f.anime.broadcastDay === TODAY);

  return (
    <div className="space-y-6">
      {todayFollows.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            今日更新 <span className="text-sm font-normal text-indigo-600">({todayFollows.length}部)</span>
          </h3>
          <div className="space-y-2">
            {todayFollows.map((f) => (
              <Link key={f.id} href={`/anime/${f.anime.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all">
                <div className="w-10 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {f.anime.cover ? <img src={f.anime.cover} className="w-full h-full object-cover" alt="" /> : null}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{f.anime.title}</p>
                  <p className="text-xs text-gray-500">
                    已看{f.progress?.currentEpisode || 0}集 / 共{f.anime.currentEpisode}集
                  </p>
                </div>
                <span className="text-xs text-indigo-600 font-medium">今天</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">全部追番</h3>
        <div className="space-y-2">
          {follows.map((f) => (
            <Link key={f.id} href={`/anime/${f.anime.id}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {f.anime.cover ? <img src={f.anime.cover} className="w-full h-full object-cover" alt="" /> : null}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{f.anime.title}</p>
                <p className="text-xs text-gray-500">
                  已看{f.progress?.currentEpisode || 0}集 / 共{f.anime.currentEpisode}集
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {f.anime.broadcastDay ? DAY_LABEL[f.anime.broadcastDay] || "" : ""}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 评分历史组件**

写入 `src/components/my/RatingHistory.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RatingStars } from "@/components/anime/RatingStars";

interface RatingItem {
  id: string;
  animeId: string;
  rating: number;
  tags: string[];
  recommend: string;
  createdAt: string;
  anime: {
    title: string;
    cover: string | null;
  };
}

export function RatingHistory() {
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ratings")
      .then((r) => r.json())
      .then((data) => setRatings(data.ratings || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400 py-4">加载中...</p>;
  }

  if (ratings.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">还没有评分记录</p>;
  }

  return (
    <div className="space-y-3">
      {ratings.map((r) => (
        <Link key={r.id} href={`/anime/${r.animeId}`}
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
          <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {r.anime.cover ? <img src={r.anime.cover} className="w-full h-full object-cover" alt="" /> : null}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{r.anime.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-yellow-500 text-sm">{r.rating}★</span>
              {Array.isArray(r.tags) && r.tags.map((tag: string) => (
                <span key={tag} className="text-xs text-gray-400">{tag}</span>
              ))}
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {r.recommend === "recommend" ? "推荐" : r.recommend === "neutral" ? "一般" : "不推荐"}
          </span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 我的追番页面**

写入 `src/app/my/page.tsx`:
```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FollowList } from "@/components/my/FollowList";
import { RatingHistory } from "@/components/my/RatingHistory";

export default async function MyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">我的追番</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4">追番列表</h2>
        <FollowList />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">我的评分</h2>
        <RatingHistory />
      </section>
    </div>
  );
}
```

- [ ] **Step 4: 更新追番 API 支持 GET**

修改 `src/app/api/follow/route.ts`，添加 GET handler:

```typescript
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ follows: [] });
  }

  const follows = await db.userFollow.findMany({
    where: { userId: session.user.id },
    include: {
      anime: {
        select: {
          id: true,
          title: true,
          titleJp: true,
          cover: true,
          currentEpisode: true,
          broadcastDay: true,
        },
      },
    },
  });

  const withProgress = await Promise.all(
    follows.map(async (f) => {
      const progress = await db.userWatchProgress.findUnique({
        where: { userId_animeId: { userId: session.user.id, animeId: f.animeId } },
        select: { currentEpisode: true },
      });
      return { ...f, progress };
    })
  );

  follows.sort((a, b) => {
    const dayOrder = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
    return dayOrder.indexOf(a.anime.broadcastDay || "SUNDAY") - dayOrder.indexOf(b.anime.broadcastDay || "SUNDAY");
  });

  return NextResponse.json({ follows });
}
```

- [ ] **Step 5: 更新评分 API 支持 GET**

修改 `src/app/api/ratings/route.ts`，添加 GET handler:

```typescript
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ratings: [] });
  }

  const ratings = await db.userRating.findMany({
    where: { userId: session.user.id },
    include: {
      anime: { select: { title: true, cover: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ratings });
}
```

- [ ] **Step 6: Commit**

```bash
cd /d/anime-tracker/web
git add src/app/my/ src/components/my/ src/app/api/follow/ src/app/api/ratings/
git commit -m "feat: implement my watchlist with follows and rating history"
```

---

## Phase 8: 种子数据与最后整合

### Task 8.1: 创建种子数据脚本

**Files:**
- Create: `D:\anime-tracker\web\prisma\seed.ts`

- [ ] **Step 1: 创建种子数据脚本**

写入 `prisma/seed.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const spring2026 = [
    {
      title: "鬼灭之刃 无限城篇",
      titleJp: "鬼滅の刃 無限城編",
      season: "SPRING" as const,
      year: 2026,
      broadcastDay: "SATURDAY" as const,
      broadcastTime: "23:00",
      episodeCount: 13,
      currentEpisode: 1,
      studio: "ufotable",
      isMovie: false,
      synopsis: "鬼灭之刃无限城篇...",
    },
    {
      title: "葬送的芙莉莲 第二季",
      titleJp: "葬送のフリーレン 第2期",
      season: "SPRING" as const,
      year: 2026,
      broadcastDay: "FRIDAY" as const,
      broadcastTime: "23:00",
      episodeCount: 24,
      currentEpisode: 1,
      studio: "MADHOUSE",
      isMovie: false,
      synopsis: "葬送的芙莉莲第二季...",
    },
    {
      title: "某科学的超电磁炮 第四季",
      titleJp: "とある科学の超電磁砲T 第4期",
      season: "SPRING" as const,
      year: 2026,
      broadcastDay: "THURSDAY" as const,
      broadcastTime: "24:30",
      episodeCount: 24,
      currentEpisode: 1,
      studio: "J.C.STAFF",
      isMovie: false,
      synopsis: "超电磁炮第四季...",
    },
  ];

  for (const anime of spring2026) {
    const created = await db.anime.upsert({
      where: { id: anime.title },
      update: {},
      create: {
        ...anime,
        id: undefined,
      },
    });
    console.log(`Created anime: ${created.title}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
```

- [ ] **Step 2: 配置 Prisma seed script**

编辑 `package.json`，添加:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

安装 tsx:
```bash
cd /d/anime-tracker/web
npm install -D tsx
```

- [ ] **Step 3: 执行种子数据**

```bash
cd /d/anime-tracker/web
npx prisma db seed
```

- [ ] **Step 4: 验证完整流程**

```bash
cd /d/anime-tracker/web
npm run dev
```

检查:
1. 首页追番日历显示种子数据
2. 点击番剧卡片进入新番影院
3. 新番排行页面正常
4. 登录后可以评分、发帖、追番
5. 我的追番页面显示追番列表

- [ ] **Step 5: Commit**

```bash
cd /d/anime-tracker
git add web/prisma/seed.ts web/package.json
git commit -m "feat: add seed data and final integration"
```

---

## 完成检查清单

- [ ] 所有页面可正常渲染，无白屏/404
- [ ] 登录/退出流程正常
- [ ] 追番日历 TV/电影Tab和季度切换工作正常
- [ ] 周历↔网格视图切换正常
- [ ] 新番影院评分组件提交后数据刷新
- [ ] 新番排行榜单数据正确展示
- [ ] 百家小坛发帖回帖正常
- [ ] 我的追番今日更新高亮正确
- [ ] Python 爬虫可独立运行写入数据库
- [ ] `npx tsc --noEmit` 无类型错误
