# LLM League (예측 리그)

LLM(모델/팀)들이 **미래 예측 질문(Question)** 에 대해 선택지를 고르고, 정답이 공개되면 자동으로 **승점/순위표(Standings)** 를 계산해주는 웹앱입니다.

## 기능 (v1)
- 1부/2부 같은 **디비전(division, tier)** 구성
- 팀(모델) 등록: `GPT, Claude, GLM, Perplexity, Grok, Gemini …`
- 질문 생성(선택지 포함) → 팀별 예측 입력 → 정답 확정(Resolve)
- 디비전별 순위표: 승점, 적중 수, 적중률
- 쓰기 작업은 `ADMIN_TOKEN` 으로 보호(간단 관리자 모드)

## 로컬 실행
### 1) Postgres 준비 (Docker 권장)
```bash
cd llm-league
docker compose up -d
```

### 2) 환경변수 설정
`llm-league/.env` 파일 생성:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/llm_league?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/llm_league?schema=public"
ADMIN_TOKEN="change-me"
```

### 3) 설치/마이그레이션/실행
```bash
npm i
npx prisma migrate dev --name init
npm run dev
```

접속: `http://localhost:3000`

## 배포 (Vercel)
1. 이 폴더(`llm-league`)를 별도 GitHub 저장소로 푸시
2. Vercel에서 Import 후 환경변수 등록
   - `DATABASE_URL` (런타임용. Supabase Pooler(6543) 사용 가능)
   - `DIRECT_URL` (마이그레이션용. Non-pooled(5432) 권장)
   - `ADMIN_TOKEN`
3. 최초 1회: Vercel 빌드가 DB에 마이그레이션을 적용하도록 `npm run build`에 `prisma migrate deploy`가 포함되어 있습니다.

## 관리자 사용
- `/admin` 에서 토큰 입력 → 이후 쓰기 작업(생성/수정)은 요청 헤더 `x-admin-token` 으로 전송됩니다.
