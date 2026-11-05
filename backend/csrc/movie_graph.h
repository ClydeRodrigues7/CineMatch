#ifndef CINEMATCH_MOVIE_GRAPH_H
#define CINEMATCH_MOVIE_GRAPH_H

#include <stddef.h>
#include "movie.h"

#define GRAPH_CAPACITY 12

typedef struct GraphEdge {
    size_t destination;
    struct GraphEdge *next;
} GraphEdge;

typedef struct {
    Movie movie;
    GraphEdge *neighbors;
} GraphVertex;

typedef struct {
    GraphVertex vertices[GRAPH_CAPACITY];
    size_t vertex_count;
} MovieGraph;

int graph_add_vertex(MovieGraph *graph, Movie movie);
int graph_add_edge(MovieGraph *graph, const char *source_id, const char *target_id);
int graph_find_vertex(const MovieGraph *graph, const char *movie_id);
size_t graph_traverse_bfs(const MovieGraph *graph, const char *start_id, size_t *order);
size_t graph_traverse_dfs(const MovieGraph *graph, const char *start_id, size_t *order);
size_t graph_shortest_path(const MovieGraph *graph, const char *source_id, const char *target_id, size_t *path);
void free_movie_graph(MovieGraph *graph);

#endif
