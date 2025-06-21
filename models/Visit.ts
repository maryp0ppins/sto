// models/Visit.ts
import { model, models, Schema, Types } from "mongoose"

const visitSchema = new Schema({
  clientId:  { type: Types.ObjectId, ref: "Client", required: true },
  vehicleId: { type: Types.ObjectId, required: true },
  serviceIds:{ type: [Types.ObjectId], ref: "Service", required: true },
  mechanicId:{ type: Types.ObjectId, ref: "User", required: true },
  slotStart: { type: Date, required: true },
  slotEnd:   { type: Date, required: true },
  status: {
    type: String,
    enum: ["scheduled", "in-progress", "done", "delivered"],
    default: "scheduled",
  },
}, { timestamps: true })

export const Visit = models.Visit || model("Visit", visitSchema)
