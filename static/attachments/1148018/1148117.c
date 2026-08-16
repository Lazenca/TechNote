#include <stdio.h>
#include <string.h>
#include <stdlib.h>
 
int main(int argc, char *argv[])
{
	int size;
        char *buf1, *buf2, *buf3;

 	buf1 = malloc(256);
	printf("buf1 : ");
	scanf("%s",buf1);

	printf("Size : ");
	scanf("%d",&size);
	buf2 = malloc(size);

	printf("buf3 : ");
	buf3 = malloc(256);
	scanf("%s",buf3);

        free(buf3);
        free(buf2);
        free(buf1);
 
        return 0;
}
