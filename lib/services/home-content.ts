import { getAdminDb } from "@/lib/firebase/admin";
import type { HomeContent } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

const DOC_PATH = "site-config/home-content";

export async function getHomeContent(): Promise<HomeContent | null> {
  const doc = await getAdminDb().doc(DOC_PATH).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt,
  } as HomeContent;
}

export async function upsertHomeContent(
  data: Omit<HomeContent, "id" | "createdAt" | "updatedAt">,
): Promise<HomeContent> {
  const ref = getAdminDb().doc(DOC_PATH);
  const existing = await ref.get();

  if (existing.exists) {
    await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  } else {
    await ref.set({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  const updated = await ref.get();
  const updatedData = updated.data()!;
  return {
    ...updatedData,
    id: updated.id,
    createdAt:
      updatedData.createdAt?.toDate?.()?.toISOString() ?? updatedData.createdAt,
    updatedAt:
      updatedData.updatedAt?.toDate?.()?.toISOString() ?? updatedData.updatedAt,
  } as HomeContent;
}
