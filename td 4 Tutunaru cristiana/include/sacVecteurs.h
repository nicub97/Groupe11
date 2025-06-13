#ifndef _sacVecteurs_h
#define _sacVecteurs_h

#include <matrice.h>

typedef struct sac{
  Vecteur *tabVec;
  int nb;
  int size;
  int begin;
  int end;
} Sac;

/* gstion d'une pile de pos (tableaux) */
Sac* allocSac(int size); // et l'init
void freeSac(Sac* s);
int sacPlein(Sac* s); //renvoie 1 si sac plein, 0 sinon
int sacVide(Sac* s); // revoie 1 si sac vide, 0 sinon
int push(Sac *s,Vecteur *vec); //renvoie 0 si sac plein, 1 sinon 
void videSac(Sac *s); // reinit le sac (le vide)
/* TODO : pop_fifo(), videSac() */
// attention les vecteurs de sortie st une nouvelle allocation (ne pas oublier de libérer avt et après le pointeur)



#endif