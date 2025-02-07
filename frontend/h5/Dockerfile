# Stage 2: 배포 단계 - nginx 이미지에 빌드 결과물을 복사하여 서비스
FROM nginx:stable-alpine
# (선택사항) 기존 nginx 기본 정적 파일 제거
RUN rm -rf /usr/share/nginx/html/*
# Stage1에서 빌드된 결과물을 nginx가 서비스하는 폴더로 복사
COPY --from=build /app/build/ /usr/share/nginx/html/
# 컨테이너에서 외부에 노출할 포트 지정
EXPOSE 80
EXPOSE 443
# nginx를 포그라운드 모드로 실행
CMD ["nginx", "-g", "daemon off;"]
