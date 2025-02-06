import { OpenVidu } from 'openvidu-browser';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import ChatComponent from './chat/ChatComponent';
import DialogExtensionComponent from './dialog-extension/DialogExtension';
import StreamComponent from './stream/StreamComponent';
import ToolbarComponent from './toolbar/ToolbarComponent';
import OpenViduLayout from '../layout/openvidu-layout';
import UserModel from '../models/user-model';

const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000/';

const VideoRoomComponent = ({ sessionName = 'SessionA', user, token, error, joinSession, leaveSession }) => {
  const [session, setSession] = useState(undefined);
  const [localUser, setLocalUser] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);
  const [chatDisplay, setChatDisplay] = useState('none');
  const [currentVideoDevice, setCurrentVideoDevice] = useState(undefined);
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [messageReceived, setMessageReceived] = useState(false);
  
  const OVRef = useRef(null);
  const layoutRef = useRef(new OpenViduLayout());
  const remoteUsersRef = useRef([]);
  const hasBeenUpdatedRef = useRef(false);
  const localUserAccessAllowedRef = useRef(false);

  const mySessionId = sessionName;
  const myUserName = user || `OpenVidu_User${Math.floor(Math.random() * 100)}`;

  useEffect(() => {
    const openViduLayoutOptions = {
      maxRatio: 3 / 2,
      minRatio: 9 / 16,
      fixedRatio: false,
      bigClass: 'OV_big',
      bigPercentage: 0.8,
      bigFixedRatio: false,
      bigMaxRatio: 3 / 2,
      bigMinRatio: 9 / 16,
      bigFirst: true,
      animate: true,
    };

    layoutRef.current.initLayoutContainer(document.getElementById('layout'), openViduLayoutOptions);
    
    joinSession();

    window.addEventListener('resize', updateLayout);
    window.addEventListener('resize', checkSize);

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('resize', checkSize);
      leaveSessionInternal();
    };
  }, []);

  const getToken = async () => {
    const sessionId = await createSession(mySessionId);
    return await createToken(sessionId);
  };

  const createSession = async (sessionId) => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + 'api/sessions',
      { customSessionId: sessionId },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  };

  const createToken = async (sessionId) => {
    const response = await axios.post(
      APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections',
      {},
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  };

  const joinSession = useCallback(async () => {
    OVRef.current = new OpenVidu();
    
    const newSession = OVRef.current.initSession();
    setSession(newSession);

    subscribeToStreamCreated(newSession);
    subscribeToStreamDestroyed(newSession);
    subscribeToUserChanged(newSession);

    try {
      const tokenToUse = token || await getToken();
      await connectToSession(tokenToUse, newSession);
    } catch (err) {
      console.error('Error getting token:', err);
      if (error) {
        error({ 
          error: err.error,
          message: err.message,
          code: err.code,
          status: err.status 
        });
      }
    }
  }, [token]);

  const connectToSession = async (token, session) => {
    try {
      await session.connect(token, { clientData: myUserName });
      await connectWebCam();
    } catch (err) {
      console.error('Error connecting to session:', err);
      if (error) {
        error({ 
          error: err.error,
          message: err.message,
          code: err.code,
          status: err.status 
        });
      }
    }
  };

  const connectWebCam = async () => {
    await OVRef.current.getUserMedia({ audioSource: undefined, videoSource: undefined });
    const devices = await OVRef.current.getDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    const newPublisher = OVRef.current.initPublisher(undefined, {
      audioSource: undefined,
      videoSource: videoDevices[0].deviceId,
      publishAudio: true,
      publishVideo: true,
      resolution: '640x480',
      frameRate: 30,
      insertMode: 'APPEND',
    });

    if (session.capabilities.publish) {
      newPublisher.on('accessAllowed', () => {
        session.publish(newPublisher).then(() => {
          updateSubscribers();
          localUserAccessAllowedRef.current = true;
          if (joinSession) {
            joinSession();
          }
        });
      });
    }

    const newLocalUser = new UserModel();
    newLocalUser.setNickname(myUserName);
    newLocalUser.setConnectionId(session.connection.connectionId);
    newLocalUser.setScreenShareActive(false);
    newLocalUser.setStreamManager(newPublisher);

    setLocalUser(newLocalUser);
    setCurrentVideoDevice(videoDevices[0]);
  };

  const leaveSessionInternal = useCallback(() => {
    if (session) {
      session.disconnect();
    }

    OVRef.current = null;
    setSession(undefined);
    setSubscribers([]);
    setLocalUser(undefined);
    
    if (leaveSession) {
      leaveSession();
    }
  }, [session]);

  // ... (Other functions like updateSubscribers, camStatusChanged, etc. would be converted similarly)

  const updateLayout = useCallback(() => {
    setTimeout(() => {
      layoutRef.current.updateLayout();
    }, 20);
  }, []);

  // Render method converted to return statement
  return (
    <div className="container" id="container">
      <ToolbarComponent
        sessionId={mySessionId}
        user={localUser}
        showNotification={messageReceived}
        camStatusChanged={camStatusChanged}
        micStatusChanged={micStatusChanged}
        screenShare={screenShare}
        stopScreenShare={stopScreenShare}
        toggleFullscreen={toggleFullscreen}
        switchCamera={switchCamera}
        leaveSession={leaveSessionInternal}
        toggleChat={toggleChat}
      />

      <DialogExtensionComponent 
        showDialog={showExtensionDialog} 
        cancelClicked={() => setShowExtensionDialog(false)} 
      />

      <div id="layout" className="bounds">
        {localUser && localUser.getStreamManager() && (
          <div className="OT_root OT_publisher custom-class" id="localUser">
            <StreamComponent user={localUser} handleNickname={nicknameChanged} />
          </div>
        )}
        
        {subscribers.map((sub, i) => (
          <div key={i} className="OT_root OT_publisher custom-class" id="remoteUsers">
            <StreamComponent 
              user={sub} 
              streamId={sub.streamManager.stream.streamId} 
            />
          </div>
        ))}
        
        {localUser && localUser.getStreamManager() && (
          <div 
            className="OT_root OT_publisher custom-class" 
            style={{ display: chatDisplay }}
          >
            <ChatComponent
              user={localUser}
              chatDisplay={chatDisplay}
              close={toggleChat}
              messageReceived={checkNotification}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRoomComponent;