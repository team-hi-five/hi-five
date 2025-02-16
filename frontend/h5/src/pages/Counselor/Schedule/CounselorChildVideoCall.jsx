import api from "../../../api/api"
import { useState, useEffect, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import CounselorCamWithChild from '../../../components/OpenviduSession/CounselorCamWithChild'
import { useSearchParams } from 'react-router-dom';

function CounselorChildVideoCall() {
  const OV = useRef(new OpenVidu());
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [screenSubscriber, setScreenSubscriber] = useState(null);

  const sessionInstance = OV.current.initSession();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const childId = searchParams.get('childId');

      useEffect(() => {
        const initSession = async () => {
          try {
            const sessionInstance = OV.current.initSession();
    
            /** 🔹 스트림 구독 설정 **/
            sessionInstance.on("streamCreated", (event) => {
              // 화면 공유 스트림인지 확인
              if (event.stream.videoType === "SCREEN") {
                const newScreenSubscriber = sessionInstance.subscribe(event.stream, undefined);
                setScreenSubscriber(newScreenSubscriber);
              }
            });
    
            sessionInstance.on("streamDestroyed", (event) => {
              if (event.stream.videoType === "SCREEN") {
                setScreenSubscriber(null);
              }
            });
    
            /** 🔹 토큰 요청 함수 **/
            const getToken = async () => {
              try {
                const response = await api.post('/session/join', { type, childId });
                console.log("상담사 세션 ID:", response.data.sessionId);
                return response.data;
              } catch (error) {
                console.error('❌ 토큰 요청 실패:', error);
                throw error;
              }
            };
    
            const token = await getToken();
            await sessionInstance.connect(token);
    
            /** 🔹 상담사 캠 퍼블리싱 (화면 송출) **/
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
      }, []);
    
      return (
        <div className="counselor-observe-container">
          {/* ✅ 아동의 게임 화면 공유 (있을 경우에만 표시) */}
          {screenSubscriber && (
            <div className="game-screen-share">
              <video
                ref={(video) => {
                  if (video) video.srcObject = screenSubscriber.stream.getMediaStream();
                }}
                autoPlay
              />
            </div>
          )}
    
          {/* ✅ 상담사 자신의 캠 화면 */}
          {publisher && (
            <div className="counselor-self-view">
              <CounselorCamWithChild subscriber={publisher} mode="publish" />
            </div>
          )}
        </div>
      );
    }
export default CounselorChildVideoCall;
