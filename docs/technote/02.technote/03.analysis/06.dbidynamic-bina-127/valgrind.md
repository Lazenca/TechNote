---
title: "Valgrind"
sidebar_position: 1
---


## **Valgrind**

* **Valgrind는 동적 분석 도구를 구축하기위한 계측 프레임 워크(instrumentation framework)입니다.**  
  + Valgrind를 이용해 자동으로 많은 메모리 관리 및 스레딩 버그를 감지하고 프로그램을 자세하게 분석 할 수있습니다.
  + Valgrind를 이용해 새로운 도구를 만들 수도 있습니다.
* **Valgrind는 동적 바이너리 계측을 사용하므로 응용 프로그램을 수정, 재컴파일하거나 다시 연결할 필요가 없습니다.**
  + 명령 줄에 valgrind를 붙이면 모든 것이 작동합니다.
* **Valgrind는 C, C ++, Java, Perl, Python, 어셈블리 코드, Fortran, Ada 및 기타 여러 언어로 작성된 프로그램에서 사용됩니다.**  
  + Valgrind 도구는 주로 C 및 C ++로 작성된 프로그램을 대상으로 합니다
* **Valgrind 배포판에는 6개의 품질 도구 테스트 도구가 포함되어 있습니다.**
  + 메모리 에러 검출기
  + 2개의 스레드 에러 검출기
  + 캐시 및 분기 예측 프로파일러
  + 콜 그래프 생성 캐시
  + 분기 예측 프로파일러
  + 힙 프로파일러
* **Valgrind는 세 가지 실험 도구가 포합되어 있습니다.**  
  + 스택 및 전역 배열의 Overrun 검출기
  + 힙 블록 사용 방법을 검사하는 second heap profiler
  + SimPoint 기본 블록 벡터 생성기
* **Valgrind는 다음과 같은 플랫폼에서 실행됩니다.**  
  + X86/Linux, AMD64/Linux, ARM/Linux, ARM64/Linux, PPC32/Linux, PPC64/Linux, PPC64LE/Linux, S390X/Linux, MIPS32/Linux, MIPS64/Linux, X86/Solaris, AMD64/Solaris, ARM/Android (2.3.x and later), ARM64/Android, X86/Android (4.0 and later), MIPS32/Android, X86/Darwin and AMD64/Darwin (Mac OS X 10.12).

### Valgrind Tools

#### **Memcheck**

* [Valgrind - Memcheck](/technote/technote/analysis/dynamic-program-879/valgrind-memcheck)

#### **SGCheck**

* **SGCheck는 스택 및 전역 배열 오버런을 찾기 위한 도구입니다.**
* **SGCheck는 스택 및 전역 배열 액세스의 가능한 형태에 대한 관찰에서 파생 된 경험적 접근법을 사용하여 작동합니다.**

#### **flayer**

* <https://github.com/Grindland/flayer/tree/master/valgrind-flayer>
:::note
* <http://valgrind.org/info/tools.html>
:::

### Download

* <http://valgrind.org/downloads/>

### Install

```
wget ftp://sourceware.org/pub/valgrind/valgrind-3.13.0.tar.bz2
tar -xvf valgrind-3.13.0.tar.bz2
cd valgrind-3.13.0
./configure
make
make install
```

### Guide

* <http://valgrind.org/docs/manual/quick-start.html#quick-start.intro>
* <http://valgrind.org/docs/manual/manual.html>

## **Example**

* 소스코드를 다운받으면 해당 폴더 안에 앞에서 설명한 Tools들에 대한 소스코드가 포함되어 있습니다.  
  + Memcheck: <http://valgrind.org/docs/manual/mc-manual.html>
  + dhat : <http://valgrind.org/docs/manual/dh-manual.html>
  + SGCheck : <http://valgrind.org/docs/manual/sg-manual.html>
  + Example : <http://valgrind.org/docs/manual/manual-core-adv.html#manual-core-adv.wrapping.example>