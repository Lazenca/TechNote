---
title: "AFL - American fuzzy lop"
sidebar_position: 1
---


## **Description**

* **AFL (American Fuzzy Lop) is a fuzzer that uses genetic algorithm to efficiently increase code coverage of test cases.**
  + Supportable OSes include 32bit and 64bit versions of Linux, OpenBSD, FreeBSD, and NetBSD.
    - It also works on MacOS X and Solaris, but with some limitations.
  + Supported programming languages ​​include C, C++, and Objective C.
  + Supported compilers include gcc, g++, clang, and clang++.
  + Supportable test methods include White-box and Black-box.
    - On Linux, you can fuzz black box binaries using the QEMU option.

### **Site**

* <http://lcamtuf.coredump.cx/afl/>

### **Install**

```bash title="Install"
$ wget http://lcamtuf.coredump.cx/afl/releases/afl-latest.tgz
$ tar -xvf afl-latest.tgz 
$ cd afl-2.49b/
$ make
$ sudo make install
```

### **Commands**

| Command | Description | Basic methods of use |
| --- | --- | --- |
| afl-analyze | file format analyzer | afl-analyze -i <test case file> target\_app |
| afl-clang | clang wrapper | Same as clang command. |
| afl-clang++ | clang++ wrapper | Same as clang++ command. |
| afl-cmin | Eliminate duplicate test cases | afl-cmin -i <test case dir> -o <output dir> target\_app |
| afl-fuzz | AFL's code purge | afl-fuzz -i <test case dir> -o <output dir> target\_app |
| afl-g++ | g++ wrapper | Same as g++ command. |
| afl-gcc | gcc wrapper | Same as gcc command. |
| afl-gotcpu | CPU preemption ratio output | afl-gotcpu |
| afl-plot | Progress output - requires "gnuplot" installed | afl-plot <afl state dir> <graph output dir> |
| afl-tmin | Minimize test cases | afl-tmin -i <test case file> -o <output file> target\_app |
| afl-whatsup | health check tool | afl-whatsup <afl\_sync\_dir> |

## **Description of commands**

### afl-fuzz

* The tool attempts various fuzzing operations on the binary.

#### **White-box, Black-box test**

* **The tool supports white-box and black-box testing.**
  + To use white-box, you must build the binary using the compiler provided by afl.
  + To use black-box, afl uses QEMU and can be used using the -Q option.
* You can do white-box testing as follows.

```bash title="White-box"
afl-fuzz -i <test case dir> -o <output dir> target_app
```

* You can do black-box testing like this:

```bash title="Black-box"
afl-fuzz -Q -i <test case dir> -o <output dir> target_app
```

:::note[Data entry options]
```bash title="Standard input"
afl-fuzz -i <test case dir> -o <output dir> target_app [params...]
```

```bash title="File input"
afl-fuzz -i <test case dir> -o <output dir> target_app @@
```
:::

#### **Parallel fuzzing**

* **The tool supports parallel fuzzing.**
  + Every copy of afl-fuzz occupies one CPU core.
  + This means that on an n core system, you can almost always run n concurrent fuzzing operations at almost the same time without any performance penalty.
    - You can check this using the afl-gotcpu tool:
  + In fact, if you rely on just one task on a multi-core system, you will not be fully utilizing the hardware.
  + Parallel processing is generally the right approach.

##### **Single-system parallelization**

* To take advantage of single-machine parallelism, we create an empty directory ("sync dir") to connect a single task to multiple cores on the local machine in parallel.
  + All instances will be shared in that directory.
* Run the master instance (-M) as follows:

```bash title="Master instance"
./afl-fuzz -i testcase_dir -o sync_dir -M fuzzer01 [...other stuff...]
```

* Run the secondary instance (-S) as follows:

```bash title="Slave instance"
$ ./afl-fuzz -i testcase_dir -o sync_dir -S fuzzer02 [...other stuff...]
$ ./afl-fuzz -i testcase_dir -o sync_dir -S fuzzer03 [...other stuff...]
```

##### **Multi-system parallelization**

