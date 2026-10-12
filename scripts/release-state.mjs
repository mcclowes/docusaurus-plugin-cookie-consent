import { appendFile, readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export async function readPublicationState(
  { name, version, repository, token, refType, refName },
  fetchImpl = fetch
) {
  const tag = `v${version}`
  if (!name || !version || !/^[\w.-]+\/[\w.-]+$/.test(repository ?? '')) {
    throw new Error('Package name, version, and GitHub repository are required')
  }
  if (refType === 'tag' && refName !== tag) {
    throw new Error('Release tag does not match the package version')
  }

  const githubHeaders = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const read = async (
    service,
    url,
    { allowMissing = false, expectArray = false, headers = {} } = {}
  ) => {
    const response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(30000) })
    if (allowMissing && response.status === 404) return null
    if (!response.ok) throw new Error(`${service} check failed: HTTP ${response.status}`)
    const data = await response.json()
    if (!data || typeof data !== 'object' || Array.isArray(data) !== expectArray) {
      throw new Error(`${service} returned invalid metadata`)
    }
    return data
  }

  const repoUrl = `https://api.github.com/repos/${repository}`
  const repo = await read('GitHub repository access', repoUrl, { headers: githubHeaders })
  if (repo.full_name?.toLowerCase() !== repository.toLowerCase()) {
    throw new Error('GitHub returned an unexpected repository')
  }
  const [npm, github] = await Promise.all([
    read(
      'npm publication',
      `https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,
      {
        allowMissing: true,
      }
    ),
    read('GitHub publication', `${repoUrl}/releases/tags/${encodeURIComponent(tag)}`, {
      allowMissing: true,
      headers: githubHeaders,
    }),
  ])
  if (github === null) {
    await read('GitHub release access', `${repoUrl}/releases?per_page=1`, {
      expectArray: true,
      headers: githubHeaders,
    })
  }
  if (npm && (npm.name !== name || npm.version !== version)) {
    throw new Error('npm returned an unexpected package version')
  }
  if (github && (github.tag_name !== tag || typeof github.draft !== 'boolean')) {
    throw new Error('GitHub returned an unexpected release')
  }
  const npmPublished = npm !== null
  const githubPublished = github !== null && !github.draft
  return {
    npm_published: npmPublished,
    github_published: githubPublished,
    skip: npmPublished && githubPublished,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required')
    const { name, version } = JSON.parse(await readFile('package.json', 'utf8'))
    const state = await readPublicationState({
      name,
      version,
      repository: process.env.GITHUB_REPOSITORY,
      token: process.env.GITHUB_TOKEN,
      refType: process.env.GITHUB_REF_TYPE,
      refName: process.env.GITHUB_REF_NAME,
    })
    await appendFile(
      process.env.GITHUB_OUTPUT,
      Object.entries(state)
        .map(([key, value]) => `${key}=${value}\n`)
        .join('')
    )
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
