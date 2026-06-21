const fs = require("fs");
const content = `import PostView from "@/components/posts/PostView";

export default function Page(){
  return <PostView />;
}
`;
fs.writeFileSync("src/app/posts/[slug]/page.tsx", content);
console.log("written wrapper");
