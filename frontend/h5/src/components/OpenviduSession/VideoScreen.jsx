import api from "../../api/api";
import { OpenVidu } from "openvidu-browser";
import { useEffect, useRef, useState, useCallback } from "react";

function OpenviduVideo() {
  // 웹캠방 관리
  const [session, setSession] = useState(null);
  // 비디오 오디오 스트림 관리
  const [publisher, setPublisher] = useState(null);
  // 참가자 관리
  const [subscribers, setSubscribers] = useState([]);
  // 비디오 on/off 관리
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // DOM 참조를 위한 훅
  const videoRef = useRef(null);
  const OVRef = useRef(null);
  const childId = sessionStorage.getItem("childId");
  console.log(childId);

  // 1. 장치 연결
  const connectWebCam = useCallback(async (currentSession) => {
    try {
      // 웹캠과 마이크를 스트림을 관리하는 객체를 생성
      const publisher = await OVRef.current.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined, // undefined : 기본 카메라
        publishAudio: true, // 오디오 시작 상태(true: 켜짐)
        publishVideo: true, // 비디오 시작 상태(true: 켜짐)
        resolution: "640x480", // 비디오 해상도
        frameRate: 30, // 초당 프레임 수
        insertMode: "APPEND", // 비디오 요소에 돔을 추가하는 방식식
        mirror: false, // 좌우반전
      });

      if (currentSession) {
        await currentSession.publish(publisher); // 세션에 발행자 추가
        setPublisher(publisher);
      }
    } catch (error) {
      console.error("웹캠 연결 오류:", error);
    }
  }, []);

  //2. 토큰 발급(openVidu 서버에서 생성)
  const getToken = useCallback(async () => {
    try {
      // type : 클릭이벤트로 game 인지 consult 인지 정해야함   // 백엔드 토큰 요청
      const requestData = {
        childId: Number(childId),
        type: "game",
      };

      // 실제 전송되는 데이터 확인을 위한 커스텀 설정
      const res = await api.post("/session/join", requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Sending request data:", res.data);

      // console.log('Token response:', res);
      const token = res.data.token;
      console.log("데이터?:", token);
      return token;
    } catch (error) {
      console.error("Error getting token:", error.message);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw error;
    }
  }, []);

  // 3. 세션에 참가 + 연결(사용자)
  const joinSession = useCallback(async () => {
    try {
      // 위 import문과 다른 OpenVidu 아래는 클래스문!
      OVRef.current = new OpenVidu();

      console.log("세션들어가기기:", OVRef.current);

      // 실제 화상방 생성
      // 화상 채팅 세션 초기화(연결, 영상송출, 수신신)
      const newSession = OVRef.current.initSession();

      // 이벤트처리(새로운 참가자가 들어왔을때, 나갔을때, 상태변경)
      subscribeToStreamCreated(newSession);
      subscribeToStreamDestroyed(newSession);
      subscribeToUserChanged(newSession);

      setSession(newSession);

      // 토큰으로 세션 연결
      const token = await getToken();
      // 오픈비두 서버에는 childId string으로 전달
      await newSession.connect(token, { clientData: String(childId) });
      // 세션 연결 후 웹캠 연결
      await connectWebCam(newSession);
    } catch (error) {
      console.error("Error getting token:", error);
      if (error) {
        console.error({
          error: error.error,
          message: error.message,
          code: error.code,
          status: error.status,
        });
      }
    }
  }, [getToken, connectWebCam, childId]);

  // 이벤트 리스너 함수
  // 4. 새로운 참가자 스트림 구독
  const subscribeToStreamCreated = useCallback((session) => {
    session.on("streamCreated", (event) => {
      const subscriber = session.subscribe(event.stream, videoRef.current);
      setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]);
    });
  }, []);

  // 5. 참가자 나갔을 때 처리
  const subscribeToStreamDestroyed = useCallback((session) => {
    session.on("streamDestroyed", (event) => {
      setSubscribers((prevSubscribers) =>
        prevSubscribers.filter((sub) => sub !== event.stream.streamManager)
      );
    });
  }, []);

  // 6. 사용자 상태 변경 처리
  const subscribeToUserChanged = useCallback((session) => {
    session.on("signal:userChanged", (event) => {
      console.log("User changed:", event.data);
    });
  }, []);

  // 컨트롤 기능
  // 비디오 ON/OFF
  const toggleVideo = useCallback(() => {
    publisher?.publishVideo(!publisher.stream.videoActive);
    setIsVideoEnabled(!isVideoEnabled);
  }, [publisher, isVideoEnabled]);

  // 오디오 ON/OFF
  const toggleAudio = useCallback(() => {
    publisher?.publishAudio(!publisher.stream.audioActive);
    setIsAudioEnabled(!isAudioEnabled);
  }, [publisher, isAudioEnabled]);

  // 세션 종료
  // 상담사가 종료호출 api
  const leaveSessionInternal = useCallback(() => {
    if (session) {
      session.disconnect();
    }

    OVRef.current = null;
    setSession(null);
    setSubscribers([]);
  }, [session]);

  // ... (Other functions like updateSubscribers, camStatusChanged, etc. would be converted similarly)
  // 공유기능

  // 세션 마이크가 실행될때마다 처리
  useEffect(() => {
    const connect = async () => {
      try {
        await joinSession();
      } catch (error) {
        console.error("Failed to join session:", error);
      }
    };

    if (!session) {
      // session이 없을 때만 연결 시도
      connect();
    }

    return () => {
      if (session) {
        leaveSessionInternal();
      }
      setSubscribers([]);
      if (publisher) {
        publisher.stream.dispose();
      }
    };
  }, [session]);

  return (
    <div className="webcam-container">
      <div className="webcam-video" ref={videoRef}>
        {/* 종료, 공유중지,시작,비디오끄기,켜기,음성끄기켜기 */}
        <div className="control-buttons">
          <button onClick={toggleAudio} className="control-button-audio">
            음성
          </button>
          <button onClick={toggleVideo} className="control-button-video">
            화면
          </button>
          <button
            onClick={leaveSessionInternal}
            className="control-button-stop"
          >
            떠나기
          </button>
        </div>
      </div>
    </div>
  );
}
export default OpenviduVideo;
