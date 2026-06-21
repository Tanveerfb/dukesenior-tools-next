const fs = require("fs");
const newHeader =
  '"use client";\nimport React, { useEffect, useState, useRef, useCallback, useMemo } from "react";\nimport Link from "next/link";\nimport { useParams, useSearchParams } from "next/navigation";\nimport {\n  getPostBySlug,\n  addComment,\n  reactToPostForUser,\n  reactToCommentForUser,\n  listenPost,\n  listenComments,\n  getUserPostReaction,\n  getUserCommentReaction,\n} from "@/lib/services/cms";\nimport { getSamplePostBySlug } from "@/lib/content/samplePosts";\nimport { FaTwitch } from "react-icons/fa";\nimport Image from "next/image";\nimport ReactMarkdown from "react-markdown";\nimport remarkGfm from "remark-gfm";\nimport rehypeRaw from "rehype-raw";\nimport rehypeSanitize from "rehype-sanitize";\nimport rehypeSlug from "rehype-slug";\nimport { useAuth } from "@/hooks/useAuth";\nimport { getAuth } from "firebase/auth";\nimport { cn } from "@/lib/utils";\nimport {\n  CommentNode,\n  renderCommentWithLinks,\n  transformEmbeds,\n  estimateReadTime,\n  extractHeadings,\n  notifyMentions,\n  copyToClipboard,\n  decodeHtmlEntities,\n  renderContent,\n  sanitizeSchema,\n  SpinnerIcon,\n} from "./helpers";\nimport Lightbox from "./Lightbox";\nimport CommentItem from "./CommentItem";\nimport styles from "./post.module.css";\n';
let lines = fs
  .readFileSync("src/components/posts/PostView.tsx", "utf-8")
  .split("\n");
let expIdx = lines.findIndex((l) =>
  l.includes("export default function PostView"),
);
if (expIdx === -1) expIdx = 170;
const rest = lines.slice(expIdx);
fs.writeFileSync(
  "src/components/posts/PostView.tsx",
  newHeader + "\n" + rest.join("\n"),
);
console.log(
  "rewrote header, expIdx",
  expIdx,
  "new total lines",
  newHeader.split("\n").length + rest.length,
);
