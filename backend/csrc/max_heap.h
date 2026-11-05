#ifndef CINEMATCH_MAX_HEAP_H
#define CINEMATCH_MAX_HEAP_H

#include <stddef.h>
#include "movie.h"

#define HEAP_CAPACITY 64
#define HEAP_TRACE_CAPACITY 8

typedef struct {
    Movie items[HEAP_CAPACITY];
    size_t size;
} MaxHeap;

typedef struct {
    char phase[24];
    size_t index;
    size_t other_index;
    Movie items[HEAP_CAPACITY];
    size_t size;
} HeapTraceStep;

typedef struct {
    HeapTraceStep steps[HEAP_TRACE_CAPACITY];
    size_t count;
} HeapTrace;

int heap_insert(MaxHeap *heap, Movie movie);
int heap_insert_with_trace(MaxHeap *heap, Movie movie, HeapTrace *trace);
int heap_extract_max(MaxHeap *heap, Movie *movie);
int heap_extract_max_with_trace(MaxHeap *heap, Movie *movie, HeapTrace *trace);
const Movie *heap_peek_max(const MaxHeap *heap);
void heap_sift_up(MaxHeap *heap, size_t index);
void heap_sift_down(MaxHeap *heap, size_t index);
void free_heap(MaxHeap *heap);

#endif
