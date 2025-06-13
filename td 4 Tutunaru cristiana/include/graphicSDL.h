
/*

Sorbonne Universite/LEEA/LU2EE21

Interface graphique simplifiee

Contributeurs : Xavier Clady, xavier.clady@sorbonne-universite.fr

version : 1.1
creation : 03/2020

Derniere modif :
- utilisation des textures pour dessiner les differents objets du jeu (sceneFixe, Viseur, Target,..)
- dessine ellipse pleine
- dessine ellipse vide

Ressources :
- SDL2
- bib libgraphic de Bruno Gas
- Lazy Foo' Productions: https://lazyfoo.net/tutorials/SDL
- https://fr.wikibooks.org/wiki/Programmation_avec_la_SDL/Les_textures
*/


#ifndef _graphicSDL_h
#define _graphicSDL_h

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <math.h>
#include <SDL2/SDL.h>
#include <params.h> //todo : rendre independant de params.h ?

// MS per
#define MS_PER_UPDATE 60
//couleurs pr�d�finies
#define rgb2pixel(r,g,b) 			((long) ( (( uint8_t )r)<<8 | (( uint8_t )g))<<8 | (( uint8_t )b) )
#define Black						rgb2pixel(0  ,0   ,   0)
#define White						rgb2pixel(255,255 , 255)
#define Gray 						rgb2pixel(190, 190, 190)
#define LightGrey					rgb2pixel(211, 211, 211)
#define DarkGray					rgb2pixel(169, 169, 169)
#define NavyBlue					rgb2pixel(  0,   0, 128)
#define RoyalBlue					rgb2pixel( 65, 105, 225)
#define SkyBlue						rgb2pixel(135, 206, 235)
#define Blue						rgb2pixel(0  , 0  , 255)
#define LightBlue					rgb2pixel(173, 216, 230)
#define MidnightBlue				rgb2pixel(25 , 25 , 112)
#define Cyan 						rgb2pixel(  0, 255, 255)
#define LightCyan					rgb2pixel(224, 255, 255)
#define DarkCyan					rgb2pixel(0  , 139, 139)
#define Green						rgb2pixel(0  , 255,   0)
#define DarkGreen					rgb2pixel(  0, 100,   0)
#define LightGreen					rgb2pixel(144, 238, 144)
#define YellowGreen					rgb2pixel(154, 205,  50)
#define LightYellow					rgb2pixel(255, 255, 224)
#define IndianRed					rgb2pixel(205,  92,  92)
#define Sienna						rgb2pixel(160, 82 ,  45)
#define Beige						rgb2pixel(245, 245, 220)
#define Brown						rgb2pixel(165,  42,  42)
#define Orange						rgb2pixel(255, 165,   0)
#define DarkOrange					rgb2pixel(255, 140,   0)
#define LightCoral					rgb2pixel(240, 128, 128)
#define Pink						rgb2pixel(255, 192, 203)
#define LightPink					rgb2pixel(255, 182, 193)
#define Red							rgb2pixel(255, 0  ,   0)
#define DarkRed						rgb2pixel(139, 0  ,   0)
#define VioletRed					rgb2pixel(208,  32, 144)
#define Magenta						rgb2pixel(255,   0, 255)
#define DarkMagenta					rgb2pixel(139,   0, 139)
#define Violet						rgb2pixel(238, 130, 238)
#define DarkViolet					rgb2pixel(148,   0, 211)
#define Purple						rgb2pixel(160,  32, 240)
#define Gold1						rgb2pixel(255, 215,   0)
#define Gold2						rgb2pixel(238, 201,   0)
#define Gold3						rgb2pixel(205, 173,   0)
#define Gold4						rgb2pixel(139, 117,   0)


// init/close fenetre + ecran
int init(SDL_Window** gWindow,SDL_Renderer** gRenderer, char* nameWindow);
void close(SDL_Window** gWindow,SDL_Renderer** gRenderer);

// dessin de formes simples
void dessine_point(SDL_Renderer* gRenderer,int x1, int y1,long coul);
void dessine_ligne(SDL_Renderer* gRenderer,int x1, int y1, int x2, int y2,long coul);
void dessine_rect_vide(SDL_Renderer* gRenderer,SDL_Rect *,long);
void dessine_rect_plein(SDL_Renderer* gRenderer,SDL_Rect *,long);
void dessine_cercle(SDL_Renderer* gRenderer,int centreX,int centreY,int radius,long coul);
void dessine_disque(SDL_Renderer* gRenderer,int cx, int cy, int rayon, long coul);
void dessine_ellipse_vide(SDL_Renderer* gRenderer,int cx, int cy, int rx, int ry, int coul, double largeur_trait);
void dessine_ellipse_plein(SDL_Renderer* gRenderer,int cx, int cy, int rx, int ry, int coul);
void dessine_fondtransparent(SDL_Renderer* gRenderer,int cx, int cy, int w,int h);

// dessins plus complexes

// dessine une jauge horizontale (verhor=1) ou verticale (verhor=0), 
//  valeurs soit [0,1] (posneg=0) soit [-1,1] (posneg=1), 
//  de couleur variant de couleur_min à couleur_max, sur couleur_fond, avec nb_graduations
void dessine_jauge(SDL_Renderer* gRenderer, SDL_Rect* rect, int verhor, int posneg, float value, long couleur_min, long couleur_max, long couleur_fond, int nb_graduations);

// pour le controle du temps des mises � jour
double getCurrentTimeMS();


#endif // _graphicSDL_h
