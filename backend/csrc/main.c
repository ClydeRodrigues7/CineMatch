#include "genre_tree.h"
#include "hash_table.h"
#include "linked_list.h"
#include "max_heap.h"
#include "movie_graph.h"
#include "queue.h"
#include "stack.h"

#include <ctype.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define OUTPUT_SIZE (1024 * 1024)
static HistoryList history;
static GenreNode *genre_root;
static ActionStack undo_stack;
static Movie *watchlist;
static size_t watchlist_size;
static size_t watchlist_capacity;
static MovieQueue watch_next;
static MaxHeap heap;
static MovieHash hash_table;
static MovieGraph graph;
static char output[OUTPUT_SIZE];
static size_t outpos;

static const char *seed_ids[] = {
    "demo-1", "demo-2", "demo-3", "demo-4", "demo-5", "demo-6",
    "demo-7", "demo-8", "demo-9", "demo-10", "demo-11", "demo-12"
};
static const char *seed_titles[] = {
    "The Flash", "Dungeons & Dragons: Honor Among Thieves",
    "Batman v Superman: Dawn of Justice", "Spider-Man: Across the Spider-Verse",
    "Top Gun: Maverick", "Oppenheimer", "Inception", "Interstellar",
    "The Dark Knight", "Everything Everywhere All at Once", "Parasite",
    "The Super Mario Bros. Movie"
};
static const double seed_scores[] = {6.8, 7.4, 6.0, 8.4, 8.2, 8.1, 8.4, 8.4, 8.5, 7.7, 8.5, 7.6};

static void copy_text(char *destination, size_t capacity, const char *source) {
    if (capacity > 0) snprintf(destination, capacity, "%s", source == NULL ? "" : source);
}

static Movie make_movie(const char *id, const char *title, double priority) {
    Movie movie;
    copy_text(movie.id, sizeof(movie.id), id);
    copy_text(movie.title, sizeof(movie.title), title);
    movie.priority = priority;
    return movie;
}

static Movie find_seed(const char *id, const char *title, double priority) {
    for (size_t i = 0; i < sizeof(seed_ids) / sizeof(seed_ids[0]); i++) {
        if (strcmp(id, seed_ids[i]) == 0) {
            return make_movie(id, seed_titles[i], priority > 0 ? priority : seed_scores[i]);
        }
    }
    return make_movie(id, title, priority);
}

static void out_raw(const char *text) {
    size_t length = strlen(text);
    if (length >= sizeof(output) - outpos) return;
    memcpy(output + outpos, text, length);
    outpos += length;
    output[outpos] = '\0';
}

static void out_json(const char *text) {
    out_raw("\"");
    for (const unsigned char *character = (const unsigned char *)(text == NULL ? "" : text);
         *character != '\0'; character++) {
        char escaped[8];
        if (*character == '"' || *character == '\\') {
            escaped[0] = '\\';
            escaped[1] = (char)*character;
            escaped[2] = '\0';
            out_raw(escaped);
        } else if (*character < 0x20) {
            snprintf(escaped, sizeof(escaped), "\\u%04x", *character);
            out_raw(escaped);
        } else {
            escaped[0] = (char)*character;
            escaped[1] = '\0';
            out_raw(escaped);
        }
    }
    out_raw("\"");
}

static void out_movie(const Movie *movie) {
    out_raw("{\"id\":");
    out_json(movie->id);
    out_raw(",\"title\":");
    out_json(movie->title);
    char priority[64];
    snprintf(priority, sizeof(priority), ",\"priority\":%.2f}", movie->priority);
    out_raw(priority);
}

static void out_movie_array(const Movie *movies, size_t count) {
    out_raw("[");
    for (size_t i = 0; i < count; i++) {
        if (i > 0) out_raw(",");
        out_movie(&movies[i]);
    }
    out_raw("]");
}

static void response(const char *message, const char *state) {
    outpos = 0;
    output[0] = '\0';
    out_raw("{\"ok\":true,\"message\":");
    out_json(message);
    out_raw(",\"state\":");
    out_raw(state == NULL ? "null" : state);
    out_raw("}");
    puts(output);
}

static void error_response(const char *message) {
    outpos = 0;
    output[0] = '\0';
    out_raw("{\"ok\":false,\"message\":");
    out_json(message);
    out_raw("}");
    puts(output);
}

