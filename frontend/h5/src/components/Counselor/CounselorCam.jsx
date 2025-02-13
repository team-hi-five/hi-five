import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';

function ConsultantCam({ publisher }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (publisher?.stream && videoRef.current) {
            const mediaStream = publisher.stream.getMediaStream();
            if (mediaStream) {
                videoRef.current.srcObject = mediaStream;
            }
        }
    }, [publisher]);

    return (
        <div className="consultant-cam">
            <h2>상담사 웹캠</h2>
            <video ref={videoRef} autoPlay playsInline className="local-video" />
        </div>
    );
}

ConsultantCam.propTypes = {
    publisher: PropTypes.shape({
        stream: PropTypes.shape({
            getMediaStream: PropTypes.func.isRequired,
        }).isRequired,
    }).isRequired,
};

export default ConsultantCam;