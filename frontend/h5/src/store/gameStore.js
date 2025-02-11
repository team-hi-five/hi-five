import { create } from "zustand";
import { reviewGame } from "../api/childGameContent";

const useGameStore = create((set, get) => ({
  chapterData: {},
  currentChapter: null,
  currentStageIndex: 0,

  fetchChapterData: async (chapterId) => {
    try {
      // 초기 상태
      // 한번에 모든 스테이지 데이터 가져오기
      const stagePromises = Array.from({ length: 5 }, (_, i) =>
        reviewGame(chapterId, i + 1)
      );

      const stageResults = await Promise.all(stagePromises);
      const chapterData = stageResults
        .map((res, index) => (res ? { ...res, gameStageId: index + 1 } : null))
        .filter(Boolean);

      // zustand에서 상태를 업데이트할때 사용(상태 저장)
      set({
        chapterData: { ...get().chapterData, [chapterId]: chapterData },
        currentChapter: chapterId,
        currentStageIndex: 0,
      });

      return chapterData;
    } catch (error) {
      console.error(`❌: 챕터 ${chapterId} 데이터 가져오기 실패:`, error);
      return null;
    }
  },

  // 선택된 챕터의 스테이지 정보 가져오기
  getCurrentGameData: () => {
    const { chapterData, currentChapter, currentStageIndex } = get();
    return chapterData[currentChapter]?.[currentStageIndex] || null;
  },

  // 다음 스테이지로 이동
  // 한번에 모든 데이터를 가져오지만 다음 스테이지로 이동할때 사용
  incrementStage: () =>
    set((state) => ({
      currentStageIndex:
        state.currentStageIndex ===
        state.chapterData[state.currentChapter].length - 1
          ? state.currentStageIndex
          : state.currentStageIndex + 1,
    })),

  // 챕터 설정(초기화)
  setCurrentChapter: (chapterId) =>
    set({ currentChapter: chapterId, currentStageIndex: 0 }),

  // 챕터 선택
  selectChapter: (chapterId) => {
    set({ currentChapter: chapterId, currentStageIndex: 0 });
    get().fetchChapterData(chapterId);
  },
}));

export default useGameStore;
