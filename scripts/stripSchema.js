const fs = require("fs");
const path = "src/components/posts/PostView.tsx";
let lines = fs.readFileSync(path, "utf-8").split("\n");
// remove sanitizeSchema constant (lines inclusive, find start index by marker)
const start = lines.findIndex((l) => l.includes("const sanitizeSchema"));
let end = start;
if (start >= 0) {
  // find the closing '};' after start
  for (let i = start; i < lines.length; i++) {
    if (lines[i].trim() === "} as any;" || lines[i].trim() === "};") {
      end = i;
      break;
    }
  }
}
if (start >= 0 && end > start) {
  lines.splice(start, end - start + 1);
  fs.writeFileSync(path, lines.join("\n"));
  console.log("removed sanitizeSchema, new length", lines.length);
} else {
  console.log("sanitizeSchema not found or already removed");
}
