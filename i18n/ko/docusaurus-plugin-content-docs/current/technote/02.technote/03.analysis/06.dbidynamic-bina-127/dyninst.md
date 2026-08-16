---
title: "Dyninst"
sidebar_position: 1
---


## **Dyninst**

* **DynInst는 런타임 코드 패칭 라이브러리로서 동적 프로그램 분석 조사 툴을 개발하고 컴파일된 실행 파일에 적용할 때 유용하다.**
* ****DynInst는** 프로그램이 실행되는 동안 프로그램을 변경 할 수 있습니다.**
  + 프로그램 분석을 위해 컴파일, 링크 및 프로그램을 다시 실행하여 바이너리를 변경하지 않아도됩니다.
* **Dyninst는 실행중인 프로그램에 코드를 삽입 할 수 있는 API를 만들어 제공합니다.**
  + 런타임 코드 패치를 사용하는 도구 및 응용 프로그램을 만들 수 있는 시스템 독립적인 인터페이스를 제공합니다.
* **Dyninst는 다음과 같은 기능을 지원합니다.**
  + Performance Measurement Tools
  + Correctness Debuggers (efficient data breakpoints)
  + Execution drive simulations
  + Computational Steering

### Dyninst tools

* <http://www.dyninst.org/related/external_tools>

### **Download**

* <http://www.dyninst.org/downloads>
* <https://github.com/dyninst/dyninst>

### **Install**

```bash title="Install Dyninst"
git clone https://github.com/dyninst/dyninst.git
cd dyninst
cmake .
make 
make install
```

:::note[Install]
* <https://github.com/dyninst/dyninst/blob/master/INSTALL>
:::

### **Guide**

* <http://www.dyninst.org/sites/default/files/manuals/dyninst/dyninstAPI.pdf>

## **Example**

* 각 API폴더 안에 Doc 폴더가 존재하며, 해당 폴더에 관련 API에 대한 설명 문서와 Example이 존재합니다.
* Dyninst Example : <http://www.dyninst.org/dyninstexample>