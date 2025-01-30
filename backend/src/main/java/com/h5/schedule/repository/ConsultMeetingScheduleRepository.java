package com.h5.schedule.repository;

import com.h5.schedule.entity.ConsultMeetingScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultMeetingScheduleRepository extends JpaRepository<ConsultMeetingScheduleEntity, Integer> {

    @Query("SELECT c FROM ConsultMeetingScheduleEntity c WHERE c.host.id = :consultantId " +
            "AND DATE(c.schdlDttm) = :date AND c.deleteDttm IS NULL")
    List<ConsultMeetingScheduleEntity> findByHostIdAndSchdlDttm(
            @Param("consultantId") Integer consultantId,
            @Param("date") String date);

    @Query("SELECT DISTINCT DATE(c.schdlDttm) FROM ConsultMeetingScheduleEntity c " +
            "WHERE c.childUser.id = :childId AND c.deleteDttm IS NULL")
    List<String> findDatesByChildId(@Param("childId") Integer childId);

    @Query("SELECT c FROM ConsultMeetingScheduleEntity c " +
            "WHERE c.childUser.id = :childId AND c.deleteDttm IS NULL")
    List<ConsultMeetingScheduleEntity> findByChildId(@Param("childId") Integer childId);

    @Query("SELECT TIME_FORMAT(c.schdlDttm, '%H:%i') FROM ConsultMeetingScheduleEntity c " +
            "WHERE c.host.id = :consultantId AND DATE(c.schdlDttm) = :date AND c.deleteDttm IS NULL")
    List<String> findBookedTimesByConsultant(@Param("consultantId") Integer consultantId,
                                             @Param("date") String date);

    @Query("SELECT COUNT(c) > 0 FROM ConsultMeetingScheduleEntity c " +
            "WHERE c.host.id = :consultantId AND c.schdlDttm = :dateTime AND c.deleteDttm IS NULL")
    boolean existsByConsultantAndDateTime(@Param("consultantId") Integer consultantId,
                                          @Param("dateTime") String dateTime);

    @Modifying
    @Query("UPDATE ConsultMeetingScheduleEntity c SET c.deleteDttm = CURRENT_TIMESTAMP WHERE c.id = :id AND c.deleteDttm IS NULL")
    void modifyDeleteDttmById(@Param("id") Integer id);

}
