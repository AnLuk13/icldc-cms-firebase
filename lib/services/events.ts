import { getAdminDb } from "@/lib/firebase/admin";
import type { Event } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "events";

function docToEvent(doc: FirebaseFirestore.DocumentSnapshot): Event {
  const data = doc.data()!;
  return {
    ...data,
    _id: doc.id,
    startDate: data.startDate?.toDate?.() ?? data.startDate,
    endDate: data.endDate?.toDate?.() ?? data.endDate,
    createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
  } as Event;
}

export async function getEvents(): Promise<Event[]> {
  const snapshot = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map(docToEvent);
}

export async function getEventById(id: string): Promise<Event | null> {
  const doc = await getAdminDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return docToEvent(doc);
}

export async function createEvent(data: Omit<Event, "_id">): Promise<Event> {
  const payload = {
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  const ref = await getAdminDb().collection(COLLECTION).add(payload);
  const doc = await ref.get();
  return docToEvent(doc);
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<Event, "_id">>,
): Promise<Event> {
  const ref = getAdminDb().collection(COLLECTION).doc(id);
  await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  const doc = await ref.get();
  return docToEvent(doc);
}

export async function deleteEvent(id: string): Promise<void> {
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
