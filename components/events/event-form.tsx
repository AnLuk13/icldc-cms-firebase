"use client";

import type React from "react";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, ImageIcon } from "lucide-react";
import {
  LanguageTabs,
  createEmptyMultilingualText,
} from "@/components/language-tabs";
import { uploadToStorage, deleteFromStorage } from "@/lib/api";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import type { Event, Language, MultilingualText } from "@/lib/types";
import { useTranslations } from "next-intl";

interface EventFormProps {
  event?: Event | null;
  onSubmit: (data: Omit<Event, "_id">) => void;
  onCancel: () => void;
}

interface FormData {
  name: MultilingualText;
  description: MultilingualText;
  location: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  organizer: string;
  registrationLink: string;
  bannerImage: string;
  tags: string[];
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const t = useTranslations("events.form");
  const tCommon = useTranslations("common");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: event?.name
        ? typeof event.name === "string"
          ? { en: event.name, ro: "", ru: "" }
          : event.name
        : createEmptyMultilingualText(),
      description: event?.description
        ? typeof event.description === "string"
          ? { en: event.description, ro: "", ru: "" }
          : event.description
        : createEmptyMultilingualText(),
      location: event?.location || "",
      startDate: event?.startDate ? new Date(event.startDate) : undefined,
      endDate: event?.endDate ? new Date(event.endDate) : undefined,
      organizer: event?.organizer || "",
      registrationLink: event?.registrationLink || "",
      bannerImage: event?.bannerImage || "",
      tags: event?.tags || [],
    },
  });

  const watchedTags = watch("tags");
  const watchedBannerImage = watch("bannerImage");

  const handleAddTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue("tags", [...watchedTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleBannerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const currentUrl = watchedBannerImage;
      if (currentUrl) deleteFromStorage(currentUrl).catch(console.error);
      const url = await uploadToStorage(file, "events/banners");
      setValue("bannerImage", url);
    } catch (error) {
      console.error("Banner upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBanner = () => {
    const url = watchedBannerImage;
    setValue("bannerImage", "");
    if (url) deleteFromStorage(url).catch(console.error);
  };

  const onFormSubmit = (data: FormData) => {
    const eventData = {
      ...data,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      location: data.location || null,
      organizer: data.organizer || null,
      registrationLink: data.registrationLink || null,
      bannerImage: data.bannerImage || null,
    };
    onSubmit(eventData as Omit<Event, "_id">);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Event Name */}
      <div className="space-y-2">
        <Label>
          {t("eventName")} {tCommon("required")}
        </Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Input
                placeholder={t("eventNamePlaceholder", {
                  language: language.toUpperCase(),
                })}
                {...register(`name.${language}`, {
                  required: language === "en" ? t("eventNameRequired") : false,
                })}
              />
              {errors.name?.[language] && (
                <p className="text-sm text-destructive">
                  {errors.name[language]?.message}
                </p>
              )}
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Event Description */}
      <div className="space-y-2">
        <Label>{t("description")}</Label>
        <LanguageTabs>
          {(language: Language) => (
            <div className="space-y-2">
              <Textarea
                placeholder={t("descriptionPlaceholder", {
                  language: language.toUpperCase(),
                })}
                rows={4}
                {...register(`description.${language}`)}
              />
            </div>
          )}
        </LanguageTabs>
      </div>

      {/* Location and Organizer */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("location")}</Label>
          <Input
            placeholder={t("locationPlaceholder")}
            {...register("location")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("organizer")}</Label>
          <Input
            placeholder={t("organizerPlaceholder")}
            {...register("organizer")}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>
            {t("startDate")} {tCommon("required")}
          </Label>
          <Controller
            name="startDate"
            control={control}
            rules={{ required: t("startDateRequired") }}
            render={({ field }) => (
              <DateTimePicker
                value={field.value}
                onChange={field.onChange}
                showTime
                placeholder={t("startDate")}
              />
            )}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t("endDate")}</Label>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                value={field.value}
                onChange={field.onChange}
                showTime
                placeholder={t("endDate")}
              />
            )}
          />
        </div>
      </div>

      {/* Registration Link */}
      <div className="space-y-2">
        <Label>{t("registrationLink")}</Label>
        <Input
          type="url"
          placeholder={t("registrationPlaceholder")}
          {...register("registrationLink", {
            pattern: {
              value: /^https?:\/\/.+/,
              message: tCommon("validUrl"),
            },
          })}
        />
        {errors.registrationLink && (
          <p className="text-sm text-destructive">
            {errors.registrationLink.message}
          </p>
        )}
      </div>

      {/* Banner Image */}
      <div className="space-y-2">
        <Label>{t("bannerImage")}</Label>
        {watchedBannerImage ? (
          <div className="space-y-2">
            <div className="relative">
              <img
                src={watchedBannerImage || "/placeholder.svg"}
                alt={t("bannerImageAlt")}
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveBanner}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
              id="banner-upload"
            />
            <label
              htmlFor="banner-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {uploading ? tCommon("uploading") : t("bannerUploadText")}
              </p>
            </label>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>{t("tags")}</Label>
        <div className="flex gap-2">
          <Input
            placeholder={t("tagPlaceholder")}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddTag())
            }
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            {tCommon("add")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {watchedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting
            ? tCommon("saving")
            : event
              ? t("updateEvent")
              : t("createEvent")}
        </Button>
      </div>
    </form>
  );
}
