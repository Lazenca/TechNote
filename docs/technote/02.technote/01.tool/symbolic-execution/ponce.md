---
title: "Ponce"
sidebar_position: 1
---


# **Ponce**

## **Description**

* **Ponce is an IDA Pro plugin that enables taint analysis and symbolic execution.**
  + Ponce is written in C/C++.
  + Ponce supports Windows, Linux, and macOS.
  + Ponce supports both Tainting engine and Symbolic engine modes.
    - Snapshot functionality is also supported.
  + Ponce relies on the Triton framework.

## **Install**

* You can download pre-built plugins for each operating system from the following GitHub repository:
  + <https://github.com/illera88/Ponce/tree/master/latest_builds>
* Copy the downloaded plugin files into the IDA Pro "plugins\" directory to complete installation.

## **Example**

* **The examples below are provided by the Ponce project.**
  + Since duplicating official documentation is unnecessary, detailed explanations are omitted here.
  + You can find full details on the official project page linked above.
  + In addition to the examples listed below, there are various other examples on GitHub, which are highly recommended reading.
* <https://github.com/illera88/Ponce>

### Use symbolic execution to solve a crackMe

* **You can perform symbolic execution following these steps:**
  + Select Symbolic engine in Ponce's Show Config (Ctrl + Shift + P).
  + Set a breakpoint immediately after user input is received.
  + Run the program.
  + Enter input when prompted.
  + Select the memory region containing the input to analyze and register it via Symbolize Memory.
    - Select memory region → Right click → Symbolic → Symbolize Memory
  + Resume execution of the program.
  + Inspect symbolic conditions and solve for the required values to steer branch execution using SMT.
    - Select branch instruction → Right click → SMT → Solve formula → Select desired target
  + Retrieve the satisfying solution values.

**manual\_symbolize\_and\_solve\_crackme\_hash.gif**

![](/img/attachments/6324544/6324799.gif)

* <https://github.com/illera88/Ponce#use-symbolic-execution-to-solve-a-crackme>

### Negate and inject a condition

* <https://github.com/illera88/Ponce#negate-and-inject-a-condition>

### Using the tainting engine to track user controlled input

* <https://github.com/illera88/Ponce#using-the-tainting-engine-to-track-user-controlled-input>

### Use Negate, Inject & Restore

* <https://github.com/illera88/Ponce#use-negate-inject--restore>

## **Related Sites**

* <https://github.com/illera88/Ponce>
