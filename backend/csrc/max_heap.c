#include "max_heap.h"

#include <stdio.h>
#include <string.h>

static void swap_movies(Movie *left, Movie *right) {
    Movie temporary = *left;
    *left = *right;
    *right = temporary;
}

static void record_trace(MaxHeap *heap, HeapTrace *trace, const char *phase,
                         size_t index, size_t other_index) {
    if (heap == NULL || trace == NULL || trace->count == HEAP_TRACE_CAPACITY) return;
    HeapTraceStep *step = &trace->steps[trace->count++];
    snprintf(step->phase, sizeof(step->phase), "%s", phase);
    step->index = index;
    step->other_index = other_index;
    step->size = heap->size;
    memcpy(step->items, heap->items, heap->size * sizeof(*heap->items));
}

static void sift_up(MaxHeap *heap, size_t index, HeapTrace *trace) {
    while (heap != NULL && index > 0) {
        size_t parent = (index - 1) / 2;
        if (heap->items[parent].priority >= heap->items[index].priority) break;
        swap_movies(&heap->items[parent], &heap->items[index]);
        record_trace(heap, trace, "sift-up", parent, index);
        index = parent;
    }
}

static void sift_down(MaxHeap *heap, size_t index, HeapTrace *trace) {
    if (heap == NULL) return;
    for (;;) {
        size_t left = index * 2 + 1;
        size_t right = left + 1;
        size_t largest = index;
        if (left < heap->size && heap->items[left].priority > heap->items[largest].priority) largest = left;
        if (right < heap->size && heap->items[right].priority > heap->items[largest].priority) largest = right;
        if (largest == index) return;
        swap_movies(&heap->items[index], &heap->items[largest]);
        record_trace(heap, trace, "sift-down", index, largest);
        index = largest;
    }
}

void heap_sift_up(MaxHeap *heap, size_t index) {
    sift_up(heap, index, NULL);
}

void heap_sift_down(MaxHeap *heap, size_t index) {
    sift_down(heap, index, NULL);
}

int heap_insert(MaxHeap *heap, Movie movie) {
    return heap_insert_with_trace(heap, movie, NULL);
}

int heap_insert_with_trace(MaxHeap *heap, Movie movie, HeapTrace *trace) {
    if (heap == NULL || heap->size == HEAP_CAPACITY) return 0;
    size_t index = heap->size++;
    heap->items[index] = movie;
    record_trace(heap, trace, "insert", index, index);
    sift_up(heap, index, trace);
    return 1;
}

int heap_extract_max(MaxHeap *heap, Movie *movie) {
    return heap_extract_max_with_trace(heap, movie, NULL);
}

int heap_extract_max_with_trace(MaxHeap *heap, Movie *movie, HeapTrace *trace) {
    if (heap == NULL || heap->size == 0) return 0;
    if (movie != NULL) *movie = heap->items[0];
    heap->size--;
    if (heap->size > 0) {
        heap->items[0] = heap->items[heap->size];
        record_trace(heap, trace, "replace-root", 0, heap->size);
        sift_down(heap, 0, trace);
    } else {
        record_trace(heap, trace, "extract", 0, 0);
    }
    return 1;
}

const Movie *heap_peek_max(const MaxHeap *heap) {
    return heap == NULL || heap->size == 0 ? NULL : &heap->items[0];
}

void free_heap(MaxHeap *heap) {
    if (heap != NULL) memset(heap, 0, sizeof(*heap));
}
