const fs = require('fs');

const content = fs.readFileSync('server.ts', 'utf8');

// Use regex to remove app.get("/api/geocode-search", ...)
// and app.get("/api/geocode", ...)
// We have to be careful with nested braces, so let's do something simpler:
// slice from the start of the file to the start of app.get("/api/geocode-search", ...)
// and from the end of app.get("/api/geocode", ...) to the end of the file.

const start1 = content.indexOf('app.get("/api/geocode-search",');
const end1 = content.indexOf('app.post("/api/extract-qualp",'); // Next app route

if (start1 !== -1 && end1 !== -1) {
    const newContent = content.substring(0, start1) + content.substring(end1);
    fs.writeFileSync('server.ts', newContent);
    console.log("Patched server.ts");
} else {
    console.log("Could not find routes in server.ts");
}

