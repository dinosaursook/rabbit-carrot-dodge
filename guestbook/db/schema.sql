-- 칭찬 릴레이 테이블. 여러 번 실행해도 안전하다.
CREATE TABLE IF NOT EXISTS entries (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
    message    TEXT        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 500),
    recipient  TEXT        NOT NULL DEFAULT '' CHECK (char_length(recipient) <= 40),
    created_at TIMESTAMPTZ NOT NULL DEFAULT date_trunc('second', now())
);
