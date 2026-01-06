import { capitalize, groupBy, sortBy } from 'lodash-es';

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
  const match = /^(?<type>[^:(]+)(?:\((?<scope>[^)]+)\))?: ?(?<subject>.+)$/.exec(rawMessage);

  return {
    sha: sha.slice(0, 7),
    type: match?.groups?.type ?? 'other',
    scope: match?.groups?.scope,
    subject: match?.groups?.subject ?? rawMessage,
  };
}

function commitSectionsToMarkdown({ type, commits }) {
  return [
    `### ${commitScopesToHumanReadable[type] ?? capitalize(type)}`,
    ...commits.map(({ sha, scope, subject }) => ['-', scope ? `**${scope}**:` : '', subject, `(${sha})`].join(' ')),
  ].join('\n');
}

function rawCommitsToMarkdown({ rawCommits }) {
  const trimmedCommits = rawCommits.trim();
  const lines = trimmedCommits.split('\n').filter(line => line.trim());
  const commits = lines.map(parseCommitLine);

  // If no valid commits, return empty string
  if (!commits.length) {
    return '';
  }

  const grouped = groupBy(commits, 'type');
  const sections = Object.entries(grouped).map(([type, commits]) => ({ type, commits }));
  const sorted = sortBy(sections, ({ type }) => getCommitTypeSortIndex(type));
  const markdown = sorted.map(commitSectionsToMarkdown);

  return markdown.join('\n\n');
}
