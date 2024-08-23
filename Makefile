# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: macarval <macarval@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/03/19 16:33:22 by macarval          #+#    #+#              #
#    Updated: 2024/08/23 17:56:57 by macarval         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Regular colors
RED			= \033[0;31m
GREEN		= \033[0;32m
YELLOW		= \033[0;33m
BLUE		= \033[0;34m
PURPLE		= \033[0;35m
CYAN		= \033[0;36m
WHITE		= \033[0;37m
RESET		= \033[0m

# Bold
BRED		= \033[1;31m
BGREEN		= \033[1;32m
BYELLOW		= \033[1;33m
BBLUE		= \033[1;34m
BPURPLE		= \033[1;35m
BCYAN		= \033[1;36m
BWHITE		= \033[1;37m

BRANCH_FILE	= .branch_name
MAIN_BRANCH	= main

all:
			clear
			docker compose up -d --build

new-branch:
			git checkout $(MAIN_BRANCH)
			git pull origin $(MAIN_BRANCH)
			@echo "$(BGREEN)Enter the name of the new branch: "; \
			read branch_name; \
			feature_branch="feature/$$branch_name"; \
			echo $$feature_branch; \
			echo $$feature_branch > $(BRANCH_FILE); \
			echo "Branch $$feature_branch created."; \
			git checkout -b $$(cat $(BRANCH_FILE)); \
			git push --set-upstream origin $$(cat $(BRANCH_FILE))

git:
			clear
			@make --no-print-directory
			@git add . :!*$(BRANCH_FILE)
			@git status
			@echo "$(BPURPLE)Choose the commit type:"; \
			echo "$(BYELLOW)1. feat: $(WHITE)Adds a new feature to your codebase"; \
			echo "$(BYELLOW)2. fix: $(WHITE)Solves a problem in your codebase"; \
			echo "$(BYELLOW)3. docs: $(WHITE)Documentation changes"; \
			echo "$(BYELLOW)4. style: $(WHITE)Formatting, spacing, etc."; \
			echo "$(BYELLOW)5. refactor: $(WHITE)Refactoring code used in production, e.g. renaming a variable"; \
			echo "$(BYELLOW)6. test: $(WHITE)Adding tests, refactoring tests"; \
			echo "$(BYELLOW)7. chore: $(WHITE)Adjust build script, updating dependencies, makefile etc"; \
			read type_choice; \
			case $$type_choice in \
						1) type="feat" ;; \
						2) type="fix" ;; \
						3) type="docs" ;; \
						4) type="style" ;; \
						5) type="refactor" ;; \
						6) type="test" ;; \
						7) type="chore" ;; \
						*) echo "$(BRED)Invalid choice"; exit 1 ;; \
			esac; \
			echo -n "\n"; \
			echo "$(BGREEN)Enter the commit message:"; \
			read msg; \
			echo -n "\n"; \
			echo "$(BBLUE)"; \
			git commit -m "[ft_transcendence] $$type: $$msg"; \
			git checkout $(MAIN_BRANCH); \
			git pull origin $(MAIN_BRANCH); \
			git checkout $(shell cat $(BRANCH_FILE)); \
			git merge $(MAIN_BRANCH); \
			git push origin $(shell cat $(BRANCH_FILE)); \

delete-branch:
			git checkout $(MAIN_BRANCH)
			git pull origin $(MAIN_BRANCH)
			git checkout $(shell cat $(BRANCH_FILE))
			git merge $(MAIN_BRANCH)
			git checkout $(MAIN_BRANCH)
			git merge $(shell cat $(BRANCH_FILE))
			git push origin $(MAIN_BRANCH)
			git branch -d $(shell cat $(BRANCH_FILE))
			git push origin --delete $(shell cat $(BRANCH_FILE))

.PHONY:		all
