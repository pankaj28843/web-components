# Agent instructions

## Solo-project delivery workflow

This is a small, solo-maintained project. Use `main` as the default working and
delivery branch.

- For ordinary work, work on `main`, make an intentional commit, and push
  directly to `origin/main`.
- Do not create feature branches, pull requests, draft pull requests, or a
  review handoff unless the user explicitly asks for one or the person doing
  the work cannot use `main`.
- If `main` is unavailable or blocked, state the concrete reason before using a
  branch or pull request.
- Before pushing, inspect the worktree and run the repository checks, including
  `git diff --check`; use the project scripts in `package.json` and `README.md`
  as the source of truth.
- For Pages releases, push `main`, inspect the resulting GitHub Actions run with
  `gh run`, and verify the public URL after deployment completes.

Keep this workflow lightweight: do not add process that is not required by the
user or by a concrete repository constraint.
