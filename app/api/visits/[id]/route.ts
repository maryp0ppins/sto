// app/api/visits/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Visit } from '@/models/Visit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID визита обязателен' },
        { status: 400 }
      )
    }

    const visit = await Visit.findById(id)
      .populate('clientId')
      .populate('mechanicId')
      .populate('serviceIds')

    if (!visit) {
      return NextResponse.json(
        { error: 'Визит не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(visit)
  } catch (error) {
    console.error('Error fetching visit:', error)
    return NextResponse.json(
      { error: 'Ошибка получения визита' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID визита обязателен' },
        { status: 400 }
      )
    }

    const updatedVisit = await Visit.findByIdAndUpdate(
      id, 
      { ...body, updatedAt: new Date() },
      { new: true }
    )
      .populate('clientId')
      .populate('mechanicId')  
      .populate('serviceIds')

    if (!updatedVisit) {
      return NextResponse.json(
        { error: 'Визит не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedVisit)
  } catch (error) {
    console.error('Error updating visit:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления визита' },
      { status: 500 }
    )
  }
}