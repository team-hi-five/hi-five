import { useEffect, useRef, useState } from 'react';
import { OpenVidu } from 'openvidu-browser';

function ChildScreenShare({ session }) {
  const videoRef = useRef(null);
  const OV = useRef(new OpenVidu());
  const [screenPublisher, setScreenPublisher] = useState(null);

  // 화면 공유 스트림 생성
  const createScreenShareStream = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      const screenPublisher = OV.current.initPublisher(undefined, {
        videoSource: screenStream,
        publishAudio: true
      });

      // 세션에 화면 공유 스트림을 전송
      await session.publish(screenPublisher);
      setScreenPublisher(screenPublisher);  // 상태 업데이트
    } catch (error) {
      console.error('화면 공유 중 오류:', error);
    }
  };

  // 컴포넌트가 마운트될 때 자동으로 화면 공유 시작
  useEffect(() => {
    createScreenShareStream();
  }, []);

  useEffect(() => {
    if (screenPublisher && videoRef.current) {
      const stream = screenPublisher.stream?.getMediaStream();
      if (stream) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [screenPublisher]);

  return (
    <div className="child-screen-share">
      <video ref={videoRef} autoPlay />
    </div>
  );
}

export default ChildScreenShare;
