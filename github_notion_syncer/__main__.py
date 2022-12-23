# SPDX-FileCopyrightText: 2022-present Leynier Gutiérrez González <leynier41@gmail.com>
#
# SPDX-License-Identifier: MIT
import sys

if __name__ == '__main__':
    from .cli import github_notion_syncer

    sys.exit(github_notion_syncer())
