"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, ExternalLink } from "lucide-react"
import { PartnerForm } from "@/components/partners/partner-form"
import { PartnerTable } from "@/components/partners/partner-table"
import { partnersApi } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { getLocalizedText } from "@/components/language-tabs"
import type { Partner } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletePartner, setDeletePartner] = useState<Partner | null>(null)
  const { language } = useAppStore()
  const { toast } = useToast()

  useEffect(() => {
    loadPartners()
  }, [])

  const loadPartners = async () => {
    try {
      setLoading(true)
      const data = await partnersApi.getAll()
      setPartners(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load partners",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePartner = () => {
    setSelectedPartner(null)
    setIsFormOpen(true)
  }

  const handleEditPartner = (partner: Partner) => {
    setSelectedPartner(partner)
    setIsFormOpen(true)
  }

  const handleDeletePartner = async (partner: Partner) => {
    try {
      await partnersApi.delete(partner._id!)
      await loadPartners()
      setDeletePartner(null)
      toast({
        title: "Success",
        description: "Partner deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive",
      })
    }
  }

  const handleFormSubmit = async (partnerData: Omit<Partner, "_id">) => {
    try {
      if (selectedPartner) {
        await partnersApi.update(selectedPartner._id!, partnerData)
        toast({
          title: "Success",
          description: "Partner updated successfully",
        })
      } else {
        await partnersApi.create(partnerData)
        toast({
          title: "Success",
          description: "Partner created successfully",
        })
      }
      await loadPartners()
      setIsFormOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${selectedPartner ? "update" : "create"} partner`,
        variant: "destructive",
      })
    }
  }

  const filteredPartners = partners.filter((partner) => {
    const name = getLocalizedText(partner.name, language).toLowerCase()
    const description = partner.description ? getLocalizedText(partner.description, language).toLowerCase() : ""
    const search = searchTerm.toLowerCase()
    return name.includes(search) || description.includes(search)
  })

  const partnersWithWebsite = partners.filter((p) => p.website).length
  const partnersWithProjects = partners.filter((p) => p.projects && p.projects.length > 0).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Partners</h1>
            <p className="text-muted-foreground">Manage your organization's partners and collaborators</p>
          </div>
          <Button onClick={handleCreatePartner} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Partner
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
              <Badge variant="default">{partners.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partners.length}</div>
              <p className="text-xs text-muted-foreground">Active partnerships</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Websites</CardTitle>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnersWithWebsite}</div>
              <p className="text-xs text-muted-foreground">Have website links</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active in Projects</CardTitle>
              <Badge variant="secondary">{partnersWithProjects}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnersWithProjects}</div>
              <p className="text-xs text-muted-foreground">Involved in projects</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>All Partners</CardTitle>
            <CardDescription>View and manage all your partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
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
              <DialogTitle>{selectedPartner ? "Edit Partner" : "Create New Partner"}</DialogTitle>
              <DialogDescription>
                {selectedPartner ? "Update partner information" : "Add a new partner to your organization"}
              </DialogDescription>
            </DialogHeader>
            <PartnerForm partner={selectedPartner} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletePartner} onOpenChange={() => setDeletePartner(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the partner "
                {deletePartner && getLocalizedText(deletePartner.name, language)}" and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletePartner && handleDeletePartner(deletePartner)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
