import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [stage, setStage] = useState(1);
  const [userResponses, setUserResponses] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 챗봇 기본 질문 및 감정별 최종 응답 메시지
  const chatbotPrompts = {
    stage1: "안녕! 만나서 반가워!, 오늘 하루 어떤 일이 있었니?",
    stage2: "그래서 어떤 감정이 들었어?",
  };

  const finalResponses = {
    happy: "오늘 우리 친구의 감정은 기쁨이구나! 너의 행복한 마음이 나에게도 전해져! 내일도 이렇게 기쁜 하루 보내자!",
    sad: "오늘은 슬픔이 느껴지는 날이었구나. 때로는 슬픔도 우리를 성장시키는 법이야. 내일은 더 좋은 날이 될 거야.",
    angry: "오늘은 화가 나는 일이 있었구나. 마음을 진정시키고 쉬어가며 내일을 준비해보자.",
    fear: "두려움이 있었던 하루였네. 하지만 용기를 내어 앞으로 나아가는 너를 응원해!",
    surprised: "오늘은 놀라움이 가득했던 하루였구나! 새로운 경험이 너에게 많은 영감을 주었길 바래!",
  };

  // 메시지 추가 함수
  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  // TTS API 호출 및 음성 재생 함수
  const playTTS = async (text) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageCode: 'ko-KR' })
      });
      const data = await response.json();
      if (data.audioContent) {
        const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
        audio.play();
      }
    } catch (error) {
      console.error("TTS 에러:", error);
    }
  };

  // 챗봇 질문 처리 함수
  const handleChatbotPrompt = async (prompt) => {
    addMessage("bot", prompt);
    await playTTS(prompt);
  };

  // 컴포넌트 마운트 시 stage1 질문 출력
  useEffect(() => {
    if (stage === 1) {
      handleChatbotPrompt(chatbotPrompts.stage1);
    }
  }, [stage]);

  // 텍스트 입력 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputText.trim() === '' || chatEnded) return;
    addMessage("user", inputText);
    setUserResponses(prev => [...prev, inputText]);
    setInputText('');

    if (stage === 1) {
      // stage1 후 stage2로 전환
      setStage(2);
      setTimeout(() => {
        handleChatbotPrompt(chatbotPrompts.stage2);
      }, 500);
    } else if (stage === 2) {
      // 텍스트 입력 방식의 stage 2: 두 응답 합쳐서 GPT-4 호출 및 로그 저장
      const combined = userResponses.concat(inputText).join(', ');
      try {
        const response = await fetch('/api/gpt4', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sentence: combined })
        });
        const data = await response.json();
        const emotionScores = data.emotion;
        let dominantEmotion = '';
        let maxScore = -1;
        for (let [emotion, score] of Object.entries(emotionScores)) {
          if (score > maxScore) {
            maxScore = score;
            dominantEmotion = emotion;
          }
        }
        const finalMessage = finalResponses[dominantEmotion] || "오늘 하루 수고했어!";
        addMessage("bot", finalMessage);
        await playTTS(finalMessage);
        // 로그 저장
        const logData = {
          userID: "홍길동",
          timestamp: new Date().toISOString(),
          sentence: combined,
          emotion: emotionScores,
          result_emotion: dominantEmotion
        };
        await fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });
        setChatEnded(true);
      } catch (error) {
        console.error("GPT-4 처리 에러:", error);
        setChatEnded(true);
      }
    }
  };

  // 음성 녹음을 위한 MediaRecorder 함수
  const startRecording = async () => {
    if (chatEnded) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = reader.result.split(',')[1];
          try {
            const response = await fetch('/api/stt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioContent: base64data })
            });
            const data = await response.json();
            const transcription = data.transcription;
            if (transcription) {
              addMessage("user", transcription);
              setUserResponses(prev => [...prev, transcription]);
              if (stage === 1) {
                setStage(2);
                setTimeout(() => {
                  handleChatbotPrompt(chatbotPrompts.stage2);
                }, 500);
              } else if (stage === 2) {
                const combined = userResponses.concat(transcription).join(', ');
                try {
                  const gptResponse = await fetch('/api/gpt4', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sentence: combined })
                  });
                  const gptData = await gptResponse.json();
                  const emotionScores = gptData.emotion;
                  let dominantEmotion = '';
                  let maxScore = -1;
                  for (let [emotion, score] of Object.entries(emotionScores)) {
                    if (score > maxScore) {
                      maxScore = score;
                      dominantEmotion = emotion;
                    }
                  }
                  const finalMessage = finalResponses[dominantEmotion] || "오늘 하루 수고했어!";
                  addMessage("bot", finalMessage);
                  await playTTS(finalMessage);
                  // 로그 저장
                  const logData = {
                    userID: "홍길동",
                    timestamp: new Date().toISOString(),
                    sentence: combined,
                    emotion: emotionScores,
                    result_emotion: dominantEmotion
                  };
                  await fetch('/api/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(logData)
                  });
                  setChatEnded(true);
                } catch (error) {
                  console.error("GPT-4 처리 에러:", error);
                  setChatEnded(true);
                }
              }
            }
          } catch (error) {
            console.error("STT 요청 에러:", error);
          }
        };
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("녹음 에러:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>챗봇 서비스</h1>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: '10px 0', textAlign: msg.sender === 'bot' ? 'left' : 'right' }}>
            <strong>{msg.sender === 'bot' ? '챗봇' : '사용자'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={inputText}
          disabled={chatEnded}
          placeholder="텍스트 입력 또는 음성 녹음 후 전송"
          onChange={(e) => setInputText(e.target.value)}
          style={{ width: '70%', padding: '10px' }}
        />
        <button type="submit" disabled={chatEnded} style={{ padding: '10px 20px', marginLeft: '10px' }}>전송</button>
      </form>
      <div style={{ marginTop: '10px' }}>
        {!isRecording ? (
          <button onClick={startRecording} disabled={chatEnded} style={{ padding: '10px 20px' }}>음성 녹음 시작</button>
        ) : (
          <button onClick={stopRecording} disabled={chatEnded} style={{ padding: '10px 20px' }}>음성 녹음 종료</button>
        )}
      </div>
      <p>chatEnded: {chatEnded.toString()}</p>
    </div>
  );
}

export default App;
