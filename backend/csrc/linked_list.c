#include "linked_list.h"

#include <stdlib.h>
#include <string.h>

HistoryList create_history_list(void) {
    HistoryList list = {NULL, NULL, 0};
    return list;
}

static HistoryNode *create_node(Movie movie) {
    HistoryNode *node = malloc(sizeof(*node));
    if (node == NULL) return NULL;
    node->movie = movie;
    node->next = NULL;
    return node;
}

int prepend_movie(HistoryList *list, Movie movie) {
    if (list == NULL) return 0;
    HistoryNode *node = create_node(movie);
    if (node == NULL) return 0;
    node->next = list->head;
    list->head = node;
    if (list->tail == NULL) list->tail = node;
    list->size++;
    return 1;
}

int append_movie(HistoryList *list, Movie movie) {
    if (list == NULL) return 0;
    HistoryNode *node = create_node(movie);
    if (node == NULL) return 0;
    if (list->tail == NULL) list->head = node;
    else list->tail->next = node;
    list->tail = node;
    list->size++;
    return 1;
}

int remove_movie(HistoryList *list, const char *movie_id) {
    if (list == NULL || movie_id == NULL) return 0;
    HistoryNode *previous = NULL;
    HistoryNode *node = list->head;
    while (node != NULL) {
        if (strcmp(node->movie.id, movie_id) == 0) {
            if (previous == NULL) list->head = node->next;
            else previous->next = node->next;
            if (list->tail == node) list->tail = previous;
            free(node);
            list->size--;
            return 1;
        }
        previous = node;
        node = node->next;
    }
    return 0;
}

Movie *search_movie(HistoryList *list, const char *movie_id) {
    if (list == NULL || movie_id == NULL) return NULL;
    for (HistoryNode *node = list->head; node != NULL; node = node->next) {
        if (strcmp(node->movie.id, movie_id) == 0) return &node->movie;
    }
    return NULL;
}

void traverse_history(const HistoryList *list, HistoryVisitor visit, void *context) {
    if (list == NULL || visit == NULL) return;
    for (HistoryNode *node = list->head; node != NULL; node = node->next) {
        visit(node, context);
    }
}

void free_history_list(HistoryList *list) {
    if (list == NULL) return;
    HistoryNode *node = list->head;
    while (node != NULL) {
        HistoryNode *next = node->next;
        free(node);
        node = next;
    }
    *list = create_history_list();
}