static int watchlist_index(const char *id) {
    for (size_t i = 0; i < watchlist_size; i++) {
        if (strcmp(watchlist[i].id, id) == 0) return (int)i;
    }
    return -1;
}

static int watchlist_insert(Movie movie, size_t index);

static int watchlist_add(Movie movie) {
    return watchlist_insert(movie, watchlist_size);
}

static int watchlist_insert(Movie movie, size_t index) {
    if (watchlist_index(movie.id) >= 0) return 0;
    if (watchlist_size == watchlist_capacity) {
        size_t capacity = watchlist_capacity == 0 ? 8 : watchlist_capacity * 2;
        if (capacity > (size_t)-1 / sizeof(*watchlist)) return 0;
        Movie *movies = realloc(watchlist, capacity * sizeof(*movies));
        if (movies == NULL) return 0;
        watchlist = movies;
        watchlist_capacity = capacity;
    }
    if (index > watchlist_size) index = watchlist_size;
    for (size_t i = watchlist_size; i > index; i--) watchlist[i] = watchlist[i - 1];
    watchlist[index] = movie;
    watchlist_size++;
    return 1;
}

static void watchlist_remove(const char *id) {
    int index = watchlist_index(id);
    if (index < 0) return;
    for (size_t i = (size_t)index + 1; i < watchlist_size; i++) watchlist[i - 1] = watchlist[i];
    watchlist_size--;
}

static void free_state(void) {
    free_history_list(&history);
    free_stack(&undo_stack);
    free_queue(&watch_next);
    free_hash_table(&hash_table);
    free_genre_tree(genre_root);
    genre_root = NULL;
    genre_root = NULL;
    free_heap(&heap);
    free_movie_graph(&graph);
    free(watchlist);
    watchlist = NULL;
    watchlist_size = 0;
    watchlist_capacity = 0;
}

static int reset_state(void) {
    free_state();
    for (size_t i = 0; i < 6; i++) {
        if (!append_movie(&history, make_movie(seed_ids[i], seed_titles[i], 0))) goto failure;
    }
    genre_root = create_genre_node("Movies");
    if (genre_root == NULL ||
        !add_genre_child(genre_root, "Thriller") ||
        !add_genre_child(genre_root, "Science Fiction") ||
        !add_genre_child(genre_root, "Comedy")) goto failure;
    GenreNode *thriller = find_genre(genre_root, "Thriller");
    GenreNode *science_fiction = find_genre(genre_root, "Science Fiction");
    GenreNode *comedy = find_genre(genre_root, "Comedy");
    if (!add_genre_child(thriller, "Psychological Thriller") ||
        !add_genre_child(thriller, "Crime Thriller") ||
        !add_genre_child(science_fiction, "Space") ||
        !add_genre_child(science_fiction, "Time Travel") ||
        !add_genre_child(comedy, "Romantic Comedy") ||
        !add_genre_child(comedy, "Satire")) goto failure;

    if (!watchlist_add(make_movie(seed_ids[0], seed_titles[0], seed_scores[0])) ||
        !watchlist_add(make_movie(seed_ids[3], seed_titles[3], seed_scores[3])) ||
        !watchlist_add(make_movie(seed_ids[4], seed_titles[4], seed_scores[4])) ||
        !enqueue_movie(&watch_next, make_movie(seed_ids[1], seed_titles[1], seed_scores[1])) ||
        !enqueue_movie(&watch_next, make_movie(seed_ids[9], seed_titles[9], seed_scores[9])) ||
        !enqueue_movie(&watch_next, make_movie(seed_ids[4], seed_titles[4], seed_scores[4]))) goto failure;

    for (size_t i = 0; i < 10; i++) {
        Movie movie = make_movie(seed_ids[i], seed_titles[i], seed_scores[i]);
        if (!heap_insert(&heap, movie) || !hash_insert(&hash_table, movie) ||
            !graph_add_vertex(&graph, movie)) goto failure;
    }
    const char *edges[][2] = {
        {"demo-7", "demo-8"}, {"demo-7", "demo-6"}, {"demo-7", "demo-9"},
        {"demo-8", "demo-6"}, {"demo-1", "demo-3"}, {"demo-1", "demo-9"},
        {"demo-3", "demo-9"}, {"demo-4", "demo-10"}, {"demo-4", "demo-6"},
        {"demo-2", "demo-5"}, {"demo-5", "demo-6"}
    };
    for (size_t i = 0; i < sizeof(edges) / sizeof(edges[0]); i++) {
        if (!graph_add_edge(&graph, edges[i][0], edges[i][1])) goto failure;
    }
    return 1;

failure:
    free_state();
    return 0;
}

