---
title: "05.Taint analysis"
sidebar_position: 1
slug: /category/05taint-analysis
---

# **Taint analysis**

* **Taint Analysis is a technique that determines which registers and memory locations can be influenced or controlled by user-supplied inputs.**
  + Taint analysis is used for memory performance profiling, vulnerability discovery, and software security auditing.
    - Whole-system emulators enable taint analysis across entire operating system operations.
  + Taint analysis tools support most programming languages such as C, C++, and Java.
    - Binary-level taint analysis can be performed even when source code is unavailable.

## **How Taint Analysis Works**

### **Dynamic analysis**

* **For dynamic taint analysis, all external inputs—such as environment variables and system call returns—must be tracked (tainted).**
  + A Dynamic Binary Instrumentation (DBI) framework is typically required.
  + DBI inserts hooks/handlers before and after each instruction; when invoked, these handlers inspect instructions and operand memory in detail.
    - While dynamic analysis only covers executed paths, its results are highly accurate and reliable.
* **To facilitate parsing and operand tracking, machine instructions are often lifted into an Intermediate Representation (IR).**
  + Valgrind is a widely used instrumentation framework utilizing VEX IR.
  + Using IR with Static Single Assignment (SSA) form greatly simplifies taint propagation logic and state management.
* **Below is an example of VEX IR and SSA representation:**

```c title="VEX IR representation of 'add eax, ebx'"
t3 = GET:I32(0) # get %eax, a 32-bit integer (t3 = eax)
t2 = GET:I32(12) # get %ebx, a 32-bit integer (t2 = ebx)
t1 = Add32(t3,t2) # add (t1 = t3 + t2)
PUT(0) = t1 # put %eax (eax = t1)
```

### **Static analysis**

* **Static analysis parses code and analyzes control-flow graphs (CFGs) to inspect potential data flows across branches.**
* **Static analysis has the advantage of providing broader code coverage compared to dynamic analysis.**
  + However, because static analysis cannot determine concrete runtime values in registers and memory, it may yield higher false-positive rates than dynamic analysis.

:::note[Static analysis]

![](/attachments/6324546/6324785.jpg)

:::

## **Related site**

* <https://www.slideshare.net/embarbosa/taint-analysis>
* <http://shell-storm.org/blog/Taint-analysis-and-pattern-matching-with-Pin/#1.2.1>
* <http://shell-storm.org/talks/SSTIC2015_English_slide_detailed_version_Triton_Concolic_Execution_FrameWork_FSaudel_JSalwan.pdf>
