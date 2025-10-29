"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import type { User } from "@/lib/types";

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: Omit<User, "_id">) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "editor";
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const t = useTranslations("users.form");
  const tc = useTranslations("common");
  const [showPassword, setShowPassword] = useState(false);
  const isEditMode = !!user;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "", // Always empty for security
      role: user?.role || "editor",
    },
  });

  const watchedName = watch("name");
  const watchedEmail = watch("email");

  const onFormSubmit = (data: FormData) => {
    const userData: Omit<User, "_id"> = {
      name: data.name || undefined,
      email: data.email,
      role: data.role,
    };

    // Only include password if it's provided (for creation or password update)
    if (data.password) {
      userData.password = data.password;
    }

    onSubmit(userData);
  };

  const getUserInitials = () => {
    if (watchedName) {
      return watchedName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (watchedEmail) {
      return watchedEmail.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 w-full max-w-none">
      {/* User Avatar */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-wrap break-words">{t("userProfile")}</h3>
          <p className="text-sm text-muted-foreground text-wrap break-words">
            {isEditMode ? t("updateUserInfo") : t("createNewUser")}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg text-wrap break-words">{t("basicInformation")}</CardTitle>
          <CardDescription className="text-wrap break-words">{t("accountDetails")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 w-full">
          {/* Name */}
          <div className="space-y-2 w-full">
            <Label htmlFor="name" className="text-wrap break-words">{t("fullName")}</Label>
            <Input
              id="name"
              placeholder={t("fullNamePlaceholder")}
              className="w-full"
              {...register("name")}
            />
          </div>

          {/* Email */}
          <div className="space-y-2 w-full">
            <Label htmlFor="email" className="text-wrap break-words">{t("emailAddress")} *</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              className="w-full"
              {...register("email", {
                required: t("emailRequired"),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t("invalidEmail"),
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-destructive text-wrap break-words">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2 w-full">
            <Label htmlFor="password" className="text-wrap break-words">
              {t("password")} {!isEditMode && "*"}
            </Label>
            <div className="relative w-full">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  isEditMode
                    ? t("passwordPlaceholderEdit")
                    : t("passwordPlaceholder")
                }
                className="w-full pr-10"
                {...register("password", {
                  required: !isEditMode ? t("passwordRequired") : false,
                  minLength: {
                    value: 6,
                    message: t("passwordMinLength"),
                  },
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 flex-shrink-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive text-wrap break-words">
                {errors.password.message}
              </p>
            )}
            {/* {isEditMode && (
              <p className="text-sm text-muted-foreground">
                {t("keepCurrentPassword")}
              </p>
            )} */}
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg text-wrap break-words">{t("permissionsRole")}</CardTitle>
          <CardDescription className="text-wrap break-words">{t("setUserRole")}</CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <div className="space-y-2 w-full">
            <Label className="text-wrap break-words">{t("userRole")} *</Label>
            <Controller
              name="role"
              control={control}
              rules={{ required: t("roleRequired") }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("selectUserRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col min-w-0">
                          <span className="text-wrap break-words">{t("editorRole")}</span>
                          <span className="text-xs text-muted-foreground text-wrap break-words">
                            {t("editorDescription")}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col min-w-0">
                          <span className="text-wrap break-words">{t("adminRole")}</span>
                          <span className="text-xs text-muted-foreground text-wrap break-words">
                            {t("adminDescription")}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-sm text-destructive text-wrap break-words">{errors.role.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 flex-wrap">
        <Button type="button" variant="outline" onClick={onCancel} className="text-wrap break-words">
          {tc("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting} className="text-wrap break-words">
          {isSubmitting
            ? t("saving")
            : isEditMode
            ? t("updateUser")
            : t("createUser")}
        </Button>
      </div>
    </form>
  );
}
