# Git Workflow Guide

Quick reference for managing your code with Git and GitHub.

## Initial Setup

### 1. Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click "New Repository"
3. Repository name: `ci-mgmt-app`
4. Description: "Continuous Improvement Management System"
5. Choose: **Private** or **Public**
6. **DO NOT** initialize with README (you already have one)
7. Click "Create repository"

### 2. Connect Local Repository to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Complete CI Management Application"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ci-mgmt-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Verify Upload

Visit: `https://github.com/YOUR_USERNAME/ci-mgmt-app`

You should see all your files on GitHub!

---

## Daily Development Workflow

### Morning: Start Work

```bash
# Pull latest changes (if working with team)
git pull origin main

# Check current status
git status

# See what branch you're on
git branch
```

### During Development: Save Progress

```bash
# Check what files changed
git status

# See specific changes
git diff

# Add specific files
git add backend/src/main/java/com/cims/app/service/NewService.java
git add frontend/src/pages/NewPage.tsx

# Or add all changes
git add .

# Commit with descriptive message
git commit -m "Add new feature: User bulk import"

# Push to GitHub
git push origin main
```

### Commit Message Best Practices

**Good commit messages:**
```bash
git commit -m "Add bulk delete functionality for ideas"
git commit -m "Fix: Resolve navigation menu role checking issue"
git commit -m "Update: Improve dashboard performance"
git commit -m "Docs: Add local development setup guide"
```

**Bad commit messages:**
```bash
git commit -m "changes"
git commit -m "fix"
git commit -m "update"
```

---

## Feature Branch Workflow

For larger features, use branches:

### Create Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/reports-enhancement

# Or create branch without switching
git branch feature/reports-enhancement
git checkout feature/reports-enhancement
```

### Work on Feature

```bash
# Make changes...
git add .
git commit -m "Add advanced filtering to reports"

# Push feature branch to GitHub
git push origin feature/reports-enhancement
```

### Merge Feature to Main

```bash
# Switch back to main
git checkout main

# Pull latest changes
git pull origin main

# Merge feature branch
git merge feature/reports-enhancement

# Push to GitHub
git push origin main

# Delete feature branch (optional)
git branch -d feature/reports-enhancement
git push origin --delete feature/reports-enhancement
```

---

## Common Git Commands

### Check Status

```bash
# See what files changed
git status

# See commit history
git log

# See last 5 commits
git log -5

# See changes in files
git diff
```

### Undo Changes

```bash
# Discard changes in a file (before staging)
git checkout -- filename.txt

# Unstage a file (after git add)
git reset HEAD filename.txt

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) - CAREFUL!
git reset --hard HEAD~1
```

### View History

```bash
# See commit history
git log

# See compact history
git log --oneline

# See history with graph
git log --graph --oneline --all
```

### Branches

```bash
# List all branches
git branch

# Create new branch
git branch feature/new-feature

# Switch to branch
git checkout feature/new-feature

# Create and switch in one command
git checkout -b feature/new-feature

# Delete branch
git branch -d feature/new-feature

# Rename current branch
git branch -m new-branch-name
```

---

## Handling Conflicts

If you get merge conflicts:

```bash
# Pull latest changes
git pull origin main

# If conflicts occur, Git will tell you which files
# Open conflicted files and look for:
<<<<<<< HEAD
Your changes
=======
Their changes
>>>>>>> branch-name

# Edit the file to resolve conflicts
# Remove the conflict markers
# Keep the code you want

# After resolving:
git add resolved-file.txt
git commit -m "Resolve merge conflicts"
git push origin main
```

---

## .gitignore

Your project already has a `.gitignore` file. Common patterns:

```gitignore
# Dependencies
node_modules/
target/

# Environment files
.env
.env.local

# IDE files
.vscode/
.idea/
*.iml

# Build outputs
dist/
build/
*.class

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db
```

---

## Useful Git Aliases

Add to your `~/.gitconfig`:

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --graph --oneline --all
```

Usage:
```bash
git st          # instead of git status
git co main     # instead of git checkout main
git br          # instead of git branch
```

---

## GitHub Best Practices

### 1. Regular Commits

Commit frequently with meaningful messages:
```bash
# Good practice
git add .
git commit -m "Add user authentication feature"
git push origin main
```

### 2. Pull Before Push

Always pull before pushing:
```bash
git pull origin main
git push origin main
```

### 3. Use Branches for Features

```bash
# Create feature branch
git checkout -b feature/new-dashboard

# Work on feature...
git add .
git commit -m "Implement new dashboard layout"

# Push feature branch
git push origin feature/new-dashboard

# Create Pull Request on GitHub
# After review, merge to main
```

### 4. Write Good README

Keep your README.md updated with:
- Project description
- Setup instructions
- Usage examples
- Contributing guidelines

### 5. Use Tags for Releases

```bash
# Create a tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag to GitHub
git push origin v1.0.0

# List all tags
git tag
```

---

## Emergency Commands

### Accidentally Committed Sensitive Data

```bash
# Remove file from Git but keep locally
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Remove .env from tracking"
git push origin main
```

### Completely Reset to Remote

```bash
# CAREFUL: This discards all local changes!
git fetch origin
git reset --hard origin/main
```

### Recover Deleted Commit

```bash
# Find the commit hash
git reflog

# Restore it
git checkout <commit-hash>
git checkout -b recovery-branch
```

---

## GitHub Features

### 1. Issues

Track bugs and features:
- Go to "Issues" tab on GitHub
- Click "New Issue"
- Describe the problem or feature
- Assign to yourself or team members

### 2. Pull Requests

For code review:
1. Create feature branch
2. Push to GitHub
3. Click "New Pull Request"
4. Add description
5. Request review
6. Merge after approval

### 3. GitHub Actions (CI/CD)

Automate testing and deployment:
- Create `.github/workflows/ci.yml`
- Define build and test steps
- Runs automatically on push

### 4. Releases

Create releases:
1. Go to "Releases" tab
2. Click "Create a new release"
3. Choose tag version (e.g., v1.0.0)
4. Add release notes
5. Attach binaries if needed

---

## Quick Reference Card

```bash
# Setup
git init
git remote add origin <url>
git push -u origin main

# Daily workflow
git pull origin main
git add .
git commit -m "message"
git push origin main

# Branching
git checkout -b feature/name
git checkout main
git merge feature/name

# Undo
git reset HEAD file.txt
git checkout -- file.txt
git reset --soft HEAD~1

# Info
git status
git log
git diff
git branch
```

---

## Troubleshooting

### "Permission denied (publickey)"

Use HTTPS instead of SSH:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/ci-mgmt-app.git
```

### "Failed to push some refs"

Pull first:
```bash
git pull origin main --rebase
git push origin main
```

### "Merge conflict"

1. Open conflicted files
2. Resolve conflicts manually
3. `git add .`
4. `git commit -m "Resolve conflicts"`
5. `git push origin main`

---

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Atlassian Git Tutorial](https://www.atlassian.com/git/tutorials)

---

**Happy Coding! 🚀**

Made with Bob IDE