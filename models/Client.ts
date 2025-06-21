// models/Client.ts
import { model, models, Schema } from "mongoose"
import { vehicleSchema } from "./Vehicle"

const clientSchema = new Schema({
  name:  { type: String, required: true },
  phone: { type: String, required: true, unique: true, index: true },
  email: String,
  vehicles: [vehicleSchema],
})

export const Client = models.Client || model("Client", clientSchema)
