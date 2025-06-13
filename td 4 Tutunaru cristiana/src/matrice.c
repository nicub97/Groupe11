#include <matrice.h>


/* Fcts du TDP2 */
/* q1 */
void allouer_Vecteur(Vecteur *v, int dim)
{
    v->row = dim;
    v->col = 1;
    v->data = allouer_vecteur(dim);
}

void saisir_Vecteur(Vecteur *v)
{
    saisir_vecteur(v->data, v->row);
}

void afficher_Vecteur(Vecteur *v)
{
    afficher_vecteur(v->data, v->row);
}

float produit_scalaire_Vecteur(Vecteur *v1, Vecteur *v2)
{
    float prod;

    if (v1->row != v2->row)
    {
        printf("Vectors Dimension Error in produit_scalaire_Vecteur()\n");
        exit(1);
    }
    prod = produit_scalaire(v1->data, v1->row, v2->data, v2->row);

    return prod; /* pas de libere_Matrice() car sinon on peut pas renvoyer la valeur */
}

Vecteur *somme_Vecteur(Vecteur *v1, Vecteur *v2)
{
    Vecteur *vout=NULL;

    vout = (Vecteur *)malloc(sizeof(Vecteur));
    vout->data = add_vecteurs(v1->data, v1->row, v2->data, v2->row);
    vout->row = v1->row;
    vout->col = v1->col;

    return vout;
}

void libere_Vecteur(Vecteur *v)
{
    libere_vecteur(v->data, v->row);
}

/* q2 */
Matrice *allouer_Matrice(int row, int col)
{
    Matrice *M = NULL;

    M = (Matrice *)malloc(sizeof(Matrice));
    if (M == NULL)
    {
        printf("Error in alloc\n");
        exit(1);
    }
    M->row = row;
    M->col = col;
    M->data = allouer_matrice(row, col);

    return M;
}

void saisir_Matrice(Matrice *M)
{
    if (M == NULL)
    {
        printf("Error in saisir_Matrice\n");
        exit(1);
    }
    saisir_matrice(M->data, M->row, M->col);
}

void afficher_Matrice(Matrice *M)
{
    if (M == NULL)
    {
        printf("Error in afficher_Matrice\n");
        exit(1);
    }
    afficher_matrice(M->data, M->row, M->col);
}

Matrice *multi_Matrice(Matrice *M1, Matrice *M2)
{
    Matrice *M;

    M = (Matrice *)malloc(sizeof(Matrice));
    M->data = multi_matrices(M1->data, M1->row, M1->col, M2->data, M2->row, M2->col, &(M->row), &(M->col));

    return M;
}

void libere_Matrice(Matrice *m)
{
    libere_matrice(m->data, m->row, m->col);
}

/* q3 */

void copy_Vecteur(Vecteur *src, Vecteur *dest)
{
    int inc;

    if (dest->data==NULL) 
        allouer_Vecteur(dest,src->row);

    if (dest->row != src->row)
    {
        libere_Vecteur(dest);
        allouer_Vecteur(dest, src->row);
    }

    for (inc = 0; inc < src->row; inc++)
    {
        dest->data[inc][0] = src->data[inc][0];

    }
}

Vecteur *create_copyVecteur(Vecteur *src)
{
    Vecteur *v_out = NULL;

    v_out = (Vecteur *)malloc(sizeof(Vecteur));
    v_out->row = 0;
    v_out->col = 0;
    v_out->data = NULL;
    allouer_Vecteur(v_out, src->row);
    copy_Vecteur(src, v_out);

    return v_out;
}

/* q4 */

Vecteur *allouer_TabVecteur(int nb)
{
    Vecteur *tabV = NULL;
    int inc;

    if (nb <= 0)
        return NULL;

    tabV = (Vecteur *)malloc(nb * sizeof(Vecteur));
    for (inc = 0; inc < nb; inc++)
    {
        allouer_Vecteur(&tabV[inc], 0);
    }

    return tabV;
}

void libere_TabVecteur(Vecteur *tabV, int nb)
{
    int inc;

    if (tabV != NULL)
    {
        for (inc = 0; inc < nb; inc++)
            libere_Vecteur(&tabV[inc]);
        free(tabV);
    }
}

/* Fcts du TDTP1 */

