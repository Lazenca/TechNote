---
title: "Wadi"
sidebar_position: 1
---


## **Wadi**

* **Wadi는 Windows 10에서 Microsoft Edge 브라우저용 Fuzz 입니다.**
* **Wadi는 디버거(Winappdbg)와 웹 서버(Python Twisted)로 구성되어 있습니다.**
  + 디버거는 Edge를 시작한 다음 "MicrosoftEdgeCP.exe", "RuntimeBroker.exe"및 "MicrosoftEdge.exe"에 연결하여 충돌을 모니터링합니다.
  + 웹 서버는 Google의 PyV8 엔진을 사용하여 제공된 테스트 케이스를 생성 한 다음 수신 된 요청에 대해 서비스를 제공합니다.
* **Wadi는 모듈 형태로 개발 되어 있으며, 각 기능을 별로도 사용할 수 있습니다.**
* **Wadi의 문법 파일은 분리되어 있으며, 테스트 케이스 생성 알고리즘을 Wadi와 분리하여 각 사용자가 자체 테스트 케이스를 제공 할 수 있도록합니다.**

### **Prerequisites**

* **Wadi를 사용하기 위해 다음과 같은 설정이 필요합니다.**
  + Python winappdbg by Mario Vilas "pip install winappdbg" - <http://winappdbg.sourceforge.net/Downloads.html>
  + Distorm disassembler. <https://distorm.googlecode.com/files/distorm3-3.win-amd64.exe> OR <https://github.com/gdabah/distorm>
  + Google Pyv8 Engine Windows. <https://code.google.com/p/pyv8/downloads/list>
  + Twisted "pip install twisted" - <https://pypi.python.org/pypi/Twisted>

### Run

```bash title="Run Wadi"
wadi.py [Grammar File] [PORT]
- The javascript Grammar file.
- Port for the web server to listen on.
```

### Running Wadi With NodeFuzz

* wadi-nodefuzz-module.js와 randoms.js를 NodeFuzz Modules 디렉토리에 추가하고 다음을 사용하여 호출하십시오.

```bash title="Run Wadi With NodeFuzz"
node nodefuzz.js -m ./Modules/wadi-nodefuzz-module.js -c [CONFIG]
```

## **Related site**

* <https://github.com/sensepost/wadi>