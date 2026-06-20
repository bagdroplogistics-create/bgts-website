'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ModalType = 'bgts' | 'ev'

interface BookingModalContextValue {
  isOpen: boolean
  modalType: ModalType
  openModal: () => void      // opens BGTS Transport modal
  openEVModal: () => void    // opens BGTS EV modal
  closeModal: () => void
}

const BookingModalContext = createContext<BookingModalContextValue | null>(null)

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen]       = useState(false)
  const [modalType, setModalType] = useState<ModalType>('bgts')

  const openModal   = useCallback(() => { setModalType('bgts'); setIsOpen(true)  }, [])
  const openEVModal = useCallback(() => { setModalType('ev');   setIsOpen(true)  }, [])
  const closeModal  = useCallback(() => setIsOpen(false), [])

  return (
    <BookingModalContext.Provider value={{ isOpen, modalType, openModal, openEVModal, closeModal }}>
      {children}
    </BookingModalContext.Provider>
  )
}

export function useBookingModal() {
  const ctx = useContext(BookingModalContext)
  if (!ctx) throw new Error('useBookingModal must be used within BookingModalProvider')
  return ctx
}
