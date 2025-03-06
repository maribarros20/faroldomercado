
import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type SidebarContextType = {
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultExpanded?: boolean
}

function SidebarProvider(props: SidebarProviderProps) {
  const { children, defaultExpanded = true } = props
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  active?: boolean
  icon?: React.ReactNode
  hideIfCollapsed?: boolean
}

function Link({ href, className, active, icon, children, hideIfCollapsed, ...props }: LinkProps) {
  const { expanded } = useSidebar()

  if (hideIfCollapsed && !expanded) {
    return null
  }

  return (
    <a
      href={href}
      data-state={active ? "active" : "inactive"}
      className={className}
      {...props}
    >
      {icon && <div className="mr-2">{icon}</div>}
      {children}
    </a>
  )
}

interface TriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
}

function Trigger({ className, children, icon, ...props }: TriggerProps) {
  const { expanded, setExpanded } = useSidebar()

  return (
    <button
      onClick={() => setExpanded((prevExpanded) => !prevExpanded)}
      className={className}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}

function Sidebar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = useSidebar()

  return (
    <div
      data-expanded={expanded}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}

function Section({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  hideLogo?: boolean
  logo?: React.ReactNode
}

function Header({ className, children, logo, hideLogo, ...props }: HeaderProps) {
  const { expanded } = useSidebar()

  return (
    <div
      className={className}
      {...props}
    >
      {!hideLogo && expanded && logo && <div>{logo}</div>}
      {children}
    </div>
  )
}

function Content({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}

function Footer({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}

export { Sidebar, SidebarProvider, Header, Content, Footer, Trigger, Section, Link, useSidebar }
