// Load through playwright-cli run-code --filename=scripts/ui-exploration-observer.js.
// This function runs in the CLI's execution context, not inside the application.
async page => {
  if (page.__uiExploration) throw new Error('Stop the existing observer before starting another.');
  const events = [];
  const pending = new Set();
  const secretKey = /password|token|authorization|cookie|secret|credential|api.?key/i;
  const safeUrl = value => String(value ?? '')
    .replace(/(https?:\/\/)[^/@]+@/i, '$1[REDACTED]@')
    .replace(/([?&][^=&#]+)=([^&#]*)/g, '$1=[REDACTED]')
    .replace(/#.*$/, '');
  const scrubText = value => String(value)
    .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [REDACTED]')
    .replace(/(password|token|secret|authorization|cookie|api.?key)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]')
    .replace(/\beyJ[A-Za-z0-9_.-]+/g, '[REDACTED JWT]')
    .slice(0, 2000);
  const redact = value => {
    if (Array.isArray(value)) return value.map(redact);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, secretKey.test(key) ? '[REDACTED]' : redact(item)]));
    return typeof value === 'string' ? scrubText(value) : value;
  };
  const body = text => {
    if (!text) return null;
    if (text.length > 16384) return { omitted: 'body exceeds 16 KiB', characters: text.length };
    try { return redact(JSON.parse(text)); }
    catch { return { omitted: 'non-JSON body', characters: text.length }; }
  };
  const state = { scenario: 'unlabelled', mode: 'live', events };
  const add = event => events.push({ time: new Date().toISOString(), scenario: state.scenario, mode: state.mode, ...event });
  const isApi = request => /^https?:\/\/[^/]+\/api\//.test(request.url());
  let nextId = 0;
  const ids = new Map();
  const onRequest = request => {
    if (!isApi(request)) return;
    const id = ++nextId;
    ids.set(request, { id, scenario: state.scenario, mode: state.mode });
    add({ kind: 'api-request', id, method: request.method(), url: safeUrl(request.url()), contentType: request.headers()['content-type'] ?? null, body: body(request.postData()) });
  };
  const onResponse = response => {
    const request = response.request();
    if (!isApi(request)) return;
    const metadata = ids.get(request) ?? {};
    const task = (async () => {
      let responseBody;
      try { responseBody = body(await response.text()); }
      catch { responseBody = { omitted: 'response body unavailable' }; }
      add({ kind: 'api-response', ...metadata, method: request.method(), url: safeUrl(response.url()), status: response.status(), contentType: response.headers()['content-type'] ?? null, body: responseBody });
    })();
    pending.add(task);
    task.finally(() => pending.delete(task));
  };
  const onFailed = request => add({ kind: 'request-failed', ...(ids.get(request) ?? {}), method: request.method(), url: safeUrl(request.url()), error: scrubText(request.failure()?.errorText) });
  const onConsole = message => {
    if (['error', 'warning'].includes(message.type())) add({ kind: 'console', level: message.type(), message: scrubText(message.text()), location: safeUrl(message.location().url) });
  };
  const onPageError = error => add({ kind: 'page-error', message: scrubText(error.message) });
  page.on('request', onRequest);
  page.on('response', onResponse);
  page.on('requestfailed', onFailed);
  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  state.stop = async () => {
    page.off('request', onRequest);
    page.off('response', onResponse);
    page.off('requestfailed', onFailed);
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
    await Promise.all([...pending]);
    delete page.__uiExploration;
    return events;
  };
  page.__uiExploration = state;
  return 'Observer started. Set page.__uiExploration.scenario and mode before each action; call stop() to export.';
}
