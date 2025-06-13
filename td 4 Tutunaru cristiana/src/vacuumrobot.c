#include <vacuumrobot.h> 

void Rendu(AllGraphics *game, Robot *robot, int nb_frames)
{
    robot->batterie=(robot->batterie>=0)?robot->batterie-robot->delta_batterie:0;    // normalement cette instruction devrait être dans la partie SimulateGameWorld();

    fprintf(stdout,"* Warning: Rendu() is obsolete; please use Rendu_all() in vacuumrobot.h \n");
    fprintf(stdout,"\t if none Sac is defined, replace Rendu(ecran,robot,nb_frames); with Rendu_all(ecran,robot,NULL,NULL,nb_frames); \n");
    fprintf(stdout,"\t if Sac *s and Vecteur *Cible are defined, replace Rendu(ecran,robot,nb_frames); with Rendu_all(ecran,robot,Cible,s,nb_frames); \n");
   //nettoie ecran
    SDL_SetRenderDrawColor(game->ecran, 0xFF, 0xFF, 0xFF, 0xFF );
    SDL_RenderClear(game->ecran);
    // dessine la scene/decor de fond
    dessine_sceneFixe(game->ecran,game->sceneFixeTexture);
    // dessine sorbonne logo
    dessine_imageTexture_redim(game->ecran,game->sorbonneTexture,game->sorbonne_logo.x,game->sorbonne_logo.y,game->sorbonne_logo.w,game->sorbonne_logo.h);
   // dessine tableau bord
    dessine_imageTexture_redim(game->ecran,game->tableaubordTexture,TAB_BORD_OFFSET_X,TAB_BORD_OFFSET_Y,TAB_BORD_DX,TAB_BORD_DY);

    //dessine robot
    dessine_robot(game->ecran,robot,game->robotTexture,nb_frames);

    //Mise a jour de l'ecran
    SDL_RenderPresent(game->ecran);
}

void Rendu_all(AllGraphics *game, Robot *robot, Vecteur *Consigne, Sac *s,  int nb_frames)
{
    robot->batterie=(robot->batterie>=0)?robot->batterie-robot->delta_batterie:0;    // normalement cette instruction devrait être dans la partie SimulateGameWorld();

  //nettoie ecran
    SDL_SetRenderDrawColor(game->ecran, 0xFF, 0xFF, 0xFF, 0xFF );
    SDL_RenderClear(game->ecran);
    // dessine la scene/decor de fond
    dessine_sceneFixe(game->ecran,game->sceneFixeTexture);
    // dessine sorbonne logo
    dessine_imageTexture_redim(game->ecran,game->sorbonneTexture,game->sorbonne_logo.x,game->sorbonne_logo.y,game->sorbonne_logo.w,game->sorbonne_logo.h);
   // dessine tableau bord
    dessine_imageTexture_redim(game->ecran,game->tableaubordTexture,TAB_BORD_OFFSET_X,TAB_BORD_OFFSET_Y,TAB_BORD_DX,TAB_BORD_DY);
    //dessine trajectoire pour le robot
    dessine_trajSacVecteurs(game->ecran,robot,Consigne,s);

    //dessine robot
    dessine_robot(game->ecran,robot,game->robotTexture,nb_frames);

    //dessine jauge batterie
    dessine_jauge_batterie(game->ecran,robot);

    //Mise a jour de l'ecran
    SDL_RenderPresent(game->ecran);
}


void destroyTextures(AllGraphics *game)
{
    if (game->sceneFixeTexture) {SDL_DestroyTexture(game->sceneFixeTexture);game->sceneFixeTexture=NULL;}
    if (game->robotTexture) {SDL_DestroyTexture(game->robotTexture);game->robotTexture=NULL;}
    if (game->sorbonneTexture) {SDL_DestroyTexture(game->sorbonneTexture);game->sorbonneTexture=NULL;}
    if (game->tableaubordTexture) {SDL_DestroyTexture(game->tableaubordTexture);game->tableaubordTexture=NULL;}
}

