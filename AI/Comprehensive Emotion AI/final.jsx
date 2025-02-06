import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

const targetEmotions = ['angry', 'fear', 'happy', 'sad', 'surprise'];

const EmotionAnalysis = () => {
  // 참조: video와 canvas 요소
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 상태 값
  const [isPaused, setIsPaused] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState('');
  const [recordedVideoURL, setRecordedVideoURL] = useState(null);

  // 모델과 MediaRecorder 관련 ref
  const modelRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // 감정 누적 및 프레임 수 (갱신해도 렌더링할 필요가 없으므로 useRef 사용)
  const accumulatedEmotionsRef = useRef({
    angry: 0,
    fear: 0,
    happy: 0,
    sad: 0,
    surprise: 0,
  });
  const frameCountRef = useRef(0);

  // 분석 주기를 FPS 15 (약 66ms 간격)로 제한
  const FPS = 15;
  const analysisInterval = 1000 / FPS;
  const lastAnalysisTimeRef = useRef(0);

  // 모델과 웹캠 스트림 초기화
  useEffect(() => {
    // 모델 로드 (모델 파일은 public 혹은 웹서버 상에서 제공되어야 함)
    async function loadModel() {
      try {
        modelRef.current = await tf.loadLayersModel('./save_models/emotion_model.json');
        console.log('모델 로드 완료');
      } catch (err) {
        console.error('모델 로드 실패:', err);
      }
    }
    loadModel();

    // 웹캠 스트림 설정
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('웹캠 접근 오류:', err);
      }
    }
    setupCamera();

    // 컴포넌트 언마운트 시 스트림 정리
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // 애니메이션 루프: 매 프레임 canvas에 영상 표시 및 (분석중이면) 감정 예측
  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    const tick = () => {
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        // 영상 프레임을 canvas에 그리기
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 일시정지가 아니고 분석중이면 모델 예측 수행
        if (!isPaused && isAnalyzing && modelRef.current) {
          const now = Date.now();
          if (now - lastAnalysisTimeRef.current > analysisInterval) {
            lastAnalysisTimeRef.current = now;

            // canvas의 현재 프레임을 텐서로 변환
            // → 아래 전처리는 모델 입력에 맞게 수정 필요 (예: 48×48 크기로 리사이즈)
            tf.tidy(() => {
              const imgTensor = tf.browser.fromPixels(canvas)
                .resizeNearestNeighbor([48, 48]) // 모델에 맞게 크기 조정
                .toFloat()
                .div(tf.scalar(255.0))
                .expandDims(0); // [1, 48, 48, 3]

              // 예측 수행 (출력 shape: [1, 5]라고 가정)
              const prediction = modelRef.current.predict(imgTensor);
              const predData = prediction.dataSync(); // 길이 5 배열

              // 예측 결과의 총합 계산
              const total = predData.reduce((a, b) => a + b, 0);
              let resultText = '';
              if (total < 1e-6) {
                resultText = 'No face / no confidence';
              } else {
                // 각 감정 값을 백분율로 정규화
                const percentages = {};
                targetEmotions.forEach((emo, i) => {
                  percentages[emo] = (predData[i] / total) * 100;
                });

                // 누적합 갱신
                targetEmotions.forEach((emo) => {
                  accumulatedEmotionsRef.current[emo] += percentages[emo];
                });
                frameCountRef.current += 1;

                resultText = targetEmotions
                  .map(emo => `${emo}: ${percentages[emo].toFixed(1)}%`)
                  .join('  ');
              }
              setCurrentResult(resultText);
            });
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isAnalyzing, analysisInterval]);

  // 키 입력 이벤트 처리 (Space: 일시정지/재개, T: 분석/녹화 시작/종료, Q: 스트림 정지)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') {
        // 스페이스바: 일시정지/재개
        setIsPaused(prev => {
          const newPaused = !prev;
          console.log(newPaused ? '=== 일시정지 ===' : '=== 재개 ===');
          return newPaused;
        });
      } else if (e.key.toLowerCase() === 't') {
        // T 키: 분석 및 녹화 시작/종료 토글
        if (!isAnalyzing) {
          console.log('>>> 감정 분석 시작!');
          // 누적값 초기화
          accumulatedEmotionsRef.current = { angry: 0, fear: 0, happy: 0, sad: 0, surprise: 0 };
          frameCountRef.current = 0;
          setIsAnalyzing(true);

          // MediaRecorder로 녹화 시작 (videoRef의 스트림 사용)
          if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            recordedChunksRef.current = [];
            try {
              mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
            } catch (err) {
              console.error('MediaRecorder 생성 오류:', err);
              return;
            }
            mediaRecorderRef.current.ondataavailable = (event) => {
              if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
              }
            };
            mediaRecorderRef.current.start();
            console.log('녹화 시작');
          }
        } else {
          // 분석 및 녹화 종료
          console.log('>>> 감정 분석 종료');
          setIsAnalyzing(false);
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.onstop = () => {
              const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
              const url = URL.createObjectURL(blob);
              setRecordedVideoURL(url);
              console.log('녹화 종료, URL:', url);
            };
          }
          // 누적 감정 평균 계산
          if (frameCountRef.current > 0) {
            const averagedEmotions = {};
            targetEmotions.forEach((emo) => {
              averagedEmotions[emo] = accumulatedEmotionsRef.current[emo] / frameCountRef.current;
            });
            let summary = 'Recorded Emotion Summary:';
            targetEmotions.forEach((emo) => {
              summary += ` ${emo}: ${averagedEmotions[emo].toFixed(2)}%`;
            });
            console.log(summary);
            setCurrentResult(summary);
          } else {
            console.log('분석된 프레임이 없습니다.');
            setCurrentResult('분석된 프레임이 없습니다.');
          }
        }
      } else if (e.key.toLowerCase() === 'q') {
        // Q 키: 스트림 정리 (브라우저에서는 앱을 종료하지 않으므로)
        console.log('종료');
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnalyzing, isPaused]);

  return (
    <div>
      <h1>Emotion Analysis</h1>
      {/* video 요소는 화면에 보이지 않고 스트림용으로 사용 */}
      <video ref={videoRef} style={{ display: 'none' }} />
      {/* canvas에 영상 프레임을 그리며, 스타일은 필요에 따라 조정 */}
      <canvas ref={canvasRef} style={{ width: '640px', height: '480px', border: '1px solid #ccc' }} />
      <div>
        <p>{currentResult}</p>
        {recordedVideoURL && (
          <div>
            <h2>Recorded Video</h2>
            <video src={recordedVideoURL} controls style={{ width: '640px', height: '480px' }} />
            <br />
            <a href={recordedVideoURL} download="recorded_video.webm">Download Video</a>
          </div>
        )}
      </div>
      <div>
        <p>
          Controls: <br />
          - Press <strong>Space</strong> to pause/resume <br />
          - Press <strong>T</strong> to start/stop analysis &amp; recording <br />
          - Press <strong>Q</strong> to stop the video stream.
        </p>
      </div>
    </div>
  );
};

export default EmotionAnalysis;
