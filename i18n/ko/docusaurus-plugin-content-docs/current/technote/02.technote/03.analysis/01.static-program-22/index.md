---
title: "01.Static program analysis"
sidebar_position: 1
slug: /category/01static-program-analysis
---

## **Static program analysis**

* **정적 분석은 실제로 프로그램을 실행하지 않고 프로그램을 분석합니다.**
* **정적 분석은 다음과 형태에서 분석이 진행됩니다.**
  + 소소코드
  + 오브젝트 코드
* **정적 분석은 기본 구문 검사에서 부터 코드의 의미에 대한 추론을 통해 버그를 발견하는 도구로 발전했습니다.**
* **정적 분석을 효율적으로 점검하기 위해 아래와 같은 분석이 필요합니다.**
  + Unit Level - 프로그램 문맥과의 연결 없이 특정한 프로그램 안이나 서브루틴에서 발생하는 분석. 
  + Technology Level - 문제를 찾고 명백한 긍정오류를 피하기 위해서, 전체 프로그램의 전체적이고 의미적인 관점을 얻기 위하여 유닛 프로그램들 간의 상호작용들을 고려하는 분석
  + System Level - 유닛 프로그램들 간의 상호작용들은 고려하지만 한 기술이나 한 언어에 제한되지 않는 분석
* **정적 분석을 구현하는데 다음과 같은 기술들을 사용할 수 있습니다.**
  + Abstract interpretation
  + Data-flow analysis
  + Model checking
  + Symbolic execution
* **정적 분석을 통해 다음과 같은 내용을 발견 할 수 있습니다.**
  + 보안 취약성
  + 코딩 표준 위반
  + 사용되지 않는 변수
  + 사용되지 않는 코드
  + 정의 되지 않은 값의 변수 참조
  + 코드와 소프트웨어 모델의 구문 규칙 위반
  + 모듈과 컴포넌트 간에 일관되지 않은 인터페이스

## **Static program analysis Tools**

* **다음과 같은 정적 분석 도구들이 있습니다.**
  + 이외에도 다양한 정적 분석 도구들이 있습니다.

| 제목 | 작성자 | 수정됨 |
| --- | --- | --- |
| [Clang Static Analyzer](/display/TEC/Clang+Static+Analyzer) | [Lazenca.0x0](/display/~sintobul2%40naver.com) | 11월 30, 2017 |

## **Related site**

* <https://en.wikipedia.org/wiki/Static_program_analysis>