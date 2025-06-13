#ifndef _matrice_h
#define _matrice_h

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <math.h>


typedef struct s_matrice
{
    int row;
    int col;
    float **data;
} Matrice;

float distance_2pt(int x1, int y1, int x2, int y2); // distance entre 2 pts dans matrice


typedef Matrice Vecteur; // par defaut, les vecteurs seront des vecteurs colonnes 
                        // = des matrices dont le nb de col=1

/* Déclaration des prototypes */
/* Fcts du TDTP2 */
/* q1 */
void allouer_Vecteur(Vecteur *v, int dim);
void saisir_Vecteur(Vecteur *v);
void afficher_Vecteur(Vecteur *v);
float produit_scalaire_Vecteur(Vecteur *v1, Vecteur *v2);
Vecteur *somme_Vecteur(Vecteur *v1, Vecteur *v2);
void libere_Vecteur(Vecteur *v);
/* q2 */
Matrice *allouer_Matrice(int row, int col);
void saisir_Matrice(Matrice *M);
void afficher_Matrice(Matrice *M);
Matrice *multi_Matrice(Matrice *M1, Matrice *M2);
void libere_Matrice(Matrice *M);
/* q3 */
void copy_Vecteur(Vecteur *src, Vecteur *dest);
Vecteur *create_copyVecteur(Vecteur *src);
/* q4 */
Vecteur *allouer_TabVecteur(int nb);
void libere_TabVecteur(Vecteur *tabV, int nb);
/* Fcts du TDTP1 */
float **allouer_matrice(int r, int c);
float **allouer_vecteur(int dim);
void saisir_vecteur(float **vecteur, int dim); /* les vecteurs sont des matrices dont la seconde dim=1 */
void saisir_matrice(float **matrice, int row, int col);
void afficher_matrice(float **matrice, int row, int col);
void afficher_vecteur(float **vecteur, int dim);
float **multi_matrices(float **M1, int r1, int c1, float **M2, int r2, int c2, int *r_out, int *c_out);
float **add_matrices(float **M1, int r1, int c1, float **M2, int r2, int c2);
float **add_vecteurs(float **V1, int d1, float **V2, int d2);
void libere_vecteur(float **v, int dim);
void libere_matrice(float **m, int r, int c);
float produit_scalaire(float **v1, int d1, float **v2, int d2);
float **transpose(float **matrice, int r, int c);

/* Fcts additionelles pour TDTP4 */
void setMat(float val,Matrice *mat,int l,int c);
float getMat(Matrice *mat,int l,int c);
void setVec(float val,Vecteur *v,int l);
float getVec(Vecteur *v,int l);

// exo 3
float distance_2Vecteurs(Vecteur *v1,Vecteur *v2);
float angle_2Vecteurs2D(Vecteur *origin,Vecteur *dest); // renvoie angle ds ]-pi,pi]
Vecteur *soustrait_Vecteur(Vecteur *v1, Vecteur *v2);//renvoie v1-v2

float warp_angle(float angle); //renvoie le même angle mais ds ]-pi,pi]  

void fillMatrice(Matrice *m, float value);/* remplir Matrice d'une valeur donnée */

/** Fonctions de l'exo 4 **/

/* calcul Clibre à partir de la convolution (ComputeFreeMap=MatPosValuesToMatBin) */
/*  conversion valeurs strict positives en valeurs binaires (=seuillage, out_values=values>0) */
/* dilatation = conv Mask + th=0 */

//exo 5
void ligne_valueMat(float value, Matrice *m, int r1, int l1, int r2, int l2); // trace une ligne de "value" dans une matrice entre (r1,l1)^T et (r2,l2)^T (pour exo4/5)

#endif