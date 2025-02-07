# frontend/Dockerfile

# nginx의 안정 버전(예: alpine 기반) 사용
FROM nginx:stable-alpine

# (선택사항) 기본 nginx 정적 파일 제거
# RUN rm -rf /usr/share/nginx/html/*

# 빌드 결과물을 nginx가 서비스하는 폴더로 복사
COPY build/ /usr/share/nginx/html/

# (선택사항) custom nginx 설정 파일이 있다면 복사
# COPY nginx.conf /etc/nginx/nginx.conf

# 컨테이너가 외부에 노출할 포트 지정
EXPOSE 80
EXPOSE 443

# nginx를 포그라운드 모드로 실행
CMD ["nginx", "-g", "daemon off;"]