void Init_Textures(AllGraphics *game, Robot*robot)
{
    int size_h=TAB_BORD_DY;
    int size_w=TAB_BORD_DX;
    
       // Initialisation des differentes textures
        game->sceneFixeTexture=creerTextureSceneFixe(game->ecran);
        game->robotTexture=creerTextureRobot(game->ecran,robot);
        game->tableaubordTexture=creerTextureFromImage(game->ecran,imgNameTableauDeBord,&size_w,&size_h);
        game->sorbonneTexture=creerTextureFromImage(game->ecran,imgNameSorbonne,&(game->sorbonne_logo.w),&(game->sorbonne_logo.h));
        // divise par 2 sa taille pour l'affichage (cf void dessine_sorbonne_redim(...) )
        game->sorbonne_logo.w=game->sorbonne_logo.w/2;
        game->sorbonne_logo.h=game->sorbonne_logo.h/2;
        game->sorbonne_logo.x=SCREEN_WIDTH-game->sorbonne_logo.w-20;
        game->sorbonne_logo.y=20;

}

//renvoie 0 si pas de click, 1 si clickgauche, 2 si click droit
int read_inputs(SDL_Event *e,Robot *robot,float *clickMouseX,float *clickMouseY,int *quit)
{
    int inputs=0;
    int mouseX=0,mouseY=0;
    *clickMouseX=0;
    *clickMouseY=0;

            while( SDL_PollEvent( e ) != 0 )
            {
                //quit en fermant la fenetre
                if( e->type == SDL_QUIT)
                {
                    *quit = TRUE;
                    break;
                }

                //si une touche est presee
                if( e->type == SDL_KEYDOWN)
                {
                    if (e->key.repeat == 0) // et relachee
                    {
                        //quel touche ?
                        switch( e->key.keysym.sym )
                        {
                            // controle du robot ( augmente ou diminue vitesses (v,omega) )
                            case SDLK_UP:
                                robot->v+=robot->delta_v;
                                robot->v=(robot->v>=robot->v_max)?robot->v_max:robot->v;
                                break;
                            case SDLK_DOWN:
                                robot->v-=robot->delta_v;
                                robot->v=(robot->v<=-robot->v_max)?-robot->v_max:robot->v;
                               break;
                            case SDLK_LEFT:
                                robot->omega+=robot->delta_omega;
                                robot->omega=(robot->omega>=robot->omega_max)?robot->omega_max:robot->omega;
                                break;
                            case SDLK_RIGHT:
                                robot->omega-=robot->delta_omega;
                                robot->omega=(robot->omega<=-robot->omega_max)?-robot->omega_max:robot->omega;
                                break;
                            // arret d urgence
                            case SDLK_SPACE:
                                robot->v=0;
                                robot->omega=0;
                                break;
                           // quitter la simulation en appuyant sur la touche 'q'
                            case SDLK_q:
                                *quit=TRUE;
                                break;
                         }
                    }
                }
                if (e->type == SDL_MOUSEBUTTONDOWN)
                {
                    if ( e->button.button == SDL_BUTTON_LEFT )
                    {
                        mouseX = e->button.x;
                        mouseY = e->button.y;
                        *clickMouseX=(mouseX-SCREEN_WIDTH/2)*SCALE_MperPIX;
                        *clickMouseY=(-mouseY+SCREEN_HEIGHT/2)*SCALE_MperPIX;
                        inputs=1;
                        break;
                    }
                    if ( e->button.button == SDL_BUTTON_RIGHT )
                    {
                        mouseX = e->button.x;
                        mouseY = e->button.y;
                        *clickMouseX=(mouseX-SCREEN_WIDTH/2)*SCALE_MperPIX;
                        *clickMouseY=(-mouseY+SCREEN_HEIGHT/2)*SCALE_MperPIX;
                        inputs=2;
                        break;
                    }          
                }
                

            }

    return inputs;
}


