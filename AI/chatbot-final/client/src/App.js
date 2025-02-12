// client/src/App.js
import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [stage, setStage] = useState(1);
  const [userResponses, setUserResponses] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const recognitionRef = useRef(null);

  // 챗봇 기본 질문 및 감정별 최종 응답 메시지
  const chatbotPrompts = {
    stage1: "안녕! 만나서 반가워! 오늘 하루 어떤 일이 있었니?",
    stage2: "그래서 어떤 감정이 들었어?"
  };

  const finalResponses = {
    happy: "오늘 우리 친구의 감정은 기쁨이구나! 너의 행복한 마음이 나에게도 전해져! 내일도 이렇게 기쁜 하루 보내자!",
    sad: "오늘은 슬픔이 느껴지는 날이었구나. 때로는 슬픔도 우리를 성장시키는 법이야. 내일은 더 좋은 날이 될 거야.",
    angry: "오늘은 화가 나는 일이 있었구나. 마음을 진정시키고 쉬어가며 내일을 준비해보자.",
    fear: "두려움이 있었던 하루였네. 하지만 용기를 내어 앞으로 나아가는 너를 응원해!",
    surprised: "오늘은 놀라움이 가득했던 하루였구나! 새로운 경험이 너에게 많은 영감을 주었길 바래!"
  };

  // 메시지 추가 함수
  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  // TTS: Web Speech API를 이용한 음성 출력
  const playTTS = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    speechSynthesis.speak(utterance);
  };

  // 챗봇 질문 처리 함수
  const handleChatbotPrompt = (prompt) => {
    addMessage("bot", prompt);
    playTTS(prompt);
  };

  // GPT-4 감정 분석 API 호출 (직접 OpenAI 엔드포인트 호출)
  const callGPT4 = async (sentence) => {
    const prompt = `다음 문장에 대해 다섯 가지 감정(happy, sad, angry, fear, surprised)이 각각 몇 퍼센트인지 분석해줘.
문장: "${sentence}"
출력은 JSON 형식으로 해줘. 예시: {"happy": 92, "sad": 0, "angry": 0, "fear": 0, "surprised": 8}`;
    const messagesForGPT = [
      { role: "system", content: "당신은 감정 분석 전문가입니다." },
      { role: "user", content: prompt }
    ];
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 클라이언트에서 API 키를 사용하는 것은 보안에 매우 취약합니다.
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-2024-08-06",
          messages: messagesForGPT,
          temperature: 0,
        })
      });
      const json = await response.json();
      const reply = json.choices[0].message.content;
      let emotionData;
      try {
        emotionData = JSON.parse(reply);
      } catch (jsonError) {
        // JSON 파싱이 실패하면 텍스트 내 JSON 부분만 추출
        const jsonStart = reply.indexOf('{');
        const jsonEnd = reply.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = reply.substring(jsonStart, jsonEnd + 1);
          emotionData = JSON.parse(jsonString);
        } else {
          throw new Error("JSON 파싱 실패");
        }
      }
      return emotionData;
    } catch (error) {
      console.error("GPT-4 에러:", error);
      throw error;
    }
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
    const currentInput = inputText;
    setInputText('');

    if (stage === 1) {
      // stage1 후 stage2로 전환
      setStage(2);
      setTimeout(() => {
        handleChatbotPrompt(chatbotPrompts.stage2);
      }, 500);
    } else if (stage === 2) {
      // 두 응답 합쳐서 GPT-4 호출 및 로그 저장
      const combined = [...userResponses, currentInput].join(', ');
      try {
        const emotionScores = await callGPT4(combined);
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
        playTTS(finalMessage);
        // 로그 저장 (백엔드 /api/log 엔드포인트 호출)
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

  // 음성 인식을 위한 SpeechRecognition API 사용
  const startVoiceRecognition = () => {
    if (chatEnded) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("이 브라우저는 SpeechRecognition을 지원하지 않습니다.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsRecording(true);
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      addMessage("user", transcript);
      setUserResponses(prev => [...prev, transcript]);
      if (stage === 1) {
        setStage(2);
        setTimeout(() => {
          handleChatbotPrompt(chatbotPrompts.stage2);
        }, 500);
      } else if (stage === 2) {
        const combined = [...userResponses, transcript].join(', ');
        try {
          const emotionScores = await callGPT4(combined);
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
          playTTS(finalMessage);
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
      setIsRecording(false);
    };
    recognition.onerror = (event) => {
      console.error("음성 인식 에러:", event.error);
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  // 음성 인식 중지 (사용자가 원할 경우)
  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
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
        <button type="submit" disabled={chatEnded} style={{ padding: '10px 20px', marginLeft: '10px' }}>
          전송
        </button>
      </form>
      <div style={{ marginTop: '10px' }}>
        {!isRecording ? (
          <button onClick={startVoiceRecognition} disabled={chatEnded} style={{ padding: '10px 20px' }}>
            음성 녹음 시작
          </button>
        ) : (
          <button onClick={stopVoiceRecognition} disabled={chatEnded} style={{ padding: '10px 20px' }}>
            음성 녹음 종료
          </button>
        )}
      </div>
      <p>chatEnded: {chatEnded.toString()}</p>
    </div>
  );
}

export default App;
