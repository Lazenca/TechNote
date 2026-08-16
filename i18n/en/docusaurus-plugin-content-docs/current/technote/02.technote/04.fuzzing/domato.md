---
title: "Domato"
sidebar_position: 1
---


## **Domato**

* **Domato is a DOM fuzzer**
* ****Domato operates by two Python script files.****
  + The generator.py file is the main script.
  + The grammar.py file contains additional help code for libraries and DOM fuzzing.
  + \*.txt files store HTML, CSS, and JavaScript syntax.
    - html.txt, css.txt, js.txt
* ****We used Domato to find vulnerabilities in the five browsers with the highest market share****  
  + ****Give approximately 100,000,000 iterations and log crashes****

### **Additional details of the fuzzing setup**

#### **Google Chrome**

* It uses a security fuzzing cluster inside Chrome called [ClusterFuzz](http://dev.chromium.org/Home/chromium-security/bugs/using-clusterfuzz).
* Upload your fuzzer to ClusterFuzz and it will run automatically for various Chrome builds.

#### **Mozilla Firefox**

* Mozilla already provides [Firefox ASAN builds](https://developer.mozilla.org/en-US/docs/Mozilla/Testing/Firefox_and_Addresss_Sanitizer), and [Firefox ASAN Builds](https://developer.mozilla.org/en-US/docs/Mozilla/Testing/Firefox_and_Addresss_Sanitizer).
* Additional verification is required for each release version.

#### **Apple Safari**

* It uses WebKitGTK+, which runs on Linux-based infrastructure.
* You need to create an ASAN build using the WebKitGTK+ release version.
* Each confirmed crash is checked again in ASAN WebKit build running on Mac.

:::note[Experimenting with coverage-guided DOM fuzzing]
* <https://googleprojectzero.blogspot.jp/2017/09/the-great-dom-fuzz-off-of-2017.html>
:::

### **Usage**

* **You can install Domato as follows.**

```bash title="Install Domato"
$ git clone https://github.com/google/domato.git ~/domato
$ cd domato
```

* **You can create one sample file as follows.**

```bash title="Create single fuzz file"
$ python generator.py sample.html
```

* **You can create multiple sample files in the following way.**

```bash title="Create multiple fuzz files"
$ mkdir sample
$ python generator.py --output_dir sample --no_of_files 100
```

### **Example**

#### **Create fuzz file**

```bash title="Create fuzz file"
lazenca0x0@ubuntu:~/domato$ python generator.py sample.html
Writing a sample to sample.html
lazenca0x0@ubuntu:~/domato$
```

```bash title="Create multiple fuzz files"
lazenca0x0@ubuntu:~/domato$ python generator.py --output_dir sample --no_of_files 10
Running on ClusterFuzz
Output directory: sample
Number of samples: 10
Writing a sample to sample/fuzz-0.html
Writing a sample to sample/fuzz-1.html
Writing a sample to sample/fuzz-2.html
Writing a sample to sample/fuzz-3.html
Writing a sample to sample/fuzz-4.html
Writing a sample to sample/fuzz-5.html
Writing a sample to sample/fuzz-6.html
Writing a sample to sample/fuzz-7.html
Writing a sample to sample/fuzz-8.html
Writing a sample to sample/fuzz-9.html
lazenca0x0@ubuntu:~/domato$
```

#### **Test fuzz file**

**Read fuzz file**

| fuzz-0.html | fuzz-1.html |
| --- | --- |
|![](/img/attachments/11501633/11501706.jpg)  |![](/img/attachments/11501633/11501707.jpg)  |

## **Related site**

* <https://github.com/google/domato>
* <https://googleprojectzero.blogspot.jp/2017/09/the-great-dom-fuzz-off-of-2017.html>
* <https://chromium.googlesource.com/chromium/src/+/master/testing/libfuzzer/README.md>