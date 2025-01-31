package com.h5.schedule.repository;

import com.h5.schedule.entity.GameMeetingScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameMeetingScheduleRepository extends JpaRepository<GameMeetingScheduleEntity, Integer> {

    @Query("SELECT g FROM GameMeetingScheduleEntity g WHERE g.host.id = :consultantUserId " +
            "AND DATE(g.schdlDttm) = :date AND g.deleteDttm IS NULL")
    List<GameMeetingScheduleEntity> findByHostIdAndSchdlDttm(
            @Param("consultantUserId") Integer consultantUserId,
            @Param("date") String date);

    @Query("SELECT DISTINCT DATE(g.schdlDttm) FROM GameMeetingScheduleEntity g " +
            "WHERE g.childUserEntity.id = :childUserId AND g.deleteDttm IS NULL")
    List<String> findDatesByChildUserId(@Param("childUserId") Integer childUserId);

    @Query("SELECT g FROM GameMeetingScheduleEntity g " +
            "WHERE g.childUserEntity.id = :childUserId AND g.deleteDttm IS NULL")
    List<GameMeetingScheduleEntity> findByChildUserId(@Param("childUserId") Integer childUserId);

    @Query("SELECT TIME_FORMAT(g.schdlDttm, '%H:%i') FROM GameMeetingScheduleEntity g " +
            "WHERE g.host.id = :consultantUserId AND DATE(g.schdlDttm) = :date AND g.deleteDttm IS NULL")
    List<String> findBookedTimesByConsultant(@Param("consultantUserId") Integer consultantUserId,
                                             @Param("date") String date);

    @Query("SELECT COUNT(g) > 0 FROM GameMeetingScheduleEntity g " +
            "WHERE g.host.id = :consultantUserId AND g.schdlDttm = :dateTime AND g.deleteDttm IS NULL")
    boolean existsByConsultantAndDateTime(@Param("consultantUserId") Integer consultantUserId,
                                          @Param("dateTime") String dateTime);

    @Modifying
    @Query("UPDATE GameMeetingScheduleEntity g SET g.deleteDttm = CURRENT_TIMESTAMP WHERE g.id = :id AND g.deleteDttm IS NULL")
    void modifyDeleteDttmById(@Param("id") int id);

    @Query("SELECT g FROM GameMeetingScheduleEntity g " +
            "WHERE g.childUserEntity.id IN :childUserIds " +
            "AND DATE(g.schdlDttm) = :date " +
            "AND g.deleteDttm IS NULL")
    List<GameMeetingScheduleEntity> findByChildUserIdsAndDate(@Param("childUserIds") List<Integer> childUserIds,
                                                          @Param("date") String date);

    @Query("SELECT DISTINCT DATE(g.schdlDttm) FROM GameMeetingScheduleEntity g " +
            "WHERE g.childUserEntity.id IN :childUserIds AND g.deleteDttm IS NULL")
    List<String> findDatesByChildUserIds(@Param("childUserIds") List<Integer> childUserIds);

}