* The basic operating principle of multi-system parallel processing is similar to the mechanism described in single-system parallelization.
* I need a simple script that does two things:
* Compresses files under the "/queue/" path in all <fuzzer\_id> directories on the local system.

```bash title="Compressing files"
for s in {1..10}; do
      ssh user@host${s} "tar -czf - sync/host${s}_fuzzid*/[qf]*" >host${s}.tgz
    done
```

* Distribute and unzip the compressed file to all computers

```bash title="Uncompressing files"
  for s in {1..10}; do
      for d in {1..10}; do
        test "$s" = "$d" && continue
        ssh user@host${d} 'tar -kxzf -' <host${s}.tgz
      done
    done
```

:::note[Parallel fuzzing using AFL]
* <https://raw.githubusercontent.com/mirrorer/afl/master/docs/parallel_fuzzing.txt>
:::

### afl-analyze

* **The tool analyzes the file format of the test case.**
  + It retrieves data delivered sequentially from the data stream and observes the binary operation for each input.
* We can infer the following information:
  + no-op block
  + Critical stream
  + "magic value" section
  + Areas with suspicious content
  + Area suspected of being a length field
  + Area suspected of being a checksum block
  + Areas suspected of having checksum or magic values
* You can use it like this:

```bash title="afl-analyze -i testcase/test1.txt ./test"
lazenca0x0@ubuntu:~/Documents/AFL/test$ afl-analyze -i testcase/test1.txt ./test

afl-analyze 2.49b by <lcamtuf@google.com>

[+] Read 4 bytes from 'testcase/test1.txt'.
[*] Performing dry run (mem limit = 50 MB, timeout = 1000 ms)...
[*] Analyzing input file (this may take a while)...

     01  - no-op block               01  - suspected length field
     01  - superficial content       01  - suspected cksum or magic int
     01  - critical stream           01  - suspected checksummed block
     01  - "magic value" section

[000000]  a  #0a  a  #0a 

[+] Analysis complete. Interesting bits: 0.00% of the input file.
[+] We're done here. Have a nice day!

lazenca0x0@ubuntu:~/Documents/AFL/test$
```

### **afl-cmin**

* **This tool minimizes duplication of test cases.**
* Separate only the most suitable test cases as follows.
  + We found 7 tuples in 4 test cases and reduced them to 2 files.
  + The test case used here used the file created in “Create to Test cases.” below.

```bash title="afl-cmin -i testcase/ -o newTestCase/ ./test"
lazenca0x0@ubuntu:~/Documents/AFL/test$ afl-cmin -i testcase/ -o newTestCase/ ./test
corpus minimization tool for afl-fuzz by <lcamtuf@google.com>

[*] Testing the target binary...
[+] OK, 4 tuples recorded.
[*] Obtaining traces for input files in 'testcase/'...
    Processing file 4/4... 
[*] Sorting trace sets (this may take a while)...
[+] Found 7 unique tuples across 4 files.
[*] Finding best candidates for each tuple...
    Processing file 4/4... 
[*] Sorting candidate list (be patient)...
[*] Processing candidates and writing output files...
    Processing tuple 7/7... 
[+] Narrowed down to 2 files, saved in 'newTestCase/'.

lazenca0x0@ubuntu:~/Documents/AFL/test$ cd newTestCase/
lazenca0x0@ubuntu:~/Documents/AFL/test/newTestCase$ ls -al
total 16
drwxrwxr-x 2 lazenca0x0 lazenca0x0 4096 Aug 15 20:08 .
drwxrwxr-x 5 lazenca0x0 lazenca0x0 4096 Aug 15 20:08 ..
-rw-rw-r-- 2 lazenca0x0 lazenca0x0    4 Aug  9 00:18 test1.txt
-rw-rw-r-- 2 lazenca0x0 lazenca0x0    9 Aug  9 00:19 test3.txt
lazenca0x0@ubuntu:~/Documents/AFL/test/newTestCase$
```

### **afl-tmin**

* **This tool optimizes test cases.**
* What is optimized is as follows:
  + Minimization of data blocks
  + Minimization of symbols
  + Minimization of characters