/* robot */
void init_robot(Robot *robot)
{
    robot->size=robot_size; // en m
    robot->rect.h=robot_rect_h; // en pix
    robot->rect.w=robot_rect_w;
    robot->rect.x=robot_rect_x; // en pix
    robot->rect.y=robot_rect_y;
    robot->couleur=robot_couleur;
    robot->couleur_led=robot_couleur_led;
    robot->rayon_led=robot_rayon_led;
    robot->x=robot_x; // en m 
    robot->y=robot_y;
    robot->r_roues=robot_r_roues; // en m 
    robot->d_roues=robot_d_roues; // en m
    robot->theta=robot_theta; // en rad
    robot->omega=robot_omega; // en rad/s
    robot->omega_max=robot_omega_max;
    robot->delta_v=robot_delta_v; // en m/s
    robot->delta_omega=robot_delta_omega; // en rad/s
    robot->v=robot_v;
    robot->v_max=robot_v_max; // en m/s
    robot->vr=0;
    robot->vl=0;
    robot->sigma_r=robot_sigma_r;
    robot->sigma_l=robot_sigma_l;
    robot->k_rho=robot_k_rho;
    robot->k_alpha=robot_k_alpha;
    robot->k_beta=robot_k_beta;
    robot->batterie_max=robot_batterie_max; 
    robot->batterie=robot->batterie_max; // 100% de charge de la batterie
    robot->delta_batterie=robot_delta_batterie;
}

/* texture robot */
SDL_Texture *creerTextureRobot(SDL_Renderer*ecran,Robot *robot)
{
    SDL_Texture* textureRobot=NULL;

    int pos_led_x=robot->rect.w/2+(int)round(robot->rect.w/2.*cos(robot->theta));
    int pos_led_y=robot->rect.h/2+(int)round(robot->rect.h/2.*sin(robot->theta));

    textureRobot=SDL_CreateTexture(ecran,SDL_PIXELFORMAT_RGBA8888,SDL_TEXTUREACCESS_TARGET,robot->rect.w,robot->rect.h);
    SDL_SetRenderTarget(ecran, textureRobot); //on modifie la texture

    SDL_RenderClear(ecran); // nettoie ecran
    SDL_SetTextureBlendMode(textureRobot, SDL_BLENDMODE_BLEND); // mode special pour la transparence
    SDL_SetRenderTarget(ecran, textureRobot); //on modifie la texture

    // dessine fond transparent
    dessine_fondtransparent(ecran,0,0,robot->rect.h,robot->rect.w);
    // dessine ellipse blanche (car on va changer la couleur en "ajoutant sur le blanc")
    dessine_ellipse_plein(ecran,robot->rect.w/2,robot->rect.h/2,robot->rect.w/2,robot->rect.h/2,robot->couleur);
    // dessine point (led verte = direction robot)
    dessine_point(ecran,pos_led_x,pos_led_y,robot->couleur_led);


    SDL_SetRenderTarget(ecran, NULL);

    return textureRobot;// Dorenavant, on modifie a nouveau le renderer
}

