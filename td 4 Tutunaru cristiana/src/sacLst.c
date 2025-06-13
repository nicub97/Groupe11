
/*********************************************************************************/
/* sacLst.h.c : fonctions pour gerer les configurations et trajectoires */
/* sacLst ici = positions 2D (struct nommee ici Position)                */
/* (inclue gestion avec piles/files version tableau (struct nommee ici sac)      */
/* et version liste dblmt chainee (struct nommee ici Pile_lst)                   */
/* auteur : Xavier Clady (xavier.clady@sorbonne-universite.fr                    */
/*********************************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <math.h>
#include <sacLst.h>


/* copy_pos */
void copy_pos(Position *source, Position *dest)
{
    /* TODO : protection pointeur NULL */
    dest->x=source->x;
    dest->y=source->y;
}

int test_egalite_pos(Position *q1,Position *q2)
{
    return((q1->x==q2->x)&&(q1->y==q2->y));
}

/** Fonctions Pile_lst **/

/* fct liees aux maillons */

/* fct liees à la pile avec lst dblmt ch*/

