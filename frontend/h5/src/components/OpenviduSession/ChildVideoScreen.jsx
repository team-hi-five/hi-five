import { useEffect } from 'react'; 

function ChildVideoScreen({ publisher, mode, videoRef }) {  // videoRef props로 받기
    // videoRef를 사용하므로 내부 ref는 제거

    const setVideoStream = () => {
        if (publisher && videoRef.current) {
            const stream = publisher.stream ? publisher.stream.getMediaStream() : null;
            if (stream) {
                videoRef.current.srcObject = stream;
                videoRef.current.play()
                    .then(() => console.log('[ChildVideoScreen] video 재생 시작'))
                    .catch(err => console.error('[ChildVideoScreen] video play 에러:', err));
            } else {
                setTimeout(() => {
                    setVideoStream();
                }, 500);
            }
        }
    };

    useEffect(() => {
        setVideoStream();
        if (publisher) {
            publisher.on('streamPlaying', setVideoStream);
        }
        return () => {
            if (publisher) {
                publisher.off('streamPlaying', setVideoStream);
            }
        };
    }, [publisher, mode]);

    return (
        <div className="counselor-cam">
            <video ref={videoRef} autoPlay muted={mode === 'publish'} />
        </div>
    );
}

export default ChildVideoScreen;