void dessine_tableau_de_bord(SDL_Renderer *ecran,Robot *robot)
{
        // position et taille du tableau de bord
        SDL_Rect TabBord; 
        TabBord.x=TAB_BORD_OFFSET_X;
        TabBord.y=TAB_BORD_OFFSET_Y;
        TabBord.w=(int)(TAB_BORD_DX*TAB_BORD_SCALE);
        TabBord.h=(int)(TAB_BORD_DY*TAB_BORD_SCALE);
        // position et taille de l'indicateur central (disque) de theta + omega
        int tb_tw_cx= TabBord.x+TabBord.w/2;
        int tb_tw_cy= TabBord.y+TabBord.h/2;
        int tb_tw_rayon=(int)ceil((0.8*TabBord.h)/2);
        // position et tailles des indicateurs (barres) des vitesses lineaire et angulaire
        // todo : faire une fct qui réalise un indicateur de type barre (plutôt que de répéter 4X le m code) 
        //        avec une option pour faire la barre verticale ou horizontale + position du zero 
        //        -> puis l'exporter dans graphicSDL.c/.l
        int tb_vw_cx=TabBord.x+TabBord.w/5;
        int tb_vw_cy=TabBord.y+TabBord.h/2;
        int tb_vw_dx=TabBord.w/40;
        int tb_vw_dy=(int)ceil((0.6*TabBord.h)/2);
        int tb_vw_ecart=2*tb_vw_dx;
        SDL_Rect tb_barre_v_fond;
        tb_barre_v_fond.x=tb_vw_cx-tb_vw_dx-tb_vw_ecart;
        tb_barre_v_fond.y=tb_vw_cy-tb_vw_dy;
        tb_barre_v_fond.w=tb_vw_dx*2;
        tb_barre_v_fond.h=tb_vw_dy*2;
        SDL_Rect tb_barre_w_fond;
        tb_barre_w_fond.x=tb_vw_cx-tb_vw_dx+tb_vw_ecart;
        tb_barre_w_fond.y=tb_vw_cy-tb_vw_dy;
        tb_barre_w_fond.w=tb_vw_dx*2;
        tb_barre_w_fond.h=tb_vw_dy*2;
        // position et tailles des indicateurs (barres) des vitesses des roues gauche et droite
        float max_sigma=(robot->sigma_l>robot->sigma_r)?robot->sigma_l:robot->sigma_r;
        int vit_max_roue=(int)floor(robot->v_max/robot->r_roues+robot->d_roues/(2*robot->r_roues)*robot->omega_max+max_sigma);
        int tb_lr_cx=TabBord.x+4*TabBord.w/5;
        int tb_lr_cy=TabBord.y+TabBord.h/2;
        int tb_lr_dx=TabBord.w/40;
        int tb_lr_dy=(int)ceil((0.6*TabBord.h)/2);
        int tb_lr_ecart=2*tb_lr_dx;
        SDL_Rect tb_barre_l_fond;
        tb_barre_l_fond.x=tb_lr_cx-tb_lr_dx-tb_lr_ecart;
        tb_barre_l_fond.y=tb_lr_cy-tb_lr_dy;
        tb_barre_l_fond.w=tb_lr_dx*2;
        tb_barre_l_fond.h=tb_lr_dy*2;
        SDL_Rect tb_barre_r_fond;
        tb_barre_r_fond.x=tb_lr_cx-tb_lr_dx+tb_lr_ecart;
        tb_barre_r_fond.y=tb_lr_cy-tb_lr_dy;
        tb_barre_r_fond.w=tb_lr_dx*2;
        tb_barre_r_fond.h=tb_lr_dy*2;
    
        // tableau de bord
        //dessine_rect_plein(ecran,&TabBord,DarkGray);
        //dessine_rect_vide(ecran,&TabBord,Black);

        // indicateur central (disque) de la direction et de la vit angulaire du robot
        //dessine_disque(ecran,tb_tw_cx,tb_tw_cy,tb_tw_rayon,LightGrey);
        //dessine_cercle(ecran,tb_tw_cx,tb_tw_cy,tb_tw_rayon,Black);
        dessine_ligne(ecran,tb_tw_cx,tb_tw_cy,(int)(tb_tw_cx+(tb_tw_rayon*0.8)*cos(robot->theta)),(int)(tb_tw_cy-(tb_tw_rayon*0.8)*sin(robot->theta)),Red);
        dessine_ligne(ecran,tb_tw_cx,tb_tw_cy,(int)(tb_tw_cx+(tb_tw_rayon*0.6)*cos(robot->theta+robot->omega)),
                        (int)(tb_tw_cy-(tb_tw_rayon*0.6)*sin(robot->theta+robot->omega)),Blue);

        // indcateurs (barres) des vitesses lineaire et  angulaire
        // v
        dessine_jauge(ecran,&tb_barre_v_fond,0,1,robot->v/robot->v_max,Green,Green,LightGrey,0);
        // w
        dessine_jauge(ecran,&tb_barre_w_fond,0,1,robot->omega/robot->omega_max,Green,Green,LightGrey,0);
        // indcateurs (barres) des vitesses des roues gauche et droite
        // left
        dessine_jauge(ecran,&tb_barre_l_fond,0,1,robot->vl/vit_max_roue,Green,Green,LightGrey,0);
        // right
        dessine_jauge(ecran,&tb_barre_r_fond,0,1,robot->vr/vit_max_roue,Green,Green,LightGrey,0);
}

