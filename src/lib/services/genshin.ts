import { db } from '@/lib/firebase/client';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

const WIKI_ROOT = 'GenshinWiki';
const TEVYAT_DOC_ID = 'Tevyat';

function tevyatDocRef(){
  return doc(collection(db, WIKI_ROOT), TEVYAT_DOC_ID);
}

export async function getElements(){
  const d = await getDoc(tevyatDocRef());
  return d.data()?.elements;
}
export async function getWeaponTypes(){
  const d = await getDoc(tevyatDocRef());
  return d.data()?.weaponTypes;
}
export async function getRegions(){
  const d = await getDoc(tevyatDocRef());
  return d.data()?.regions;
}

// Characters
const CHAR_COLLECTION_PATH = `${WIKI_ROOT}/${TEVYAT_DOC_ID}/Characters`;
function charactersCollection(){ return collection(db, CHAR_COLLECTION_PATH); }

export async function getCharacter(name: string){
  const d = await getDoc(doc(charactersCollection(), name));
  return d.data();
}
export async function getCharacterList(){
  const snap = await getDocs(charactersCollection());
  const list: any[] = []; snap.forEach(docu => list.push(docu.data()));
  return list;
}
// (Admin create functions omitted in migration per requirement)
