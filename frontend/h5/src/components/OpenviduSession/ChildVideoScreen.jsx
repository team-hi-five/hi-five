import { useEffect, useRef } from 'react';

function ChildCam({ session, publisher }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (publisher && videoRef.current) {
            publisher.addVideoElement(videoRef.current);
        }
    }, [publisher]);

    return (
      <>
        <video 
          ref={videoRef} 
          autoPlay 
          style={{ width: "500px", height: "400px" }}
        />
      </>
    );
}

export default ChildCam;