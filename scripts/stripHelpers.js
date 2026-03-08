const fs = require("fs");
const path = "src/components/posts/PostView.tsx";
let lines = fs.readFileSync(path, "utf-8").split("\n");
// remove helper blocks by identifying markers
function removeBlock(startMarker, endMarker) {
  const start = lines.findIndex((l) => l.includes(startMarker));
  const end = lines.findIndex((l, i) => i > start && l.includes(endMarker));
  if (start >= 0 && end > start) {
    lines.splice(start, end - start + 1);
  }
}
// remove transformEmbeds block (starts 'function transformEmbeds') until closing '}' following line
removeBlock("function transformEmbeds", "}");
// remove sanitizeSchema constant: start 'const sanitizeSchema' end '};'
removeBlock("const sanitizeSchema", "};");
// remove renderContent block
removeBlock("function renderContent", "}");
fs.writeFileSync(path, lines.join("\n"));
console.log("helpers removed, lines now", lines.length);
