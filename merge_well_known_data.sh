#!/bin/bash

# Set output file
output="crawl_results/well-known/well-known-data.csv"

# Ensure we're starting clean
rm -f "$output"

#makes well-known directory
mkdir crawl_results/well-known

# Copy pt1 the output file
cat crawl_results/pt1/well-known-data.csv >> $output

# Append pt2 to pt8 
for i in {2..8}
do
    tail -n +0 crawl_results/pt${i}/Extra/well-known-data.csv >> $output
done

echo "Files have been merged into crawl_results/merged-well-known-data.csv"
