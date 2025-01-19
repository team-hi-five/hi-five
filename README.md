# 저장소 관리 전략 및 브랜치 관리 가이드

## 1. 저장소 구조

```
root/
├── frontend/               # React 프로젝트
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── assets/
│   │   ├── styles/
│   │   ├── services/
│   │   └── index.js
│   ├── .env                # 환경 변수 설정
│   ├── package.json        # 의존성 관리
│   ├── package-lock.json
│   ├── tsconfig.json       # TypeScript 사용 시
│   └── node_modules/       # 의존성 설치 폴더
│
├── backend/                # Spring Boot 프로젝트
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/projectname/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── dto/
│   │   │   │   ├── model/
│   │   │   │   └── exception/
│   │   │   ├── resources/
│   │   │   │   ├── static/
│   │   │   │   ├── templates/
│   │   │   │   └── application.yml
│   │   │   └── test/
│   ├── logs/               # 로그 파일 저장 폴더
│   ├── build.gradle        # Gradle 설정 파일
│   └── gradlew             # Gradle Wrapper
│
├── CI-CD/                  # Jenkins 설정 및 관리
│   ├── Jenkinsfile         # CI/CD 파이프라인 설정
│   └── README.md           # Jenkins 설정 가이드
│
├── docker/                 # Docker 관련 설정
│   ├── Dockerfile.backend  # 백엔드 Docker 이미지 설정
│   ├── Dockerfile.frontend # 프론트엔드 Docker 이미지 설정
│   └── docker-compose.yml  # 서비스 및 네트워크 구성 파일
│
├── .gitignore              # Git 무시 목록
└── README.md               # 프로젝트 설명 문서
```

---

## 2. 브랜치 관리 전략

### 1) 브랜치 구조

```
main
├── develop
│   ├── feature/AI
│   │   ├── feature/AI-login-prediction
│   │   └── feature/AI-model-training
│   ├── feature/BE
│   │   ├── feature/BE-auth-api
│   │   ├── feature/BE-payment-api
│   │   └── feature/BE-logging
│   ├── feature/FE
│   │   ├── feature/FE-login-page
│   │   ├── feature/FE-dashboard
│   │   └── feature/FE-user-profile
│   └── hotfix/login-bugfix
└── release/v1.0
```

### 2) 브랜치 상세 설명 및 관리 규칙

- **main 브랜치**: 배포 가능한 안정적인 코드만 존재. 직접 작업 금지. 배포 완료 후 PR로 Merge.
- **develop 브랜치**: 개발 통합 브랜치. 테스트 및 코드 리뷰 완료된 기능만 병합.
- **feature 브랜치**: 역할별 + 기능별 브랜치 전략 병행. 기능 완료 후 PR 요청 및 코드 리뷰.
- **release 브랜치**: 배포 준비 및 안정화 브랜치. 완료 후 main과 develop에 병합.
- **hotfix 브랜치**: 배포 이후 긴급 버그 수정 브랜치. 수정 완료 후 main과 develop에 병합.

---

## 3. CI/CD 관리 (Jenkins + Docker + AWS)

### 1) Jenkins 역할

- **빌드 및 테스트 자동화**:
  - develop 브랜치에 Merge 시 자동 빌드 및 테스트 실행.
  - 성공/실패 여부 보고 및 알림 전송.
- **Docker 컨테이너 생성 및 배포**:
  - 프론트엔드 및 백엔드 이미지를 생성하고 AWS에 배포.
- **배포 후 상태 점검 및 모니터링 연동**.

### 2) Jenkinsfile 예제

```groovy
pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop', url: 'https://github.com/username/repository.git'
            }
        }
        stage('Build and Test') {
            steps {
                dir('backend') {
                    sh './gradlew clean build'
                    sh './gradlew test'
                }
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                    sh 'npm test'
                }
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker-compose -f docker/docker-compose.yml build'
            }
        }
        stage('Deploy to AWS') {
            steps {
                sh 'docker-compose -f docker/docker-compose.yml up -d'
            }
        }
    }
    post {
        success {
            echo 'Build, Test, and Deployment Successful!'
        }
        failure {
            echo 'Build or Deployment Failed!'
        }
    }
}
```

---

## 4. 이슈 트래킹 관리 (Jira)

### 이슈 생성 및 상태 관리:

- Jira에서 이슈 생성 → 작업 상태 관리 (To Do → In Progress → Done).

### 브랜치 및 커밋 연동:

- 예시: 이슈 ID: `BE-123` → 브랜치 명: `feature/BE-123-auth-api`
- 커밋 메시지 예시:
  ```
  feat: 로그인 API 구현 (BE-123)
  ```

---

## 5. 커밋 메시지 컨벤션

### 1) 형식

```
<타입>: <변경 사항 요약> <Jira 이슈 연동 브랜치명>
```

### 2) 타입

| 타입     | 설명                              |
| -------- | --------------------------------- |
| feat     | 새로운 기능 추가                  |
| fix      | 버그 수정                         |
| docs     | 문서 수정 (README 변경 등)        |
| style    | 코드 스타일 수정 (동작 변화 없음) |
| refactor | 코드 리팩토링 (동작 변화 없음)    |
| test     | 테스트 코드 추가 및 수정          |
| chore    | 기타 변경사항 (빌드 설정 등)      |

### 3) 예시

- `feat: 회원 로그인 API 구현 (BE-123)`
- `fix: 로그인 버그 수정 (BE-123)`
- `docs: README 파일 업데이트 (BE-123)`
- `style: 코드 정렬 및 주석 추가 (BE-123)`
- `refactor: 로그인 로직 최적화 (BE-123)`
- `test: 로그인 유닛 테스트 추가 (BE-123)`
- `chore: 의존성 라이브러리 업데이트 (BE-123)`
