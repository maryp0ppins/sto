'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Plus,
  Phone,
  Mail,
  Car,
  MoreVertical,
  Edit,
  Trash2,
  User,
  Users,
  Star,
  Loader2,
  DollarSign
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useClients, useClientMutations } from '@/hooks/use-api'
import { type Client, type Vehicle } from '@/lib/api'

// Add Client Form Component
function AddClientForm({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicles: [{ make: '', model: '', year: new Date().getFullYear(), licensePlate: '' }]
  })
  const { createClient, loading } = useClientMutations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createClient({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        vehicles: formData.vehicles.filter(v => v.make && v.model)
      })
      
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to create client:', error)
    }
  }

  const addVehicle = () => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, { make: '', model: '', year: new Date().getFullYear(), licensePlate: '' }]
    }))
  }

  const removeVehicle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index)
    }))
  }

  const updateVehicle = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Информация о клиенте</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">ФИО *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Иванов Иван Иванович"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+7 (999) 123-45-67"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="client@example.com"
          />
        </div>
      </div>

      {/* Vehicles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Автомобили</h3>
          <Button type="button" onClick={addVehicle} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Добавить авто
          </Button>
        </div>

        {formData.vehicles.map((vehicle, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Марка *</Label>
                  <Input
                    value={vehicle.make}
                    onChange={(e) => updateVehicle(index, 'make', e.target.value)}
                    placeholder="Toyota"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Модель *</Label>
                  <Input
                    value={vehicle.model}
                    onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                    placeholder="Camry"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Год</Label>
                  <Input
                    type="number"
                    value={vehicle.year}
                    onChange={(e) => updateVehicle(index, 'year', parseInt(e.target.value))}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <Label>Гос. номер</Label>
                  <Input
                    value={vehicle.licensePlate}
                    onChange={(e) => updateVehicle(index, 'licensePlate', e.target.value)}
                    placeholder="А123БВ77"
                  />
                </div>
                
                {formData.vehicles.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeVehicle(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Создать клиента
        </Button>
      </div>
    </form>
  )
}

// Client Card Component
function ClientCard({ client, onEdit, onDelete }: { 
  client: Client; 
  onEdit: (client: Client) => void; 
  onDelete: (id: string) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'bg-yellow-500'
      case 'regular': return 'bg-blue-500'
      case 'new': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'vip': return 'VIP'
      case 'regular': return 'Постоянный'
      case 'new': return 'Новый'
      default: return 'Обычный'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-lg border-0 bg-card/50 backdrop-blur transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {client.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg leading-tight">{client.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={cn(getStatusColor(client.status || 'new'), 'text-white text-xs')}>
                    {getStatusLabel(client.status || 'new')}
                  </Badge>
                  {client.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{client.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(client)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => client._id && onDelete(client._id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{client.phone}</span>
            </div>
            
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{client.email}</span>
              </div>
            )}
            
            {client.vehicles && client.vehicles.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Car className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">
                  {client.vehicles.map(v => `${v.make} ${v.model}`).join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {client.totalVisits || 0}
              </div>
              <div className="text-xs text-muted-foreground">Визитов</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {client.totalSpent?.toLocaleString() || 0}₽
              </div>
              <div className="text-xs text-muted-foreground">Потрачено</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Последний визит</div>
              <div className="text-sm font-medium">
                {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString('ru-RU') : 'Нет'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)

  // API hooks
  const { data: clients = [], loading, error, refetch } = useClients()
  const { deleteClient } = useClientMutations()

  const filteredAndSortedClients = useMemo(() => {
    const filtered = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.phone.includes(searchTerm) ||
                           client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.vehicles?.some((v: Vehicle) => 
                             `${v.make} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             v.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase())
                           )
      
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter
      
      return matchesSearch && matchesStatus
    })

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'lastVisit':
          const dateA = a.lastVisit ? new Date(a.lastVisit).getTime() : 0
          const dateB = b.lastVisit ? new Date(b.lastVisit).getTime() : 0
          return dateB - dateA
        case 'totalSpent':
          return (b.totalSpent || 0) - (a.totalSpent || 0)
        case 'totalVisits':
          return (b.totalVisits || 0) - (a.totalVisits || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [clients, searchTerm, statusFilter, sortBy])

  const stats = useMemo(() => {
    const total = clients.length
    const newClients = clients.filter(c => c.status === 'new').length
    const vipClients = clients.filter(c => c.status === 'vip').length
    const totalRevenue = clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
    const avgRating = clients.length > 0 
      ? clients.reduce((sum, c) => sum + (c.rating || 0), 0) / clients.length 
      : 0

    return { total, newClients, vipClients, totalRevenue, avgRating }
  }, [clients])

  const handleEdit = (client: Client) => {
    // TODO: Implement edit functionality
    console.log('Edit client:', client)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого клиента?')) {
      try {
        await deleteClient(id)
        refetch()
      } catch (error) {
        console.error('Failed to delete client:', error)
      }
    }
  }

  const handleClientCreated = () => {
    refetch()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4 p-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Клиенты</h1>
              <p className="text-muted-foreground">Управление базой клиентов автосервиса</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4 p-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Клиенты</h1>
              <p className="text-muted-foreground">Управление базой клиентов автосервиса</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">Ошибка загрузки данных</p>
            <Button onClick={refetch}>Попробовать снова</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 p-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Клиенты</h1>
            <p className="text-muted-foreground">
              Управление базой клиентов автосервиса
            </p>
          </div>
          <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Добавить клиента
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Добавить нового клиента</DialogTitle>
                <DialogDescription>
                  Заполните информацию о клиенте и его автомобилях
                </DialogDescription>
              </DialogHeader>
              <AddClientForm 
                onClose={() => setIsAddClientOpen(false)} 
                onSuccess={handleClientCreated}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Filters */}
        <div className="px-6 pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск по имени, телефону, email или авто..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Статус клиента" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="regular">Постоянные</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Сортировать по" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">По имени</SelectItem>
                <SelectItem value="lastVisit">По дате визита</SelectItem>
                <SelectItem value="totalSpent">По сумме</SelectItem>
                <SelectItem value="totalVisits">По количеству визитов</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всего клиентов</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Новые</p>
                  <p className="text-2xl font-bold text-green-600">{stats.newClients}</p>
                </div>
                <User className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">VIP</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.vipClients}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Общая выручка</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalRevenue.toLocaleString()}₽
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Средний рейтинг</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.avgRating.toFixed(1)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Grid */}
        {filteredAndSortedClients.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Клиенты не найдены</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Попробуйте изменить параметры поиска' 
                  : 'Начните добавлять клиентов в систему'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setIsAddClientOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить первого клиента
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAndSortedClients.map((client) => (
                <ClientCard
                  key={client._id}
                  client={client}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}