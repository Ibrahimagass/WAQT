import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const envText = fs.readFileSync(envPath, 'utf8');
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const key = process.env.GEMINI_API_KEY;
console.log('key present', Boolean(key));

const body = {
  contents: [{ role: 'user', parts: [{ text: 'Return strict JSON only with fields temp and code. Example {"temp":21,"code":2}' }] }],
  generationConfig: {
    maxOutputTokens: 200,
    responseMimeType: 'application/json',
    thinkingConfig: { thinkingBudget: 0 },
  },
};

const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': key,
  },
  body: JSON.stringify(body),
});
console.log('status', res.status);
const text = await res.text();
console.log(text.slice(0, 1000));
