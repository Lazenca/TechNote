---
title: "radamsa"
sidebar_position: 1
---


## **Description**

* Radamsa는 범용 데이터 퍼지 (fuzzer)입니다.
  + 지정된 샘플 파일 또는 표준 입력이없는 경우 데이터를 읽어 수정 된 데이터를 출력합니다.
  + 일반적으로 프로그램 테스트를 위해 조작 된 데이터를 생성하는 데 사용됩니다.
  + 지원가능한 OS는 GNU/Linux, OpenBSD, FreeBSD, Mac OS X, Windows (using Cygwin)를 지원합니다.

### **Install**

```bash title="Install radamsa"
$ git clone https://github.com/aoh/radamsa.git ~/radamasa/
$ cd radamsa
$ make
$ sudo make install # optional, you can also just grab bin/radamsa
$ radamsa --help
```

### Command options

| Options | Description |
| --- | --- |
| -o | --output <arg>, 출력 패턴 |
| -n | --count <arg>, 생성할 출력 수 |
| -s | --seed <arg>, random seed (number, default random) |
| -m | --mutations <arg>, 사용할 변이 [ft=2,fo=2,fn,num=5,td,tr2,ts1,tr,ts2,ld,lds,lr2,li,ls,lp,lr,lis,lrs,sr,sd,bd,bf,bi,br,bp,bei,bed,ber,uw,ui=2,xp=9,ab] |
| -p | --patterns <arg>, 사용할 변이 패턴 [od,nd=2,bu] |
| -g | --generators <arg>, 사용할 데이터 생성기 [random,file=1000,jump=200,stdin=100000] |
| -M | --meta <arg>, 생성된 파일에 대한 메타 데이터를 이 파일에 저장 |
| -r | --recursive, 하위 디렉토리의 파일 포함 |
| -S | --seek <arg>, 주어진 테스트 케이스에서 시작하라. |
| -d | --delay <arg>, 출력 간 n 밀리 초 동안 대기 |
| -l | --list, 돌연변이, 패턴 및 생성기 목록 |
| -C | --checksums <arg>, 고유성 필터의 최대 체크섬 수 (0은 사용 불가능) [10000] |
| -v | --verbose, 만드는 동안 진행상황 표시 |

### **Options of Output**

| -o argument | meaning | example |
| --- | --- | --- |
| :port | * 지정된 포트에서 TCP서버 역할을 합니다. | # radamsa -o :80 -n inf samples/\*.http-resp |
| ip:port | * TCP 클라이언트의 IP, 포트에 연결합니다. | $ radamsa -o 127.0.0.1:80 -n inf samples/\*.http-req |
| - | * 결과물을 화면 출력합니다. | $ radamsa -o - samples/\*.vt100 |
| path | * 결과물을 해당 경로에 파일로 생성합니다.    + %n : 테스트 케이스 번호   + %s : 첫 번째 접미사 | $ radamsa -o test-%n.%s -n 100 samples/\*.foo |

### **Options of Mutations**

| Options of mutations | Description |
| --- | --- |
| ab | ASCII문자열 데이터 취급 시 어리석은 문제를 개선합니다. |
| bd | 한 바이트를 떨어 |
| bf | 플립 1 비트 |
| bi | 임의의 바이트 삽입 |
| br | 한 바이트 반복 |
| bp | 일부 바이트를 변경 |
| bei | 한 바이트 씩 증가 |
| bed | 한 바이트 씩 감소 |
| ber | 임이의 한 바이트로 교체 |
| sr | 바이트 시퀀스 반복 |
| sd | 바이트 시퀀스 삭제 |
| ld | 한 줄 삭제 |
| lds | 여려 줄 삭제 |
| lr2 | 한 줄 복제 |
| li | 가까운 한 줄 복사 |
| lr | 한 줄 반복 |
| ls | 두 줄 교체 |
| lp | 줄의 순서 변경 |
| lis | 다른 곳에 한 줄을 삽입 |
| lrs | 다른 곳에서 한 줄을 교제 |
| td | 노드 삭제 |
| tr2 | 노드 복제 |
| ts1 | 하나의 노드를 다른 노드와 교환 |
| ts2 | 두 노드을 교환 |
| tr | parse tree의 경로를 반복합니다. |
| uw | 코드 부분이 넓어지도록 시도 |
| ui | 재미있는 unicode 삽입 |
| num | 텍스트 번호 수정 시도 |
| xp | xml을 구문을 분석해서 변형 |

## **Example**

### **String**

* **다음은 간단한 텍스트 전달해 생성된 데이터 입니다.**

