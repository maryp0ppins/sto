// models/Service.ts - Обновленная модель с дополнительными полями
import { model, models, Schema } from "mongoose"

const serviceSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  durationMinutes: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['maintenance', 'repair', 'diagnostic', 'cosmetic'],
    default: 'maintenance'
  },
  isPopular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  requiredTools: [{ type: String }]
}, { timestamps: true })

export const Service = models.Service || model("Service", serviceSchema)