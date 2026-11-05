#include "movie_graph.h"

#include <stdlib.h>
#include <string.h>

int graph_find_vertex(const MovieGraph *graph, const char *movie_id) {
    if (graph == NULL || movie_id == NULL) return -1;
    for (size_t i = 0; i < graph->vertex_count; i++) {
        if (strcmp(graph->vertices[i].movie.id, movie_id) == 0) return (int)i;
    }
    return -1;
}

int graph_add_vertex(MovieGraph *graph, Movie movie) {
    if (graph == NULL || movie.id[0] == '\0' || graph->vertex_count == GRAPH_CAPACITY) return 0;
    if (graph_find_vertex(graph, movie.id) >= 0) return 0;
    GraphVertex *vertex = &graph->vertices[graph->vertex_count++];
    vertex->movie = movie;
    vertex->neighbors = NULL;
    return 1;
}

int graph_add_edge(MovieGraph *graph, const char *source_id, const char *target_id) {
    int source = graph_find_vertex(graph, source_id);
    int target = graph_find_vertex(graph, target_id);
    if (source < 0 || target < 0 || source == target) return 0;
    for (GraphEdge *edge = graph->vertices[source].neighbors; edge != NULL; edge = edge->next) {
        if (edge->destination == (size_t)target) return 1;
    }
    GraphEdge *forward = malloc(sizeof(*forward));
    GraphEdge *reverse = malloc(sizeof(*reverse));
    if (forward == NULL || reverse == NULL) {
        free(forward);
        free(reverse);
        return 0;
    }
    forward->destination = (size_t)target;
    forward->next = graph->vertices[source].neighbors;
    reverse->destination = (size_t)source;
    reverse->next = graph->vertices[target].neighbors;
    graph->vertices[source].neighbors = forward;
    graph->vertices[target].neighbors = reverse;
    return 1;
}

size_t graph_traverse_bfs(const MovieGraph *graph, const char *start_id, size_t *order) {
    int start = graph_find_vertex(graph, start_id);
    if (start < 0 || order == NULL) return 0;
    size_t queue[GRAPH_CAPACITY], front = 0, rear = 0, count = 0;
    unsigned char visited[GRAPH_CAPACITY] = {0};
    queue[rear++] = (size_t)start;
    visited[start] = 1;
    while (front < rear) {
        size_t current = queue[front++];
        order[count++] = current;
        for (GraphEdge *edge = graph->vertices[current].neighbors; edge != NULL; edge = edge->next) {
            if (!visited[edge->destination]) {
                visited[edge->destination] = 1;
                queue[rear++] = edge->destination;
            }
        }
    }
    return count;
}

size_t graph_traverse_dfs(const MovieGraph *graph, const char *start_id, size_t *order) {
    int start = graph_find_vertex(graph, start_id);
    if (start < 0 || order == NULL) return 0;
    size_t stack[GRAPH_CAPACITY], top = 0, count = 0;
    unsigned char visited[GRAPH_CAPACITY] = {0};
    stack[top++] = (size_t)start;
    visited[start] = 1;
    while (top > 0) {
        size_t current = stack[--top];
        order[count++] = current;
        for (GraphEdge *edge = graph->vertices[current].neighbors; edge != NULL; edge = edge->next) {
            if (!visited[edge->destination]) {
                visited[edge->destination] = 1;
                stack[top++] = edge->destination;
            }
        }
    }
    return count;
}

size_t graph_shortest_path(const MovieGraph *graph, const char *source_id, const char *target_id, size_t *path) {
    int source = graph_find_vertex(graph, source_id);
    int target = graph_find_vertex(graph, target_id);
    if (source < 0 || target < 0 || path == NULL) return 0;
    size_t queue[GRAPH_CAPACITY], front = 0, rear = 0;
    int previous[GRAPH_CAPACITY];
    unsigned char visited[GRAPH_CAPACITY] = {0};
    for (size_t i = 0; i < GRAPH_CAPACITY; i++) previous[i] = -1;
    queue[rear++] = (size_t)source;
    visited[source] = 1;
    while (front < rear && !visited[target]) {
        size_t current = queue[front++];
        for (GraphEdge *edge = graph->vertices[current].neighbors; edge != NULL; edge = edge->next) {
            if (!visited[edge->destination]) {
                visited[edge->destination] = 1;
                previous[edge->destination] = (int)current;
                queue[rear++] = edge->destination;
            }
        }
    }
    if (!visited[target]) return 0;
    size_t reversed[GRAPH_CAPACITY], count = 0;
    for (int current = target; current >= 0; current = previous[current]) {
        reversed[count++] = (size_t)current;
        if (current == source) break;
    }
    if (reversed[count - 1] != (size_t)source) return 0;
    for (size_t i = 0; i < count; i++) path[i] = reversed[count - i - 1];
    return count;
}

void free_movie_graph(MovieGraph *graph) {
    if (graph == NULL) return;
    for (size_t i = 0; i < graph->vertex_count; i++) {
        GraphEdge *edge = graph->vertices[i].neighbors;
        while (edge != NULL) {
            GraphEdge *next = edge->next;
            free(edge);
            edge = next;
        }
    }
    memset(graph, 0, sizeof(*graph));
}
