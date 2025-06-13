/* fichier contenant les parametres par defaut de notre simulation (notamment du robot) sous forme de #define */
#ifndef _params_h
#define _params_h

#include <graphicSDL.h>
// generiques
// pi
#define PI 3.14159265359
#define SCALE_RADperDEG PI/180.
#define SCALE_DEGperRAD 180./PI

// taille fenetre
#define SCREEN_WIDTH 880
#define SCREEN_HEIGHT 724

// vrai/faux
#define FALSE 0
#define TRUE 1

// parametres lies aux images a charger (BMP)
#define imgNameSorbonne "./img/sorbonne.bmp"
#define imgNameMaison "./img/maison_fond.bmp"
#define imgNameTableauDeBord "./img/tableau_bord.bmp"
// pour exo 4
#define FILE_MAP "./img/maison_nb.bmp"
#define FILE_MAP_OUT "./img/freeC.bmp"

// parametres liees à la simulation = nb de frames / sec ; utilisé notamment pour définir T
#define SCALE_FRAMEperSEC 60.
#define SCALE_SECperFRAME 1./60

// parametres lies a l environnement du robot (échelle)
#define SCALE_MperPIX 2./80
#define SCALE_PIXperM 80/2.
// parametres lies au tableau de bord
#define TAB_BORD_OFFSET_X SCREEN_WIDTH/4
#define TAB_BORD_OFFSET_Y 20
#define TAB_BORD_DX 250
#define TAB_BORD_DY TAB_BORD_DX/3
#define TAB_BORD_SCALE 1.0

// parametres liés a la definition de trajectoire / controle du robot le long d une traj
#define NBmaxClick 10 // nb de positions cliquées mémorisées au max


// parametres lies au robot (utilise pour initier la struct _robot dans init_robot();, cf. vacuumrobot.h/.c )
// parametres par defaut pouvant être modifier dans la struct _robot (si un menu chg_settings() existe ) 
#define robot_size   0.3 // diametre du robot, en m
#define robot_rect_h (int)round(robot_size*SCALE_PIXperM)  // largeur=hauteur=size/2 du robot en pix
#define robot_rect_w (int)round(robot_size*SCALE_PIXperM) 
#define robot_rect_x SCREEN_WIDTH/2-robot_rect_h/2  // en pix
#define robot_rect_y SCREEN_HEIGHT/2-robot_rect_w/2 
#define robot_couleur SkyBlue //couleur bleue ciel (definie dans graphicSDL.h)
#define robot_couleur_led Green 
#define robot_rayon_led 2 // en pix
#define robot_x 0  // positions initiales du robot en m 
#define robot_y 0 
#define robot_r_roues 0.02  // rayon roues en m 
#define robot_d_roues 0.2  // distance inter-roues en m
#define robot_theta 0  // en rad
#define robot_omega 0  // en rad/s
#define robot_omega_max 90*SCALE_RADperDEG 
#define robot_delta_v 0.02  // ajout/retrait à la vitesse linéaire en fct des touches UP et DOWN, en m/s
#define robot_delta_omega 2*SCALE_RADperDEG  // en rad/s
#define robot_v 0  //vitesse initiale, en m/s
#define robot_v_max 0.5  // =13km/h, en m/s
#define robot_vr 0 // vit initiales des roues
#define robot_vl 0 
#define robot_sigma_r 1*SCALE_RADperDEG 
#define robot_sigma_l 1*SCALE_RADperDEG
#define robot_k_rho 3.
#define robot_k_alpha 8.
#define robot_k_beta -1.5
#define robot_delta_batterie 1/100.
#define robot_batterie_max 100

// pour exo 4
#define RADIUS_ROBOT (int)round(robot_size/2*SCALE_PIXperM)

#endif
