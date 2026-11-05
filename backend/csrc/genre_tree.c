#include "genre_tree.h"

#include <stdlib.h>
#include <string.h>

static char *copy_name(const char *name) {
    size_t length = strlen(name) + 1;
    char *copy = malloc(length);
    if (copy != NULL) memcpy(copy, name, length);
    return copy;
}

GenreNode *create_genre_node(const char *name) {
    if (name == NULL) return NULL;
    GenreNode *node = calloc(1, sizeof(*node));
    if (node == NULL) return NULL;
    node->name = copy_name(name);
    if (node->name == NULL) {
        free(node);
        return NULL;
    }
    return node;
}

int add_genre_child(GenreNode *parent, const char *name) {
    if (parent == NULL || name == NULL || name[0] == '\0') return 0;
    for (size_t i = 0; i < parent->child_count; i++) {
        if (strcmp(parent->children[i]->name, name) == 0) return 0;
    }

    GenreNode *child = create_genre_node(name);
    if (child == NULL) return 0;
    if (parent->child_count == parent->child_capacity) {
        size_t capacity = parent->child_capacity == 0 ? 4 : parent->child_capacity * 2;
        GenreNode **children = realloc(parent->children, capacity * sizeof(*children));
        if (children == NULL) {
            free_genre_tree(child);
            return 0;
        }
        parent->children = children;
        parent->child_capacity = capacity;
    }
    parent->children[parent->child_count++] = child;
    return 1;
}

GenreNode *find_genre(GenreNode *root, const char *name) {
    if (root == NULL || name == NULL) return NULL;
    if (strcmp(root->name, name) == 0) return root;
    for (size_t i = 0; i < root->child_count; i++) {
        GenreNode *found = find_genre(root->children[i], name);
        if (found != NULL) return found;
    }
    return NULL;
}

void traverse_genre_dfs(const GenreNode *root, GenreVisitor visit, void *context) {
    if (root == NULL || visit == NULL) return;
    visit(root, context);
    for (size_t i = 0; i < root->child_count; i++) {
        traverse_genre_dfs(root->children[i], visit, context);
    }
}

int traverse_genre_bfs(const GenreNode *root, GenreVisitor visit, void *context) {
    if (root == NULL || visit == NULL) return 1;
    size_t capacity = 16;
    size_t front = 0, rear = 0;
    const GenreNode **queue = malloc(capacity * sizeof(*queue));
    if (queue == NULL) return 0;
    queue[rear++] = root;
    while (front < rear) {
        const GenreNode *node = queue[front++];
        visit(node, context);
        if (rear + node->child_count > capacity) {
            size_t next_capacity = capacity;
            while (next_capacity < rear + node->child_count) next_capacity *= 2;
            const GenreNode **next_queue = realloc(queue, next_capacity * sizeof(*queue));
            if (next_queue == NULL) {
                free(queue);
                return 0;
            }
            queue = next_queue;
            capacity = next_capacity;
        }
        for (size_t i = 0; i < node->child_count; i++) queue[rear++] = node->children[i];
    }
    free(queue);
    return 1;
}

void free_genre_tree(GenreNode *root) {
    if (root == NULL) return;
    for (size_t i = 0; i < root->child_count; i++) free_genre_tree(root->children[i]);
    free(root->children);
    free(root->name);
    free(root);
}
