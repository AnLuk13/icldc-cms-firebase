"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Calendar, MapPin, ExternalLink, User } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { getLocalizedText } from "@/components/language-tabs"
import type { Event } from "@/lib/types"
import { format, isAfter, isBefore, startOfDay } from "date-fns"

interface EventTableProps {
  events: Event[]
  loading: boolean
  onEdit: (event: Event) => void
  onDelete: (event: Event) => void
}

function getEventStatus(event: Event): { status: string; variant: "default" | "secondary" | "outline" } {
  const today = startOfDay(new Date())

  if (event.startDate && event.endDate) {
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    if (isBefore(startDate, today) && isAfter(endDate, today)) {
      return { status: "ongoing", variant: "default" }
    }
    if (isAfter(startDate, today)) {
      return { status: "upcoming", variant: "outline" }
    }
    if (isBefore(endDate, today)) {
      return { status: "completed", variant: "secondary" }
    }
  }

  if (event.startDate && isAfter(new Date(event.startDate), today)) {
    return { status: "upcoming", variant: "outline" }
  }

  return { status: "scheduled", variant: "outline" }
}

export function EventTable({ events, loading, onEdit, onDelete }: EventTableProps) {
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

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No events found</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Organizer</TableHead>
            <TableHead>Registration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            const eventStatus = getEventStatus(event)
            return (
              <TableRow key={event._id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{getLocalizedText(event.name, language)}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {event.description ? getLocalizedText(event.description, language) : "No description"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={eventStatus.variant}>{eventStatus.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <div>
                      {event.startDate && format(new Date(event.startDate), "MMM dd, yyyy")}
                      {event.startDate && event.endDate && (
                        <>
                          <br />
                          <span className="text-xs">to {format(new Date(event.endDate), "MMM dd, yyyy")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-32">{event.location || "TBD"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-24">{event.organizer || "TBD"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {event.registrationLink ? (
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-accent hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Register
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">No link</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(event)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
