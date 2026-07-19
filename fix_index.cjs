const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  '<title>My Google AI Studio App</title>',
  '<title>El Nathan - Sistema de Gestão de Transportes</title>'
);

fs.writeFileSync('index.html', code);
console.log("Fixed index.html title");
