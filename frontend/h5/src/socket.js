import { Stomp } from '@stomp/stompjs';

let stompClient;

export const connectStomp = () => {
    const token = sessionStorage.getItem("access_token");

    // native WebSocket 사용 (wss:// 허용)
    const socket = new WebSocket(`wss://hi-five.site/api/ws?accessToken=Bearer ${token}`);

    stompClient = Stomp.over(socket);

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
