# Contributing Guide

## Core Values

### Readability First

We prioritize code readability over premature optimization. Clear, maintainable code that's easy to understand helps our team collaborate effectively and reduces technical debt. If you need to make performance improvements, document your reasoning and ensure the optimizations don't significantly impact readability.

### Collaboration Best Practices

- Do not commit directly to main. Create a PR.
- You do not need to PR between secondary branches.
- Give others time to review before merging PRs
- Respond to review comments promptly and respectfully. Do not resolve reviews without addressing the comments.
- Never self-merge unless explicitly authorized for urgent hotfixes.
- Keep PRs focused and reasonably sized for effective review.
- Fill out PR descriptions to answer the "what" and "why" of the changes you're making.

**Remember:** Code review is never personal and shouldn't be taken as such. If you're not breaking things you aren't trying.

### AI Usage Guidelines

While AI tools (like GitHub Copilot or ChatGPT) can be helpful for:

- Understanding concepts
- Exploring potential approaches
- Debugging issues
- Documentation assistance

They should not be used as a primary source for:

- Direct code solutions without understanding
- Architecture decisions
- Security-critical components

Always review and understand any AI-suggested code thoroughly before implementing. Use AI as a learning tool rather than a black box solution. You should always assume code directly written by the AI is sampled from the worst code on the internet. Use the AI only as a starting point.

## Code Quality

### Basics

- NEVER trust client input. Perform runtime validation on both sides.
- Do not expose secrets to the client.
- UIs should be kept as simple as possible.

### TypeScript

- Use `type` over `interface` for consistency and clarity
- The goal of typescript is to write the minimal amount possible which satisfies type safety for your use case.
- Typescript is a false sense of security. It serves only to assist you in holding items.
- It's okay to use any if you are smarter than TypeScript, but never lazier.

### React

- Use functional components rather than class components
- Stay server side as much as possible
- Use server actions to mutate data
- As a guideline, components are 30-100 lines of code.
