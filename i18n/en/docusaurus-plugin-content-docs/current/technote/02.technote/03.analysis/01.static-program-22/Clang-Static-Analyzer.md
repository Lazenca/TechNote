---
title: "Clang Static Analyzer"
sidebar_position: 1
---


## **Clang Static Analyzer**

* **The Clang Static Analyzer is a source code analysis tool that finds bugs in C, C++, and Objective-C programs.**
* **The goal of the Clang Static Analyzer is to provide a free, extensible, and high-quality static analysis framework.**
* **The Clang Static Analyzer can be run either as a standalone tool or within Xcode.**
  + The standalone tool is invoked from the command line and runs alongside the codebase build.
* **The Clang Static Analyzer is part of the Clang project and is open-source software.**
  + It is implemented as a C++ library.
* **The Clang Static Analyzer runs on top of Clang and LLVM.**

### **Important Points to Consider**

#### **Slower than Compilation**

* Compilation may be slower due to the static analyzer's deep analysis.
* Although designed to be fast and lightweight, static analysis cannot be expected to run as quickly as normal program compilation.

#### **False Positives**

* Static analysis is not perfect.
* It may report false-positive bugs in code that functions correctly.

#### **More Checks**

* The static analyzer can only detect bug patterns that it has been specifically designed to check for.

### Download

* Mac OS X: <https://clang-analyzer.llvm.org/downloads/>
* Other Platforms: <https://clang-analyzer.llvm.org/installation#OtherPlatforms>

### Install

* When Clang is installed, `scan-build` is installed by default.

## **Example**

* **Consider the following sample code:**

```c title="Sample.c"
#include <stdio.h>
#include <stdlib.h> 

int main(void)
{
    char *p = malloc(1);
    *p = 'a'; 

    char c = *p; 

    printf("\n [%c]\n",c); 

    free(p);
    c = *p;
    return 0;
}
```

:::note[Reading/writing memory after it has been freed]
* <http://www.thegeekstuff.com/2011/11/valgrind-memcheck/>
:::

* **Build the code using `scan-build` as shown below:**
  + Once the build completes, the number of detected bugs is displayed.

```bash title="Run scan-build"
lazenca0x0@ubuntu:/tmp/test$ scan-build-3.7 gcc test.c 
scan-build: Using '/usr/lib/llvm-3.7/bin/clang' for static analysis
test.c:14:5: warning: Value stored to 'c' is never read
    c = *p;
    ^   ~~
test.c:14:9: warning: Use of memory after it is freed
    c = *p;
        ^~
2 warnings generated.
scan-build: 2 bugs found.
scan-build: Run 'scan-view /tmp/scan-build-2017-11-29-061740-71620-1' to examine bug reports.
lazenca0x0@ubuntu:/tmp/test$
```

* **Use `scan-view` to inspect the details of identified bugs:**

```bash title="Run scan-view"
lazenca0x0@ubuntu:/tmp/test$ scan-view-3.7 /tmp/scan-build-2017-11-29-061740-71620-1
Starting scan-view at: http://127.0.0.1:8181
  Use Ctrl-C to exit.
```

* **Inspect the specific bug details in the generated web report:**

**Report**

| Scan-build results | Report 1 | Report 2 |
| --- | --- | --- |
|![](/img/attachments/11141124/11501659.jpg) |![](/img/attachments/11141124/11501660.jpg) |![](/img/attachments/11141124/11501661.jpg) |

## **Related site**

* <https://clang-analyzer.llvm.org/>
* <https://clang-analyzer.llvm.org/scan-build.html>