float **allouer_matrice(int r, int c)
{
    float **M;
    int inc;

    if (r <= 0 || c <= 0)
    {
        printf("Error in matrix dimensions -> empty matrice (=NULL)\n");
        return (NULL); // ou exit(1);
    }

    M = (float **)malloc(r * sizeof(float *)); /* normalement il faudrait tester si les allocs sont ok */
    for (inc = 0; inc < r; inc++)
    {
        M[inc] = (float *)malloc(c * sizeof(float));
    }

    return M;
}

float **allouer_vecteur(int dim)
{
    float **V;

    if (dim <= 0)
        return NULL;

    V = allouer_matrice(dim, 1);

    return V;
}

void saisir_matrice(float **matrice, int row, int col)
{
    int i, j;

    for (i = 0; i < row; i++)
        for (j = 0; j < col; j++)
        {
            printf("M[%d][%d]=? ", i + 1, j + 1);
            scanf("%f", &matrice[i][j]);
        }
}

float **transpose(float **matrice, int r, int c)
{
    float **m_out = NULL;
    int i, j;

    m_out = allouer_matrice(c, r);
    for (i = 0; i < r; i++)
        for (j = 0; j < c; j++)
            m_out[j][i] = matrice[i][j];

    return m_out;
}

float produit_scalaire(float **v1, int d1, float **v2, int d2)
{
    int s1, s2;

    float **prod = multi_matrices(transpose(v1, d1, 1), 1, d1, v2, d2, 1, &s1, &s2);

    return **prod;
}

void saisir_vecteur(float **vecteur, int dim)
{
    saisir_matrice(vecteur, dim, 1);
}

void afficher_matrice(float **matrice, int row, int col)
{
    int i, j;

    for (i = 0; i < row; i++)
    {
        printf("[\t");
        for (j = 0; j < col; j++)
            printf("%f\t", matrice[i][j]);
        printf("]\n");
    }
}

void afficher_vecteur(float **vecteur, int dim)
{
    afficher_matrice(vecteur, dim, 1);
}

float **multi_matrices(float **M1, int r1, int c1, float **M2, int r2, int c2, int *r_out, int *c_out)
{
    float **M_out = NULL;
    int i, j, k;

    if (c1 != r2)
    {
        printf("Matrices dimensions error in multi_matrices\n");
        return (NULL); // ou exit(1);
    }
    *r_out = r1;
    *c_out = c2;
    M_out = allouer_matrice(r1, c2);
    for (i = 0; i < r1; i++)
        for (j = 0; j < c2; j++)
        {
            M_out[i][j] = 0;
            for (k = 0; k < r2; k++)
            {
                M_out[i][j] += M1[i][k] * M2[k][j];
            }
        }

    return M_out;
}

float **add_matrices(float **M1, int r1, int c1, float **M2, int r2, int c2)
{
    float **M_out = NULL;
    int i, j;

    if (c1 != c2 || r1 != r2)
    {
        printf("Matrices dimensions error in add_matrices\n");
        return (NULL); // ou exit(1);
    }
    M_out = allouer_matrice(r1, c1);
    for (i = 0; i < r1; i++)
        for (j = 0; j < c1; j++)
        {
            M_out[i][j] = M1[i][j] + M2[i][j];
        }

    return M_out;
}

float **add_vecteurs(float **V1, int d1, float **V2, int d2)
{
    return add_matrices(V1, d1, 1, V2, d2, 1);
}

void libere_vecteur(float **v, int dim)
{
    libere_matrice(v, dim, 1);
}

void libere_matrice(float **m, int r, int c)
{
    int k;

    if (m != NULL) /* on ne peut pas libérer un pointeur pointant sur NULL */
    {
        for (k = 0; k < r; k++)
            if (m[k] != NULL)
                free(m[k]);
        free(m);
    }
}

/* todo : fcts pour multiplier une matrice/vecteur par un scalaire, etc... */



/* Fcts additionelles pour TDTP4 */


void setMat(float val,Matrice *mat,int l,int c)
{
    if ((mat->data !=NULL) && (l<=mat->row) && (l>=1) && (c<=mat->col) && (c>=1))
    {
        mat->data[l-1][c-1]=val;
    }
    else{
      fprintf(stderr,"Attention alloc ou dim matrix in setMAt \n");
      exit(1);
    }
}
float getMat(Matrice *mat,int l,int c)
{    
    if (mat->data !=NULL && l<=mat->row && l>=1 && c<=mat->col && c>=1)
    {
        return(mat->data[l-1][c-1]);
    }
    fprintf(stderr,"Attention  alloc ou dim matrix in getMAt \n");
    exit(1);
}
void setVec(float val,Vecteur *v,int l)
{
    setMat(val,v,l,1);
}
float getVec(Vecteur *v,int l)
{
    return(getMat(v,l,1));
}

