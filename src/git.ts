import { exec } from 'child_process';

export interface CommitInfo {
  commitHash: string;
  author: string;
  lineNumber: number;
  commitTitle: string;
}

export function fetchFileBlame(file: string): Promise<CommitInfo[]> {
  return new Promise<CommitInfo[]>((resolve, reject) => {
    // Run git blame
    exec(`git blame -w ${file}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing git blame: ${error.message}`);
        reject(error.message);
        return;
      }

      const commitInfos: CommitInfo[] = [];
      const commitHashes = new Set<string>();

      stdout.split('\n').forEach(line => {
        if (line.trim() === '') {
          return;
        }

        const match = line.match(/^([^\s]+) \(([^)]+)\s+(\d+)\) .*/);
        if (match) {
          const commitHash = match[1];
          const authorInfo = match[2];
          const lineNumber = parseInt(match[3], 10);

          // Extract the author's name from authorInfo
          const authorName = authorInfo.split(' ').slice(0, -3).join(' ');

          commitHashes.add(commitHash);

          commitInfos.push({
            commitHash,
            author: authorName,
            lineNumber,
            commitTitle: '', // Placeholder for commit title
          });
        } else {
          console.warn(`Unexpected format for line: ${line}`);
        }
      });

      // Fetch commit titles for the found commit hashes
      try {
        const commitTitles = await fetchCommitTitles(Array.from(commitHashes));

        // Assign commit titles to commitInfos
        commitInfos.forEach(info => {
          if (commitTitles.has(info.commitHash)) {
            info.commitTitle = commitTitles.get(info.commitHash) || '';
          }
        });

        resolve(commitInfos);
      } catch (fetchError) {
        reject(`Error fetching commit titles: ${fetchError}`);
      }
    });
  });
}

// Function to fetch commit titles from commit hashes using git log
 function fetchCommitTitles(commitHashes: string[]): Promise<Map<string, string>> {
  return new Promise<Map<string, string>>((resolve, reject) => {
    const gitLogCommand = `git log --format="%H %s" ${commitHashes.join(' ')}`;

    exec(gitLogCommand, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing git log: ${error.message}`);
        return;
      }

      const commitTitles = new Map<string, string>();

      stdout.split('\n').forEach(line => {
        if (line.trim() !== '') {
          const [commitHash, ...titleParts] = line.trim().split(' ');
          const commitTitle = titleParts.join(' ');
          commitTitles.set(commitHash, commitTitle);
        }
      });

      resolve(commitTitles);
    });
  });
}
