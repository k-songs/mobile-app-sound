# 🎵 1단계 청능 훈련 소리 파일 가이드

## 📋 1단계 훈련 목적
**"소리가 있는지 없는지를 감지하는 훈련"**

사용자가 무작위로 발생하는 소리를 듣고, 그 소리가 실제로 들렸는지 감지하는 기본적인 청능 훈련입니다.

## 🎯 추천 소리 종류

### 1️⃣ **순수한 톤 (Tone) - 🎵**
- **250Hz 저음 비프**: 저주파수 감지 훈련
- **500Hz 중저음 비프**: 기본 주파수 감지
- **1000Hz 중음 비프**: 일반적인 주파수
- **2000Hz 고음 비프**: 고주파수 감지
- **4000Hz 초고음 비프**: 고주파수 한계 테스트

**특징**: 일정한 주파수, 일정한 길이(0.5-1초), 명확한 시작과 끝

### 2️⃣ **환경 소리 (Environment) - 🏠**
- 문 닫는 소리
- 물방울 떨어지는 소리
- 발걸음 소리
- 종이 넘기는 소리

**특징**: 일상 생활에서 자주 들리는 소리, 명확한 시작점

### 3️⃣ **전자 기기 소리 (Electronic) - 📱**
- 전화 벨소리 (표준 벨소리)
- 메시지 알림음
- 카메라 셔터 소리

**특징**: 현대인이 자주 듣는 소리, 반복적이고 예측 가능한 패턴

### 4️⃣ **자연 소리 (Nature) - 🌿**
- 새소리 (간단한 지저귐)
- 바람 소리 (부드러운 바람)
- 빗방울 소리 (가벼운 비)

**특징**: 자연스러운 소리, 부드러운 시작과 끝

### 5️⃣ **음성 소리 (Voice) - 🗣️**
- 박수 소리 (한 번의 박수)
- 휘파람 소리 (단순한 휘파람)
- 손가락 튕기기 소리

**특징**: 사람의 신체에서 나는 소리, 명확하고 짧음

## 🔧 소리 파일 생성 방법

### 1️⃣ **온라인 도구 사용**
- **Bfxr**: https://www.bfxr.net/ (비프음 생성에 최적)
- **AudioLab**: https://www.audiolab.com/ (환경 소리 생성)
- **Freesound**: https://freesound.org/ (실제 소리 검색)

### 2️⃣ **Audacity (무료 오디오 편집기)**
```bash
# Ubuntu/Debian
sudo apt install audacity

# macOS
brew install audacity

# Windows
# https://www.audacityteam.org/download/ 에서 다운로드
```

**톤 생성 방법:**
1. Audacity 실행
2. Generate → Tone
3. 주파수 설정 (250Hz, 500Hz, 1000Hz, 2000Hz, 4000Hz)
4. 길이: 0.8초
5. 파일 → Export → Audio → MP3로 저장

### 3️⃣ **파일 형식 및 설정**
- **형식**: MP3 (Expo/React Native에서 최적)
- **길이**: 0.5-1초 (너무 길면 판정 어렵고, 너무 짧으면 인지 불가)
- **볼륨**: -12dB ~ -6dB (너무 크지도 작지도 않게)
- **페이드 인/아웃**: 0.1초 (급작스러운 시작 방지)

## 📁 파일명 규칙

```
assets/sounds/
├── tone/
│   ├── beep_250hz.mp3
│   ├── beep_500hz.mp3
│   ├── beep_1000hz.mp3
│   ├── beep_2000hz.mp3
│   └── beep_4000hz.mp3
├── environment/
│   ├── door_close.mp3
│   ├── water_drip.mp3
│   ├── footsteps.mp3
│   └── paper_rustle.mp3
├── electronic/
│   ├── phone_ring.mp3
│   ├── notification.mp3
│   └── camera_shutter.mp3
├── nature/
│   ├── bird_chirp.mp3
│   ├── wind_blow.mp3
│   └── rain_drop.mp3
└── voice/
    ├── clap.mp3
    ├── whistle.mp3
    └── finger_snap.mp3
```

## 🎮 난이도별 소리 그룹

### 초급 (Beginner)
- beep_500hz, beep_1000hz (안정적인 주파수)
- door_close, clap (명확한 환경/음성 소리)

### 중급 (Intermediate)
- beep_250hz, beep_2000hz (저주파/고주파 추가)
- water_drip, phone_ring, bird_chirp (다양한 카테고리)

### 고급 (Advanced)
- beep_4000hz (초고주파수)
- notification, camera_shutter, wind_blow, finger_snap (복잡한 소리)

## ⚡ 실제 앱 구현 팁

1단계 훈련에서는 소리가 발생하는 타이밍이 매우 중요합니다:
- 소리와 소리 사이 간격: 2-5초 (무작위)
- 소리 길이: 0.8초 고정
- 사용자가 소리를 감지하고 반응할 시간: 1초 이내

## 🔍 소리 품질 체크리스트

- [ ] 너무 크지 않은가? (귀가 아프지 않게)
- [ ] 너무 작지 않은가? (겨우 들리지 않게)
- [ ] 시작과 끝이 명확한가?
- [ ] 배경 소음이 없는가?
- [ ] 반복 재생 시 일관성이 있는가?

이 가이드에 따라 소리 파일을 준비하면 효과적인 1단계 청능 훈련이 될 것입니다! 🎧✨
