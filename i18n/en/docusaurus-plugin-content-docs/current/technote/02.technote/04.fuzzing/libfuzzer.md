---
title: "libFuzzer"
sidebar_position: 1
---


## **LibFuzzer**

* **LibFuzzer is linked to the library being tested.**
* **In LibFuzzer, Fuzz input is passed through a specific input point (function to be analyzed).**
* **LibFuzzer tracks which areas of the code a library's input reaches through specific entry points.**
* **LibFuzzer generates variants on a corpus of input data to maximize code coverage.**
* **LibFuzzer's code coverage information is provided by LLVM's [SanitizerCoverage](http://clang.llvm.org/docs/SanitizerCoverage.html) instrument.**

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

* **The first step in LibFuzzer is to implement the Fuzz target, as follows:**
  + Perform fuzzing by receiving a Byte array as input using the LLVMFuzzerTestOneInput() function.

```c title="fuzz_target.cc" 
extern "C" int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size) {
  DoSomethingInterestingWithMyAPI(Data, Size);
  return 0;  // Non-zero return values are reserved for future use.
}
```

* **Important things to Fuzz about include:**
  + The fuzzing target is executed multiple times by receiving different input values ​​from the same process by the fuzzing engine.
  + The fuzz target must not be terminated by any kind of input.
  + The fuzz target must not exit()ed by any input.
  + The fuzz target can use a Thread, but ideally all threads should be joined at the end of the function.
  + The fuzzing target must be deterministic.  
    - If it is non-deterministic, fuzzing may be inefficient.
  + Because fuzzing targets are very fast, you should avoid large complexity, logging, or excessive memory consumption.
  + The fuzz target must not change global state.
  + When it comes to fuzzing targets, the narrower the target, the generally better.
* **Fuzz targets do not depend on LibFuzzer, and it is possible and desirable to use them with other fuzzing engines.**
  + AFL, Radamsa

#### **libFuzz build**

* **You can build your fuzz target like this:**

```bash title="Build fuzzer target"
clang -fsanitize-coverage=trace-pc-guard -fsanitize=addresss your_lib.cc fuzz_target.cc libFuzzer.a -o my_fuzzer
```

* **And you can use Sanitizer at build time like this:**
  + AddresssSanitizer (ASAN): Detects memory access errors.
  + UndefinedBehaviorSanitizer (UBSAN): Detects undefined behavior during execution.
  + MemorySanitizer (MSAN): MemorySanitizer detects references to uninitialized memory at runtime.

#### **Run**

* **You can run Fuzz in the following format.**

```bash title="Run fuzzer target"
./fuzzer [-flag1=val1 [-flag2=val2 ...] ] [dir1 [dir2 ...] ]
```

* **You can check more options on the site below.**

:::note[Options]
* <https://releases.llvm.org/5.0.0/docs/LibFuzzer.html#options>
:::

### **Example - Heartbleed**

* **This example is provided on the page below.**
  + <https://github.com/google/fuzzer-test-suite/blob/master/tutorial/libFuzzerTutorial.md>
  + In addition, there are many test cases at [https://github.com/google/fuzzer-test-suite](https://github.com/google/fuzzer-test-suite/blob/master/tutorial/libFuzzerTutorial.md).

#### **Get the tutorial**

```bash title="Get the tutorial"
sudo apt-get --yes install git
git clone https://github.com/google/fuzzer-test-suite.git FTS
./FTS/tutorial/install-deps.sh  # Get deps
./FTS/tutorial/install-clang.sh # Get fresh clang binaries
```

#### **Source code**

* **The code below is a Fuzz code to find Heartbleed vulnerabilities using libFuzzer.**
  + Fuzz's Data and size arguments are passed to the BIO\_write() function.

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

* **The prototype of the BIO\_write() function is as follows.**

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