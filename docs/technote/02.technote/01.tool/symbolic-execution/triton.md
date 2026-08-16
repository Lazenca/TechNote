---
title: "Triton"
sidebar_position: 1
---


# **Triton**

## **Description**

* **Triton is a Pin-based concolic execution framework.**
* **Triton provides the following components:**
  + Based on these components, you can build automated reverse engineering and vulnerability research tools:
    - Taint engine
    - Dynamic symbolic execution engine
    - Snapshot engine
    - Translation of x86/x64 instructions to SMT2-LIB IR
    - Z3 interface
    - Python bindings
* **Triton enables the following tasks:**
  + Debugging
  + Concrete execution and analysis
  + Symbolic execution
  + Symbolic fuzzing sessions
  + Path constraint generation and solving
  + Code coverage collection
  + Real-time register and memory modification
  + And many other analysis tasks.

:::note[SMT2-LIB]
* <http://smtlib.cs.uiowa.edu/>
:::

## **Install**

* **Triton supports Linux, macOS, Windows, and more.**
* **Before installing Triton, the following libraries must be installed:**

| lib | Version | Site |
| --- | --- | --- |
| libboost-all-dev | 1.55 or higher | <http://www.boost.org/> |
| libpython | 2.7.x | <https://www.python.org/> |
| libz3-dev | 4.4.1 or higher | <https://github.com/Z3Prover/z3> |
| libcapstone-dev | 3.0 or higher | <http://www.capstone-engine.org/> |
| Pin | Version 71313 only | <https://software.intel.com/en-us/articles/pin-a-binary-instrumentation-tool-downloads> |

* **You can install Triton as follows:**

```bash title="Install Triton - Ubuntu 16.04(64bit)"
lazenca0x0@ubuntu:~/Documents/triton$ wget http://software.intel.com/sites/landingpage/pintool/downloads/pin-2.14-71313-gcc.4.4.7-linux.tar.gz
lazenca0x0@ubuntu:~/Documents/triton$ tar zxf pin-2.14-71313-gcc.4.4.7-linux.tar.gz
lazenca0x0@ubuntu:~/Documents/triton$ cd pin-2.14-71313-gcc.4.4.7-linux/source/tools
lazenca0x0@ubuntu:~/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools$ git clone https://github.com/JonathanSalwan/Triton.git
lazenca0x0@ubuntu:~/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools$ cd Triton
lazenca0x0@ubuntu:~/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools/Triton$ mkdir build
lazenca0x0@ubuntu:~/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools/Triton$ cd build
lazenca0x0@ubuntu:~/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools/Triton/build$ sudo apt-get update
lazenca0x0@ubuntu:~/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools/Triton/build$ sudo apt-get install libcapstone-dev libboost-all-dev libz3-dev
lazenca0x0@ubuntu:~/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools/Triton/build$ cmake -DPINTOOL=on ..
-- The C compiler identification is GNU 5.4.0
-- The CXX compiler identification is GNU 5.4.0
-- Check for working C compiler: /usr/bin/cc
-- Check for working C compiler: /usr/bin/cc -- works
-- Detecting C compiler ABI info
-- Detecting C compiler ABI info - done
-- Detecting C compile features
-- Detecting C compile features - done
-- Check for working CXX compiler: /usr/bin/c++
-- Check for working CXX compiler: /usr/bin/c++ -- works
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Detecting CXX compile features
-- Detecting CXX compile features - done
-- Found PythonInterp: /usr/bin/python2.7 (found suitable version "2.7.12", minimum required is "2.7") 
-- Found PythonLibs: /usr/lib/x86_64-linux-gnu/libpython2.7.so (found suitable version "2.7.12", minimum required is "2.7") 
-- Found Z3 
-- Found CAPSTONE 
-- Boost version: 1.58.0
-- Configuring done
-- Generating done
-- Build files have been written to: /home/lazenca0x0/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools/Triton/build
lazenca0x0@ubuntu:~/Documents/triton/Triton/build$ make
...
[100%] Built target taint_reg
lazenca0x0@ubuntu:~/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools/Triton/build$
```

