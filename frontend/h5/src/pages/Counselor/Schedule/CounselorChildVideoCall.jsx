import api from "../../../api/api";
import "./CounselorChildVideoCall.css";
import { useState, useEffect, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { sendAlarm } from "../../../api/alarm.jsx";
import { ImExit } from "react-icons/im";
import { MdNavigateNext, MdNavigateBefore, MdOutlineNotStarted } from "react-icons/md";
import { PiRecordFill, PiRecord } from "react-icons/pi";

function CounselorChildVideoCall() {
    const OV = useRef(new OpenVidu());
    const [session, setSession] = useState(null);

    // 상담사 자신의 영상 (publisher)
    const [publisher, setPublisher] = useState(null);

    // 아동이 퍼블리시하는 스트림 (화면공유 / 카메라) 각각 구독
    const [childCamSubscriber, setChildCamSubscriber] = useState(null);
    const [screenSubscriber, setScreenSubscriber] = useState(null);

    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");
    const childId = searchParams.get("childId");

    useEffect(() => {
        const initSession = async () => {
            try {
                const sessionInstance = OV.current.initSession();
                console.log("[CounselorChildVideoCall] 세션 초기화됨:", sessionInstance);

                // 스트림 생성 시 (아동이 publish하는 모든 스트림)
                sessionInstance.on("streamCreated", (event) => {
                    console.log("[CounselorChildVideoCall] streamCreated 이벤트 발생");
                    console.log("event.stream.typeOfVideo:", event.stream.typeOfVideo);
                    console.log("event.stream.videoType:", event.stream.videoType);

                    const newSubscriber = sessionInstance.subscribe(event.stream, undefined);

                    // 아동이 보낸 스트림 분기
                    if (event.stream.typeOfVideo === "SCREEN") {
                        console.log("[Counselor] 화면공유 스트림 구독");
                        setScreenSubscriber(newSubscriber);
                    } else if (event.stream.typeOfVideo === "CAMERA") {
                        console.log("[Counselor] 카메라 스트림 구독");
                        setChildCamSubscriber(newSubscriber);
                    } else {
                        // 혹은 "WEBRTC"로 표기될 수도 있음
                        console.log("[Counselor] 다른 스트림 구독:", event.stream);
                    }
                });

                sessionInstance.on("streamDestroyed", (event) => {
                    console.log("[CounselorChildVideoCall] streamDestroyed 이벤트 발생");
                    if (event.stream.typeOfVideo === "SCREEN") {
                        setScreenSubscriber(null);
                    } else if (event.stream.typeOfVideo === "CAMERA") {
                        setChildCamSubscriber(null);
                    }
                });

                // 세션 토큰 발급
                const getToken = async () => {
                    try {
                        const response = await api.post("/session/join", { type, childId });
                        console.log("[CounselorChildVideoCall] 토큰 응답:", response.data);
                        return response.data;
                    } catch (error) {
                        console.error("[CounselorChildVideoCall] 토큰 요청 실패:", error);
                        throw error;
                    }
                };

                const token = await getToken();
                console.log("[CounselorChildVideoCall] 연결 토큰:", token);

                // 세션 연결
                await sessionInstance.connect(token);
                console.log("[CounselorChildVideoCall] 세션 connect 완료");

                // 상담사 웹캠 퍼블리셔
                const myPublisher = OV.current.initPublisher(undefined, {
                    audioSource: true,   // 상담사 마이크
                    videoSource: true,   // 상담사 카메라
                    publishAudio: true,
                    publishVideo: true,
                });
                await sessionInstance.publish(myPublisher);
                console.log("[CounselorChildVideoCall] 상담사 퍼블리시 완료");

                setSession(sessionInstance);
                setPublisher(myPublisher);
            } catch (error) {
                console.error("[CounselorChildVideoCall] 세션 초기화 오류:", error);
            }
        };

        initSession();
    }, [childId, type]);

    // 만약 "재구독" 로직이 필요하다면(페이지 로딩 도중 publish가 이미 되어있던 경우)
    // 아래처럼 session.streams를 확인해서 필요한 스트림을 subscribe 할 수도 있습니다.
    // 하지만 2.x 버전 이후엔 session.streams 대신 session.on("streamCreated")가 대부분 처리해줍니다.

    // ---------------------------------------------------------
    // 상대방(아동)이 없는지 체크 -> 알람 전송 (예: 1회성 호출)
    // ---------------------------------------------------------
    const isOtherParticipantAbsent = () => {
        if (!session) {
            console.log("[isOtherParticipantAbsent] 세션이 아직 초기화되지 않았습니다.");
            return false;
        }
        let childStreamExists = false;

        if (session.streams && typeof session.streams.forEach === "function") {
            session.streams.forEach((stream) => {
                if (stream.typeOfVideo === "SCREEN" || stream.typeOfVideo === "CAMERA") {
                    childStreamExists = true;
                }
            });
        }
        if (!childStreamExists) {
            console.log("[isOtherParticipantAbsent] 아동 스트림이 세션에 존재하지 않습니다.");
        } else {
            console.log("[isOtherParticipantAbsent] 아동 스트림이 확인되었습니다.");
        }
        return !childStreamExists;
    };

    useEffect(() => {
        const checkAbsence = async () => {
            if (isOtherParticipantAbsent()) {
                console.log("[checkAbsence] 아동이 없는 것 같아 알람 전송...");
                const alarmDto = {
                    toUserId: Number(childId),
                    senderRole: "ROLE_CONSULTANT",
                    sessionType: type,
                };
                try {
                    const response = await sendAlarm(alarmDto);
                    console.log("[checkAbsence] 알람 전송 성공:", response);
                } catch (error) {
                    console.error("[checkAbsence] 알람 전송 실패:", error);
                }
            }
        };

        checkAbsence();
    }, [session, childId, type]);

    // ---------------------------------------------------------
    // 시그널 전송
    // ---------------------------------------------------------
    const sendSignal = (data, sigType) => {
        if (!session) return;
        session
            .signal({
                data: data,
                to: [],
                type: sigType,
            })
            .then(() => {
                console.log("Message successfully sent:", data);
            })
            .catch((error) => {
                console.error("Signal error:", error);
            });
    };

    // 상담사 측에서 버튼 누르면 아동 측에 signal 전송
    const handleStartChapter = () => {
        sendSignal("start-chapter", "start-chapter");
    };
    const handlePreviousStage = () => {
        sendSignal("previous-stage", "previous-stage");
    };
    const handleStartRecording = () => {
        sendSignal("record-start", "record-start");
    };
    const handleStopRecording = () => {
        sendSignal("record-stop", "record-stop");
    };
    const handleNextStage = () => {
        sendSignal("next-stage", "next-stage");
    };

    const handleEndChapter = () => {
        sendSignal("end-chapter", "end-chapter");
        Swal.fire({
            title: "수업이 종료되었습니다! <br> 수고하셨습니다!",
            imageUrl: "/child/character/againCh.png",
            imageWidth: 200,
            imageHeight: 200,
            showConfirmButton: false,
            timer: 2000,
        });
        if (session) {
            session.disconnect();
        }
        // 팝업 닫거나 페이지 이동 등
        // window.close();
    };

    // ---------------------------------------------------------
    // 렌더링
    // ---------------------------------------------------------
    return (
        <div className="co-consultation-child-page">
            <img src="/logo.png" alt="로고" className="co-logoo" />
            <div className="co-video-layout">
                {/* (1) 아동의 화면공유 스트림 */}
                <div className="co-child-main-video-container">
                    {screenSubscriber ? (
                        <video
                            className="co-main-video-container"
                            ref={(video) => {
                                if (video && screenSubscriber) {
                                    video.srcObject = screenSubscriber.stream.getMediaStream();
                                }
                            }}
                            autoPlay
                            playsInline
                        />
                    ) : (
                        <div className="co-error">
                            <p>아동의 화면 공유가 없습니다.</p>
                        </div>
                    )}
                    <h3 className="co-learning-child-title">아동 게임 공유 화면</h3>
                </div>

                {/* (2) 아동의 카메라 스트림 */}
                <div className="co-child-cam-video-container">
                    {childCamSubscriber ? (
                        <video
                            className="co-child-cam-video"
                            ref={(video) => {
                                if (video && childCamSubscriber) {
                                    video.srcObject = childCamSubscriber.stream.getMediaStream();
                                }
                            }}
                            autoPlay
                            playsInline
                        />
                    ) : (
                        <div className="co-error">
                            <p>아동 카메라 영상이 없습니다.</p>
                        </div>
                    )}
                    <h3>아동 카메라</h3>
                </div>

                {/* (3) 상담사 자신의 카메라 */}
                <div className="co-self-participant-video">
                    <div className="co-participatn-coun-container">
                        {publisher && (
                            <video
                                className="co-slef-participant-video"
                                ref={(video) => {
                                    if (video && publisher) {
                                        video.srcObject = publisher.stream.getMediaStream();
                                    }
                                }}
                                autoPlay
                                muted
                                playsInline
                            />
                        )}
                        <h3>상담사 화면</h3>
                    </div>
                </div>
            </div>

            {/* 버튼들 */}
            <div className="co-button-controls">
                <div>
                    <button className="web-control-btn" onClick={handleStartChapter}>
                        <MdOutlineNotStarted />
                    </button>
                    <p>학습 시작</p>
                </div>

                <div>
                    <button className="web-control-btn" onClick={handlePreviousStage}>
                        <MdNavigateBefore />
                    </button>
                    <p>이전 단원</p>
                </div>

                <div>
                    <button className="web-control-btn" onClick={handleStartRecording}>
                        <PiRecord />
                    </button>
                    <p>녹화 시작</p>
                </div>

                <div>
                    <button className="web-record-btn" onClick={handleStopRecording}>
                        <PiRecordFill />
                    </button>
                    <p>녹화 중지</p>
                </div>
                <div>
                    <button className="web-control-btn" onClick={handleNextStage}>
                        <MdNavigateNext />
                    </button>
                    <p>다음 단원</p>
                </div>
                <div>
                    <button className="web-co-end-call" onClick={handleEndChapter}>
                        <ImExit />
                    </button>
                    <p>학습 종료</p>
                </div>
            </div>
        </div>
    );
}

export default CounselorChildVideoCall;
