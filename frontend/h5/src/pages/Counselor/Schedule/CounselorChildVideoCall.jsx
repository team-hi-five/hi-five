import api from "../../../api/api";
import { useState, useEffect, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import { useSearchParams } from "react-router-dom";

function CounselorChildVideoCall() {
    const OV = useRef(new OpenVidu());
    const [session, setSession] = useState(null);
    // 아동의 웹캠(카메라) 스트림 subscriber
    const [childCamSubscriber, setChildCamSubscriber] = useState(null);
    // 아동의 화면 공유 스트림 subscriber
    const [childScreenSubscriber, setChildScreenSubscriber] = useState(null);
    // 상담사 자신의 웹캠 publisher
    const [counselorPublisher, setCounselorPublisher] = useState(null);
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");
    const childId = searchParams.get("childId");

    useEffect(() => {
        const initSession = async () => {
            try {
                const sessionInstance = OV.current.initSession();

                // 스트림 생성 이벤트
                sessionInstance.on("streamCreated", (event) => {
                    // 내 자신의 스트림은 구독하지 않음
                    if (
                        event.stream.connection.connectionId ===
                        sessionInstance.connection.connectionId
                    )
                        return;
                    console.log("Stream Created Event:", event);
                    const videoType = (event.stream.videoType || "").toLowerCase();
                    const typeOfVideo = event.stream.typeOfVideo;
                    if (videoType === "screen" || typeOfVideo === "SCREEN") {
                        const screenSub = sessionInstance.subscribe(event.stream, undefined);
                        setChildScreenSubscriber(screenSub);
                    } else if (event.stream.typeOfVideo === "CAMERA") {
                        const camSub = sessionInstance.subscribe(event.stream, undefined);
                        setChildCamSubscriber(camSub);
                    }
                });

                sessionInstance.on("streamDestroyed", (event) => {
                    const videoType = (event.stream.videoType || "").toLowerCase();
                    if (videoType === "screen" || event.stream.typeOfVideo === "SCREEN") {
                        setChildScreenSubscriber(null);
                    } else if (event.stream.typeOfVideo === "CAMERA") {
                        setChildCamSubscriber(null);
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
                setCounselorPublisher(myPublisher);
                setSession(sessionInstance);
            } catch (error) {
                console.error("❌ 세션 초기화 오류:", error);
            }
        };

        initSession();
    }, [childId, type]);

    // 주기적으로 아동의 화면 공유 스트림 확인 (재랜더링 문제 해결용)
    useEffect(() => {
        const checkForScreenShare = () => {
            if (session && !childScreenSubscriber) {
                const remoteStreams = session.remoteStreams || [];
                const screenStream = remoteStreams.find((stream) => {
                    const videoType = (stream.videoType || "").toLowerCase();
                    const typeOfVideo = stream.typeOfVideo;
                    return videoType === "screen" || typeOfVideo === "SCREEN";
                });
                if (screenStream) {
                    const screenSub = session.subscribe(screenStream, undefined);
                    setChildScreenSubscriber(screenSub);
                }
            }
        };
        const intervalId = setInterval(checkForScreenShare, 1000);
        return () => clearInterval(intervalId);
    }, [session, childScreenSubscriber]);

    return (
        <div
            className="counselor-observe-container"
            style={{ width: "100%", height: "100%" }}
        >
            {/* 아동의 스트림 영역 (화면 공유 우선, 없으면 웹캠) */}
            <div
                style={{
                    width: "50%",
                    height: "100%",
                    float: "left",
                    backgroundColor: "black",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {childScreenSubscriber ? (
                    <video
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        ref={(video) => {
                            if (video && childScreenSubscriber) {
                                video.srcObject =
                                    childScreenSubscriber.stream.getMediaStream();
                            }
                        }}
                        autoPlay
                        playsInline
                    />
                ) : childCamSubscriber ? (
                    <video
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        ref={(video) => {
                            if (video && childCamSubscriber) {
                                video.srcObject =
                                    childCamSubscriber.stream.getMediaStream();
                            }
                        }}
                        autoPlay
                        playsInline
                    />
                ) : (
                    <p>아동의 스트림이 없습니다.</p>
                )}
            </div>

            {/* 상담사 자신의 웹캠 영역 */}
            <div style={{ width: "50%", height: "100%", float: "right" }}>
                {counselorPublisher && (
                    <video
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        ref={(video) => {
                            if (video && counselorPublisher) {
                                video.srcObject =
                                    counselorPublisher.stream.getMediaStream();
                            }
                        }}
                        autoPlay
                        muted
                        playsInline
                    />
                )}
            </div>
        </div>
    );
}

export default CounselorChildVideoCall;
