/*
Sorbonne Universite/LEEA/LU2EE21

A Brave Little Vacuum Robot

Contributeurs : Xavier Clady, xavier.clady@sorbonne-uniersite.fr
                Tutunaru Cristiana, cristiana.tutunaru@etu.sorbonne-universite.fr

version : 1.0
creation : 02/2024
*/


#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include <math.h>

#include <graphicSDL.h>
#include <vacuumrobot.h>
#include <matrice.h>

int main(int argc, char** argv)
{
   /**************************/
   /** Partie Initialize(); **/
   /**************************/

   int success=FALSE;
   /* INIT */
    //test de sortie du jeu (de la boucle principale)
    int quit = FALSE;
    float mouseX, mouseY;
    int test_mouse=FALSE;
     // compteur de frames (d'affichage)
    int nb_frames=0;
    // init tirage aleatoire
    srand(time(NULL));
    
   // struct _allGraphics = structure contenant ttes les variables liées à l'environnement graphique
   AllGraphics game;
   success=init(&(game.fenetre),&(game.ecran),"Brave little vacuum robot");

    //Init d'un robot, controle par l'utilisateur
    Robot robot;
    init_robot(&robot);

    /*************************************************************/
    /**** A COMPLETER                                         ****/
    /**** Variables à définir (utiliser TDTP2)                ****/
    /**** et à initialiser selon pos & vit initales du robot  ****/
    /*************************************************************/

    
    float T = SCALE_SECperFRAME; //periode (à modifier si trop rapide/lent)

    //il nous faut 2 matrices F et B et 2 vecteurs position et vitesse (et matrices pour contenir resultat multi matricielle)
    
    Matrice * F = NULL, * B = NULL;
    Vecteur pos; 
    Vecteur vitesse;  
    Vecteur * etat1 = NULL; 
    Vecteur * etat2 = NULL; 
    Vecteur * Cmd = NULL;

    Vecteur * Cible = NULL;
    Vecteur * vec = NULL;

    float L = robot.d_roues;
    float R = robot.r_roues;
    
    // Allocation
    F = allouer_Matrice(3, 3);
    B = allouer_Matrice(3, 2);

    allouer_Vecteur(&pos, 3);
    allouer_Vecteur(&vitesse, 2);
    
    // Set F
    setMat(1, F, 1, 1);
    setMat(0, F, 1, 2);
    setMat(0, F, 1, 3);

    setMat(0, F, 2, 1);
    setMat(1, F, 2, 2);
    setMat(0, F, 2, 3);

    setMat(0, F, 3, 1);
    setMat(0, F, 3, 2);
    setMat(1, F, 3, 3);

    // Set B
    setMat(T * cos(robot.theta), B, 1, 1);
    setMat(0, B, 1, 2);

    setMat(T*sin(robot.theta), B, 2, 1);
    setMat(0, B, 2, 2);
  
    setMat(0, B, 3, 1);
    setMat(T, B, 3, 2);

    // (v, w) ^ T sans bruit 
    setVec(robot.v, &vitesse, 1);
    setVec(robot.omega, &vitesse, 2);
    fprintf(stdout, "(v, omega)^T = \n");
    afficher_Vecteur(&vitesse);

    // Initialisation correcte des vecteurs d'état
    setVec(robot.x, &pos, 1);
    setVec(robot.y, &pos, 2);
    setVec(robot.theta, &pos, 3);

    // exo 2.3
    Vecteur* vitesse_bruit = NULL; 
    Vecteur vec_bruit; 
    Vecteur* SommeTemp = NULL;
    Matrice* Sigma_LR = NULL;
    Matrice* D = NULL; 
    Matrice* A = NULL;

    Vecteur* produit = NULL;
    Vecteur* sigma = NULL;

    float mu = rand() / (float)RAND_MAX * 2 - 1;
    float nu = rand() / (float)RAND_MAX * 2 - 1;

    float sigma_l = 1;
    float sigma_r = 1;

    // Allocation
    D = allouer_Matrice(2, 2);
    A = allouer_Matrice(2, 2);
    Sigma_LR = allouer_Matrice(2, 2);

    allouer_Vecteur(&vec_bruit, 2);

    produit = (Vecteur*) malloc(sizeof(Vecteur));
    if (produit == NULL) {
        fprintf(stderr, "Erreur d'allocation mémoire pour produit\n");
        exit(1);
    }
    allouer_Vecteur(produit, 2);

    sigma = (Vecteur*) malloc(sizeof(Vecteur));    
    if (sigma == NULL) {
        fprintf(stderr, "Erreur d'allocation mémoire pour sigma\n");
        exit(1);
    }
    allouer_Vecteur(sigma, 2);

    vitesse_bruit = (Vecteur*) malloc(sizeof(Vecteur));
    if (vitesse_bruit == NULL) {
        fprintf(stderr, "Erreur d'allocation mémoire pour vitesse_bruit\n");
        exit(1);
    }
    allouer_Vecteur(vitesse_bruit, 2);

    // Set D
    setMat(R/2, D, 1, 1);
    setMat(R/2, D, 1, 2);

    setMat(R/L, D, 2, 1);
    setMat(-R/L, D, 2, 2);

    // Set A
    setMat(1/R, A, 1, 1);
    setMat(L/(2*R), A, 1, 2);

    setMat(1/R, A, 2, 1);
    setMat(-L/(2*R), A, 2, 2);

    // Set vec_bruit
    setVec(mu, &vec_bruit, 1);
    setVec(nu, &vec_bruit, 2);

    // Set Sigma_LR
    setMat(sigma_r, Sigma_LR, 1, 1);
    setMat(0, Sigma_LR, 1, 2);

    setMat(0, Sigma_LR, 2, 1);
    setMat(sigma_l, Sigma_LR, 2, 2);

    //Partie Commande automatique du robot - Déclaration
    float x_goal = 0, y_goal = 0, theta_goal = 0;
    float rho = 0, alpha = 0, beta = 0;
    float delta_x = 0, delta_y = 0;
    float threshold = 0.1;

    if( !success )
    {
         fprintf(stderr,"Erreur de creation de la fenetre: %s\n",SDL_GetError());
    }
    else
	{
        /******************************/
        /** Partie LoadRessources(); **/
        /******************************/

        // Initialisation des textures avec vérification
        printf("DEBUG: Avant Init_Textures\n");
        Init_Textures(&game,&robot);
        printf("DEBUG: Après Init_Textures\n");

        /* BOUCLE DU JEU / GAME LOOP */
        while( !quit )
        {
            /******************************/
            /** Partie processInputs();  **/
            /******************************/

            //lit les evenements (appuie sur ue touche, souris...)
            test_mouse=read_inputs(&(game.e),&robot,&mouseX,&mouseY,&quit);
            // si touche UP : robot.dv += robot.delta_v (+0.2 m/s)
            // si touche DOWN : robot.dv -= robot.delta_v (-0.2 m/s)
            // si touche RIGHT : robot.domega -= robot.delta_omega (-3 deg/s)
            // si touche LEFT : robot.domega += robot.delta_omega (+3 deg/s)

            if (test_mouse) //affichage de la position (en m) de la souris si click gauche
            {
                fprintf(stdout,"pos souris =(%f,%f) m. \n",mouseX,mouseY);
            }
            fprintf(stdout,"(v,w)^T=(%f,%f)\n",robot.v,robot.omega);

            if(test_mouse){
                // Libération et réallocation propre pour éviter les fuites mémoire
                if(Cible) {
                    libere_Vecteur(Cible);
                    free(Cible);
                    Cible=NULL;
                }

                if(vec){
                    libere_Vecteur(vec);
                    free(vec);
                    vec = NULL;       
                }

                vec = (Vecteur*) malloc(sizeof(Vecteur));
                if (vec == NULL) {
                    fprintf(stderr, "Erreur d'allocation mémoire pour vec\n");
                    quit = TRUE;
                    continue;
                }
                
                Cible = (Vecteur*) malloc(sizeof(Vecteur));
                if (Cible == NULL) {
                    fprintf(stderr, "Erreur d'allocation mémoire pour Cible\n");
                    quit = TRUE;
                    continue;
                }

                allouer_Vecteur(vec, 2);
                setVec(robot.x, vec, 1);
                setVec(robot.y, vec, 2);

                allouer_Vecteur(Cible, 2);
                setVec(mouseX, Cible, 1);
                setVec(mouseY, Cible, 2);

                theta_goal = angle_2Vecteurs2D(vec, Cible);
            }

            /***************************************************/
            /** Partie updateValues(); && SimulateGameWorld() **/
            /***************************************************/
            /**************************************************************/
            /**** A COMPLETER                                         *****/
            /**************************************************************/
            /*    Mise à jour de l etat du robot   */

            // Calculs pour la vitesse du robot 
            // Correction ici - s'assurer que etat1 est initialisé et mis à jour correctement
            if(etat1) {
                libere_Vecteur(etat1);
                free(etat1);
                etat1 = NULL;
            }
            
            if(etat2) {
                libere_Vecteur(etat2);
                free(etat2);
                etat2 = NULL;
            }
            
            if(Cmd) {
                libere_Vecteur(Cmd);
                free(Cmd);
                Cmd = NULL;
            }
            
            // Mise à jour de vitesse avec les nouvelles valeurs
            setVec(robot.v, &vitesse, 1);
            setVec(robot.omega, &vitesse, 2);

            etat2 = multi_Matrice(F, &pos);
            if (!etat2) {
                fprintf(stderr, "Erreur: etat2 est NULL après multi_Matrice\n");
                quit = TRUE;
                continue;
            }
            
            Cmd = multi_Matrice(B, &vitesse);
            if (!Cmd) {
                fprintf(stderr, "Erreur: Cmd est NULL après multi_Matrice\n");
                quit = TRUE;
                continue;
            }
            
            etat1 = somme_Vecteur(etat2, Cmd);
            if (!etat1) {
                fprintf(stderr, "Erreur: etat1 est NULL après somme_Vecteur\n");
                quit = TRUE;
                continue;
            }
            
            // Mise à jour de la position du robot
            robot.x = getVec(etat1, 1);
            robot.y = getVec(etat1, 2);
            robot.theta = getVec(etat1, 3);
            
            // Copie de etat1 vers pos pour la prochaine itération
            copy_Vecteur(etat1, &pos);
            
            // Mise à jour des vitesses des roues
            robot.vr = (2*robot.v + L * robot.omega)/(2*R);
            robot.vl = (2*robot.v - L * robot.omega)/(2*R);
            
            //Reset B
            setMat(T * cos(robot.theta), B, 1, 1);
            setMat(0, B, 1, 2);

            setMat(T * sin(robot.theta), B, 2, 1);
            setMat(0, B, 2, 2);
        
            setMat(0, B, 3, 1);
            setMat(T, B, 3, 2);

            //Calculs pour l'ajout du bruit 
            // Vérifier et réinitialiser les valeurs intermédiaires si nécessaire
            if(SommeTemp) {
                libere_Vecteur(SommeTemp);
                free(SommeTemp);
                SommeTemp = NULL;
            }

            // Mise à jour aléatoire du bruit
            mu = rand() / (float)RAND_MAX * 2 - 1;
            nu = rand() / (float)RAND_MAX * 2 - 1;
            setVec(mu, &vec_bruit, 1);
            setVec(nu, &vec_bruit, 2);

            produit = multi_Matrice(A, &vitesse);
            if (!produit) {
                fprintf(stderr, "Erreur: produit est NULL\n");
                quit = TRUE;
                continue;
            }
            
            sigma = multi_Matrice(Sigma_LR, &vec_bruit);
            if (!sigma) {
                fprintf(stderr, "Erreur: sigma est NULL\n");
                quit = TRUE;
                continue;
            }
            
            SommeTemp = somme_Vecteur(produit, sigma);
            if (!SommeTemp) {
                fprintf(stderr, "Erreur: SommeTemp est NULL\n");
                quit = TRUE;
                continue;
            }
            
            // Libérer les vecteurs avant de les réutiliser
            if (vitesse_bruit) {
                libere_Vecteur(vitesse_bruit);
                free(vitesse_bruit);
                vitesse_bruit = NULL;
            }
            
            vitesse_bruit = multi_Matrice(D, SommeTemp);
            if (!vitesse_bruit) {
                fprintf(stderr, "Erreur: vitesse_bruit est NULL\n");
                quit = TRUE;
                continue;
            }
            
            // Mise à jour des vitesses du robot avec bruit
            robot.v = getVec(vitesse_bruit, 1);
            robot.omega = getVec(vitesse_bruit, 2);

            //Calculs pour le pilotage automatique 
            if(Cible){
                x_goal = getVec(Cible, 1);
                y_goal = getVec(Cible, 2);

                delta_x = x_goal - robot.x;
                delta_y = y_goal - robot.y;
                
                if ((fabs(delta_x) < threshold) && (fabs(delta_y) < threshold) && (fabs(robot.theta - theta_goal) < threshold)){
                    robot.v = 0;
                    robot.omega = 0;
                } else {
                    rho = sqrt(delta_x*delta_x + delta_y*delta_y);
                    alpha = -robot.theta - atan2(delta_y, delta_x); 
                    beta = -robot.theta - alpha + theta_goal;

                    // Normaliser les angles
                    alpha = warp_angle(alpha);
                    beta = warp_angle(beta);
                    
                    // Calculer les vitesses
                    if(cos(alpha) > 0){
                        robot.v = (robot_k_rho*rho < robot_v_max) ? robot_k_rho*rho : robot_v_max;
                    } else {
                        robot.v = (robot_k_rho*rho < -robot_v_max) ? -robot_k_rho*rho : -robot_v_max;
                    }

                    robot.omega = robot_k_alpha*alpha + robot_k_beta*beta;
                    robot.omega = (robot.omega > robot_omega_max) ? robot_omega_max : 
                                 (robot.omega < -robot_omega_max) ? -robot_omega_max : robot.omega;
                }
            }

            /***************************************************************/
            /***************************************************************/
            
            /**************************************/
            /** Partie CheckShutdownConditions() **/
            /**************************************/
            // collision avec le bord de l'ecran -> bloqué + chgmt de couleur
            int bord_test=collision_bord_ecran(&robot);
            if (bord_test)
            {
                // arret d'urgence du robot
                robot.v=0;
                robot.omega=0;
                fprintf(stderr,"Collision avec le bord de la fenetre\n");
                //quit=TRUE;
            }

            /******************************/
            /** Partie RenderGameWorld() **/
            /******************************/
            // Rendu(&game,&robot,nb_frames);
            Rendu_all(&game,&robot,Cible,NULL,nb_frames);
            nb_frames=nb_frames+1;
        }
    }

    /*******************************/
    /** Partie UnloadRessources() **/
    /*******************************/

    // Libération correcte de la mémoire
    if(F){
        libere_Matrice(F);
        free(F);
        F = NULL;
    }

    if(B){
        libere_Matrice(B);
        free(B);
        B = NULL;
    }

    if(etat1){
        libere_Vecteur(etat1);
        free(etat1);
        etat1 = NULL;
    }

    if(etat2){
        libere_Vecteur(etat2);
        free(etat2);
        etat2 = NULL;
    }
    
    if(Cmd){
        libere_Vecteur(Cmd);
        free(Cmd);
        Cmd = NULL;
    }

    if(Sigma_LR){
        libere_Matrice(Sigma_LR);
        free(Sigma_LR);
        Sigma_LR = NULL;
    }

    if(D){
        libere_Matrice(D);
        free(D);
        D = NULL;
    }

    if(A){
        libere_Matrice(A);
        free(A);
        A = NULL;
    }

    if(produit){
        libere_Vecteur(produit);
        free(produit);
        produit = NULL;
    }

    if(sigma){
        libere_Vecteur(sigma);
        free(sigma);
        sigma = NULL;
    }

    if(SommeTemp){
        libere_Vecteur(SommeTemp);
        free(SommeTemp);
        SommeTemp = NULL;
    }

    if(vitesse_bruit){
        libere_Vecteur(vitesse_bruit);
        free(vitesse_bruit);
        vitesse_bruit = NULL;
    }

    if(Cible){
        libere_Vecteur(Cible);
        free(Cible);
        Cible = NULL;
    }

    if(vec){
        libere_Vecteur(vec);
        free(vec);
        vec = NULL;
    }
    
    // Ne pas oublier de libérer pos et vitesse
    libere_Vecteur(&pos);
    libere_Vecteur(&vitesse);

    // destruction des textures
    destroyTextures(&game);
    // ferme ecran et fenetre
    close(&(game.fenetre),&(game.ecran));

    return 0;
}

/** Fin fonction principale et d�but des fonctions **/