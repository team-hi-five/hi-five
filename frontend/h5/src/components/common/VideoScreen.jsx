import { Openvidu } from 'openvidu-browser';
import { useEffect, useRef, useState} from 'react'

function OpenviduVideo({Token}){

    // Token = 
    // // 웹캠방 관리
    // const [session, setSession] = useState(null);
    // // 비디오 오디오 관리
    // const [publisher, setPublisher] = useState(null);
    // // 참가자 관리
    // const [subscribers, setSubscribers] = useState([]);
    // const videoRef = useRef(null)


    // const joinSession = useCallback(async () => {
    // OVRef.current = new OpenVidu();
    
    // const newSession = OVRef.current.initSession();
    // setSession(newSession);

    // subscribeToStreamCreated(newSession);
    // subscribeToStreamDestroyed(newSession);
    // subscribeToUserChanged(newSession);

    // try {
    //     const tokenToUse = Token || await getToken();
    //     await connectToSession(tokenToUse, newSession);
    // } catch (err) {
    //     console.error('Error getting token:', err);
    //     if (err) {
    //         err({ 
    //         error: err.error,
    //         message: err.message,
    //         code: err.code,
    //         status: err.status 
    //     });
    //     }
    // }
    // }, [Token]);






    //     useEffect(()=> {

    //         // 웹캠, 마이크 기능 초기화(설정)
    //         const openvidu = new OpenVidu();
    //         // 화상 채팅 세션 초기화(연결, 영상송출, 수진)
    //         const session = openvidu.initSession();

    //         //사용자 입장시 상대방에서 받기
    //         session.on('streamCreated', (event)=>{
    //                                     // div에 id 값으로 video-container 줘야함함
    //             const subscriber = session.subscribe(event.stream, "videoContainer")
    //             setSubscribers
    //         })
    //     })
        
    
    return (
        <div className='videoContainer' ref={videoRef}>
            {/* 종료, 공유중지,시작,비디오끄기,켜기,음성끄기켜기 */}
        </div>
    )
}
export default OpenviduVideo