#ifndef CINEMATCH_QUEUE_H
#define CINEMATCH_QUEUE_H

#include <stddef.h>
#include "movie.h"

typedef struct QueueNode {
    Movie movie;
    struct QueueNode *next;
} QueueNode;

typedef struct {
    QueueNode *front;
    QueueNode *rear;
    size_t size;
} MovieQueue;

int enqueue_movie(MovieQueue *queue, Movie movie);
int dequeue_movie(MovieQueue *queue, Movie *movie);
const Movie *peek_next_movie(const MovieQueue *queue);
int queue_is_empty(const MovieQueue *queue);
void free_queue(MovieQueue *queue);

#endif
