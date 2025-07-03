'use client'

import { useState, useMemo } from 'react'
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
  BarChart3,
  Loader2
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
import { useServices, useServiceMutations } from '@/hooks/use-api'
import { type Service } from '@/lib/api'

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

function ServiceForm({ 
  service, 
  onSave, 
  onCancel 
}: { 
  service?: Service; 
  onSave: (data: Partial<Service>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    description: service?.description || '',
    durationMinutes: service?.durationMinutes || 60,
    price: service?.price || 0,
    category: service?.category || 'maintenance',
    isPopular: service?.isPopular || false,
    isActive: service?.isActive !== false,
    difficulty: service?.difficulty || 'medium',
    requiredTools: service?.requiredTools || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Название услуги *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Замена масла и фильтров"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Категория *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as keyof typeof categoryConfig }))}>
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

        <div className="space-y-2">
          <Label htmlFor="duration">Длительность (мин) *</Label>
          <Input
            id="duration"
            type="number"
            value={formData.durationMinutes}
            onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))}
            min="1"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Цена (MDL) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
            min="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Сложность</Label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as keyof typeof difficultyConfig }))}>
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

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Активна</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPopular"
              checked={formData.isPopular}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPopular: checked }))}
            />
            <Label htmlFor="isPopular">Популярная</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // API hooks
  const { data: services = [], loading, error, refetch } = useServices()
  const { createService, updateService, deleteService } = useServiceMutations()

  const filteredServices = (services || []).filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSave = async (serviceData: Partial<Service>) => {
    try {
      if (editingService && editingService._id) {
        await updateService(editingService._id, serviceData)
      } else {
        await createService(serviceData as Omit<Service, '_id'>)
      }
      
      setIsFormOpen(false)
      setEditingService(null)
      refetch()
    } catch (error) {
      console.error('Failed to save service:', error)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
      try {
        await deleteService(id)
        refetch()
      } catch (error) {
        console.error('Failed to delete service:', error)
      }
    }
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingService(null)
  }

  const stats = useMemo(() => {
    if (!services || services.length === 0) {
      return { total: 0, active: 0, popular: 0, avgPrice: 0 }
    }
    
    return {
      total: services.length,
      active: services.filter(s => s.isActive !== false).length,
      popular: services.filter(s => s.isPopular).length,
      avgPrice: services.reduce((sum, s) => sum + s.price, 0) / services.length,
    }
  }, [services])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">Ошибка загрузки услуг</p>
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
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold">Услуги</h1>
            <p className="text-muted-foreground">Управление каталогом услуг автосервиса</p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingService(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить услугу
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Редактировать услугу' : 'Добавить новую услугу'}
                </DialogTitle>
                <DialogDescription>
                  Заполните информацию об услуге
                </DialogDescription>
              </DialogHeader>
              <ServiceForm
                service={editingService || undefined}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Controls */}
        <div className="px-6 pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск услуг..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Категория" />
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

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всего услуг</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Wrench className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Активные</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Популярные</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.popular}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Средняя цена</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.avgPrice.toLocaleString()}MDL
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Content */}
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Услуги не найдены</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Попробуйте изменить параметры поиска' 
                  : 'Начните добавлять услуги в каталог'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить первую услугу
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredServices.map((service) => (
                <motion.div
                  key={service._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group hover:shadow-lg border-0 bg-card/50 backdrop-blur transition-all duration-200 h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              className={cn(
                                categoryConfig[service.category || 'maintenance'].color, 
                                'text-white text-xs'
                              )}
                            >
                              {categoryConfig[service.category || 'maintenance'].icon}{' '}
                              {categoryConfig[service.category || 'maintenance'].label}
                            </Badge>
                            {service.isPopular && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Популярная
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg leading-tight">{service.title}</CardTitle>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            onClick={() => service._id && handleDelete(service._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {service.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{service.durationMinutes} мин</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{service.price.toLocaleString()} MDL</span>
                          </div>
                        </div>
                        
                        {service.difficulty && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Сложность:</span>
                            <span className={difficultyConfig[service.difficulty].color}>
                              {difficultyConfig[service.difficulty].dots} {difficultyConfig[service.difficulty].label}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <Badge variant={service.isActive !== false ? "default" : "secondary"}>
                            {service.isActive !== false ? "Активна" : "Неактивна"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Услуга</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Длительность</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Сложность</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.title}</div>
                        {service.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {service.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={cn(
                          categoryConfig[service.category || 'maintenance'].color, 
                          'text-white'
                        )}
                      >
                        {categoryConfig[service.category || 'maintenance'].icon}{' '}
                        {categoryConfig[service.category || 'maintenance'].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.durationMinutes} мин</TableCell>
                    <TableCell className="font-medium">
                      {service.price.toLocaleString()} MDL
                    </TableCell>
                    <TableCell>
                      {service.difficulty && (
                        <span className={difficultyConfig[service.difficulty].color}>
                          {difficultyConfig[service.difficulty].dots} {difficultyConfig[service.difficulty].label}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={service.isActive !== false ? "default" : "secondary"}>
                          {service.isActive !== false ? "Активна" : "Неактивна"}
                        </Badge>
                        {service.isPopular && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
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
                          onClick={() => service._id && handleDelete(service._id)}
                          className="text-red-600 hover:text-red-700"
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
        )}
      </div>
    </div>
  )
}