* Test cases can be minimized as follows.
  + 68 characters changed to 56.
  + Random characters have been changed to the number 0 (0x30).
  + Because there were no symbols in the test case, symbol minimization was not carried out.

```bash title="afl-tmin -i result/crashes/id\:000000\,sig\:11\,src\:000000\,op\:havoc\,rep\:128 -o testcaseMin ./test"
lazenca0x0@ubuntu:~/Documents/AFL/test$ afl-tmin -i result/crashes/id\:000000\,sig\:11\,src\:000000\,op\:havoc\,rep\:128 -o testcaseMin ./test
afl-tmin 2.49b by <lcamtuf@google.com>

[+] Read 68 bytes from 'result/crashes/id:000000,sig:11,src:000000,op:havoc,rep:128'.
[*] Performing dry run (mem limit = 50 MB, timeout = 1000 ms)...
[+] Program exits with a signal, minimizing in crash mode.
[*] Stage #0: One-time block normalization...
[+] Block normalization complete, 68 bytes replaced.
[*] --- Pass #1 ---
[*] Stage #1: Removing blocks of data...
    Block length = 4, remaining size = 68
    Block length = 2, remaining size = 56
    Block length = 1, remaining size = 56
[+] Block removal complete, 12 bytes deleted.
[*] Stage #2: Minimizing symbols (1 code point)...
[+] Symbol minimization finished, 0 symbols (0 bytes) replaced.
[*] Stage #3: Character minimization...
[+] Character minimization done, 0 bytes replaced.
[*] --- Pass #2 ---
[*] Stage #1: Removing blocks of data...
    Block length = 4, remaining size = 56
    Block length = 2, remaining size = 56
    Block length = 1, remaining size = 56
[+] Block removal complete, 0 bytes deleted.

     File size reduced by : 17.65% (to 56 bytes)
    Characters simplified : 121.43%
     Number of execs done : 33
          Fruitless execs : path=12 crash=0 hang=0

[*] Writing output to 'testcaseMin'...
[+] We're done here. Have a nice day!
lazenca0x0@ubuntu:~/Documents/AFL/test$ hexdump result/crashes/id\:000000\,sig\:11\,src\:000000\,op\:havoc\,rep\:128 
0000000 81b9 ad13 0000 76e1 04ff 007f eee7 ffff
0000010 64ff 0000 798a 9379 7980 7979 7966 e100
0000020 ff76 7fc0 e700 ffee ffff ffff 7f04 e700
0000030 ffee ffff 0064 6900 7979 7993 7979 0079
0000040 0100 ff00                              
0000044
lazenca0x0@ubuntu:~/Documents/AFL/test$ hexdump testcaseMin 
0000000 3030 3030 3030 3030 3030 3030 3030 3030
*
0000038
lazenca0x0@ubuntu:~/Documents/AFL/test$ cat testcaseMin 
00000000000000000000000000000000000000000000000000000000
```

### **afl-gotcpu**

* **The tool prints the cpu preemption ratio being used by afl-fuzz.**

```bash title="afl-gotcpu"
lazenca0x0@ubuntu:~$ afl-gotcpu 
afl-gotcpu 2.49b by <lcamtuf@google.com>
[*] Measuring per-core preemption rate (this will take 1.00 sec)...
    Core #0: CAUTION (231%)

>>> CAUTION: You may still have 1 core available. <<<

lazenca0x0@ubuntu:~$
```

### afl-plot

* **The tool graphs the progress of the fuzz.**
  + If you run the program as follows, an index.html file will be created.

```bash title="afl-plot result/ graph/"
lazenca0x0@ubuntu:~/Documents/AFL/test$ afl-plot result/ graph/
progress plotting utility for afl-fuzz by <lcamtuf@google.com>

[*] Generating plots...
[*] Generating index.html...
[+] All done - enjoy your charts!
lazenca0x0@ubuntu:~/Documents/AFL/test$
```

:::note[index.html]
![](/img/attachments/1148089/5111964.jpg)
:::

### **alf-whatsup**

* **This tool can check the status of individual fuzzers when parallel fuzzing is performed.**

