import { create } from 'zustand'

const useStore = create((set) => ({
  user: null,
  firebaseUser: null,
  confirmationResult: null,

  setUser: (user) => set({ user }),
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setConfirmationResult: (confirmationResult) => set({ confirmationResult }),
  logout: () => set({ user: null, firebaseUser: null, confirmationResult: null }),
}))

export default useStore