```bash title="Simple text fuzz"
lazenca0x0@ubuntu:~/Documents/radamsa/sample$ echo "TEST" | radamsa 
??󠁁??TESS?TESS
lazenca0x0@ubuntu:~/Documents/radamsa/sample$ echo "TEST" | radamsa 
ᅟ ??က?󠁓?T
lazenca0x0@ubuntu:~/Documents/radamsa/sample$ echo "TEST" | radamsa 
TES~ES~?lazenca0x0@ubuntu:~/Documents/radamsa/sample$ echo "TEST" | radamsa 
UTEEEEST
```

* **다음은 -n 옵션을 이용해 10개의 데이터를 생성했습니다.**

```bash title="Fuzz multiple times"
lazenca0x0@ubuntu:~/Documents/radamsa/sample$ echo "TEST" | radamsa -n 10
TE??(??แ??󠁀??ST
TE󠁕ST
??TEST
TuESTuESTแ
TEST﷐
??(TEE￁?V𐀀󠁫
           T?TESEST
TEST
TEST??&#256;$1\x-6386771690800937393275084572a$PATH$!!$1$(xcalc)\0\u0000!!\x00\x0d!xcalcaaaa%d%nTEST
TE
S???????T
lazenca0x0@ubuntu:~/Documents/radamsa/sample$
```

* **다음은 -s 옵션을 이용해 seed 값을 지정해 생성된 10개의 데이터 입니다.**

```bash title="Fuzz with seed"
lazenca0x0@ubuntu:~/Documents/radamsa/sample$ echo "TEST" | radamsa -n 10 --seed 7
TEST
EST
TESS??
9ESTTTTTT??
T

ST
TESTTTT
ES
EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEST
TET
lazenca0x0@ubuntu:~/Documents/radamsa/sample$
```

### File

* **다음은 변형된 ".png" 파일을 생성하는 방법입니다.**
  + "testcase"에 png 파일이 저장되어 있습니다.
  + "sample" 폴더에 변형된 png 파일 100개를 저장합니다.

```bash title="Create fuzz files"
lazenca0x0@ubuntu:~/Documents/radamsa$ mkdir sample
lazenca0x0@ubuntu:~/Documents/radamsa$ radamsa -r testcase/ -o sample/img-%n.png -n 100
lazenca0x0@ubuntu:~/Documents/radamsa$ ls sample/
img-100.png  img-16.png  img-22.png  img-29.png  img-35.png  img-41.png  img-48.png  img-54.png  img-60.png  img-67.png  img-73.png  img-7.png   img-86.png  img-92.png  img-99.png
img-10.png   img-17.png  img-23.png  img-2.png   img-36.png  img-42.png  img-49.png  img-55.png  img-61.png  img-68.png  img-74.png  img-80.png  img-87.png  img-93.png  img-9.png
img-11.png   img-18.png  img-24.png  img-30.png  img-37.png  img-43.png  img-4.png   img-56.png  img-62.png  img-69.png  img-75.png  img-81.png  img-88.png  img-94.png
img-12.png   img-19.png  img-25.png  img-31.png  img-38.png  img-44.png  img-50.png  img-57.png  img-63.png  img-6.png   img-76.png  img-82.png  img-89.png  img-95.png
img-13.png   img-1.png   img-26.png  img-32.png  img-39.png  img-45.png  img-51.png  img-58.png  img-64.png  img-70.png  img-77.png  img-83.png  img-8.png   img-96.png
img-14.png   img-20.png  img-27.png  img-33.png  img-3.png   img-46.png  img-52.png  img-59.png  img-65.png  img-71.png  img-78.png  img-84.png  img-90.png  img-97.png
img-15.png   img-21.png  img-28.png  img-34.png  img-40.png  img-47.png  img-53.png  img-5.png   img-66.png  img-72.png  img-79.png  img-85.png  img-91.png  img-98.png
lazenca0x0@ubuntu:~/Documents/radamsa$
```

* **아래와 같이 변이된 파일들을 확인 할 수 있습니다.**
  + 이미지 파일이 외에도 다양한 파일도 가능합니다.

**Sample image**

| Original of ".png" file | Mutation 1 | Mutation 2 | Mutation 3 |
| --- | --- | --- | --- |
|![](/img/attachments/1148091/5112002.png)  |![](/img/attachments/1148091/5112001.png)  |![](/img/attachments/1148091/5112000.png)  |![](/img/attachments/1148091/5111999.png)  |

## **Related information**

* <https://github.com/aoh/radamsa>
* <https://www.mankier.com/1/radamsa>