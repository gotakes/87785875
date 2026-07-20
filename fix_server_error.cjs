const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/model: "gemini-2.0-flash"/, 'model: "gemini-1.5-flash"');
code = code.replace(/console\.error\("Gemini AI error, falling back to original query:", aiError\);/, 'console.log("Gemini AI error (quota/rate limit), falling back to original query. Error:", aiError.message || aiError);');

fs.writeFileSync('server.ts', code);
console.log("Fixed server.ts error logging and model");