:::note[Install Triton]
<https://triton.quarkslab.com/documentation/doxygen/index.html#install_sec>
:::

## **Example**

* **The examples below are provided by Triton.**
  + Detailed duplicate explanations are omitted here.
  + Detailed information is available on the project documentation page linked above.
  + In addition to the examples listed below, there are various other examples on GitHub, which are highly recommended reading.

:::note[Github]
* <https://github.com/JonathanSalwan/Triton/tree/f16847f439bc959c66fb923144a60c41df106edc/src/examples>
:::

### **Tracer**

* **This API utilizes Pintool.**
* **This API allows implementing the following features:**
  + Display IR
  + Runtime Memory Tainting
  + Runtime Register Modification
  + Blacklist images
  + Callback on image
  + Callback on routine
  + Callback on signals
  + Callback on syscalls

:::note
* <https://triton.quarkslab.com/documentation/doxygen/Tracer_page.html>
:::

#### **Example - callback\_syscall.py**

* **This example runs the target binary ("crackme_xor") and extracts the invoked syscall numbers to check if the write syscall is called.**
  + When the write syscall is called, it prints the argument values passed to the function.

```python title="callback_syscall.py"
from triton  import *
from pintool import *
def my_callback_syscall_entry(threadId, std):
    if getSyscallNumber(std) == SYSCALL.WRITE:
        arg0 = getSyscallArgument(std, 0)
        arg1 = getSyscallArgument(std, 1)
        arg2 = getSyscallArgument(std, 2)
        print 'sys_write(%x, %x, %x)' %(arg0, arg1, arg2)

if __name__ == '__main__':

    # Set the architecture
    setArchitecture(ARCH.X86_64)

    # Start the symbolic analysis from the Entry point
    startAnalysisFromEntry()

    insertCall(my_callback_syscall_entry, INSERT_POINT.SYSCALL_ENTRY)

    # Run the instrumentation - Never returns
    runProgram()
```

```bash title="Execution result"
lazenca0x0@ubuntu:~/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools/Triton$ ./build/triton ./src/examples/pin/callback_syscall.py  ./src/samples/crackmes/crackme_xor a
sys_write(1, 1e08010, 5)
fail
lazenca0x0@ubuntu:~/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools/Triton$
```

#### **Example - sym\_only\_on\_tainted.py**

* **This example performs the following operations:**
  + Performs taint-only analysis on the check() function in crackme_xor.
  + The target of analysis is the RAX register used at code address "0x400574".
  + Prints the symbolic expressions identified during analysis.

```python title="sym_only_on_tainted.py"
#!/usr/bin/env python2
## -*- coding: utf-8 -*-
## $ ./build/triton ./src/examples/pin/sym_only_on_tainted.py ./src/samples/crackmes/crackme_xor a
##
import sys

from pintool import *
from triton  import *

def cb_ir(inst):
    if inst.getAddresss() == 0x400574:
        rax = getCurrentRegisterValue(REG.RAX)
        taintMemory(rax)
    return

def cb_before(inst):
    print inst
    for expr in inst.getSymbolicExpressions():
        print '\t', expr
    return

if __name__ == '__main__':
    # Set arch
    setArchitecture(ARCH.X86_64)

    # Start JIT at the entry point
    startAnalysisFromSymbol('check')

    # Perform symbolic execution only on tainted instructions
    enableMode(MODE.ONLY_ON_TAINTED, True)

    # Add callback
    insertCall(cb_ir,       INSERT_POINT.BEFORE_SYMPROC)
    insertCall(cb_before,   INSERT_POINT.BEFORE)

    # Run Program
    runProgram()
```

