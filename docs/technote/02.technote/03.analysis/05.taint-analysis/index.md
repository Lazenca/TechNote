---
title: "05.Taint analysis"
sidebar_position: 1
slug: /category/05taint-analysis
---

# **Taint analysis**

* **Taint Analysis는 프로그램에서 사용자 입력 값으로 인해 어떤 레지스터와 메모리 영역이 제어 가능한지 확인하는 기법입니다.**  
  + Taint Analysis는 메모리 성능 확인, 보안 테스트, 등의 목적으로 사용됩니다.
    - 시스템 에뮬레이터를 이용하면 운영체제의 동작 분석 가능합니다.
  + Taint Analysis tool은 C, C++, Java,등 대부분의 프로그래밍 언어지원 합니다.
    - 프로그램의 소스 코드가 없어 분석 가능합니다.

## **How does Taint Analysis work**

### **Dynamic analysis**

* **동적 분석을 위해 기본적으로 환경 및 시스템 호출과 같은 모든 사용자 입력을 수정해야 합니다.**
  + 이러한 동작을 위해 DBI(dynamic binary instrumentation framework)가 필요합니다.
  + DBI를 이용해 각 명령어의 전,후에 핸들러를 추가하며, 핸들러가 호출되면 명령어, 메모리에 대한 모든 정보를 얻을 수 있습니다.
    - 이러한 이유로 동적 분석은 모든 코드 영역들을 확인할 수 없지만 결과의 신뢰도가 높습니다.
* **구문을 분석의 편의와 피연산자를 식별하기 위해 중간표현(Intermediate Representation)으로 변경 후 해석이 필요합니다.**
  + Valgrind는 IR(Vex)을 사용하는 일반적인 계측 프레임워크(instrumentation framework)입니다.
  + IR을 사용하면 각 변수는 SSA 기반 형식으로 되어있어 Taint 분석과 메모리 관리가 쉬워집니다.
* **아래는 VEX와 SSA 형태의 예제 입니다.**

```c title=""add eax, ebx" 코드의 Vex 표현"
t3 = GET:I32(0) # get %eax, a 32-bit integer (t3 = eax)
t2 = GET:I32(12) # get %ebx, a 32-bit integer (t2 = ebx)
t1 = Add32(t3,t2) # eger (t2 = ebx)
PUT(0) = t1 put %eax (eax = t1)
```

### **Static analysis**

* **정적 분석은 코드를 파싱해서 제어 흐름 그래프로 모든 분기들을 확인합니다.**
* **정적 분석은 동적 분석보다 더 많은 코드 범위를 제공한다는 장점이 있습니다.**
  + 하지만 정적 분석은 레지스터와 메모리 값을 검색 할 수 없기 때문에 동적 분석보다 결과의 신뢰도가 낮습니다.

:::note[Static analysis]

![](/attachments/6324546/6324785.jpg)

:::

## **Related site**

* <https://www.slideshare.net/embarbosa/taint-analysis>
* <http://shell-storm.org/blog/Taint-analysis-and-pattern-matching-with-Pin/#1.2.1>
* <http://shell-storm.org/talks/SSTIC2015_English_slide_detailed_version_Triton_Concolic_Execution_FrameWork_FSaudel_JSalwan.pdf>

