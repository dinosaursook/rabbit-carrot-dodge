// /api/entries 말고 다른 /api 주소는 모두 JSON 404로 답한다.
const notFound = () => Response.json({ error: '찾을 수 없는 경로입니다.' }, { status: 404 });

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
