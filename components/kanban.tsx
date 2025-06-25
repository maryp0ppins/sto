/* components/ui/kanban.tsx */
'use client'

import React, {
  Dispatch,
  DragEvent,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiTrash } from 'react-icons/fi'
import { FaFire } from 'react-icons/fa'
import { cn } from '@/lib/utils'

/* ──────────────── PUBLIC API ───────────────── */

export type ColumnType = 'backlog' | 'todo' | 'doing' | 'done'

export type CardType = {
  id: string
  title: string
  column: ColumnType
  phone?: string
  vehicle?: string
  slotStart?: string
  slotEnd?: string
}

/**
 * Kanban board
 */
export const Kanban = ({
  cards = DEFAULT_CARDS,
  onCardsChange,
  onDelete,
}: {
  cards?: CardType[]
  onCardsChange?: (cards: CardType[]) => void
  onDelete?: (id: string) => void
}) => {
  return (
    <div className={cn('h-screen w-full bg-neutral-900 text-neutral-50')}>
      <Board cards={cards} onCardsChange={onCardsChange} onDelete={onDelete} />
    </div>
  )
}

/* ──────────────── INTERNAL ───────────────── */

const Board = ({
  cards,
  onCardsChange,
  onDelete,
}: {
  cards: CardType[]
  onCardsChange?: (cards: CardType[]) => void
  onDelete?: (id: string) => void
}) => {
  const [stateCards, setCards] = useState<CardType[]>(cards)

  /* если прилетели новые props.cards — синхронизируем */
  useEffect(() => setCards(cards), [cards])

  /* отдаём наружу любое изменение */
  useEffect(() => onCardsChange?.(stateCards), [stateCards, onCardsChange])

  return (
    <div className="flex h-full w-full gap-3 overflow-scroll p-12">
      <Column
        title="Backlog"
        column="backlog"
        headingColor="text-neutral-500"
        cards={stateCards}
        setCards={setCards}
        onDelete={onDelete}
      />
      <Column
        title="TODO"
        column="todo"
        headingColor="text-yellow-200"
        cards={stateCards}
        setCards={setCards}
        onDelete={onDelete}
      />
      <Column
        title="In progress"
        column="doing"
        headingColor="text-blue-200"
        cards={stateCards}
        setCards={setCards}
        onDelete={onDelete}
      />
      <Column
        title="Complete"
        column="done"
        headingColor="text-emerald-200"
        cards={stateCards}
        setCards={setCards}
        onDelete={onDelete}
      />
      <BurnBarrel setCards={setCards} onDelete={onDelete} />
    </div>
  )
}

/* ── Column ─────────────────────────────────── */

type ColumnProps = {
  title: string
  headingColor: string
  cards: CardType[]
  column: ColumnType
  setCards: Dispatch<SetStateAction<CardType[]>>
  onDelete?: (id: string) => void
}

const Column = ({
  title,
  headingColor,
  cards,
  column,
  setCards,
  onDelete,
}: ColumnProps) => {
  const [active, setActive] = useState(false)

  /* DND helpers – оставляем логику автора */
  const handleDragStart = (e: React.DragEvent, card: CardType) => {
    e.dataTransfer.setData('cardId', card.id)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const cardId = e.dataTransfer.getData('cardId')
    setActive(false)
    clearHighlights()

    const indicators = getIndicators()
    const { element } = getNearestIndicator(e, indicators)
    const before = element.dataset.before || '-1'

    if (before !== cardId) {
      let copy = [...cards]
      let moving = copy.find((c) => c.id === cardId)
      if (!moving) return
      moving = { ...moving, column }

      copy = copy.filter((c) => c.id !== cardId)

      const moveToBack = before === '-1'
      if (moveToBack) copy.push(moving)
      else {
        const insertAt = copy.findIndex((c) => c.id === before)
        copy.splice(insertAt !== -1 ? insertAt : copy.length, 0, moving)
      }

      setCards(copy)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    highlightIndicator(e)
    setActive(true)
  }

  const clearHighlights = (els?: HTMLElement[]) => {
    ;(els || getIndicators()).forEach((i) => (i.style.opacity = '0'))
  }

  const highlightIndicator = (e: React.DragEvent) => {
    const indicators = getIndicators()
    clearHighlights(indicators)
    const { element } = getNearestIndicator(e, indicators)
    element.style.opacity = '1'
  }

  const getNearestIndicator = (e: React.DragEvent, indicators: HTMLElement[]) => {
    const DIST = 50
    return indicators.reduce(
      (closest, el) => {
        const box = el.getBoundingClientRect()
        const offset = e.clientY - (box.top + DIST)
        return offset < 0 && offset > closest.offset
          ? { offset, element: el }
          : closest
      },
      { offset: Number.NEGATIVE_INFINITY, element: indicators.at(-1)! }
    )
  }

  const getIndicators = () =>
    Array.from(
      document.querySelectorAll(
        `[data-column="${column}"]`
      ) as unknown as HTMLElement[]
    )

  const handleDragLeave = () => {
    clearHighlights()
    setActive(false)
  }

  const filtered = cards.filter((c) => c.column === column)

  return (
    <div className="w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="text-sm text-neutral-400">{filtered.length}</span>
      </div>

      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'h-full w-full transition-colors',
          active ? 'bg-neutral-800/50' : 'bg-neutral-800/0'
        )}
      >
        {filtered.map((c) => (
          <Card
            key={c.id}
            {...c}
            handleDragStart={handleDragStart}
            onDelete={() => {
              onDelete?.(c.id)
              setCards((prev) => prev.filter((x) => x.id !== c.id))
            }}
            onUpdateTime={(patch) =>
              setCards((prev) =>
                prev.map((x) => (x.id === c.id ? { ...x, ...patch } : x))
              )
            }
          />
        ))}

        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  )
}

