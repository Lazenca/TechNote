---
title: "Lazy binding(Feat. Now binding)"
sidebar_position: 1
---


# **Lazy binding**

## **Explanation**

### **Lazy binding**

* Lazy Binding is also known as lazy linking or on-demand symbol resolution.
* In Lazy Binding, the address resolution for a library symbol is deferred until the symbol is actually executed at runtime.

### **Lazy binding behavior flow**

* All dynamic library functions are invoked through Procedure Linkage Table (PLT) stub code.
  + The PLT stub code uses relative addressing to look up the target address in the Global Offset Table (GOT).
  + The PLT references the GOT and jumps to the function address stored therein.
* For this execution flow to work properly, the GOT must be populated with the correct target address.
  + With Lazy Binding, when a function is first called, the resolver stub resolves the symbol and updates the GOT entry.
  + The stub code sets up the necessary arguments (such as the relocation offset) required by the runtime linker's resolver routine, then jumps to the resolver.
* The resolver routine sets up arguments for `_dl_runtime_resolve` and invokes it.
  + Control then transfers to the resolved address returned by `_dl_runtime_resolve`.
* On subsequent calls, the PLT stub immediately jumps directly to the target function.
  + This is because the GOT entry now directly contains the resolved function address in the dynamic library.
* Initially, the GOT entry contains the address of the PLT resolution stub, so the dynamic linker performs only basic base relocations at load time.

|  | Lazy binding | Now binding |
| --- | --- | --- |
| Build option | -Wl,-zlazy | -Wl,-znow |
| Description | * Configures symbol resolution to occur on-demand when each function is first called during execution. | * The dynamic linker resolves all external symbols immediately upon program startup or when libraries are linked via dlopen(). |

## **Example**

### **Source code**

```c title="RELRO.c"
#include <stdio.h>
#include <string.h>

void main(){

        char addresss[16];
        size_t *pointer;
        int count = 1;

        while(count != 100)
        {
                printf("----- %d -----\n",count);
                memset(addresss,0,16);
                printf("Input Pointer addresss : ");
                fgets(addresss,16,stdin);

                pointer = strtol(addresss,0,16);
                printf("Pointer addresss : %p\n",pointer);

                printf("Input Pointer text : ");
                fgets(pointer,16,stdin);
                printf("Pointer text : %s\n",pointer);
                count++;
        }
        scanf("%s",addresss);
}
```

### **Lazy binding**

* **The symbol address is resolved as follows:**
  + `main()` calls 0x4005b0 to invoke `printf`.
  + The code at 0x4005b0 jumps to the address stored at 0x601020.
  + Location 0x601020 holds the address 0x4005b6.
    - Because `printf` has not yet been called, the PLT stub address is stored.
  + At 0x4005b6, the function's relocation index is pushed onto the stack, and execution jumps to 0x400590 (PLT[0]).
  + At 0x400590, the link map identifier is pushed onto the stack, and execution jumps to the address stored at 0x601010 (GOT[2]).
  + 0x601010 points to `_dl_runtime_resolve()`.
  + `_dl_runtime_resolve()` calls `_dl_fixup()` to resolve the actual function address, writes it into the GOT entry, and transfers control to the target.
* **As a result, only the `printf` entry in the GOT is populated with its actual address.**
  + Uncalled functions still have unresolved stub addresses in their GOT entries.

