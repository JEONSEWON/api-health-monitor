# Favicon 생성 가이드

로고 파일: `checkapi-logo.jpg`

## 온라인 도구로 생성 (가장 쉬움)

### 방법 1: Favicon.io (추천)
1. https://favicon.io/favicon-converter/ 접속
2. `checkapi-logo.jpg` 업로드
3. "Download" 클릭
4. 압축 해제 후 다음 파일들을 `frontend/public/` 폴더에 복사:
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`

### 방법 2: RealFaviconGenerator
1. https://realfavicongenerator.net/ 접속
2. `checkapi-logo.jpg` 업로드
3. 설정:
   - iOS: 기본값 사용
   - Android: 기본값 사용 (Theme color: #10B981)
   - Windows: 기본값 사용
4. "Generate favicons" 클릭
5. 다운로드 후 `frontend/public/` 폴더에 압축 해제

## 필요한 파일 목록

```
frontend/public/
├── favicon.ico              (16x16, 32x32, 48x48 multi-size)
├── favicon-16x16.png        (16x16)
├── favicon-32x32.png        (32x32)
├── favicon-96x96.png        (96x96, optional)
├── apple-touch-icon.png     (180x180, iOS)
├── android-chrome-192x192.png (192x192, Android)
├── android-chrome-512x512.png (512x512, Android)
└── site.webmanifest         (✓ 이미 생성됨)
```

## 테스트

파비콘 설정 후:
1. 브라우저에서 https://checkapi.io 접속
2. 탭에 로고 아이콘이 보이는지 확인
3. 북마크 추가 시 로고가 보이는지 확인
4. 모바일에서 홈 화면 추가 시 로고가 보이는지 확인

## 현재 상태

✅ `site.webmanifest` - PWA 설정 완료
✅ `layout.tsx` - 메타데이터 설정 완료
⏳ 파비콘 이미지 파일들 - 온라인 도구로 생성 필요

## 자동 생성 스크립트 (나중에 사용 가능)

Python Pillow가 설치되면:
```bash
cd design/logos
python3 generate_favicons.py
```
