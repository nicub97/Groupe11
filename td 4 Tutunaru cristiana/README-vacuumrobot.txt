
Pour faire fonctionner ce programme, executez les commandes suivantes dans le terminal (dans le dossier "tdtp4/" ) : 

gcc ./src/graphicSDL.c -c -o ./obj/graphicSDL.o -Wall -I ./include -I "C:\Program Files\CodeBlocks\MinGW\include" 
gcc ./src/vacuumrobot.c  -c -o ./obj/vacuumrobot.o -Wall -lm -I ./include  -I "C:\Program Files\CodeBlocks\MinGW\include" 
gcc ./src/matrice.c -c -o ./obj/matrice.o -Wall -lm -I./include
gcc ./src/sacVecteurs.c -c -o ./obj/sacVecteurs.o -Wall -lm -I./include  
gcc -c ./src/sacLst.c -o ./obj/sacLst.o  -Wall -lm -I./include  
gcc -c ./src/bmp2map.c -o ./obj/bmp2map.o  -Wall -lm -I./include  


ar -s -r ./lib/libRobot.a -o ./obj/vacuumrobot.o ./obj/graphicSDL.o ./obj/matrice.o sacVecteurs.o
rm ./obj/*.o

gcc ./src/main.c -o main.exe -Wall -lm -lRobot -lmingw32 -lSDL2main -l"SDL2.dll" -I ./include -I "C:\Program Files\CodeBlocks\MinGW\include" -L ./lib -L "C:\Program Files\CodeBlocks\MinGW\x86_64-w64-mingw32\lib" -L "C:\Program Files\CodeBlocks\MinGW\lib\SDL2"   

./main.exe