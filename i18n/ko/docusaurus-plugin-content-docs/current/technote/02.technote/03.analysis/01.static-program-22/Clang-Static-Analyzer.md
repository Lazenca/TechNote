---
title: "Clang Static Analyzer"
sidebar_position: 1
---


## **Clang Static Analyzer**

* **Clang 정적 분석기는 C, C++ 및 Objective-C 프로그램에서 버그를 찾는 소스 코드 분석 도구 입니다.**
* **Clang 정적 분석기의 목표는 자유롭고 확장 가능하며 높은 구현 품질을 갖춘 정적 분석 프레임 워크를 제공하는 것이라고 합니다.**
* **Clang 정적 분석기는 독립 실행 형태 또는 Xcode 내에서 사용 할 수 있습니다.**
  + 독립 실행 혙애는 명령 줄에서 호출되며 코드 베이스의 빌드와 함께 실행됩니다.
* **Clang 정적 분석기는 Clang 프로젝트의 일부이며 Open source code 입니다**
  + C++ 라이브러리로 구현되어 있습니다.
* **Clang 정적 분석기는 Clang와 LLVM 위에서 동작합니다.**

### **Important Points to Consider**

#### **Slower than Compilation**

* 정적 분석기의 분석 때문에 컴파일이 느릴 수 있습니다.
* 정적 분석기는 빠르고 경량화되도록 설계되었지만, 프로그램을 일반적으로 컴파일하는 것만큼의 빠른 속도를 기대할 수 없습니다.

#### **False Positives**

* 정적 분석은 완벽하지 않습니다.
* 코드가 올바르게 작동하는 프로그램에서 버그를 잘못 표시 할 수 있습니다.

#### **More Checks**

* 정적 분석기는 버그를 찾기 위해 특별히 설계된 버그들만 찾을 수 있습니다.

### Download

* Mac OS X: <https://clang-analyzer.llvm.org/downloads/>
* Other Platforms: <https://clang-analyzer.llvm.org/installation#OtherPlatforms>

### Install

* Clang를 설치하면 기본적으로 Scan-build가 설치됩니다.

## **Example**

* **다음과 같은 테스트 코드를 사용합니다.**

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

* **다음과 같이 scan-build를 이용해 코드를 빌드합니다.**
  + 빌드가 완료되면 확인된 버그의 갯수를 출력합니다.

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

* **다음과 같이 scan-view를 이용해 확인된 버그의 내용을 확인 할 수 있습니다.**

```bash title="Run scan-view"
lazenca0x0@ubuntu:/tmp/test$ scan-view-3.7 /tmp/scan-build-2017-11-29-061740-71620-1
Starting scan-view at: http://127.0.0.1:8181
  Use Ctrl-C to exit.
```

* **다음과 같이 웹페이지에서 구체적인 버그의 내용을 확인 할 수 있습니다.**

**Report**

| Scan-build results | Report 1 | Report 2 |
| --- | --- | --- |
|![](/img/attachments/11141124/11501659.jpg) |![](/img/attachments/11141124/11501660.jpg) |![](/img/attachments/11141124/11501661.jpg) |

## **Related site**

* <https://clang-analyzer.llvm.org/>
* <https://clang-analyzer.llvm.org/scan-build.html>