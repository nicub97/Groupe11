#ifndef _vacuumrobot_h
#define _vacuumrobot_h

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <math.h>
#include <graphicSDL.h>
#include <params.h>
#include <matrice.h>
#include <sacVecteurs.h>


/* Robots */
// donnees du robot
typedef struct _robot{
   float size; // =diametre du robot en m
   SDL_Rect rect; // position en pixels
   long couleur;
   long couleur_led;
   int rayon_led; // en pix
   float x; // position en metre
   float y;
   float r_roues;
   float d_roues;
   float theta; //orientation 
   float omega; //vitesse angulaire
   float omega_max;
   float v; //vitesse
   float v_max;
   float delta_v;
   float delta_omega;
   float vr; // vitesse des roues right/left
   float vl;
   float sigma_r;
   float sigma_l;
   float k_rho;
   float k_alpha;
   float k_beta;
   float batterie;
   float batterie_max;
   float delta_batterie;
} Robot;

typedef struct _allGraphics
{
   SDL_Window* fenetre;
   SDL_Renderer* ecran;
   SDL_Event e;
   SDL_Texture* sceneFixeTexture; // img maison
   SDL_Texture* robotTexture; // robot = disque noir + point vert pour direction
   SDL_Texture* sorbonneTexture; // logo sorbonne en haut à droite
   SDL_Texture* tableaubordTexture; // texture de tableau de bord
   SDL_Rect sorbonne_logo; 
} AllGraphics;

// fcts lies à l'init et detroy des elemts graphiques
void Init_Textures(AllGraphics *game, Robot* robot);
void Rendu(AllGraphics *game, Robot *robot, int nb_frames);
void Rendu_all(AllGraphics *game, Robot *robot,Vecteur *Consigne, Sac *s,  int nb_frames);
void destroyTextures(AllGraphics *game);

/* readINPUTS */
// si touche UP : robot.dv += robot.delta_v (+0.2 m/s)
// si touche DOWN : robot.dv -= robot.delta_v (-0.2 m/s)
// si touche RIGHT : robot.domega -= robot.delta_omega (-3 deg/s)
// si touche LEFT : robot.domega += robot.delta_omega (+3 deg/s)
//
// 1->test_mouse, si click mouse gauche
// 2->test_mouse, si click mouse droit
// 0->test_mouse, sinon
int read_inputs(SDL_Event *e,Robot *robot,float *clickMouseX,float *clickMouseY,int *quit);

/*Scene Fixe */
// cree la texture de la scene fixe
SDL_Texture *creerTextureSceneFixe(SDL_Renderer*ecran);
// dessine la texture de la scene fixe (meme instruction que dessine_imageTexture -> dessine_Texture() -> graphicSDL
void dessine_sceneFixe(SDL_Renderer *ecran, SDL_Texture *sceneFixe);

/* Robot */
// initialise la position du robot au centre de l'écran avec vitesses nulles
void init_robot(Robot* robot);
// cree la texture de la robot (disque plein avec led verte clignotante = direction robot)
SDL_Texture *creerTextureRobot(SDL_Renderer*ecran, Robot *robot);
//dessine texture du viseur
void dessine_robot(SDL_Renderer *ecran,Robot *robot,SDL_Texture* robotTexture, int nb_frames);
// test collision avec bord écran...
int collision_bord_ecran(Robot *robot);
//
void dessine_jauge_batterie(SDL_Renderer *ecran,Robot *robot);


/* Image -> graphicSDL */
// cree une texture à partir d'ue image en format bmp (r�cup�re aussi la taille de l'image
SDL_Texture* creerTextureFromImage(SDL_Renderer *ecran,char *nom_file_bmp,int *size_w, int *size_h);
// dessine l'image (taille originelle)
void dessine_imageTexture(SDL_Renderer *ecran,SDL_Texture *imageTexture,int x, int y);
// dessine l'image (taille redimensionnee ; a eviter car le rendu obtenu est souvent moyen, il vaut mieux partir d'image bmp a la taille a laquelle on veut l'afficher
void dessine_imageTexture_redim(SDL_Renderer *ecran,SDL_Texture *imageTexture,int x, int y, int w, int h);

/* sac Vecteurs */
//desine une trajectoires définie par un ensemble de Vecteurs (dans un sac)
void dessine_trajSacVecteurs(SDL_Renderer *ecran,Robot *robot, Vecteur *Consigne, Sac* s);

#endif // _graphicSDL_h
