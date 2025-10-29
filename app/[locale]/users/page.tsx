"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Shield, ShieldCheck } from "lucide-react";
import { UserForm } from "@/components/users/user-form";
import { UserTable } from "@/components/users/user-table";
import { usersApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import type { User } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { user } = useAppStore();
  const router = useRouter();
  const t = useTranslations("users");
  const tc = useTranslations("common");

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      toast({
        title: tc("error"),
        description: t("errorLoadingUsers"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await usersApi.delete(user._id!);
      await loadUsers();
      setDeleteUser(null);
      toast({
        title: tc("success"),
        description: t("userDeletedSuccessfully"),
      });
    } catch (error) {
      toast({
        title: tc("error"),
        description: t("errorDeletingUser"),
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (userData: Omit<User, "_id">) => {
    try {
      if (selectedUser) {
        await usersApi.update(selectedUser._id!, userData);
        toast({
          title: tc("success"),
          description: t("userUpdatedSuccessfully"),
        });
      } else {
        await usersApi.create(userData);
        toast({
          title: tc("success"),
          description: t("userCreatedSuccessfully"),
        });
      }
      await loadUsers();
      setIsFormOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: tc("error"),
        description: t(
          selectedUser ? "errorUpdatingUser" : "errorCreatingUser"
        ),
        variant: "destructive",
      });
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  const filteredUsers = users.filter((user) => {
    const name = user.name?.toLowerCase() || "";
    const email = user.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  const roleCounts = {
    admin: users.filter((u) => u.role === "admin").length,
    editor: users.filter((u) => u.role === "editor").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <Button onClick={handleCreateUser} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("addUser")}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("totalUsers")}
              </CardTitle>
              <Badge variant="default">{users.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {t("registeredUsers")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("administrators")}
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleCounts.admin}</div>
              <p className="text-xs text-muted-foreground">{t("adminUsers")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("editors")}
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleCounts.editor}</div>
              <p className="text-xs text-muted-foreground">
                {t("editorUsers")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>{t("allUsers")}</CardTitle>
            <CardDescription>{t("viewAndManageUsers")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("searchUsersPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <UserTable
              users={filteredUsers}
              loading={loading}
              onEdit={handleEditUser}
              onDelete={setDeleteUser}
            />
          </CardContent>
        </Card>

        {/* User Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-wrap break-words">
                {selectedUser ? t("editUser") : t("createUser")}
              </DialogTitle>
              <DialogDescription className="text-wrap break-words">
                {selectedUser ? t("updateUserInfo") : t("addNewUser")}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              user={selectedUser}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteUser}
          onOpenChange={() => setDeleteUser(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("deleteUserWarning", {
                  userName: deleteUser?.name || deleteUser?.email || "",
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteUser && handleDeleteUser(deleteUser)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("deleteUser")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
