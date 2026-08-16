#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

void main(){

	char *buf1 = malloc(0x100);
	char *buf2 = malloc(0x100);
	char *buf3 = malloc(0x80);

	memset(buf1, 'A', 0x100);
	memset(buf2, 'B', 0x100);
	memset(buf3, 'C', 0x80);

	free(buf2);

	int size;

	scanf("%272s",buf1);
	scanf("%d",&size);
	
	char *buf4 = malloc(size);

	scanf("%408s",buf4);
	printf("buf3 : %s\n",buf3);

	scanf("%128s",buf3);
	printf("buf4 : %s\n", buf4);
}


