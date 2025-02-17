import api from "../../../api/api";
import { useState, useEffect, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

function CounselorChildVideoCall() {
    const OV = useRef(new OpenVidu());
    const [session, setSession] = useState(null);
    const [publisher, setPublisher] = useState(null);
    const [screenSubscriber, setScreenSubscriber] = useState(null);
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");
    const childId = searchParams.get("childId");

    useEffect(() => {
        const initSession = async () => {
            try {
                const sessionInstance = OV.current.initSession();

                // 스트림 생성 이벤트 (기본 이벤트: "streamCreated")
                sessionInstance.on("streamCreated", (event) => {
                    console.log("Stream Created Event:", event);
                    const videoType = (event.stream.videoType || "").toLowerCase();
                    const typeOfVideo = event.stream.typeOfVideo;
                    console.log("Video Type:", videoType, "typeOfVideo:", typeOfVideo);

                    // 화면 공유 스트림
                    if (videoType === "screen" || typeOfVideo === "SCREEN") {
                        const screenSub = sessionInstance.subscribe(event.stream, undefined);
                        setScreenSubscriber(screenSub);
                    }

                    // 카메라 스트림
                    if (event.stream.typeOfVideo === "CAMERA") {
                        try {
                            const subscriber = sessionInstance.subscribe(event.stream, undefined);
                            setPublisher(subscriber);
                        } catch (error) {
                            console.error("스트림 구독 중 오류:", error);
                        }
                    }
                });

                const getToken = async () => {
                    try {
                        const response = await api.post("/session/join", { type, childId });
                        return response.data;
                    } catch (error) {
                        console.error("❌ 토큰 요청 실패:", error);
                        throw error;
                    }
                };

                const token = await getToken();
                await sessionInstance.connect(token);

                // 상담사 자신의 웹캠 publisher 생성
                const myPublisher = OV.current.initPublisher(undefined, {
                    audioSource: true,
                    videoSource: true,
                    publishAudio: true,
                    publishVideo: true,
                });

                await sessionInstance.publish(myPublisher);
                setSession(sessionInstance);
                setPublisher(myPublisher);
            } catch (error) {
                console.error("❌ 세션 초기화 오류:", error);
            }
        };

        initSession();
    }, [childId, type]);

    // --- 추가: 주기적으로 화면 공유 스트림이 있는지 확인 (화면 재랜더링 문제 해결용) ---
    useEffect(() => {
        const checkForScreenShare = () => {
            if (session && !screenSubscriber) {
                // session.remoteStreams는 OpenVidu가 제공하는 모든 스트림 목록
                const remoteStreams = session.remoteStreams || [];
                const screenStream = remoteStreams.find((stream) => {
                    const videoType = (stream.videoType || "").toLowerCase();
                    const typeOfVideo = stream.typeOfVideo;
                    return videoType === "screen" || typeOfVideo === "SCREEN";
                });
                if (screenStream) {
                    const screenSub = session.subscribe(screenStream, undefined);
                    setScreenSubscriber(screenSub);
                }
            }
        };
        const intervalId = setInterval(checkForScreenShare, 1000);
        return () => clearInterval(intervalId);
    }, [session, screenSubscriber]);

    const sendSignal = (data, type) => {
        session
            .signal({
                data: data, // 전송할 메시지
                to: [],     // 빈 배열이면 모든 참가자에게 전송
                type: type, // 메시지 타입
            })
            .then(() => {
                console.log('Message successfully sent');
            })
            .catch((error) => {
                console.error('Signal error:', error);
            });
    };

    const handleStartChapter = () => {
        sendSignal("start-chapter", "start-chapter")
    };

    const handlePreviousStage = () => {
        sendSignal("previous-stage", "previous-stage")
    };

    const handleStartRecording = () => {
        sendSignal("record-start", "record-start")
    };

    const handleStopRecording = () => {
        sendSignal("record-stop", "record-stop")
    };

    const handleNextStage = () => {
        sendSignal("next-stage", "next-stage")
    };

    const handleEndChapter = () => {
        sendSignal("end-chapter", "end-chapter")
        Swal.fire({
            title: "상담사 선생님이 수업을 시작했어요!",
            imageUrl: "/child/character/againCh.png",
            imageWidth: 200,
            imageHeight: 200,
            showConfirmButton: false,
            timer: 2000, // 2초 후 자동 닫힘
        })
    };

    return (
        <div
            className="counselor-observe-container"
            style={{ width: "100%", height: "100%" }}
        >
            {/* 아동의 화면 공유 스트림 */}
            {screenSubscriber ? (
                <div
                    className="game-screen-share"
                    style={{ width: "50%", height: "100%", float: "left" }}
                >
                    <video
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                        ref={(video) => {
                            if (video && screenSubscriber) {
                                video.srcObject = screenSubscriber.stream.getMediaStream();
                            }
                        }}
                        autoPlay
                        playsInline
                    />
                </div>
            ) : (
                <div
                    style={{
                        width: "50%",
                        height: "100%",
                        backgroundColor: "black",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        float: "left",
                    }}
                >
                    <p>아동의 화면 공유가 없습니다.</p>
                </div>
            )}

            {/* 상담사 웹캠 */}
            {publisher && (
                <div style={{ width: "50%", height: "100%", float: "right" }}>
                    <video
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        ref={(video) => {
                            if (video && publisher) {
                                video.srcObject = publisher.stream.getMediaStream();
                            }
                        }}
                        autoPlay
                        muted
                        playsInline
                    />
                </div>
            )}
            <div>
                <button onClick={handleStartChapter}>학습 시작</button>
                <button onClick={handlePreviousStage}>이전 단원</button>
                <button onClick={handleStartRecording}>녹화 시작</button>
                <button onClick={handleStopRecording}>녹화 중지</button>
                <button onClick={handleNextStage}>다음 단원</button>
                <button onClick={handleEndChapter}>학습 종료</button>
            </div>
        </div>
    );
}

export default CounselorChildVideoCall;
