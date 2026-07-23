import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist/ directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

function scanDirectory(dir, issues = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath, issues);
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.css'))) {
      const content = fs.readFileSync(fullPath, 'utf8');

      // IP address pattern: e.g., http://192.168.1.50:3000 or raw IP 123.45.67.89 (excluding version strings like 1.0.0)
      const ipPattern = /http:\/\/(?:\d{1,3}\.){3}\d{1,3}/gi;
      const localhostPattern = /http:\/\/localhost:3000/gi;

      const ipMatches = content.match(ipPattern);
      if (ipMatches) {
        issues.push({ file: fullPath, matches: ipMatches, type: 'Hardcoded IP Address' });
      }

      const localhostMatches = content.match(localhostPattern);
      if (localhostMatches) {
        issues.push({ file: fullPath, matches: localhostMatches, type: 'Hardcoded Localhost URL' });
      }
    }
  }

  return issues;
}

console.log('🔍 Auditing dist/ directory for hardcoded IP addresses or development URLs...');
const detectedIssues = scanDirectory(distDir);

if (detectedIssues.length > 0) {
  console.error('\n❌ BUILD AUDIT FAILED! The following hardcoded URLs were found in dist/:');
  detectedIssues.forEach((issue) => {
    console.error(`- [${issue.type}] in ${path.relative(process.cwd(), issue.file)}: ${issue.matches.join(', ')}`);
  });
  process.exit(1);
} else {
  console.log('✅ BUILD AUDIT PASSED! No hardcoded IP addresses or dev URLs found in dist/.');
}
