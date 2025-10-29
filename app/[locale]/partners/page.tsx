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
import { Plus, Search, ExternalLink } from "lucide-react";
import { PartnerForm } from "@/components/partners/partner-form";
import { PartnerTable } from "@/components/partners/partner-table";
import { partnersApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { getLocalizedText } from "@/components/language-tabs";
import type { Partner } from "@/lib/types";
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
import { useTranslations } from "next-intl";

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletePartner, setDeletePartner] = useState<Partner | null>(null);
  const { language } = useAppStore();
  const { toast } = useToast();
  const t = useTranslations();

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const data = await partnersApi.getAll();
      setPartners(data);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("partners.errorLoadingPartners"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartner = () => {
    setSelectedPartner(null);
    setIsFormOpen(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsFormOpen(true);
  };

  const handleDeletePartner = async (partner: Partner) => {
    try {
      await partnersApi.delete(partner._id!);
      await loadPartners();
      setDeletePartner(null);
      toast({
        title: t("common.success"),
        description: t("partners.partnerDeletedSuccessfully"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("partners.errorDeletingPartner"),
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (partnerData: Omit<Partner, "_id">) => {
    try {
      if (selectedPartner) {
        await partnersApi.update(selectedPartner._id!, partnerData);
        toast({
          title: t("common.success"),
          description: t("partners.partnerUpdatedSuccessfully"),
        });
      } else {
        await partnersApi.create(partnerData);
        toast({
          title: t("common.success"),
          description: t("partners.partnerCreatedSuccessfully"),
        });
      }
      await loadPartners();
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t(
          selectedPartner
            ? "partners.errorUpdatingPartner"
            : "partners.errorCreatingPartner"
        ),
        variant: "destructive",
      });
    }
  };

  const filteredPartners = partners.filter((partner) => {
    const name = getLocalizedText(partner.name, language).toLowerCase();
    const description = partner.description
      ? getLocalizedText(partner.description, language).toLowerCase()
      : "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || description.includes(search);
  });

  const partnersWithWebsite = partners.filter((p) => p.website).length;
  const partnersWithProjects = partners.filter(
    (p) => p.projects && p.projects.length > 0
  ).length;
  const totalProjectsFromPartners = partners.reduce(
    (sum, partner) => sum + (partner.projects ? partner.projects.length : 0),
    0
  );

  // Get unique projects from all partners (if populated)
  const allPartnerProjects = partners
    .flatMap((partner) => partner.projects || [])
    .filter((project, index, self) =>
      // Remove duplicates based on _id if projects are populated objects
      typeof project === "object" && project._id
        ? self.findIndex(
            (p) => typeof p === "object" && p._id === project._id
          ) === index
        : true
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("partners.title")}
            </h1>
            <p className="text-muted-foreground">{t("partners.description")}</p>
          </div>
          <Button onClick={handleCreatePartner} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("partners.addPartner")}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("partners.stats.totalPartners")}
              </CardTitle>
              <Badge variant="default">{partners.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partners.length}</div>
              <p className="text-xs text-muted-foreground">
                {t("partners.stats.activePartnerships")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("partners.stats.withWebsites")}
              </CardTitle>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnersWithWebsite}</div>
              <p className="text-xs text-muted-foreground">
                {t("partners.stats.haveWebsiteLinks")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("partners.stats.activeInProjects")}
              </CardTitle>
              <Badge variant="secondary">{partnersWithProjects}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalProjectsFromPartners}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("partners.stats.totalProjectConnections")}
              </p>
              <div className="text-sm text-muted-foreground mt-1">
                {t("partners.stats.partnersInvolved", {
                  count: partnersWithProjects,
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>{t("partners.allPartners")}</CardTitle>
            <CardDescription>
              {t("partners.viewAndManagePartners")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("partners.searchPartners")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <PartnerTable
              partners={filteredPartners}
              loading={loading}
              onEdit={handleEditPartner}
              onDelete={(partner) => setDeletePartner(partner)}
            />
          </CardContent>
        </Card>

        {/* Partner Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPartner
                  ? t("partners.editPartner")
                  : t("partners.createNewPartner")}
              </DialogTitle>
              <DialogDescription>
                {selectedPartner
                  ? t("partners.updatePartnerInformation")
                  : t("partners.addNewPartnerToOrganization")}
              </DialogDescription>
            </DialogHeader>
            <PartnerForm
              partner={selectedPartner}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deletePartner}
          onOpenChange={() => setDeletePartner(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("partners.areYouSure")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("partners.deleteConfirmation", {
                  partnerName: deletePartner
                    ? getLocalizedText(deletePartner.name, language)
                    : "",
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deletePartner && handleDeletePartner(deletePartner)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
