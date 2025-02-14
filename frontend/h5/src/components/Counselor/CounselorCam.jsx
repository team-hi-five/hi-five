import { useEffect, useRef } from 'react';

function CounselorCam({ session, publisher, mode }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (publisher && videoRef.current) {
            if (mode === 'publish') {
                const mediaStream = publisher.stream?.getMediaStream();
                if (mediaStream) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.load(); // 새로 로드
                }
            } else if (mode === 'subscribe') {
                const mediaStream = publisher.stream?.getMediaStream();
                if (mediaStream) {
                    const clonedStream = mediaStream.clone();
                    videoRef.current.srcObject = clonedStream;
                    videoRef.current.load(); // 새로 로드
                }
            }
        }
    }, [videoRef.current ,publisher, mode]);


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