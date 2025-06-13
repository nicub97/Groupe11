#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <sacVecteurs.h>

/******************************/
/* Gestion d'un sac FIFO/LIFO */

Sac* allocSac(int size)
{
    Sac* s=(Sac*)malloc(sizeof(Sac));
    s->size=size;
    s->nb=0;
    s->begin=0;
    s->end=0;
    s->tabVec=allouer_TabVecteur(size);
    return s;
}

void freeSac(Sac* s)
{
    if (s)
    {
        if (s->tabVec) libere_TabVecteur(s->tabVec,s->size);
        free(s);
    }
}

int sacPlein(Sac* s)
{
    return(s->nb==s->size);
}

int sacVide(Sac* s)
{
    return(s->nb==0);
}


int push(Sac *s,Vecteur *Vec)
{
    if(sacPlein(s)) return 0;
    copy_Vecteur(Vec,&(s->tabVec[s->end]));
    s->nb++;
    s->end=(s->end+1)%s->size;
    return 1;
}


void videSac(Sac *s)
{
  s->begin=0;
  s->nb=0;
  s->end=0;
}


/* TODO : pop_fifo(), pop_lifo() */

// attention le vecteur de sortie est une nouvelle allocation (ne pas oublier de libérer avt et après le pointeur)
// attention2 : ne pas oublier de vérifier si le sac n'est pas vide avt de faire appel à cette fonction
// si Sac vide renvoie NULL
