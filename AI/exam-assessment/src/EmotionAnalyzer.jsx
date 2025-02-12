// src/EmotionAnalyzer.jsx
import React, { useState } from 'react';

const EmotionAnalyzer = () => {
  const [jsonData, setJsonData] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // test.json 파일을 불러오는 함수 (public 폴더에 있어야 합니다)
  const loadJson = async () => {
    try {
      const res = await fetch('/test.json');
      if (!res.ok) {
        throw new Error('JSON 파일 로드에 실패했습니다.');
      }
      const data = await res.json();
      setJsonData(data);
    } catch (err) {
      setError("JSON 파일 로드 실패: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult("");

    // JSON 데이터가 없으면 먼저 불러옵니다.
    let dataToAnalyze = jsonData;
    if (!dataToAnalyze) {
      try {
        const res = await fetch('/test.json');
        if (!res.ok) {
          throw new Error('JSON 파일 로드에 실패했습니다.');
        }
        dataToAnalyze = await res.json();
        setJsonData(dataToAnalyze);
      } catch (err) {
        setError("JSON 파일 로드 실패: " + err.message);
        return;
      }
    }

    // GPT API에 보낼 프롬프트 생성
    const prompt = `
아래 JSON 데이터는 아이의 각 감정 관련 학습 진행도를 나타냅니다. 
수치가 낮을수록 해당 감정 관련 단어 학습이 덜 된 상태입니다.
아이의 부족한 감정 영역을 분석하여, 추천 메시지를 작성해 주세요.

JSON 데이터:
${JSON.stringify(dataToAnalyze, null, 2)}

출력 형식 (예시):
"현재 아이는 <놀라움>이나 <두려움> 관련 단어들을 조금 어려워하는거 같으니 다음주에는 <놀라움>과 <두려움> 관련 감정어를 더 많이 학습하면 좋을 거 같습니다."
    `;

    setLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 환경 변수 이름이 REACT_APP_로 시작해야 합니다.
          "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-2024-08-06",
          messages: [
            {
              role: "system",
              content: "You are an assistant that analyzes a child's emotion learning progress and provides suggestions in Korean."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7
        })
      });

      const apiData = await response.json();

      if (apiData.error) {
        setError(apiData.error.message);
      } else {
        setResult(apiData.choices[0].message.content.trim());
      }
    } catch (err) {
      console.error(err);
      setError("요청 처리 중 오류가 발생했습니다: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>종합 감정분석 솔루션</h1>

      {/* JSON 불러오기 버튼 */}
      <button
        onClick={loadJson}
        disabled={loading}
        style={{ marginBottom: "10px", padding: "10px 20px", fontSize: "16px" }}
      >
        JSON 불러오기
      </button>

      {/* 불러온 JSON 데이터를 화면에 표시 */}
      {jsonData && (
        <div
          style={{
            marginBottom: "10px",
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            backgroundColor: "#f9f9f9",
            padding: "10px"
          }}
        >
          {JSON.stringify(jsonData, null, 2)}
        </div>
      )}

      {/* 분석하기 버튼 */}
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          {loading ? "분석 중..." : "분석하기"}
        </button>
      </form>

      {/* 오류 메시지 */}
      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <strong>오류:</strong> {error}
        </div>
      )}

      {/* 분석 결과 */}
      {result && (
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "#f0f0f0",
            padding: "15px",
            borderRadius: "5px"
          }}
        >
          <h2>분석 결과</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default EmotionAnalyzer;
