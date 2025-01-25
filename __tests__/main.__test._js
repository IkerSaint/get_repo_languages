/**
 * Unit tests for the action's main functionality, src/main.js
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import { run } from '../src/main.js'
import * as core from '@actions/core'
import * as github from '@actions/github'

jest.mock('@actions/core')
jest.mock('@actions/github')

describe('main.js', () => {
  let mockGetOctokit

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock `getInput`
    core.getInput = jest.fn().mockImplementation((name) => {
      const inputs = {
        'gh-token': 'mock-token',
        'repo-owner': 'mock-owner',
        repo: 'mock-repo',
        'allowed-languages': 'javascript,python',
        'allowed-threshold': '10'
      }
      return inputs[name]
    })

    // Mock `setOutput` and `setFailed`
    core.setOutput = jest.fn()
    core.setFailed = jest.fn()
    core.info = jest.fn()

    // Mock `github.getOctokit`
    mockGetOctokit = {
      request: jest.fn()
    }
    github.getOctokit = jest.fn().mockReturnValue(mockGetOctokit)
  })

  it('should set the output with filtered languages below threshold', async () => {
    // Mock the response from the GitHub API
    mockGetOctokit.request.mockResolvedValue({
      data: {
        javascript: 5000,
        python: 3000,
        java: 2000,
        html: 1000
      }
    })

    await run()

    // Verify the GitHub API was called with the correct repo owner/repo
    expect(mockGetOctokit.request).toHaveBeenCalledWith(
      'GET /repos/mock-owner/mock-repo/languages'
    )

    // Verify the output was set correctly
    // Threshold is 10%, "html" (6%) and "java" (12%) should be filtered out based on logic
    expect(core.setOutput).toHaveBeenCalledWith(
      'languages',
      JSON.stringify([['java', 2000]])
    )
  })

  it('should handle an empty response from the GitHub API', async () => {
    mockGetOctokit.request.mockResolvedValue({
      data: {}
    })

    await run()

    expect(core.setOutput).toHaveBeenCalledWith('languages', JSON.stringify([]))
  })

  it('should fail the action if GitHub API call throws an error', async () => {
    mockGetOctokit.request.mockRejectedValue(new Error('GitHub API error'))

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('GitHub API error')
  })
})
