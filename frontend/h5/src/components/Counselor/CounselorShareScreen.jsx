import { useEffect, useRef } from 'react';

function ScreenShareCam({ session, publisher }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (publisher && videoRef.current) {
            publisher.addVideoElement(videoRef.current);
        }
    }, [publisher]);

    return <video ref={videoRef} autoPlay={true} />;
}

export default ScreenShareCam;
