import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient;

export const connectStomp = () => {
    const socket = new SockJS('https://hi-five.site/api/ws');
    stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
            console.log('STOMP 연결 성공!');
            stompClient.subscribe('/user/queue/notifications', (message) => {
                console.log('알림 수신: ', message.body);
                alert('새 알림: ' + message.body);
            });
        },
        onStompError: (frame) => {
            console.error('STOMP 오류: ', frame);
        }
    });

    stompClient.activate();

    return stompClient;
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

