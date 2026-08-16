---
title: "Valgrind - Memcheck"
sidebar_position: 1
---


## **Valgrind - Memcheck**

* **Memcheck detects memory management problems in C and C++ programs.**
* **When a program runs under Memcheck, every memory read and write is checked, and calls to malloc/new/free/delete are intercepted.**
* **Memcheck can detect the following issues:**
  + Invalid memory accesses:
    - Unallocated memory regions
    - Already freed memory regions
    - Past the boundaries of stack blocks
    - Inaccessible memory regions
  + Use of uninitialized values
  + Memory leaks
  + Incorrect freeing of heap blocks:
    - Double free
    - Mismatched free
* **Memcheck reports errors immediately when they occur and provides detailed stack trace information for the offending locations.**
* **Memcheck tracks addressability at the byte level and value initialization at the bit level.**
* **Memcheck runs programs significantly slower than normal execution (around 10x to 30x slowdown).**

## **Example**

### **Sample code**

```c title="Sample.c"
#include <stdio.h>

int main(){
  char *p;

  p = (char *) malloc(19);
  p = (char *) malloc(12);
  free(p);
  p = (char *) malloc(16);

  return 0;
}
```

### Build

* **Compile the sample code with debugging symbols:**

```bash title="Build"
lazenca0x0@ubuntu:~$ gcc -o test -g test.c
test.c: In function 'main':
test.c:8:16: warning: implicit declaration of function 'malloc' [-Wimplicit-function-declaration]
   p = (char *) malloc(19);
                ^
test.c:8:16: warning: incompatible implicit declaration of built-in function 'malloc'
test.c:8:16: note: include '<stdlib.h>' or provide a declaration of 'malloc'
test.c:12:3: warning: implicit declaration of function 'free' [-Wimplicit-function-declaration]
   free(p);
   ^
test.c:12:3: warning: incompatible implicit declaration of built-in function 'free'
test.c:12:3: note: include '<stdlib.h>' or provide a declaration of 'free'
```

### **Run memcheck**

* **Pass the valgrind options along with the target binary path to analyze and display information on detected errors:**

```bash title="Run memcheck"
lazenca0x0@ubuntu:~$ valgrind --tool=memcheck --leak-check=yes --show-reachable=yes --num-callers=20 --track-fds=yes ./test
==54123== Memcheck, a memory error detector
==54123== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==54123== Using Valgrind-3.13.0 and LibVEX; rerun with -h for copyright info
==54123== Command: ./test
==54123== 
==54123== 
==54123== FILE DESCRIPTORS: 3 open at exit.
==54123== Open file descriptor 2: /dev/pts/18
==54123==    <inherited from parent>
==54123== 
==54123== Open file descriptor 1: /dev/pts/18
==54123==    <inherited from parent>
==54123== 
==54123== Open file descriptor 0: /dev/pts/18
==54123==    <inherited from parent>
==54123== 
==54123== 
==54123== HEAP SUMMARY:
==54123==     in use at exit: 35 bytes in 2 blocks
==54123==   total heap usage: 3 allocs, 1 frees, 47 bytes allocated
==54123== 
==54123== 16 bytes in 1 blocks are definitely lost in loss record 1 of 2
==54123==    at 0x4C2DBF6: malloc (vg_replace_malloc.c:299)
==54123==    by 0x40059F: main (test.c:15)
==54123== 
==54123== 19 bytes in 1 blocks are definitely lost in loss record 2 of 2
==54123==    at 0x4C2DBF6: malloc (vg_replace_malloc.c:299)
==54123==    by 0x400577: main (test.c:8)
==54123== 
==54123== LEAK SUMMARY:
==54123==    definitely lost: 35 bytes in 2 blocks
==54123==    indirectly lost: 0 bytes in 0 blocks
==54123==      possibly lost: 0 bytes in 0 blocks
==54123==    still reachable: 0 bytes in 0 blocks
==54123==         suppressed: 0 bytes in 0 blocks
==54123== 
==54123== For counts of detected and suppressed errors, rerun with: -v
==54123== ERROR SUMMARY: 2 errors from 2 contexts (suppressed: 0 from 0)
lazenca0x0@ubuntu:~$
```

## **Related site**

* Memcheck: <http://valgrind.org/docs/manual/mc-manual.html>
* <http://cs.ecs.baylor.edu/~donahoo/tools/valgrind/>
* <http://www.thegeekstuff.com/2011/11/valgrind-memcheck/>
