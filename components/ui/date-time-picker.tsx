"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  /** Show time selector below the calendar. Defaults to true. */
  showTime?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  showTime = true,
  placeholder = "Pick a date",
  disabled,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<Date | undefined>(value);

  // Keep internal state in sync when parent value changes (e.g. form reset)
  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const current = internalValue;

  const emit = (date: Date | undefined) => {
    setInternalValue(date);
    onChange(date);
  };

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) {
      emit(undefined);
      return;
    }
    if (showTime) {
      const hours = current?.getHours() ?? 0;
      const minutes = current?.getMinutes() ?? 0;
      const combined = new Date(day);
      combined.setHours(hours, minutes, 0, 0);
      emit(combined);
      // Keep open so user can also change the time
    } else {
      const d = new Date(day);
      d.setHours(0, 0, 0, 0);
      emit(d);
      setOpen(false);
    }
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hours = Number(e.target.value);
    const base = current ? new Date(current) : new Date();
    base.setHours(hours, base.getMinutes(), 0, 0);
    emit(base);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const minutes = Number(e.target.value);
    const base = current ? new Date(current) : new Date();
    base.setHours(base.getHours(), minutes, 0, 0);
    emit(base);
  };

  const formatDisplay = () => {
    if (!current) return null;
    return showTime
      ? format(current, "MMM d, yyyy  HH:mm")
      : format(current, "MMM d, yyyy");
  };

  const displayLabel = formatDisplay();

  return (
    <div className="flex items-center w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "flex-1 min-w-0 justify-start text-left font-normal bg-background hover:bg-background text-foreground border border-border shadow-none",
              current ? "rounded-r-none border-r-0" : "",
              !current && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{displayLabel ?? placeholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white text-foreground dark:bg-background border shadow-md"
          style={{ borderColor: "var(--border)" }}
          align="start"
        >
          <Calendar
            mode="single"
            selected={current}
            onSelect={handleDaySelect}
            autoFocus
          />
          {showTime && (
            <div className="border-t p-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground">Time</span>
              <select
                value={current ? String(current.getHours()).padStart(2, "0") : "00"}
                onChange={handleHourChange}
                className="rounded-md border border-input bg-white text-foreground px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, "0")}>
                    {String(i).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span className="text-foreground font-medium">:</span>
              <select
                value={current ? String(current.getMinutes()).padStart(2, "0") : "00"}
                onChange={handleMinuteChange}
                className="rounded-md border border-input bg-white text-foreground px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, "0")}>
                    {String(i).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          )}
          {showTime && current && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {current && (
        <button
          type="button"
          aria-label="Clear date"
          onClick={() => emit(undefined)}
          className="h-9 w-9 flex-none flex items-center justify-center border border-border rounded-r-md bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