/* exo 3 */

float distance_2Vecteurs(Vecteur *v1,Vecteur *v2)
{
    float dist;
    Vecteur *v2_moins_v1=soustrait_Vecteur(v2,v1);

    dist=sqrtf(produit_scalaire_Vecteur(v2_moins_v1,v2_moins_v1));

    libere_Vecteur(v2_moins_v1);
    free(v2_moins_v1);
    return dist;
}

float angle_2Vecteurs2D(Vecteur *origin,Vecteur *dest)
{
    float angle;
    float dy,dx;

    if (origin->row!=2)
    {
        fprintf(stderr,"Erreur dim vecteur dans angle_2Vecteurs2D\n");
        exit(1);
    }
    Vecteur *v2_moins_v1=soustrait_Vecteur(dest,origin);

    dy=getVec(v2_moins_v1,2);
    dx=getVec(v2_moins_v1,1);

    angle=atan2f(dy,dx);

    libere_Vecteur(v2_moins_v1);
    free(v2_moins_v1);

    return angle;
}

Vecteur *soustrait_Vecteur(Vecteur *v1, Vecteur *v2) //renvoie v1-v2
{
    Vecteur *vout=NULL;
    int inc;

    if (v1->row != v2->row)
    {
        fprintf(stderr,"Erreur dim vecteur dans soustrait_Vecteur\n");
        exit(1);
    }
    vout = (Vecteur *)malloc(sizeof(Vecteur));
    vout->data = allouer_vecteur(v1->row);
    for (inc=0;inc<v1->row;inc++)
    {
        vout->data[inc][0]=v1->data[inc][0]-v2->data[inc][0];
    }
    vout->row = v1->row;
    vout->col = v1->col;

    return vout;
}

float warp_angle(float angle) 
{  
    return  atan2f(sinf(angle),cosf(angle)); // solution couteuse (il ya moins couteux mais plus complexe a coder)
}

// trace une ligne de "val" dans une matrice (pour exo4/5)
void ligne_valueMat(float value, Matrice *m, int r1, int l1, int r2, int l2)
{
    int deltaR=(r2-r1);
    int deltaL=(l2-l1);
    int inc;
    int x,y;

    if (r1>=1 && r1<=m->row && r2>=1 && r2<=m->row &&
        l1>=1 && l1<=m->col && l2>=1 && l2<=m->col)
    {
        if (abs(deltaR)>abs(deltaL))
        {
            for (inc=0;inc<=abs(deltaR);inc++)
            {
                x=r1+inc*(deltaR>0)-inc*(deltaR<0);
                if (deltaR==0)
                    y=l1;
                else
                    y=l1+(int)round(inc*(float)deltaL/(float)abs(deltaR));
                setMat(value,m,x,y);
            }
        }
        else
        {
            for (inc=0;inc<=abs(deltaL);inc++)
            {
                y=l1+inc*(deltaL>0)-inc*(deltaL<0);
                if (deltaL==0)
                    x=r1;
                else
                    x=r1+(int)round(inc*(float)deltaR/(float)abs(deltaL));

                setMat(value,m,x,y);
            }
        }
    }
    else{
        fprintf(stderr,"Erreur dans les positions données dans ligne_value(); (%d,%d,%d,%d)\n",l1,r1,l2,r2);
        exit(1);
    }  
}

/**Exo 4**/

/* distance_2 points 2D */
float distance_2pt(int x1, int y1, int x2, int y2)
{
    return sqrtf((float)((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)));
}

/* remplir Matrice d'une valeur donnée */
void fillMatrice(Matrice *m, float value)
{
    int i,j;

    for (i=0;i<m->row;i++)
        for (j=0;j<m->col;j++)
            m->data[i][j]=value;
}

/* convolution (on ne convolue pas sur les bords ; bords remplis par sizeMask^2 ) */


/* Matrice *createMask(int radius) */

/* seuillage de valeurs d'une mat avec v>th */



/* copier une matrice dans une autre */
void copy_Matrice(Matrice *source, Matrice * destination)
{
  int i,j;

  /* TODO : ajouter protection pointeur NULL, dimensions diff */

  for (i=0;i<source->row;i++)
	for(j=0;j<source->col;j++)
		destination->data[i][j]=source->data[i][j];

}

/*  conversion valeurs strict positives en valeurs binaires (=seuillage, out_values=values>0) */