```bash title="Process of Lazy binding"
lazenca0x0@ubuntu:~/Documents/Definition/protection/RELRO$ gdb -q ./RELRO-Relro 
Reading symbols from ./RELRO-Relro...(no debugging symbols found)...done.

gdb-peda$ b *0x0000000000400748
Breakpoint 1 at 0x400748
gdb-peda$ r
Starting program: /home/lazenca0x0/Documents/Definition/protection/RELRO/RELRO-Relro 
Breakpoint 1, 0x0000000000400748 in main ()
gdb-peda$ x/i 0x4005b0
   0x4005b0 <printf@plt>:	jmp    QWORD PTR [rip+0x200a6a]        # 0x601020
gdb-peda$ x/gx 0x601020
0x601020:	0x00000000004005b6
gdb-peda$ x/2i 0x00000000004005b6
   0x4005b6 <printf@plt+6>:	push   0x1
   0x4005bb <printf@plt+11>:	jmp    0x400590
gdb-peda$ x/4i 0x400590
   0x400590:	push   QWORD PTR [rip+0x200a72]        # 0x601008
   0x400596:	jmp    QWORD PTR [rip+0x200a74]        # 0x601010
   0x40059c:	nop    DWORD PTR [rax+0x0]
   0x4005a0 <__stack_chk_fail@plt>:	jmp    QWORD PTR [rip+0x200a72]        # 0x601018
gdb-peda$ x/gx 0x601010
0x601010:	0x00007ffff7dee870

gdb-peda$ x/51i 0x00007ffff7dee870
   0x7ffff7dee870 <_dl_runtime_resolve_avx>:	push   rbx
   0x7ffff7dee871 <_dl_runtime_resolve_avx+1>:	mov    rbx,rsp
   0x7ffff7dee874 <_dl_runtime_resolve_avx+4>:	and    rsp,0xffffffffffffffe0
   0x7ffff7dee878 <_dl_runtime_resolve_avx+8>:	sub    rsp,0x180
   0x7ffff7dee87f <_dl_runtime_resolve_avx+15>:	mov    QWORD PTR [rsp+0x140],rax
   0x7ffff7dee887 <_dl_runtime_resolve_avx+23>:	mov    QWORD PTR [rsp+0x148],rcx
   0x7ffff7dee88f <_dl_runtime_resolve_avx+31>:	mov    QWORD PTR [rsp+0x150],rdx
   0x7ffff7dee897 <_dl_runtime_resolve_avx+39>:	mov    QWORD PTR [rsp+0x158],rsi
   0x7ffff7dee89f <_dl_runtime_resolve_avx+47>:	mov    QWORD PTR [rsp+0x160],rdi
   0x7ffff7dee8a7 <_dl_runtime_resolve_avx+55>:	mov    QWORD PTR [rsp+0x168],r8
   0x7ffff7dee8af <_dl_runtime_resolve_avx+63>:	mov    QWORD PTR [rsp+0x170],r9
   0x7ffff7dee8b7 <_dl_runtime_resolve_avx+71>:	vmovdqa YMMWORD PTR [rsp],ymm0
   0x7ffff7dee8bc <_dl_runtime_resolve_avx+76>:	vmovdqa YMMWORD PTR [rsp+0x20],ymm1
   0x7ffff7dee8c2 <_dl_runtime_resolve_avx+82>:	vmovdqa YMMWORD PTR [rsp+0x40],ymm2
   0x7ffff7dee8c8 <_dl_runtime_resolve_avx+88>:	vmovdqa YMMWORD PTR [rsp+0x60],ymm3
   0x7ffff7dee8ce <_dl_runtime_resolve_avx+94>:	vmovdqa YMMWORD PTR [rsp+0x80],ymm4
   0x7ffff7dee8d7 <_dl_runtime_resolve_avx+103>:	vmovdqa YMMWORD PTR [rsp+0xa0],ymm5
   0x7ffff7dee8e0 <_dl_runtime_resolve_avx+112>:	vmovdqa YMMWORD PTR [rsp+0xc0],ymm6
   0x7ffff7dee8e9 <_dl_runtime_resolve_avx+121>:	vmovdqa YMMWORD PTR [rsp+0xe0],ymm7
   0x7ffff7dee8f2 <_dl_runtime_resolve_avx+130>:	bndmov [rsp+0x100],bnd0
   0x7ffff7dee8fb <_dl_runtime_resolve_avx+139>:	bndmov [rsp+0x110],bnd1
   0x7ffff7dee904 <_dl_runtime_resolve_avx+148>:	bndmov [rsp+0x120],bnd2
   0x7ffff7dee90d <_dl_runtime_resolve_avx+157>:	bndmov [rsp+0x130],bnd3
   0x7ffff7dee916 <_dl_runtime_resolve_avx+166>:	mov    rsi,QWORD PTR [rbx+0x10]
   0x7ffff7dee91a <_dl_runtime_resolve_avx+170>:	mov    rdi,QWORD PTR [rbx+0x8]
   0x7ffff7dee91e <_dl_runtime_resolve_avx+174>:	call   0x7ffff7de69f0 <_dl_fixup>
   0x7ffff7dee923 <_dl_runtime_resolve_avx+179>:	mov    r11,rax
   0x7ffff7dee926 <_dl_runtime_resolve_avx+182>:	bndmov bnd3,[rsp+0x130]
   0x7ffff7dee92f <_dl_runtime_resolve_avx+191>:	bndmov bnd2,[rsp+0x120]
   0x7ffff7dee938 <_dl_runtime_resolve_avx+200>:	bndmov bnd1,[rsp+0x110]
   0x7ffff7dee941 <_dl_runtime_resolve_avx+209>:	bndmov bnd0,[rsp+0x100]
   0x7ffff7dee94a <_dl_runtime_resolve_avx+218>:	mov    r9,QWORD PTR [rsp+0x170]
   0x7ffff7dee952 <_dl_runtime_resolve_avx+226>:	mov    r8,QWORD PTR [rsp+0x168]
   0x7ffff7dee95a <_dl_runtime_resolve_avx+234>:	mov    rdi,QWORD PTR [rsp+0x160]
   0x7ffff7dee962 <_dl_runtime_resolve_avx+242>:	mov    rsi,QWORD PTR [rsp+0x158]
   0x7ffff7dee96a <_dl_runtime_resolve_avx+250>:	mov    rdx,QWORD PTR [rsp+0x150]
   0x7ffff7dee972 <_dl_runtime_resolve_avx+258>:	mov    rcx,QWORD PTR [rsp+0x148]
   0x7ffff7dee97a <_dl_runtime_resolve_avx+266>:	mov    rax,QWORD PTR [rsp+0x140]
   0x7ffff7dee982 <_dl_runtime_resolve_avx+274>:	vmovdqa ymm0,YMMWORD PTR [rsp]
   0x7ffff7dee987 <_dl_runtime_resolve_avx+279>:	vmovdqa ymm1,YMMWORD PTR [rsp+0x20]
   0x7ffff7dee98d <_dl_runtime_resolve_avx+285>:	vmovdqa ymm2,YMMWORD PTR [rsp+0x40]
   0x7ffff7dee993 <_dl_runtime_resolve_avx+291>:	vmovdqa ymm3,YMMWORD PTR [rsp+0x60]
   0x7ffff7dee999 <_dl_runtime_resolve_avx+297>:	vmovdqa ymm4,YMMWORD PTR [rsp+0x80]
   0x7ffff7dee9a2 <_dl_runtime_resolve_avx+306>:	vmovdqa ymm5,YMMWORD PTR [rsp+0xa0]
   0x7ffff7dee9ab <_dl_runtime_resolve_avx+315>:	vmovdqa ymm6,YMMWORD PTR [rsp+0xc0]
   0x7ffff7dee9b4 <_dl_runtime_resolve_avx+324>:	vmovdqa ymm7,YMMWORD PTR [rsp+0xe0]
   0x7ffff7dee9bd <_dl_runtime_resolve_avx+333>:	mov    rsp,rbx
   0x7ffff7dee9c0 <_dl_runtime_resolve_avx+336>:	mov    rbx,QWORD PTR [rsp]
   0x7ffff7dee9c4 <_dl_runtime_resolve_avx+340>:	add    rsp,0x18
   0x7ffff7dee9c8 <_dl_runtime_resolve_avx+344>:	bnd jmp r11
   0x7ffff7dee9cc:	nop    DWORD PTR [rax+0x0]
gdb-peda$ b *0x7ffff7dee91e
Breakpoint 2 at 0x7ffff7dee91e: file ../sysdeps/x86_64/dl-trampoline.h, line 112.
gdb-peda$ c
Continuing.

Breakpoint 2, _dl_runtime_resolve_avx () at ../sysdeps/x86_64/dl-trampoline.h:112
112	../sysdeps/x86_64/dl-trampoline.h: No such file or directory.
gdb-peda$ x/gx 0x601020
0x601020:	0x00000000004005b6
gdb-peda$ ni
gdb-peda$ x/gx 0x601020
0x601020:	0x00007ffff7a62800
gdb-peda$ i r rax
rax            0x7ffff7a62800	0x7ffff7a62800
gdb-peda$ x/i 0x7ffff7a62800
   0x7ffff7a62800 <__printf>:	sub    rsp,0xd8
gdb-peda$
```

