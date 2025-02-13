import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';

function CounselorShareScreen({ screenPublisher }) {
    const screenRef = useRef(null);

    useEffect(() => {
        if (screenPublisher?.stream && screenRef.current) {
            const mediaStream = screenPublisher.stream.getMediaStream();
            if (mediaStream) {
                screenRef.current.srcObject = mediaStream;
            }
        }
    }, [screenPublisher]);

    return (
        <div className="screen-share">
            <h2>상담사 화면 공유</h2>
            <video ref={screenRef} autoPlay playsInline className="shared-screen" />
        </div>
    );
}

CounselorShareScreen.propTypes = {
    screenPublisher: PropTypes.shape({
        stream: PropTypes.shape({
            getMediaStream: PropTypes.func.isRequired,
        }).isRequired,
    }).isRequired,
};

export default CounselorShareScreen;