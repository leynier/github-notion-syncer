# SPDX-FileCopyrightText: 2022-present Leynier Gutiérrez González <leynier41@gmail.com>
#
# SPDX-License-Identifier: MIT
import click

from ..__about__ import __version__


@click.group(context_settings={'help_option_names': ['-h', '--help']}, invoke_without_command=True)
@click.version_option(version=__version__, prog_name='github-notion-syncer')
@click.pass_context
def github_notion_syncer(ctx: click.Context):
    click.echo('Hello world!')
