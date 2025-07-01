// app/dashboard/services/ModernServicesPage.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Clock,
  DollarSign,
  Wrench,
  Edit3,
  Trash2,
  Star,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type Service = {
  id: string
  title: string
  description?: string
  durationMinutes: number
  price: number
  category: 'maintenance' | 'repair' | 'diagnostic' | 'cosmetic'
  isPopular: boolean
  isActive: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  requiredTools?: string[]
  createdAt: string
  updatedAt: string
}

const categoryConfig = {
  maintenance: {
    label: 'Обслуживание',
    color: 'bg-blue-500',
    icon: '🔧'
  },
  repair: {
    label: 'Ремонт',
    color: 'bg-red-500',
    icon: '⚙️'
  },
  diagnostic: {
    label: 'Диагностика',
    color: 'bg-yellow-500',
    icon: '🔍'
  },
  cosmetic: {
    label: 'Косметический',
    color: 'bg-purple-500',
    icon: '✨'
  }
}

const difficultyConfig = {
  easy: { label: 'Простая', color: 'text-green-600', dots: '●' },
  medium: { label: 'Средняя', color: 'text-yellow-600', dots: '●●' },
  hard: { label: 'Сложная', color: 'text-red-600', dots: '●●●' }
}

// Mock data
const mockServices: Service[] = [
  {
    id: '1',
    title: 'Замена масла и фильтров',
    description: 'Полная замена моторного масла и масляного фильтра',
    durationMinutes: 45,
    price: 3500,
    category: 'maintenance',
    isPopular: true,
    isActive: true,
    difficulty: 'easy',
    requiredTools: ['Ключи', 'Воронка', 'Подъемник'],
    createdAt: '2024-01-15',
    updatedAt: '2024-06-01'
  },
  {
    id: '2',
    title: 'Компьютерная диагностика',
    description: 'Полная диагностика всех систем автомобиля',
    durationMinutes: 60,
    price: 2500,
    category: 'diagnostic',
    isPopular: true,
    isActive: true,
    difficulty: 'medium',
    requiredTools: ['Сканер', 'Мультиметр'],
    createdAt: '2024-01-20',
    updatedAt: '2024-05-15'
  },
  {
    id: '3',
    title: 'Замена тормозных колодок',
    description: 'Замена передних и задних тормозных колодок',
    durationMinutes: 120,
    price: 4500,
    category: 'repair',
    isPopular: false,
    isActive: true,
    difficulty: 'medium',
    createdAt: '2024-02-01',
    updatedAt: '2024-06-10'
  }
]

const ServiceCard = ({ 
  service, 
  onEdit, 
  onDelete 
}: { 
  service: Service
  onEdit: (service: Service) => void
  onDelete: (id: string) => void
}) => {
  const category = categoryConfig[service.category]
  const difficulty = difficultyConfig[service.difficulty]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", category.color)} />
              <Badge variant="outline" className="text-xs">
                {category.icon} {category.label}
              </Badge>
              {service.isPopular && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Популярно
                </Badge>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(service)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(service.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-lg leading-tight">{service.title}</CardTitle>
          {service.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {service.description}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {Math.floor(service.durationMinutes / 60)}ч {service.durationMinutes % 60}мин
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-green-600">
                {service.price.toLocaleString()}₽
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Сложность:</span>
              <span className={cn("text-xs font-medium", difficulty.color)}>
                {difficulty.dots} {difficulty.label}
              </span>
            </div>
            <Switch
              checked={service.isActive}
              className="scale-75"
            />
          </div>
          
          {service.requiredTools && service.requiredTools.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Инструменты:</p>
              <div className="flex flex-wrap gap-1">
                {service.requiredTools.slice(0, 3).map((tool, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tool}
                  </Badge>
                ))}
                {service.requiredTools.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{service.requiredTools.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

const ServiceForm = ({ 
  service, 
  onSave, 
  onCancel 
}: { 
  service?: Service | null
  onSave: (service: Partial<Service>) => void
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState<Partial<Service>>(
    service || {
      title: '',
      description: '',
      durationMinutes: 60,
      price: 0,
      category: 'maintenance',
      isPopular: false,
      isActive: true,
      difficulty: 'medium',
      requiredTools: []
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Название услуги *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Например: Замена масла"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Категория</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Service['category'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.icon} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Подробное описание услуги..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Длительность (мин)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.durationMinutes}
            onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
            min="1"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Цена (₽)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
            min="0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Сложность</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as Service['difficulty'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(difficultyConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.dots} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="popular"
            checked={formData.isPopular}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPopular: checked }))}
          />
          <Label htmlFor="popular">Популярная услуга</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="active">Активна</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          {service ? 'Сохранить изменения' : 'Создать услугу'}
        </Button>
      </div>
    </form>
  )
}

export default function ModernServicesPage() {
  const [services, setServices] = useState<Service[]>(mockServices)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSave = (serviceData: Partial<Service>) => {
    if (editingService) {
      setServices(prev => prev.map(s => 
        s.id === editingService.id ? { ...s, ...serviceData, updatedAt: new Date().toISOString() } : s
      ))
    } else {
      const newService: Service = {
        ...serviceData as Service,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setServices(prev => [...prev, newService])
    }
    setIsFormOpen(false)
    setEditingService(null)
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const totalRevenue = services.reduce((sum, service) => sum + service.price, 0)
  const avgDuration = services.reduce((sum, service) => sum + service.durationMinutes, 0) / services.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Управление услугами
            </h1>
            <p className="text-muted-foreground mt-1">
              Настройка каталога услуг автосервиса
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Добавить услугу
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Редактировать услугу' : 'Новая услуга'}
                </DialogTitle>
                <DialogDescription>
                  Заполните информацию об услуге
                </DialogDescription>
              </DialogHeader>
              <ServiceForm
                service={editingService}
                onSave={handleSave}
                onCancel={() => {
                  setIsFormOpen(false)
                  setEditingService(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всего услуг</p>
                  <p className="text-2xl font-bold">{services.length}</p>
                </div>
                <Wrench className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Средняя цена</p>
                  <p className="text-2xl font-bold">{Math.round(totalRevenue / services.length).toLocaleString()}₽</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Среднее время</p>
                  <p className="text-2xl font-bold">{Math.round(avgDuration)}мин</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Популярных</p>
                  <p className="text-2xl font-bold">{services.filter(s => s.isPopular).length}</p>
                </div>
                <Star className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between"
        >
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск услуг..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Карточки
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Таблица
            </Button>
          </div>
        </motion.div>

        {/* Services Grid */}
        <AnimatePresence>
          {viewMode === 'cards' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-0 shadow-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Услуга</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Длительность</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{service.title}</p>
                            {service.isPopular && (
                              <Badge variant="outline" className="text-xs mt-1">
                                <Star className="w-3 h-3 mr-1" />
                                Популярно
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {categoryConfig[service.category].icon} {categoryConfig[service.category].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{service.durationMinutes}мин</TableCell>
                        <TableCell className="font-medium">{service.price.toLocaleString()}₽</TableCell>
                        <TableCell>
                          <Badge variant={service.isActive ? 'default' : 'secondary'}>
                            {service.isActive ? 'Активна' : 'Неактивна'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(service)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(service.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Услуги не найдены</h3>
            <p className="text-muted-foreground">
              Попробуйте изменить критерии поиска или добавьте новую услугу
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}