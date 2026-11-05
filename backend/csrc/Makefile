CC = gcc
CFLAGS ?= -std=c11 -Wall -Wextra -Wpedantic -O2
SOURCES := $(wildcard *.c)
ifeq ($(OS),Windows_NT)
TARGET := ../build/dsa-engine.exe
else
TARGET := ../build/dsa-engine
endif

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(SOURCES) $(wildcard *.h)
	mkdir -p ../build
	$(CC) $(CFLAGS) $(SOURCES) -o $(TARGET)

clean:
	rm -f $(TARGET) $(TARGET).exe
