#include <stdio.h>
#include <stdlib.h>

int main(){

	long state = 0;

	printf("Stack : %p\n", &state);
	char *buf1 = malloc(130);
	char *buf2 = malloc(500);

	free(buf1);

	scanf("%16s",buf1);

	buf1 = malloc(130);

	if(state){
		printf("Hello world!\n");
	}	
}
