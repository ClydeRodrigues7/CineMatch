#ifndef CINEMATCH_LINKED_LIST_H
#define CINEMATCH_LINKED_LIST_H

#include <stddef.h>
#include "movie.h"

typedef struct HistoryNode {
    Movie movie;
    struct HistoryNode *next;
} HistoryNode;

typedef struct {
    HistoryNode *head;
    HistoryNode *tail;
    size_t size;
} HistoryList;

typedef void (*HistoryVisitor)(const HistoryNode *node, void *context);

HistoryList create_history_list(void);
int prepend_movie(HistoryList *list, Movie movie);
int append_movie(HistoryList *list, Movie movie);
int remove_movie(HistoryList *list, const char *movie_id);
Movie *search_movie(HistoryList *list, const char *movie_id);
void traverse_history(const HistoryList *list, HistoryVisitor visit, void *context);
void free_history_list(HistoryList *list);

#endif
