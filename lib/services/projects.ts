import { getAdminDb } from "@/lib/firebase/admin";
import type { Project } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "projects";

function docToProject(doc: FirebaseFirestore.DocumentSnapshot): Project {
  const data = doc.data()!;
  return {
    ...data,
    _id: doc.id,
    startDate: data.startDate?.toDate?.() ?? data.startDate,
    endDate: data.endDate?.toDate?.() ?? data.endDate,
    createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
  } as Project;
}

export async function getProjects(filters?: {
  status?: string;
  partner?: string;
}): Promise<Project[]> {
  let query: FirebaseFirestore.Query = getAdminDb().collection(COLLECTION);

  if (filters?.status) {
    query = query.where("status", "==", filters.status);
  }
  if (filters?.partner) {
    query = query.where("partners", "array-contains", filters.partner);
  }

  const snapshot = await query.orderBy("createdAt", "desc").get();
  return snapshot.docs.map(docToProject);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const doc = await getAdminDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return docToProject(doc);
}

export async function createProject(
  data: Omit<Project, "_id">,
): Promise<Project> {
  const payload = {
    ...data,
    status: data.status ?? "planned",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  const ref = await getAdminDb().collection(COLLECTION).add(payload);
  const doc = await ref.get();
  return docToProject(doc);
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "_id">>,
): Promise<Project> {
  const ref = getAdminDb().collection(COLLECTION).doc(id);
  await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  const doc = await ref.get();
  return docToProject(doc);
}

export async function deleteProject(id: string): Promise<void> {
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
