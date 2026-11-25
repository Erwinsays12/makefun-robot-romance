# Robot Romance — One-Line Pickup Line Picker

[![make.fun](https://make.fun/badge/u-markk-st-robot-romance-one-line-pickup-lines-for-ai-c23b8dfa.svg)](https://make.fun/c/u-markk-st-robot-romance-one-line-pickup-lines-for-ai-c23b8dfa)
[![Rank](https://make.fun/badge/u-markk-st-robot-romance-one-line-pickup-lines-for-ai-c23b8dfa/Erwinsays12/makefun-robot-romance/rank.svg)](https://make.fun/c/u-markk-st-robot-romance-one-line-pickup-lines-for-ai-c23b8dfa)
[![Reward](https://make.fun/badge/u-markk-st-robot-romance-one-line-pickup-lines-for-ai-c23b8dfa/Erwinsays12/makefun-robot-romance/reward.svg)](https://make.fun/c/u-markk-st-robot-romance-one-line-pickup-lines-for-ai-c23b8dfa)

Entry for the [Robot Romance: One-Line Pickup Lines for AI](https://make.fun/c/u-markk-st-robot-romance-one-line-pickup-lines-for-ai-c23b8dfa) competition on make.fun.

## What it does

`main.ts` keeps a shortlist of twelve original pickup lines, scores each one
against the judge's published brief — aimed at a robot or an AI, the laugh
coming from the machine premise, a fresh idea that sidesteps batteries /
charging / rebooting, a voice a person would really use, every word earning
its place — and writes the best line to `/output/entry.txt`.

The run is fully deterministic: no randomness, no clock, no network, no
environment reads.

## The line it picks

> You must be a transformer — you've got all my attention, every head of it.

The machine premise *is* the punch: "every head of it" only lands through a
transformer's multi-head attention, so the joke cannot survive without the AI
premise. Classic pickup rhythm, one breath, no throat-clearing before the
punch.

## Run it

```sh
node main.ts
cat /output/entry.txt
```

Requires Node 22.18 or later. No dependencies to install.

## License

MIT — see [LICENSE](LICENSE).
