# DABL Chess

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![CircleCI](https://circleci.com/gh/leonidr-da/dablchess.svg?style=svg)](https://circleci.com/gh/leonidr-da/dablchess)


Welcome to DABL Chess! A DAML app that can be deployed to [project:DABL](https://projectdabl.com/). DABL Chess is a fog-of-war [variant](https://en.wikipedia.org/wiki/Dark_chess) of Chess where you see only your pieces and where they can move. We demonstrate the power of [DAML](https://daml.com/) as the state of the two sides are encoded in separate [smart contracts](daml/Chess.daml); what you know depends on DAML's [ledger model](https://docs.daml.com/concepts/ledger-model/ledger-integrity.html), but you can still play via an intermediary.

> Copyright (c) 2020, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved. SPDX-License-Identifier: Apache-2.0

# Getting Started

## Deploying to [project:DABL](https://projectdabl.com/).

### 1. Create a ledger to run DABL Chat on

Log in to [project:DABL](https://projectdabl.com/) and create a new ledger under an existing or a new project.

### 2. Upload and deploy to DABL

Unzip and upload the three release files to your [project:DABL](https://projectdabl.com/) collections. Then drag and drop the each one of them to your newly created ledger.

### 3. Set up your automation and UI

Click on your ledger and navigate to the _Automation_ tab. Click on `change` next to _Running as:_ and redeploy the bot as the `UserAdmin` party.

### 4. Log in and start playing!

You can find the subdomain url of your DABLChess app in the _UI Assets_ tab.  When you login, give yourself an alias so that you are discoverable to other players.

## Developing

### 1. Prerequisites

- Git (to clone the repository)
- The [DAML SDK](https://docs.daml.com/getting-started/installation.html) (to build the model)
- [Poetry](https://python-poetry.org/) Python 3.6 or later (For [Python automation bot](https://docs.projectdabl.com/).)
- [yarn](https://classic.yarnpkg.com/en/) (to build UI).

### 2. Clone this repo

```bash
git clone https://github.com/leonidr-da/dablchess.git
```

### 3. Start the game locally:

```bash
# A DAML in memory ledger, a sandbox
$ make start_daml_server
# An bot that listens to ledger requests and advances play.
$ make start_operator
# A React app that displays game logic.
$ make start_ui_server
```

or
```bash
$ make start_all
```
### 4. Release

```bash
$ make package
```

This will create a versioned `dablchess-x.x.x.dar` file containing the compiled DAML model, a `dablchess-bot-x.x.x.tar.gz` tarball containing the python automation, and a `dablchess-ui-x.x.x.zip` archive containing the UI static assets. These files will be zipped into a `dabl-chess.zip` under the `target/` directory.

