import { useEffect } from 'react';

function ChildCam({ publisher, session, subscribers, videoRef }) {

    useEffect(() => {
        if (publisher && videoRef.current) {
            const video = publisher.videos[0].video;
            videoRef.current = video; 
        }
    }, [publisher]);

    return (
      <>
      {publisher && (
          <video
              ref={videoRef}
              autoPlay
              style={{ 
                  width: "500px", 
                  height: "400px",
                  backgroundColor: "#000",
                  transform: "scaleX(-1)",
                  borderRadius: "1%" 
              }}
          />
      )}
  </>
    );
}

export default ChildCam;