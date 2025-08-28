import { addDoc, collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export async function addToDoTask(user: any, text: string, color?: string) {
  const userTasks = `users/${user.email}/ToDoTasks`;
  const userTasksCollection = collection(db, userTasks);
  return await addDoc(userTasksCollection, { text, timeAdded: Date.now(), color: color || null });
}
export async function fetchTasks(user: any) {
  const userTasks = `users/${user.email}/ToDoTasks`;
  const userTasksCollection = collection(db, userTasks);
  const snap = await getDocs(userTasksCollection);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}
export async function editTaskTitle(user: any, id: string, newTitle: string, color?: string) {
  const userTasks = `users/${user.email}/ToDoTasks`;
  const userTasksCollection = collection(db, userTasks);
  const targetDoc = doc(userTasksCollection, id);
  const payload: any = { text: newTitle };
  if(typeof color !== 'undefined') payload.color = color;
  return setDoc(targetDoc, payload, { merge: true });
}
export async function deleteTask(user: any, id: string) {
  const userTasks = `users/${user.email}/ToDoTasks`;
  const userTasksCollection = collection(db, userTasks);
  const targetDoc = doc(userTasksCollection, id);
  return deleteDoc(targetDoc);
}
