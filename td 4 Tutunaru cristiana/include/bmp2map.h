
/**********************************************************/
/* author : Fvirtman (http://fvirtman.free.fr)            */
/* http://fvirtman.free.fr/recueil/01_09_02_testbmp.c.php */
/* voir aussi descriptif format BMP ci-dessous            */
/* (dans les commentaires en bas de ce fichier .h)         */
/**********************************************************/

#ifndef _BMP_H
#define _BMP_H

#include <matrice.h>


typedef struct Pixel
{
	unsigned char r,g,b;
} Pixel;

typedef struct Image
{
	int w,h;
	Pixel* dat;
} Image;

Matrice *img_rgb2map_occup(Image* I);
Image *map_occup2img_rgb(Matrice* m);/* convertion inverse de la précédente */
//void dessine_trajDansImageBMP(Image* I,Traj* trajectoire,char *filename);


Image* Charger(const char* fichier);
int Sauver(Image*,const char* fichier);
Image* NouvelleImage(int w,int h);
Image* CopieImage(Image*);
void SetPixel(Image*,int i,int j,Pixel p);
Pixel GetPixel(Image*,int i,int j);
void DelImage(Image*);

#endif


/*!F
	Ah ! Le format BMP est int�ressant.
	Voila un bon exercice pour d�buter dans l'�criture/lecture de fichiers binaires.

	Ce format est relativement facile, mais va quand m�me faire peur aux novices du domaine.

	Alors regardons le main, ainsi que le .h : ce sont les m�mes que l'exemple pr�c�dent sur les PPM.
	Je vous laisse regarder l'exemple pr�c�dent.

	De m�me toutes les fonctions, sauf chager et sauver sont les m�mes.

	Je ne parlerai donc ici que des fonctions charger et sauver.

Tout d'abord, une description du format BMP.
Une documentation ici :

http://www.commentcamarche.net/contents/video/format-bmp.php3

	Un BMP, c'est un header (des donn�es), et ensuite le pixels les uns � la suite des autres, non compress�s.

	Voyons le header.

	Le Header se compose de plusieurs choses :
    - la signature BM : il existe d'autres signatures, mais on ne considerera que celle la, regardez le premier
      test de sortie de la fonction charger.
    - la taille du fichier
    - 4 octets � 0
    - l'offset de l'image : ou est ce que les donn�es commencent.

	Dans notre cas, ce sera toujours � 54, apr�s la taille du header.

	Vous voyez que j'ai fait des structures qui correspondent � cela dans bmp.c

	Le #pragma pack(1) permet de d�sactiver l'alignement m�moire : cherchez sur ce recueil ce qu'est l'alignement m�moire
	Vous comprendrez qu'il faut la d�sactiver, car sur le disque, il n'y a pas de "trous" entre les donn�es.
	Il faut donc que notre structure soit contigue en m�moire, car on va l'�crire d'un seul coup.

	Nous avons ensuite une sous structure Ent�te de l'image (bien expliqu�e dans le lien ci dessus). Nous avons :
    - sa taille (40)
    - la largeur et la hauteur de l'image (important !) regardez dans charger et sauver, je les associe � I->w et I->h
    - le nombre de plans (toujours � 1 : des extentions du format BMP qui n'ont jamais �t� exploit�es)
      j'imagine qu'il �tait pr�vu de faire des fichiers BMP a plusieurs plans, plusieurs images dans le m�me fichier ?
      des layers ? �a n'a jamais �t� exploit�.
    - M�thode de compression : pareil, rares sont les BMP compress�s. On preferera d'autres formats pour compresser.
      Donc on ne lira, et �crira que des BMP non compress�s.
    - r�solution horizontale ou verticale. �a c'est utile pour imprimer par exemple. Si vous avez une image, et que vous
      voulez l'imprimer, quelle taille fera-t-elle sur le papier ? En fonction de son nombre de pixels ? On peut renseigner
      �a ou pas. Moi je mets des 0 (et je lis des 0 sur les BMP que j'ai cr�� avec Paint), en gros, on s'en fout : le gars
      qui veut imprimer l'image se d�brouillera pour lui donner la taille qu'il veu manuellement.
    - la palette (et les couleurs importantes de la palette)

Alors la palette, dans notre cas, on s'en fout : il n'y en a pas.
En effet, en 24 bpp (ce que je supporte uniquement), chaque pixel embarque ses couleurs.

Dans les formats plus pauvres (256 couleurs), chaque pixel est cod� sous un seul octet. Cet octet, ce n'est pas une couleur, mais
un index vers une palette existante. On d�finit 256 couleurs dans une palette, juste en dessous du header,et chaque pixel,
avec un seul octet (entre 0 et 255) est un index vers une couleur de la palette.
L'image est bien plus compacte, mais n'a que 256 couleurs maximum. Et si vous changez une couleur, tous les pixels utilisant
la m�me couleur seront donc chang�s en cons�quence !

Ici donc, pas de palette : chaque pixel est ind�pendant et coute 3 octet (24 bits).

Voila pour le header.
On lit et on �crit le header d'un seul coup avec un fread ou un fwrite bien plac�.

Passons maintenant � l'image elle m�me !

Les pixels sont cod�s les uns � la suite des autres.
On pourrait donc se dire "un grand fread et c'est pli� !"

Cependant, h�las, nous ne stockons pas, ma structure et les BMP, les choses de la m�me fa�on.

Ma structure est ainsi faite :
1) Je code les pixels de gauche � droite, puis de haut en bas (sens de lecture occidental)
2) mes pixels sont tous de 3 octets, cod�s en rouge, vert, bleu (RGB) dans cet ordre.
3) tout se suit en m�moire (mon tableau dat n'a pas de trous)

Donc c'est simple !

Mais le format BMP est diff�rent :
1) stockage des pixels de gauche � droite, mais de ---> BAS EN HAUT <---

Donc vous remarquerez dans ma fonction charger et sauver, les pixels sont lus/�crits non pas � position i,j
par rapport � ma structure, mais i,I->h-j-1, ce qui permet de bien mettre les pixels ou il faut.

2) stockage en bleu, vert, rouge (BRG), je suis donc oblig� de passer par un triplet d'octets temporaire (bgrpix)
que je croise pour le remplissage avec ma structure Pixel (le r devient le bgrmix[2] et non [0])

3) et non des moindres, il existe ce qu'on appelle le picth.
Le pitch, c'est le nombre d'octets que prend une ligne, et le format BMP IMPOSE qu'une ligne soit multiple de 4 octets.
Cela permet, dans certains anciens buffer graphiques, de charger le BMP d'un seul coup, pour un blit rapide :
on perd quelques octets, mais on gagne �norm�ment en ne g�rant pas de cas particulier en arrivant en bout de ligne avec
un pross 32 bits, bref.

Donc chaque pixel fait 3 octets, j'ai X pixels par ligne. et 3*X n'est pas n�cessairement un multiple de 4.
Le reste de la division de 3*X par 4 me dit combien d'octets sont en plus. Et en cons�quence, je compl�te par des 0
J'appelle pitch le nombre d'octets � rajouter ici.

Si (3*X)%4 == 0, je ne rajoute rien : pitch = 0
Si (3*X)%4 == 1, je dois rajouter 3 octets (pour compl�ter)
Si (3*X)%4 == 2, je dois rajouter 2 octets (pour compl�ter)
Si (3*X)%4 == 3, je dois rajouter 1 octets (pour compl�ter)

Mon tableau corrpitch permet de consid�rer rapidement chacun de ces 4 cas en �vitant 4 if.

Voila, il ne me reste plus qu'� �crire ou lire l'image...

Ensuite, je manipule de la m�me mani�re que dans l'exemple pr�c�dent.

Et c'est du BMP officiel, vous pouvez l'ouvrir avec Paint ou autre !

!*/

/*!E
	No explanations yet.
!*/

/*
titre: Lire et �crire des fichiers image BMP
titreE: Read and Write a BMP file.
meta: C;BMP natif
metaE: C;native BMP
desc: Lire et �crire nativement des fichiers image BMP
descE: Read and Write a BMP file from scratch
cle  :
linkT: 01_09_02_bmp.h
linkT: 01_09_02_bmp.c
*/

