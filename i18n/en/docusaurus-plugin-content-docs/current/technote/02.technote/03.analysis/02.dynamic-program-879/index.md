---
title: "02.Dynamic program analysis"
sidebar_position: 1
slug: /category/02dynamic-program-analysis
---


## **Dynamic program analysis**

* **Dynamic program analysis analyzes computer software by executing the program on a real or virtual processor.**
* **For dynamic program analysis to be effective, the target program must be executed with sufficient test inputs to trigger interesting behaviors.**
  + Software testing metrics such as code coverage ensure that a sufficient portion of program behavior is observed.
  + Care must be taken to minimize the impact that instrumentation has on the execution (including temporal properties) of the target program.
  + Inadequate testing can lead to critical failures caused by unobserved runtime errors.
* **There are two primary instrumentation techniques used in dynamic program analysis:**
  + Static binary instrumentation rewrites object code or executable binaries before the program is executed.
  + Dynamic binary instrumentation operates at runtime.
    - Analysis code can be injected via a runtime client embedded in the process or by an external process.
    - If the target uses dynamic linking, analysis code must typically be hooked after the dynamic linker finishes its initialization.
* **Dynamic program analysis is used across various testing phases:**
  + Unit tests
  + Integration tests
  + System tests
  + Acceptance tests

:::note[Analysis Code]
* Analysis code can be inserted inline, and can also include external routines called by the inline analysis stubs.
* Analysis code executes as part of the normal program flow, performing background tasks like profiling performance or identifying bugs, aside from causing runtime slowdown.
* Analysis code typically maintains analysis state known as metadata.
  + This metadata is critically important and represents the core of dynamic analysis.
:::

## **Dynamic program analysis Tools**

* **The following are dynamic analysis tools:**
  + In addition to these, various other dynamic analysis tools exist.

## **Related site**

* <https://en.wikipedia.org/wiki/Dynamic_program_analysis>
