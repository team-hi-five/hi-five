import { create } from "zustand";
import { reviewGame } from "../api/childGameContent";

const useGameStore = create((set, get) => ({
  chapterData: {},
  currentChapter: null,
  currentStage: 1,

  fetchChapterData: async (chapterId) => {
    try {
      // 초기 상태
      const chapterData = [];
      for (let stage = 1; stage <= 5; stage++) {
        const res = await reviewGame(chapterId, stage);
        if (res) {
          chapterData.push({ ...res, gameStageId: stage });
        }
      }
      // zustand에서 상태를 업데이트할때 사용(상태 저장)
      set((state) => ({
        chapterData: { ...state.chapterData, [chapterId]: chapterData },
        currentChapter: chapterId,
        currentStage: 1,
      }));
      return chapterData;
    } catch (error) {
      console.error(`❌: 챕터 ${chapterId} 데이터 가져오기 실패:`, error);
      return null;
    }
  },

  // 선택된 챕터의 스테이지 정보 가져오기
  getCurrentGameData: () => {
    const { chapterData, currentChapter, currentStage } = get();
    return (
      chapterData[currentChapter]?.find(
        (data) => data.gameStageId === currentStage
      ) || null
    );
  },

  incrementStage: () =>
    set((state) => {
      const newStage =
        state.currentStage < 5 ? state.currentStage + 1 : state.currentStage;
      return { currentStage: newStage };
    }),

  setCurrentChapter: (chapterId) =>
    set({ currentChapter: chapterId, currentStage: 1 }),

  // 챕터 선택
  selectChapter: (chapterId) => {
    set({ currentChapter: chapterId, currentStage: 1 });
    get().fetchChapterData(chapterId);
  },
}));

export default useGameStore;
