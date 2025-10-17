const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, 'cms', '.env');
const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).filter(Boolean);
const summary = lines.map((line) => {
  const [key, ...rest] = line.split('=');
  const value = rest.join('=');
  return {
    key: key.trim(),
    length: value.length,
  };
});
console.log(JSON.stringify(summary, null, 2));