### **Now binding**

* **Under Now binding, symbol addresses are stored as follows:**
  + `main()` calls 0x4005c8 to invoke `printf`.
  + The instruction at 0x4005c8 jumps to the address stored at 0x600fc8.
  + Unlike lazy binding, prior to loading, 0x600fc8 contains 0x0.
  + In Now binding, the dynamic linker resolves all referenced function addresses when the program starts and stores them in the GOT.
  + Setting a hardware watchpoint on 0x600fc8 in GDB confirms that this entry is overwritten with the resolved runtime libc address during startup.

```bash title="Process of Now binding"
lazenca0x0@ubuntu:~/Documents/Definition/protection/RELRO$ gdb -q RELRO-FullRelro
Reading symbols from RELRO-FullRelro...(no debugging symbols found)...done.
gdb-peda$ x/i 0x4005c8
   0x4005c8:	jmp    QWORD PTR [rip+0x2009fa]        # 0x600fc8
gdb-peda$ x/gx 0x600fc8
0x600fc8:	0x0000000000000000
gdb-peda$ watch *0x600fc8
Hardware watchpoint 1: *0x600fc8
gdb-peda$ r
Starting program: /home/lazenca0x0/Documents/Definition/protection/RELRO/RELRO-FullRelro 
Hardware watchpoint 1: *0x600fc8

Old value = 0x0
New value = 0xf7a62800
0x00007ffff7de388f in elf_machine_rela (skip_ifunc=<optimized out>, reloc_addr_arg=<optimized out>, version=<optimized out>, sym=<optimized out>, reloc=<optimized out>, map=<optimized out>)
    at ../sysdeps/x86_64/dl-machine.h:435
435	../sysdeps/x86_64/dl-machine.h: No such file or directory.
gdb-peda$
```

## **Related information**

* N/a
