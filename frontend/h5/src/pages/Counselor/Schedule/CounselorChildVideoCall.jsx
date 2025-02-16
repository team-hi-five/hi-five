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

                // 스트림 생성 이벤트 (OpenVidu 기본 이벤트 이름은 "streamCreated")
                sessionInstance.on("streamCreated", (event) => {
                    console.log("Stream Created Event:", event);
                    // videoType 또는 typeOfVideo를 사용하여 스트림 구분
                    const videoType = (event.stream.videoType || "").toLowerCase();
                    const typeOfVideo = event.stream.typeOfVideo;
                    console.log("Video Type:", videoType, "typeOfVideo:", typeOfVideo);

                    // 화면 공유 스트림 (화면 캡처 스트림)
                    if (videoType === "screen" || typeOfVideo === "SCREEN") {
                        const screenSub = sessionInstance.subscribe(event.stream, undefined);
                        setScreenSubscriber(screenSub);
                    }

                    // 카메라 스트림 (CAMERA)
                    if (event.stream.typeOfVideo === 'CAMERA') {
                        try {
                            const subscriber = sessionInstance.subscribe(event.stream, undefined);
                            setPublisher(subscriber);
                        } catch (error) {
                            console.error('스트림 구독 중 오류:', error);
                        }
                    }
                });

                // 토큰 요청 함수
                const getToken = async () => {
                    try {
                        const response = await api.post('/session/join', { type, childId });
                        return response.data;
                    } catch (error) {
                        console.error('❌ 토큰 요청 실패:', error);
                        throw error;
                    }
                };

                const token = await getToken();
                await sessionInstance.connect(token);

                // 상담사 웹캠 퍼블리싱 (자신의 영상 송출)
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

    return (
        <div className="counselor-observe-container" style={{ width: "100%", height: "100%" }}>
            {/* 아동의 화면 공유 스트림 */}
            {screenSubscriber ? (
                <div className="game-screen-share" style={{ width: "50%", height: "100%", float: "left" }}>
                    <video
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                <div style={{
                    width: "50%",
                    height: "100%",
                    backgroundColor: "black",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    float: "left"
                }}>
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
        </div>
    );
}

export default CounselorChildVideoCall;
