---
title: "angr"
sidebar_position: 1
---


# **angr**

## **Description**

* angr is a Python-based binary analysis framework.
* angr utilizes static and dynamic symbolic (concolic) analysis.
* angr performs analysis through the following process:
  + angr performs analysis by generating and executing IR of the target code using VEX IR and SimuVEX.
    - It translates the target binary code into IR using PyVEX (VEX IR).
    - The translated IR is executed and analyzed using SimuVEX.

:::note[Github]
* <https://github.com/angr/pyvex>
* <https://github.com/angr/simuvex>
:::

## **API**

| API | Description |
| --- | --- |
| **angr** | * **This API supports the following features:**   + Disassembly and intermediate representation (IR) lifting   + Program instrumentation   + Symbolic execution   + Control-flow analysis   + Data-dependency analysis   + Value-Set Analysis (VSA) |
| **claripy** | * Solver Engine   + Provides constraint solving capabilities.   + Usage is similar to Z3. |
| **cle** | * Binary Loader   + Loads and extracts library information used by the analyzed binary.   + Provides process memory abstraction. |
| **pyvex** | * Binary Translator   + Provides an interface to translate binary code into VEX Intermediate Representation (IR). |
| **archinfo** | * Arch Information Repository   + A collection of classes containing architecture-specific information. |

:::note[Github]
* <https://github.com/angr/angr>
* <https://github.com/angr/claripy>
* <https://github.com/angr/cle>
* <https://github.com/angr/pyvex>
* <https://github.com/angr/archinfo>
:::

## **Install**

```bash title="Install angr"
lazenca0x0@ubuntu:~$ sudo apt-get install python-dev libffi-dev build-essential virtualenvwrapper

... omitted ...

(angr) lazenca0x0@ubuntu:~$ deactivate
lazenca0x0@ubuntu:~/Documents/angr$ workon angr
(angr) lazenca0x0@ubuntu:~/Documents/angr$
```

```bash title="Execute and Exit"
lazenca0x0@ubuntu:~/Documents/angr$ workon angr
(angr) lazenca0x0@ubuntu:~$ deactivate
lazenca0x0@ubuntu:~/Documents/angr$
```

:::note[Install angr]
* <https://docs.angr.io/INSTALL.html>
:::

## **Example**

### **Defcamp CTF Quals 2015 - r100**

#### **File**

* r100

#### **Source code**

* **This code performs the following functions:**
  + Takes user input using the fgets() function.
    - The maximum length of the input is 255 bytes.
  + Passes the received input to the sub_4006FD() function, which outputs different messages depending on the return value:
    - If true: "Incorrect password!"
    - If false: "Nice!"

```c title="main()"
signed __int64 __fastcall main(__int64 a1, char **a2, char **a3)
{
  signed __int64 result; // rax@3
  __int64 v4; // rcx@6
  char s; // [rsp+0h] [rbp-110h]@1
  __int64 v6; // [rsp+108h] [rbp-8h]@1

  v6 = *MK_FP(__FS__, 40LL);
  printf("Enter the password: ", a2, a3);
  if ( fgets(&s, 255, stdin) )
  {
    if ( (unsigned int)sub_4006FD(&s, 255LL) )
    {
      puts("Incorrect password!");
      result = 1LL;
    }
    else
    {
      puts("Nice!");
      result = 0LL;
    }
  }
  else
  {
    result = 0LL;
  }
  v4 = *MK_FP(__FS__, 40LL) ^ v6;
  return result;
}
```

#### **Find address of function**

* **Find the target addresses to be used in angr as follows:**
  + The following address values are required to find the password using symbolic execution in angr:
  + Execution branches depending on the comparison before jumping:
    - Address when password is incorrect: 0x400855
    - Address when password is correct: 0x400844

