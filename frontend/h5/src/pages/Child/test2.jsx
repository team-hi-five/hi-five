import { Openvidu } from "openvidu-browser";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

function OpenviduVideo() {
  // 웹캠방 관리
  const [session, setSession] = useState(null);
  // 비디오 오디오 관리
  const [publisher, setPublisher] = useState(null);
  // 참가자 관리
  const [subscribers, setSubscribers] = useState([]);

  // DOM 참조를 위한 훅
  const videoRef = useRef(null);
  const OVRef = useRef(null);

  // OpenVidu 서버 주소 (테스트용)
  const APPLICATION_SERVER_URL = "http://3.26.91.252:4443";

  // 1. 토큰 받기
  const getToken = useCallback(async () => {
    // const sessionId = await createSession();
    // return await createToken(sessionId);
    return "";
  }, []);

  // 2. 세션 생성
  const createSession = async (sessionId) => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions",
      { customSessionId: sessionId },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  };

  // 3. 토큰 생성 (다른 사용자가 세션에 입장시 )
  const createToken = async (sessionId) => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions/" + sessionId + "/connections",
      {},
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  };
  // 4. 세션에 참가(사용자)
  const joinSession = useCallback(async () => {
    OVRef.current = new Openvidu();

    const newSession = OVRef.current.initSession();
    setSession(newSession);

    subscribeToStreamCreated(newSession);
    subscribeToStreamDestroyed(newSession);
    subscribeToUserChanged(newSession);

    try {
      const tokenToUse = Token || (await getToken());
      await connectToSession(tokenToUse, newSession);
    } catch (err) {
      console.error("Error getting token:", err);
      if (err) {
        err({
          error: err.error,
          message: err.message,
          code: err.code,
          status: err.status,
        });
      }
    }
  }, [Token]);

  // 5. 세션 연결
  // 유저를 어떤걸로 식별할 것인가? 유저이름? 유저 아이디? 유저 이메일 주소..? 아동은 어떻게 식별해야하지?
  const connectToSession = useCallback(async (token, session) => {
    try {
      await session.connect(token, { clientData: "유저아이디" });
      await connectWebCam();
    } catch (err) {
      console.error("Error connecting to session:", err);
      if (err) {
        err({
          error: err.error,
          message: err.message,
          code: err.code,
          status: err.status,
        });
      }
    }
  }, []);

  // 6. 장치 연결
  const connectionWebCam = async () => {
    const publisher = await OVRef.current.initPublisherAsync(undefined, {
      audioSource: undefined,
      videoSource: undefined,
      publishAudio: true,
      publishVideo: true,
      resolution: "640x480",
      frameRate: 30,
      insertMode: "APPEND",
      mirror: false,
    });
    session.publish(publisher);
    setPublisher(publisher);
  };
  // 5. 연
  // 세션 마이크가 실행될때마다 처리
  useEffect(() => {
    // 웹캠, 마이크 기능 초기화(설정)
    const Openvidu = new Openvidu();
    // 화상 채팅 세션 초기화(연결, 영상송출, 수진)
    const session = Openvidu.initSession();

    //사용자 입장시 상대방에서 받기
    session.on("streamCreated", (event) => {
      // div에 id 값으로 video-container 줘야함함
      const subscriber = session.subscribe(event.stream, "video-container");
      setSubscribers;
    });
  });

  return (
    <div id="video-container" ref={videoRef}>
      {/* 종료, 공유중지,시작,비디오끄기,켜기,음성끄기켜기 */}
    </div>
  );
}
export default OpenviduVideo;
