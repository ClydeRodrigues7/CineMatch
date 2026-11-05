#include "hash_table.h"

#include <stdlib.h>
#include <string.h>

size_t hash_movie_id(const char *movie_id) {
    unsigned long hash = 2166136261u;
    if (movie_id != NULL) {
        for (const unsigned char *character = (const unsigned char *)movie_id; *character; character++) {
            hash ^= *character;
            hash *= 16777619u;
        }
    }
    return (size_t)(hash % HASH_BUCKETS);
}

int hash_insert(MovieHash *table, Movie movie) {
    if (table == NULL || movie.id[0] == '\0') return 0;
    size_t bucket = hash_movie_id(movie.id);
    for (HashNode *node = table->buckets[bucket]; node != NULL; node = node->next) {
        if (strcmp(node->movie.id, movie.id) == 0) {
            node->movie = movie;
            return 1;
        }
    }
    HashNode *node = malloc(sizeof(*node));
    if (node == NULL) return 0;
    node->movie = movie;
    node->next = table->buckets[bucket];
    if (node->next != NULL) table->collisions++;
    table->buckets[bucket] = node;
    table->size++;
    return 1;
}

Movie *hash_search(MovieHash *table, const char *movie_id) {
    if (table == NULL || movie_id == NULL) return NULL;
    for (HashNode *node = table->buckets[hash_movie_id(movie_id)]; node != NULL; node = node->next) {
        if (strcmp(node->movie.id, movie_id) == 0) return &node->movie;
    }
    return NULL;
}

int hash_delete(MovieHash *table, const char *movie_id) {
    if (table == NULL || movie_id == NULL) return 0;
    size_t bucket = hash_movie_id(movie_id);
    HashNode *previous = NULL;
    HashNode *node = table->buckets[bucket];
    while (node != NULL) {
        if (strcmp(node->movie.id, movie_id) == 0) {
            if (node->next != NULL || previous != NULL) table->collisions--;
            if (previous == NULL) table->buckets[bucket] = node->next;
            else previous->next = node->next;
            free(node);
            table->size--;
            return 1;
        }
        previous = node;
        node = node->next;
    }
    return 0;
}

void hash_display(const MovieHash *table, HashVisitor visit, void *context) {
    if (table == NULL || visit == NULL) return;
    for (size_t bucket = 0; bucket < HASH_BUCKETS; bucket++) {
        for (HashNode *node = table->buckets[bucket]; node != NULL; node = node->next) {
            visit(bucket, &node->movie, context);
        }
    }
}

void free_hash_table(MovieHash *table) {
    if (table == NULL) return;
    for (size_t bucket = 0; bucket < HASH_BUCKETS; bucket++) {
        HashNode *node = table->buckets[bucket];
        while (node != NULL) {
            HashNode *next = node->next;
            free(node);
            node = next;
        }
    }
    memset(table, 0, sizeof(*table));
}
