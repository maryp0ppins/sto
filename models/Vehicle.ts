// models/Vehicle.ts
import { Schema } from "mongoose"
export const vehicleSchema = new Schema({
  make:      { type: String, required: true },
  model:     { type: String, required: true },
  year:      Number,
  licensePlate: String,
})
