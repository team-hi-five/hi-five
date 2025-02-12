import { io } from "socket.io-client";

const socket = io("http://서버주소:포트번호", { transports: ["websocket"] });

import { useEffect, useState } from "react";

export function useWebSocket() {
  // 소켓 연결 여부
  const [isConnected, setIsConnected] = useState(false);
  // 데이터를 ui 로 활용가능
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    // 이벤트 발생
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("message", (data) => setLastMessage(data));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
    };
  }, []);

  // 데이터 저장
  const sendMessage = (message) => {
    if (socket.connected) {
      socket.emit("message", message);
    }
  };

  return { isConnected, lastMessage, sendMessage };
}
