import api from "../../../api/api";
import { useState, useEffect, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import { useSearchParams } from 'react-router-dom';

function CounselorChildVideoCall() {
    const OV = useRef(new OpenVidu());
    const [session, setSession] = useState(null);
    // publisher는 상담사 자신의 영상이므로 그대로 사용
    const [publisher, setPublisher] = useState(null);
    // 화면 공유 스트림만 구독하도록 함
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
                    console.log("[CounselorChildVideoCall] event.stream:", event.stream);
                    console.log("[CounselorChildVideoCall] videoSource:", event.stream.videoSource);
                    console.log("[CounselorChildVideoCall] typeOfVideo:", event.stream.typeOfVideo);

                    // 오직 화면 공유 스트림만 구독 (아동 페이지에서 오직 화면 공유만 퍼블리싱하므로)
                    if ((event.stream.videoSource || "").toLowerCase() === "screen" ||
                        event.stream.typeOfVideo === "SCREEN") {
                        console.log("[CounselorChildVideoCall] 화면 공유 스트림 감지:", event.stream.streamId);
                        const screenSub = sessionInstance.subscribe(event.stream, undefined);
                        setScreenSubscriber(screenSub);
                        console.log("[CounselorChildVideoCall] 화면 공유 스트림 구독 완료:", screenSub);
                    }
                });

                sessionInstance.on("streamDestroyed", (event) => {
                    console.log("[CounselorChildVideoCall] streamDestroyed 이벤트 발생");
                    console.log("[CounselorChildVideoCall] event:", event);
                    if ((event.stream.videoSource || "").toLowerCase() === "screen" ||
                        event.stream.typeOfVideo === "SCREEN") {
                        console.log("[CounselorChildVideoCall] 화면 공유 스트림 제거:", event.stream.streamId);
                        setScreenSubscriber(null);
                    }
                });

                const getToken = async () => {
                    try {
                        const response = await api.post('/session/join', { type, childId });
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

                // 상담사 자신의 웹캠 퍼블리셔 생성 및 publish
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

    // 재구독 시도 (필요하면 로그 확인)
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
                <div style={{
                    width: "50%",
                    height: "100%",
                    backgroundColor: "black",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    float: "left",
                }}>
                    <p>아동의 화면 공유가 없습니다.</p>
                </div>
            )}

            {/* 상담사 자신의 카메라 스트림 영역 */}
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
