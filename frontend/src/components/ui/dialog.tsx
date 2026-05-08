"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const DialogContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = (v: boolean) => {
    setInternalOpen(v)
    onOpenChange?.(v)
  }
  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({ children }: { children: React.ReactNode }) {
  const { setOpen } = React.useContext(DialogContext)
  return <div onClick={() => setOpen(true)}>{children}</div>
}

function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { open, setOpen } = React.useContext(DialogContext)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-lg border bg-white p-6 shadow-lg",
          className
        )}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  )
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle }
