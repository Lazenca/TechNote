---
title: "Dyninst"
sidebar_position: 1
---


## **Dyninst**

* **Dyninst is a runtime code patching library useful for developing dynamic program analysis tools and applying them directly to compiled executables.**
* **Dyninst allows programs to be modified while they are executing.**
  + Eliminates the need to recompile, relink, or restart a program to modify binaries for analysis.
* **Dyninst provides an API to inject code into running processes.**
  + It offers a system-independent interface for building tools and applications that leverage runtime code patching.
* **Dyninst supports use cases including:**
  + Performance Measurement Tools
  + Correctness Debuggers (efficient data breakpoints)
  + Execution-driven simulations
  + Computational Steering

### Dyninst Tools

* <http://www.dyninst.org/related/external_tools>

### **Download**

* <http://www.dyninst.org/downloads>
* <https://github.com/dyninst/dyninst>

### **Install**

```bash title="Install Dyninst"
git clone https://github.com/dyninst/dyninst.git
cd dyninst
cmake .
make 
make install
```

:::note[Install]
* <https://github.com/dyninst/dyninst/blob/master/INSTALL>
:::

### **Guide**

* <http://www.dyninst.org/sites/default/files/manuals/dyninst/dyninstAPI.pdf>

## **Examples**

* Each API subdirectory contains a `doc` folder containing documentation and code examples for that specific module.
* Dyninst Examples: <http://www.dyninst.org/dyninstexample>
