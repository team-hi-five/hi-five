import api from "../../../api/api.jsx";
import { OpenVidu } from "openvidu-browser";
import { useEffect, useRef, useState, useCallback } from "react";

function OpenviduScreen() {
  // 세션 및 구독자 상태만 사용
  const [session, setSession] = useState(null);
  const [subscribers, setSubscribers] = useState([]);

  // OpenVidu 인스턴스 저장
  const OVRef = useRef(null);

  // 상대방 화면 공유 스트림을 렌더링할 video 요소 참조
  const screenVideoRef = useRef(null);

  // URL 파라미터에서 childUserId와 type 가져오기
  const params = new URLSearchParams(location.search);
  const childUserId = params.get("childId");
  const type = params.get("type");

  // 상대방의 화면 공유 스트림만 구독 (videoSource가 "screen" 인 경우)
  const subscribeToStreamCreated = useCallback((session) => {
    session.on("streamCreated", (event) => {
      if (event.stream.videoSource === "screen") {
        const subscriber = session.subscribe(event.stream, undefined);
        setSubscribers((prev) => [...prev, subscriber]);
      }
    });
  }, []);

  const subscribeToStreamDestroyed = useCallback((session) => {
    session.on("streamDestroyed", (event) => {
      setSubscribers((prev) =>
          prev.filter((sub) => sub !== event.stream.streamManager)
      );
    });
  }, []);

  // 토큰 발급 함수
  const getToken = useCallback(async () => {
    try {
      const requestData = { childId: Number(childUserId), type };
      const res = await api.post("/session/join", requestData, {
        headers: { "Content-Type": "application/json" },
      });
      const token = res.data;
      if (!token) {
        throw new Error("토큰을 추출할 수 없습니다.");
      }
      return token;
    } catch (error) {
      console.error("토큰 에러:", error.message);
      throw error;
    }
  }, [childUserId, type]);

  // 재연결 로직
  const connectWithRetry = async (session, token, maxAttempts = 3) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`연결 시도 ${attempt}/${maxAttempts}`);
        await session.connect(token, { clientData: String(childUserId) });
        console.log("연결 성공!");
        return true;
      } catch (error) {
        console.log(`연결 시도 ${attempt} 실패:`, error);
        if (attempt === maxAttempts) {
          alert("화상 연결에 실패했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.");
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  // 세션 참가 및 연결 (로컬 미디어 송출은 없음)
  const joinSession = useCallback(async () => {
    try {
      OVRef.current = new OpenVidu();
      const newSession = OVRef.current.initSession();

      // 이벤트 리스너 등록
      subscribeToStreamCreated(newSession);
      subscribeToStreamDestroyed(newSession);

      newSession.on("sessionDisconnected", async (event) => {
        console.log("Session disconnected:", event.reason);
        if (event.reason === "networkDisconnect") {
          try {
            const token = await getToken();
            await connectWithRetry(newSession, token);
          } catch (error) {
            console.error("Reconnection failed:", error);
            setSession(null);
          }
        }
      });

      setSession(newSession);

      const token = await getToken();
      await newSession.connect(token, { clientData: String(childUserId) });
    } catch (error) {
      console.error("Error in joinSession:", error);
    }
  }, [childUserId, getToken, subscribeToStreamCreated, subscribeToStreamDestroyed]);

  // 세션 나가기
  const leaveSession = useCallback(() => {
    if (session) {
      session.disconnect();
      setSession(null);
      setSubscribers([]);
    }
  }, [session]);

  useEffect(() => {
    if (!session) {
      joinSession();
    }
    return () => {
      if (session) {
        session.disconnect();
      }
    };
  }, [session, joinSession]);

  // 구독한 화면 공유 스트림을 video 요소에 연결
  useEffect(() => {
    if (subscribers.length > 0 && screenVideoRef.current) {
      // 여러 구독자가 있을 경우 원하는 스트림 선택 가능 (여기선 첫 번째 스트림)
      subscribers[0].addVideoElement(screenVideoRef.current);
    }
  }, [subscribers]);

  return (
      <div
          className="screen-share-container"
          style={{
            width: "100vw",
            height: "100vh",
            backgroundColor: "black",
            position: "relative",
            overflow: "hidden",
          }}
      >
        <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            className="screen-video"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "black", // 상대가 공유하지 않을 경우 검은 화면 유지
            }}
        />
        <button
            onClick={leaveSession}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: 1000,
              padding: "10px 20px",
              fontSize: "16px",
            }}
        >
          떠나기
        </button>
      </div>
  );
}

export default OpenviduScreen;
