'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Plus,
  Phone,
  Mail,
  Car,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  User,
  MapPin,
  Filter,
  Users,
  Star,
  History,
  X,
  Save
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

// Моковые данные клиентов
const mockClients = [
  {
    id: 1,
    name: 'Иванов Александр Петрович',
    phone: '+7 (999) 123-45-67',
    email: 'ivanov@email.com',
    address: 'г. Москва, ул. Тверская, д. 10',
    registrationDate: '2024-01-15',
    lastVisit: '2025-07-02',
    vehicles: [
      { make: 'Toyota', model: 'Camry', year: 2019, plate: 'A123BC77' },
      { make: 'BMW', model: 'X5', year: 2021, plate: 'B456CD77' }
    ],
    totalVisits: 12,
    totalSpent: 45600,
    rating: 5,
    status: 'vip'
  },
  {
    id: 2,
    name: 'Петрова Мария Сергеевна',
    phone: '+7 (999) 234-56-78',
    email: 'petrova@email.com',
    address: 'г. Москва, ул. Арбат, д. 25',
    registrationDate: '2024-03-22',
    lastVisit: '2025-06-28',
    vehicles: [
      { make: 'Mercedes-Benz', model: 'C-Class', year: 2020, plate: 'C789DE77' }
    ],
    totalVisits: 8,
    totalSpent: 28400,
    rating: 4,
    status: 'regular'
  },
  {
    id: 3,
    name: 'Сидоров Дмитрий Александрович',
    phone: '+7 (999) 345-67-89',
    email: '',
    address: 'г. Москва, ул. Садовая, д. 15',
    registrationDate: '2024-05-10',
    lastVisit: '2025-07-01',
    vehicles: [
      { make: 'Audi', model: 'A4', year: 2018, plate: 'D012EF77' }
    ],
    totalVisits: 3,
    totalSpent: 8900,
    rating: 3,
    status: 'new'
  },
  {
    id: 4,
    name: 'Козлова Елена Викторовна',
    phone: '+7 (999) 456-78-90',
    email: 'kozlova@email.com',
    address: 'г. Москва, пр. Мира, д. 40',
    registrationDate: '2023-11-05',
    lastVisit: '2025-06-25',
    vehicles: [
      { make: 'Volkswagen', model: 'Polo', year: 2017, plate: 'E345FG77' },
      { make: 'Hyundai', model: 'Solaris', year: 2019, plate: 'F678HI77' }
    ],
    totalVisits: 15,
    totalSpent: 67200,
    rating: 5,
    status: 'vip'
  },
  {
    id: 5,
    name: 'Морозов Андрей Николаевич',
    phone: '+7 (999) 567-89-01',
    email: 'morozov@email.com',
    address: 'г. Москва, ул. Ленина, д. 8',
    registrationDate: '2024-02-14',
    lastVisit: '2025-05-15',
    vehicles: [
      { make: 'Skoda', model: 'Octavia', year: 2020, plate: 'G901JK77' }
    ],
    totalVisits: 6,
    totalSpent: 19800,
    rating: 4,
    status: 'regular'
  }
]

const statusConfig = {
  new: {
    label: 'Новый',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  },
  regular: {
    label: 'Постоянный',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  },
  vip: {
    label: 'VIP',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  }
}

