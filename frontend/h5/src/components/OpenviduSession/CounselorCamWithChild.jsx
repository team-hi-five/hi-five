import { useEffect, useRef } from 'react';

function CounselorCam({ publisher, subscriber, mode }) {
    const videoRef = useRef(null);

    const setVideoStream = () => {
        let stream = null;

        // 상담사 페이지 (mode: publish)
        if (mode === 'publish' && publisher && publisher.stream) {
            stream = publisher.stream.getMediaStream(); // 상담사의 비디오
        } 
        // 아동 페이지 (mode: subscribe)
        else if (mode === 'subscribe' && subscriber && subscriber.stream) {
            stream = subscriber.stream.getMediaStream(); // 아동의 비디오
        }

        console.log('[CounselorCam] stream:', stream); // stream 콘솔 출력
        
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play()
                .then(() => console.log('[CounselorCam] video 재생 시작'))
                .catch(err => console.error('[CounselorCam] video play 에러:', err));
        } else {
            console.warn('[CounselorCam] stream이 없습니다. 500ms 후 재확인합니다.');
            setTimeout(() => {
                setVideoStream();
            }, 500);
        }
    };

    useEffect(() => {
        console.log('[CounselorCam] useEffect 시작, mode:', mode, 'publisher:', publisher, 'subscriber:', subscriber);
        setVideoStream();

        return () => {
            // Cleanup: 비디오 스트림 초기화
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [publisher, subscriber, mode]); // publisher, subscriber, mode가 변경될 때마다 실행

    return (
        <div className="counselor-cam">
            <video ref={videoRef} autoPlay muted={mode === 'publish'} />
        </div>
    );
}

export default CounselorCam;
