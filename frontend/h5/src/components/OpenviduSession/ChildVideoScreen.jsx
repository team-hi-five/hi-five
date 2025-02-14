import api from "../../api/api";
import { OpenVidu } from "openvidu-browser";
import { useEffect, useRef, useState, useCallback } from "react";

function ChildVideoScreen() {
  // 상태 선언
  const [session, setSession] = useState(null);
  // 자신의 웹캠
  const [publisher, setPublisher] = useState(null);

  // ref 선언
  const videoRef = useRef(null);
  const OVRef = useRef(null);

  // 세션 스토리지에서 childId 가져오기
  const childId = sessionStorage.getItem("childId");
  console.log(childId);

  // 웹캠 연결 함수
  const connectWebCam = useCallback(async (currentSession) => {
    try {
      const publisher = await OVRef.current.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined, // 기본 카메라 사용
        publishAudio: true,
        publishVideo: true,
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
        mirror: false,
      });

      if (currentSession) {
        await currentSession.publish(publisher);
        setPublisher(publisher);
      }
    } catch (error) {
      console.error("웹캠 연결 오류:", error);
    }
  }, []);

  // 토큰 발급 함수
  // 타입을 이전페이지에서 넘겨줘야함! (버튼에서?)
  const getToken = useCallback(async () => {
    try {
      const requestData = {
        childId: Number(childId),
        type: "game",
      };

      const res = await api.post("/session/join", requestData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Sending request data:", res.data);

      // 응답 URL에서 token 추출
      const token = res.data;

      if (!token) {
        throw new Error("토큰을 추출할 수 없습니다.");
      }
      return token;
    } catch (error) {
      console.error("토큰 에러:", error.message);
      console.error("토큰 에러 상세보기:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw error;
    }
  }, [childId]);

  // 웹소켓 재연결 함수
  const connectWithRetry = async (session, token, maxAttempts = 3) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`연결 시도 ${attempt}/${maxAttempts}`);
        await session.connect(token, { clientData: String(childId) });
        console.log("연결 성공!");
        return true;
      } catch (error) {
        console.log(`연결 시도 ${attempt} 실패:`, error);

        if (attempt === maxAttempts) {
          alert(
            "화상 연결에 실패했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요."
          );
          throw error;
        }

        // 다음 시도 전 2초 대기
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  // 세션 참가 및 연결 함수
  const joinSession = useCallback(async () => {
    try {
      // OpenVidu 인스턴스 생성
      OVRef.current = new OpenVidu();
      console.log("세션 들어가기:", OVRef.current);

      const newSession = OVRef.current.initSession();

      // 세션 연결 끊김 시 재연결 처리
      newSession.on("sessionDisconnected", async (event) => {
        console.log("Session disconnected:", event.reason);
        if (event.reason === "networkDisconnect") {
          try {
            const token = await getToken();
            await connectWithRetry(newSession, token);
          } catch (error) {
            console.error("Reconnection failed after max attempts", error);
            setSession(null);
          }
        }
      });

      setSession(newSession);

      // 토큰으로 세션 연결 후 웹캠 연결
      const token = await getToken();
      await newSession.connect(token, { clientData: String(childId) });
      await connectWebCam(newSession);
    } catch (error) {
      console.error("Error in joinSession:", error);
      if (error) {
        console.error({
          error: error.error,
          message: error.message,
          code: error.code,
          status: error.status,
        });
      }
    }
  }, [childId, connectWebCam, getToken]);

  useEffect(() => {
    const connect = async () => {
      try {
        await joinSession();
      } catch (error) {
        console.error("Failed to join session:", error);
      }
    };

    if (!session) {
      connect();
    }

    return () => {
      if (publisher) {
        try {
          const mediaStream = publisher.stream?.getMediaStream();
          if (mediaStream) {
            mediaStream.getTracks().forEach((track) => {
              track.stop();
            });
          }
        } catch (error) {
          console.error("Error cleaning up stream:", error);
        }
      }
    };
  }, [session, joinSession, publisher]);

  useEffect(() => {
    if (publisher && videoRef.current) {
      try {
        const mediaStream = publisher.stream?.getMediaStream();

        console.log("Publisher:", publisher);
        console.log("MediaStream:", mediaStream);
        console.log("VideoRef:", videoRef.current);

        if (mediaStream) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Error setting media stream:", error);
      }
    }
  }, [publisher]);

  return (
    <div className="ch-webcam-container">
      {publisher && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="ch-webcam-video"
          style={{ width: "300px", height: "200px" }}
        />
      )}
    </div>
  );
}

export default ChildVideoScreen;
