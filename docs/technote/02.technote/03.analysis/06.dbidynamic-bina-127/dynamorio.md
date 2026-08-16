---
title: "DynamoRIO"
sidebar_position: 1
---


## **DynamoRIO**

* **DynamoRIO는 실행되는 동안 프로그램의 모든 부분에서 코드 변환을 지원하는 런타임 코드 조작 시스템입니다.**
* **DynamoRIO는 프로그램 분석 및 이해, 프로파일링, 계측, 최적화, 변환 등의 다양한 용도로 동적 도구를 작성하기위한 인터페이스를 지원합니다.**
* **DynamoRIO는 많은 동적 도구 시스템과 달리 콜 아웃(callouts), 트램폴린(trampolines) 삽입에 제한되지 않습니다.**
* **DynamoRIO는 강력한 IA-32, AMD64, ARM 명령어 조작 라이브러리를 이용해 응용프로그램 명령어들을 임의로 수정 할 수 있습니다.**
* **DynamoRIO는 다음과 같은 운영체제와 환경을 지원합니다.**
  + Windows, Linux, Android
  + IA-32, AMD64, ARM, AArch64

### **DynamoRIO Tools**

* **아래 도구들은 DynamoRIO를 기반으로 개발되었습니다.**  
  + 메모리 디버깅 [Dr. Memory](http://drmemory.org/)
  + 다중 프로세스 온라인 캐시 시뮬레이터 [drcachesim](http://dynamorio.org/docs/page_drcachesim.html)
  + legacy processor emulator [drcpusim](http://dynamorio.org/docs/page_drcpusim.html)
  + 윈도우용 strace [drstrace](http://drmemory.org/strace_for_windows.html)
  + Code coverage tool [drcov](http://dynamorio.org/docs/page_drcov.html)
  + 라이브러리 추적 [drltrace](http://dynamorio.org/docs/page_drltrace.html)
  + 메모리 추적 [memtrace](https://github.com/DynamoRIO/dynamorio/blob/master/api/samples/memtrace.c)
  + 기본 블록 추적 [bbbuf](https://github.com/DynamoRIO/dynamorio/blob/master/api/samples/bbbuf.c)
  + 명령 카운트 [inscount](https://github.com/DynamoRIO/dynamorio/blob/master/api/samples/inscount.cpp)
  + 동적 퍼징 테스트 [Dr. Fuzz](http://drmemory.org/docs/page_drfuzz.html)

### **Download**

* <https://github.com/DynamoRIO/dynamorio/wiki/Downloads>

### **Install**

```
sudo apt-get install cmake g++ g++-multilib doxygen transfig imagemagick ghostscript git
git clone https://github.com/DynamoRIO/dynamorio.git
cd dynamorio && mkdir build && cd build
cmake ..
make -j
./bin64/drrun echo hello world
hello world
```

* <https://github.com/DynamoRIO/dynamorio/wiki/How-To-Build>

### **Guide**

* <http://dynamorio.org/docs/>

### **Sample**

* DynamoRIO에서 제공하는 Sample 파일들은 다운로드된 코드안에 "Sample"폴더에 존재합니다.
* 각 샘플에 대한 설명 내용 : <http://dynamorio.org/docs/API_samples.html#sample_list>