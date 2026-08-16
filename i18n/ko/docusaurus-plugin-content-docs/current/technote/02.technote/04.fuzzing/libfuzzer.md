---
title: "libFuzzer"
sidebar_position: 1
---


## **LibFuzzer**

* **LibFuzzer는 테스트 대상 라이브러리와 연결되어 있습니다.**
* **LibFuzzer는 Fuzz 입력은 특정 입력 지점(분석 대상 함수)을 통해 전달됩니다.**
* **LibFuzzer는 라이브러리는 특정 진입 점을 통해 입력 값이 코드의 어느 영역에 도달했는데 추적합니다.**
* **LibFuzzer는 코드 커버리지를 최대화하기 위해 입력 데이터의 코퍼스 (corpus)에 변형을 생성한다.**
* **LibFuzzer의 코드 범위 정보는 LLVM의 [SanitizerCoverage](http://clang.llvm.org/docs/SanitizerCoverage.html) 계측기에서 제공합니다.**

:::note
* <http://apt.llvm.org/>
:::

### **Install**

#### **Clang 5.0**

```bash title="Install Clang 5.0"
sudo vi /etc/apt/sources.list.d/llvm.list
wget -O - http://apt.llvm.org/llvm-snapshot.gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install clang-5.0
```

#### **libFuzz build**

```bash title="Build libFuzz"
svn co http://llvm.org/svn/llvm-project/compiler-rt/trunk/lib/fuzzer Fuzzer
Fuzzer/build.sh
```

### **Usage**

#### **Set target**

* **다음과 같이 LibFuzzer의 첫 번재 단계는 Fuzz 대상을 구현하는 것입니다.**
  + LLVMFuzzerTestOneInput() 함수를 이용해 Byte 배열을 입력받아 fuzzing을 수행합니다.

```c title="fuzz_target.cc" 
extern "C" int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size) {
  DoSomethingInterestingWithMyAPI(Data, Size);
  return 0;  // Non-zero return values are reserved for future use.
}
```

* **Fuzz 대상에 중요한 사항은 다음과 같습니다.**
  + 퍼징 대상은 퍼징 엔진에 의해 동일한 프로세스에 다른 입력 값을 전달받아 여러번 실행합니다.
  + 퍼징 대상은 어떠한 종류의 입력에도 종료되어서는 안됩니다.
  + 퍼징 대상은 어떤 입력에 의해 exit() 하지 않아야 합니다.
  + 퍼징 대상은 Thread를 사용할 수 있지만, 이상적으로는 모든 스레드는 함수의 끝에서 결합되어야 합니다.
  + 퍼징 대상은 결정론적(deterministic) 이어야 합니다.  
    - 비결정론적(Non-determinism)일 경우 퍼징이 비효율적 일 수 있습니다.
  + 퍼징 대상은 매우 빠르기 때문에 큰 복잡성, 로깅 또는 과도한 메모리 소비를 피해야 합니다.
  + 퍼징 대상은 전역 상태를 변경해서는 안됩니다.
  + 퍼징 대상은 일반적으로 대상이 좁을수록 좋습니다.
* **Fuzz 대상은 LibFuzzer에 의존하지 않으며, 다른 Fuzzing 엔진들과 함게 사용하는 것이 가능하며 바람직합니다.**
  + AFL, Radamsa

#### **libFuzz build**

* **다음과 같이 퍼징 대상을 빌드 할 수 있습니다.**

```bash title="Build fuzzer target"
clang -fsanitize-coverage=trace-pc-guard -fsanitize=addresss your_lib.cc fuzz_target.cc libFuzzer.a -o my_fuzzer
```

* **그리고 빌드시 다음과 같이 Sanitizer를 사용할 수 있습니다.**
  + AddresssSanitizer (ASAN) : 메모리 액세스 오류를 감지합니다.
  + UndefinedBehaviorSanitizer (UBSAN) : 정의되지 않은 행동을 실행 중에 탐지 합니다.
  + MemorySanitizer (MSAN) : MemorySanitizer는 초기화되지 않은 메모리의 참조를 실행 중에 탐지합니다.

#### **Run**

* **다음과 같은 형태로 Fuzz를 실행 할 수 있습니다.**

```bash title="Run fuzzer target"
./fuzzer [-flag1=val1 [-flag2=val2 ...] ] [dir1 [dir2 ...] ]
```

* **아래 Site에서 더 많은 옵션을 확인 할 수 있습니다.**

:::note[Options]
* <https://releases.llvm.org/5.0.0/docs/LibFuzzer.html#options>
:::

### **Example - Heartbleed**

* **해당 예제는 아래 페이지에서 제공하는 예제 입니다.**
  + <https://github.com/google/fuzzer-test-suite/blob/master/tutorial/libFuzzerTutorial.md>
  + 이외에도 [https://github.com/google/fuzzer-test-suite](https://github.com/google/fuzzer-test-suite/blob/master/tutorial/libFuzzerTutorial.md) 에 많은 테스트 케이스가 있습니다.

#### **Get the tutorial**

```bash title="Get the tutorial"
sudo apt-get --yes install git
git clone https://github.com/google/fuzzer-test-suite.git FTS
./FTS/tutorial/install-deps.sh  # Get deps
./FTS/tutorial/install-clang.sh # Get fresh clang binaries
```

#### **Source code**

* **아래 코드는 libFuzzer를 이용해 Heartbleed 취약성을 찾기 위한 Fuzz 코드입니다.**
  + Fuzz의 Data, size 인수를 BIO\_write() 함수에 전달됩니다.

```c title="libFuzzer - Heartbleed"
// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
#include <openssl/ssl.h>
#include <openssl/err.h>
#include <assert.h>
#include <stdint.h>
#include <stddef.h>

SSL_CTX *Init() {
  SSL_library_init();
  SSL_load_error_strings();
  ERR_load_BIO_strings();
  OpenSSL_add_all_algorithms();
  SSL_CTX *sctx;
  assert (sctx = SSL_CTX_new(TLSv1_method()));
  /* These two file were created with this command:
      openssl req -x509 -newkey rsa:512 -keyout server.key \
     -out server.pem -days 9999 -nodes -subj /CN=a/
  */
  assert(SSL_CTX_use_certificate_file(sctx, "runtime/server.pem",
                                      SSL_FILETYPE_PEM));
  assert(SSL_CTX_use_PrivateKey_file(sctx, "runtime/server.key",
                                     SSL_FILETYPE_PEM));
  return sctx;
}
extern "C" int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size) {
  static SSL_CTX *sctx = Init();
  SSL *server = SSL_new(sctx);
  BIO *sinbio = BIO_new(BIO_s_mem());
  BIO *soutbio = BIO_new(BIO_s_mem());
  SSL_set_bio(server, sinbio, soutbio);
  SSL_set_accept_state(server);
  BIO_write(sinbio, Data, Size);
  SSL_do_handshake(server);
  SSL_free(server);
  return 0;
}
```

* **BIO\_write() 함수의 원형은 다음과 같습니다.**

```c title="SYNOPSIS"
int    BIO_write(BIO *b, const void *buf, int len);
```

:::note[Openssl docs]
* <https://www.openssl.org/docs/man1.0.2/crypto/BIO_write.html>
:::

#### **Build the fuzzer for openssl-1.0.1f**

```bash title="Build the fuzzer for openssl-1.0.1f"
mkdir -p ~/heartbleed; rm -rf ~/heartbleed/*; cd ~/heartbleed
~/FTS/openssl-1.0.1f/build.sh
```

#### **running the** fuzzer

```bash title="Run the fuzzer"
./openssl-1.0.1f-libfuzzer
```

#### **Result**

```bash title="Error message"
==50480==ERROR: AddresssSanitizer: heap-buffer-overflow on addresss 0x629000009748 at pc 0x0000004a7752 bp 0x7ffd9c2cbc20 sp 0x7ffd9c2cb3d0
READ of size 46517 at 0x629000009748 thread T0
    #0 0x4a7751 in __asan_memcpy /home/brian/final/llvm.src/projects/compiler-rt/lib/asan/asan_interceptors.cc:466:3
    #1 0x4f8082 in tls1_process_heartbeat /home/lazenca0x0/heartbleed/BUILD/ssl/t1_lib.c:2586:3
    #2 0x568a29 in ssl3_read_bytes /home/lazenca0x0/heartbleed/BUILD/ssl/s3_pkt.c:1092:4
    #3 0x56d201 in ssl3_get_message /home/lazenca0x0/heartbleed/BUILD/ssl/s3_both.c:457:7
    #4 0x5363b9 in ssl3_get_client_hello /home/lazenca0x0/heartbleed/BUILD/ssl/s3_srvr.c:941:4
    #5 0x532462 in ssl3_accept /home/lazenca0x0/heartbleed/BUILD/ssl/s3_srvr.c:357:9
    #6 0x4eb91c in LLVMFuzzerTestOneInput /home/lazenca0x0/Fuzz/FTS/openssl-1.0.1f/target.cc:34:3
    #7 0x823534 in fuzzer::Fuzzer::ExecuteCallback(unsigned char const*, unsigned long) /home/lazenca0x0/Fuzz/Fuzzer/FuzzerLoop.cpp:515:13
    #8 0x822d98 in fuzzer::Fuzzer::RunOne(unsigned char const*, unsigned long, bool, fuzzer::InputInfo*, bool*) /home/lazenca0x0/Fuzz/Fuzzer/FuzzerLoop.cpp:440:3
    #9 0x824475 in fuzzer::Fuzzer::MutateAndTestOne() /home/lazenca0x0/Fuzz/Fuzzer/FuzzerLoop.cpp:649:19
    #10 0x824e15 in fuzzer::Fuzzer::Loop(std::vector<std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> >, fuzzer::fuzzer_allocator<std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> > > > const&) /home/lazenca0x0/Fuzz/Fuzzer/FuzzerLoop.cpp:779:5
    #11 0x81ab0c in fuzzer::FuzzerDriver(int*, char***, int (*)(unsigned char const*, unsigned long)) /home/lazenca0x0/Fuzz/Fuzzer/FuzzerDriver.cpp:754:6
    #12 0x816260 in main /home/lazenca0x0/Fuzz/Fuzzer/FuzzerMain.cpp:20:10
    #13 0x7f998d0f982f in __libc_start_main /build/glibc-bfm8X4/glibc-2.23/csu/../csu/libc-start.c:291
    #14 0x41ca28 in _start (/home/lazenca0x0/heartbleed/openssl-1.0.1f-libfuzzer+0x41ca28)

0x629000009748 is located 0 bytes to the right of 17736-byte region [0x629000005200,0x629000009748)
allocated by thread T0 here:
    #0 0x4bdc13 in __interceptor_malloc /home/brian/final/llvm.src/projects/compiler-rt/lib/asan/asan_malloc_linux.cc:67:3
    #1 0x59daed in CRYPTO_malloc /home/lazenca0x0/heartbleed/BUILD/crypto/mem.c:308:8
    #2 0x56e84a in freelist_extract /home/lazenca0x0/heartbleed/BUILD/ssl/s3_both.c:708:12
    #3 0x56e84a in ssl3_setup_read_buffer /home/lazenca0x0/heartbleed/BUILD/ssl/s3_both.c:770
    #4 0x56ee3e in ssl3_setup_buffers /home/lazenca0x0/heartbleed/BUILD/ssl/s3_both.c:827:7
    #5 0x533022 in ssl3_accept /home/lazenca0x0/heartbleed/BUILD/ssl/s3_srvr.c:292:9
    #6 0x4eb91c in LLVMFuzzerTestOneInput /home/lazenca0x0/Fuzz/FTS/openssl-1.0.1f/target.cc:34:3
    #7 0x823534 in fuzzer::Fuzzer::ExecuteCallback(unsigned char const*, unsigned long) /home/lazenca0x0/Fuzz/Fuzzer/FuzzerLoop.cpp:515:13
    #8 0x82498b in fuzzer::Fuzzer::ReadAndExecuteSeedCorpora(std::vector<std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> >, fuzzer::fuzzer_allocator<std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> > > > const&) /home/lazenca0x0/Fuzz/Fuzzer/FuzzerLoop.cpp:702:3
    #9 0x824ca5 in fuzzer::Fuzzer::Loop(std::vector<std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> >, fuzzer::fuzzer_allocator<std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> > > > const&) /home/lazenca0x0/Fuzz/Fuzzer/FuzzerLoop.cpp:740:3
    #10 0x81ab0c in fuzzer::FuzzerDriver(int*, char***, int (*)(unsigned char const*, unsigned long)) /home/lazenca0x0/Fuzz/Fuzzer/FuzzerDriver.cpp:754:6
    #11 0x816260 in main /home/lazenca0x0/Fuzz/Fuzzer/FuzzerMain.cpp:20:10
    #12 0x7f998d0f982f in __libc_start_main /build/glibc-bfm8X4/glibc-2.23/csu/../csu/libc-start.c:291

SUMMARY: AddresssSanitizer: heap-buffer-overflow /home/brian/final/llvm.src/projects/compiler-rt/lib/asan/asan_interceptors.cc:466:3 in __asan_memcpy
Shadow bytes around the buggy addresss:
  0x0c527fff9290: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x0c527fff92a0: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x0c527fff92b0: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x0c527fff92c0: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
  0x0c527fff92d0: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
=>0x0c527fff92e0: 00 00 00 00 00 00 00 00 00[fa]fa fa fa fa fa fa
  0x0c527fff92f0: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
  0x0c527fff9300: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
  0x0c527fff9310: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
  0x0c527fff9320: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
  0x0c527fff9330: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
Shadow byte legend (one shadow byte represents 8 application bytes):
  Addresssable:           00
  Partially addresssable: 01 02 03 04 05 06 07 
  Heap left redzone:       fa
  Freed heap region:       fd
  Stack left redzone:      f1
  Stack mid redzone:       f2
  Stack right redzone:     f3
  Stack after return:      f5
  Stack use after scope:   f8
  Global redzone:          f9
  Global init order:       f6
  Poisoned by user:        f7
  Container overflow:      fc
  Array cookie:            ac
  Intra object redzone:    bb
  ASan internal:           fe
  Left alloca redzone:     ca
  Right alloca redzone:    cb
==50480==ABORTING
MS: 1 CMP- DE: "\x01\x00\x00\x00\x00\x00\x00\x00"-; base unit: 3aeba81bfb1ae427af4887184348a1bfcfcc6d0f
0x10,0x3,0x1,0x0,0x0,0x18,0x3,0xff,0x0,0x1,0x1,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x1,0x17,
\x10\x03\x01\x00\x00\x18\x03\xff\x00\x01\x01\x00\x00\x00\x00\x00\x00\x00\x01\x17
artifact_prefix='./'; Test unit written to ./crash-9c58ddb7016db1ffc262d7c23aad2d1f458e2b76
Base64: EAMBAAAYA/8AAQEAAAAAAAAAARc=
lazenca0x0@ubuntu:~/heartbleed$
```

## **Related site**

* <https://llvm.org/docs/LibFuzzer.html>
* <https://github.com/google/fuzzer-test-suite/blob/master/tutorial/libFuzzerTutorial.md>
* <https://chromium.googlesource.com/chromium/src/testing/libfuzzer/+/HEAD/getting_started.md>
* <https://chromium.googlesource.com/chromium/src/testing/libfuzzer/+/HEAD/clusterfuzz.md>