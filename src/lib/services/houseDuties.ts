import { db } from '@/lib/firebase/client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  deleteDoc,
  where,
  updateDoc,
  limit,
} from 'firebase/firestore';
import {
  Checklist,
  NewChecklistInput,
  UpdateChecklistInput,
} from '@/types/houseDuties';

const CHECKLISTS_COL = 'house_duties_checklists';

/**
 * Create a new checklist
 */
export async function createChecklist(
  uid: string,
  authorName: string,
  input: NewChecklistInput
): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const ref = doc(db, CHECKLISTS_COL, id);
  
  const checklist: Checklist = {
    id,
    name: input.name,
    description: input.description || '',
    duties: input.duties,
    people: input.people,
    assignments: input.assignments,
    createdAt: now,
    updatedAt: now,
    createdBy: uid,
    createdByName: authorName,
    isTemplate: input.isTemplate,
  };
  
  await setDoc(ref, checklist);
  return id;
}

/**
 * Update an existing checklist
 */
export async function updateChecklist(input: UpdateChecklistInput): Promise<void> {
  const ref = doc(db, CHECKLISTS_COL, input.id);
  await updateDoc(ref, {
    ...input,
    updatedAt: Date.now(),
  });
}

/**
 * Delete a checklist
 */
export async function deleteChecklist(id: string): Promise<void> {
  await deleteDoc(doc(db, CHECKLISTS_COL, id));
}

/**
 * Get a single checklist by ID
 */
export async function getChecklist(id: string): Promise<Checklist | undefined> {
  const snap = await getDoc(doc(db, CHECKLISTS_COL, id));
  return snap.data() as Checklist | undefined;
}

/**
 * List all checklists for a user
 */
export async function listChecklistsForUser(
  uid: string,
  limitCount = 50
): Promise<Checklist[]> {
  const q = query(
    collection(db, CHECKLISTS_COL),
    where('createdBy', '==', uid),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );
  
  const snap = await getDocs(q);
  const list: Checklist[] = [];
  snap.forEach((d) => list.push(d.data() as Checklist));
  return list;
}

/**
 * List only templates for a user
 */
export async function listTemplatesForUser(
  uid: string,
  limitCount = 50
): Promise<Checklist[]> {
  const q = query(
    collection(db, CHECKLISTS_COL),
    where('createdBy', '==', uid),
    where('isTemplate', '==', true),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );
  
  const snap = await getDocs(q);
  const list: Checklist[] = [];
  snap.forEach((d) => list.push(d.data() as Checklist));
  return list;
}

/**
 * List only non-template checklists (active lists) for a user
 */
export async function listActiveChecklistsForUser(
  uid: string,
  limitCount = 50
): Promise<Checklist[]> {
  const q = query(
    collection(db, CHECKLISTS_COL),
    where('createdBy', '==', uid),
    where('isTemplate', '==', false),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );
  
  const snap = await getDocs(q);
  const list: Checklist[] = [];
  snap.forEach((d) => list.push(d.data() as Checklist));
  return list;
}

/**
 * Duplicate a checklist (useful for creating from template)
 */
export async function duplicateChecklist(
  sourceId: string,
  uid: string,
  authorName: string,
  newName: string,
  isTemplate: boolean
): Promise<string> {
  const source = await getChecklist(sourceId);
  if (!source) {
    throw new Error('Source checklist not found');
  }
  
  const input: NewChecklistInput = {
    name: newName,
    description: source.description,
    duties: source.duties,
    people: source.people,
    assignments: source.assignments,
    isTemplate,
  };
  
  return createChecklist(uid, authorName, input);
}
