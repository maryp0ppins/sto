'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from '@/components/ui/sidebar'
import {
  PlusSquare,
  KanbanSquare,
  Users,
  Wrench,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { LogoutButton } from './ui/logout-button'


const menu = [
  {
    label: 'Работа',
    items: [
      { href: '/dashboard/record/new', icon: PlusSquare, title: 'Новая запись' },
      { href: '/dashboard/kanban', icon: KanbanSquare, title: 'Канбан-доска' },
    ],
  },
  {
    label: 'Справочники',
    items: [
      { href: '/dashboard/clients', icon: Users, title: 'Клиенты' },
      { href: '/dashboard/services', icon: Wrench, title: 'Услуги' },
    ],
  },
  {
    label: 'Система',
    items: [
      { href: '/dashboard/settings', icon: Settings, title: 'Настройки' },
      { href: '/logout', icon: LogOut, title: 'Выход' },
    ],
  },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const user = useAuth()

  const items =
    user?.role === 'mechanic'
      ? [
          {
            label: 'Работа',
            items: [{ href: '/dashboard/kanban', icon: KanbanSquare, title: 'Канбан-доска' }],
          },
          {
            label: 'Система',
            items: [{ href: '/logout', icon: LogOut, title: 'Выход' }],
          },
        ]
      : menu

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarContent>
        {items.map((group) => (
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
                    >
                      {title === 'Выход' ? (
                        <LogoutButton icon={<Icon className="size-4 shrink-0" />} />
                      ) : (
                        <Link href={href} className="flex items-center gap-2">
                          <Icon className="size-4 shrink-0" />
                          <span>{title}</span>
                        </Link>
                      )}
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
