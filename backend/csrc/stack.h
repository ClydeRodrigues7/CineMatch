#ifndef CINEMATCH_STACK_H
#define CINEMATCH_STACK_H

#include <stddef.h>
#include "movie.h"

typedef enum {
    ADD_TO_WATCHLIST = 1,
    REMOVE_FROM_WATCHLIST = 2
} WatchlistActionType;

typedef struct ActionNode {
    WatchlistActionType type;
    Movie movie;
    size_t index;
    struct ActionNode *next;
} ActionNode;

typedef struct {
    ActionNode *top;
    size_t size;
} ActionStack;

int stack_push(ActionStack *stack, WatchlistActionType type, Movie movie, size_t index);
int stack_pop(ActionStack *stack, ActionNode *action);
const ActionNode *stack_peek(const ActionStack *stack);
int stack_is_empty(const ActionStack *stack);
void free_stack(ActionStack *stack);

#endif