```bash title="Disassemble main"
gdb-peda$ x/36i 0x4007E8
   0x4007e8:	push   rbp
   0x4007e9:	mov    rbp,rsp
   0x4007ec:	sub    rsp,0x110
   0x4007f3:	mov    rax,QWORD PTR fs:0x28
   0x4007fc:	mov    QWORD PTR [rbp-0x8],rax
   0x400800:	xor    eax,eax
   0x400802:	mov    edi,0x400937
   0x400807:	mov    eax,0x0
   0x40080c:	call   0x4005c0 <printf@plt>
   0x400811:	mov    rdx,QWORD PTR [rip+0x200850]        # 0x601068 <stdin>
   0x400818:	lea    rax,[rbp-0x110]
   0x40081f:	mov    esi,0xff
   0x400824:	mov    rdi,rax
   0x400827:	call   0x4005e0 <fgets@plt>
   0x40082c:	test   rax,rax
   0x40082f:	je     0x400866
   0x400831:	lea    rax,[rbp-0x110]
   0x400838:	mov    rdi,rax
   0x40083b:	call   0x4006fd
   0x400840:	test   eax,eax
   0x400842:	jne    0x400855
   0x400844:	mov    edi,0x40094c
   0x400849:	call   0x4005a0 <puts@plt>
   0x40084e:	mov    eax,0x0
   0x400853:	jmp    0x40086b
   0x400855:	mov    edi,0x400952
   0x40085a:	call   0x4005a0 <puts@plt>
   0x40085f:	mov    eax,0x1
   0x400864:	jmp    0x40086b
   0x400866:	mov    eax,0x0
   0x40086b:	mov    rcx,QWORD PTR [rbp-0x8]
   0x40086f:	xor    rcx,QWORD PTR fs:0x28
   0x400878:	je     0x40087f
   0x40087a:	call   0x4005b0 <__stack_chk_fail@plt>
   0x40087f:	leave  
   0x400880:	ret    
gdb-peda$
```

#### **Source code**

* **You can write the script as follows:**
  + First, create a Project using the angr.Project() API to analyze the "r100" binary.
  + Create a new PathGroup using the path_group() API.
  + Configure the find and avoid paths using the explore() API:
    - Target path: find=0x400844
    - Avoid path: avoid=0x400855
  + Use the explore() API to find the input value required to reach the 0x400844 address.

```python title="Symbolic Execution - Using Address"
import os
import angr

project = angr.Project("r100", auto_load_libs=False)
path_group = project.factory.path_group()
path_group.use_technique(angr.exploration_techniques.DFS())
avoid_addr = [0x400855]
find_addr = 0x400844

path_group.explore(find=find_addr, avoid=avoid_addr)
print path_group.found[0]
print path_group.found[0].state.posix.dumps(0)
```

* You can also specify the target path using a string condition rather than an address:

```python title="Symbolic Execution - Using String"
import os
import angr

project = angr.Project("defcamp_quals_2015_r100", auto_load_libs=False)
path_group = project.factory.path_group()
path_group.explore(find=lambda path: 'Nice!' in path.state.posix.dumps(1))
print path_group.found[0].state.posix.dumps(0)
```
:::note
* project.factory.path\_group() : <http://angr.io/api-doc/angr.html#angr.path_group.PathGroup>
* path\_group.explore() : <http://angr.io/api-doc/angr.html#angr.path_group.PathGroup.explore>
:::

#### **Result**

* You can retrieve the password value using the script as shown below:

```bash title="Execution result"
(angr) lazenca0x0@ubuntu:~/Documents/angr$ python symbolicECE.py 
WARNING | 2017-09-06 23:27:40,112 | claripy | Claripy is setting the recursion limit to 15000. If Python segfaults, I am sorry.
Code_Talkers

(angr) lazenca0x0@ubuntu:~/Documents/angr$ ./r100 
Enter the password: Code_Talkers
Nice!
(angr) lazenca0x0@ubuntu:~/Documents/angr$
```

### angr with it

* **The following tools can be used in conjunction with angr:**

| Tool | Description | github |
| --- | --- | --- |
| angrop | Automatically finds gadgets and builds ROP chains. | <https://github.com/salls/angrop> |
| Patcherex | Used to automatically generate binary patches. | <https://github.com/shellphish/patcherex> |
| rex | Used for automated exploit generation. | <https://github.com/shellphish/rex> |
| Driller | Augments AFL fuzzing performance using angr. | <https://github.com/shellphish/driller> |

## **Related Sites**

* [https://angr.io](https://angr.io/)
* <http://angr.io/api-doc/>
* <https://github.com/angr/angr>
* <https://github.com/angr/angr-doc>
* <https://github.com/axt/angr-utils>
