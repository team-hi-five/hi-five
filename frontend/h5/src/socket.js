// 소켓 연결 설정 하는 파일
// 소켓 동작은 컴포넌트에서 관리리 
import { io }from 'socket.io-client';

export const socket = io('서버주소')