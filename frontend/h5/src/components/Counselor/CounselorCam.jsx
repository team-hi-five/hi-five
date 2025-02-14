import { useEffect, useRef } from 'react';

function CounselorCam({ session, publisher, mode }) {
    const videoRef = useRef(null);
    const publisherRef = useRef(null);

    useEffect(() => {
        if (publisher && videoRef.current) {
            if (mode === 'publish') {
                // 송출 화면: publisher의 MediaStream을 그대로 video element에 할당
                const mediaStream = publisher.stream?.getMediaStream();
                if (mediaStream) {
                    videoRef.current.srcObject = mediaStream;
                }
            } else if (mode === 'subscribe') {
                // 구독 화면: 전달받은 스트림을 clone()하여 video element에 할당
                const mediaStream = publisher.stream?.getMediaStream();
                if (mediaStream) {
                    const clonedStream = mediaStream.clone();
                    videoRef.current.srcObject = clonedStream;
                }
            }
        }
    }, [videoRef.current, publisher, mode]);

    return (
        <div className="counselor-cam">
            {mode === 'publish' ? (
                <div className="video-label"><video ref={videoRef} autoPlay={true} muted={mode === 'publish'} /></div>
            ) : (
                <div className="video-label"><video ref={videoRef} autoPlay={true} muted={mode === 'subscribe'} /></div>
            )}
        </div>
    );
}

export default CounselorCam;