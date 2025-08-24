// Vertex AI SDK (ensure firebase version supports vertexai, otherwise guard)
let getVertexAI: any, getGenerativeModel: any;
try {
  // @ts-ignore dynamic optional import
  ({ getVertexAI, getGenerativeModel } = require("firebase/vertexai"));
} catch {
  console.warn("firebase/vertexai not available - AI responses will fail");
}
import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAW_RZlJOe595z9cZf-Dzao0kAqlNIjiSk",
  authDomain: "lair-of-evil-tools.firebaseapp.com",
  projectId: "lair-of-evil-tools",
  storageBucket: "lair-of-evil-tools.appspot.com",
  messagingSenderId: "484461115908",
  appId: "1:484461115908:web:5c90bfa6d7ef9eb9c15351",
  measurementId: "G-BRT98Q1Z87",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const AI = getVertexAI ? getVertexAI(app) : null;
const model = AI && getGenerativeModel ? getGenerativeModel(AI, { model: "gemini-1.0-pro-vision" }) : null;

export async function getAIResponse(prompt: string) {
  if (!model) throw new Error("Vertex AI model not initialized");
  const result = await model.generateContent(prompt);
  return result.response.text();
}
