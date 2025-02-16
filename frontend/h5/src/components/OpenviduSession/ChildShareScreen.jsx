
import { useEffect, useRef } from 'react';

function ScreenShareCam({ screenSubscriber, mode}) {
    const videoRef = useRef(null);
    const retryTimeout = useRef(null);

    const setVideoStream = () => {
        if (screenSubscriber && videoRef.current) {
            const stream = screenSubscriber.stream?.getMediaStream();
            console.log('[ScreenShareCam] setVideoStream 호출, mode:', mode, 'publisher.stream:', screenSubscriber.stream);

            if (stream) {
                videoRef.current.srcObject = stream;
                videoRef.current
                    .play()
                    .then(() => console.log('[ScreenShareCam] video 재생 시작'))
                    .catch((err) => console.error('[ScreenShareCam] video play 에러:', err));
            } else {
                console.warn('[ScreenShareCam] publisher stream이 없습니다. 300ms 후 재확인.');
                retryTimeout.current = setTimeout(() => {
                    setVideoStream();
                }, 300);
            }
        }
    };

    useEffect(() => {
        console.log('[ScreenShareCam] useEffect 시작, publisher:', screenSubscriber, 'mode:', mode);
        setVideoStream();

        if (screenSubscriber) {
            console.log('[ScreenShareCam] streamPlaying 이벤트 리스너 등록');
            screenSubscriber.on('streamPlaying', setVideoStream);
        }

        // Cleanup: 컴포넌트가 언마운트되면 재시도 및 이벤트 해제
        return () => {
            if (screenSubscriber && screenSubscriber.stream) {
                console.log('[ScreenShareCam] streamPlaying 이벤트 리스너 제거');
                screenSubscriber.off('streamPlaying', setVideoStream);
            }
            if (retryTimeout.current) {
                clearTimeout(retryTimeout.current);
            }
        };
    }, [screenSubscriber, mode]);

    return (
        <div className="co-share-counselor-cam" >
            <video ref={videoRef} autoPlay muted={mode === 'publish'} />
        </div>
    );
}

export default ScreenShareCam;
