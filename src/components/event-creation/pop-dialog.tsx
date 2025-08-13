"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, ImageIcon } from "lucide-react"

type PopConfig = {
  popImage?: string
  recipientsMode: "all" | "random" | "top"
  recipientsCount?: number
  deliveryTime: string
}

interface POPDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (config: PopConfig) => void
  trigger?: React.ReactNode | null
  initialImage?: string
  initialRecipientsMode?: "all" | "random" | "top"
  initialRecipientsCount?: number
  initialDeliveryTime?: string
}

export function POPDialog({
  open,
  onOpenChange,
  onSave,
  trigger,
  initialImage,
  initialRecipientsMode = "all",
  initialRecipientsCount = 10,
  initialDeliveryTime = "registration",
}: POPDialogProps) {
  const [popImage, setPopImage] = useState<string | undefined>(initialImage)
  const [recipientsMode, setRecipientsMode] = useState<"all" | "random" | "top">(initialRecipientsMode)
  const [recipientsCount, setRecipientsCount] = useState<number>(initialRecipientsCount)
  const [deliveryTime, setDeliveryTime] = useState(initialDeliveryTime)

  useEffect(() => {
    setPopImage(initialImage)
  }, [initialImage])

  useEffect(() => {
    setRecipientsMode(initialRecipientsMode)
  }, [initialRecipientsMode])

  useEffect(() => {
    setRecipientsCount(initialRecipientsCount)
  }, [initialRecipientsCount])

  useEffect(() => {
    setDeliveryTime(initialDeliveryTime)
  }, [initialDeliveryTime])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPopImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    const normalizedCount = Math.max(1, Number(recipientsCount) || 1)
    onSave?.({
      popImage,
      recipientsMode,
      recipientsCount: recipientsMode === "all" ? undefined : normalizedCount,
      deliveryTime,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger !== null ? (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant="outline" size="sm" className="rounded-lg bg-transparent">Configure POP</Button>
          )}
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-primary">Proof of Presence Setup</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Image Upload */}
          <div className="space-y-3">
            <Label>POP Design</Label>
            <div className="relative aspect-video rounded-xl border-2 border-dashed border-border bg-muted/50 overflow-hidden">
              {popImage ? (
                <img src={popImage || "/placeholder.svg"} alt="POP design" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <p className="text-sm">Upload photo or GIF</p>
                </div>
              )}
              <label
                htmlFor="pop-upload"
                className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
              >
                <Button variant="secondary" size="sm" className="rounded-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </label>
              <input
                id="pop-upload"
                type="file"
                accept="image/*,.gif"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-3">
            <Label>Recipients</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pop-recipients"
                  value="all"
                  checked={recipientsMode === "all"}
                  onChange={() => setRecipientsMode("all")}
                />
                <span>All attendees</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pop-recipients"
                  value="random"
                  checked={recipientsMode === "random"}
                  onChange={() => setRecipientsMode("random")}
                />
                <span>Random</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pop-recipients"
                  value="top"
                  checked={recipientsMode === "top"}
                  onChange={() => setRecipientsMode("top")}
                />
                <span>Top</span>
              </label>
              {(recipientsMode === "random" || recipientsMode === "top") && (
                <Input
                  type="number"
                  min={1}
                  value={Number.isFinite(recipientsCount) ? recipientsCount : 1}
                  onChange={(e) => setRecipientsCount(parseInt(e.target.value || "1", 10))}
                  className="w-24 rounded-lg"
                  placeholder="Count"
                />
              )}
            </div>
          </div>

          {/* Delivery Time */}
          <div className="space-y-2">
            <Label>Delivery Time</Label>
            <Select value={deliveryTime} onValueChange={setDeliveryTime}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registration">At registration</SelectItem>
                <SelectItem value="after">After event ends</SelectItem>
                <SelectItem value="24hours">24 hours after event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full rounded-xl" onClick={handleSave}>Save POP Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
