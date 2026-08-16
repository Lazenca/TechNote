#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void main(){
  char stack[56];
  printf("Stack : %p\n", stack);

  char *buf1 = malloc(128);
  char *buf2 = malloc(256);

  printf("buf1 : %p\n", buf1);
  printf("buf2 : %p\n", buf2);
  free(buf1);

  printf("Stack : ");
  scanf("%56s",stack);

  void *buf3 = malloc(1200);
  printf("buf3 : %p\n", buf3);
  printf("buf1 : ");
  scanf("%16s",buf1);

  void *buf4 = malloc(128);
  char *buf5 = malloc(128);
  printf("buf4 : %p\n", buf4);
  printf("buf5 : %p\n", buf5);
  printf("buf5 : ");
  scanf("%128s",buf5);
}
