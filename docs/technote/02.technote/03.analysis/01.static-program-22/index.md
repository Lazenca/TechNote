---
title: "01.Static program analysis"
sidebar_position: 1
slug: /category/01static-program-analysis
---

## **Static program analysis**

* **Static analysis analyzes programs without actually executing them.**
* **Static analysis can be performed on the following forms:**
  + Source code
  + Object / binary code
* **Static analysis has evolved from basic syntax checking to sophisticated reasoning about code semantics to discover bugs.**
* **For effective static analysis, evaluation across different levels is necessary:**
  + Unit Level - Analysis occurring within a specific program block or subroutine without contextual linking to the broader application.
  + Technology Level - Analysis that considers interactions between unit programs to gain an overall, semantic view of the whole program to detect defects and avoid obvious false positives.
  + System Level - Analysis that considers interactions between unit programs without being constrained to a single technology stack or programming language.
* **The following techniques can be used to implement static analysis:**
  + Abstract interpretation
  + Data-flow analysis
  + Model checking
  + Symbolic execution
* **Static analysis can detect the following issues:**
  + Security vulnerabilities
  + Coding standard violations
  + Unused variables
  + Dead / unreachable code
  + Uninitialized variable references
  + Syntax and semantic rule violations between code and software models
  + Inconsistent interfaces between modules and components

## **Static program analysis Tools**

* **Here are some notable static analysis tools:**
  + In addition to these, a wide variety of static analysis tools are available.

| Title | Author | Modified |
| --- | --- | --- |
| [Clang Static Analyzer](/display/TEC/Clang+Static+Analyzer) | [Lazenca.0x0](/display/~sintobul2%40naver.com) | Nov 30, 2017 |

## **Related site**

* <https://en.wikipedia.org/wiki/Static_program_analysis>
