---
title: "06.DBI(Dynamic Binary Instrumentation)"
sidebar_position: 1
slug: /category/06dbidynamic-binary-instrumentation
---


## **DBI(Dynamic Binary Instrumentation)**

* **동적 바이너리 계측(DBI)은 런타임에 실행 코드를 삽입하여 바이너리 응용 프로그램의 동작을 분석하는 방법입니다.**
* **동적 바이너리 계측(DBI) 프레임워크는 새로운 DBA 도구를 손쉽게 구축할 수 있도록 지원합니다.**
* **동적 바이너리 계측(DBI)은 다음과 같은 장점이 있습니다.**
  + 일반적으로 클라이언트 프로그램을 어떤 방식으로든 준비 할 필요가 없으므로 사용가에제 매우 편리합니다.
  + 모든 클라이언트 코드를 자연스럽게 다룹니다.
    - 코드와 데이터가 섞이거나 다른 모듈을 사용하면 정적으로 모든 코드를 계측하는 것이 어려울 수 있으며 클라이언트가 동적으로 생성된 코드를 사용하면 불가능 합니다.
    - 모든 코드를 계측 할 수 있는 이 기능은 라이브러리를 정확하고 완전하게 처리하는 데 중요합니다.
* **동적 바이너리 계측(DBI)은 다음과 같은 단점이 있습니다.**
  + 런타임시 계측 비용이 발생 합니다.
  + 구현하기가 어려울 수 있습니다. 런타임에 실행 코드를 다시 작성하는 것은 쉽지 않습니다.
  + 그럼에도 불구하고 최근 몇년간 이러한 문제는 DBI 프레임워크에 의해 주로 극복되었으며, 이는 런타임 오버 헤드를 최소화하기 위해 신중하게 최적화되었으며, 새로운 DBA 도구를 탑재할 수 있습니다.

### **DBI Frameworks**
:::note
* DBI Frameworks는 아래 Frameworks 중에서 본인의 환경, 사양과 취향에 맞는 Frameworks를 선택해 많이 사용해 보아야 합니다.
* 각 DBI Frameworks에서 제공되는 Example, Tools 코드들을 이용해 접근하는게 좋습니다.
:::

## **Related url**

* DynamoRIO : <http://dynamorio.org/docs/>
* Dyninst : [http://www.dyninst.org/](http://www.dyninst.org/downloads)
* Valgrind : [http://valgrind.org/](http://valgrind.org/docs/phd2004.pdf)
* PIN : <https://software.intel.com/en-us/articles/pin-a-dynamic-binary-instrumentation-tool>
* <http://uninformed.org/index.cgi?v=7&a=1&p=3>
* <http://valgrind.org/docs/phd2004.pdf>