const fs = require('fs');

function parseTrackerFile(filePath) {
  if (!fs.existsSync(filePath)) return { activeWos: [], archiveWos: [], sourceOfTruthLine: '' };

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let currentSection = 'GLOBAL';
  const activeWos = [];
  const archiveWos = [];
  let sourceOfTruthLine = '';

  const headerRegex = /^##\s+(.+)$/;
  let parseHeaders = null;
  let inTable = false;
  let inActiveQueue = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('Sources of truth:') && !sourceOfTruthLine) {
      sourceOfTruthLine = line;
    }
    
    if (line === '<!-- CURRENT_QUEUE_START -->') {
      inActiveQueue = true;
      continue;
    }
    if (line === '<!-- CURRENT_QUEUE_END -->') {
      inActiveQueue = false;
      continue;
    }
    
    const hMatch = line.match(headerRegex);
    if (hMatch) {
      currentSection = hMatch[1].replace(/—.*$/, '').trim();
      if (!currentSection.includes('WOs') && !currentSection.includes('QUEUE') && !currentSection.includes('OPERATION BREAKOUT')) {
        currentSection = hMatch[1].trim(); 
      }
      inTable = false;
      parseHeaders = null;
      continue;
    }

    if (line.startsWith('|') && line.endsWith('|')) {
      const cols = line.split('|').map(s => s.trim()).slice(1, -1);
      if (cols.every(c => c.replace(/-/g, '').length === 0)) continue;
      
      if (!parseHeaders) {
        parseHeaders = cols.map(c => c.toLowerCase());
        inTable = true;
        continue;
      }
      
      if (inTable) {
        const row = {};
        for (let j = 0; j < Math.min(cols.length, parseHeaders.length); j++) {
          row[parseHeaders[j]] = cols[j];
        }
        
        const priority = currentSection || 'UNASSIGNED';
        const id = row['id'] || row['wo'] || row['task id'] || '-';
        const title = row['task'] || row['scope'] || row['description'] || '-';
        
        let status = row['status'] || 'OPEN';
        status = status.toUpperCase();
        let normalizedStatus = 'OPEN';
        if (status.includes('DONE') || status.includes('COMPLETE')) normalizedStatus = 'COMPLETE';
        else if (status.includes('PARTIAL')) normalizedStatus = 'IN PROGRESS';
        else if (status.includes('BLOCK')) normalizedStatus = 'BLOCKED';
        else if (status.includes('REVIEW')) normalizedStatus = 'READY FOR REVIEW';
        
        const owner = row['owner'] || row['assigned'] || 'Unassigned';
        const blocker = row['blocks'] || row['dependency'] || '—';
        const evidence = row['proof pack'] || row['evidence'] || row['artifacts'] || '—';
        
        if (id && id !== '-') {
          const woObj = {
            priority,
            id,
            title: title.replace(/\|/g, '-').trim(),
            status: normalizedStatus,
            owner,
            blocker,
            evidence,
            nextAction: normalizedStatus === 'COMPLETE' ? 'None' : (normalizedStatus === 'BLOCKED' ? 'Resolve blocker' : 'Execute')
          };
          
          if (inActiveQueue) {
            activeWos.push(woObj);
          } else {
            archiveWos.push(woObj);
          }
        }
      }
    } else {
      inTable = false;
      parseHeaders = null;
    }
  }
  return { activeWos, archiveWos, sourceOfTruthLine };
}

const data = parseTrackerFile('docs/build_tracker.md');
const activeWos = data.activeWos;
const archiveWos = data.archiveWos;
const activeSotLine = data.sourceOfTruthLine;

// FORMAT MARKDOWN FOR ACTIVE
let md = `> "${activeSotLine}"\n\n`;

md += `### Current Queue Snapshot (ACTIVE_BACKLOG)\n\n`;
md += `| Priority / Lane | WO ID | Title / Problem | Status | Owner | Blocker | Evidence Link | Next Action |\n`;
md += `|---|---|---|---|---|---|---|---|\n`;

let openCount = 0;
let blockedCount = 0;
let reviewCount = 0;
let completeCount = 0;

const topWos = [];
const criticalBlockers = [];

for (const wo of activeWos) {
  if (wo.status === 'OPEN' || wo.status === 'IN PROGRESS') openCount++;
  else if (wo.status === 'BLOCKED') blockedCount++;
  else if (wo.status === 'READY FOR REVIEW') reviewCount++;
  else if (wo.status === 'COMPLETE') completeCount++;
  
  if (wo.status === 'BLOCKED') criticalBlockers.push(wo.id + ': ' + wo.blocker);
  if ((wo.status === 'OPEN' || wo.status === 'IN PROGRESS') && topWos.length < 10) {
    topWos.push(wo.id + ' (' + wo.priority + ')');
  }

  md += `| ${wo.priority} | ${wo.id} | ${wo.title.substring(0, 100)}${wo.title.length > 100 ? '...' : ''} | ${wo.status} | ${wo.owner} | ${wo.blocker} | ${wo.evidence} | ${wo.nextAction} |\n`;
}

md += `\n### 🔝 Top 10 Next WOs by Impact (CURRENT QUEUE)\n`;
topWos.forEach((wo, i) => md += `${i + 1}. ${wo}\n`);

md += `\n### 🛑 Critical Blockers (CURRENT QUEUE)\n`;
if (criticalBlockers.length === 0) md += `None tracking currently.\n`;
else criticalBlockers.forEach(b => md += `- ${b}\n`);

// FORMAT MARKDOWN FOR FULL BACKLOG SUMMARY
const allWos = [...activeWos, ...archiveWos];
md += `\n---\n\n### 🗄️ Full Backlog Summary (including NON-EXECUTION history)\n\n`;
let fullOpen = 0, fullBlocked = 0, fullReview = 0, fullComplete = 0;
const fullThemes = {};

for (const wo of allWos) {
  if (wo.status === 'OPEN' || wo.status === 'IN PROGRESS') fullOpen++;
  else if (wo.status === 'BLOCKED') fullBlocked++;
  else if (wo.status === 'READY FOR REVIEW') fullReview++;
  else if (wo.status === 'COMPLETE') fullComplete++;
  
  fullThemes[wo.priority] = (fullThemes[wo.priority] || 0) + 1;
}

md += `| Status | Count |\n|---|---|\n`;
md += `| OPEN/IN-PROGRESS | ${fullOpen} |\n`;
md += `| BLOCKED | ${fullBlocked} |\n`;
md += `| READY FOR REVIEW | ${fullReview} |\n`;
md += `| COMPLETE | ${fullComplete} |\n`;
md += `| **TOTAL WOs IN FILE** | **${allWos.length}** |\n`;

md += `\n#### Top 10 Themes in File\n`;
Object.entries(fullThemes)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([theme, count], i) => md += `${i + 1}. ${theme} (${count} WOs)\n`);

fs.writeFileSync('/tmp/snapshot.md', md);
