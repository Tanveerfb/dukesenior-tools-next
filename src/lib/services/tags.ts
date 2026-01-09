import { db } from '@/lib/firebase/client';
import { collection, doc, getDoc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { taggedManifest } from '@/lib/content/tags';

export interface RouteTagOverrideDoc {
  tags: string[];        // override tags
  mode?: 'merge' | 'replace';
  title?: string;
  description?: string;
  updatedAt: number;
  updatedBy?: string;
}

const ROUTE_META_COLLECTION = 'contentMeta';

function normalizePath(path: string){
  if(!path.startsWith('/')) path = '/' + path; return path.replace(/\/$/,'');
}

export async function getRouteOverride(path: string){
  const p = normalizePath(path);
  const ref = doc(collection(db, ROUTE_META_COLLECTION), encodeURIComponent(p));
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() as RouteTagOverrideDoc : null;
}

export function getStaticMeta(path: string){
  const p = normalizePath(path);
  return taggedManifest.find(m => m.path === p) || null;
}

export async function getEffectiveRouteMeta(path: string){
  const staticMeta = getStaticMeta(path);
  const override = await getRouteOverride(path);
  const staticTags = staticMeta?.tags || [];
  const overrideTags = override?.tags || [];
  const mode = override?.mode || 'merge';
  const effective = mode === 'replace' ? overrideTags : Array.from(new Set([...staticTags, ...overrideTags]));
  return { path: normalizePath(path), staticTags, override: override || null, effective, title: override?.title || staticMeta?.title || '', description: override?.description || staticMeta?.description || '' };
}

export async function upsertRouteOverride(path: string, payload: { tags: string[]; mode?: 'merge'|'replace'; title?: string; description?: string; user?: string; }){
  const p = normalizePath(path);
  const ref = doc(collection(db, ROUTE_META_COLLECTION), encodeURIComponent(p));
  const data: RouteTagOverrideDoc = { tags: dedupe(sortTags(payload.tags)), mode: payload.mode || 'merge', title: payload.title, description: payload.description, updatedAt: Date.now(), updatedBy: payload.user };
  await setDoc(ref, data, { merge: true });
  return data;
}

export async function deleteRouteOverride(path: string){
  const p = normalizePath(path);
  const ref = doc(collection(db, ROUTE_META_COLLECTION), encodeURIComponent(p));
  await deleteDoc(ref);
}

export async function listAllOverrides(){
  const col = collection(db, ROUTE_META_COLLECTION);
  const snap = await getDocs(col); const list: { path: string; data: RouteTagOverrideDoc }[] = [];
  snap.forEach(d => { list.push({ path: decodeURIComponent(d.id), data: d.data() as RouteTagOverrideDoc }); });
  return list;
}

// Validation helpers
const TAG_PATTERN = /^[A-Z][A-Za-z0-9]*(?:[A-Z][A-Za-z0-9]*)*$/;
export function validateTag(name: string){ return TAG_PATTERN.test(name); }
export function dedupe(arr: string[]){ return Array.from(new Set(arr)); }
export function sortTags(arr: string[]){ return [...arr].sort(); }

