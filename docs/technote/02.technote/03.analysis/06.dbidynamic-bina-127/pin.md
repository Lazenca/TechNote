---
title: "PIN"
sidebar_position: 1
---


## **Pin**

* **Intel Pin was originally developed for computer architecture analysis, but has since expanded to support tools for security auditing, emulation, and parallel software debugging.**
  + Tools developed with Pin can analyze applications across Linux, Windows, and macOS.
  + Pin is a Dynamic Binary Instrumentation (DBI) framework that supports authoring dynamic program analysis tools on IA-32, x86-64, and Intel MIC architectures.
* **As a runtime instrumentation tool, Pin instruments compiled binary executables at runtime without requiring source code or recompilation.**
  + It natively supports programs that dynamically generate code (such as JIT engines).
* **Pin provides a rich API that abstracts the underlying instruction set and allows runtime context (such as register and memory state) to be passed directly into injected analysis routines.**
* **Pin automatically handles register spilling and context saving/restoring to ensure application state remains unmodified and transparent.**
  + It also provides limited access to symbol and debugging information.

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

## **Examples**

* Source code for Pintools provided with the distribution is located under the `source/tools/` directory.
* Examples: <https://software.intel.com/sites/landingpage/pintool/docs/97503/Pin/html/index.html#EXAMPLES>
