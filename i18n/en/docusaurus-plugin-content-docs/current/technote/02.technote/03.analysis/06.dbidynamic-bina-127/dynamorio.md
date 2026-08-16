---
title: "DynamoRIO"
sidebar_position: 1
---


## **DynamoRIO**

* **DynamoRIO is a runtime code manipulation system that supports arbitrary code transformations on any part of a program while it executes.**
* **DynamoRIO provides an interface for authoring dynamic tools for profiling, instrumentation, optimization, translation, and security sandboxing.**
* **Unlike many dynamic instrumentation systems, DynamoRIO is not limited to inserting simple callouts and trampolines.**
* **DynamoRIO allows arbitrary modification of application instructions using a powerful IA-32, AMD64, and ARM instruction manipulation library.**
* **DynamoRIO supports the following operating systems and hardware architectures:**
  + Windows, Linux, Android
  + IA-32, AMD64, ARM, AArch64

### **DynamoRIO Tools**

* **The following tools have been developed on top of DynamoRIO:**
  + Memory debugging: [Dr. Memory](http://drmemory.org/)
  + Multi-process online cache simulator: [drcachesim](http://dynamorio.org/docs/page_drcachesim.html)
  + Legacy processor emulator: [drcpusim](http://dynamorio.org/docs/page_drcpusim.html)
  + Strace for Windows: [drstrace](http://drmemory.org/strace_for_windows.html)
  + Code coverage tool: [drcov](http://dynamorio.org/docs/page_drcov.html)
  + Library call tracer: [drltrace](http://dynamorio.org/docs/page_drltrace.html)
  + Memory tracer: [memtrace](https://github.com/DynamoRIO/dynamorio/blob/master/api/samples/memtrace.c)
  + Basic block buffer tracer: [bbbuf](https://github.com/DynamoRIO/dynamorio/blob/master/api/samples/bbbuf.c)
  + Instruction counter: [inscount](https://github.com/DynamoRIO/dynamorio/blob/master/api/samples/inscount.cpp)
  + Dynamic fuzzing: [Dr. Fuzz](http://drmemory.org/docs/page_drfuzz.html)

### **Download**

* <https://github.com/DynamoRIO/dynamorio/wiki/Downloads>

### **Install**

```bash
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

### **Samples**

* Sample tools provided with DynamoRIO are located in the `samples` directory within the cloned repository.
* Sample descriptions and API documentation: <http://dynamorio.org/docs/API_samples.html#sample_list>
