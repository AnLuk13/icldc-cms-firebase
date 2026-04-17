import { getAdminDb } from "@/lib/firebase/admin";
import type { News } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "news";

function docToNews(doc: FirebaseFirestore.DocumentSnapshot): News {
  const data = doc.data()!;
  return {
    ...data,
    _id: doc.id,
    createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
  } as News;
}

export async function getNews(): Promise<News[]> {
  const snapshot = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map(docToNews);
}

export async function getNewsById(id: string): Promise<News | null> {
  const doc = await getAdminDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return docToNews(doc);
}

export async function createNews(data: Omit<News, "_id">): Promise<News> {
  const payload = {
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  const ref = await getAdminDb().collection(COLLECTION).add(payload);
  const doc = await ref.get();
  return docToNews(doc);
}

export async function updateNews(
  id: string,
  data: Partial<Omit<News, "_id">>,
): Promise<News> {
  const ref = getAdminDb().collection(COLLECTION).doc(id);
  await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  const doc = await ref.get();
  return docToNews(doc);
}

export async function deleteNews(id: string): Promise<void> {
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
