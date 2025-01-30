package com.h5.statistic.service;

import com.h5.child.repository.ChildUserRepository;
import com.h5.emotion.entity.EmotionEntity;
import com.h5.emotion.repository.EmotionRepository;
import com.h5.global.exception.UserNotFoundException;
import com.h5.statistic.dto.data.ChatbotDateDto;
import com.h5.statistic.dto.data.PentagonAndStickDataDto;
import com.h5.statistic.entity.ChatBotDocument;
import com.h5.statistic.entity.StatisticEntity;
import com.h5.statistic.repository.ChatbotRepository;
import com.h5.statistic.repository.StatisticRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatisticServiceImpl implements StatisticService {

    private final StatisticRepository statisticRepository;
    private final EmotionRepository emotionRepository;
    private final ChildUserRepository childUserRepository;
    private final ChatbotRepository chatbotRepository;

    @Autowired
    public StatisticServiceImpl(StatisticRepository statisticRepository,
                                EmotionRepository emotionRepository,
                                ChildUserRepository childUserRepository,
                                ChatbotRepository chatbotRepository) {
        this.statisticRepository = statisticRepository;
        this.emotionRepository = emotionRepository;
        this.childUserRepository = childUserRepository;
        this.chatbotRepository = chatbotRepository;
    }

    @Override
    public Map<Integer, PentagonAndStickDataDto> dataAnalysis(int childUserId) {


        return null;
    }

    private Map<Integer, PentagonAndStickDataDto> getPentagonAndStickData(int childUserId) {
        List<EmotionEntity> emotionEntityList = emotionRepository.findAll();

        Map<Integer, PentagonAndStickDataDto> PentagonAndStickDataDtoMap = new HashMap<>();
        for (EmotionEntity emotionEntity : emotionEntityList) {
            int emotionEntityId = emotionEntity.getId();

            StatisticEntity statisticEntity = statisticRepository.findByEmotion_IdAndChildUser_Id(emotionEntityId, childUserId);

            PentagonAndStickDataDto dataAnalysisRequestDto = PentagonAndStickDataDto.builder()
                    .childUserId(childUserId)
                    .childName(childUserRepository.findNameById(childUserId)
                            .orElseThrow(() -> new UserNotFoundException("User not found for childUserId: " + childUserId))
                            .getName())
                    .emotionId(emotionEntityId)
                    .rating(statisticEntity.getRating())
                    .stageCrtRate1(statisticEntity.getStageCrtRate1())
                    .stageCrtRate2(statisticEntity.getStageCrtRate2())
                    .stageCrtRate3(statisticEntity.getStageCrtRate3())
                    .stageCrtRate4(statisticEntity.getStageCrtRate4())
                    .stageCrtRate5(statisticEntity.getStageCrtRate5())
                    .stageCrtCnt1(statisticEntity.getStageCrtCnt1())
                    .stageCrtCnt2(statisticEntity.getStageCrtCnt2())
                    .stageCrtCnt3(statisticEntity.getStageCrtCnt3())
                    .stageCrtCnt4(statisticEntity.getStageCrtCnt4())
                    .stageCrtCnt5(statisticEntity.getStageCrtCnt5())
                    .stageTryCnt1(statisticEntity.getStageTryCnt1())
                    .stageTryCnt2(statisticEntity.getStageTryCnt2())
                    .stageTryCnt3(statisticEntity.getStageTryCnt3())
                    .stageTryCnt4(statisticEntity.getStageTryCnt4())
                    .stageTryCnt5(statisticEntity.getStageTryCnt5())
                    .build();

            PentagonAndStickDataDtoMap.put(emotionEntityId, dataAnalysisRequestDto);
        }

        return PentagonAndStickDataDtoMap;
    }

    private ChatbotDateDto getChatbotDate(int childUserId) {
        List<ChatBotDocument> chatbotDateList = chatbotRepository.findByChildUserId(childUserId);

        return ChatbotDateDto.builder()
                .chatbotDateList(chatbotDateList.stream()
                        .map(chat -> chat.getChatBotUseDttm().toLocalDate())
                        .distinct()
                        .sorted()
                        .collect(Collectors.toList()))
                .build();
    }
}
