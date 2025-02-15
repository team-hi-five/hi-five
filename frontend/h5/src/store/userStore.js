import { create } from 'zustand';

export const useUserStore = create((set) => ({
  role: "",
  
  setUserRole: (role) => set({ role }),
}));