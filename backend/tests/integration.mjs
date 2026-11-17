// Uses an isolated database/server configured by the caller. Never run against production.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base = process.env.TEST_API_URL || 'http://127.0.0.1:4017';
const credentials = JSON.parse(fs.readFileSync(new URL('../storage/integration-credentials.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));
let token = '';
let passed = 0;
async function request(path, method = 'GET', data, auth = true) {
  const headers = {};
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (data && !(data instanceof FormData)) headers['Content-Type'] = 'application/json';
  const response = await fetch(base + path, { method, headers, body: data ? data instanceof FormData ? data : JSON.stringify(data) : undefined });
  const result = await response.json();
  return { status: response.status, ...result };
}
function check(name, run) { return Promise.resolve().then(run).then(() => { passed++; console.log(`PASS ${name}`); }); }
await check('protected media library rejects unauthenticated requests', async () => assert.equal((await request('/api/admin/uploads')).status, 401));
await check('unapproved browser origin is rejected', async () => {
  const response = await fetch(base + '/api/content', { headers: { Origin: 'https://untrusted.example' } });
  assert.equal(response.status, 403);
});
await check('invalid credentials are rejected', async () => assert.equal((await request('/api/admin/login', 'POST', { email: credentials.email, password: 'incorrect' }, false)).status, 401));
await check('administrator can sign in and validate session', async () => {
  const login = await request('/api/admin/login', 'POST', credentials, false);
  assert.equal(login.status, 200); token = login.token; assert.equal(token.length, 64);
  assert.equal((await request('/api/admin/me')).user.email, credentials.email);
});
await check('script-capable uploads are rejected', async () => {
  const fd = new FormData(); fd.append('file', new Blob(['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'], { type: 'image/svg+xml' }), 'unsafe.svg');
  assert.equal((await request('/api/upload', 'POST', fd)).status, 400);
});
let upload;
await check('image upload is persistent and uses a randomized filename', async () => {
  const fd = new FormData();
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  fd.append('file', new Blob([png], { type: 'image/png' }), 'travel-photo.png');
  upload = await request('/api/upload', 'POST', fd);
  assert.equal(upload.status, 201); assert.match(upload.url, /[a-f0-9]{32}\.png$/);
  const range = await fetch(upload.url, { headers: { Range: 'bytes=0-7' } });
  assert.equal(range.status, 206); assert.equal((await range.arrayBuffer()).byteLength, 8);
});
await check('background publishing is visible through the public API', async () => {
  const response = await request('/api/admin/media/footerBackground', 'PUT', { value: { url: upload.url, alt: 'Elephant herd' }, version: 0 });
  assert.equal(response.status, 200);
  assert.equal((await request('/api/content', 'GET', undefined, false)).data.settings.footerBackground.url, upload.url);
});
await check('stale saves cannot overwrite newer changes', async () => assert.equal((await request('/api/admin/media/footerBackground', 'PUT', { value: null, version: 0 })).status, 409));
await check('in-use media cannot be permanently deleted', async () => assert.equal((await request('/api/admin/uploads/' + upload.id, 'DELETE')).status, 409));
await check('clearing a media slot publishes an explicit removal', async () => {
  assert.equal((await request('/api/admin/media/footerBackground', 'PUT', { value: null, version: 1 })).status, 200);
  assert.equal((await request('/api/content', 'GET', undefined, false)).data.settings.footerBackground, null);
});
await check('destination edits and deletion persist; collection references protect files', async () => {
  const item = { id: 'mirissa-test', name: 'Mirissa', region: 'South coast', image: upload.url, description: 'A coastal destination' };
  assert.equal((await request('/api/admin/collections/destinations', 'PUT', { items: [item], version: 0 })).status, 200);
  assert.equal((await request('/api/admin/uploads/' + upload.id, 'DELETE')).status, 409);
  assert.equal((await request('/api/admin/collections/destinations', 'PUT', { items: [], version: 1 })).status, 200);
  assert.deepEqual((await request('/api/content', 'GET', undefined, false)).data.collections.destinations, []);
});
await check('unused files can be deleted and are no longer served', async () => {
  assert.equal((await request('/api/admin/uploads/' + upload.id, 'DELETE')).status, 200);
  assert.equal((await fetch(upload.url)).status, 404);
});
await check('package CRUD reaches the public package detail API', async () => {
  const item = { id: 'test-journey', title: 'Sri Lanka discovery', priceFrom: 900, duration: '6 days', places: ['Galle'], tags: ['Private'], itinerary: [{ title: 'Day 1', desc: 'Arrival', img: '' }] };
  assert.equal((await request('/api/admin/collections/tours', 'PUT', { items: [item], version: 0 })).status, 200);
  assert.equal((await request('/api/tours/test-journey', 'GET', undefined, false)).data.priceFrom, 900);
  assert.equal((await request('/api/admin/collections/tours', 'PUT', { items: [], version: 1 })).status, 200);
  assert.equal((await request('/api/tours/test-journey', 'GET', undefined, false)).status, 404);
});
await check('invalid media URLs and duplicate collection IDs are rejected', async () => {
  assert.equal((await request('/api/admin/media/contactHero', 'PUT', { value: { url: 'javascript:alert(1)' }, version: 0 })).status, 400);
  assert.equal((await request('/api/admin/collections/stories', 'PUT', { items: [{ id: 'same', title: 'One' }, { id: 'same', title: 'Two' }], version: 0 })).status, 400);
});
await check('public review submissions require moderation', async () => {
  const review = { name: 'Integration Guest', country: 'Sri Lanka', text: 'A thoughtful journey with wonderful local experiences.', rating: 5 };
  assert.equal((await request('/api/testimonials', 'POST', review, false)).status, 201);
  assert.equal((await request('/api/testimonials', 'GET', undefined, false)).data.some((item) => item.name === review.name), false);
});
await check('logout revokes the issued session', async () => {
  assert.equal((await request('/api/admin/logout', 'POST')).status, 200);
  assert.equal((await request('/api/admin/me')).status, 401);
});
console.log(`${passed} backend integration checks passed.`);
