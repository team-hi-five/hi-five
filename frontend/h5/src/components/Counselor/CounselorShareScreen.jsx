import { useEffect, useRef } from 'react';

function ScreenShareCam({ session, publisher }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (publisher && videoRef.current) {
            const mediaStream = publisher.stream?.getMediaStream();
            if (mediaStream) {
                videoRef.current.srcObject = mediaStream;
            }
        }
    }, [publisher]);

    return (
        <div className="screen-share-cam">
            <div className="video-label">화면 공유</div>
            <video ref={videoRef} autoPlay={true} />
        </div>
    );
}

export default ScreenShareCam;
