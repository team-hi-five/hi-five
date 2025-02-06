package com.h5.schedule.repository;

import com.h5.schedule.entity.ConsultMeetingScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultMeetingScheduleRepository extends JpaRepository<ConsultMeetingScheduleEntity, Integer> {

    @Query("SELECT c FROM ConsultMeetingScheduleEntity c WHERE c.host.id = :consultantUserId " +
            "AND DATE(c.schdlDttm) = :date AND c.deleteDttm IS NULL")
    List<ConsultMeetingScheduleEntity> findByHostIdAndSchdlDttm(
            @Param("consultantUserId") Integer consultantUserId,
            @Param("date") LocalDate date);

    @Query("SELECT DISTINCT DATE(c.schdlDttm) FROM ConsultMeetingScheduleEntity c " +
            "WHERE c.childUserEntity.id = :childUserId " +
            "AND YEAR(c.schdlDttm) = :year " +
            "AND MONTH(c.schdlDttm) = :month " +
            "AND c.deleteDttm IS NULL")
    List<String> findDatesByChildUserIdAndYearMonth(@Param("childUserId") Integer childUserId,
                                                    @Param("year") int year,
                                                    @Param("month") int month);

    @Query("SELECT c FROM ConsultMeetingScheduleEntity c " +
            "WHERE c.childUserEntity.id = :childUserId " +
            "AND YEAR(c.schdlDttm) = :year " +
            "AND MONTH(c.schdlDttm) = :month " +
            "AND c.deleteDttm IS NULL")
    List<ConsultMeetingScheduleEntity> findByChildUserIdAndYearMonth(@Param("childUserId") Integer childUserId,
                                                                     @Param("year") int year,
                                                                     @Param("month") int month);


    @Query("SELECT TIME_FORMAT(c.schdlDttm, '%H:%i') FROM ConsultMeetingScheduleEntity c " +
            "WHERE c.host.id = :consultantUserId AND DATE(c.schdlDttm) = :date AND c.deleteDttm IS NULL")
    List<String> findBookedTimesByConsultant(@Param("consultantUserId") Integer consultantUserId,
                                             @Param("date") LocalDate date);

    @Query("SELECT COUNT(c) > 0 FROM ConsultMeetingScheduleEntity c " +
            "WHERE c.host.id = :consultantUserId AND c.schdlDttm = :dateTime AND c.deleteDttm IS NULL")
    boolean existsByConsultantAndDateTime(@Param("consultantUserId") Integer consultantUserId,
                                          @Param("dateTime") LocalDateTime dateTime);

    @Modifying
    @Query("UPDATE ConsultMeetingScheduleEntity c SET c.deleteDttm = CURRENT_TIMESTAMP WHERE c.id = :id AND c.deleteDttm IS NULL")
    void modifyDeleteDttmById(@Param("id") Integer id);

    @Query("SELECT c FROM ConsultMeetingScheduleEntity c " +
            "WHERE c.childUserEntity.id IN :childUserIds " +
            "AND DATE(c.schdlDttm) = :date " +
            "AND c.deleteDttm IS NULL")
    List<ConsultMeetingScheduleEntity> findByChildUserIdsAndDate(@Param("childUserIds") List<Integer> childUserIds,
                                                             @Param("date") LocalDate date);

    @Query("SELECT DISTINCT DATE(c.schdlDttm) FROM ConsultMeetingScheduleEntity c " +
            "WHERE c.childUserEntity.id IN :childUserIds AND c.deleteDttm IS NULL")
    List<String> findDatesByChildUserIds(@Param("childUserIds") List<Integer> childUserIds);


}
