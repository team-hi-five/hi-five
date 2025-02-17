import api from "../../../api/api";
import { useState, useEffect, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { sendAlarm } from "../../../api/alarm.jsx";

function CounselorChildVideoCall() {
    const OV = useRef(new OpenVidu());
    const [session, setSession] = useState(null);
    // 상담사 자신의 영상 (publisher)
    const [publisher, setPublisher] = useState(null);
    // 아동의 화면 공유 스트림만 구독 (subscriber)
    const [screenSubscriber, setScreenSubscriber] = useState(null);
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");
    const childId = searchParams.get("childId");

    useEffect(() => {
        const initSession = async () => {
            try {
                const sessionInstance = OV.current.initSession();
                console.log("[CounselorChildVideoCall] 세션 초기화됨:", sessionInstance);

                sessionInstance.on("streamCreated", (event) => {
                    console.log("[CounselorChildVideoCall] streamCreated 이벤트 발생");
                    console.log("[CounselorChildVideoCall] event:", event);
                    console.log("[CounselorChildVideoCall] event.stream:", event.stream);
                    console.log(
                        "[CounselorChildVideoCall] typeOfVideo:",
                        event.stream.typeOfVideo
                    );

                    // 오직 화면 공유 스트림만 구독 (아동 페이지에서 오직 화면 공유만 퍼블리싱하므로)
                    if (event.stream.typeOfVideo === "SCREEN") {
                        console.log(
                            "[CounselorChildVideoCall] 화면 공유 스트림 감지:",
                            event.stream.streamId
                        );
                        const screenSub = sessionInstance.subscribe(event.stream, undefined);
                        setScreenSubscriber(screenSub);
                        console.log(
                            "[CounselorChildVideoCall] 화면 공유 스트림 구독 완료:",
                            screenSub
                        );
                    }
                });

                sessionInstance.on("streamDestroyed", (event) => {
                    console.log("[CounselorChildVideoCall] streamDestroyed 이벤트 발생");
                    console.log("[CounselorChildVideoCall] event:", event);
                    if (event.stream.typeOfVideo === "SCREEN") {
                        console.log(
                            "[CounselorChildVideoCall] 화면 공유 스트림 제거:",
                            event.stream.streamId
                        );
                        setScreenSubscriber(null);
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

    // 재구독 효과: 세션이 연결된 상태인데 아직 화면 공유 스트림을 구독하지 않은 경우
    useEffect(() => {
        if (session && !screenSubscriber) {
            const streams = session.streams;
            if (streams && streams.forEach) {
                streams.forEach((stream) => {
                    if (stream.typeOfVideo === "SCREEN") {
                        console.log(
                            "[CounselorChildVideoCall] 재구독: 화면 공유 스트림 발견",
                            stream.streamId
                        );
                        const screenSub = session.subscribe(stream, undefined);
                        setScreenSubscriber(screenSub);
                    }
                });
            } else {
                console.log("[CounselorChildVideoCall] session.streams is undefined or not iterable");
            }
        }
    }, [session, screenSubscriber]);

    // 상대방(아동의 화면 공유 스트림)이 없는지 체크하는 함수
    const isOtherParticipantAbsent = () => {
        if (!session) {
            console.log("[isOtherParticipantAbsent] 세션이 아직 초기화되지 않았습니다.");
            return false; // 세션이 없으면 아직 판단할 수 없음
        }

        let childStreamExists = false;

        if (session.streams && typeof session.streams.forEach === "function") {
            session.streams.forEach((stream) => {
                if (stream.typeOfVideo === "SCREEN") {
                    childStreamExists = true;
                }
            });
        } else {
            console.log("[isOtherParticipantAbsent] session.streams가 없거나 순회할 수 없습니다.");
        }

        if (!childStreamExists) {
            console.log("[isOtherParticipantAbsent] 상대방(아동의 화면 공유 스트림)이 세션에 존재하지 않습니다.");
        } else {
            console.log("[isOtherParticipantAbsent] 아동의 화면 공유 스트림이 확인되었습니다.");
        }

        return !childStreamExists;
    };

    useEffect(() => {
        const checkAbsence = async () => {
            if (isOtherParticipantAbsent()) {
                console.log("[checkAbsence] 상대방이 없습니다. 알람 전송 시작...");
                // 알람 전송에 필요한 데이터(alarmDto)를 구성합니다.
                const alarmDto = {
                    toUserId: Number(childId), // 아동의 ID (childId를 숫자로 변환)
                    senderUserId: 0,         // 상담사 본인의 ID (예시: 1234, 실제 값으로 대체)
                    senderRole: "ROLE_CONSULTANT",    // 상담사 역할
                    sessionType: type,          // 세션 타입 (예: "videoCall" 등, 상황에 맞게)
                };

                try {
                    const response = await sendAlarm(alarmDto);
                    console.log("[checkAbsence] 알람 전송 성공:", response);
                } catch (error) {
                    console.error("[checkAbsence] 알람 전송 실패:", error);
                }
            }
        };

        // 5초마다 체크 (원하는 시간 간격으로 변경 가능)
        const intervalId = setInterval(checkAbsence, 10000);
        return () => clearInterval(intervalId);
    }, [session, childId]);


    const sendSignal = (data, type) => {
        session
            .signal({
                data: data, // 전송할 메시지
                to: [],     // 빈 배열이면 모든 참가자에게 전송
                type: type, // 메시지 타입
            })
            .then(() => {
                console.log("Message successfully sent");
            })
            .catch((error) => {
                console.error("Signal error:", error);
            });
    };

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
            timer: 2000, // 2초 후 자동 닫힘
        });
    };

    return (
        <div
            className="counselor-observe-container"
            style={{ width: "100%", height: "100%" }}
        >
            {/* 아동의 화면 공유 스트림 영역 */}
            {screenSubscriber ? (
                <div
                    className="game-screen-share"
                    style={{ width: "50%", height: "100%", float: "left" }}
                >
                    <video
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        ref={(video) => {
                            if (video && screenSubscriber) {
                                console.log(
                                    "[CounselorChildVideoCall] 연결된 화면 공유 스트림:",
                                    screenSubscriber.stream
                                );
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
