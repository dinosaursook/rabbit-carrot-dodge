import { pool } from '@/lib/db';
import { MAX_BODY, json, toEntry, validateEntry } from '@/lib/entries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, message, recipient, created_at FROM entries ORDER BY id DESC LIMIT 200',
    );
    return json(200, { entries: rows.map(toEntry) });
  } catch (error) {
    console.error(error);
    return json(500, { error: '목록을 불러오지 못했습니다.' });
  }
}

export async function POST(request) {
  const contentType = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return json(415, { error: 'application/json으로 보내 주세요.' });
  }
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY) return json(413, { error: '요청 본문이 너무 큽니다.' });

  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength === 0) return json(400, { error: 'JSON 본문이 필요합니다.' });
  if (bytes.byteLength > MAX_BODY) return json(413, { error: '요청 본문이 너무 큽니다.' });

  let entry;
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    let value;
    try {
      value = JSON.parse(text);
    } catch {
      return json(400, { error: 'JSON 형식을 확인해 주세요.' });
    }
    entry = validateEntry(value);
  } catch (error) {
    const message = error instanceof TypeError ? 'JSON 형식을 확인해 주세요.' : error.message;
    return json(400, { error: message });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO entries (name, message, recipient) VALUES ($1, $2, $3) ' +
        'RETURNING id, name, message, recipient, created_at',
      [entry.name, entry.message, entry.to],
    );
    return json(201, { entry: toEntry(rows[0]) });
  } catch (error) {
    console.error(error);
    return json(500, { error: '저장하지 못했습니다. 다시 시도해 주세요.' });
  }
}
