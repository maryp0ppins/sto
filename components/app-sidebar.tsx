"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  PlusSquare,
  KanbanSquare,
  Users,
  Wrench,
  Settings,
  LogOut,
} from "lucide-react"

const menu = [
  {
    label: "Работа",
    items: [
      { href: "/dashboard/record/new", icon: PlusSquare, title: "Новая запись" },
      { href: "/dashboard/kanban", icon: KanbanSquare, title: "Канбан-доска" },
    ],
  },
  {
    label: "Справочники",
    items: [
      { href: "/dashboard/clients", icon: Users, title: "Клиенты" },
      { href: "/dashboard/services", icon: Wrench, title: "Услуги" },
    ],
  },
  {
    label: "Система",
    items: [
      { href: "/dashboard/settings", icon: Settings, title: "Настройки" },
      { href: "/logout", icon: LogOut, title: "Выход" },
    ],
  },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarContent>
        {menu.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ href, icon: Icon, title }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(href)}
                      tooltip={title}
                      /* show иконку даже в «icon-collapse»-режиме */
                    >
                      <Link href={href} className="flex items-center gap-2">
                        <Icon className="size-4 shrink-0" />
                        <span>{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
