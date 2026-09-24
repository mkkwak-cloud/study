@echo off
REM 로컬 테스트용 실행 스크립트 (Windows).
REM 1) 의존성 설치(최초 1회) 2) 프로덕션 빌드 3) 정적 서버 기동 4) 브라우저 자동 실행.
REM
REM 사용법:
REM   run.bat            (기본 포트 4173)
REM   set PORT=8080 ^&^& run.bat

setlocal
cd /d "%~dp0"

if "%PORT%"=="" set PORT=4173
set URL=http://localhost:%PORT%/

if not exist node_modules (
  echo [run.bat] 의존성 설치 중...
  call npm install
  if errorlevel 1 exit /b 1
)

echo [run.bat] 프로덕션 빌드 중...
call npm run build
if errorlevel 1 exit /b 1

echo [run.bat] %URL% 에서 서버를 시작합니다 (종료: Ctrl+C)
start "" "%URL%"
call npx vite preview --host --port %PORT%
