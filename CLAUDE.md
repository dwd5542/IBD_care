@AGENTS.md

# 크론병 환자 기록+커뮤니티 MVP

## 목적
크론병 환자가 배변/통증/식단/컨디션을 기록하고, 익명 게시판에서 소통하는 웹앱.
8주 안에 "기록+커뮤니티 결합 도구"에 대한 수요를 검증하는 게 목표.

## 기술 스택
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Supabase (인증 + DB, Row Level Security 사용)
- Vercel 배포

## 반드시 지킬 범위 (Won't)
- 의료 조언/진단/처방 관련 기능 절대 금지
- 특정 약/병원 추천 문구 금지
- 결제/커머스 기능 없음
- 사용자 건강데이터를 제3자에게 노출하는 기능 없음

## DB 원칙
- 모든 건강 관련 테이블은 Row Level Security를 켜고,
  "auth.uid() = user_id" 조건으로 본인 데이터만 조회/수정 가능하게 한다.

## 코드 스타일
- 컴포넌트는 src/components, 페이지는 src/app 아래
- 한국어 UI 텍스트 사용