```bash title="afl-whatsup result/"
lazenca0x0@ubuntu:~/Documents/AFL/test$ afl-whatsup result/
status check tool for afl-fuzz by <lcamtuf@google.com>

Individual fuzzers
==================

>>> fuzzer1 (0 days, 0 hrs) <<<

  cycle 1, lifetime speed 1 execs/sec, path 0/2 (0%)
  pending 2/2, coverage 0.01%, no crashes yet

>>> fuzzer2 (0 days, 0 hrs) <<<

  cycle 1, lifetime speed 1 execs/sec, path 0/2 (0%)
  pending 2/2, coverage 0.01%, no crashes yet

Summary stats
=============

       Fuzzers alive : 2
      Total run time : 0 days, 0 hours
         Total execs : 0 million
    Cumulative speed : 2 execs/sec
       Pending paths : 4 faves, 4 total
  Pending per fuzzer : 2 faves, 2 total (on average)
       Crashes found : 0 locally unique

lazenca0x0@ubuntu:~/Documents/AFL/test$
```

## **Example**

### **Example code**

* **The code below performs the following actions.**
  + ID and password are input from the user.
  + If the input value matches the value requested by the program, “Success” is output.
  + Otherwise, “Fail” is output.
* The important part here is that there is no length limit to the value input from the user.
  + This causes Stack Buffer Overflow.

```c title="test.c"
#include <stdio.h>
#include <string.h>

int main(void){
	char login[16];
	char password[16];

	printf("Login : ");
	scanf("%s",login);
	printf("Password : ");
	scanf("%s",password);

	if(strcmp(login,"root") == 0){
		if(strcmp(password,"toor") == 0){
			printf("Success.\n");
			return 0;
		}
	}
	printf("Fail.\n");
	return 1;
}
```

### Create to Test cases.

* **Create a test case as follows.**
  + If the ID is incorrect
  + If the password is incorrect
  + If ID and Password are both incorrect
  + If ID and Password are correct

```bash title="Create to Test cases."
lazenca0x0@ubuntu:~/Documents/AFL/test$ mkdir testcase
lazenca0x0@ubuntu:~/Documents/AFL/test$ cd testcase
lazenca0x0@ubuntu:~/Documents/AFL/test$ echo -e "a\toor" > test1.txt
lazenca0x0@ubuntu:~/Documents/AFL/test$ echo -e "root\na" > test2.txt
lazenca0x0@ubuntu:~/Documents/AFL/test$ echo -e "a\na" > test3.txt
lazenca0x0@ubuntu:~/Documents/AFL/test$ echo -e "root\toor" > test4.txt
lazenca0x0@ubuntu:~/Documents/AFL/test$
```

### **White-box testing**

#### **Build using afl-gcc.**

* **Build using the compiler provided by AFL as follows.**
  + You can check that the built file operates normally.
  + Remove Canary for testing. (-fno-stack-protector)

```bash title="afl-gcc -fno-stack-protector -o test test.c"
lazenca0x0@ubuntu:~/Documents/AFL/test$ afl-gcc -fno-stack-protector -o test test.c
afl-cc 2.49b by <lcamtuf@google.com>
test.c: In function 'main':
test.c:9:2: warning: ignoring return value of 'scanf', declared with attribute warn_unused_result [-Wunused-result]
  scanf("%s",login);
  ^
test.c:11:2: warning: ignoring return value of 'scanf', declared with attribute warn_unused_result [-Wunused-result]
  scanf("%s",password);
  ^
afl-as 2.49b by <lcamtuf@google.com>
[+] Instrumented 8 locations (64-bit, non-hardened mode, ratio 100%).
lazenca0x0@ubuntu:~/Documents/AFL/test$ ./test
Login : root
Password : toor
Success.
lazenca0x0@ubuntu:~/Documents/AFL/test$ ./test
Login : a
Password : a
Fail.
lazenca0x0@ubuntu:~/Documents/AFL/test$
```

#### **Run afl-fuzz**

* **You can find "uniq crashes" by running AFL like this:**
  + Two Uniq crashes were found in the test program.
* The options are:
  + -i: Directory path where test cases are stored
  + -o: Directory path to save detected results

