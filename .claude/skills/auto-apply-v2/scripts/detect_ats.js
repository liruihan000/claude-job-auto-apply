/**
 * ATS Platform Detection Script
 *
 * Run via mcp__Claude_in_Chrome__javascript_tool to detect which ATS platform
 * the current page uses. Returns a JSON string with platform info.
 *
 * Usage: Copy this entire script into mcp__Claude_in_Chrome__javascript_tool's code parameter.
 */
(function() {
  const url = window.location.href.toLowerCase();
  const html = document.documentElement.innerHTML.slice(0, 50000); // first 50k chars

  const detectors = [
    {
      name: 'workday',
      label: 'Workday',
      urlPatterns: ['myworkdayjobs.com', '.wd1.', '.wd5.', '.wd3.', 'workday.com/'],
      domSignals: () => !!document.querySelector('[data-automation-id]') || html.includes('workday')
    },
    {
      name: 'greenhouse',
      label: 'Greenhouse',
      urlPatterns: ['greenhouse.io', 'boards.greenhouse'],
      domSignals: () => !!document.querySelector('#grnhse_app') || html.includes('greenhouse')
    },
    {
      name: 'lever',
      label: 'Lever',
      urlPatterns: ['jobs.lever.co', 'lever.co/'],
      domSignals: () => !!document.querySelector('.lever-application') || html.includes('lever-application')
    },
    {
      name: 'icims',
      label: 'iCIMS',
      urlPatterns: ['icims.com', '.icims.'],
      domSignals: () => !!document.querySelector('.iCIMS') || html.includes('icims')
    },
    {
      name: 'sap_sf',
      label: 'SAP SuccessFactors',
      urlPatterns: ['sapsf.com', 'successfactors.com', 'career41.sapsf'],
      domSignals: () => html.includes('successfactors') || html.includes('sapsf')
    },
    {
      name: 'smartrecruiters',
      label: 'SmartRecruiters',
      urlPatterns: ['smartrecruiters.com'],
      domSignals: () => html.includes('smartrecruiters')
    },
    {
      name: 'jobvite',
      label: 'Jobvite',
      urlPatterns: ['jobvite.com', '.jobvite.'],
      domSignals: () => html.includes('jobvite')
    },
    {
      name: 'ashby',
      label: 'Ashby',
      urlPatterns: ['ashbyhq.com', 'jobs.ashby'],
      domSignals: () => html.includes('ashbyhq')
    },
    {
      name: 'breezy',
      label: 'Breezy HR',
      urlPatterns: ['breezy.hr'],
      domSignals: () => html.includes('breezy')
    },
    {
      name: 'jazzhr',
      label: 'JazzHR',
      urlPatterns: ['applytojob.com', 'jazz.co'],
      domSignals: () => html.includes('jazzhr') || html.includes('applytojob')
    },
    {
      name: 'indeed',
      label: 'Indeed',
      urlPatterns: ['indeed.com', 'm5.apply.indeed'],
      domSignals: () => html.includes('indeed')
    },
    {
      name: 'linkedin',
      label: 'LinkedIn',
      urlPatterns: ['linkedin.com/jobs'],
      domSignals: () => html.includes('linkedin')
    },
    {
      name: 'taleo',
      label: 'Oracle Taleo',
      urlPatterns: ['taleo.net', 'oracle.com/careers'],
      domSignals: () => html.includes('taleo')
    }
  ];

  // Check URL patterns first (most reliable)
  for (const d of detectors) {
    for (const pattern of d.urlPatterns) {
      if (url.includes(pattern)) {
        return JSON.stringify({
          platform: d.name,
          label: d.label,
          method: 'url_match',
          url: window.location.href,
          requiresAccount: ['workday', 'sap_sf', 'icims', 'taleo'].includes(d.name),
          difficulty: ['indeed', 'lever'].includes(d.name) ? 'easy' :
                     ['greenhouse', 'ashby'].includes(d.name) ? 'medium' : 'hard'
        });
      }
    }
  }

  // Fallback: check DOM signals
  for (const d of detectors) {
    try {
      if (d.domSignals()) {
        return JSON.stringify({
          platform: d.name,
          label: d.label,
          method: 'dom_signal',
          url: window.location.href,
          requiresAccount: ['workday', 'sap_sf', 'icims', 'taleo'].includes(d.name),
          difficulty: ['indeed', 'lever'].includes(d.name) ? 'easy' :
                     ['greenhouse', 'ashby'].includes(d.name) ? 'medium' : 'hard'
        });
      }
    } catch(e) {}
  }

  return JSON.stringify({
    platform: 'unknown',
    label: 'Unknown / Custom',
    method: 'none',
    url: window.location.href,
    requiresAccount: true,
    difficulty: 'unknown'
  });
})()
