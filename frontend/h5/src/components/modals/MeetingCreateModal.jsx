import { useState } from 'react';
import './MeetingCreateModal.css';
import SingleButtonAlert from '../common/SingleButtonAlert';
import TimeSlotSelector from './TimeSlotSelector';
import { Calendar } from 'primereact/calendar';

const MeetingCreateModal = ({ onClose, bookedSlots = [] }) => {
    const [formData, setFormData] = useState({
        counselorName: '',
        childName: '',
        email: '',
        parentName: '',
        type: '',
        date: '',
        time: ''
    });

    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 임시 검색 결과 데이터
    const searchResults = [
        {
            id: 1,
            image: "/kid.png",
            childName: "정수연",
            parentName: "학부모이름fffff",
            email: "학부모이메일fffff"
        },
        {
            id: 2,
            image: "/path/to/image2.jpg",
            childName: "임남기",
            parentName: "학부모이름ddddd",
            email: "학부모이메일ddddd"
        },
        {
            id: 3,
            image: "/path/to/image3.jpg",
            childName: "김서린",
            parentName: "학부모이름ccccc",
            email: "학부모이메일ccccc"
        },
        {
            id: 4,
            image: "/path/to/image3.jpg",
            childName: "박성원",
            parentName: "학부모이름ccccc",
            email: "학부모이메일ccccc"
        }
    ];

    const handleChildSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowDropdown(true);
    };

    const handleSelectChild = (child) => {
        setFormData(prev => ({
            ...prev,
            childName: child.childName,
            parentName: child.parentName,
            email: child.email
        }));
        setShowDropdown(false);
        setSearchTerm(child.childName);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 상담 생성 API 호출
            // await createMeeting(formData);
            
            // 성공 알림
            await SingleButtonAlert('상담 생성이 완료되었습니다.');
            onClose();
        } catch (error) {
            // 에러 발생 시 에러 알림
            await SingleButtonAlert('상담 생성 중 오류가 발생했습니다.');
        }
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTimeSelect = (time) => {
        setFormData(prev => ({
            ...prev,
            time: time
        }));
    };

    return (
        <div className="co-m-overlay">
            <div className="co-m-content">
                <div className="co-m-header">
                    <h2>상담일정 생성</h2>
                    <button className="co-m-close" onClick={onClose}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="co-m-form">
                    <div className="co-m-form-group">
                        <label>상담사 이름</label>
                        <input
                            type="text"
                            name="counselorName"
                            value={formData.counselorName}
                            onChange={handleChange}
                            placeholder="상담사 이름을 입력해주세요."
                        />
                    </div>

                    <div className="co-m-form-group">
                        <label>아동 이름</label>
                        <div className="co-m-search-container">
                            <div className="co-m-search-input">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleChildSearch}
                                    placeholder="아동 이름을 입력하세요"
                                />
                                <span className="co-m-search-icon">
                                    <i className="pi pi-search"></i>
                                </span>
                            </div>
                            {showDropdown && searchTerm && (
                                <div className="co-m-search-dropdown">
                                    {searchResults
                                        .filter(result => 
                                            result.childName.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((result) => (
                                            <div
                                                key={result.id}
                                                className="co-m-search-item"
                                                onClick={() => handleSelectChild(result)}
                                            >
                                                <img src={result.image} alt={result.childName} className="co-m-search-item-image" />
                                                <div className="co-m-search-item-info">
                                                    <span>{result.childName}</span>
                                                    <span>{result.parentName}</span>
                                                    <span>{result.email}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="co-m-form-group">
                        <label>이메일</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="아동을 선택하면 자동으로 입력됩니다."
                            disabled
                        />
                    </div>

                    <div className="co-m-form-group">
                        <label>학부모 이름</label>
                        <input
                            type="text"
                            name="parentName"
                            value={formData.parentName}
                            onChange={handleChange}
                            placeholder="아동을 선택하면 자동으로 입력됩니다."
                            disabled
                        />
                    </div>

                    <div className="co-m-form-group">
                        <label>상담 유형</label>
                        <select 
                            name="type" 
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="">유형을 선택해주세요.</option>
                            <option value="type1">아동(게임)</option>
                            <option value="type2">학부모(아동학습현황)</option>
                        </select>
                    </div>

                    <div className="co-m-form-group">
                        <label>상담 날짜</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="co-m-date-input"
                        />
                    </div>

                    <div className="co-m-form-group">
                        <label>상담 시간</label>
                        <TimeSlotSelector
                            selectedDate={formData.date}
                            onTimeSelect={handleTimeSelect}
                            bookedSlots={bookedSlots}
                            value={formData.time}
                        />
                    </div>

                    <div className="co-m-buttons">
                        <button type="button" className="co-m-cancel-btn" onClick={onClose}>
                            취소
                        </button>
                        <button type="submit" className="co-m-submit-btn">
                            상담 생성
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MeetingCreateModal;