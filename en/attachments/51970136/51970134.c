#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <malloc.h>

int main()
{	
	char *buf1 = malloc(0x80);
	char *buf2 = malloc(0x200);
	char *buf3 = malloc(0x80);

	scanf("%512s",buf2);

	free(buf2);

	scanf("%136s",buf1);	

	char *buf4 = malloc(0x80);
	char *buf5 = malloc(0x80);

	memset(buf5,'A',0x80);

	free(buf4);
	free(buf3);
	
	char *buf6 = malloc(0x280);
	memset(buf6,'B',0x280);
}
