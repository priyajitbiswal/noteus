import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#14b8a6', '#f97316',
]

const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)]
const randomId = () => crypto.randomUUID()

export const useUserStore = create(
  persist(
    (set) => ({
      id: randomId(),
      name: '',
      color: randomColor(),
      isSetup: false,

      setupUser: (name, color) =>
        set({ name, color, isSetup: true }),

      resetUser: () =>
        set({ id: randomId(), name: '', color: randomColor(), isSetup: false }),
    }),
    { name: 'collab-user' }
  )
)

export { COLORS }