// 
void dessine_jauge_batterie(SDL_Renderer *ecran,Robot *robot)
{
   SDL_Rect batterie;
   batterie.x=SCREEN_WIDTH-85;
   batterie.y=110;
   batterie.w=40;
   batterie.h=100;
    dessine_jauge(ecran,&batterie,0,0,robot->batterie/robot->batterie_max,Red,Green,LightGrey,0);

}


/* dessine robot */
void dessine_robot(SDL_Renderer *ecran,Robot *robot,SDL_Texture* robotTexture, int nb_frames)
{
    int w,h;

    int red = ( uint8_t )(robot->couleur >> 16);
    int green = ( uint8_t )(robot->couleur >>  8);
    int blue = (  uint8_t  )robot->couleur;
    SDL_SetTextureColorMod(robotTexture, red, green, blue );

    SDL_QueryTexture(robotTexture, NULL, NULL, &w, &h);
    robot->rect.x=(int)round(robot->x*SCALE_PIXperM+SCREEN_WIDTH/2)-w/2;
    robot->rect.y=(int)round(-robot->y*SCALE_PIXperM+SCREEN_HEIGHT/2)-h/2;
    robot->rect.h=h;
    robot->rect.w=w;

    int pos_led_x=robot->rect.x+robot->rect.w/2+(int)round((robot->rect.w/2.-robot->rayon_led)*cos(robot->theta));
    int pos_led_y=robot->rect.y+robot->rect.h/2-(int)round((robot->rect.h/2.-robot->rayon_led)*sin(robot->theta));

    dessine_tableau_de_bord(ecran,robot);

    SDL_RenderCopy(ecran,robotTexture, NULL, &(robot->rect));

    if (nb_frames%2)
        dessine_disque(ecran,pos_led_x,pos_led_y,robot->rayon_led,LightGreen);
    else
        dessine_disque(ecran,pos_led_x,pos_led_y,robot->rayon_led,Red);


}



/* test collision robot bord */
int collision_bord_ecran(Robot *robot)
{
     if(robot->rect.x<0)
     {   
        robot->rect.x=0;
        robot->x=round((robot->rect.x-SCREEN_WIDTH/2+robot->rect.w)*SCALE_MperPIX); //todo:faire des fcts pour ces conversions M<->Pix
        robot->couleur=Red;
        return(1);
     }
    if(robot->rect.y<0)
    {   
        robot->rect.y=0;
        robot->y=round((-SCREEN_HEIGHT/2-robot->rect.h)*SCALE_MperPIX);
        robot->couleur=Red;
        return(1);
    }
    if(robot->rect.x>SCREEN_WIDTH-robot->rect.w)
    {
        robot->rect.x=SCREEN_WIDTH-robot->rect.w;
        robot->x=round((robot->rect.x-SCREEN_WIDTH/2+robot->rect.w)*SCALE_MperPIX);
        robot->couleur=Red;
       return(1);
    }
    if(robot->rect.y>SCREEN_HEIGHT-robot->rect.h)
    {
        robot->rect.y=0;
        robot->y=round((-robot->rect.y-robot->rect.h+SCREEN_HEIGHT/2)*SCALE_MperPIX);
        robot->couleur=Red;
       return(1);
    }

    robot->couleur=SkyBlue;
    return(0);
}

/* Scene Fixe */
SDL_Texture *creerTextureSceneFixe(SDL_Renderer*ecran)
{
    int size_w; 
    int size_h;
    
    SDL_Surface* image = SDL_LoadBMP(imgNameMaison);
    if(!image)
    {
      printf("Erreur de chargement de l'image : %s",SDL_GetError());
      return NULL;
    }

    SDL_Texture* monImage = SDL_CreateTextureFromSurface(ecran,image);
    SDL_FreeSurface(image);

    if(NULL == monImage)
    {
        fprintf(stderr, "Erreur SDL_CreateTextureFromSurface : %s", SDL_GetError());
        return NULL;
    }
    SDL_QueryTexture(monImage, NULL, NULL,&size_w,&size_h); // on recup�re la taille de l'image


    return monImage;
}




