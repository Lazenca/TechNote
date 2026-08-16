---
title: "02.Dynamic program analysis"
sidebar_position: 1
slug: /category/02dynamic-program-analysis
---


## **Dynamic program analysis**

* **동적 프로그램 분석(Dynamic program analysis)은 실제 또는 가상 프로세서에서 프로그램을 실행하여 컴퓨터 소프트웨어를 분석합니다.**
* **동적 프로그램 분석(Dynamic program analysis)이 효과적이기 위해서는 대상 프로그램이 흥미로운 동작을 일키기에 충분한 테스트 입력으로 실행되어야 합니다.**
  + 코드 범위와 같은 소프트웨어 테스팅 수단을 사용하면 프로그램 동작의 적절한 부분을 관찰 할 수 있습니다.
  + 계측이 대상 프로그램의 실행(일시적인 속성 포함)에 미치는 영향을 최소화하기 위해 주의를 기울여야 합니다.
  + 부적절한 테스트는 동적 실행 오류(런차임 오류)로 인해 치명적인 오류가 발생 할 수 있습니다.
* **동적 프로그램 분석(Dynamic program analysis)에 사용되는 두 가지 주요 계측 기법이 있습니다.**  
  + 정적 바이너리 계측기(Static binary instrumentation)는 프로그램이 실행되기 전에 object code, executable code를 재작성하는 단계에서 발생합니다.
  + 동적 바이너리 계측기(Dynamic binary instrumentation)는 런타임 단계에서 발생합니다.  
    - 분석 코드는 클라이언트 프로세스에 접목된 프로그램이나 외부 프로세스에 의해 주입 될 수 있습니다.
    - 클라이언트가 동적 링크 코드를 사용하는 경우 동적 링커가 작업을 완료 한 후에 분석 코드를 추가 해야 합니다.
* **아래와 같은 테스트에서 동적 프로그램 분석(Dynamic program analysis)을 사용합니다.**
  + - 단위 테스트(Unit tests)
    - 통합 테스트(Integration tests)
    - 시스템 테스트(System tests)
    - 합격 판정 시험(Acceptance tests)

:::note[분석 코드(Analysis code)]
* 분석 코드(Analysis code)는 인라인 방식으로 삽입될 수 있으며, 인라인 분석 코드에서 호출되는 외부 루틴도 포함 될 수 있습니다.
* 분석 코드(Analysis code)는 프로그램의 정상 실행 의 일부로 실행 되며, 속도가 느려지는 것을 제외하고는 성능을 측정하거나 버그를 식별하는 등의 작업을 측면에서 수행합니다.
* 분석 코드(Analysis code)는 메타 데이터라고 하는 일종의 분석 상태를 유지해야합니다.  
  + 메타 데이터는 적대적으로 중요하며 동적 분석의 핵심입니다.
:::

## **Dynamic program analysis Tools**

* **다음과 같은 정적 분석 도구들이 있습니다.**
  + 이외에도 다양한 정적 분석 도구들이 있습니다.

## **Related site**

* <https://en.wikipedia.org/wiki/Dynamic_program_analysis>

