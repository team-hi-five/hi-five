import React, { useState } from 'react';

// ── 유틸리티: Levenshtein 거리와 문자열 유사도 계산 ───────────────────────
function levenshtein(a, b) {
  const matrix = [];

  // 초기 행 설정
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  // 초기 열 설정
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  // 동적 계획법으로 거리 계산
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 교체
          matrix[i][j - 1] + 1,     // 삽입
          matrix[i - 1][j] + 1      // 삭제
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function similarity(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const levDist = levenshtein(s1, s2);
  return 1 - levDist / Math.max(s1.length, s2.length);
}

// ── App 컴포넌트 ─────────────────────────────────────────────
const App = () => {
  const [chapter, setChapter] = useState('');
  const [stage, setStage] = useState('');
  const [stageData, setStageData] = useState(null);
  const [options, setOptions] = useState([]);
  const [recognizedText, setRecognizedText] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [correctAnswerMessage, setCorrectAnswerMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 스테이지 데이터 로드
  const handleLoadStage = async () => {
    if (!chapter || !stage) {
      alert('챕터와 스테이지 번호를 모두 입력해주세요.');
      return;
    }
    try {
      setIsLoading(true);
      // game_data 폴더 내의 JSON 파일 로드 (예: game_data/1-1.json)
      const response = await fetch(`game_data/${chapter}-${stage}.json`);
      if (!response.ok) {
        throw new Error(`파일을 불러올 수 없습니다: game_data/${chapter}-${stage}.json`);
      }
      const data = await response.json();
      setStageData(data);
      // 옵션 객체의 키를 오름차순 정렬 후 배열로 변환
      const optionKeys = Object.keys(data.options).sort((a, b) => Number(a) - Number(b));
      const opts = optionKeys.map(key => data.options[key]);
      setOptions(opts);
      // 이전 결과 초기화
      setRecognizedText('');
      setSelectedOption('');
      setEvaluation('');
      setCorrectAnswerMessage('');
      setStatusMessage('');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Web Speech API를 이용한 음성 인식
  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setStatusMessage('음성을 인식하는 중입니다. 말씀해주세요...');
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecognizedText(transcript);

      // 옵션별 유사도 계산
      let bestMatchIndex = 0;
      let bestScore = 0;
      options.forEach((optionText, idx) => {
        const score = similarity(transcript, optionText);
        console.log(`옵션 ${idx + 1}: "${optionText}" / 점수: ${score.toFixed(2)}`);
        if (score > bestScore) {
          bestScore = score;
          bestMatchIndex = idx;
        }
      });
      setSelectedOption(options[bestMatchIndex]);

      // 정답 판별 (JSON의 answer는 1부터 시작)
      if (bestMatchIndex + 1 === stageData.answer) {
        setEvaluation('정답입니다!');
      } else {
        setEvaluation('오답입니다!');
      }
      setCorrectAnswerMessage(`정답은 "${options[stageData.answer - 1]}" 입니다.`);
      setStatusMessage('');
    };

    recognition.onerror = (event) => {
      console.error('음성 인식 에러:', event.error);
      setStatusMessage(`에러 발생: ${event.error}`);
    };

    recognition.onend = () => {
      // 인식 종료 후 다시 버튼 활성화
    };
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Game Audio Prototype</h1>

      {/* 챕터 & 스테이지 선택 영역 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>
          챕터:
          <input
            type="number"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="예: 1"
            style={{ marginLeft: '5px' }}
          />
        </label>
        <label style={{ marginRight: '10px' }}>
          스테이지:
          <input
            type="number"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            placeholder="예: 1"
            style={{ marginLeft: '5px' }}
          />
        </label>
        <button onClick={handleLoadStage} disabled={isLoading}>
          {isLoading ? '로딩 중...' : '스테이지 로드'}
        </button>
      </div>

      {/* 스테이지 정보와 옵션 표시 */}
      {stageData && (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
          <h2>
            [{chapter}-{stage} 스테이지]
          </h2>
          <p>선택지:</p>
          <ul>
            {options.map((option, idx) => (
              <li key={idx}>
                {idx + 1}. "{option}"
              </li>
            ))}
          </ul>
          <button onClick={startRecognition}>음성 입력 시작</button>
          {statusMessage && <p>{statusMessage}</p>}
        </div>
      )}

      {/* 결과 표시 */}
      {(recognizedText || selectedOption || evaluation) && (
        <div style={{ border: '1px solid #ccc', padding: '10px' }}>
          <h2>결과</h2>
          <p>
            <strong>인식된 음성:</strong> {recognizedText}
          </p>
          <p>
            <strong>선택된 옵션:</strong> {selectedOption}
          </p>
          <p>
            <strong>평가:</strong> {evaluation}
          </p>
          <p>{correctAnswerMessage}</p>
        </div>
      )}
    </div>
  );
};

export default App;
