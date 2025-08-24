import { db } from '@/lib/firebase/client';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

export interface TagRegistryEntry { description?: string; color?: string; protected?: boolean; createdAt: number; updatedAt: number; }

const REG_COL = 'tagRegistry';

export async function listTagRegistry(){
  const snap = await getDocs(collection(db, REG_COL));
  const list: { name:string; data:TagRegistryEntry }[] = [];
  snap.forEach(d => list.push({ name: d.id, data: d.data() as TagRegistryEntry }));
  return list;
}
export async function getTagRegistryEntry(name: string){
  const ref = doc(collection(db, REG_COL), name);
  const snap = await getDoc(ref); return snap.exists() ? snap.data() as TagRegistryEntry : null;
}
export async function upsertTagRegistryEntry(name: string, data: Partial<TagRegistryEntry>){
  const ref = doc(collection(db, REG_COL), name);
  const existing = await getDoc(ref);
  const now = Date.now();
  const payload: TagRegistryEntry = { description: data.description, color: data.color, protected: data.protected || false, createdAt: existing.exists() ? (existing.data() as any).createdAt : now, updatedAt: now };
  await setDoc(ref, payload, { merge: true });
  return payload;
}
export async function deleteTagRegistryEntry(name: string){
  const ref = doc(collection(db, REG_COL), name); await deleteDoc(ref);
}
