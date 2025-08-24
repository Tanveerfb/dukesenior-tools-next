import { addDoc, collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export async function addToDoTask(user: any, text: string) {
  const userTasks = `users/${user.email}/ToDoTasks`;
  const userTasksCollection = collection(db, userTasks);
  return await addDoc(userTasksCollection, { text, timeAdded: Date.now() });
}
export async function fetchTasks(user: any) {
  const userTasks = `users/${user.email}/ToDoTasks`;
  const userTasksCollection = collection(db, userTasks);
  const snap = await getDocs(userTasksCollection);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}
export async function editTaskTitle(user: any, id: string, newTitle: string) {
  const userTasks = `users/${user.email}/ToDoTasks`;
  const userTasksCollection = collection(db, userTasks);
  const targetDoc = doc(userTasksCollection, id);
  return setDoc(targetDoc, { text: newTitle }, { merge: true });
}
export async function deleteTask(user: any, id: string) {
  const userTasks = `users/${user.email}/ToDoTasks`;
  const userTasksCollection = collection(db, userTasks);
  const targetDoc = doc(userTasksCollection, id);
  return deleteDoc(targetDoc);
}
