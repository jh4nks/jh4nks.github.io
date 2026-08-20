# 자체 호스팅 폰트 라이선스

이 디렉터리의 `.woff2` 파일은 Google Fonts에서 받아 저장소에 포함시킨 것입니다.
두 서체 모두 **SIL Open Font License 1.1** 이며, 재배포가 허용됩니다.

| 파일 | 서체 | 저작권 | 라이선스 |
|---|---|---|---|
| `jetbrains-mono-latin.woff2`, `jetbrains-mono-latin-ext.woff2` | JetBrains Mono | Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono) | SIL OFL 1.1 |
| `mr-dafoe-latin.woff2`, `mr-dafoe-latin-ext.woff2` | Mr Dafoe | Copyright (c) 2011, Brian J. Bonislawsky (Astigmatic) | SIL OFL 1.1 |

전문: https://openfontlicense.org/open-font-license-official-text/

본문 서체인 **Pretendard** (Copyright 2021 Kil Hyung-jin, SIL OFL 1.1) 는 저장소에
포함하지 않고 jsDelivr에서 woff2만 받아옵니다. `@font-face` 선언은 `_sass/_fonts.scss`에
있으므로 서드파티 **스타일시트**는 로드하지 않습니다.

## 자체 호스팅으로 바꾸려면

```bash
curl -L -o assets/fonts/pretendard-variable.woff2 \
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2"
```

받은 뒤 `_sass/_fonts.scss` 의 Pretendard `src:` URL을
`url('/assets/fonts/pretendard-variable.woff2')` 로 바꾸면 됩니다. (약 2 MB)
