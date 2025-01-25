import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    const token = core.getInput('gh-token')
    const owner = core.getInput('repo-owner')
    const repo = core.getInput('repo')
    const allowed_languages_str = core.getInput('allowed-languages')
    const allowed_threshold = parseInt(core.getInput('allowed-threshold'))

    core.info(`Initializing client`)
    const gh_client = github.getOctokit(token)

    core.info(`Pulling languages from ${owner}/${repo}`)

    const resp = await gh_client.request(
      `GET /repos/${owner}/${repo}/languages`
    )

    let languages = resp.data

    core.info(`Got ${JSON.stringify(resp.data)}`)

    const total = Object.values(languages).reduce(
      (accumulator, current) => accumulator + current,
      0
    )

    core.debug(`Total lines ${total}`)

    if (allowed_languages_str.trim().length > 0) {
      let allowed = allowed_languages_str
        .split(',')
        .map((x) => x.trim().toLowerCase())

      core.info(`Filtering for Languages in ${allowed}`)

      Object.keys(languages)
        .filter((key) => !allowed.includes(key.toLowerCase()))
        .forEach((key) => delete languages[key])

      core.debug(`After language filter ${JSON.stringify(languages)}`)
    }

    if (allowed_threshold > 0) {
      core.info(`Filtering for threshold ${allowed_threshold}%`)

      Object.keys(languages)
        .filter((key) => (languages[key] / total) * 100 < allowed_threshold)
        .forEach((key) => delete languages[key])

      core.debug(`After threshold filter ${JSON.stringify(languages)}`)
    }

    core.info(`Languages returned ${JSON.stringify(Object.keys(languages))}`)

    core.setOutput('languages', JSON.stringify(Object.keys(languages)))
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
