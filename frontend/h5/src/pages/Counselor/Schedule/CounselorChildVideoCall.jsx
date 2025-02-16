import api from "../../../api/api"
import { useState, useEffect, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import CounselorCamWithChild from '../../../components/OpenviduSession/CounselorCamWithChild';
import ChildScreenShare from "../../../components/OpenviduSession/ChildShareScreen";
import { useSearchParams } from 'react-router-dom';

function CounselorChildVideoCall() {
  const OV = useRef(new OpenVidu());
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [screenSubscriber, setScreenSubscriber] = useState(null);
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const childId = searchParams.get('childId');
  

  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionInstance = OV.current.initSession();

        // 스트림 구독 설정
        sessionInstance.on("streamCreated", (event) => {
          console.log('Stream Created Event:', event);
          console.log('Stream Video Type:', event.stream.videoType);

          console.log('스트림 타입들:', {
            typeOfVideo: event.stream.typeOfVideo,
            videoType: event.stream.videoType
          });

                  // 모든 스트림 구독 시도
                  try {
                    const subscriber = sessionInstance.subscribe(event.stream, undefined);
                    console.log('구독된 스트림:', subscriber);
                    console.log('구독된 스트림 상세 정보:', {
                      id: subscriber.stream.streamId,
                      hasVideo: subscriber.stream.hasVideo,
                      hasAudio: subscriber.stream.hasAudio
                    });
          
                    // 카메라 스트림 확인
                    if (event.stream.typeOfVideo === 'CAMERA') {
                      setPublisher(subscriber);
                    }
                    
                    // 화면 공유 스트림 확인
                    if (event.stream.typeOfVideo === 'SCREEN') {
                      setScreenSubscriber(subscriber);
                    }
                  } catch (error) {
                    console.error('스트림 구독 중 오류:', error);
                  }
                });

        // 토큰 요청 함수
        const getToken = async () => {
          try {
            const response = await api.post('/session/join', { type, childId });
            return response.data;
          } catch (error) {
            console.error('❌ 토큰 요청 실패:', error);
            throw error;
          }
        };

        const token = await getToken();
        await sessionInstance.connect(token);

        // 상담사 캠 퍼블리싱 (화면 송출)
        const myPublisher = OV.current.initPublisher(undefined, {
          audioSource: true,
          videoSource: true,
          publishAudio: true,
          publishVideo: true,
        });

        await sessionInstance.publish(myPublisher);
        setSession(sessionInstance);
        setPublisher(myPublisher);
      } catch (error) {
        console.error("❌ 세션 초기화 오류:", error);
      }
    };

    initSession();
  }, [childId, type]);

    
      return (
        <div className="counselor-observe-container">
          {/* ✅ 아동의 게임 화면 공유 (있을 경우에만 표시) */}
          {screenSubscriber && (
            <div className="ch-learning-screen-share">
              <ChildScreenShare
                subscriber={screenSubscriber} 
                session={session}
              />
            </div>
          )}
    
          {/* ✅ 상담사 자신의 캠 화면 */}
          {publisher && (
            <div className="ch-counselor-self-view">
              <CounselorCamWithChild subscriber={publisher} mode="publish" />
            </div>
          )}
        </div>
      );
    }
export default CounselorChildVideoCall;
