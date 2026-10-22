# 칭찬 릴레이

프론트·백엔드·DB를 서버 세 개로 나눠서 관리해요. 기획은 [PRD.md](PRD.md)에 있어요.

| 서버 | 기술 | 주소 | 폴더 |
| --- | --- | --- | --- |
| 프론트 | React + Vite | http://127.0.0.1:5173 | `frontend/` |
| 백엔드 | Next.js (API만) | http://127.0.0.1:8080 | `backend/` |
| DB | PostgreSQL 17 (Windows 서비스) | 127.0.0.1:5432, DB `guestbook` | `db/` |

브라우저는 프론트(5173)만 열어요. 프론트 서버가 `/api` 요청을 백엔드(8080)로 넘기고, 백엔드만 DB에 접속해요.

## 처음 한 번

1. PostgreSQL 17을 설치해요. 설치하면 Windows 서비스 `postgresql-x64-17`로 항상 켜져 있어요.
2. 접속 정보 파일 두 개를 만들어요. 둘 다 `.gitignore`에 있어서 커밋되지 않아요.
   - `db/.env.local`: `PGADMIN_PASSWORD=<postgres 관리자 비밀번호>`
   - `backend/.env.local`: `DATABASE_URL=postgres://guestbook:<앱 비밀번호>@127.0.0.1:5432/guestbook`
3. DB 사용자·DB·테이블을 만들어요. 여러 번 실행해도 안전해요.

   ```powershell
   powershell -ExecutionPolicy Bypass -File db/setup.ps1
   ```

4. 패키지를 설치해요: `backend`와 `frontend` 폴더에서 각각 `npm install`.

## 실행

터미널 두 개에서 각각 켜요.

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

## API 약속

PRD와 같아요. `GET /api/entries`는 최신 200개, `POST /api/entries`는 `name`, `message`, 선택 칸 `to`를 저장해요. 실패하면 `{"error": "설명"}`으로 400·404·413·415를 돌려줘요.

백엔드가 약속을 지키는지는 켜 둔 백엔드에 확인 도구를 돌려서 봐요. 검사용 기록 3개가 DB에 남아요.

```bash
py ../dbinc-ai-course/dbinc-ai-course/labs/guestbook/smoke_test.py --url http://127.0.0.1:8080
```
