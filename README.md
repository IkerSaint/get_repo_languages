# Action

A GitHub Action that retrieves and outputs the current repository languages
using
[List repository languages](https://docs.github.com/en/rest/repos/repos#list-repository-languages)
API.

## Usage

Create a workflow `.github/workflows/languages.yml`.

### Example

Print all the languages detected.

```yml
name: Echo Languages
on:
  workflow_dispatch:

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: IkerSaint/get_repo_languages@main
        id: get-languages
      - run:
          echo ${{ join(fromJSON(steps.get-languages.outputs.languages), ',') }}
```

### Filtering

Inputs `allowed-languages` and `allowed-threshold` (language-lines/total lines)
allow you to filter the resulting languages.

```yml
- uses: IkerSaint/get_repo_languages@main
  id: get-languages
  with:
    allowed-languages: 'Javascript,Typescript,Java,C#,Golang,Rust,Python'
    allowed-threshold: '10'
```

## Outputs

languages => The languages of the repository as a JSON array
