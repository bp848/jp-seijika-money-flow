"use client"

import type * as React from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar" // Assuming this shadcn component exists
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // Assuming this shadcn component exists
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  range?: DateRange
  onRangeChange?: (range: DateRange | undefined) => void
  disabled?: boolean
}

export function DateRangePicker({ className, range, onRangeChange, disabled }: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !range && "text-muted-foreground")}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "yyyy/MM/dd", { locale: ja })} - {format(range.to, "yyyy/MM/dd", { locale: ja })}
                </>
              ) : (
                format(range.from, "yyyy/MM/dd", { locale: ja })
              )
            ) : (
              <span>期間を選択</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={onRangeChange}
            numberOfMonths={2}
            locale={ja}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
