#include <stdio.h>
#include <stdlib.h>

char *buf1;

void main(){
	buf1 = malloc(0x80);
        printf("buf1 : %p\n",&buf1);

	char *buf2 = malloc(0x80);
	scanf("%144s",buf1);

	free(buf2);
	
	scanf("%32s",buf1);
	scanf("%128s",buf1);
}
