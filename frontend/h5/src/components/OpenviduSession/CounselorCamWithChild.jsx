import { useEffect, useRef } from 'react';

function CounselorCam({ publisher, subscriber, mode }) {
    const videoRef = useRef(null);
    const retryCount = useRef(0);
  
    const setVideoStream = () => {
      // 재시도 횟수 제한
      if (retryCount.current > 3) {
        console.error('[CounselorCam] 최대 재시도 횟수 초과');
        return;
      }

      if (mode === "publish" && publisher && publisher.stream && videoRef.current) {
        const stream = publisher.stream.getMediaStream();
        if (stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.play()
            .then(() => {
              console.log('[CounselorCam] video 재생 시작');
              retryCount.current = 0; // 성공 시 재시도 카운트 초기화
            })
            .catch(err => {
              console.error('[CounselorCam] video play 에러:', err);
              retryCount.current++;
              setTimeout(setVideoStream, 500);
            });
        } else {
          retryCount.current++;
          setTimeout(setVideoStream, 500);
        }
      } else if (mode === "subscribe" && subscriber && subscriber.stream && videoRef.current) {
        const stream = subscriber.stream.getMediaStream();
        if (stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.play()
            .then(() => {
              console.log('[CounselorCam] video 재생 시작');
              retryCount.current = 0;
            })
            .catch(err => {
              console.error('[CounselorCam] video play 에러:', err);
              retryCount.current++;
              setTimeout(setVideoStream, 500);
            });
        }
      }
    };
  
    useEffect(() => {
      console.log('[CounselorCam] useEffect 시작, mode:', mode);
      setVideoStream();

      // 이벤트 리스너 추가 시 좀 더 안전하게
      if ((mode === "publish" && publisher) || (mode === "subscribe" && subscriber)) {
        const stream = mode === "publish" ? publisher.stream : subscriber.stream;
        if (stream) {
          stream.on('playing', () => {
            retryCount.current = 0;
            setVideoStream();
          });
        }
      }

      return () => {
        if ((mode === "publish" && publisher) || (mode === "subscribe" && subscriber)) {
          const stream = mode === "publish" ? publisher.stream : subscriber.stream;
          if (stream) {
            stream.off('playing');
          }
        }
      };
    }, [publisher, subscriber, mode]);
  
    return (
      <div className="counselor-cam">
        <video ref={videoRef} autoPlay muted={mode === 'publish'} />
      </div>
    );
}
  
export default CounselorCam;