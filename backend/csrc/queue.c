#include "queue.h"

#include <stdlib.h>

int enqueue_movie(MovieQueue *queue, Movie movie) {
    if (queue == NULL) return 0;
    QueueNode *node = malloc(sizeof(*node));
    if (node == NULL) return 0;
    node->movie = movie;
    node->next = NULL;
    if (queue->rear == NULL) queue->front = node;
    else queue->rear->next = node;
    queue->rear = node;
    queue->size++;
    return 1;
}

int dequeue_movie(MovieQueue *queue, Movie *movie) {
    if (queue == NULL || queue->front == NULL) return 0;
    QueueNode *node = queue->front;
    if (movie != NULL) *movie = node->movie;
    queue->front = node->next;
    if (queue->front == NULL) queue->rear = NULL;
    queue->size--;
    free(node);
    return 1;
}

const Movie *peek_next_movie(const MovieQueue *queue) {
    return queue == NULL || queue->front == NULL ? NULL : &queue->front->movie;
}

int queue_is_empty(const MovieQueue *queue) {
    return queue == NULL || queue->front == NULL;
}

void free_queue(MovieQueue *queue) {
    if (queue == NULL) return;
    while (queue->front != NULL) {
        QueueNode *next = queue->front->next;
        free(queue->front);
        queue->front = next;
    }
    queue->rear = NULL;
    queue->size = 0;
}
