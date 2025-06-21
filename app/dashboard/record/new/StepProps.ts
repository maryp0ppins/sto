// общий контракт для ШАГОВ мастера
import type { WizardContext } from './types'

export type StepProps = {
  /** накопившийся контекст мастера */
  context: Partial<WizardContext>
  /** патчим контекст и переходим дальше */
  onNextAction: (patch: Partial<WizardContext>) => void
}