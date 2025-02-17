import { Stomp } from '@stomp/stompjs';

let stompClient;

export const connectStomp = () => {
    const token = sessionStorage.getItem("access_token");

    // native WebSocket 사용 (wss:// 허용)
    const socket = new WebSocket(`wss://hi-five.site/api/ws?accessToken=Bearer ${token}`);

    stompClient = Stomp.over(socket);

    // 자동 재연결을 위한 reconnectDelay 설정 (단위: 밀리초)
    stompClient.reconnectDelay = 5000; // 5초 후 재연결 시도

    // (선택사항) heartbeat 설정: 서버와 클라이언트 간 연결 유지를 위한 주기
    stompClient.heartbeat.outgoing = 20000; // 20초마다 heartbeat 전송
    stompClient.heartbeat.incoming = 0; // 서버 heartbeat는 무시

    stompClient.connect({}, (frame) => {
        console.log('STOMP 연결 성공:', frame);
        stompClient.subscribe('/user/queue/alarms', (message) => {
            console.log("STOMP 메시지 수신:", message.body);
            // PrimeReact Toast 등으로 알림 처리
        });
    }, (error) => {
        console.error("STOMP 연결 오류:", error);
    });
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
