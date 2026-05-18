// scripts/send-post-emails.js
// Called by GitHub Action when a new post is pushed.
// Reads subscribers from Netlify Forms and sends via Resend.
const fs = require('fs');

async function main() {
  let postFile = process.argv[2];
  if (!postFile) {
    console.error('Usage: node send-post-emails.js <path/to/post.md>');
    process.exit(1);
  }
  // Normalize: allow bare filename or posts/filename
  if (!postFile.startsWith('posts/')) {
    postFile = 'posts/' + postFile;
  }

  // Read and parse the post
  const content = fs.readFileSync(postFile, 'utf8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  const fm = {};
  if (fmMatch) {
    fmMatch[1].split('\n').forEach(line => {
      const i = line.indexOf(':');
      if (i === -1) return;
      fm[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    });
  }

  const body = fmMatch ? fmMatch[2].trim() : content.trim();
  const title = fm.title || 'New post from Jackass Farm';
  const author = fm.author || '';
  const date = fm.date || new Date().toISOString().split('T')[0];

  // Build a plain-text teaser (strip markdown syntax)
  const teaser = body
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .replace(/`(.+?)`/g, '$1')
    .split('\n').filter(l => l.trim()).join(' ')
    .slice(0, 400);

  const postUrl = 'https://jackassfarmcatskills.com/farmjournal.html';

  const { NETLIFY_TOKEN, NETLIFY_SITE_ID, RESEND_API_KEY } = process.env;
  if (!NETLIFY_TOKEN || !NETLIFY_SITE_ID || !RESEND_API_KEY) {
    throw new Error('Missing required environment variables: NETLIFY_TOKEN, NETLIFY_SITE_ID, RESEND_API_KEY');
  }

  // Fetch subscribers from Netlify Forms
  const netlifyRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/submissions?per_page=100`,
    { headers: { 'Authorization': `Bearer ${NETLIFY_TOKEN}` } }
  );
  if (!netlifyRes.ok) {
    throw new Error(`Netlify API ${netlifyRes.status}: ${await netlifyRes.text()}`);
  }

  const all = await netlifyRes.json();
  console.log(`Total submissions from API: ${all.length}`);
  if (all.length > 0) {
    const formNames = [...new Set(all.map(s => s.form_name))];
    console.log('Form names found:', formNames.join(', '));
  }
  const blogSubs = all.filter(s => s.form_name === 'blog-subscribe');

  // Deduplicate by email
  const seen = new Set();
  const subscribers = blogSubs.filter(s => {
    const email = s.data?.email;
    if (!email || seen.has(email.toLowerCase())) return false;
    seen.add(email.toLowerCase());
    return true;
  });

  if (!subscribers.length) {
    console.log('No subscribers found — nothing sent.');
    return;
  }

  console.log(`Sending "${title}" to ${subscribers.length} subscriber(s)...`);

  for (const sub of subscribers) {
    const name = sub.data?.name || 'Friend';
    const email = sub.data.email;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Jackass Farm Journal <journal@jackassfarmcatskills.com>',
        to: [email],
        subject: `New post: ${title}`,
        html: `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
  <h1 style="color:#44235e;font-size:1.5em;margin-bottom:4px">${escapeHtml(title)}</h1>
  <p style="color:#888;font-size:0.85em;margin-top:0">${escapeHtml(date)}${author ? ` &mdash; ${escapeHtml(author)}` : ''}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
  <p style="line-height:1.8">${escapeHtml(teaser)}&hellip;</p>
  <p style="margin-top:24px">
    <a href="${postUrl}" style="background:#44235e;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;font-size:0.9em">Read the full post →</a>
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px">
  <p style="font-size:0.75em;color:#aaa">
    You're receiving this because you subscribed at jackassfarmcatskills.com.<br>
    To unsubscribe, reply to this email with "unsubscribe" in the subject line.
  </p>
</div>`
      })
    });

    if (emailRes.ok) {
      console.log(`✓ Sent to ${email}`);
    } else {
      console.error(`✗ Failed for ${email}:`, await emailRes.text());
    }
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

main().catch(err => { console.error(err); process.exit(1); });
