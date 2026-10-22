export const MAX_BODY = 8192;

export function json(status, body) {
  return Response.json(body, { status });
}

// Python의 len()처럼 글자(코드 포인트) 수로 센다.
const length = (text) => [...text].length;

export function validateEntry(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('JSON 객체를 보내 주세요.');
  }
  const result = {};
  for (const [key, maximum, label] of [['name', 40, '이름'], ['message', 500, '내용']]) {
    const raw = value[key];
    if (typeof raw !== 'string' || !raw.trim()) throw new Error(`${label}을 입력해 주세요.`);
    result[key] = raw.trim();
    if (length(result[key]) > maximum) throw new Error(`${label}은 ${maximum}자 이내로 입력해 주세요.`);
  }
  const to = value.to;
  if (to !== undefined && to !== null && typeof to !== 'string') {
    throw new Error('받는 사람은 문자열로 보내 주세요.');
  }
  result.to = (to ?? '').trim();
  if (length(result.to) > 40) throw new Error('받는 사람은 40자 이내로 입력해 주세요.');
  return result;
}

export function toEntry(row) {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    to: row.recipient,
    created_at: row.created_at.toISOString(),
  };
}
