import { create } from 'zustand'

const useStore = create((set) => ({
  user: null,
  semiDealerRole: null, // 'official' | 'introducer' | 'consumer'
  setUser: (user) => set({ user }),
  setSemiDealerRole: (role) => set({ semiDealerRole: role }),
  logout: () => set({ user: null, semiDealerRole: null }),
}))

export default useStore
