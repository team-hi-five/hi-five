import { create } from 'zustand';

export const useUserStore = create((set) => ({
  userName: "",
  childUserId: null,
  childUserName: "",
  
  setUserName: (name) => set({ userName: name }),
  setChildData: (id, name) => set({ childUserId: id, childUserName: name }),
}));