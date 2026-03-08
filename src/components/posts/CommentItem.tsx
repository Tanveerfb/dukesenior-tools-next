import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { addComment, reactToCommentForUser } from "@/lib/services/cms";
import { CommentNode, renderCommentWithLinks, notifyMentions } from "./helpers";

interface MentionProps {
  suggestions?: { username: string; uid: string }[];
  showSuggestions?: boolean;
  suggestionOwner?: string | null;
  activeSuggestion?: number;
  applySuggestionToTextarea?: (u: string) => void;
  fetchSuggestions?: (q: string, owner?: string) => Promise<void>;
  setActiveSuggestion?: (v: any) => void;
  setShowSuggestions?: (v: any) => void;
  setSuggestionOwner?: (v: any) => void;
  setSuggestions?: (v: any) => void;
  activeTextareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  postSlug?: string;
}

interface Props {
  node: CommentNode;
  postId: string;
  mentionProps?: MentionProps;
}

export default function CommentItem({ node, postId, mentionProps }: Props) {
  const { user } = useAuth();
  const {
    suggestions = [],
    showSuggestions = false,
    suggestionOwner = null,
    activeSuggestion = 0,
    applySuggestionToTextarea: _applySuggestionToTextarea = (_u: string) => {},
    fetchSuggestions = async (_q: string, _owner?: string) => {},
    setActiveSuggestion = (_v: any) => {},
    setShowSuggestions = (_v: any) => {},
    setSuggestionOwner = (_v: any) => {},
    setSuggestions = (_v: any) => {},
    activeTextareaRef = { current: null },
  } = mentionProps || {};

  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [working, setWorking] = useState(false);
  const [userReaction, setUserReaction] = useState<
    "like" | "dislike" | undefined
  >(node.userReaction);
  const [likeCount, setLikeCount] = useState(node.likeCount);
  const [dislikeCount, setDislikeCount] = useState(node.dislikeCount);

  async function react(type: "like" | "dislike") {
    if (!user) return;
    if (userReaction === type) return;
    await reactToCommentForUser(node.id, user.uid, type);
    setLikeCount(
      (c) => c + (type === "like" ? 1 : 0) - (userReaction === "like" ? 1 : 0),
    );
    setDislikeCount(
      (c) =>
        c + (type === "dislike" ? 1 : 0) - (userReaction === "dislike" ? 1 : 0),
    );
    setUserReaction(type);
  }

  async function submit() {
    if (!user || !reply.trim()) return;
    setWorking(true);
    try {
      const c = reply.trim();
      const re = /@([A-Za-z0-9_]{3,32})/g;
      const set = new Set<string>();
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(c))) {
        set.add(mm[1].toLowerCase());
      }
      const mentions = Array.from(set);
      const commentId = await addComment(user.uid, user.email || "unknown", {
        postId,
        parentId: node.id,
        content: c,
        mentions,
      });
      setReply("");
      setReplyOpen(false);
      try {
        await notifyMentions(c, postId, commentId, mentionProps?.postSlug);
      } catch (e) {
        console.warn("mention notify failed", e);
      }
    } finally {
      setWorking(false);
    }
  }

  function insertSuggestionLocal(username: string) {
    const ta = activeTextareaRef.current as HTMLTextAreaElement | null;
    const caret = ta ? ta.selectionStart || ta.value.length : reply.length;
    const val = reply;
    const start = ta
      ? val.lastIndexOf("@", caret - 1)
      : val.lastIndexOf("@", caret - 1);
    if (start < 0) return;
    const before = val.slice(0, start);
    const after = val.slice(caret);
    const insert = `@${username} `;
    const newVal = before + insert + after;
    setReply(newVal);
    setShowSuggestions(false);
    setSuggestionOwner(null);
    setSuggestions([]);
    requestAnimationFrame(() => {
      try {
        if (ta) {
          ta.focus();
          const pos = before.length + insert.length;
          ta.setSelectionRange(pos, pos);
        }
      } catch (_e) {}
    });
  }

  return (
    <div id={`comment-${node.id}`} className="mb-3">
      <div className="p-2 border border-border dark:border-border-dark rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-1">
          <strong className="text-foreground">{node.authorName}</strong>
          <span>{new Date(node.createdAt).toLocaleString()}</span>
        </div>
        <div className="text-sm mb-2">
          {renderCommentWithLinks(node.content)}
        </div>
        <div className="flex gap-2">
          <button
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
              userReaction === "like"
                ? "bg-green-500 text-white"
                : "border border-green-500 text-green-500 hover:bg-green-500 hover:text-white",
            )}
            disabled={!user}
            onClick={() => react("like")}
          >
            👍 {likeCount}
          </button>
          <button
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
              userReaction === "dislike"
                ? "bg-red-500 text-white"
                : "border border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
            )}
            disabled={!user}
            onClick={() => react("dislike")}
          >
            👎 {dislikeCount}
          </button>
          {user && (
            <button
              className="rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white px-3 py-1 text-xs font-medium transition-colors"
              onClick={() => setReplyOpen((o) => !o)}
            >
              Reply
            </button>
          )}
        </div>
        {/* Collapsible reply form */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            replyOpen ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0",
          )}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <textarea
              rows={2}
              value={reply}
              onChange={(e) => {
                setReply(e.target.value);
                const ta = e.target as HTMLTextAreaElement;
                activeTextareaRef.current = ta;
                const caret = ta.selectionStart || ta.value.length;
                const before = ta.value.slice(0, caret);
                const at = before.lastIndexOf("@");
                if (at >= 0 && (at === 0 || /\s/.test(before[at - 1]))) {
                  const partial = before.slice(at + 1);
                  if (/^[A-Za-z0-9_]{1,32}$/.test(partial)) {
                    setSuggestionOwner(node.id);
                    setTimeout(
                      () => fetchSuggestions(partial.toLowerCase(), node.id),
                      200,
                    );
                  }
                }
              }}
              placeholder="Reply..."
              className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-primary-500 resize-y text-sm"
              onFocus={(e) => {
                activeTextareaRef.current = e.target as HTMLTextAreaElement;
                setSuggestionOwner(node.id);
              }}
              onBlur={(_e) => {
                /* keep suggestions visible briefly; they will be cleared on apply or escape */
              }}
              onKeyDown={(e) => {
                if (suggestionOwner === node.id && showSuggestions) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveSuggestion((i: number) =>
                      Math.min(suggestions.length - 1, i + 1),
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveSuggestion((i: number) => Math.max(0, i - 1));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const s = suggestions[activeSuggestion];
                    if (s) insertSuggestionLocal(s.username);
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                    setSuggestionOwner(null);
                  }
                }
              }}
            />
            {suggestionOwner === node.id &&
              showSuggestions &&
              suggestions.length > 0 && (
                <div className="relative">
                  <div className="absolute left-2 right-2 top-full z-[2000] bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-md mt-1.5 shadow-lg">
                    {suggestions.map(
                      (s: { username: string; uid: string }, idx: number) => (
                        <div
                          key={s.username}
                          onMouseDown={(ev) => {
                            ev.preventDefault();
                            if (suggestionOwner === node.id)
                              insertSuggestionLocal(s.username);
                          }}
                          className={cn(
                            "px-3 py-1.5 cursor-pointer text-foreground text-sm",
                            idx === activeSuggestion &&
                              "bg-gray-100 dark:bg-gray-700",
                          )}
                        >
                          @{s.username}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            <div className="flex gap-2">
              <button
                className="rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-3 py-1 text-xs font-medium transition-colors"
                disabled={!reply.trim() || working}
                type="submit"
              >
                {working ? "Posting..." : "Submit"}
              </button>
              <button
                type="button"
                className="rounded-lg border border-border dark:border-border-dark text-foreground-secondary hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1 text-xs font-medium transition-colors"
                onClick={() => {
                  setReplyOpen(false);
                  setReply("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="ml-6 mt-2">
        {node.replies?.map((r) => (
          <CommentItem
            key={r.id}
            node={r}
            postId={postId}
            mentionProps={mentionProps}
          />
        ))}
      </div>
    </div>
  );
}
