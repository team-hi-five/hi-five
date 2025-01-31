import CounselorHeader from "../../../components/Counselor/CounselorHeader";
import Footer from "../../../components/common/footer";
import { useState } from 'react';
import PasswordChangeModal from "../../../components/modals/PasswordChangeModal";
import '../Css/CounselorMyPage.css';

function CounselorMyPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <main className="co-my-container" >
                <CounselorHeader />
                <div className="co_blankdefault" style={{marginTop: '64.49px'}}></div>
                <div className="co-mypage-container">
                    <div className="co-mypage-content">
                        <div className="co-profile-section">
                            <div className="co-profile-left">
                                <div className="co-profile-image-container">
                                    <img 
                                        src="/test/kid2.png" 
                                        alt="상담사 프로필" 
                                        className="co-profile-image"
                                    />
                                </div>
                                <button className="co-change-password-btn" onClick={() => setIsModalOpen(true)}>비밀 번호 변경</button>
                            </div>
                            <div className="co-profile-info">
                                <div className="co-info-group">
                                    <label>상담사 이름</label>
                                    <input 
                                        type="text" 
                                        value="정수연" 
                                        readOnly 
                                        className="co-info-input"
                                    />
                                </div>
                                <div className="co-info-group">
                                    <label>핸드폰 번호</label>
                                    <input 
                                        type="text" 
                                        value="010-8888-8888" 
                                        readOnly 
                                        className="co-info-input"
                                    />
                                </div>
                                <div className="co-info-group">
                                    <label>이메일</label>
                                    <input 
                                        type="email" 
                                        value="wjfjejfa@naber.com" 
                                        readOnly 
                                        className="co-info-input"
                                    />
                                </div>
                                <div className="co-info-group">
                                    <label>소속기관명</label>
                                    <input 
                                        type="text" 
                                        value="C205" 
                                        readOnly 
                                        className="co-info-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
            <PasswordChangeModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
}

export default CounselorMyPage;