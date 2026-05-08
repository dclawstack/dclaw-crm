"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const TabsContext = React.createContext<{
  value: string
  onChange: (value: string) => void
}>({ value: "", onChange: () => {} })

function Tabs({ defaultValue, value, onValueChange, children }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const currentValue = value !== undefined ? value : internalValue
  const handleChange = (v: string) => {
    setInternalValue(v)
    onValueChange?.(v)
  }
  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500",
        className
      )}
    >
      {children}
    </div>
  )
}

function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value: selected, onChange } = React.useContext(TabsContext)
  const isActive = selected === value
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-slate-950 shadow-sm"
          : "text-slate-500 hover:text-slate-950",
        className
      )}
    >
      {children}
    </button>
  )
}

function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value: selected } = React.useContext(TabsContext)
  if (selected !== value) return null
  return (
    <div
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
