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

  const [session, setSession] = useState(null);
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
        // 기본 세션: remote 구독 및 상담사의 카메라 송출용
        const sessionInstance = OV.current.initSession();
        setSession(sessionInstance);

        // remote 스트림 subscribe: 다른 사람의 송출을 무조건 가져옵니다.
        sessionInstance.on('streamCreated', (event) => {
          console.log("streamCreated 이벤트 발생:", event.stream.streamId, event.stream.videoType);
          const sub = sessionInstance.subscribe(event.stream, undefined);
          if (event.stream.videoType === 'screen') {
            setRemoteScreen(sub);
            console.log("Remote screen share subscribed:", event.stream.streamId);
          } else {
            setRemoteCam(sub);
            console.log("Remote camera subscribed:", event.stream.streamId);
          }
        });

        sessionInstance.on('streamDestroyed', (event) => {
          console.log("streamDestroyed 이벤트 발생:", event.stream.streamId);
          if (event.stream.videoType === 'screen') {
            setRemoteScreen(null);
          } else {
            setRemoteCam(null);
          }
        });

        const token = await getToken();
        await sessionInstance.connect(token);

        if (role === "consultant") {
          // 상담사: 카메라 퍼블리셔 생성 및 publish (기본 세션 사용)
          const camPublisher = OV.current.initPublisher(undefined, {
            videoSource: undefined,
            audioSource: true,
            mirror: true,
          });
          await sessionInstance.publish(camPublisher);
          setOwnPublisher(camPublisher);
          console.log("Consultant camera published");

          // 상담사: 화면 공유 퍼블리셔는 별도의 세션 연결 사용
          // 1. 새로운 세션 인스턴스 생성
          const scrSession = OV.current.initSession();
          // 2. 별도 토큰을 받아 scrSession에 연결 (같은 방으로 연결됨)
          const scrToken = await getToken();
          await scrSession.connect(scrToken);
          // 3. 화면 공유 퍼블리셔 생성 및 publish (scrSession 사용)
          const scrPublisher = OV.current.initPublisher(undefined, {
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
          // 학부모: 자신의 카메라 퍼블리셔 생성 및 publish (화면 공유 없음)
          const camPublisher = OV.current.initPublisher(undefined, {
            videoSource: undefined,
            audioSource: true,
            mirror: true,
          });
          await sessionInstance.publish(camPublisher);
          setOwnPublisher(camPublisher);
          console.log("Parent camera published");
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
                <ScreenShareCam publisher={ownScreenPublisher} mode="publish"/>
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
