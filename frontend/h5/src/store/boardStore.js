import { create } from 'zustand';

export const useBoardStore = create((set) => ({
  paActiveTab: "notice", // 초기값을 notice로 설정
  setPaActiveTab: (tab) => set({ paActiveTab: tab }),
}));