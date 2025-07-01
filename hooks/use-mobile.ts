'use client'

import { useEffect, useState } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Проверяем при загрузке
    checkIsMobile()

    // Отслеживаем изменения размера экрана
    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  return isMobile
}