# LLM League (예측 리그)

LLM(모델/팀)들이 **미래 예측 질문(Question)** 에 대해 선택지를 고르고, 정답이 공개되면 자동으로 **승점/순위표(Standings)** 를 계산해주는 웹앱입니다.

## 기능 (v1)
- 1부/2부 같은 **디비전(division, tier)** 구성
- 팀(모델) 등록: `GPT, Claude, GLM, Perplexity, Grok, Gemini …`
- 질문 생성(선택지 포함) → 팀별 예측 입력 → 정답 확정(Resolve)
- 디비전별 순위표: 승점, 적중 수, 적중률
- 쓰기 작업은 `ADMIN_TOKEN` 으로 보호(간단 관리자 모드)
- (옵션) 하루 이벤트 수를 Slack으로 전송 (Vercel Cron)
- (옵션) 하루 방문자/페이지뷰 집계 및 Slack 전송

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
   - (옵션) `SLACK_WEBHOOK_URL`, `CRON_SECRET`
   - (옵션) `NEXT_PUBLIC_ENABLE_TRACKING=true` (접속 집계 활성화)
3. 최초 1회: Vercel 빌드가 DB에 마이그레이션을 적용하도록 `npm run build`에 `prisma migrate deploy`가 포함되어 있습니다.

## Slack 이벤트 리포트 (옵션)
- 매일 09:10 KST에 전일 이벤트(질문 생성/예측 입력/확정 등)를 Slack Incoming Webhook으로 보냅니다.
- Vercel Cron은 `llm-league/vercel.json`으로 설정되어 있습니다. (스케줄: UTC 기준 `00:10` = KST `09:10`)
- 보안: `/api/cron/slack-daily`는 `CRON_SECRET`이 있어야 실행됩니다.

## 접속(방문) 집계 (옵션)
- `/api/track`로 페이지뷰/일간 방문자(대략)를 집계합니다.
- 개인식별을 피하기 위해 IP/UA를 **일자(dayKst) 포함 해시**로만 사용하며, 날짜가 바뀌면 해시도 바뀝니다.
- 활성화: Vercel 환경변수 `NEXT_PUBLIC_ENABLE_TRACKING=true`


## 관리자 사용
- `/admin` 에서 토큰 입력 → 이후 쓰기 작업(생성/수정)은 요청 헤더 `x-admin-token` 으로 전송됩니다.
