---
title: "PIN"
sidebar_position: 1
---


## **Pin**

* **Pin은 원래 컴퓨터 아키텍처 분석을 위한 도구로 개발 되었으나, 현재 보안, 에뮬레이션, 병렬 프로그램 분석을 위한 다양한 도구들이 만들어 졌습니다.**
  + Pin을 이용해 만든 도구는 Linux, Windows 및 OS X의 응용 프로그램을 분석하는 데 사용 할 수 있습니다.
  + Pin은 IA-32, x86-64, MIC 아키텍처에서 동적 프로그램 분석 도구를 만들 수 있는 DBI(dynamic binary instrumentation) 프레임 워크 입니다.
* **Pin은 Instrumentation 도구로서 컴파일 된 바이너리 파일에서 런타임에 계측 수행이 가능합니다.**
  + 소스코드를 다시 컴파일 할 필요가 없으며, 동적으로 코드를 생성하는 프로그램을 실행할 수 있습니다.
* **Pin은 기본 명령 집합 추상화와 레지스터 내용과 같은 컨텍스트 정보를 injected code에 매개 변수로 전달 할 수 있는 풍부한 API를 제공합니다.**
* **Pin은 삽입된 코드에 덮어 쓰여진 레지스터를 자동으로 저장하고 복원하므로 응용 프로그램이 계속 작동하게 됩니다.**
  + Symbol, 디버그 정보에 대한 제한 된 접근도 가능합니다.

### Download

* <https://software.intel.com/en-us/articles/pin-a-binary-instrumentation-tool-downloads>

### Install

```bash title="Linux"
$ tar zxf pin-3.2-81205-gcc-linux.tar.gz
$ cd pin-3.2-81205-gcc-linux
```

```bash title="Windows"
$ cd  pin-3.2-81205-msvc-windows
```

:::note
* <https://software.intel.com/sites/landingpage/pintool/docs/97503/Pin/html/index.html#INSTALLATION>
:::

### **Guide**

* <https://software.intel.com/en-us/articles/pin-a-dynamic-binary-instrumentation-tool#GettingStarted>

## **Example**

* 소스코드 폴더의 "/Source/tools/" 경로에 Pin을 이용해 개발한 tool의 소스코드가 있습니다.
* Example : <https://software.intel.com/sites/landingpage/pintool/docs/97503/Pin/html/index.html#EXAMPLES>