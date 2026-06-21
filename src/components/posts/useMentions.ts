import { useState, useRef, useCallback } from "react";

export interface MentionSuggestion {
  username: string;
  uid: string;
}

export interface UseMentionsReturn {
  suggestions: MentionSuggestion[];
  showSuggestions: boolean;
  suggestionOwner: string | null;
  activeSuggestion: number;
  mentionStart: number | null;
  mentionPartial: string;
  activeTextareaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  fetchSuggestions: (q: string, owner?: string) => Promise<void>;
  setSuggestions: React.Dispatch<React.SetStateAction<MentionSuggestion[]>>;
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  setSuggestionOwner: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveSuggestion: React.Dispatch<React.SetStateAction<number>>;
  /** Detect @mention token at caret and trigger fetch. Returns updated text value. */
  handleMentionDetection: (value: string, caret: number, owner: string) => void;
  /** Apply selected suggestion into a textarea value. Returns the new value and caret position. */
  applySuggestion: (
    username: string,
    currentValue: string,
    caretPos: number,
  ) => { value: string; caret: number };
  /** Handle ArrowDown/ArrowUp/Enter/Escape for suggestion navigation. Returns true if handled. */
  handleSuggestionKeyDown: (key: string) => {
    handled: boolean;
    selected?: string;
  };
  /** Reset all mention state */
  clearMentions: () => void;
}

export function useMentions(): UseMentionsReturn {
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionOwner, setSuggestionOwner] = useState<string | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionPartial, setMentionPartial] = useState("");
  const suggestionTimerRef = useRef<number | null>(null);
  const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchSuggestions = useCallback(async (q: string, owner?: string) => {
    // prefer server API
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const json = await res.json();
        if (
          json?.results &&
          Array.isArray(json.results) &&
          json.results.length
        ) {
          setSuggestions(json.results.slice(0, 8));
          setActiveSuggestion(0);
          setSuggestionOwner(owner || null);
          setShowSuggestions(true);
          return;
        }
      }
    } catch {
      /* ignore */
    }

    // fallback to client Firestore query
    try {
      const { db } = await import("@/lib/firebase/client");
      const { collection, query, where, orderBy, limit, getDocs } =
        await import("firebase/firestore");
      const start = q;
      const end = q + "\uf8ff";
      const col = collection(db, "usernames");
      const qref = query(
        col,
        where("username", ">=", start),
        where("username", "<=", end),
        orderBy("username"),
        limit(8),
      );
      const snap = await getDocs(qref as any);
      const out: MentionSuggestion[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        if (data?.username && data?.uid)
          out.push({ username: data.username, uid: data.uid });
      });
      if (out.length) {
        setSuggestions(out);
        setActiveSuggestion(0);
        setSuggestionOwner(owner || null);
        setShowSuggestions(true);
        return;
      }
    } catch {
      /* ignore */
    }

    setSuggestionOwner(null);
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  function handleMentionDetection(value: string, caret: number, owner: string) {
    const before = value.slice(0, caret);
    const at = before.lastIndexOf("@");
    if (at >= 0 && (at === 0 || /\s/.test(before[at - 1]))) {
      const partial = before.slice(at + 1);
      setMentionPartial(partial);
      if (/^[A-Za-z0-9_]{1,32}$/.test(partial)) {
        setMentionStart(at);
        if (suggestionTimerRef.current)
          window.clearTimeout(suggestionTimerRef.current);
        suggestionTimerRef.current = window.setTimeout(
          () => fetchSuggestions(partial.toLowerCase(), owner),
          200,
        ) as unknown as number;
        return;
      }
    }
    // no match — hide
    setShowSuggestions(false);
    setSuggestions([]);
    setMentionStart(null);
    setMentionPartial("");
  }

  function applySuggestion(
    username: string,
    currentValue: string,
    caretPos: number,
  ) {
    const start = mentionStart ?? currentValue.lastIndexOf("@", caretPos - 1);
    if (start < 0) return { value: currentValue, caret: caretPos };
    const before = currentValue.slice(0, start);
    const after = currentValue.slice(caretPos);
    const insert = `@${username} `;
    const newVal = before + insert + after;
    const newCaret = before.length + insert.length;
    // reset state
    setShowSuggestions(false);
    setSuggestionOwner(null);
    setSuggestions([]);
    setMentionStart(null);
    return { value: newVal, caret: newCaret };
  }

  function handleSuggestionKeyDown(key: string) {
    if (!showSuggestions || suggestions.length === 0) return { handled: false };
    if (key === "ArrowDown") {
      setActiveSuggestion((i) => Math.min(suggestions.length - 1, i + 1));
      return { handled: true };
    }
    if (key === "ArrowUp") {
      setActiveSuggestion((i) => Math.max(0, i - 1));
      return { handled: true };
    }
    if (key === "Enter") {
      const s = suggestions[activeSuggestion];
      if (s) return { handled: true, selected: s.username };
      return { handled: true };
    }
    if (key === "Escape") {
      setShowSuggestions(false);
      setSuggestionOwner(null);
      return { handled: true };
    }
    return { handled: false };
  }

  function clearMentions() {
    setShowSuggestions(false);
    setSuggestionOwner(null);
    setSuggestions([]);
    setMentionStart(null);
    setMentionPartial("");
  }

  return {
    suggestions,
    showSuggestions,
    suggestionOwner,
    activeSuggestion,
    mentionStart,
    mentionPartial,
    activeTextareaRef,
    fetchSuggestions,
    setSuggestions,
    setShowSuggestions,
    setSuggestionOwner,
    setActiveSuggestion,
    handleMentionDetection,
    applySuggestion,
    handleSuggestionKeyDown,
    clearMentions,
  };
}

/** Extract @mentions from text content */
export function extractMentions(content: string): string[] {
  const re = /@([A-Za-z0-9_]{3,32})/g;
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    set.add(m[1].toLowerCase());
  }
  return Array.from(set);
}