```bash title="core_pattern & afl-fuzz"
lazenca0x0@ubuntu:~/Documents/AFL/test$ echo core > /proc/sys/kernel/core_pattern 
lazenca0x0@ubuntu:~/Documents/AFL/test$ mkdir result 
lazenca0x0@ubuntu:~/Documents/AFL/test$ afl-fuzz -i testcase/ -o result/ ./test
afl-fuzz 2.49b by <lcamtuf@google.com>
[+] You have 1 CPU core and 2 runnable tasks (utilization: 200%).
[*] Checking core_pattern...
[*] Setting up output directories...
[+] Output directory exists but deemed OK to reuse.
[*] Deleting old session data...
[+] Output dir cleanup successful.
[*] Scanning 'testcase/'...
[+] No auto-generated dictionary tokens to reuse.
[*] Creating hard links for all input files...
[*] Validating target binary...
[*] Attempting dry run with 'id:000000,orig:test1.txt'...
[*] Spinning up the fork server...
[+] All right - fork server is up.
    len = 4, map size = 34, exec speed = 1428 us
[*] Attempting dry run with 'id:000001,orig:test2.txt'...
    len = 7, map size = 37, exec speed = 596 us
[*] Attempting dry run with 'id:000002,orig:test3.txt'...
    len = 14, map size = 38, exec speed = 740 us
[+] All test cases processed.

[+] Here are some useful stats:

    Test case count : 3 favored, 0 variable, 3 total
       Bitmap range : 34 to 38 bits (average: 36.33 bits)
        Exec timing : 596 to 1428 us (average: 921 us)

[*] No -t option specified, so I'll use exec timeout of 20 ms.
[+] All set and ready to roll!

                        american fuzzy lop 2.49b (test)

┌─ process timing ─────────────────────────────────────┬─ overall results ─────┐
│        run time : 0 days, 0 hrs, 0 min, 17 sec       │  cycles done : 16     │
│   last new path : none yet (odd, check syntax!)      │  total paths : 3      │
│ last uniq crash : 0 days, 0 hrs, 0 min, 11 sec       │ uniq crashes : 2      │
│  last uniq hang : none seen yet                      │   uniq hangs : 0      │
├─ cycle progress ────────────────────┬─ map coverage ─┴───────────────────────┤
│  now processing : 1 (33.33%)        │    map density : 0.06% / 0.07%         │
│ paths timed out : 0 (0.00%)         │ count coverage : 1.00 bits/tuple       │
├─ stage progress ────────────────────┼─ findings in depth ────────────────────┤
│  now trying : havoc                 │ favored paths : 3 (100.00%)            │
│ stage execs : 136/256 (53.12%)      │  new edges on : 3 (100.00%)            │
│ total execs : 29.8k                 │ total crashes : 242 (2 unique)         │
│  exec speed : 1729/sec              │  total tmouts : 0 (0 unique)           │
├─ fuzzing strategy yields ───────────┴───────────────┬─ path geometry ────────┤
│   bit flips : 0/176, 0/173, 0/167                   │    levels : 1          │
│  byte flips : 0/22, 0/19, 0/13                      │   pending : 0          │
│ arithmetics : 0/1228, 0/148, 0/0                    │  pend fav : 0          │
│  known ints : 0/118, 0/532, 0/572                   │ own finds : 0          │
│  dictionary : 0/0, 0/0, 0/24                        │  imported : n/a        │
│       havoc : 2/13.6k, 0/12.9k                      │ stability : 100.00%    │
│        trim : 14.29%/4, 0.00%                       ├────────────────────────┘
^C────────────────────────────────────────────────────┘             [cpu:313%]

+++ Testing aborted by user +++
[+] We're done here. Have a nice day!
lazenca0x0@ubuntu:~/Documents/AFL/test$
```

### **Black-box testing**

#### **Install library files**

* **To proceed with black box testing, the following settings are required.**
  + **Installed libraries:** libini-config-dev, libtool-bin, automake, bison, libglib2.0-dev, qemu

