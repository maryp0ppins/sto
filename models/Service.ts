// models/Service.ts
import { model, models, Schema } from "mongoose"

const serviceSchema = new Schema({
  title:  { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  price:  { type: Number, required: true },
})

export const Service =
  models.Service || model("Service", serviceSchema)