static void clear_synced_movies(void) {
    free_history_list(&history);
    free_stack(&undo_stack);
    free_queue(&watch_next);
    free_hash_table(&hash_table);
    free_heap(&heap);
    free_movie_graph(&graph);
    free(watchlist);
    watchlist = NULL;
    watchlist_size = 0;
    watchlist_capacity = 0;
}

static int finish_sync(void) {
    const char *edges[][2] = {
        {"demo-7", "demo-8"}, {"demo-7", "demo-6"}, {"demo-7", "demo-9"},
        {"demo-8", "demo-6"}, {"demo-1", "demo-3"}, {"demo-1", "demo-9"},
        {"demo-3", "demo-9"}, {"demo-4", "demo-10"}, {"demo-4", "demo-6"},
        {"demo-2", "demo-5"}, {"demo-5", "demo-6"}
    };
    for (size_t i = 0; i < sizeof(edges) / sizeof(edges[0]); i++) {
        if (graph_find_vertex(&graph, edges[i][0]) >= 0 &&
            graph_find_vertex(&graph, edges[i][1]) >= 0 &&
            !graph_add_edge(&graph, edges[i][0], edges[i][1])) return 0;
    }
    return 1;
}

typedef struct {
    int first;
} JsonListContext;

static void emit_history_movie(const HistoryNode *node, void *context) {
    JsonListContext *state = context;
    if (!state->first) out_raw(",");
    state->first = 0;
    out_raw("{\"id\":");
    out_json(node->movie.id);
    out_raw(",\"title\":");
    out_json(node->movie.title);
    char priority[64];
    snprintf(priority, sizeof(priority), ",\"priority\":%.2f,\"next\":", node->movie.priority);
    out_raw(priority);
    if (node->next == NULL) out_raw("null");
    else out_json(node->next->movie.id);
    out_raw("}");
}

static void emit_history(void) {
    out_raw("{\"head\":");
    out_json(history.head == NULL ? "" : history.head->movie.id);
    out_raw(",\"tail\":");
    out_json(history.tail == NULL ? "" : history.tail->movie.id);
    out_raw(",\"nodes\":[");
    JsonListContext context = {1};
    traverse_history(&history, emit_history_movie, &context);
    out_raw("]}");
}

static void emit_genre_tree(const GenreNode *node) {
    if (node == NULL) {
        out_raw("null");
        return;
    }
    out_raw("{\"name\":");
    out_json(node->name);
    out_raw(",\"children\":[");
    for (size_t i = 0; i < node->child_count; i++) {
        if (i > 0) out_raw(",");
        emit_genre_tree(node->children[i]);
    }
    out_raw("]}");
}

static void emit_genre_name(const GenreNode *node, void *context) {
    JsonListContext *state = context;
    if (!state->first) out_raw(",");
    state->first = 0;
    out_json(node->name);
}

static void emit_stack(void) {
    out_raw("{\"watchlist\":");
    out_movie_array(watchlist, watchlist_size);
    out_raw(",\"topFirst\":[");
    int first = 1;
    for (ActionNode *node = undo_stack.top; node != NULL; node = node->next) {
        if (!first) out_raw(",");
        first = 0;
        out_raw("{\"action\":");
        out_json(node->type == ADD_TO_WATCHLIST ? "ADD_TO_WATCHLIST" : "REMOVE_FROM_WATCHLIST");
        char position[40];
        snprintf(position, sizeof(position), ",\"index\":%lu", (unsigned long)node->index);
        out_raw(position);
        out_raw(",\"movie\":");
        out_movie(&node->movie);
        out_raw("}");
    }
    out_raw("]}");
}