void dessine_sceneFixe(SDL_Renderer *ecran, SDL_Texture *sceneFixe) 
{
    SDL_Rect position;
    position.x = 0;
    position.y = 0;
    SDL_QueryTexture(sceneFixe, NULL, NULL, &position.w, &position.h);
    SDL_RenderCopy(ecran, sceneFixe, NULL, &position);
}



SDL_Texture* creerTextureFromImage(SDL_Renderer *ecran,char *nom_file_bmp,int *size_w, int *size_h)
{
    SDL_Surface* image = SDL_LoadBMP(nom_file_bmp);
    if(!image)
    {
      printf("Erreur de chargement de l'image : %s",SDL_GetError());
      return NULL;
    }

    SDL_Texture* monImage = SDL_CreateTextureFromSurface(ecran,image);
    SDL_FreeSurface(image);

    if(NULL == monImage)
    {
        fprintf(stderr, "Erreur SDL_CreateTextureFromSurface : %s", SDL_GetError());
        return NULL;
    }
    SDL_QueryTexture(monImage, NULL, NULL,size_w,size_h); // on recup�re la taille de l'image


    return monImage;
}

void dessine_imageTexture(SDL_Renderer *ecran,SDL_Texture *imageTexture,int x, int y)
{
    SDL_Rect position;
    position.x = x;
    position.y = y;

    SDL_QueryTexture(imageTexture,NULL,NULL,&position.w,&position.h);// recupere la taille de l'image originelle
    SDL_RenderCopy(ecran, imageTexture, NULL, &position);
}

void dessine_imageTexture_redim(SDL_Renderer *ecran,SDL_Texture *imageTexture,int x, int y, int w_new,int h_new)
{
    SDL_Rect position;
    position.x = x;
    position.y = y;
    position.w=w_new;
    position.h=h_new;
    SDL_Rect pos_texture; // taille originale
    pos_texture.x=0;
    pos_texture.y=0;
    SDL_QueryTexture(imageTexture,NULL,NULL,&pos_texture.w,&pos_texture.h);// recupere la taille de l'image originelle
    SDL_RenderCopy(ecran, imageTexture,&pos_texture, &position);
}

/* sac Vecteurs */
//  desine une trajectoires définie depuis le robot vers une serie de Vecteurs (dans un sac)
void dessine_trajSacVecteurs(SDL_Renderer *ecran,Robot *robot, Vecteur *Consigne, Sac* s){ 
    int inc, ind;
    int x1=1,y1=1,x2=1,y2=1;
    
    x1=(int)round(SCREEN_WIDTH/2+robot->x*SCALE_PIXperM); //todo : fct de converstion m->pix
    y1=(int)round(SCREEN_HEIGHT/2-robot->y*SCALE_PIXperM);

    if(Consigne!=NULL)
     {
        x2=(int)round(SCREEN_WIDTH/2.+getVec(Consigne,1)*SCALE_PIXperM); 
        y2=(int)round(SCREEN_HEIGHT/2.-getVec(Consigne,2)*SCALE_PIXperM); 
        dessine_ligne(ecran,x1,y1,x2,y2,DarkGreen);
        x1=x2;
        y1=y2;
    }

    if (s!=NULL && !sacVide(s))
    {   
        ind=s->begin;
        x2=(int)round(SCREEN_WIDTH/2+getVec(&s->tabVec[ind],1)*SCALE_PIXperM); //todo : fct de converstion m->pix
        y2=(int)round(SCREEN_HEIGHT/2-getVec(&s->tabVec[ind],2)*SCALE_PIXperM);
        dessine_ligne(ecran,x1,y1,x2,y2,LightGreen);
        x1=x2;
        y1=y2; 
 
        for (inc=1;inc<s->nb;inc++) 
        {
            ind=(s->begin+inc)%s->size;

            x2=(int)round(SCREEN_WIDTH/2+getVec(&s->tabVec[ind],1)*SCALE_PIXperM); //todo : fct de converstion m->pix
            y2=(int)round(SCREEN_HEIGHT/2-getVec(&s->tabVec[ind],2)*SCALE_PIXperM);
            dessine_ligne(ecran,x1,y1,x2,y2,LightGreen);
            x1=x2;
            y1=y2;

        }
    }
}
