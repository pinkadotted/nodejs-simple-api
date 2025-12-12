# Agent Guidelines

## Build Commands
- Build: `npm run build` / `cargo build` / `python -m build`
- Lint: `npm run lint` / `cargo clippy` / `ruff check`
- Test: `npm test` / `cargo test` / `pytest`
- Single test: `npm test -- --testNamePattern="test_name"` / `cargo test test_name` / `pytest -k test_name`

## Code Style
- Imports: Group external imports first, then internal imports
- Formatting: Use project's formatter (Prettier/rustfmt/black)
- Types: Use explicit types, prefer interfaces over types
- Naming: camelCase for variables, PascalCase for types, snake_case for files
- Error handling: Use Result/Option patterns, avoid unwraps
- Comments: Minimal, self-documenting code preferred

## Project Structure
- Follow existing directory patterns
- Keep components small and focused
- Use absolute imports where possible