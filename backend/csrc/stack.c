#include "stack.h"

#include <stdlib.h>

int stack_push(ActionStack *stack, WatchlistActionType type, Movie movie, size_t index) {
    if (stack == NULL) return 0;
    ActionNode *node = malloc(sizeof(*node));
    if (node == NULL) return 0;
    node->type = type;
    node->movie = movie;
    node->index = index;
    node->next = stack->top;
    stack->top = node;
    stack->size++;
    return 1;
}

int stack_pop(ActionStack *stack, ActionNode *action) {
    if (stack == NULL || stack->top == NULL) return 0;
    ActionNode *node = stack->top;
    stack->top = node->next;
    stack->size--;
    if (action != NULL) {
        *action = *node;
        action->next = NULL;
    }
    free(node);
    return 1;
}

const ActionNode *stack_peek(const ActionStack *stack) {
    return stack == NULL ? NULL : stack->top;
}

int stack_is_empty(const ActionStack *stack) {
    return stack == NULL || stack->top == NULL;
}

void free_stack(ActionStack *stack) {
    if (stack == NULL) return;
    while (stack->top != NULL) {
        ActionNode *next = stack->top->next;
        free(stack->top);
        stack->top = next;
    }
    stack->size = 0;
}