const ClientCard = ({ client, index }: { client: any, index: number }) => {
  const initials = client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-3 h-3",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{client.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", statusConfig[client.status as keyof typeof statusConfig].color)}
                  >
                    {statusConfig[client.status as keyof typeof statusConfig].label}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {renderStars(client.rating)}
                  </div>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Просмотреть
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <History className="w-4 h-4 mr-2" />
                  История визитов
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{client.phone}</span>
            </div>
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{client.address}</span>
            </div>
          </div>

          {/* Vehicles */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Car className="w-4 h-4" />
              Автомобили ({client.vehicles.length})
            </h4>
            <div className="space-y-1">
              {client.vehicles.map((vehicle: any, index: number) => (
                <div key={index} className="text-xs bg-muted/50 rounded p-2">
                  <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                  <span className="text-muted-foreground ml-2">
                    {vehicle.year} • {vehicle.plate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{client.totalVisits}</div>
              <div className="text-xs text-muted-foreground">Визитов</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {client.totalSpent.toLocaleString()}₽
              </div>
              <div className="text-xs text-muted-foreground">Потрачено</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Последний визит</div>
              <div className="text-sm font-medium">
                {new Date(client.lastVisit).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const AddClientForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    vehicles: [{ make: '', model: '', year: '', plate: '', vin: '' }]
  })

  const addVehicle = () => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, { make: '', model: '', year: '', plate: '', vin: '' }]
    }))
  }

  const removeVehicle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index)
    }))
  }

  const updateVehicle = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((vehicle, i) => 
        i === index ? { ...vehicle, [field]: value } : vehicle
      )
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Здесь будет логика сохранения клиента
    console.log('Сохранение клиента:', formData)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Основная информация
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">ФИО клиента *</Label>
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
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+7 (999) 123-45-67"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="client@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="г. Москва, ул. Тверская, д. 10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Дополнительная информация о клиенте..."
              rows={3}
            />
          </div>
        </div>

        {/* Автомобили */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Car className="w-5 h-5" />
              Автомобили
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addVehicle}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить автомобиль
            </Button>
          </div>

          <div className="space-y-4">
            {formData.vehicles.map((vehicle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border rounded-lg bg-muted/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Автомобиль {index + 1}</h4>
                  {formData.vehicles.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVehicle(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      value={vehicle.year}
                      onChange={(e) => updateVehicle(index, 'year', e.target.value)}
                      placeholder="2020"
                      type="number"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Госномер</Label>
                    <Input
                      value={vehicle.plate}
                      onChange={(e) => updateVehicle(index, 'plate', e.target.value)}
                      placeholder="А123БВ77"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>VIN-номер</Label>
                    <Input
                      value={vehicle.vin}
                      onChange={(e) => updateVehicle(index, 'vin', e.target.value)}
                      placeholder="1HGCM82633A123456"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Сохранить клиента
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)

  const filteredAndSortedClients = useMemo(() => {
    let filtered = mockClients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.phone.includes(searchTerm) ||
                           client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.vehicles.some(v => 
                             `${v.make} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             v.plate.toLowerCase().includes(searchTerm.toLowerCase())
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
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
        case 'totalSpent':
          return b.totalSpent - a.totalSpent
        case 'totalVisits':
          return b.totalVisits - a.totalVisits
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, statusFilter, sortBy])

  const stats = useMemo(() => {
    const total = mockClients.length
    const newClients = mockClients.filter(c => c.status === 'new').length
    const vipClients = mockClients.filter(c => c.status === 'vip').length
    const totalRevenue = mockClients.reduce((sum, c) => sum + c.totalSpent, 0)
    const avgRating = mockClients.reduce((sum, c) => sum + c.rating, 0) / mockClients.length

    return { total, newClients, vipClients, totalRevenue, avgRating }
  }, [])

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
              <AddClientForm onClose={() => setIsAddClientOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Filters */}
        <div className="px-6 pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск по имени, телефону, email или автомобилю..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="regular">Постоянные</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">По имени</SelectItem>
                <SelectItem value="lastVisit">По последнему визиту</SelectItem>
                <SelectItem value="totalSpent">По сумме покупок</SelectItem>
                <SelectItem value="totalVisits">По количеству визитов</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Всего клиентов</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.newClients}</div>
              <div className="text-xs text-muted-foreground">Новых</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.vipClients}</div>
              <div className="text-xs text-muted-foreground">VIP</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalRevenue.toLocaleString()}₽
              </div>
              <div className="text-xs text-muted-foreground">Общая выручка</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.avgRating.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Средний рейтинг</div>
            </CardContent>
          </Card>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Найдено клиентов: {filteredAndSortedClients.length}
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedClients.map((client, index) => (
            <ClientCard key={client.id} client={client} index={index} />
          ))}
        </div>

        {filteredAndSortedClients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Клиенты не найдены</h3>
              <p className="text-muted-foreground">
                Попробуйте изменить параметры поиска или фильтры
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}