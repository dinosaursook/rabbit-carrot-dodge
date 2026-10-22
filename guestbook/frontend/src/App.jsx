import { useCallback, useEffect, useState } from 'react';

async function request(path, options) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || '서버 연결을 확인해 주세요.');
  return data;
}

function EntryForm({ onSaved }) {
  const [form, setForm] = useState({ name: '', to: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ text: '', error: false });

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus({ text: '저장하는 중…', error: false });
    try {
      const data = await request('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ ...form, to: '', message: '' });
      setStatus({ text: `칭찬을 보냈어요! 🎉 #${data.entry.id}`, error: false });
      onSaved();
    } catch (error) {
      setStatus({ text: error.message, error: true });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="name">보내는 사람</label>
      <input id="name" name="name" value={form.name} onChange={change} maxLength={40} required autoComplete="off" placeholder="내 이름" />
      <label htmlFor="to">받는 사람 <span className="optional">(선택)</span></label>
      <input id="to" name="to" value={form.to} onChange={change} maxLength={40} autoComplete="off" placeholder="칭찬받을 팀원 이름" />
      <label htmlFor="message">칭찬 한마디</label>
      <textarea id="message" name="message" value={form.message} onChange={change} rows={4} maxLength={500} required placeholder="예: 어제 회의 자료 정리해 줘서 정말 고마워요!" />
      <button id="submit-button" type="submit" disabled={saving}>칭찬 보내기 <span aria-hidden="true">💌</span></button>
      <p className={`status${status.error ? ' error' : ''}`} role="status" aria-live="polite">{status.text}</p>
    </form>
  );
}

function EntryCard({ entry }) {
  return (
    <li>
      <div className="entry-meta">
        <span className="entry-name">{entry.name}</span>
        <time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString('ko-KR')}</time>
      </div>
      {entry.to && <p className="entry-to">→ {entry.to}에게</p>}
      <p className="entry-message">{entry.message}</p>
    </li>
  );
}

export default function App() {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState({ text: '칭찬을 불러오는 중…', error: false });

  const load = useCallback(async () => {
    setStatus({ text: '칭찬을 불러오는 중…', error: false });
    try {
      const data = await request('/api/entries');
      setEntries(data.entries);
      setStatus({ text: data.entries.length ? `${data.entries.length}개의 칭찬` : '아직 칭찬이 없어요. 첫 칭찬을 보내 주세요!', error: false });
    } catch {
      setStatus({ text: '목록을 불러오지 못했습니다. 백엔드 서버 실행 상태를 확인하고 새로고침해 주세요.', error: true });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main>
      <header>
        <span className="eyebrow">PRAISE RELAY · 우리 팀</span>
        <h1>오늘의 칭찬 한마디 <span aria-hidden="true">✨</span></h1>
        <p>고마웠던 순간을 한 줄로 남기고, 다음 사람에게 칭찬을 이어 주세요.</p>
      </header>
      <div className="layout">
        <section className="write" aria-labelledby="write-title">
          <span className="step">01 / 칭찬 보내기</span>
          <h2 id="write-title">칭찬 남기기</h2>
          <EntryForm onSaved={load} />
        </section>
        <section className="read" aria-labelledby="list-title">
          <div className="list-heading">
            <div><span className="step">02 / 칭찬 보드</span><h2 id="list-title">모두의 칭찬</h2></div>
            <button className="quiet" type="button" onClick={load}>새로고침</button>
          </div>
          <p className={`status${status.error ? ' error' : ''}`} role="status" aria-live="polite">{status.text}</p>
          <ol>{entries.map((entry) => <EntryCard key={entry.id} entry={entry} />)}</ol>
        </section>
      </div>
      <footer><span className="dot" aria-hidden="true" /> 로그인 없이 링크로 함께 쓰는 팀 보드 · 최근 200개 표시</footer>
    </main>
  );
}