```bash title="Install library files"
lazenca0x0@ubuntu:~/Documents/AFL/afl-2.49b$ apt-get install libini-config-dev libtool-bin automake bison libglib2.0-dev qemu -y
lazenca0x0@ubuntu:~/Documents/AFL/afl-2.49b$ cd qemu_mode/
lazenca0x0@ubuntu:~/Documents/AFL/afl-2.49b/qemu_mode/$ ./build_qemu_support.sh 
lazenca0x0@ubuntu:~/Documents/AFL/afl-2.49b/qemu_mode/$ cd ..
lazenca0x0@ubuntu:~/Documents/AFL/afl-2.49b$ sudo make install
```

#### **Build using gcc**

* **Build using gcc as follows.**

```bash title="Build using gcc"
lazenca0x0@ubuntu:~/Documents/AFL/test$ gcc -fno-stack-protector -o test test.c
```

#### **Run afl-fuzz**

* **Black box testing can be performed as follows.**
  + To proceed with black box testing, you only need to add the -Q option.
  + As with the white box test, two uniq crashes were found.

```bash title="afl-fuzz -Q -i testcase/ -o result/ ./test"
lazenca0x0@ubuntu:~/Documents/AFL/test$ afl-fuzz -Q -i testcase/ -o result/ ./test
afl-fuzz 2.49b by <lcamtuf@google.com>
[+] You have 1 CPU core and 3 runnable tasks (utilization: 300%).
[*] Checking core_pattern...
[*] Setting up output directories...
[+] Output directory exists but deemed OK to reuse.
[*] Deleting old session data...
[+] Output dir cleanup successful.
[*] Scanning 'testcase/'...
[+] No auto-generated dictionary tokens to reuse.
[*] Creating hard links for all input files...
[*] Validating target binary...
[*] Attempting dry run with 'id:000000,orig:test1.txt'...
[*] Spinning up the fork server...
[+] All right - fork server is up.
    len = 4, map size = 33, exec speed = 1898 us
[*] Attempting dry run with 'id:000001,orig:test2.txt'...
    len = 6, map size = 33, exec speed = 1048 us
[!] WARNING: No new instrumentation output, test case may be useless.
[*] Attempting dry run with 'id:000002,orig:test3.txt'...
    len = 9, map size = 36, exec speed = 790 us
[*] Attempting dry run with 'id:000003,orig:test4.txt'...
    len = 6, map size = 33, exec speed = 806 us
[!] WARNING: No new instrumentation output, test case may be useless.
[+] All test cases processed.

[!] WARNING: Some test cases look useless. Consider using a smaller set.
[+] Here are some useful stats:

    Test case count : 2 favored, 0 variable, 4 total
       Bitmap range : 33 to 36 bits (average: 33.75 bits)
        Exec timing : 790 to 1898 us (average: 1135 us)

[*] No -t option specified, so I'll use exec timeout of 20 ms.
[+] All set and ready to roll!

                        american fuzzy lop 2.49b (test)

┌─ process timing ─────────────────────────────────────┬─ overall results ─────┐
│        run time : 0 days, 0 hrs, 0 min, 10 sec       │  cycles done : 5      │
│   last new path : none yet (odd, check syntax!)      │  total paths : 4      │
│ last uniq crash : 0 days, 0 hrs, 0 min, 2 sec        │ uniq crashes : 2      │
│  last uniq hang : none seen yet                      │   uniq hangs : 0      │
├─ cycle progress ────────────────────┬─ map coverage ─┴───────────────────────┤
│  now processing : 1* (25.00%)       │    map density : 0.05% / 0.06%         │
│ paths timed out : 0 (0.00%)         │ count coverage : 1.00 bits/tuple       │
├─ stage progress ────────────────────┼─ findings in depth ────────────────────┤
│  now trying : splice 7              │ favored paths : 2 (50.00%)             │
│ stage execs : 30/32 (93.75%)        │  new edges on : 2 (50.00%)             │
│ total execs : 16.2k                 │ total crashes : 1204 (2 unique)        │
│  exec speed : 1533/sec              │  total tmouts : 0 (0 unique)           │
├─ fuzzing strategy yields ───────────┴───────────────┬─ path geometry ────────┤
│   bit flips : 0/128, 0/124, 0/116                   │    levels : 1          │
│  byte flips : 0/16, 0/12, 0/4                       │   pending : 0          │
│ arithmetics : 0/890, 0/176, 0/0                     │  pend fav : 0          │
│  known ints : 0/80, 0/336, 0/176                    │ own finds : 0          │
│  dictionary : 0/0, 0/0, 0/2                         │  imported : n/a        │
│       havoc : 1/7936, 1/6184                        │ stability : 100.00%    │
│        trim : 42.86%/4, 0.00%                       ├────────────────────────┘
────────────────────────────────────────────────────┘             [cpu:303%]

+++ Testing aborted by user +++
[+] We're done here. Have a nice day!

lazenca0x0@ubuntu:~/Documents/AFL/test$
```

