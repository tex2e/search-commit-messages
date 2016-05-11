#!/bin/bash

tmpfile="/tmp/$$"
trap "rm \"$tmpfile\"; exit 1" 2

for file in $@; do
  sort "$file" | uniq > "$tmpfile"
  mv "$tmpfile" "$file"
done
