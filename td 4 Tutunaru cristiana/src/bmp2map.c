/**********************************************************/
/* author : Fvirtman (http://fvirtman.free.fr)            */
/* http://fvirtman.free.fr/recueil/01_09_02_testbmp.c.php */
/**********************************************************/

#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <bmp2map.h>


/* convertir une image rgb en carte d'occupation (blanc=(255,255,255)->0, autre->1) */
Matrice *img_rgb2map_occup(Image* I)
{
    int i,j;
    Pixel p;
    Matrice *map_occup=NULL;

    if (I==NULL)
    {
        fprintf(stderr,"Error in img_rgb2map_occup : none image\n");
        exit(1);
    }

    map_occup=allouer_Matrice(I->w,I->h);

    for (i=0;i<I->w;i++)
        for(j=0;j<I->h;j++)
        {
          p=GetPixel(I,i,j);
          if (p.r==255&&p.b==255&&p.r==255)
            map_occup->data[i][j]=0;
          else
            map_occup->data[i][j]=1;
        }

    return map_occup;
}

/* convertion inverse de la précédente */
Image *map_occup2img_rgb(Matrice* m)
{
    int i,j;
    Pixel p_blanc,p_noir;
    Image *I=NULL;

    if (m==NULL)
    {
        fprintf(stderr,"Error in map_occup2img_rgb : none map\n");
        exit(1);
    }

    I=NouvelleImage(m->row,m->col);
    p_blanc.r=255;p_blanc.g=255;p_blanc.b=255;
    p_noir.r=0;p_noir.g=0;p_noir.b=0;

    for (i=0;i<I->w;i++)
        for(j=0;j<I->h;j++)
        {
          if (m->data[i][j])
            SetPixel(I,i,j,p_noir);
          else
            SetPixel(I,i,j,p_blanc);
        }

    return I;
}


Image* NouvelleImage(int w,int h)
{
	Image* I = malloc(sizeof(Image));
	I->w = w;
	I->h = h;
	I->dat = calloc(1,w*h*sizeof(Pixel*));
	return I;
}

Image* CopieImage(Image* I)
{
	Image* res;
	if (!I)
		return NULL;
	res = NouvelleImage(I->w,I->h);
	memcpy(res->dat,I->dat,I->w*I->h*sizeof(Pixel));
	return res;
}

void DelImage(Image* I)
{
	if (I)
	{
		free(I->dat);
		free(I);
	}
}

void SetPixel(Image* I,int i,int j,Pixel p)
{
	assert(I && i>=0 && i<I->w && j>=0 && j<I->h);
	I->dat[I->w*j+i] = p;
}

Pixel GetPixel(Image* I,int i,int j)
{
	assert(I && i>=0 && i<I->w && j>=0 && j<I->h);
	return I->dat[I->w*j+i];
}

// -------------------------------------------

#pragma pack(1)  // desative l'alignement m�moire
typedef int int32;
typedef short int16;

struct BMPImHead
{
	int32 size_imhead;
	int32 width;
	int32 height;
	int16 nbplans; // toujours 1
	int16 bpp;
	int32 compression;
	int32 sizeim;
	int32 hres;
	int32 vres;
	int32 cpalette;
	int32 cIpalette;
};

struct BMPHead
{
	char signature[2];
	int32 taille;
	int32 rsv;
	int32 offsetim;
	struct BMPImHead imhead;
};

Image* Charger(const char* fichier)
{
	struct BMPHead head;
	Image* I;
	int i,j,pitch;
	unsigned char bgrpix[3];
	char corrpitch[4] = {0,3,2,1};
	Pixel p;
	FILE* F = fopen(fichier,"rb");
	if (!F)
		return NULL;
	fread(&head,sizeof(struct BMPHead),1,F);
	if (head.signature[0]!='B' || head.signature[1]!='M')
		return NULL;  // mauvaise signature, ou BMP non support�.
	if (head.imhead.bpp!=24)
		return NULL;  // supporte que le 24 bits pour l'instant
	if (head.imhead.compression!=0)
		return NULL;  // rarrissime, je ne sais m�me pas si un logiciel �crit/lit des BMP compress�s.
	if (head.imhead.cpalette!=0 || head.imhead.cIpalette!=0)
		return NULL; // pas de palette support�e, cependant, a bpp 24, il n'y a pas de palette.
	I = NouvelleImage(head.imhead.width,head.imhead.height);
	pitch = corrpitch[(3*head.imhead.width)%4];
	for(j=0;j<I->h;j++)
	{
		for(i=0;i<I->w;i++)
		{
			fread(&bgrpix,1,3,F);
			p.r = bgrpix[2];
			p.g = bgrpix[1];
			p.b = bgrpix[0];
			SetPixel(I,i,I->h-j-1,p);
		}
		fread(&bgrpix,1,pitch,F);
	}
	fclose(F);
	return I;
}

int Sauver(Image* I,const char* fichier)
{
	struct BMPHead head;
	Pixel p;
	int i,j,tailledata,pitch;
	unsigned char bgrpix[3];
	char corrpitch[4] = {0,3,2,1};
	FILE* F = fopen(fichier,"wb");
	if (!F)
		return -1;
	memset(&head,0,sizeof(struct BMPHead));
	head.signature[0] = 'B';
	head.signature[1] = 'M';
	head.offsetim = sizeof(struct BMPHead); // je vais toujours �crire sur le m�me moule.
	head.imhead.size_imhead = sizeof(struct BMPImHead);
	head.imhead.width = I->w;
	head.imhead.height = I->h;
	head.imhead.nbplans = 1;
	head.imhead.bpp = 24;
	pitch = corrpitch[(3*head.imhead.width)%4];
	tailledata = 3*head.imhead.height*head.imhead.width + head.imhead.height*pitch;
	head.imhead.sizeim = tailledata;
	head.taille = head.offsetim + head.imhead.sizeim;
	fwrite(&head,sizeof(struct BMPHead),1,F);
	for(j=0;j<I->h;j++)
	{
		for(i=0;i<I->w;i++)
		{
			p = GetPixel(I,i,I->h-j-1);
			bgrpix[0] = p.b;
			bgrpix[1] = p.g;
			bgrpix[2] = p.r;
			fwrite(&bgrpix,1,3,F);
		}
		bgrpix[0] = bgrpix[1] = bgrpix[2] = 0;
		fwrite(&bgrpix,1,pitch,F);
	}
	fclose(F);
	return 0;
}


