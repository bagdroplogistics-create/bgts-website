'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ModalType = 'bgts' | 'ev'

interface BookingModalContextValue {
  isOpen: boolean
  modalType: ModalType
  evPlan: string | null           // 'flex-ev' | 'dedi-ev' | 'fleet-ev' | null
  openModal: () => void
  openEVModal: (plan?: string) => void
  closeModal: () => void
}

const BookingModalContext = createContext<BookingModalContextValue | null>(null)

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen]       = useState(false)
  const [modalType, setModalType] = useState<ModalType>('bgts')
  const [evPlan, setEvPlan]       = useState<string | null>(null)

  const openModal   = useCallback(() => { setModalType('bgts'); setIsOpen(true) }, [])
  const openEVModal = useCallback((plan?: string) => {
    setEvPlan(plan ?? null)
    setModalType('ev')
    setIsOpen(true)
  }, [])
  const closeModal  = useCallback(() => { setIsOpen(false); setEvPlan(null) }, [])

  return (
    <BookingModalContext.Provider value={{ isOpen, modalType, evPlan, openModal, openEVModal, closeModal }}>
      {children}
    </BookingModalContext.Provider>
  )
}

export function useBookingModal() {
  const ctx = useContext(BookingModalContext)
  if (!ctx) throw new Error('useBookingModal must be used within BookingModalProvider')
  return ctx
}
