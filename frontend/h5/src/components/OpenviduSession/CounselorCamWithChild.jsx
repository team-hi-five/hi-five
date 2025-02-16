import { useEffect, useRef } from "react";

function CounselorCam({ subscriber, publisher, mode }) {
    const videoRef = useRef(null);

    const setVideoStream = (streamSource) => {
        if (streamSource && videoRef.current) {
            const stream = streamSource.stream ? streamSource.stream.getMediaStream() : null;
            console.log("[CounselorCam] setVideoStream 호출, mode:", mode, "streamSource:", streamSource.stream);
            if (stream) {
                videoRef.current.srcObject = stream;
                videoRef.current.play()
                    .then(() => console.log("[CounselorCam] video 재생 시작"))
                    .catch(err => console.error("[CounselorCam] video play 에러:", err));
            } else {
                console.warn("[CounselorCam] stream이 없습니다. 500ms 후 재확인합니다.");
                setTimeout(() => {
                    setVideoStream(streamSource);
                }, 500);
            }
        }
    };

    useEffect(() => {
        console.log("[CounselorCam] useEffect 시작, subscriber:", subscriber, "publisher:", publisher, "mode:", mode);

        // publisher(상담사 자신의 화면) 또는 subscriber(상대방의 화면) 확인
        const streamSource = mode === "publish" ? publisher : subscriber;
        setVideoStream(streamSource);

        if (streamSource) {
            console.log("[CounselorCam] streamPlaying 이벤트 리스너 등록");
            streamSource.on("streamPlaying", () => setVideoStream(streamSource));
        }

        return () => {
            if (streamSource) {
                console.log("[CounselorCam] streamPlaying 이벤트 리스너 제거");
                streamSource.off("streamPlaying", () => setVideoStream(streamSource));
            }
        };
    }, [subscriber, publisher, mode]);

    return (
        <div className="counselor-cam">
            {(mode === "publish" && publisher) || (mode !== "publish" && subscriber) ? (
                <video ref={videoRef} autoPlay muted={mode === "publish"} />
            ) : (
                <div className="no-counselor">
                    {mode === "publish" ? "내 화면을 불러오는 중..." : "상대방을 기다리는 중..."}
                </div>
            )}
        </div>
    );
}

export default CounselorCam;