static void emit_queue(void) {
    out_raw("{\"front\":");
    out_json(watch_next.front == NULL ? "" : watch_next.front->movie.id);
    out_raw(",\"rear\":");
    out_json(watch_next.rear == NULL ? "" : watch_next.rear->movie.id);
    out_raw(",\"items\":[");
    int first = 1;
    for (QueueNode *node = watch_next.front; node != NULL; node = node->next) {
        if (!first) out_raw(",");
        first = 0;
        out_movie(&node->movie);
    }
    out_raw("]}");
}

static void emit_heap_tree(size_t index);

static void emit_heap(void) {
    out_raw("{\"array\":");
    out_movie_array(heap.items, heap.size);
    out_raw(",\"max\":");
    if (heap.size == 0) out_raw("null");
    else out_movie(&heap.items[0]);
    out_raw(",\"tree\":");
    emit_heap_tree(0);
    out_raw("}");
}

static void emit_heap_tree(size_t index) {
    if (index >= heap.size) {
        out_raw("null");
        return;
    }
    char node_index[48];
    snprintf(node_index, sizeof(node_index), "{\"index\":%lu,\"movie\":", (unsigned long)index);
    out_raw(node_index);
    out_movie(&heap.items[index]);
    out_raw(",\"left\":");
    emit_heap_tree(index * 2 + 1);
    out_raw(",\"right\":");
    emit_heap_tree(index * 2 + 2);
    out_raw("}");
}

static void emit_heap_trace(const HeapTrace *trace) {
    out_raw("[");
    for (size_t i = 0; i < trace->count; i++) {
        const HeapTraceStep *step = &trace->steps[i];
        if (i > 0) out_raw(",");
        char indices[128];
        snprintf(indices, sizeof(indices), "{\"phase\":\"%s\",\"index\":%lu,\"otherIndex\":%lu,\"array\":",
                 step->phase, (unsigned long)step->index, (unsigned long)step->other_index);
        out_raw(indices);
        out_movie_array(step->items, step->size);
        out_raw("}");
    }
    out_raw("]");
}

static void emit_hash(void) {
    char counts[96];
    snprintf(counts, sizeof(counts), "{\"bucketCount\":%d,\"size\":%lu,\"collisions\":%lu,\"buckets\":[",
             HASH_BUCKETS, (unsigned long)hash_table.size, (unsigned long)hash_table.collisions);
    out_raw(counts);
    for (size_t bucket = 0; bucket < HASH_BUCKETS; bucket++) {
        if (bucket > 0) out_raw(",");
        out_raw("[");
        int first = 1;
        for (HashNode *node = hash_table.buckets[bucket]; node != NULL; node = node->next) {
            if (!first) out_raw(",");
            first = 0;
            out_movie(&node->movie);
        }
        out_raw("]");
    }
    out_raw("]}");
}

static void emit_graph(const size_t *traversal, size_t traversal_count,
                       const size_t *path, size_t path_count) {
    out_raw("{\"vertices\":");
    out_raw("[");
    for (size_t i = 0; i < graph.vertex_count; i++) {
        if (i > 0) out_raw(",");
        out_movie(&graph.vertices[i].movie);
    }
    out_raw("],\"edges\":[");
    int first = 1;
    for (size_t i = 0; i < graph.vertex_count; i++) {
        for (GraphEdge *edge = graph.vertices[i].neighbors; edge != NULL; edge = edge->next) {
            if (i >= edge->destination) continue;
            if (!first) out_raw(",");
            first = 0;
            out_raw("[");
            out_json(graph.vertices[i].movie.id);
            out_raw(",");
            out_json(graph.vertices[edge->destination].movie.id);
            out_raw("]");
        }
    }
    out_raw("],\"traversal\":[");
    for (size_t i = 0; i < traversal_count; i++) {
        if (i > 0) out_raw(",");
        out_movie(&graph.vertices[traversal[i]].movie);
    }
    out_raw("],\"path\":[");
    for (size_t i = 0; i < path_count; i++) {
        if (i > 0) out_raw(",");
        out_json(graph.vertices[path[i]].movie.id);
    }
    out_raw("]}");
}

