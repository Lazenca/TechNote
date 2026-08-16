---
title: "Boofuzz"
sidebar_position: 1
---


## **Boofuzz**

* **Boofuzz ​​is a Network Protocol Fuzzing framework.**
* **Boofuzz ​​is the successor to the Sully fuzzing framework.**
* ****Boofuzz ​​includes all the important elements of Sully****
  + Easy and fast data generation
  + Metrology – aka fault detection
  + Reset target after failure
  + Test data recording
* ****Boofuzz ​​also offers other features than Sully, including:****  
  + easy installation
  + Supports arbitrary communication media
  + Supports serial fuzzing, Ethernet and IP layers, UDP broadcast
  + Record test data consistently, thoroughly, and clearly.
  + Export test results to CSV.
  + Scalable instrumentation and fault detection

### Install

```bash title="Install boofuzz"
pip install boofuzz
```

:::note[Install]
* <http://boofuzz.readthedocs.io/en/latest/index.html#installation>
:::

### API

* <http://boofuzz.readthedocs.io/en/latest/index.html#api-documentation>

## **Example**

### Install vsftpd.

```bash title="Install vsftpd"
sudo apt-get install vsftpd
```

### **Run fuzz**

#### **Source code**

```python title="https://raw.githubusercontent.com/jtpereyda/boofuzz-ftp/master/ftp.py"
#!/usr/bin/env python
# Designed for use with boofuzz v0.0.1-dev3
from boofuzz import *

def main():
    session = Session(
        target=Target(
            connection=SocketConnection("127.0.0.1", 21, proto='tcp')))

    s_initialize("user")
    s_string("USER")
    s_delim(" ")
    s_string("anonymous")
    s_static("\r\n")

    s_initialize("pass")
    s_string("PASS")
    s_delim(" ")
    s_string("james")
    s_static("\r\n")

    s_initialize("stor")
    s_string("STOR")
    s_delim(" ")
    s_string("AAAA")
    s_static("\r\n")

    s_initialize("retr")
    s_string("RETR")
    s_delim(" ")
    s_string("AAAA")
    s_static("\r\n")

    session.connect(s_get("user"))
    session.connect(s_get("user"), s_get("pass"))
    session.connect(s_get("pass"), s_get("stor"))
    session.connect(s_get("pass"), s_get("retr"))

    session.fuzz()

if __name__ == "__main__":
    main()
```

#### **Run**

```bash title="Run FTP fuzz"
python ftp.py > fuzz-logs.txt
```

#### **Web**

**[http://127.0.0.1:26000/![](/img/attachments/images/icons/linkext7.gif)](http://127.0.0.1:26000/)**

![](/img/attachments/11501627/11501702.jpg)

:::note
* <https://github.com/jtpereyda/boofuzz-ftp>
* <https://github.com/jtpereyda/boofuzz-http>
:::

## **Related site**

* <http://boofuzz.readthedocs.io/en/latest/>