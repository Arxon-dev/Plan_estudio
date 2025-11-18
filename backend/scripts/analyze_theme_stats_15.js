const fs = require('fs');

async function main() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLm9wb21lbGlsbGFAZ21haWwuY29tIiwiaWF0IjoxNzYzMzUwOTIxLCJleHAiOjE3NjM5NTU3MjF9.RGHxloiQjDc1M8CTCz7hN7eVYM_7O8';
    const base = 'http://localhost:3000/api';
    const headers = { Authorization: `Bearer ${token}` };

    const activeRes = await fetch(`${base}/study-plans/active`, { headers });
    const active = await activeRes.json();
    const plan = active.plan;
    if (!plan) {
      console.log('No hay plan activo');
      return;
    }

    const sessRes = await fetch(`${base}/study-plans/${plan.id}/sessions`, { headers });
    const sessData = await sessRes.json();
    const sessions = sessData.sessions || [];

    const classify = (s) => {
      if (s.sessionType) return s.sessionType;
      const n = (s.notes || '').toUpperCase();
      if (n.includes('REVIEW') || n.includes('REPASO')) return 'REVIEW';
      if (n.includes('TEST')) return 'TEST';
      if (n.includes('SIMULATION') || n.includes('SIMULACRO')) return 'SIMULATION';
      return 'STUDY';
    };

    const byTheme = new Map();
    for (const s of sessions) {
      const key = s.themeId;
      if (!byTheme.has(key)) byTheme.set(key, { themeId: key, title: s.theme?.title || `Tema ${s.themeId}`, block: s.theme?.block || '', study: 0, review: 0, test: 0, total: 0, dates: [], types: [] });
      const rec = byTheme.get(key);
      const t = classify(s);
      if (t === 'STUDY') rec.study++;
      else if (t === 'REVIEW') rec.review++;
      else if (t === 'TEST') rec.test++;
      rec.total++;
      rec.dates.push(new Date(s.scheduledDate));
      rec.types.push(t);
    }

    const stats = [];
    for (const rec of byTheme.values()) {
      const reviewDates = [];
      for (const s of sessions) {
        if (s.themeId === rec.themeId && classify(s) === 'REVIEW') {
          reviewDates.push(new Date(s.scheduledDate));
        }
      }
      reviewDates.sort((a,b)=>a-b);
      let avgGap = null;
      if (reviewDates.length >= 2) {
        let sum = 0;
        for (let i=1;i<reviewDates.length;i++) sum += Math.floor((reviewDates[i]-reviewDates[i-1])/86400000);
        avgGap = +(sum / (reviewDates.length-1)).toFixed(2);
      }
      stats.push({ themeId: rec.themeId, block: rec.block, title: rec.title, study: rec.study, review: rec.review, test: rec.test, total: rec.total, avgReviewGapDays: avgGap });
    }

    const mean = (arr) => arr.reduce((s,x)=>s+x,0)/arr.length;
    const sd = (arr) => { const m = mean(arr); return Math.sqrt(mean(arr.map(x => (x-m)*(x-m)))); };

    const totals = stats.map(s => s.total);
    const reviews = stats.map(s => s.review);

    const global = {
      planId: plan.id,
      themesCount: stats.length,
      meanTotalSessionsPerTheme: +mean(totals).toFixed(2),
      stdTotalSessionsPerTheme: +sd(totals).toFixed(2),
      meanReviewsPerTheme: +mean(reviews).toFixed(2),
      stdReviewsPerTheme: +sd(reviews).toFixed(2)
    };

    stats.sort((a,b)=> a.block.localeCompare(b.block) || a.themeId - b.themeId);
    const lines = ['themeId,block,title,study,review,test,total,avgReviewGapDays'];
    for (const s of stats) {
      const row = [s.themeId, s.block, '"'+s.title.replace(/"/g,'""')+'"', s.study, s.review, s.test, s.total, (s.avgReviewGapDays??'')].join(',');
      lines.push(row);
    }

    const outCsv = `backend/tema_stats_plan_${plan.id}.csv`;
    fs.writeFileSync(outCsv, lines.join('\n'), 'utf8');

    const topMore = [...stats].sort((a,b)=>b.total-a.total).slice(0,5);
    const topLess = [...stats].sort((a,b)=>a.total-b.total).slice(0,5);

    console.log(JSON.stringify({ global, outCsv, topMore, topLess }, null, 2));
  } catch (e) {
    console.log('Error:', e.message);
  }
}

main();