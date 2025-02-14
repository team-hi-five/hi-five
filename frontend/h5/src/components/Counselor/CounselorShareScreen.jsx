import { useEffect, useRef } from 'react';

function ScreenShareCam({ publisher, mode }) {
    const videoRef = useRef(null);

    const setVideoStream = () => {
        if (publisher && videoRef.current) {
            const stream = publisher.stream?.getMediaStream();
            console.log('[ScreenShareCam] setVideoStream 호출, mode:', mode, 'publisher.stream:', publisher.stream);
            if (stream) {
                videoRef.current.srcObject = stream;
                videoRef.current.play()
                    .then(() => console.log('[ScreenShareCam] video 재생 시작'))
                    .catch(err => console.error('[ScreenShareCam] video play 에러:', err));
            } else {
                console.warn('[ScreenShareCam] publisher stream이 없습니다.');
            }
        }
    };

    useEffect(() => {
        console.log('[ScreenShareCam] useEffect 시작, publisher:', publisher, 'mode:', mode);
        // 처음 렌더링 시 스트림 설정
        setVideoStream();

        // publisher에서 streamPlaying 이벤트 발생 시 업데이트
        if (publisher) {
            console.log('[ScreenShareCam] streamPlaying 이벤트 리스너 등록');
            publisher.on('streamPlaying', setVideoStream);
        }

        // cleanup 시 이벤트 제거
        return () => {
            if (publisher) {
                console.log('[ScreenShareCam] streamPlaying 이벤트 리스너 제거');
                publisher.off('streamPlaying', setVideoStream);
            }
        };
    }, [publisher, mode]);

    return (
        <div className="counselor-cam">
            <div className="video-label">
                <video ref={videoRef} autoPlay muted={mode === 'publish'} />
            </div>
        </div>
    );
}

export default ScreenShareCam;
