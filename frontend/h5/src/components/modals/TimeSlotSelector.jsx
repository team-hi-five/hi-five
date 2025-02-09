import { useState, useEffect } from 'react';
import './TimeSlotSelector.css';

const TimeSlotSelector = ({ selectedDate, onTimeSelect, bookedSlots = [], value }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(value || '');

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]); // 🔹 선택된 날짜가 없으면 슬롯 초기화
      return;
    }

    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      const startTime = `${String(hour).padStart(2, '0')}:00`;
      const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
      const timeSlot = `${startTime} ~ ${endTime}`; // 형식 맞추기

      const isBooked = bookedSlots.some(slot => 
        slot.date === selectedDate && slot.time === startTime
      );

      if (!isBooked) {
        slots.push({
          value: timeSlot, // 전체 시간 범위를 value로 저장
          label: timeSlot,
        });
      }
    }

    setAvailableSlots(prevSlots => 
      JSON.stringify(prevSlots) !== JSON.stringify(slots) ? slots : prevSlots
    ); // 🔹 기존 값과 다를 때만 상태 업데이트하여 불필요한 리렌더링 방지
  }, [selectedDate, JSON.stringify(bookedSlots)]); // 🔹 bookedSlots를 문자열로 변환하여 변경 감지

  // value prop이 변경될 때 selectedSlot 업데이트
  useEffect(() => {
    setSelectedSlot(value || '');
  }, [value]);

  const handleTimeSelect = (e) => {
    const selectedTime = e.target.value;
    setSelectedSlot(selectedTime);
    onTimeSelect(selectedTime);
  };

  return (
    <div className="time-slot-select-container">
      <select 
        className="time-slot-select"
        value={selectedSlot}
        onChange={handleTimeSelect}
      >
        <option value="">상담시간을 선택해주세요</option>
        {availableSlots.map((slot) => (
          <option key={slot.value} value={slot.value}>
            {slot.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeSlotSelector;
