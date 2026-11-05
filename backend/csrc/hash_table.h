#ifndef CINEMATCH_HASH_TABLE_H
#define CINEMATCH_HASH_TABLE_H

#include <stddef.h>
#include "movie.h"

#define HASH_BUCKETS 8

typedef struct HashNode {
    Movie movie;
    struct HashNode *next;
} HashNode;

typedef struct {
    HashNode *buckets[HASH_BUCKETS];
    size_t size;
    size_t collisions;
} MovieHash;

typedef void (*HashVisitor)(size_t bucket, const Movie *movie, void *context);

size_t hash_movie_id(const char *movie_id);
int hash_insert(MovieHash *table, Movie movie);
Movie *hash_search(MovieHash *table, const char *movie_id);
int hash_delete(MovieHash *table, const char *movie_id);
void hash_display(const MovieHash *table, HashVisitor visit, void *context);
void free_hash_table(MovieHash *table);

#endif
