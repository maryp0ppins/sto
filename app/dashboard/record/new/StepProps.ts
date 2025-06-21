// общий контракт для ВСЕХ шагов мастера
import type { WizardContext } from './types'

/** функция перехода к следующему шагу, допускает патч контекста */
export type OnNext = (patch?: Partial<WizardContext>) => void

export interface StepProps {
  /** накопившийся контекст мастера */
  context: Partial<WizardContext>
  /** патчим контекст и переходим дальше */
  onNextAction: OnNext
}
