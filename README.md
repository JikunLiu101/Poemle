# 诗乐 · Poemle

> 古典诗词版 Wordle —— 猜唐诗宋词中的一句字谜游戏。
> A Wordle-style guessing game for classical Chinese poetry. Static SPA — no
> backend, no login, offline once the page loads.

### ▶️ **[Play it now](https://jikunliu101.github.io/poemle/)**

---

## 怎么玩 · How to play

每一道题是一句唐诗或宋词。逐字输入你的猜测，按提交后会得到 Wordle 风格的颜色反馈：

- 🟩 **绿色** — 字对，位置也对 (correct character, correct position)
- 🟨 **黄色** — 字在答案里，但位置错了 (correct character, wrong position)
- 🟥 **红色** — 字不在答案里 (character not in the answer)

句中的逗号、顿号已经预填在格子里——你只需要输入汉字。猜不出来可以点 **提示** 逐字揭示；点 **今日诗题** 玩每日固定题（所有玩家同一题），或 **随机一题** 无限次重玩。

## 特点 · Features

- **唐诗宋词全集**（数据爬取自 [古文岛](https://www.guwendao.net/) 的诗词合集：唐诗三百首、古诗三百首、宋词三百首）
- **每日固定题**：通过 `YYYYMMDD` 的 FNV-1a 32-bit 哈希确定，无需后端
- **IME 友好**：原生支持拼音输入法，逗号等标点可以在输入框中保留显示但不计入提交
- **localStorage 持久化**：刷新页面也能恢复进行中的局
- **古风视觉**：宣纸水墨背景图、四角 梅·兰·竹·菊 水墨画、毛笔字标题
- **响应式布局**：手机、平板、桌面都能玩

## 技术栈 · Tech stack

- **Vite 5** · 构建工具
- **React 18 + TypeScript**（strict mode）
- **Tailwind CSS 3**
- **Vitest 2**（58 个引擎/存储单元测试）

## 本地运行 · Local development

```bash
git clone https://github.com/JikunLiu101/poemle.git
cd poemle
npm install
npm run dev      # http://localhost:5173/
npm test         # vitest watch mode
npm test -- --run # one-shot, 58 tests
npm run build    # produces dist/ for static hosting
```

## 部署 · Deployment

`vite.config.ts` is wired so production builds use `/poemle/` as the asset
base — matching `https://<user>.github.io/poemle/`. To deploy:

```bash
npm run build
# Then push the contents of dist/ to a gh-pages branch, or use the
# GitHub Pages "deploy from /docs" or any static-hosting workflow.
```

## 数据更新 · Refreshing the dataset

The full corpus lives at [`src/data/poems.json`](src/data/poems.json) and is
produced by [`scripts/curate-dataset.py`](scripts/curate-dataset.py).
Re-running the script re-scrapes 古文岛 and rewrites the JSON:

```bash
python3 scripts/curate-dataset.py
```

It splits each poem on sentence-final punctuation (`。！？`) while keeping
intra-sentence punctuation (`，；：、`) inside each line, filters dynasty to
唐 / 宋, drops sentences shorter than 5 or longer than 20 CJK characters
(so prose-essay sentences and degenerate puzzles are excluded), removes
works with fewer than 2 qualifying sentences (catches the prose entries
the grade-school canon pages mix in — 师说 / 赤壁赋 / 岳阳楼记 etc.),
dedupes by (title, author), and validates structural invariants before
writing.

## Acknowledgments

- Game design inspired by [Wordle](https://www.nytimes.com/games/wordle).
- Poem corpus from [古文岛 / guwendao.net](https://www.guwendao.net/).
- Brush-calligraphy title font: [Ma Shan Zheng](https://fonts.google.com/specimen/Ma+Shan+Zheng) (Google Fonts).
