import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import type { UpdateRequest } from "firebase-admin/auth";
import type { User } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "users";

function docToUser(
  doc: FirebaseFirestore.DocumentSnapshot,
): Omit<User, "password"> {
  const data = doc.data()!;
  return {
    _id: doc.id,
    email: data.email,
    name: data.name,
    role: data.role,
    createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
  };
}

export async function getUsers(): Promise<Omit<User, "password">[]> {
  const snapshot = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map(docToUser);
}

export async function getUserById(
  id: string,
): Promise<Omit<User, "password"> | null> {
  const doc = await getAdminDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return docToUser(doc);
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: "admin" | "editor";
}

/**
 * Creates a Firebase Auth user, sets the role custom claim,
 * and writes the user profile to Firestore.
 */
export async function createUser(
  data: CreateUserInput,
): Promise<Omit<User, "password">> {
  const authUser = await getAdminAuth().createUser({
    email: data.email,
    password: data.password,
    displayName: data.name,
  });

  // Set role as custom claim for fast authorization
  await getAdminAuth().setCustomUserClaims(authUser.uid, { role: data.role });

  const payload = {
    email: data.email,
    name: data.name,
    role: data.role,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await getAdminDb().collection(COLLECTION).doc(authUser.uid).set(payload);

  return {
    _id: authUser.uid,
    email: data.email,
    name: data.name,
    role: data.role,
  };
}

export interface UpdateUserInput {
  name?: string;
  role?: "admin" | "editor";
  email?: string;
  password?: string;
}

export async function updateUser(
  id: string,
  data: UpdateUserInput,
): Promise<Omit<User, "password">> {
  const authUpdate: UpdateRequest = {};
  if (data.email) authUpdate.email = data.email;
  if (data.password) authUpdate.password = data.password;
  if (data.name) authUpdate.displayName = data.name;

  await getAdminAuth().updateUser(id, authUpdate);

  if (data.role) {
    await getAdminAuth().setCustomUserClaims(id, { role: data.role });
  }

  const firestoreUpdate: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (data.name) firestoreUpdate.name = data.name;
  if (data.email) firestoreUpdate.email = data.email;
  if (data.role) firestoreUpdate.role = data.role;

  await getAdminDb().collection(COLLECTION).doc(id).update(firestoreUpdate);

  const doc = await getAdminDb().collection(COLLECTION).doc(id).get();
  return docToUser(doc);
}

export async function deleteUser(id: string): Promise<void> {
  await getAdminAuth().deleteUser(id);
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
