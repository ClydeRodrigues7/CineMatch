#ifndef CINEMATCH_GENRE_TREE_H
#define CINEMATCH_GENRE_TREE_H

#include <stddef.h>

typedef struct GenreNode {
    char *name;
    struct GenreNode **children;
    size_t child_count;
    size_t child_capacity;
} GenreNode;

typedef void (*GenreVisitor)(const GenreNode *node, void *context);

GenreNode *create_genre_node(const char *name);
int add_genre_child(GenreNode *parent, const char *name);
GenreNode *find_genre(GenreNode *root, const char *name);
void traverse_genre_dfs(const GenreNode *root, GenreVisitor visit, void *context);
int traverse_genre_bfs(const GenreNode *root, GenreVisitor visit, void *context);
void free_genre_tree(GenreNode *root);

#endif
