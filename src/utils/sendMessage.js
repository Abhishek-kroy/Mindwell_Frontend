import { db } from "../../context/firebase/firebase";
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { API_BASE_URL } from "./api";

export async function sendMessage(senderId, receiverId, text, options = {}) {
  if (!text.trim()) return;

  // Step 1: check if a chat already exists between these two users (UID-based)
  const chatsRef = collection(db, "chats");
  const q1 = query(chatsRef, where("senderId", "==", senderId), where("receiverId", "==", receiverId));
  const q2 = query(chatsRef, where("senderId", "==", receiverId), where("receiverId", "==", senderId));

  const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  let chatDoc = !s1.empty ? { id: s1.docs[0].id, ...s1.docs[0].data() } : (!s2.empty ? { id: s2.docs[0].id, ...s2.docs[0].data() } : null);

  // Step 2: If no chat, block sending unless explicitly allowed (e.g. psychiatrist initiated)
  if (!chatDoc) {
    if (!options.allowCreate) {
      throw new Error('Chat not available. Please wait until your request is accepted.');
    }
    const newChatRef = await addDoc(collection(db, "chats"), {
      senderId,
      receiverId,
      lastMessage: text,
      lastMessageAt: new Date(),
      createdAt: new Date()
    });
    chatDoc = { id: newChatRef.id };
  } else {
    // update chat with last message
    await updateDoc(doc(db, "chats", chatDoc.id), {
      lastMessage: text,
      lastMessageAt: new Date()
    });
  }

  // Step 3: Add message to messages subcollection
  await addDoc(collection(db, "chats", chatDoc.id, "messages"), {
    senderId,
    receiverId,
    text,
    timestamp: new Date()
  });
}