static char *decode64(const char *encoded) {
    if (encoded == NULL) return NULL;
    size_t length = strlen(encoded);
    char *decoded = calloc(length + 1, 1);
    if (decoded == NULL) return NULL;
    size_t written = 0;
    unsigned value = 0, bits = 0;
    for (size_t i = 0; i < length; i++) {
        unsigned char character = (unsigned char)encoded[i];
        int digit = character >= 'A' && character <= 'Z' ? character - 'A' :
                    character >= 'a' && character <= 'z' ? character - 'a' + 26 :
                    character >= '0' && character <= '9' ? character - '0' + 52 :
                    character == '+' ? 62 : character == '/' ? 63 : -1;
        if (digit < 0) continue;
        value = (value << 6) | (unsigned)digit;
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            decoded[written++] = (char)((value >> bits) & 0xff);
        }
    }
    decoded[written] = '\0';
    return decoded;
}

static char *next_token(void) {
    return strtok(NULL, "\t\r\n");
}

static void handle(char *line) {
    char *structure = strtok(line, "\t\r\n");
    char *action = next_token();
    char *encoded_id = next_token();
    char *encoded_title = next_token();
    char *encoded_score = next_token();
    (void)next_token();
    if (structure == NULL) return;
    if (strcmp(structure, "RESET") == 0) {
        if (reset_state()) response("C structures reset to the demo baseline.", "null");
        else error_response("Could not allocate memory while resetting the C structures.");
        return;
    }
    if (strcmp(structure, "STATUS") == 0) {
        response("C backend ready; all seven structures are initialized.",
                 "{\"ready\":true,\"language\":\"C\",\"structures\":7}");
        return;
    }

    char *id = decode64(encoded_id);
    char *title = decode64(encoded_title);
    char *score_text = decode64(encoded_score);
    if ((encoded_id != NULL && id == NULL) || (encoded_title != NULL && title == NULL) ||
        (encoded_score != NULL && score_text == NULL)) {
        free(id);
        free(title);
        free(score_text);
        error_response("Could not allocate memory while decoding the operation.");
        return;
    }
    const char *movie_id = id == NULL ? "" : id;
    const char *movie_title = title == NULL ? "" : title;
    const char *operation = action == NULL ? "" : action;
    char message[512];
    int ok = 1;

    if (strcmp(structure, "LIST") == 0) {
        Movie movie = find_seed(movie_id, movie_title, 0);
        int found = 0;
        if (strcmp(operation, "PREPEND") == 0) {
            ok = prepend_movie(&history, movie);
            snprintf(message, sizeof(message), "Prepended %s at HEAD in O(1).", movie.title);
        } else if (strcmp(operation, "APPEND") == 0) {
            ok = append_movie(&history, movie);
            snprintf(message, sizeof(message), "Appended %s at TAIL in O(1) using the tail pointer.", movie.title);
        } else if (strcmp(operation, "REMOVE") == 0) {
            found = remove_movie(&history, movie_id);
            snprintf(message, sizeof(message), found ? "Removed %s from the history list in O(n)." :
                     "Movie was not in the history list: %s.", movie_id);
        } else if (strcmp(operation, "SEARCH") == 0) {
            Movie *match = search_movie(&history, movie_id);
            found = match != NULL;
            snprintf(message, sizeof(message), found ? "Found %s in O(n)." :
                     "Movie was not found after an O(n) search: %s.", found ? match->title : movie_id);
        } else if (strcmp(operation, "TRAVERSE") == 0) {
            snprintf(message, sizeof(message), "History traversed from HEAD to TAIL (%lu nodes).",
                     (unsigned long)history.size);
        } else {
            ok = 0;
            copy_text(message, sizeof(message), "Unsupported linked-list operation.");
        }
        outpos = 0;
        output[0] = '\0';
        out_raw("{\"ok\":");
        out_raw(ok ? "true" : "false");
        out_raw(",\"message\":");
        out_json(message);
        out_raw(",\"found\":");
        out_raw(found ? "true" : "false");
        out_raw(",\"state\":");
        emit_history();
        out_raw("}");
        puts(output);
    } else if (strcmp(structure, "TREE") == 0) {
        int found = 0;
        GenreNode *subtree = NULL;
        if (strcmp(operation, "ADD") == 0) {
            GenreNode *parent = find_genre(genre_root, movie_id);
            found = parent != NULL && add_genre_child(parent, movie_title);
            snprintf(message, sizeof(message), found ? "Added child category under %s." :
                     "Parent missing, duplicate child, or memory allocation failed: %s.", movie_id);
            ok = found;
        } else if (strcmp(operation, "FIND") == 0) {
            subtree = find_genre(genre_root, movie_id);
            found = subtree != NULL;
            snprintf(message, sizeof(message), found ? "Found category %s." : "Category not found: %s.", movie_id);
        } else if (strcmp(operation, "DFS") == 0) {
            copy_text(message, sizeof(message), "Depth-first traversal is root-first recursive order.");
        } else if (strcmp(operation, "BFS") == 0) {
            copy_text(message, sizeof(message), "Breadth-first traversal visits each level using a queue.");
        } else {
            ok = 0;
            copy_text(message, sizeof(message), "Unsupported genre-tree operation.");
        }
        outpos = 0;
        output[0] = '\0';
        out_raw("{\"ok\":");
        out_raw(ok ? "true" : "false");
        out_raw(",\"message\":");
        out_json(message);
        if (strcmp(operation, "FIND") == 0) {
            out_raw(",\"found\":");
            out_raw(found ? "true" : "false");
            if (subtree != NULL) {
                out_raw(",\"subtree\":");
                emit_genre_tree(subtree);
            }
        }
        out_raw(",\"traversal\":[");
        JsonListContext context = {1};
        if (strcmp(operation, "DFS") == 0) traverse_genre_dfs(genre_root, emit_genre_name, &context);
        else if (strcmp(operation, "BFS") == 0) {
            ok = traverse_genre_bfs(genre_root, emit_genre_name, &context);
            if (!ok) {
                outpos = 0;
                output[0] = '\0';
                error_response("Could not allocate the BFS traversal queue.");
                free(id);
                free(title);
                free(score_text);
                return;
            }
        } else if (strcmp(operation, "FIND") == 0 && subtree != NULL) {
            traverse_genre_dfs(subtree, emit_genre_name, &context);
        }
        out_raw("],\"state\":");
        emit_genre_tree(genre_root);
        out_raw("}");
        puts(output);
    } else if (strcmp(structure, "STACK") == 0) {
        if (strcmp(operation, "ADD") == 0) {
            Movie movie = find_seed(movie_id, movie_title, 0);
            if (watchlist_index(movie.id) >= 0) {
                ok = 0;
                copy_text(message, sizeof(message), "Movie is already in the watchlist.");
            } else if (!stack_push(&undo_stack, ADD_TO_WATCHLIST, movie, watchlist_size)) {
                ok = 0;
                copy_text(message, sizeof(message), "Could not allocate an undo action.");
            } else if (!watchlist_add(movie)) {
                ActionNode ignored;
                stack_pop(&undo_stack, &ignored);
                ok = 0;
                copy_text(message, sizeof(message), "Watchlist is full or could not allocate memory.");
            } else {
                snprintf(message, sizeof(message), "ADD_TO_WATCHLIST pushed; %s was added.", movie.title);
            }
        } else if (strcmp(operation, "REMOVE") == 0) {
            int index = watchlist_index(movie_id);
            if (index < 0) {
                ok = 0;
                snprintf(message, sizeof(message), "Movie is not in the watchlist: %s.", movie_id);
            } else {
                Movie movie = watchlist[index];
                if (!stack_push(&undo_stack, REMOVE_FROM_WATCHLIST, movie, (size_t)index)) {
                    ok = 0;
                    copy_text(message, sizeof(message), "Could not allocate an undo action.");
                } else {
                    watchlist_remove(movie_id);
                    snprintf(message, sizeof(message), "REMOVE_FROM_WATCHLIST pushed for %s.", movie.title);
                }
            }
        } else if (strcmp(operation, "UNDO") == 0) {
            const ActionNode *top = stack_peek(&undo_stack);
            if (top == NULL) {
                copy_text(message, sizeof(message), "Undo stack is empty.");
            } else if (top->type == ADD_TO_WATCHLIST) {
                ActionNode action_record;
                stack_pop(&undo_stack, &action_record);
                watchlist_remove(action_record.movie.id);
                snprintf(message, sizeof(message), "Undo popped ADD and removed %s from the watchlist.",
                         action_record.movie.title);
            } else if (watchlist_insert(top->movie, top->index)) {
                ActionNode action_record;
                stack_pop(&undo_stack, &action_record);
                snprintf(message, sizeof(message), "Undo popped REMOVE and restored %s to the watchlist.",
                         action_record.movie.title);
            } else {
                ok = 0;
                copy_text(message, sizeof(message), "Could not restore the movie; the undo action remains on the stack.");
            }
        } else {
            ok = 0;
            copy_text(message, sizeof(message), "Unsupported watchlist-stack operation.");
        }
        outpos = 0;
        output[0] = '\0';
        out_raw("{\"ok\":");
        out_raw(ok ? "true" : "false");
        out_raw(",\"message\":");
        out_json(message);
        out_raw(",\"state\":");
        emit_stack();
        out_raw("}");
        puts(output);
    } else if (strcmp(structure, "QUEUE") == 0) {
        Movie movie;
        if (strcmp(operation, "ENQUEUE") == 0) {
            movie = find_seed(movie_id, movie_title, 0);
            ok = enqueue_movie(&watch_next, movie);
            snprintf(message, sizeof(message), ok ? "Enqueued %s at REAR in O(1)." :
                     "Could not allocate a queue node for %s.", movie.title);
        } else if (strcmp(operation, "DEQUEUE") == 0) {
            if (dequeue_movie(&watch_next, &movie)) {
                snprintf(message, sizeof(message), "Dequeued %s from FRONT in O(1).", movie.title);
            } else {
                copy_text(message, sizeof(message), "Queue is empty.");
            }
        } else if (strcmp(operation, "PEEK") == 0) {
            const Movie *next = peek_next_movie(&watch_next);
            if (next == NULL) copy_text(message, sizeof(message), "Queue is empty.");
            else snprintf(message, sizeof(message), "Next up: %s.", next->title);
        } else {
            ok = 0;
            copy_text(message, sizeof(message), "Unsupported queue operation.");
        }
        outpos = 0;
        output[0] = '\0';
        out_raw("{\"ok\":");
        out_raw(ok ? "true" : "false");
        out_raw(",\"message\":");
        out_json(message);
        out_raw(",\"state\":");
        emit_queue();
        out_raw("}");
        puts(output);
    } else if (strcmp(structure, "HEAP") == 0) {
        Movie movie;
        HeapTrace trace = {0};
        if (strcmp(operation, "INSERT") == 0) {
            char *end = NULL;
            double priority = score_text == NULL ? 0 : strtod(score_text, &end);
            if (score_text == NULL || end == score_text || *end != '\0' || !isfinite(priority)) {
                ok = 0;
                copy_text(message, sizeof(message), "Priority must be a finite number.");
            } else {
                movie = find_seed(movie_id, movie_title, priority);
                ok = heap_insert_with_trace(&heap, movie, &trace);
                snprintf(message, sizeof(message), ok ? "Inserted %s; sift-up restored the max-heap property." :
                         "Heap is at full capacity.", movie.title);
            }
        } else if (strcmp(operation, "EXTRACT") == 0) {
            ok = heap_extract_max_with_trace(&heap, &movie, &trace);
            snprintf(message, sizeof(message), ok ? "Extracted max-priority movie %s." : "Heap is empty.",
                     ok ? movie.title : "");
        } else if (strcmp(operation, "PEEK") == 0) {
            const Movie *maximum = heap_peek_max(&heap);
            if (maximum == NULL) copy_text(message, sizeof(message), "Heap is empty.");
            else snprintf(message, sizeof(message), "Heap root is %s (priority %.2f).",
                          maximum->title, maximum->priority);
        } else {
            ok = 0;
            copy_text(message, sizeof(message), "Unsupported max-heap operation.");
        }
        outpos = 0;
        output[0] = '\0';
        out_raw("{\"ok\":");
        out_raw(ok ? "true" : "false");
        out_raw(",\"message\":");
        out_json(message);
        out_raw(",\"heapTrace\":");
        emit_heap_trace(&trace);
        out_raw(",\"state\":");
        emit_heap();
        out_raw("}");
        puts(output);
    } else if (strcmp(structure, "HASH") == 0) {
        int found = 0;
        if (strcmp(operation, "INSERT") == 0) {
            Movie movie = find_seed(movie_id, movie_title, 0);
            ok = hash_insert(&hash_table, movie);
            if (ok) {
                snprintf(message, sizeof(message), "Inserted or updated %s in bucket %lu (separate chaining).",
                         movie.id, (unsigned long)hash_movie_id(movie.id));
            } else {
                snprintf(message, sizeof(message), "Could not allocate a hash-table node for %s.", movie.id);
            }
        } else if (strcmp(operation, "DELETE") == 0) {
            found = hash_delete(&hash_table, movie_id);
            ok = found;
            snprintf(message, sizeof(message), found ? "Deleted key %s." : "Key not found: %s.", movie_id);
        } else if (strcmp(operation, "COLLISION") == 0) {
            Movie first = make_movie("movie-1", "Collision example A", 1);
            Movie second = make_movie("movie-9", "Collision example B", 1);
            ok = hash_movie_id(first.id) == hash_movie_id(second.id) &&
                 hash_insert(&hash_table, first) && hash_insert(&hash_table, second);
            copy_text(message, sizeof(message), ok ? "Inserted movie-1 and movie-9 into the same collision chain." :
                      "Could not demonstrate a collision with the configured example IDs.");
        } else if (strcmp(operation, "SEARCH") == 0) {
            Movie *match = hash_search(&hash_table, movie_id);
            found = match != NULL;
            if (found) {
                snprintf(message, sizeof(message), "Found %s in bucket %lu.", match->title,
                         (unsigned long)hash_movie_id(movie_id));
            } else {
                snprintf(message, sizeof(message), "Key not found in bucket %lu.",
                         (unsigned long)hash_movie_id(movie_id));
            }
        } else {
            ok = 0;
            copy_text(message, sizeof(message), "Unsupported hash-table operation.");
        }
        outpos = 0;
        output[0] = '\0';
        out_raw("{\"ok\":");
        out_raw(ok ? "true" : "false");
        out_raw(",\"message\":");
        out_json(message);
        out_raw(",\"found\":");
        out_raw(found ? "true" : "false");
        out_raw(",\"state\":");
        emit_hash();
        out_raw("}");
        puts(output);
    } else if (strcmp(structure, "GRAPH") == 0) {
        size_t traversal[GRAPH_CAPACITY], path[GRAPH_CAPACITY];
        size_t traversal_count = 0, path_count = 0;
        if (strcmp(operation, "BFS") == 0) {
            traversal_count = graph_traverse_bfs(&graph, movie_id, traversal);
            ok = traversal_count > 0;
            copy_text(message, sizeof(message), ok ? "BFS traversal completed using a FIFO queue." :
                      "The source movie is not present in the graph.");
        } else if (strcmp(operation, "DFS") == 0) {
            traversal_count = graph_traverse_dfs(&graph, movie_id, traversal);
            ok = traversal_count > 0;
            copy_text(message, sizeof(message), ok ? "DFS traversal completed using an explicit stack." :
                      "The source movie is not present in the graph.");
        } else if (strcmp(operation, "SHORTEST") == 0) {
            path_count = graph_shortest_path(&graph, movie_id, movie_title, path);
            traversal_count = graph_traverse_bfs(&graph, movie_id, traversal);
            ok = path_count > 0;
            copy_text(message, sizeof(message), ok ? "Shortest unweighted path found using BFS." :
                      "No path exists between the selected movies.");
        } else {
            ok = 0;
            copy_text(message, sizeof(message), "Unsupported graph operation.");
        }
        outpos = 0;
        output[0] = '\0';
        out_raw("{\"ok\":");
        out_raw(ok ? "true" : "false");
        out_raw(",\"message\":");
        out_json(message);
        out_raw(",\"state\":");
        emit_graph(traversal, traversal_count, path, path_count);
        out_raw("}");
        puts(output);
    } else {
        error_response("Unknown data structure.");
    }

    free(id);
    free(title);
    free(score_text);
}

int main(void) {
    history = create_history_list();
    if (!reset_state()) {
        error_response("Could not initialize the C data structures.");
        return EXIT_FAILURE;
    }
    char line[8192];
    while (fgets(line, sizeof(line), stdin) != NULL) {
        handle(line);
        fflush(stdout);
    }
    free_state();
    return EXIT_SUCCESS;
}
