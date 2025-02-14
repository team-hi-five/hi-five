import "/src/pages/Parent/ParentCss/ParentVideoCallPage.css";
import ButtonControlsVideo from "../../../components/OpenviduSession/ButtonControlsVideo";
import ParentvideoScreen from "../../../components/OpenviduSession/ParentVideoScreen";
import ConsultCounselorVideoScreen from "../../../components/OpenviduSession/ConsultCounselorVideoScreen";
import ScreenCounselorVideo from "../../../components/OpenviduSession/ShareCounselorVideo"
import { useState, useCallback } from "react";

function ParentVideoCallPage() {
  // 스트림
  const [session, setSession] = useState(null);
  const [subscribers, setSubscribers] = useState([]); // 상담사의 스트림
  const [publisher, setPublisher] = useState(null);

  // 상담사 스트림 구독
  const subscribeToStreamCreated = useCallback((session) => {
    session.on("streamCreated", (event) => {
      const subscriber = session.subscribe(event.stream, undefined);
      setSubscribers((prev) => [...prev, subscriber]);
    });
  }, []);

  // 상담사 스트림 제거
  const subscribeToStreamDestroyed = useCallback((session) => {
    session.on("streamDestroyed", (event) => {
      setSubscribers((prev) =>
        prev.filter((sub) => sub !== event.stream.streamManager)
      );
    });
  }, []);

  // 제어 함수

  const toggleVideo = useCallback(() => {
    if (publisher) {
      publisher.publishVideo(!publisher.stream.videoActive);
    }
  }, [publisher]);

  const toggleAudio = useCallback(() => {
    if (publisher) {
      publisher.publishAudio(!publisher.stream.audioActive);
    }
  }, [publisher]);

  const leaveSessionInternal = useCallback(() => {
    if (session) {
      session.disconnect();
    }
  }, [session]);

  return (
    <div className="co-video-call-container">
      {/* 좌측 상단 로고 */}
      <img src="/logo.png" alt="로고" className="co-logoo" />

      <div className="co-video-layout">
        {/* 메인 비디오 */}
        <div className="co-main-video">
          <ScreenCounselorVideo share session={session} />
        </div>

        {/* 참여자 비디오 */}
        <div className="co-participant-videos">
          <div className="co-participant">
            x
            <ParentvideoScreen
              subscribers={subscribers}
            />
          </div>
          <div className="co-participant">
            <ConsultCounselorVideoScreen
            session={session}
            setSession={setSession}
            setPublisher={setPublisher}
            onStreamCreated={subscribeToStreamCreated}
            onStreamDestroyed={subscribeToStreamDestroyed} />
          </div>
        </div>
      </div>

      {/* 하단 컨트롤 버튼 */}
      <div className="co-video-controls">
        <ButtonControlsVideo
          userType="counselor"
          onVideoToggle={toggleVideo}
          onAudioToggle={toggleAudio}
          onEndCall={leaveSessionInternal}
        />
      </div>
    </div>
  );
}

export default ParentVideoCallPage;
