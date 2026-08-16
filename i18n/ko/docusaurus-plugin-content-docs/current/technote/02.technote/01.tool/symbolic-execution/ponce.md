---
title: "Ponce"
sidebar_position: 1
---


# **Ponce**

## **Description**

* **Ponce는 IDA에서 Taint analysis와 Symbolic execution을 사용할 수 있는 플러그인 입니다.**
  + Ponce는 C/C++로 개발되었습니다.
  + Ponce는 Windows, Linux, OSX 버전을 모두 지원합니다.
  + Ponce는 Tainting engine, Symbolic engine 모드를 지원합니다.
    - Snapshot 기능도 지원합니다.
  + Ponce는 Triton 프레임 워크에 의존합니다.

## **Install**

* 아래 github를 통해서 각 운영제체에 맞는 플러그인을 다운받을 수 있습니다.
  + <https://github.com/illera88/Ponce/tree/master/latest_builds>
* 다운받은 플러그인 파일들은 "plugins\" 폴더에 저장하면 설치가 끝납니다.

## **Example**

* ****아래 예제들은 Ponce 에서 제공하는 Example 입니다.****
  + 동일한 내용을 중복으로 설명하는 것은 불필요하다고 생각되기 때문에 추가적인 설명은 작성하지 않겠습니다.
  + 자세한 내용을 위에 작성된 페이지에서 확인가능합니다.
  + 아래에 작성한 예제 이외에도 다양한 예제들이 Github에 있으니, 해당 내용들도 꼭 읽어보시기를 권장합니다.
* <https://github.com/illera88/Ponce>

### Use symbolic execution to solve a crackMe

* **다음과 같은 순서대로 symbolic execution을 진행할 수 있습니다.**
  + Ponce의 Show Config(Ctrl + Shift + P)에서 Symbolic engine을 선택합니다.
  + 사용자로 부터 값을 입력 받은 직후의 코드영역에 Break point를 설정합니다.
  + 프로그램을 실행 합니다.
  + 사용자로 부터 값을 입력 합니다.
  + 분석을 원하는 값(사용자 입력값)이 저장된 영역을 선택해 Symbolize Memory에 등록합니다.
    - 메모리 영역 선택 → 오른쪽 버튼 → Symbolic → Symbolize Memory
  + 중단된 프로그램의 실행을 계속합니다.
  + Symbolic 조건을 확인하고 SMT를 이용해 분기를 변경하기 위해 필요한 값을 계산 합니다.
    - 분기문 선택 → 오른쪽 버튼 → SMT → Solve formula → 원하는 아이템 선택
  + 조건에 만족하는 값을 출력합니다.

**manual\_symbolize\_and\_solve\_crackme\_hash.gif**

![](/img/attachments/6324544/6324799.gif)

* <https://github.com/illera88/Ponce#use-symbolic-execution-to-solve-a-crackme>

### Negate and inject a condition

* <https://github.com/illera88/Ponce#negate-and-inject-a-condition>

### Using the tainting engine to track user controlled input

* <https://github.com/illera88/Ponce#using-the-tainting-engine-to-track-user-controlled-input>

### Use Negate, Inject & Restore

* <https://github.com/illera88/Ponce#use-negate-inject--restore>

## **Related Sites**

* <https://github.com/illera88/Ponce>