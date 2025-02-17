let stompClient;

export const connectStomp = () => {
    const ws = new WebSocket("wss://hi-five.site/api/ws");

    const token = sessionStorage.getItem("access_token");

    ws.onopen = () => {
        console.log("WebSocket 연결 성공");
        // 실제 백엔드 도메인으로 host 값을 수정하세요.
        const connectFrame =
            "CONNECT\n" +
            "accept-version:1.2\n" +
            "host:hi-five.site\n" +
            `Authorization:Bearer ${token}\n` + // JWT 토큰
            "\n\0"; // 프레임 종료
        ws.send(connectFrame);
    };

    ws.onmessage = (event) => {
        console.log("STOMP 메시지 수신:", event.data);
        // 연결 성공 메시지를 받으면 구독 시작
        if (event.data.indexOf("CONNECTED") !== -1) {
            const subscribeFrame =
                "SUBSCRIBE\n" +
                "destination:/user/queue/alarms\n" +
                "id:sub-0\n\n\0";
            ws.send(subscribeFrame);
        } else {
            // 수신된 메시지 파싱 후, PrimeReact Toast 알림 띄우기
            try {
                const receivedMsg = JSON.parse(event.data);
                if (toast && toast.current) {
                    toast.current.show({
                        severity: "info",
                        summary: "알림",
                        detail: receivedMsg.detail || "새 메시지를 받았습니다.",
                        life: 3000,
                    });
                }
            } catch (e) {
                console.error("메시지 파싱 오류:", e);
            }
        }
    };

    ws.onerror = (error) => {
        console.error("WebSocket 에러:", error);
    };

    ws.onclose = () => {
        console.log("WebSocket 연결 종료");
    };
};

export const sendNotification = (targetUser, message) => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: '/app/send-notification',
            body: JSON.stringify({ targetUser, message })
        });
    } else {
        console.error('STOMP 연결이 되지 않았습니다.');
    }
};

