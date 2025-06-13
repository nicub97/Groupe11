Pour installer l' "update-TDTP4.zip" :

télécharger le fichier dans la racine de votre prijet.
En extraire tous les fichiers 
Automatiquement, il devrait écraser les anciens fichiers

ATTENTION : Normalement, votre "main.c" avec votre précédent travail en TD et TP n'est pas écrasé
Si vous avez modifier d'autres fichiers, sauvegardez-en des copies avant de décompresser l'update.

ATTENTION aussi à remettre à jour votre Makefile selon les commandes suivantes : 

---****---

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

---****---

Cette update ajoute de nouvels éléments nécessaires aux exos 3, 4 et 5 (exo5 pas encore fourni dans le sujet)

Ajout de bibliothèques pous les exos 3, 4 et 5 du TDTP4&5
-> bmp2map.c/.h : permet de charger/sauvegarder des image en BMP (uniquement 24bits)
-> sacVecteurs.c/.h : permet de gérer un sac de Vecteur (enTableau, en pile/LIFO et en file/FIFO)
-> sacLst.c/.h : permet de gérer un sac de position (en Liste Chaînée, en pile/LIFO) pour exo 5 

Ajout de nombreuses fonctions dans :
-> matrice.c/.h
-> vacuumrobot.c/.h (pour une interface plus complete)

Ajout de nouveaux paramètres par défaut dans "params.h"

