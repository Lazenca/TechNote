---
title: "Wadi"
sidebar_position: 1
---


## **Wadi**

* **Wadi is a fuzzing tool designed for Microsoft Edge on Windows 10.**
* **Wadi consists of a debugger (WinAppDbg) and a web server (Python Twisted):**
  + The debugger launches Edge and attaches to `MicrosoftEdgeCP.exe`, `RuntimeBroker.exe`, and `MicrosoftEdge.exe` to monitor for crashes.
  + The web server generates test cases using Google's PyV8 engine and serves them in response to browser requests.
* **Wadi is modularized, allowing its components to be used independently.**
* **Grammar definition files and test generation algorithms are decoupled from the core framework, allowing users to plug in custom grammars and test generators.**

### **Prerequisites**

* **Prerequisites for running Wadi:**
  + Python WinAppDbg by Mario Vilas (`pip install winappdbg`): <http://winappdbg.sourceforge.net/Downloads.html>
  + diStorm disassembler: <https://distorm.googlecode.com/files/distorm3-3.win-amd64.exe> OR <https://github.com/gdabah/distorm>
  + Google PyV8 Engine for Windows: <https://code.google.com/p/pyv8/downloads/list>
  + Twisted (`pip install twisted`): <https://pypi.python.org/pypi/Twisted>

### Run

```bash title="Run Wadi"
wadi.py [Grammar File] [PORT]
- The javascript Grammar file.
- Port for the web server to listen on.
```

### Running Wadi With NodeFuzz

* Add `wadi-nodefuzz-module.js` and `randoms.js` to the NodeFuzz `Modules` directory and invoke as follows:

```bash title="Run Wadi With NodeFuzz"
node nodefuzz.js -m ./Modules/wadi-nodefuzz-module.js -c [CONFIG]
```

## **Related site**

* <https://github.com/sensepost/wadi>