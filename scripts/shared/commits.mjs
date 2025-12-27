import pkg from 'lodash';
const { chain, capitalize } = pkg;

export { rawCommitsToMarkdown };

const commitScopesToHumanReadable = {
  build: 'Build system',
  chore: 'Chores',
  ci: 'Continuous integration',
  docs: 'Documentation',
  feat: 'Features',
  fix: 'Bug fixes',
  infra: 'Infrastucture',
  perf: 'Performance',
  refactor: 'Refactoring',
  test: 'Tests',
};

const commitTypesOrder = ['feat', 'fix', 'perf', 'refactor', 'test', 'build', 'ci', 'chore', 'other'];

const getCommitTypeSortIndex = (type) =>
  commitTypesOrder.includes(type) ? commitTypesOrder.indexOf(type) : commitTypesOrder.length;

function parseCommitLine(commit) {
  const [sha, ...splittedRawMessage] = commit.trim().split(' ');
  const rawMessage = splittedRawMessage.join(' ');
  const { type, scope, subject } = /^(?<type>.*?)(\((?<scope>.*)\))?: ?(?<subject>.+)$/.exec(rawMessage)?.groups ?? {};

  return {
    sha: sha.slice(0, 7),
    type: type ?? 'other',
    scope,
    subject: subject ?? rawMessage,
  };
}

function commitSectionsToMarkdown({ type, commits }) {
  return [
    `### ${commitScopesToHumanReadable[type] ?? capitalize(type)}`,
    ...commits.map(({ sha, scope, subject }) => ['-', scope ? `**${scope}**:` : '', subject, `(${sha})`].join(' ')),
  ].join('\n');
}

function rawCommitsToMarkdown({ rawCommits }) {
  return chain(rawCommits)
    .trim()
    .split('\n')
    .map(parseCommitLine)
    .groupBy('type')
    .map((commits, type) => ({ type, commits }))
    .sortBy(({ type }) => getCommitTypeSortIndex(type))
    .map(commitSectionsToMarkdown)
    .join('\n\n')
    .value();
}
