#include <stdio.h>
#include <stdlib.h>

int main()
{
	int *buf1 = malloc(112);
	int *buf2 = malloc(112);
	int *buf3 = malloc(112);

	free(buf1);
	free(buf2);
	free(buf1);

	int *buf4 = malloc(112);
	int *buf5 = malloc(112);
	int *buf6 = malloc(112);
}
