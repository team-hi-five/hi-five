import { useState, useEffect, useRef } from 'react';
import { OpenVidu } from 'openvidu-browser';
import CounselorCam from '../../../components/Counselor/CounselorCam.jsx';
import ScreenShareCam from '../../../components/Counselor/CounselorShareScreen.jsx';
import api from '../../../api/api.jsx';
import { useSearchParams } from 'react-router-dom';

function CounselorParentVideoCallPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const childId = searchParams.get('childId');
  const role = searchParams.get('role'); // "consultant" 또는 "parent"

  // 메인 세션 (카메라용)
  const [session, setSession] = useState(null);
  // 화면 공유용 별도 세션 (scrSession)
  const [screenSession, setScreenSession] = useState(null);
  const OV = useRef(new OpenVidu());

  // 내 퍼블리셔 (카메라)
  const [ownPublisher, setOwnPublisher] = useState(null);
  // 내 화면 공유 퍼블리셔 (상담사 전용)
  const [ownScreenPublisher, setOwnScreenPublisher] = useState(null);

  // 상대방의 스트림 (카메라, 화면 공유)
  const [remoteCam, setRemoteCam] = useState(null);
  const [remoteScreen, setRemoteScreen] = useState(null);

  async function getToken() {
    try {
      const response = await api.post('/session/join', { type, childId });
      return response.data;
    } catch (error) {
      console.error('❌ 토큰 요청 실패:', error);
      throw error;
    }
  }

  useEffect(() => {
    async function initializeSession() {
      try {
        // 메인 세션 생성 (카메라 스트림용)
        const sessionInstance = OV.current.initSession();
        setSession(sessionInstance);

        // 메인 세션: 스트림 생성 이벤트 등록 (카메라 스트림만 subscribe)
        sessionInstance.on('streamCreated', (event) => {
          console.log("메인 세션 streamCreated 이벤트 발생:", event.stream.streamId, event.stream.videoType);
          try {
            // 화면 공유 스트림은 scrSession에서 다루므로 메인 세션에서는 카메라만 subscribe
            if (event.stream.videoType !== 'screen') {
              const sub = sessionInstance.subscribe(event.stream, undefined);
              setRemoteCam(sub);
              console.log("Remote camera subscribed (메인):", event.stream.streamId);
            }
          } catch (err) {
            console.error("메인 세션 subscribe 에러:", err);
          }
        });

        sessionInstance.on('streamDestroyed', (event) => {
          console.log("메인 세션 streamDestroyed 이벤트 발생:", event.stream.streamId);
          if (event.stream.videoType !== 'screen') {
            setRemoteCam(null);
          }
        });

        // 메인 세션 연결
        const token = await getToken();
        await sessionInstance.connect(token);

        if (role === "consultant") {
          // 상담사: 메인 세션에서 카메라 퍼블리셔 생성 및 publish
          const camPublisher = OV.current.initPublisher(undefined, {
            videoSource: undefined,
            audioSource: true,
            mirror: true,
          });
          await sessionInstance.publish(camPublisher);
          setOwnPublisher(camPublisher);
          console.log("Consultant camera published");

          // 상담사: 별도의 scrSession 생성하여 화면 공유 퍼블리셔 publish
          const scrOV = new OpenVidu(); // 별도 인스턴스 사용
          const scrSession = scrOV.initSession();
          setScreenSession(scrSession);

          // scrSession: 상담사 쪽에서는 publish만 하므로 이벤트는 간단하게 로깅
          scrSession.on('streamCreated', (event) => {
            console.log("상담사 scrSession streamCreated 이벤트:", event.stream.streamId);
          });
          scrSession.on('streamDestroyed', (event) => {
            console.log("상담사 scrSession streamDestroyed 이벤트:", event.stream.streamId);
          });

          const scrToken = await getToken();
          await scrSession.connect(scrToken);
          const scrPublisher = scrOV.initPublisher(undefined, {
            videoSource: 'screen',
            audioSource: false,
            mirror: false,
          });
          scrPublisher.on('accessDenied', () => {
            console.error("Screen share access denied");
          });
          await scrSession.publish(scrPublisher);
          setOwnScreenPublisher(scrPublisher);
          console.log("Consultant screen share published");
        } else {
          // 학부모: 메인 세션에서 자신의 카메라 퍼블리셔 생성 및 publish
          const camPublisher = OV.current.initPublisher(undefined, {
            videoSource: undefined,
            audioSource: true,
            mirror: true,
          });
          await sessionInstance.publish(camPublisher);
          setOwnPublisher(camPublisher);
          console.log("Parent camera published");

          // 학부모: 별도의 scrSession에 연결하여 상담사의 화면 공유 스트림 구독
          const scrOV = new OpenVidu();
          const scrSession = scrOV.initSession();
          setScreenSession(scrSession);

          scrSession.on('streamCreated', (event) => {
            console.log("학부모 scrSession streamCreated 이벤트:", event.stream.streamId);
            try {
              const sub = scrSession.subscribe(event.stream, undefined);
              setRemoteScreen(sub);
              console.log("Remote screen share subscribed (학부모):", event.stream.streamId);
            } catch (err) {
              console.error("scrSession subscribe 에러 (학부모):", err);
            }
          });
          scrSession.on('streamDestroyed', (event) => {
            console.log("학부모 scrSession streamDestroyed 이벤트:", event.stream.streamId);
            setRemoteScreen(null);
          });

          const scrToken = await getToken();
          await scrSession.connect(scrToken);
        }
      } catch (error) {
        console.error("❌ 세션 초기화 실패:", error);
      }
    }

    initializeSession();
  }, [type, childId, role]);

  if (role === "consultant") {
    return (
        <div className="consultation-page">
          {/* 1. 내 화상 송출화면 (상담사 자신의 카메라 영상) */}
          <div>
            <h2>내 화상 송출화면 (상담사)</h2>
            <CounselorCam session={session} publisher={ownPublisher} mode="publish" />
          </div>

          {/* 2. 상대방 화상 구독 화면 (학부모의 카메라 영상) */}
          <div>
            <h2>상대방 화상 구독 화면</h2>
            {remoteCam ? (
                <CounselorCam session={session} publisher={remoteCam} mode="subscribe" />
            ) : (
                <div>상대방 화상 없음</div>
            )}
          </div>

          {/* 3. 내 화면 공유 송출화면 (상담사 자신의 화면 공유) */}
          <div>
            <h2>내 화면 공유 송출화면 (상담사)</h2>
            {ownScreenPublisher ? (
                <ScreenShareCam publisher={ownScreenPublisher} mode="publish" />
            ) : (
                <div>화면 공유 중 아님</div>
            )}
          </div>
        </div>
    );
  } else {
    return (
        <div className="consultation-page">
          {/* 1. 내 화상 송출화면 (학부모 자신의 카메라 영상) */}
          <div>
            <h2>내 화상 송출화면 (학부모)</h2>
            <CounselorCam session={session} publisher={ownPublisher} mode="publish" />
          </div>

          {/* 2. 상대방 화상 구독 화면 (상담사의 카메라 영상) */}
          <div>
            <h2>상대방 화상 구독 화면</h2>
            {remoteCam ? (
                <CounselorCam session={session} publisher={remoteCam} mode="subscribe" />
            ) : (
                <div>상대방 화상 없음</div>
            )}
          </div>

          {/* 3. 상대방 화면 공유 구독 화면 (상담사의 화면 공유) */}
          <div>
            <h2>상대방 화면 공유 구독 화면 (학부모)</h2>
            {remoteScreen ? (
                <ScreenShareCam publisher={remoteScreen} mode="subscribe" />
            ) : (
                <div>상대방 화면 공유 없음</div>
            )}
          </div>
        </div>
    );
  }
}

export default CounselorParentVideoCallPage;
