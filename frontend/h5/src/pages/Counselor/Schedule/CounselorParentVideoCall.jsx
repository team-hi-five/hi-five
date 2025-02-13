// import "/src/pages/Parent/ParentCss/ParentVideoCallPage.css";
// import api from "../../../api/api";
// import { OpenVidu } from "openvidu-browser";
// import { useEffect, useRef, useState, useCallback } from "react";
// import { useSearchParams } from "react-router-dom";
// import { FaVideo, FaMicrophone, FaPhoneSlash, FaDesktop } from "react-icons/fa";
//
// function CounselorParentVideoCallPage() {
//     const [searchParams] = useSearchParams();
//     const childId = searchParams.get("childId");
//     const type = searchParams.get("type") || "consult";
//
//     const [session, setSession] = useState(null);
//     const [publisher, setPublisher] = useState(null);
//     const [subscribers, setSubscribers] = useState([]);
//     const [screenPublisher, setScreenPublisher] = useState(null);
//     const [isScreenSharing, setIsScreenSharing] = useState(false);
//
//     const OVRef = useRef(null);
//
//     const getToken = useCallback(async () => {
//         try {
//             const res = await api.post("/session/join", {
//                 childId: Number(childId),
//                 type: type,
//             });
//             return res.data;
//         } catch (error) {
//             console.error("Token error:", error);
//             throw error;
//         }
//     }, [childId, type]);
//
//     const joinSession = useCallback(async () => {
//         try {
//             OVRef.current = new OpenVidu();
//             const newSession = OVRef.current.initSession();
//
//             newSession.on("streamCreated", (event) => {
//                 const subscriber = newSession.subscribe(event.stream, undefined);
//                 setSubscribers((prev) => [...prev, subscriber]);
//             });
//
//             newSession.on("streamDestroyed", (event) => {
//                 setSubscribers((prev) => prev.filter((sub) => sub !== event.stream.streamManager));
//             });
//
//             setSession(newSession);
//
//             const token = await getToken();
//             await newSession.connect(token, { clientData: String(childId) });
//             await connectWebCam(newSession);
//         } catch (error) {
//             console.error("Join session error:", error);
//         }
//     }, [childId, getToken]);
//
//     const connectWebCam = useCallback(async (currentSession) => {
//         try {
//             const publisher = await OVRef.current.initPublisherAsync(undefined, {
//                 audioSource: undefined,
//                 videoSource: undefined,
//                 publishAudio: true,
//                 publishVideo: true,
//                 resolution: "640x480",
//                 frameRate: 30,
//                 mirror: false,
//             });
//             await currentSession.publish(publisher);
//             setPublisher(publisher);
//         } catch (error) {
//             console.error("Webcam error:", error);
//         }
//     }, []);
//
//     useEffect(() => {
//         if (!session) joinSession();
//     }, [session, joinSession]);
//
//     return (
//         <div className="pa-video-call-container">
//             <img src="/logo.png" alt="Logo" className="pa-logoo" />
//             <div className="pa-video-layout">
//                 <div className="pa-main-video">
//                     {publisher && <video autoPlay playsInline ref={(el) => el && publisher.addVideoElement(el)} className="local-video" />}
//                 </div>
//                 <div className="pa-participant-videos">
//                     {subscribers.map((subscriber, index) => (
//                         <video key={index} autoPlay playsInline ref={(el) => el && subscriber.addVideoElement(el)} className="remote-video" />
//                     ))}
//                 </div>
//             </div>
//             <div className="pa-video-controls">
//                 {/*화면 공유 버튼*/}
//                 <button className="pa-control-btn"><FaDesktop /></button>
//
//                 {/*녹화 버튼*/}
//                 <button className="pa-control-btn"><FaVideo /></button>
//
//                 {/*음소거 버튼*/}
//                 <button className="pa-control-btn"><FaMicrophone /></button>
//
//                 {/*통화 종료 버튼*/}
//                 <button className="pa-control-btn end-call"><FaPhoneSlash /></button>
//             </div>
//         </div>
//     );
// }
//
// export default CounselorParentVideoCallPage;

import { useState, useEffect } from 'react';
import { OpenVidu } from 'openvidu-browser';
import ConsultantCam from '../../../components/Counselor/CounselorCam.jsx';
// import ParentCam from '../../../components/Parent/';
import ScreenShareCam from '../../../components/Counselor/CounselorShareScreen.jsx';
import api from '../../../api/api.jsx';
import { useSearchParams } from 'react-router-dom';

function CounselorParentVideoCallPage() {
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const childId = searchParams.get('childId');

    console.log("type: ",type);
    console.log("childId: ",childId);

    const [session, setSession] = useState(null);
    const [consultantPublisher, setConsultantPublisher] = useState(null);
    const [parentPublisher, setParentPublisher] = useState(null);
    const [screenPublisher, setScreenPublisher] = useState(null);
    const OV = new OpenVidu();

    async function getToken() {
        const response = await api.post('/session/join', {
            type: type || 'consultation',
            childId: childId || 'unknown'
        });
        const token = response.data;
        console.log("token", token);
        return token;
    }

    useEffect(() => {
        async function initializeSession() {
            const newSession = OV.initSession();
            setSession(newSession);

            // 기본값으로 빈 Publisher 설정 (PropTypes 경고 방지)
            setConsultantPublisher(OV.initPublisher(undefined, { videoSource: false }));
            setParentPublisher(OV.initPublisher(undefined, { videoSource: false }));
            setScreenPublisher(OV.initPublisher(undefined, { videoSource: false }));

            newSession.on('signal:CONTROL', (event) => {
                const message = JSON.parse(event.data);
                if (message.action === 'STOP_PARENT_CAM' && parentPublisher) {
                    parentPublisher.stream.dispose();
                }
            });

            const token = await getToken();
            await newSession.connect(token);
        }
        initializeSession();
        console.log(OV.initPublisher(undefined, { videoSource: false }))
        console.log(parentPublisher)
        console.log(screenPublisher)
    }, [type, childId]);

    function sendSignalCommand(command) {
        session?.signal({ type: 'CONTROL', data: JSON.stringify(command) });
    }

    return (
        <div className="consultation-page">
            <button onClick={() => sendSignalCommand({ action: 'STOP_PARENT_CAM' })}>학부모 캠 종료</button>
            <ConsultantCam publisher={consultantPublisher ?? { stream: { getMediaStream: () => null } }} />
            {/*<ParentCam publisher={parentPublisher ?? { stream: { getMediaStream: () => null } }} />*/}
            <ScreenShareCam screenPublisher={screenPublisher ?? { stream: { getMediaStream: () => null } }} />
        </div>
    );
}
export default CounselorParentVideoCallPage;
