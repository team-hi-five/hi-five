import api from "../../../api/api";
import { useState, useEffect, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import { useSearchParams } from 'react-router-dom';

function CounselorChildVideoCall() {
    const OV = useRef(new OpenVidu());
    const [session, setSession] = useState(null);
    const [publisher, setPublisher] = useState(null);
    const [screenSubscriber, setScreenSubscriber] = useState(null);
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const childId = searchParams.get('childId');

    useEffect(() => {
        const initSession = async () => {
            try {
                const sessionInstance = OV.current.initSession();
                console.log("[CounselorChildVideoCall] 세션 초기화됨:", sessionInstance);

                sessionInstance.on("streamCreated", (event) => {
                    console.log("[CounselorChildVideoCall] streamCreated 이벤트 발생");
                    console.log("[CounselorChildVideoCall] event:", event);

                    // log 모든 속성 확인
                    console.log("[CounselorChildVideoCall] event.stream:", event.stream);
                    console.log("[CounselorChildVideoCall] videoSource:", event.stream.videoSource);
                    console.log("[CounselorChildVideoCall] typeOfVideo:", event.stream.typeOfVideo);

                    const videoType = (event.stream.videoSource || "").toLowerCase();
                    const typeOfVideo = event.stream.typeOfVideo;
                    console.log("[CounselorChildVideoCall] 처리할 videoType:", videoType, ", typeOfVideo:", typeOfVideo);

                    // 화면 공유 스트림 구분 처리
                    if (videoType === "screen" || typeOfVideo === "SCREEN") {
                        console.log("[CounselorChildVideoCall] 화면 공유 스트림 감지:", event.stream.streamId);
                        const screenSub = sessionInstance.subscribe(event.stream, undefined);
                        setScreenSubscriber(screenSub);
                        console.log("[CounselorChildVideoCall] 화면 공유 스트림 구독 완료:", screenSub);
                    }
                    // 카메라 스트림 처리
                    if (event.stream.typeOfVideo === 'CAMERA') {
                        try {
                            console.log("[CounselorChildVideoCall] 카메라 스트림 감지:", event.stream.streamId);
                            const camSub = sessionInstance.subscribe(event.stream, undefined);
                            setPublisher(camSub);
                            console.log("[CounselorChildVideoCall] 카메라 스트림 구독 완료:", camSub);
                        } catch (error) {
                            console.error("[CounselorChildVideoCall] 카메라 스트림 구독 에러:", error);
                        }
                    }
                });

                sessionInstance.on("streamDestroyed", (event) => {
                    console.log("[CounselorChildVideoCall] streamDestroyed 이벤트 발생");
                    console.log("[CounselorChildVideoCall] event:", event);
                    if (
                        event.stream.videoSource === "screen" ||
                        event.stream.typeOfVideo === "SCREEN"
                    ) {
                        console.log("[CounselorChildVideoCall] 화면 공유 스트림 제거:", event.stream.streamId);
                        setScreenSubscriber(null);
                    } else if (event.stream.typeOfVideo === "CAMERA") {
                        console.log("[CounselorChildVideoCall] 카메라 스트림 제거:", event.stream.streamId);
                        setPublisher(null);
                    }
                });

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
                await sessionInstance.connect(token);
                console.log("[CounselorChildVideoCall] 세션 연결 완료");

                // 내 웹캠 퍼블리셔 생성 및 publish (상담사 본인 영상 송출)
                const myPublisher = OV.current.initPublisher(undefined, {
                    audioSource: true,
                    videoSource: true,
                    publishAudio: true,
                    publishVideo: true,
                });
                console.log("[CounselorChildVideoCall] 내 퍼블리셔 생성:", myPublisher);
                await sessionInstance.publish(myPublisher);
                console.log("[CounselorChildVideoCall] 내 퍼블리셔 publish 완료");
                setSession(sessionInstance);
                setPublisher(myPublisher);
            } catch (error) {
                console.error("[CounselorChildVideoCall] 세션 초기화 오류:", error);
            }
        };

        initSession();
    }, [childId, type]);

    // 재구독 시도 로그 (필요 시)
    useEffect(() => {
        if (session && !screenSubscriber) {
            setTimeout(() => {
                console.log("[CounselorChildVideoCall] 재구독 시도: session은 연결되어 있으나 screenSubscriber가 없음");
            }, 1000);
        }
    }, [session, screenSubscriber]);

    return (
        <div className="counselor-observe-container" style={{ width: "100%", height: "100%" }}>
            {/* 아동의 화면 공유 스트림 영역 */}
            {screenSubscriber ? (
                <div className="game-screen-share" style={{ width: "50%", height: "100%", float: "left" }}>
                    <video
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        ref={(video) => {
                            if (video && screenSubscriber) {
                                console.log("[CounselorChildVideoCall] 연결된 화면 공유 스트림:", screenSubscriber.stream);
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

            {/* 상담사 카메라 스트림 영역 */}
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
        </div>
    );
}

export default CounselorChildVideoCall;
