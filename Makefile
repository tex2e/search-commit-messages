
target_dir  := ./commit-crawler
target_file := $(target_dir)/commits.txt
dist_dir  := ./database
dist_file := $(dist_dir)/commit-message

.PHONY: database

database:
	@mkdir -p "$(dist_dir)"
	sed -E 's/^[-a-zA-Z0-9.]+\/[-a-zA-Z0-9.]+, [0-9a-f]+, [ 	]*//g' "$(target_file)" > "$(dist_file)"
	ruby ./bin/reject-filter.rb "$(dist_file)"
	./bin/overwrite-sort-uniq.sh "$(dist_file)"
