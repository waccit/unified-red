# Contributing to Unified-RED

We welcome contributions, but request you follow these guidelines.

 - [Raising issues](#raising-issues)
 - [Feature requests](#feature-requests)
 - [Pull-Requests](#pull-requests)
   - [Contributor License Agreement](#contributor-license-agreement)

This project adheres to the [Contributor Covenant 1.4](http://contributor-covenant.org/version/1/4/). By participating, you are expected to uphold this code. Please report unacceptable behaviour to any of the [project's core team](https://github.com/orgs/waccit/teams/core).

## Raising issues

Please raise any bug reports on our [GitHub issue tracker](https://github.com/waccit/unified-red/issues/). When creating a new issue, please select the *Bug report* template. Be sure to search the list to see if your issue has already been raised. Also, we highly encourage that potential bugs be discussed on the [discussion forum](https://groups.google.com/g/unified-red) prior to submitting a bug report.

A good bug report is one that makes it easy for us to understand what you were trying to do and what went wrong.

Provide as much context as possible so we can try to recreate the issue. If possible, include the relevant part of your flow. To do this, select the relevant nodes, press Ctrl-E and copy the flow data from the Export dialog.

At a minimum, please include:

 - Version of Unified-RED - either release number if you downloaded a zip, or the first few lines of `git log` if you are cloning the repository directly.
 - Version of Node-RED - either release number if you downloaded a zip, or the first few lines of `git log` if you are cloning the repository directly.
 - Version of node.js - what does `node -v` say?

## Feature requests

For feature requests, please raise them on the [discussion forum](https://groups.google.com/g/unified-red). Once the feature has been discussed, you can formally submit the feature request via our [GitHub issue tracker](https://github.com/waccit/unified-red/issues/). Create a new issue and select the *Feature request* template.

## Pull-Requests

If you want to raise a pull-request with a new feature, or a refactoring of existing code, it may well get rejected if you haven't discussed it on the [discussion forum](https://groups.google.com/g/unified-red) first.

### Coding standards

Please ensure you follow the coding standards used through-out the existing code base. Some basic rules include:

 - indent with 4-spaces, no tabs. No arguments.
 - opening brace on same line as `if`/`for`/`function` and so on, closing brace on its own line.
 - There are **.jshintrc** and **.jscsrc** files included in the project which should be used to help formatting.