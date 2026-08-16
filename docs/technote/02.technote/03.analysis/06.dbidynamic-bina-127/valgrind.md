---
title: "Valgrind"
sidebar_position: 1
---


## **Valgrind**

* **Valgrind is an instrumentation framework for building dynamic analysis tools.**
  + Valgrind can automatically detect numerous memory management and threading bugs, and profile programs in detail.
  + You can also use Valgrind to develop new custom dynamic analysis tools.
* **Because Valgrind uses Dynamic Binary Instrumentation (DBI), target applications do not need to be modified, recompiled, or relinked.**
  + Simply prefixing your command with `valgrind` runs the target under instrumentation.
* **Valgrind can analyze programs written in C, C++, Java, Perl, Python, Assembly, Fortran, Ada, and many other languages.**
  + Valgrind tools are primarily optimized for C and C++ programs.
* **The Valgrind distribution includes 6 production-grade tools:**
  + Memory error detector (Memcheck)
  + Two thread error detectors (Helgrind, DRD)
  + Cache and branch-prediction profiler (Cachegrind)
  + Call-graph generating cache profiler (Callgrind)
  + Heap profiler (Massif)
* **Valgrind also includes experimental tools:**
  + Stack and global array overrun detector (SGCheck)
  + Second heap profiler examining block usage (DHAT)
  + SimPoint basic block vector generator (BBV)
* **Valgrind runs across multiple platforms and architectures:**
  + X86/Linux, AMD64/Linux, ARM/Linux, ARM64/Linux, PPC32/Linux, PPC64/Linux, PPC64LE/Linux, S390X/Linux, MIPS32/Linux, MIPS64/Linux, X86/Solaris, AMD64/Solaris, ARM/Android (2.3.x and later), ARM64/Android, X86/Android (4.0 and later), MIPS32/Android, X86/Darwin, and AMD64/Darwin (macOS).

### Valgrind Tools

#### **Memcheck**

* [Valgrind - Memcheck](/technote/technote/analysis/dynamic-program-879/valgrind-memcheck)

#### **SGCheck**

* **SGCheck is a tool for identifying stack and global array overruns.**
* **SGCheck operates using heuristic approaches derived from observed patterns of stack and global array accesses.**

#### **flayer**

* <https://github.com/Grindland/flayer/tree/master/valgrind-flayer>

:::note
* <http://valgrind.org/info/tools.html>
:::

### Download

* <http://valgrind.org/downloads/>

### Install

```bash
wget ftp://sourceware.org/pub/valgrind/valgrind-3.13.0.tar.bz2
tar -xvf valgrind-3.13.0.tar.bz2
cd valgrind-3.13.0
./configure
make
make install
```

### Guide

* <http://valgrind.org/docs/manual/quick-start.html#quick-start.intro>
* <http://valgrind.org/docs/manual/manual.html>

## **Examples**

* When downloading the source distribution, full tool implementations are included in their respective subdirectories:
  + Memcheck: <http://valgrind.org/docs/manual/mc-manual.html>
  + DHAT: <http://valgrind.org/docs/manual/dh-manual.html>
  + SGCheck: <http://valgrind.org/docs/manual/sg-manual.html>
  + Wrapping Example: <http://valgrind.org/docs/manual/manual-core-adv.html#manual-core-adv.wrapping.example>
