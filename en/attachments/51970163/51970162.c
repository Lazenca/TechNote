#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void main(){
	unsigned long *ptr;
	char fakeChunk[160];

	printf("fackChunk : %p\n",fakeChunk);
	printf("ptr : %p\n",&ptr);

	scanf("%176s",fakeChunk);

	malloc(1000);

	free(ptr);

	char *stack = malloc(0x70);
	char *test1 = malloc(0x70);
	char *test2 = malloc(0x500);

	printf("Stack : %p\n",stack);
}
