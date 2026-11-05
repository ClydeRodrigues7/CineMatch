#ifndef CINEMATCH_MOVIE_H
#define CINEMATCH_MOVIE_H

#define MOVIE_ID_LEN 48
#define MOVIE_TITLE_LEN 160

typedef struct {
    char id[MOVIE_ID_LEN];
    char title[MOVIE_TITLE_LEN];
    double priority;
} Movie;

#endif
