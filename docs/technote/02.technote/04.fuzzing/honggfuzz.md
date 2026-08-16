---
title: "Honggfuzz"
sidebar_position: 1
---


## **Honggfuzz**

* **Honggfuzz is a project managed by google.**
* **Honggfuzz is multi-threaded and multi-processed.**
  + So there is no need to make multiple copies of the fuzzer.
  + Honggfuzz can take advantage of any available CPU core.
  + Honggfuzz shares corpus files between threads.
* **Honggfuzz discovered a critical vulnerability in OpenSSL.**
  + [Fix Use After Free for large message sizes (CVE-2016-6309)](https://www.openssl.org/news/secadv/20160926.txt)
* **Honggfuzz uses a low-level interface to monitor processes.**
  + This makes Honggfuzz discover and report hidden signals unlike other fuzzers.
* **Honggfuzz operates by delivering a simple corpus and expanding it using feedback-based coverage metrics.**
* **Honggfuzz supports running other hardware-based and software-based fuzzers.**
  + software-based: libfuzzer, afl
  + hardware-based: branch/instruction counting, Intel BTS, Intel PT
  + [Feedback-driven fuzzing](https://github.com/google/honggfuzz/blob/master/docs/FeedbackDrivenFuzzing.md)
* **Honggfuzz** supports [Continuous purge mode](https://github.com/google/honggfuzz/blob/master/docs/PersistentFuzzing.md) using** "liubfuzz/PULIBROOzza.a".
* **Honggfuzz can fuzz remote/standalone processes smoothly for long periods of time.**
  + [Can fuzz remote/standalone long-lasting processes](https://github.com/google/honggfuzz/blob/master/docs/AttachingToPid.md)
* **Honggfuzz operates in the following environments.**

| OS | Status | Notes |
| --- | --- | --- |
| GNU/Linux | Works | ptrace() API (x86, x86-64 disassembly support) |
| FreeBSD | Works | POSIX signal interface |
| Mac OS X | Works | POSIX signal interface/Mac OS X crash reports (x86-64/x86 disassembly support) |
| Android | Works | ptrace() API (x86, x86-64 disassembly support) |
| MS Windows | Works | POSIX signal interface via CygWin |
| Other Unices | Depends`*` | POSIX signal interface |

### Install

```bash title="Install Honggfuzz"
$ sudo apt-get update
$ sudo apt-get install clang-5.0
$ sudo apt-get install binutils-dev
$ sudo apt-get install libunwind8-dev or libunwind-dev
$ git clone https://github.com/google/honggfuzz.git
$ cd honggfuzz
$ make
$ ./honggfuzz
```

### **Usage**

```bash title="Usage"
$./honggfuzz [options] -- path_to_command [args]
```

:::note[Usage]
* <https://github.com/google/honggfuzz/blob/master/docs/USAGE.md>
:::

### **Example(Fuzzing OpenSSL)**

* **This is explained using an example provided by honggfuzz, and the target is OpenSSL.**
  + Since libFuzzer is also used in this example, installation of libFuzzer is also required.

```bash title="Example"
$ cd honggfuzz/example/openssl/
```

* **First, you need to reset the path where Honggfuzz is installed in the 2 files below.**

```bash title="compile_hfuzz_openssl_master.sh"
export CC="honggfuzz path"/hfuzz_cc/hfuzz-clang
```

```bash title="make.sh"
HFUZZ_SRC = "honggfuzz path"
```

* **Download and build the open-ssl source as follows.**

```bash title="Download and Build"
$ git clone --depth=1 https://github.com/openssl/openssl.git
$ mv openssl openssl-master
$ cd openssl-master/
$ ./config
$ ~/Fuzz/honggfuzz/examples/openssl/compile_hfuzz_openssl_master.sh
```

* **Fuzz is performed using the corpus provided by honggfuzz as follows.**

```bash title="Fuzzing"
lazenca0x0@ubuntu:~/Fuzz/honggfuzz/examples/openssl$ ~/Fuzz/honggfuzz/honggfuzz -f corpus_server/ -P -- ./stdin.openssl-master.addresss.server 

PID: 6978, inputDir 'corpus_server/', nullifyStdio: true, fuzzStdin: false, saveUnique: true, mutationsPerRun: 6, externalCommand: 'NULL', runEndTime: 0 tmOut: 10, mutationsMax: 0, threads.threadsMax: 1, fileExtn: 'fuzz', ASLimit: 0x0(MiB), RSSLimit: 0x0, DATALimit: 0x0, fuzzExe: './stdin.openssl-master.addresss.server', fuzzedPid: 0, monitorSIGABRT: 'true'

[2017-12-04T19:41:58-0800][W][6978] files_readFileToBufMax():50 Couldn't open '/sys/bus/event_source/devices/intel_pt/type' for R/O: No such file or directory

[2017-12-04T19:41:58-0800][W][6978] files_readFileToBufMax():50 Couldn't open '/sys/bus/event_source/devices/intel_bts/type' for R/O: No such file or directory
Entering phase 1/2: Dry Run

--------------------------- [ HONGGFUZZ / v1.2 ] ------------------------------
  Iterations : 23687 [23.69k]
       Phase : Dynamic Main (2/2)
    Run Time : 0 hrs 8 min 22 sec
   Input Dir : [1606] 'corpus_server/'
  Fuzzed Cmd : './stdin.openssl-master.addresss.server'
     Threads : 1, CPUs: 1, CPU%: 100% (100%/CPU)
       Speed : 35/sec (avg: 47)
     Crashes : 0 (unique: 0, blacklist: 0, verified: 0)
    Timeouts : 0 [10 sec.]
 Corpus Size : 1, max file size: 131072
    Coverage : edge: 4801 pc: 107 cmp: 58613
---------------------------------- [ LOGS ] -----------------------------------
Persistent mode: Launched new persistent PID: 30653
[2017-12-04T19:50:19-0800][W][6979] arch_checkWait():314 Persistent mode: PID 30653 exited with status: EXITED, exit code: 0
Persistent mode: Launched new persistent PID: 30654
[2017-12-04T19:50:19-0800][W][6979] arch_checkWait():314 Persistent mode: PID 30654 exited with status: EXITED, exit code: 0
Persistent mode: Launched new persistent PID: 30655
```

* **honggfuzz** provides various examples in addition to openssl **.

:::note[Example]
* <https://github.com/google/honggfuzz/tree/master/examples>
:::

## **Related site**

* <http://honggfuzz.com/>
* <https://github.com/google/honggfuzz>