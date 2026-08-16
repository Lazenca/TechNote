#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main()
{
	char* a = malloc(160);
	char* b = malloc(256);
	char* c;

	free(a);

	c = malloc(144);

	strcpy(c, "Secret message");
	printf("%s\n",a);
}