/* ── Card ───────────────────────────────────── */

type CardProps = CardType & {
  handleDragStart: (e: React.DragEvent, card: CardType) => void
  onDelete: () => void
  onUpdateTime: (patch: { slotStart?: string; slotEnd?: string }) => void
}

const Card = ({
  id,
  title,
  column,
  phone,
  vehicle,
  slotStart,
  slotEnd,
  handleDragStart,
  onDelete,
  onUpdateTime,
}: CardProps) => (
  <>
    <DropIndicator beforeId={id} column={column} />
    <motion.div
      layout
      layoutId={id}
      draggable
      onDragStart={(e) =>
        handleDragStart(e as unknown as React.DragEvent, {
          id,
          title,
          column,
          phone,
          vehicle,
          slotStart,
          slotEnd,
        })
      }
      className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing space-y-2"
    >
      <div className="text-sm font-semibold text-neutral-100">{title}</div>
      {phone && <div className="text-xs text-neutral-400">📞 {phone}</div>}
      {vehicle && <div className="text-xs text-neutral-400">🚗 {vehicle}</div>}

      {(slotStart || slotEnd) && (
        <div className="flex flex-col gap-1">
          {slotStart && (
            <input
              type="datetime-local"
              value={slotStart.slice(0, 16)}
              onChange={(e) =>
                onUpdateTime({
                  slotStart: new Date(e.target.value).toISOString(),
                })
              }
              className="w-full rounded bg-neutral-700 p-1 text-xs text-white"
            />
          )}
          {slotEnd && (
            <input
              type="datetime-local"
              value={slotEnd.slice(0, 16)}
              onChange={(e) =>
                onUpdateTime({
                  slotEnd: new Date(e.target.value).toISOString(),
                })
              }
              className="w-full rounded bg-neutral-700 p-1 text-xs text-white"
            />
          )}
        </div>
      )}

      <button
        onClick={onDelete}
        className="text-xs text-red-400 hover:text-red-200"
      >
        Удалить
      </button>
    </motion.div>
  </>
)

/* ── DropIndicator ──────────────────────────── */

const DropIndicator = ({ beforeId, column }: { beforeId: string | null; column: string }) => (
  <div
    data-before={beforeId || '-1'}
    data-column={column}
    className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
  />
)

/* ── BurnBarrel (удалить карточку перетаскиванием) ─── */

const BurnBarrel = ({
  setCards,
  onDelete,
}: {
  setCards: Dispatch<SetStateAction<CardType[]>>
  onDelete?: (id: string) => void
}) => {
  const [active, setActive] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setActive(true)
  }

  const handleDragLeave = () => setActive(false)

  const handleDrop = (e: React.DragEvent) => {
    const cardId = e.dataTransfer.getData('cardId')
    setCards((prev) => prev.filter((c) => c.id !== cardId))
    onDelete?.(cardId)
    setActive(false)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl',
        active
          ? 'border-red-800 bg-red-800/20 text-red-500'
          : 'border-neutral-500 bg-neutral-500/20 text-neutral-500'
      )}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  )
}

/* ── AddCard (demonstration, остаётся) ───────── */

const AddCard = ({
  column,
  setCards,
}: {
  column: ColumnType
  setCards: Dispatch<SetStateAction<CardType[]>>
}) => {
  const [text, setText] = useState('')
  const [adding, setAdding] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setCards((prev) => [
      ...prev,
      { id: Math.random().toString(), title: text.trim(), column },
    ])
    setText('')
    setAdding(false)
  }

  return adding ? (
    <motion.form layout onSubmit={handleSubmit}>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add new task…"
        className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm placeholder-violet-300 focus:outline-0"
      />
      <div className="mt-1.5 flex justify-end gap-1.5">
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-50"
        >
          Close
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 hover:bg-neutral-300"
        >
          <span>Add</span>
          <FiPlus />
        </button>
      </div>
    </motion.form>
  ) : (
    <motion.button
      layout
      onClick={() => setAdding(true)}
      className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-50"
    >
      <span>Add card</span>
      <FiPlus />
    </motion.button>
  )
}

/* ── Дефолтные демо-карты ───────────────────── */

const DEFAULT_CARDS: CardType[] = [
  { id: '1', title: 'Demo task', column: 'backlog' },
]
