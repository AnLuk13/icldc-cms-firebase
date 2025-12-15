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
import { Plus, Search, Calendar } from "lucide-react";
import { EventForm } from "@/components/events/event-form";
import { EventTable } from "@/components/events/event-table";
import { eventsApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { getLocalizedText } from "@/components/language-tabs";
import type { Event, Language } from "@/lib/types";
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
import { isAfter, isBefore, startOfDay } from "date-fns";
import { useLocale, useTranslations } from "next-intl";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null);
  const language = useLocale();
  const { toast } = useToast();
  const t = useTranslations();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("events.errorLoadingEvents"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleDeleteEvent = async (event: Event) => {
    try {
      await eventsApi.delete(event._id!);
      await loadEvents();
      setDeleteEvent(null);
      toast({
        title: t("common.success"),
        description: t("events.eventDeletedSuccessfully"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("events.errorDeletingEvent"),
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (eventData: Omit<Event, "_id">) => {
    try {
      if (selectedEvent) {
        await eventsApi.update(selectedEvent._id!, eventData);
        toast({
          title: t("common.success"),
          description: t("events.eventUpdatedSuccessfully"),
        });
      } else {
        await eventsApi.create(eventData);
        toast({
          title: t("common.success"),
          description: t("events.eventCreatedSuccessfully"),
        });
      }
      await loadEvents();
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t(
          selectedEvent
            ? "events.errorUpdatingEvent"
            : "events.errorCreatingEvent"
        ),
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events.filter((event) => {
    const name = getLocalizedText(event.name, language).toLowerCase();
    const description = event.description
      ? getLocalizedText(event.description, language).toLowerCase()
      : "";
    const location = event.location?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return (
      name.includes(search) ||
      description.includes(search) ||
      location.includes(search)
    );
  });

  const today = startOfDay(new Date());
  const upcomingEvents = events.filter(
    (event) => event.startDate && isAfter(new Date(event.startDate), today)
  );
  const ongoingEvents = events.filter(
    (event) =>
      event.startDate &&
      event.endDate &&
      isBefore(new Date(event.startDate), today) &&
      isAfter(new Date(event.endDate), today)
  );
  const pastEvents = events.filter(
    (event) => event.endDate && isBefore(new Date(event.endDate), today)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("events.title")}
            </h1>
            <p className="text-muted-foreground">{t("events.description")}</p>
          </div>
          <Button onClick={handleCreateEvent} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("events.addEvent")}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("events.upcomingEvents")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                {t("events.scheduledForFuture")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("events.ongoingEvents")}
              </CardTitle>
              <Badge variant="default">{ongoingEvents.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ongoingEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                {t("events.currentlyActive")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("events.pastEvents")}
              </CardTitle>
              <Badge variant="secondary">{pastEvents.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                {t("events.completedEvents")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>{t("events.allEvents")}</CardTitle>
            <CardDescription>{t("events.viewAndManageEvents")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("events.searchEvents")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <EventTable
              events={filteredEvents}
              loading={loading}
              onEdit={handleEditEvent}
              onDelete={(event) => setDeleteEvent(event)}
            />
          </CardContent>
        </Card>

        {/* Event Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent
                  ? t("events.editEvent")
                  : t("events.createNewEvent")}
              </DialogTitle>
              <DialogDescription>
                {selectedEvent
                  ? t("events.updateEventInformation")
                  : t("events.addNewEventToOrganization")}
              </DialogDescription>
            </DialogHeader>
            <EventForm
              event={selectedEvent}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteEvent}
          onOpenChange={() => setDeleteEvent(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("events.areYouSure")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("events.deleteConfirmation", {
                  eventName: deleteEvent
                    ? getLocalizedText(deleteEvent.name, language)
                    : "",
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteEvent && handleDeleteEvent(deleteEvent)}
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
