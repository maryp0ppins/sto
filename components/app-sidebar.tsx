// components/app-sidebar.tsx - финальная чистая версия
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
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  Home,
  KanbanSquare,
  Users,
  Wrench,
  Settings,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { LogoutButton } from './ui/logout-button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Card, CardContent } from './ui/card'

// Чистое меню без бейджей
const menu = [
  {
    label: 'Основное',
    items: [
      { href: '/dashboard', icon: Home, title: 'Главная' },
      { href: '/dashboard/visits', icon: Calendar, title: 'Все визиты' },
      { href: '/dashboard/kanban', icon: KanbanSquare, title: 'Канбан' },
    ],
  },
  {
    label: 'Управление',
    items: [
      { href: '/dashboard/clients', icon: Users, title: 'Клиенты' },
      { href: '/dashboard/services', icon: Wrench, title: 'Услуги' },
      { href: '/dashboard/reports', icon: BarChart3, title: 'Отчеты' },
    ],
  },
  {
    label: 'Система',
    items: [
      { href: '/dashboard/settings', icon: Settings, title: 'Настройки' },
    ],
  },
]

const UserProfile = () => {
  const { user } = useAuth()

  return (
    <Card className="mx-2 mb-4">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || 'Администратор'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'admin' ? 'Администратор' : 'Механик'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useAuth()

  // Для механика показываем только основные разделы
  const items = user?.role === 'mechanic'
    ? [
        {
          label: 'Основное',
          items: [
            { href: '/dashboard', icon: Home, title: 'Главная' },
            { href: '/dashboard/kanban', icon: KanbanSquare, title: 'Канбан' },
          ],
        },
      ]
    : menu

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="border-b border-border/40 pb-0">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">СТО CRM</h1>
            <p className="text-xs text-muted-foreground">Управление сервисом</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-0">
        <UserProfile />

        {items.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground/70">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ href, icon: Icon, title }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === href || (href !== '/dashboard' && pathname.startsWith(href))}
                      tooltip={title}
                      className="mx-2 mb-1"
                    >
                      <Link href={href} className="flex items-center gap-3 px-3 py-2">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="mx-2 mb-2" tooltip="Выход">
              <LogoutButton className="flex items-center gap-3 w-full" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar