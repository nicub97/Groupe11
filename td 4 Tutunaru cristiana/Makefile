# Variables de compilation
CC = gcc
CFLAGS = -Wall -Wextra -g -O0 -I$(INC_DIR) -I/mingw64/include/SDL2
LDFLAGS = -L/mingw64/lib -lmingw32 -lSDL2main -lSDL2 -lm

# Répertoires
SRC_DIR = src
OBJ_DIR = obj
INC_DIR = include

# Fichiers sources et objets
SRCS = $(wildcard $(SRC_DIR)/*.c)
OBJS = $(patsubst $(SRC_DIR)/%.c, $(OBJ_DIR)/%.o, $(SRCS))
DEPS = $(patsubst $(SRC_DIR)/%.c, $(OBJ_DIR)/%.d, $(SRCS))

# Nom de l'exécutable
TARGET = vacuumrobot

# Règle par défaut
all: $(TARGET)

# Création de l'exécutable
$(TARGET): $(OBJS)
	$(CC) -o $@ $^ $(LDFLAGS)

# Compilation des fichiers .c en .o avec génération des dépendances
$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c | $(OBJ_DIR)
	$(CC) $(CFLAGS) -MMD -MP -c $< -o $@

# Création du dossier obj s'il n'existe pas
$(OBJ_DIR):
	mkdir -p $(OBJ_DIR)

# Inclure les fichiers de dépendances
-include $(DEPS)

# Nettoyage des fichiers objets et de l'exécutable
clean:
	rm -rf $(OBJ_DIR) $(TARGET) $(TARGET).exe

# Exécution du programme
run: $(TARGET)
	./$(TARGET)

# Règle pour recompiler complètement
rebuild: clean all

.PHONY: all clean run rebuild