### **Check for the crash.**

* **Uniq **crashes found as follows are stored in the result folder.**
  + You can reproduce the crash using that file.

```bash title="Check for the crash."
lazenca0x0@ubuntu:~/Documents/AFL/test$ ls -al result/crashes/
total 20
drwx------ 2 lazenca0x0 lazenca0x0 4096 Aug  9 01:26 .
drwxrwxr-x 5 lazenca0x0 lazenca0x0 4096 Aug  9 01:26 ..
-rw------- 1 lazenca0x0 lazenca0x0   68 Aug  9 01:26 id:000000,sig:11,src:000000,op:havoc,rep:128
-rw------- 1 lazenca0x0 lazenca0x0   86 Aug  9 01:26 id:000001,sig:11,src:000002+000003,op:splice,rep:128
-rw------- 1 lazenca0x0 lazenca0x0  604 Aug  9 01:26 README.txt
lazenca0x0@ubuntu:~/Documents/AFL/test$ ./test < result/crashes/id\:000000\,sig\:11\,src\:000000\,op\:havoc\,rep\:128 
Login : Password : Fail.
Segmentation fault
lazenca0x0@ubuntu:~/Documents/AFL/test$ ./test < result/crashes/id\:000001\,sig\:11\,src\:000002+000003\,op\:splice\,rep\:128 
Login : Password : Fail.
Segmentation fault
lazenca0x0@ubuntu:~/Documents/AFL/test$
```

* **The following is the contents of the generated crash file.**
  + The stored content has no special meaning.

```bash title="hexdump"
lazenca0x0@ubuntu:~/Documents/AFL/test$ hexdump result/crashes/id\:000000\,sig\:11\,src\:000000\,op\:havoc\,rep\:128 
0000000 81b9 ad13 0000 76e1 04ff 007f eee7 ffff
0000010 64ff 0000 798a 9379 7980 7979 7966 e100
0000020 ff76 7fc0 e700 ffee ffff ffff 7f04 e700
0000030 ffee ffff 0064 6900 7979 7993 7979 0079
0000040 0100 ff00                              
0000044
lazenca0x0@ubuntu:~/Documents/AFL/test$ hexdump result/crashes/id\:000001\,sig\:11\,src\:000002+000003\,op\:splice\,rep\:128 
0000000 6f72 746f 0000 0004 5774 aaaa aaaa aaaa
0000010 aa97 aaaa 0000 8000 5774 aaaa 97a4 aaaa
0000020 00aa 0000 7480 aa57 9faa 72aa 6f6f aa74
0000030 aaaa 97a4 aaaa 16aa aaaa 619c aa57 aaaa
0000040 aaaa 97aa aaaa 00aa 0000 aa80 6f6f aaaa
0000050 72aa 6f6f 6f74                         
0000056
```

## **Related information**

* <http://lcamtuf.coredump.cx/afl/README.txt>
* <http://lcamtuf.coredump.cx/afl/QuickStartGuide.txt>
* <http://lcamtuf.coredump.cx/afl/technical_details.txt>
* <https://lcamtuf.blogspot.jp/2014/10/fuzzing-binaries-without-execve.html>
* <https://lcamtuf.blogspot.jp/2016/02/say-hello-to-afl-analyze.html>
* <https://raw.githubusercontent.com/mirrorer/afl/master/docs/parallel_fuzzing.txt>