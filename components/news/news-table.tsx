"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
  ImageIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getLocalizedText } from "@/components/language-tabs";
import type { News } from "@/lib/types";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";

interface NewsTableProps {
  news: News[];
  loading: boolean;
  onEdit: (news: News) => void;
  onDelete: (news: News) => void;
}

export function NewsTable({ news, loading, onEdit, onDelete }: NewsTableProps) {
  const language = useLocale();
  const t = useTranslations("news.table");
  const tCommon = useTranslations("common");

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("noNews")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("article")}</TableHead>
            <TableHead>{t("author")}</TableHead>
            <TableHead>{t("category")}</TableHead>
            <TableHead>{t("published")}</TableHead>
            <TableHead>{t("media")}</TableHead>
            <TableHead>{t("tags")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {news.map((newsItem) => (
            <TableRow key={newsItem._id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {getLocalizedText(newsItem.name, language)}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                    {newsItem.summary
                      ? getLocalizedText(newsItem.summary, language)
                      : getLocalizedText(newsItem.content, language).slice(
                          0,
                          100
                        ) + "..."}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="truncate max-w-24">
                    {newsItem.author || t("unknown")}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {newsItem.category ? (
                  <Badge variant="outline">{newsItem.category}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t("noCategory")}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {newsItem.publishedAt ? (
                    <div>
                      {format(new Date(newsItem.publishedAt), "MMM dd, yyyy")}
                      <br />
                      <span className="text-xs">
                        {format(new Date(newsItem.publishedAt), "HH:mm")}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="secondary">{t("draft")}</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {newsItem.bannerImage && (
                    <ImageIcon className="h-3 w-3 text-muted-foreground" />
                  )}
                  {newsItem.documents && newsItem.documents.length > 0 && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {newsItem.documents.length}
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {newsItem.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {newsItem.tags && newsItem.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{newsItem.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(newsItem)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(newsItem)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