```bash title="Execution result"
lazenca0x0@ubuntu:~/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools/Triton$ ./build/triton ./src/examples/pin/sym_only_on_tainted.py ./src/samples/crackmes/crackme_xor a
0x400556: push rbp
0x400557: mov rbp, rsp
0x40055a: mov qword ptr [rbp - 0x18], rdi
0x40055e: mov dword ptr [rbp - 4], 0
0x400565: jmp 0x4005a6
0x4005a6: cmp dword ptr [rbp - 4], 4
0x4005aa: jle 0x400567
0x400567: mov eax, dword ptr [rbp - 4]
0x40056a: movsxd rdx, eax
0x40056d: mov rax, qword ptr [rbp - 0x18]
0x400571: add rax, rdx
0x400574: movzx eax, byte ptr [rax]
	ref!53 = ((_ zero_extend 32) ((_ zero_extend 24) ((_ extract 7 0) (_ bv97 8)))) ; MOVZX operation
	ref!54 = ((_ zero_extend 0) (_ bv4195703 64)) ; Program Counter
0x400577: movsx eax, al
	ref!55 = ((_ zero_extend 32) ((_ sign_extend 24) ((_ extract 7 0) ref!53))) ; MOVSX operation
	ref!56 = ((_ zero_extend 0) (_ bv4195706 64)) ; Program Counter
0x40057a: sub eax, 1
	ref!57 = ((_ zero_extend 32) (bvsub ((_ extract 31 0) ref!55) (_ bv1 32))) ; SUB operation
	ref!58 = (ite (= (_ bv16 32) (bvand (_ bv16 32) (bvxor ((_ extract 31 0) ref!57) (bvxor ((_ extract 31 0) ref!55) (_ bv1 32))))) (_ bv1 1) (_ bv0 1)) ; Adjust flag
	ref!59 = ((_ extract 31 31) (bvxor (bvxor ((_ extract 31 0) ref!55) (bvxor (_ bv1 32) ((_ extract 31 0) ref!57))) (bvand (bvxor ((_ extract 31 0) ref!55) ((_ extract 31 0) ref!57)) (bvxor ((_ extract 31 0) ref!55) (_ bv1 32))))) ; Carry flag
	ref!60 = ((_ extract 31 31) (bvand (bvxor ((_ extract 31 0) ref!55) (_ bv1 32)) (bvxor ((_ extract 31 0) ref!55) ((_ extract 31 0) ref!57)))) ; Overflow flag
	ref!61 = (bvxor (bvxor (bvxor (bvxor (bvxor (bvxor (bvxor (bvxor (_ bv1 1) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!57) (_ bv0 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!57) (_ bv1 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!57) (_ bv2 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!57) (_ bv3 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!57) (_ bv4 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!57) (_ bv5 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!57) (_ bv6 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!57) (_ bv7 8)))) ; Parity flag
	ref!62 = ((_ extract 31 31) ref!57) ; Sign flag
	ref!63 = (ite (= ((_ extract 31 0) ref!57) (_ bv0 32)) (_ bv1 1) (_ bv0 1)) ; Zero flag
	ref!64 = ((_ zero_extend 0) (_ bv4195709 64)) ; Program Counter
0x40057d: xor eax, 0x55
	ref!65 = ((_ zero_extend 32) (bvxor ((_ extract 31 0) ref!57) (_ bv85 32))) ; XOR operation
	ref!66 = (_ bv0 1) ; Clears carry flag
	ref!67 = (_ bv0 1) ; Clears overflow flag
	ref!68 = (bvxor (bvxor (bvxor (bvxor (bvxor (bvxor (bvxor (bvxor (_ bv1 1) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!65) (_ bv0 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!65) (_ bv1 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!65) (_ bv2 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!65) (_ bv3 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!65) (_ bv4 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!65) (_ bv5 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!65) (_ bv6 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!65) (_ bv7 8)))) ; Parity flag
	ref!69 = ((_ extract 31 31) ref!65) ; Sign flag
	ref!70 = (ite (= ((_ extract 31 0) ref!65) (_ bv0 32)) (_ bv1 1) (_ bv0 1)) ; Zero flag
	ref!71 = ((_ zero_extend 0) (_ bv4195712 64)) ; Program Counter
0x400580: mov ecx, eax
	ref!72 = ((_ zero_extend 32) ((_ extract 31 0) ref!65)) ; MOV operation
	ref!73 = ((_ zero_extend 0) (_ bv4195714 64)) ; Program Counter
0x400582: mov rdx, qword ptr [rip + 0x200ab7]
0x400589: mov eax, dword ptr [rbp - 4]
0x40058c: cdqe
0x40058e: add rax, rdx
0x400591: movzx eax, byte ptr [rax]
0x400594: movsx eax, al
0x400597: cmp ecx, eax
	ref!92 = (bvsub ((_ extract 31 0) ref!72) ((_ sign_extend 0) (_ bv49 32))) ; CMP operation
	ref!93 = (ite (= (_ bv16 32) (bvand (_ bv16 32) (bvxor ((_ extract 31 0) ref!92) (bvxor ((_ extract 31 0) ref!72) ((_ sign_extend 0) (_ bv49 32)))))) (_ bv1 1) (_ bv0 1)) ; Adjust flag
	ref!94 = ((_ extract 31 31) (bvxor (bvxor ((_ extract 31 0) ref!72) (bvxor ((_ sign_extend 0) (_ bv49 32)) ((_ extract 31 0) ref!92))) (bvand (bvxor ((_ extract 31 0) ref!72) ((_ extract 31 0) ref!92)) (bvxor ((_ extract 31 0) ref!72) ((_ sign_extend 0) (_ bv49 32)))))) ; Carry flag
	ref!95 = ((_ extract 31 31) (bvand (bvxor ((_ extract 31 0) ref!72) ((_ sign_extend 0) (_ bv49 32))) (bvxor ((_ extract 31 0) ref!72) ((_ extract 31 0) ref!92)))) ; Overflow flag
	ref!96 = (bvxor (bvxor (bvxor (bvxor (bvxor (bvxor (bvxor (bvxor (_ bv1 1) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!92) (_ bv0 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!92) (_ bv1 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!92) (_ bv2 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!92) (_ bv3 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!92) (_ bv4 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!92) (_ bv5 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!92) (_ bv6 8)))) ((_ extract 0 0) (bvlshr ((_ extract 7 0) ref!92) (_ bv7 8)))) ; Parity flag
	ref!97 = ((_ extract 31 31) ref!92) ; Sign flag
	ref!98 = (ite (= ((_ extract 31 0) ref!92) (_ bv0 32)) (_ bv1 1) (_ bv0 1)) ; Zero flag
	ref!99 = ((_ zero_extend 0) (_ bv4195737 64)) ; Program Counter
0x400599: je 0x4005a2
	ref!100 = ((_ zero_extend 0) (ite (= ((_ extract 0 0) ref!98) (_ bv1 1)) (_ bv4195746 64) (_ bv4195739 64))) ; Program Counter
0x40059b: mov eax, 1
0x4005a0: jmp 0x4005b1
0x4005b1: pop rbp
fail
lazenca0x0@ubuntu:~/Documents/triton/pin-2.14-71313-gcc.4.4.7-linux/source/tools/Triton$
```

:::note
* <https://github.com/JonathanSalwan/Triton/blob/f16847f439bc959c66fb923144a60c41df106edc/src/examples/pin/sym_only_on_tainted.py>
:::

## **Related Sites**

* <https://triton.quarkslab.com/>
* <https://triton.quarkslab.com/blog/first-approach-with-the-framework/>
* <https://triton.quarkslab.com/documentation/doxygen/namespaces.html>
* <https://github.com/JonathanSalwan/Triton/tree/master/src/examples/python>
