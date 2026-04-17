import { getAdminDb } from "@/lib/firebase/admin";
import type { Partner } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "partners";
const PROJECTS_COLLECTION = "projects";

function docToPartner(doc: FirebaseFirestore.DocumentSnapshot): Partner {
  const data = doc.data()!;
  return {
    ...data,
    _id: doc.id,
    createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
  } as Partner;
}

/** Sync Project.partners[] when a partner's project associations change. */
async function syncProjectPartners(
  partnerId: string,
  addedProjectIds: string[],
  removedProjectIds: string[],
): Promise<void> {
  if (addedProjectIds.length === 0 && removedProjectIds.length === 0) return;
  const db = getAdminDb();
  const batch = db.batch();
  for (const projectId of addedProjectIds) {
    batch.update(db.collection(PROJECTS_COLLECTION).doc(projectId), {
      partners: FieldValue.arrayUnion(partnerId),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  for (const projectId of removedProjectIds) {
    batch.update(db.collection(PROJECTS_COLLECTION).doc(projectId), {
      partners: FieldValue.arrayRemove(partnerId),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
}

export async function getPartners(): Promise<Partner[]> {
  const snapshot = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map(docToPartner);
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  const doc = await getAdminDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return docToPartner(doc);
}

export async function createPartner(
  data: Omit<Partner, "_id">,
): Promise<Partner> {
  const payload = {
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  const ref = await getAdminDb().collection(COLLECTION).add(payload);
  const doc = await ref.get();
  const partner = docToPartner(doc);

  // Add this partner to each selected project's partners array
  const projectIds = (data.projects ?? []).map((p) =>
    typeof p === "object" ? (p as any)._id ?? String(p) : String(p),
  ).filter(Boolean);
  await syncProjectPartners(partner._id!, projectIds, []);

  return partner;
}

export async function updatePartner(
  id: string,
  data: Partial<Omit<Partner, "_id">>,
): Promise<Partner> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);

  // Get the current project associations before the update
  const existing = await ref.get();
  const oldProjectIds: string[] = existing.exists
    ? ((existing.data()!.projects ?? []) as string[]).map(String)
    : [];

  const newProjectIds: string[] = (data.projects ?? oldProjectIds).map((p) =>
    typeof p === "object" ? (p as any)._id ?? String(p) : String(p),
  ).filter(Boolean);

  await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  const doc = await ref.get();

  // Compute diff and sync projects
  const added = newProjectIds.filter((pid) => !oldProjectIds.includes(pid));
  const removed = oldProjectIds.filter((pid) => !newProjectIds.includes(pid));
  await syncProjectPartners(id, added, removed);

  return docToPartner(doc);
}

export async function deletePartner(id: string): Promise<void> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);

  // Remove this partner from all associated projects before deleting
  const existing = await ref.get();
  if (existing.exists) {
    const projectIds: string[] = ((existing.data()!.projects ?? []) as string[]).map(String);
    await syncProjectPartners(id, [], projectIds);
  }

  await ref.delete();
}
