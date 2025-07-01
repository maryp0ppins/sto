// components/modern-forms/ClientForm.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Schema validation
const vehicleSchema = z.object({
  make: z.string().min(1, 'Укажите марку автомобиля'),
  model: z.string().min(1, 'Укажите модель автомобиля'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  color: z.string().optional(),
})

const clientSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Укажите корректный номер телефона'),
  email: z.string().email('Укажите корректный email').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
  vehicles: z.array(vehicleSchema).min(1, 'Добавьте хотя бы один автомобиль'),
})

type ClientFormData = z.infer<typeof clientSchema>
type VehicleFormData = z.infer<typeof vehicleSchema>

const FormField = ({
  label,
  error,
  required = false,
  children,
  description,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  description?: string
}) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2 text-sm font-medium">
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2 text-sm text-red-600"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}
    </AnimatePresence>
    {description && !error && (
      <p className="text-xs text-muted-foreground">{description}</p>
    )}
  </div>
)

const VehicleCard = ({
  vehicle,
  index,
  onUpdate,
  onRemove,
  errors,
}: {
  vehicle: VehicleFormData
  index: number
  onUpdate: (index: number, field: keyof VehicleFormData, value: string | number) => void
  onRemove: (index: number) => void
  errors?: any
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="relative"
  >
    <Card className="border-2 border-border hover:border-primary/50 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Автомобиль {index + 1}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Марка"
            required
            error={errors?.[index]?.make?.message}
          >
            <Input
              value={vehicle.make}
              onChange={(e) => onUpdate(index, 'make', e.target.value)}
              placeholder="BMW, Mercedes, Toyota..."
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
          </FormField>
          <FormField
            label="Модель"
            required
            error={errors?.[index]?.model?.message}
          >
            <Input
              value={vehicle.model}
              onChange={(e) => onUpdate(index, 'model', e.target.value)}
              placeholder="X5, C-Class, Camry..."
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            label="Год"
            error={errors?.[index]?.year?.message}
          >
            <Input
              type="number"
              value={vehicle.year || ''}
              onChange={(e) => onUpdate(index, 'year', parseInt(e.target.value) || 0)}
              placeholder="2020"
              min="1900"
              max={new Date().getFullYear() + 1}
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
          </FormField>
          <FormField
            label="Гос. номер"
            error={errors?.[index]?.licensePlate?.message}
          >
            <Input
              value={vehicle.licensePlate || ''}
              onChange={(e) => onUpdate(index, 'licensePlate', e.target.value)}
              placeholder="А123БВ123"
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
          </FormField>
          <FormField
            label="Цвет"
            error={errors?.[index]?.color?.message}
          >
            <Input
              value={vehicle.color || ''}
              onChange={(e) => onUpdate(index, 'color', e.target.value)}
              placeholder="Черный"
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
          </FormField>
        </div>
        <FormField
          label="VIN номер"
          error={errors?.[index]?.vin?.message}
          description="17-значный идентификационный номер"
        >
          <Input
            value={vehicle.vin || ''}
            onChange={(e) => onUpdate(index, 'vin', e.target.value)}
            placeholder="1HGBH41JXMN109186"
            maxLength={17}
            className="transition-all focus:ring-2 focus:ring-primary/20 font-mono"
          />
        </FormField>
      </CardContent>
    </Card>
  </motion.div>
)

export default function ModernClientForm({
  initialData,
  onSubmit,
  isEditing = false,
}: {
  initialData?: Partial<ClientFormData>
  onSubmit: (data: ClientFormData) => Promise<void>
  isEditing?: boolean
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      notes: initialData?.notes || '',
      vehicles: initialData?.vehicles || [{ make: '', model: '' }],
    },
  })

  const vehicles = watch('vehicles')

  const addVehicle = () => {
    const newVehicles = [...vehicles, { make: '', model: '' }]
    setValue('vehicles', newVehicles)
  }

  const removeVehicle = (index: number) => {
    if (vehicles.length > 1) {
      const newVehicles = vehicles.filter((_, i) => i !== index)
      setValue('vehicles', newVehicles)
    } else {
      toast.warning('Ошибка', 'Должен быть добавлен хотя бы один автомобиль')
    }
  }

  const updateVehicle = (index: number, field: keyof VehicleFormData, value: string | number) => {
    const newVehicles = [...vehicles]
    newVehicles[index] = { ...newVehicles[index], [field]: value }
    setValue('vehicles', newVehicles)
  }

  const onSubmitForm = async (data: ClientFormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      toast.success(
        isEditing ? 'Клиент обновлен' : 'Клиент создан',
        'Данные успешно сохранены'
      )
    } catch (error) {
      toast.error('Ошибка', 'Не удалось сохранить данные')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {isEditing ? 'Редактирование клиента' : 'Новый клиент'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Заполните информацию о клиенте и его автомобилях
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        {/* Client Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Информация о клиенте
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Полное имя"
                  required
                  error={errors.name?.message}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...register('name')}
                      placeholder="Иван Иванович Петров"
                      className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </FormField>

                <FormField
                  label="Телефон"
                  required
                  error={errors.phone?.message}
                  description="Основной номер для связи"
                >
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...register('phone')}
                      placeholder="+7 (999) 123-45-67"
                      className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Email"
                  error={errors.email?.message}
                  description="Для отправки уведомлений"
                >
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...register('email')}
                      placeholder="ivan@example.com"
                      className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </FormField>

                <FormField
                  label="Адрес"
                  error={errors.address?.message}
                >
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...register('address')}
                      placeholder="г. Москва, ул. Ленина, д. 1"
                      className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </FormField>
              </div>

              <FormField
                label="Заметки"
                error={errors.notes?.message}
                description="Дополнительная информация о клиенте"
              >
                <textarea
                  {...register('notes')}
                  placeholder="Особые пожелания, предпочтения..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                />
              </FormField>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vehicles Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Автомобили клиента
              </h2>
              <p className="text-sm text-muted-foreground">
                Добавьте информацию об автомобилях клиента
              </p>
            </div>
            <Button
              type="button"
              onClick={addVehicle}
              variant="outline"
              size="sm"
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить автомобиль
            </Button>
          </div>

          {errors.vehicles && typeof errors.vehicles.message === 'string' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.vehicles.message}
            </motion.div>
          )}

          <div className="grid gap-6">
            <AnimatePresence>
              {vehicles.map((vehicle, index) => (
                <VehicleCard
                  key={index}
                  vehicle={vehicle}
                  index={index}
                  onUpdate={updateVehicle}
                  onRemove={removeVehicle}
                  errors={errors.vehicles}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end gap-4 pt-6 border-t"
        >
          <Button
            type="button"
            variant="outline"
            size="lg"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={!isValid || isLoading}
            className="min-w-[150px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Обновить клиента' : 'Создать клиента'}
              </>
            )}
          </Button>
        </motion.div>

        {/* Validation Status */}
        <AnimatePresence>
          {Object.keys(errors).length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Пожалуйста, исправьте ошибки:</span>
              </div>
              <ul className="text-sm text-red-600 space-y-1 ml-6">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    • {error?.message || 'Неверное значение поля'}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}