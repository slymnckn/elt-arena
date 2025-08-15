"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react"
import type { Grade } from "@/lib/data"

interface DataContextType {
  grades: Grade[]
  setGrades: Dispatch<SetStateAction<Grade[]>>
  loading: boolean
  refreshGrades: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function useDataContext() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider")
  }
  return context
}

// Alias for useDataContext
export const useData = useDataContext

interface DataProviderProps {
  children: ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGrades = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/grades')
      if (!response.ok) {
        throw new Error('Failed to fetch grades')
      }
      const data = await response.json()
      setGrades(data)
    } catch (error) {
      console.error("Error fetching grades:", error)
      setGrades([])
    } finally {
      setLoading(false)
    }
  }

  const refreshGrades = async () => {
    await fetchGrades()
  }

  useEffect(() => {
    fetchGrades()
  }, [])

  return (
    <DataContext.Provider value={{ grades, setGrades, loading, refreshGrades }}>
      {children}
    </DataContext.Provider>
  )
}
