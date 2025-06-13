/*********************************************************************************/
/* sacLst.h.c : fonctions pour gerer les configurations et trajectoires */
/* sacLst ici = positions 2D (struct nommee ici Position)                */
/* (inclue gestion avec piles/files version tableau (struct nommee ici sac)      */
/* et version liste dblmt chainee (struct nommee ici Pile_lst)                   */
/* auteur : Xavier Clady (xavier.clady@sorbonne-universite.fr                    */
/*********************************************************************************/

#ifndef _sacLst_H
#define _sacLst_H

/* definition d'une position/configuration */
/* rmq : on aurait pu/du utiliser le type Vecteur du TDTP2
   cela aurait permis de généraliser la méthode
   à des espaces à plus grande dim (ex : 3D)
*/
typedef struct position{
    int x;
    int y;
}  Position;

/* fct utilitaires */
int test_egalite_pos(Position *q1,Position *q2);/* q==q_goal ?*/
void copy_pos(Position *source, Position *dest);

/******************************/
/* Gestion d'une Pile_lst     */
/* (lst dblmt chaînée)        */

/* maillon d'un liste doublement chainée */
typedef struct maillon{
  Position q;
  struct maillon *next;
  struct maillon *prev;
} Maillon;

/* fct liees aux maillons */


/* struct de gestion de la pile avec liste dblmt chainée*/
typedef struct pile_lst{
    struct maillon *end;
    struct maillon *begin;
    int nb; /* pas obligatoire mais très utile */
} Pile_lst;

/* fct liees à la pile avec lst dblmt ch*/


#endif
