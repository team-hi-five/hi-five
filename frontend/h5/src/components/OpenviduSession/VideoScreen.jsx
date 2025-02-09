// import { useEffect, useState, useRef } from "react";
// import { OpenVidu } from "openvidu-browser";

const VideoCallPage = () => {
  // const [session, setSession] = useState(null);
  // const [publisher, setPublisher] = useState(null);
  // const videoRef = useRef(null)

  // useEffect(() => {
  //   const token = 'wss://hi-five.site:4443?sessionId=d9402b8c-6377-4da6-905b-764b26b38f11&token=tok_URkasWz8lbw69cWS';
  //   // const token = fullUrl.split('token=')[1]; // 토큰만 추출

  //   const OV = new OpenVidu();
  //   const mySession = OV.initSession();

  //   mySession.connect(token).then(() => {
  //     const myPublisher = OV.initPublisher(undefined, {
  //       audioSource: undefined,
  //       videoSource: undefined,
  //       publishAudio: true,
  //       publishVideo: true,
  //       resolution: '640x480',
  //       frameRate: 30,
  //       mirror: true,
  //     });

  //     mySession.publish(myPublisher);
  //     setPublisher(myPublisher);
  //     setSession(mySession); // 세션 상태 설정 추가

  //     if (videoRef.current) {
  //       myPublisher.addVideoElement(videoRef.current);
  //     }
  //   }).catch(error => {
  //     console.error('Error connecting to OpenVidu session:', error);
  //   });

  //   return () => {
  //     if (session) {
  //       session.disconnect();
  //     }
  //   };
  // }, []);

  return (
    <div>
      <h2>OpenVidu Video Call</h2>
      <div id="videos">
        {/* <video
          ref={videoRef}
          autoPlay
          playsInline
          className="webcam-video"
          style={{ width: "300px", height: "200px" }}
        /> */}
      </div>
    </div>
  );
};

export default VideoCallPage;
