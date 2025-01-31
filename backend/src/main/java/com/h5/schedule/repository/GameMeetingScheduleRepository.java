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

    @Query("SELECT g FROM GameMeetingScheduleEntity g WHERE g.host.id = :consultantId " +
            "AND DATE(g.schdlDttm) = :date AND g.deleteDttm IS NULL")
    List<GameMeetingScheduleEntity> findByHostIdAndSchdlDttm(
            @Param("consultantId") Integer consultantId,
            @Param("date") String date);

    @Query("SELECT DISTINCT DATE(g.schdlDttm) FROM GameMeetingScheduleEntity g " +
            "WHERE g.childUser.id = :childId AND g.deleteDttm IS NULL")
    List<String> findDatesByChildId(@Param("childId") Integer childId);

    @Query("SELECT g FROM GameMeetingScheduleEntity g " +
            "WHERE g.childUser.id = :childId AND g.deleteDttm IS NULL")
    List<GameMeetingScheduleEntity> findByChildId(@Param("childId") Integer childId);

    @Query("SELECT TIME_FORMAT(g.schdlDttm, '%H:%i') FROM GameMeetingScheduleEntity g " +
            "WHERE g.host.id = :consultantId AND DATE(g.schdlDttm) = :date AND g.deleteDttm IS NULL")
    List<String> findBookedTimesByConsultant(@Param("consultantId") Integer consultantId,
                                             @Param("date") String date);

    @Query("SELECT COUNT(g) > 0 FROM GameMeetingScheduleEntity g " +
            "WHERE g.host.id = :consultantId AND g.schdlDttm = :dateTime AND g.deleteDttm IS NULL")
    boolean existsByConsultantAndDateTime(@Param("consultantId") Integer consultantId,
                                          @Param("dateTime") String dateTime);

    @Modifying
    @Query("UPDATE GameMeetingScheduleEntity g SET g.deleteDttm = CURRENT_TIMESTAMP WHERE g.id = :id AND g.deleteDttm IS NULL")
    void modifyDeleteDttmById(@Param("id") int id);

    @Query("SELECT g FROM GameMeetingScheduleEntity g " +
            "WHERE g.childUser.id IN :childIds " +
            "AND DATE(g.schdlDttm) = :date " +
            "AND g.deleteDttm IS NULL")
    List<GameMeetingScheduleEntity> findByChildIdsAndDate(@Param("childIds") List<Integer> childIds,
                                                          @Param("date") String date);

    @Query("SELECT DISTINCT DATE(g.schdlDttm) FROM GameMeetingScheduleEntity g " +
            "WHERE g.childUser.id IN :childIds AND g.deleteDttm IS NULL")
    List<String> findDatesByChildIds(@Param("childIds") List<Integer> childIds);

}

