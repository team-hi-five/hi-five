import { useEffect, useRef } from 'react';

function CounselorCam({ publisher, mode }) {
    const videoRef = useRef(null);

    const setVideoStream = () => {
        if (publisher && videoRef.current) {
            const stream = publisher.stream ? publisher.stream.getMediaStream() : null;
            console.log('[CounselorCam] setVideoStream 호출, mode:', mode, 'publisher.stream:', publisher.stream);
            if (stream) {
                videoRef.current.srcObject = stream;
                videoRef.current.play()
                    .then(() => console.log('[CounselorCam] video 재생 시작'))
                    .catch(err => console.error('[CounselorCam] video play 에러:', err));
            } else {
                console.warn('[CounselorCam] publisher stream이 없습니다. 500ms 후 재확인합니다.');
                // 스트림이 준비되지 않았다면 500ms 후 재시도
                setTimeout(() => {
                    setVideoStream();
                }, 500);
            }
        }
    };

    useEffect(() => {
        console.log('[CounselorCam] useEffect 시작, publisher:', publisher, 'mode:', mode);
        // 초기 렌더링 시 스트림 설정 시도
        setVideoStream();

        // publisher의 streamPlaying 이벤트가 발생할 때마다 setVideoStream 호출
        if (publisher) {
            console.log('[CounselorCam] streamPlaying 이벤트 리스너 등록');
            publisher.on('streamPlaying', setVideoStream);
        }

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            if (publisher) {
                console.log('[CounselorCam] streamPlaying 이벤트 리스너 제거');
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

export default CounselorCam;
