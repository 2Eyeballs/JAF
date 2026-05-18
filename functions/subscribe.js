// Cloudflare Pages Function — handles subscribe form POST
// Stores subscribers in data/subscribers.json via GitHub API
// Requires GITHUB_TOKEN env variable set in Cloudflare Pages settings

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const name = (formData.get('name') || '').trim();
    const email = (formData.get('email') || '').trim().toLowerCase();
    const botField = formData.get('bot-field');

    // Honeypot — silently succeed if bot
    if (botField) {
      return jsonResponse({ ok: true });
    }

    if (!name || !email || !email.includes('@')) {
      return jsonResponse({ error: 'Invalid input' }, 400);
    }

    const token = env.GITHUB_TOKEN;
    if (!token) {
      return jsonResponse({ error: 'Server misconfiguration' }, 500);
    }

    const repo = '2Eyeballs/JAF';
    const filePath = 'data/subscribers.json';
    const apiBase = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'JAF-Subscribe',
      'Content-Type': 'application/json',
    };

    // Read current subscribers file
    const fileRes = await fetch(apiBase, { headers });
    let subscribers = [];
    let sha;

    if (fileRes.ok) {
      const fileData = await fileRes.json();
      sha = fileData.sha;
      subscribers = JSON.parse(atob(fileData.content.replace(/\n/g, '')));
    }

    // Skip duplicate emails
    if (subscribers.some(s => s.email === email)) {
      return jsonResponse({ ok: true });
    }

    subscribers.push({ name, email, date: new Date().toISOString() });

    // Write updated file back to GitHub
    const body = {
      message: `Subscribe: ${email}`,
      content: btoa(JSON.stringify(subscribers, null, 2) + '\n'),
    };
    if (sha) body.sha = sha;

    const updateRes = await fetch(apiBase, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      console.error('GitHub API error:', err);
      return jsonResponse({ error: 'Failed to save subscriber' }, 500);
    }

    return jsonResponse({ ok: true });

  } catch (err) {
    console.error('Subscribe error:', err);
    return jsonResponse({ error: 'Internal error' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
