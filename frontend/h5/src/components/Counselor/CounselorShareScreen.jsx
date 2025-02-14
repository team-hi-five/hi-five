import { useEffect, useRef } from 'react';

function ScreenShareCam({ session, publisher, mode }) {
    const videoRef = useRef(null);
    const mediaStream = useRef(null);

    useEffect(() => {
        if (publisher && videoRef.current) {
            if (mode === 'publish') {
                const mediaStream = publisher.stream?.getMediaStream();
                if (mediaStream) {
                    videoRef.current.srcObject = mediaStream;

                }
            } else if (mode === 'subscribe') {
                const mediaStream = publisher.stream?.getMediaStream();
                if (mediaStream) {
                    const clonedStream = mediaStream.clone();
                    videoRef.current.srcObject = clonedStream;
                }
            }
        }
    }, [mediaStream, publisher, mode, videoRef.current]);

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

export default ScreenShareCam;
