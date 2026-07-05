const fs = require('fs');
const files = [
  'src/context/SeoAdsContext.tsx',
  'src/components/SeoAdsAdmin.tsx',
  'src/components/AiChatWidget.tsx',
  'src/components/Contact.tsx',
  'src/components/Navbar.tsx',
  'src/components/Footer.tsx',
  'src/App.tsx',
  'server.ts',
  'lib/ollama.ts'
];
const patterns = [
  /innerHTML/i,
  /dangerouslySetInnerHTML/i,
  /eval\s*\(/i,
  /document\.write/i,
  /textContent/i,
  /sessionStorage/i,
  /localStorage/i,
  /prompt\s*\(/i,
  /password/i,
  /admin/i,
  /VITE_ADMIN/i,
  /trust proxy/i,
  /x-forwarded-for/i,
  /ALLOWED_ORIGINS/i,
  /CORS/i,
  /Content-Security-Policy/i,
  /unsafe-inline/i,
  /script-src/i,
  /connect-src/i,
];
const base = 'd:/app-ai/ai-charcoal/';
for (const f of files) {
  const content = fs.readFileSync(base + f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    for (const p of patterns) {
      if (p.test(line)) {
        console.log(`${f}:${i + 1}: ${line.trim()}`);
      }
    }
  });
}