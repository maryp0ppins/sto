'use client'

import { useState } from 'react'
import type { WizardContext } from './types'
import type { OnNext } from './StepProps'

import StepClient   from './steps/StepClient'
import StepVehicle  from './steps/StepVehicle'
import StepServices from './steps/StepServices'
import StepSlot     from './steps/StepSlot'
import StepConfirm  from './steps/StepConfirm'

const steps = [StepClient, StepVehicle, StepServices, StepSlot, StepConfirm] as const

export default function Wizard() {
  const [step, setStep]            = useState(0)
  const [ctx,  setCtx]             = useState<Partial<WizardContext>>({})

  /** получаем patch от шага, дополняем контекст и идём дальше */
  const next: OnNext = (patch) => {
    if (patch) setCtx(prev => ({ ...prev, ...patch }))
    setStep(i => i + 1)
  }

  const Current = steps[step]
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Current context={ctx} onNextAction={next} />
    </div>
  )
}
