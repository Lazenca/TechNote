#include <stdio.h>
#include <malloc.h>
#include <unistd.h>
int main()
{
	char fake_chunk[32];
	read(0,fake_chunk,32);

	char *buf1 = malloc(0x70);
	char *buf2 = malloc(0x100);
	char *buf3 = malloc(0x70);

	read(0,buf1,122);

	free(buf2);
	
	read(0,fake_chunk,16);
    char *buf4 = malloc(0x200);
}
