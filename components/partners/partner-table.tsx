"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, ExternalLink, FolderOpen } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { getLocalizedText } from "@/components/language-tabs"
import type { Partner } from "@/lib/types"

interface PartnerTableProps {
  partners: Partner[]
  loading: boolean
  onEdit: (partner: Partner) => void
  onDelete: (partner: Partner) => void
}

export function PartnerTable({ partners, loading, onEdit, onDelete }: PartnerTableProps) {
  const { language } = useAppStore()

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (partners.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No partners found</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Partner</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Projects</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.map((partner) => (
            <TableRow key={partner._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {partner.logo && (
                      <AvatarImage
                        src={partner.logo || "/placeholder.svg"}
                        alt={getLocalizedText(partner.name, language)}
                      />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getLocalizedText(partner.name, language)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{getLocalizedText(partner.name, language)}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                  {partner.description ? getLocalizedText(partner.description, language) : "No description"}
                </div>
              </TableCell>
              <TableCell>
                {partner.website ? (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-accent hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">No website</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FolderOpen className="h-3 w-3" />
                  {partner.projects?.length || 0} projects
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(partner)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(partner)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
