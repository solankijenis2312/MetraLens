lucide.createIcons();

const overviewPage = document.querySelector('#overviewPage');
const scanPage = document.querySelector('#scanPage');
const workflowPage = document.querySelector('#workflowPage');
const breadcrumbCurrent = document.querySelector('#breadcrumbCurrent');
const sidebar = document.querySelector('#sidebar');
const loginScreen = document.querySelector('#loginScreen');
const loginForm = document.querySelector('#loginForm');
const registrationForm = document.querySelector('#registrationForm');
let selectedFiles = [];
let scanStage = 'capture';
let cameraStream = null;
let repositoryTab = 'declarations';
let historyFilter = 'all';

function resetSelectedFiles() {
  selectedFiles = [];
}
let currentRole = '';
let currentUserName = 'Jay Chauhan';
let currentUserEmail = 'jay.chauhan@aletheia.gov.in';
let featureScope = 'full-compliance';
let ocrLanguage = 'eng+hin';
let scanHistory = [];
let notificationItems = [
  { title: 'High priority review', detail: 'SunPure Cooking Oil needs your attention.', icon: 'triangle-alert', tone: 'coral', unread: true, time: '8 min ago' },
  { title: 'Report ready', detail: 'Nilgiri Gold Tea report is ready to download.', icon: 'file-check-2', tone: 'blue', unread: false, time: 'Yesterday' }
];
let notificationPollingTimer = null;
let inspectionStatusSnapshot = new Map();
let inspectionSnapshotReady = false;

const sanitizePhoneValue = (value) => value.replace(/\D/g, '').slice(0, 10);
function setPasswordVisibility(button, input, show) {
  input.type = show ? 'text' : 'password';
  button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  button.dataset.visible = String(show);
  const icon = button.querySelector('svg');
  if (icon) {
    icon.setAttribute('data-lucide', show ? 'eye-off' : 'eye');
    lucide.createIcons();
  }
}
let rulesLibraryFiles = [
  { name: 'The Legal Metrology Act, 2009.pdf', sizeLabel: 'Reference document', url: 'the-legal-metrology-act,-2009.pdf' },
  { name: 'The Legal Metrology (Packaged Commodities) Rules, 2011.pdf', sizeLabel: 'Reference document', url: '9%20The%20Legal%20Metrology%20(Package%20Commodities)%20Rules,%202011.pdf' }
];
const roleMenus = {
  'Enforcement officer': {
    items: [
      ['overview', 'layout-dashboard', 'Overview'],
      ['scan', 'scan-line', 'Scan product'],
      ['repository', 'archive', 'Product repository'],
      ['reports', 'file-check-2', 'Reports'],
      ['history', 'history', 'Inspection history'],
      ['analytics', 'chart-no-axes-combined', 'Analytics'],
      ['documentation', 'book-open', 'Technical documentation']
    ],
    management: [
      ['team', 'users', 'Inspection team'],
      ['settings', 'settings-2', 'Settings']
    ]
  },
  'Senior inspector': {
    items: [
      ['overview', 'layout-dashboard', 'Review dashboard'],
      ['repository', 'clipboard-check', 'Review queue'],
      ['scan', 'scan-line', 'Scan product'],
      ['reports', 'file-check-2', 'Reports'],
      ['history', 'history', 'Inspection history'],
      ['analytics', 'chart-no-axes-combined', 'Compliance analytics'],
      ['documentation', 'book-open', 'Technical documentation']
    ],
    management: [
      ['team', 'users', 'Inspection team'],
      ['settings', 'settings-2', 'Settings']
    ]
  },
  'Field inspector': {
    items: [
      ['overview', 'layout-dashboard', 'Field dashboard'],
      ['scan', 'scan-line', 'Capture inspection'],
      ['repository', 'archive', 'Evidence repository'],
      ['history', 'history', 'My inspections'],
      ['reports', 'file-check-2', 'Reports'],
      ['analytics', 'chart-no-axes-combined', 'Analytics'],
      ['documentation', 'book-open', 'Technical documentation']
    ],
    management: [
      ['team', 'users', 'Inspection team'],
      ['settings', 'settings-2', 'Settings']
    ]
  },
  Administrator: {
    items: [
      ['overview', 'layout-dashboard', 'Operations overview'],
      ['scan', 'scan-line', 'Scan product'],
      ['repository', 'archive', 'Product repository'],
      ['reports', 'file-check-2', 'Reports'],
      ['history', 'history', 'Inspection history'],
      ['analytics', 'chart-no-axes-combined', 'Analytics'],
      ['documentation', 'book-open', 'Technical documentation']
    ],
    management: [
      ['team', 'users', 'Manage team'],
      ['settings', 'settings-2', 'Settings']
    ]
  }
};
const roleTasks = {
  'Senior inspector': { label: 'SENIOR INSPECTOR TASKS', title: 'Review priority cases', copy: 'Triage flagged inspections, approve findings and monitor compliance trends.', action: 'repository', button: 'Open review queue', icon: 'clipboard-check' },
  'Field inspector': { label: 'FIELD INSPECTOR TASKS', title: 'Capture today\'s evidence', copy: 'Scan labels in the field, attach clear evidence and submit inspections for review.', action: 'scan', button: 'Start field inspection', icon: 'camera' },
  Administrator: { label: 'ADMINISTRATOR TASKS', title: 'Keep operations moving', copy: 'Monitor team activity, review workspace performance and manage access.', action: 'team', button: 'Manage inspection team', icon: 'users' }
};
let teamMembers = [
  { name: 'Arjun Sharma', role: 'Enforcement officer', scans: 248, status: 'Active', lastActive: '2 min ago' },
  { name: 'Meera Joshi', role: 'Senior inspector', scans: 186, status: 'Active', lastActive: '18 min ago' },
  { name: 'Kabir Singh', role: 'Field inspector', scans: 94, status: 'Away', lastActive: '1 hr ago' }
];
let inspectionData = {
  productName: 'Scanned product',
  commonNameOfCommodity: 'Not detected',
  quantity: 'Not detected',
  manufacturer: 'Not detected',
  manufacturerAddress: 'Not detected',
  originCountry: 'Not detected',
  mrp: 'Not detected',
  unitSalePrice: 'Not detected',
  manufactureDate: 'Not detected',
  expiryDate: 'Not detected',
  shelfLife: 'Not detected',
  care: 'Not detected',
  rawText: '',
  score: 0,
  status: 'Review needed',
  findings: []
};

const refreshIcons = () => lucide.createIcons();
const registrationStorageKey = 'metraLensRegistrationComplete';
const activityRanges = {
  21: { values: [38, 52, 45, 68, 57, 82, 76], labels: ['Aug 27', 'Aug 31', 'Sep 04', 'Sep 08', 'Sep 11', 'Sep 14', 'Sep 16'] },
  30: { values: [32, 43, 37, 58, 51, 66, 61], labels: ['Aug 18', 'Aug 24', 'Aug 30', 'Sep 05', 'Sep 10', 'Sep 13', 'Sep 16'] },
  60: { values: [24, 31, 28, 42, 39, 54, 49], labels: ['Jul 19', 'Jul 29', 'Aug 08', 'Aug 18', 'Aug 28', 'Sep 07', 'Sep 16'] }
};
const recentInspectionDetails = {
  everclean: { productName: 'EverClean Detergent', quantity: '2 L', status: 'Compliant', score: 96, inspector: 'Arjun Sharma', date: 'Today, 10:42 AM' },
  nilgiri: { productName: 'Nilgiri Gold Tea', quantity: '250 g', status: 'Review needed', score: 86, inspector: 'Meera Joshi', date: 'Today, 09:18 AM' },
  sunpure: { productName: 'SunPure Cooking Oil', quantity: '1 L', status: 'Non-compliant', score: 78, inspector: 'Arjun Sharma', date: 'Yesterday, 04:26 PM' }
};
function updateActivityChart(range) {
  const chartData = activityRanges[range] || activityRanges[30];
  const points = chartData.values.map((value, index) => ({
    x: Math.round(index * (650 / (chartData.values.length - 1))),
    y: Math.round(190 - (value / 100) * 155)
  }));
  const linePath = points.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ');
  const areaPath = `${linePath} L650,220 L0,220 Z`;
  document.querySelector('#activityLine')?.setAttribute('d', linePath);
  document.querySelector('#activityArea')?.setAttribute('d', areaPath);
  const point = points[points.length - 1];
  document.querySelector('#activityPoint')?.setAttribute('cx', point.x);
  document.querySelector('#activityPoint')?.setAttribute('cy', point.y);
  document.querySelectorAll('#activityAxis span').forEach((label, index) => {
    label.textContent = chartData.labels[index];
  });
}
function getInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'JC';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'JC';
}
function applyUserProfile(name, email) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim();
  if (!cleanName && !cleanEmail) return;
  currentUserName = cleanName;
  currentUserEmail = cleanEmail || currentUserEmail;

  const initials = getInitials(currentUserName || 'Jay Chauhan');

  document.querySelectorAll('.avatar, .top-avatar').forEach((element) => {
    element.textContent = initials;
  });

  const profileName = document.querySelector('#profileName');
  if (profileName) profileName.textContent = currentUserName || 'Jay Chauhan';
  const accountName = document.querySelector('.account-popover-head strong');
  if (accountName) accountName.textContent = currentUserName || 'Jay Chauhan';
  const overviewHeading = document.querySelector('#overviewPage .page-heading h1');
  if (overviewHeading) overviewHeading.textContent = `Welcome, ${currentUserName || 'Jay Chauhan'}.`;
  const welcomeText = document.querySelector('#profileName');
  if (welcomeText) welcomeText.textContent = currentUserName || 'Jay Chauhan';
  const accountEmail = document.querySelector('.account-detail strong');
  if (accountEmail) accountEmail.textContent = currentUserEmail;

  if (document.querySelector('#loginEmail')) {
    document.querySelector('#loginEmail').value = currentUserEmail;
  }

  if (cleanName) {
    localStorage.setItem('metraLensUserName', cleanName);
  }
  if (cleanEmail) {
    localStorage.setItem('metraLensUserEmail', cleanEmail);
  }
}

function renderRoleNavigation() {
  const menu = roleMenus[currentRole] || roleMenus['Enforcement officer'];
  const itemMarkup = (item) => `<button class="nav-item${item[0] === 'overview' ? ' active' : ''}" data-page="${item[0]}"><i data-lucide="${item[1]}"></i><span>${item[2]}</span>${item[3] ? `<b class="nav-badge">${item[3]}</b>` : ''}</button>`;
  document.querySelector('#mainNav').innerHTML = `<p class="nav-label">Workspace</p>${menu.items.map(itemMarkup).join('')}<p class="nav-label second">Management</p>${menu.management.map(itemMarkup).join('')}`;
  document.querySelector('#profileRole').textContent = currentRole || 'Enforcement officer';
  refreshIcons();
}
function renderRoleTasks() {
  const task = roleTasks[currentRole];
  const existing = document.querySelector('#roleTaskPanel');
  if (existing) existing.remove();
  if (!task) return;
  const heading = overviewPage.querySelector('.page-heading');
  if (!heading) return;
  heading.insertAdjacentHTML('afterend', `<div class="role-task-panel" id="roleTaskPanel"><div class="role-task-icon"><i data-lucide="${task.icon}"></i></div><div><p class="eyebrow">${task.label}</p><h2>${task.title}</h2><p>${task.copy}</p></div><button class="secondary-btn" data-action="${task.action}">${task.button}<i data-lucide="arrow-right"></i></button></div>`);
  refreshIcons();
}
function notify(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.querySelector('span').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
function renderNotifications() {
  const list = document.querySelector('#notificationList');
  const badge = document.querySelector('.notification-trigger em');
  if (!list || !badge) return;
  const unreadCount = notificationItems.filter((item) => item.unread).length;
  badge.classList.toggle('hidden', unreadCount === 0);
  badge.setAttribute('aria-label', `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`);
  list.innerHTML = notificationItems.length
    ? notificationItems.slice(0, 12).map((item) => `<div class="notification-item${item.unread ? ' unread' : ''}"><span class="notification-icon ${item.tone || 'blue'}"><i data-lucide="${item.icon || 'bell'}"></i></span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small><time>${escapeHtml(item.time || 'Just now')}</time></div></div>`).join('')
    : '<div class="empty-state">You are all caught up.</div>';
  refreshIcons();
}
function addNotification(title, detail, options = {}) {
  notificationItems.unshift({ title, detail, icon: options.icon || 'bell', tone: options.tone || 'blue', unread: true, time: 'Just now' });
  renderNotifications();
}
function showAuthForm(form) {
  loginForm.classList.toggle('hidden', form !== loginForm);
  registrationForm.classList.toggle('hidden', form !== registrationForm);
  loginScreen.classList.toggle('registration-active', form === registrationForm);
}
if (localStorage.getItem(registrationStorageKey) === 'true') showAuthForm(loginForm);
const savedUserName = localStorage.getItem('metraLensUserName');
const savedUserEmail = localStorage.getItem('metraLensUserEmail');
if (savedUserName) {
  applyUserProfile(savedUserName, savedUserEmail || currentUserEmail);
} else {
  applyUserProfile(currentUserName, currentUserEmail);
}
function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}
function closeCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  document.querySelector('#cameraVideo').srcObject = null;
  document.querySelector('#cameraModal').classList.add('hidden');
  document.querySelector('#takePhoto').disabled = true;
}
async function openCamera() {
  const modal = document.querySelector('#cameraModal');
  const video = document.querySelector('#cameraVideo');
  const status = document.querySelector('#cameraStatus');
  const takePhotoButton = document.querySelector('#takePhoto');
  modal.classList.remove('hidden');
  status.textContent = 'Requesting camera access...';
  takePhotoButton.disabled = true;
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is not available in this browser.');
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    video.srcObject = cameraStream;
    await video.play();
    if (!video.videoWidth) {
      await new Promise((resolve) => video.addEventListener('loadedmetadata', resolve, { once: true }));
    }
    status.textContent = 'Camera ready. Align the label and capture.';
    takePhotoButton.disabled = false;
  } catch (error) {
    status.textContent = error.name === 'NotAllowedError' ? 'Camera permission was blocked. Allow access and try again.' : error.message;
    takePhotoButton.disabled = true;
    notify('Camera access could not be started');
  }
}
function takePhoto() {
  const video = document.querySelector('#cameraVideo');
  const canvas = document.querySelector('#cameraCanvas');
  if (!cameraStream || !video.videoWidth) {
    notify('Wait for the camera preview to become ready');
    return;
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob((blob) => {
    if (!blob) return;
    selectedFiles = [new File([blob], 'camera-label.jpg', { type: 'image/jpeg' })];
    closeCamera();
    renderScan();
    notify('Camera photo added to the inspection');
  }, 'image/jpeg', .92);
}
function evaluateFontReadability(sourceText, words = []) {
  const heights = (words || [])
    .map((word) => (word && word.bbox && Number.isFinite(word.bbox.y1) && Number.isFinite(word.bbox.y0) ? word.bbox.y1 - word.bbox.y0 : null))
    .filter((height) => Number.isFinite(height) && height > 0);
  if (!heights.length) {
    return { readable: true, value: 'Readable', reason: 'No OCR word sizing data available.' };
  }
  const averageHeight = heights.reduce((total, height) => total + height, 0) / heights.length;
  const medianHeight = [...heights].sort((a, b) => a - b)[Math.floor(heights.length / 2)] || averageHeight;
  const readable = medianHeight >= 12 && averageHeight >= 10 && sourceText.trim().length > 20;
  return {
    readable,
    value: readable ? 'Readable' : 'Not readable',
    reason: readable ? 'Text is sufficiently large and readable.' : `Text is too small to read reliably (average height ${Math.round(averageHeight)}px, median ${Math.round(medianHeight)}px).`,
    averageHeight: Math.round(averageHeight),
    medianHeight: Math.round(medianHeight)
  };
}
function extractInspectionData(text) {
  const correctedText = text
    .replace(/[|]/g, 'I')
    .replace(/\b(m|n)rp\b/gi, 'mrp')
    .replace(/m\s*[.·,]?\s*r\s*[.·,]?\s*p/gi, 'mrp')
    .replace(/\b(qty|qnty|qtu)\b/gi, 'quantity')
    .replace(/\b(net\s*w[gt]|net\s*wt)\b/gi, 'net quantity')
    .replace(/\b(manufactur|manufactuer|manufatur)\b/gi, 'manufacturer')
    .replace(/\b(orig[i1]n|or[il]gin)\b/gi, 'origin')
    .replace(/\b(rupe[e3]s|r[s5])\b/gi, 'rs');
  const lines = correctedText.split(/\r?\n/).map((line) => line.replace(/[^\w\s%./():&,-]/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
  const normalizedText = correctedText
    .replace(/₹/g, ' rs ')
    .replace(/\binr\b/gi, ' rs ')
    .replace(/\b(?:m)\s*\.?\s*r\s*\.?\s*p\b/gi, ' mrp ')
    .replace(/\bmaximum\s+retail\s+price\b/gi, ' mrp ')
    .replace(/\s+/g, ' ')
    .trim();
  const ignored = /^(mrp|maximum retail price|net quantity|manufactured|manufactured by|packed|batch|expiry|best before|customer care|www\.|scan|barcode|ingredients|directions|warning|contents?|country of origin|made in|unit sale price)\b/i;
  const productName = lines.find((line) => line.length >= 3 && /[a-z]/i.test(line) && !ignored.test(line)) || 'Scanned product';
  const quantityMatch = normalizedText.match(/(?:net\s*(?:qty|quantity)?|contents?)?\s*(\d+(?:\.\d+)?)\s*(kg|g|mg|l|ml|pcs?|units?)\b/i) || text.match(/(?:net\s*(?:qty|quantity)?|contents?)?\s*(\d+(?:\.\d+)?)\s*(kg|g|mg|l|ml|pcs?|units?)\b/i);
  const findValue = (pattern, source = normalizedText) => {
    const match = source.match(pattern) || text.match(pattern);
    return match ? match[1].replace(/\s+/g, ' ').trim() : 'Not detected';
  };
  const findLineValue = (patterns) => {
    const line = lines.find((candidate) => patterns.some((pattern) => pattern.test(candidate)));
    if (!line) return 'Not detected';
    const value = line.replace(new RegExp(`^.*?(?:${patterns.map((pattern) => pattern.source).join('|')})\\s*[:.-]?\\s*`, 'i'), '').trim();
    return value && value.length > 1 ? value : 'Not detected';
  };
  const extractPrice = (value) => {
    if (!value || value === 'Not detected') return 'Not detected';
    const cleaned = value.replace(/[^0-9.]+/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned || 'Not detected';
  };
  const mrpValue = (() => {
    const directPatterns = [
      /(?:mrp|maximum\s+retail\s+price|m\s*\.?\s*r\s*\.?\s*p)\s*(?:in\s*(?:rupees|rs|inr))?\s*[:.-]?\s*(?:rs\.?|inr|rupees|₹)?\s*([0-9]+(?:[.,][0-9]+)?)/i,
      /(?:rs\.?|inr|rupees|₹)\s*([0-9]+(?:[.,][0-9]+)?)(?:\s*(?:only|\/\-))?/i,
      /m\s*r\s*p\s*(?:[:.-])?\s*([0-9]+(?:[.,][0-9]+)?)/i
    ];
    for (const pattern of directPatterns) {
      const match = normalizedText.match(pattern) || text.match(pattern);
      if (match && match[1]) return extractPrice(match[1]);
    }
    const mrpLine = lines.find((line) => /(?:mrp|maximum\s+retail\s+price|m\s*\.?\s*r\s*\.?\s*p)/i.test(line));
    if (mrpLine) {
      const lineMatch = mrpLine.match(/(?:rs\.?|inr|rupees|₹)?\s*([0-9]+(?:[.,][0-9]+)?)/i);
      if (lineMatch && lineMatch[1]) return extractPrice(lineMatch[1]);
    }
    return 'Not detected';
  })();
  const lineMrp = lines.find((line) => /\bmrp\b|maximum\s+retail/i.test(line));
  const fallbackMrp = lineMrp?.match(/(?:mrp|maximum\s+retail(?:\s+price)?)\D{0,12}(\d{2,6}(?:[.,]\d{1,2})?)/i)?.[1];
  const resolvedMrp = mrpValue === 'Not detected' && fallbackMrp ? extractPrice(fallbackMrp) : mrpValue;
  const unitSalePriceValue = findValue(/(?:unit\s+sale\s+price|price\s+per\s+(?:kg|g|l|ml|unit|piece))\s*[:.-]?\s*(?:rs\.?|inr|rupees|₹)?\s*([0-9]+(?:[.,][0-9]+)?(?:\s*\/\s*(?:kg|g|l|ml|unit|piece))?)/i);
  const datePattern = '(\\d{1,2}[/-]\\d{2,4}|\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\s+\\d{4})';
  const parseLabelDate = (value) => {
    if (!value || value === 'Not detected') return null;
    const normalized = value.trim().replace(/[-.]/g, '/');
    const monthYear = normalized.match(/^(\d{1,2})\/(\d{4})$/);
    if (monthYear) return new Date(Number(monthYear[2]), Number(monthYear[1]) - 1, 1);
    const numeric = normalized.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (numeric) {
      const first = Number(numeric[1]);
      const second = Number(numeric[2]);
      const year = Number(numeric[3] || numeric[2]);
      const fullYear = year < 100 ? 2000 + year : year;
      return numeric[3] ? new Date(fullYear, second - 1, first) : new Date(fullYear, first - 1, 1);
    }
    const parsed = new Date(`1 ${normalized}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const formatLabelDate = (date) => date ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}` : 'Not detected';
  const manufactureDate = findValue(new RegExp(`(?:mfg|manufactured|manufacturing|date\\s+of\\s+(?:mfg|manufacture|manufacturing)|packed|packaged)\\s*(?:date)?[^\\n]*?(${datePattern})`, 'i'));
  const expiryDate = findValue(new RegExp(`(?:exp|expiry|expiration|use\\s+before|best\\s+before)[^\\n]*?(${datePattern})`, 'i'));
  const shelfLifeMatch = text.match(/(?:shelf\s*life|best\s+before)\s*[:.-]?\s*(\d+(?:\.\d+)?)\s*(months?|years?)/i) || text.match(/(\d+(?:\.\d+)?)\s*(months?|years?)\s+from\s+(?:the\s+)?(?:date\s+of\s+)?manufactur(?:e|ing)/i);
  const shelfLife = shelfLifeMatch ? `${shelfLifeMatch[1]} ${shelfLifeMatch[2]}` : 'Not detected';
  const manufactureDateObject = parseLabelDate(manufactureDate);
  let calculatedExpiryDate = expiryDate;
  if (calculatedExpiryDate === 'Not detected' && manufactureDateObject && shelfLifeMatch) {
    const amount = Number(shelfLifeMatch[1]) * (/year/i.test(shelfLifeMatch[2]) ? 12 : 1);
    const expiry = new Date(manufactureDateObject);
    expiry.setMonth(expiry.getMonth() + amount);
    const monthYearOnly = /^\d{1,2}[/-]\d{4}$/.test(manufactureDate.trim());
    const formattedExpiry = monthYearOnly ? `${String(expiry.getMonth() + 1).padStart(2, '0')}/${expiry.getFullYear()}` : formatLabelDate(expiry);
    calculatedExpiryDate = `${formattedExpiry} (calculated from ${shelfLife})`;
  }
  const dates = manufactureDate === 'Not detected' && calculatedExpiryDate === 'Not detected' ? 'Not detected' : `Manufactured: ${manufactureDate}; Expiry: ${calculatedExpiryDate}`;
  const commonNameMatch = text.match(/(?:common\s+name(?:\s+of\s+(?:the\s+)commodity)?|product\s*type|category|type\s*of\s*product)\s*[:.-]?\s*([^\n]+)/i);
  const commonNameOfCommodity = commonNameMatch ? commonNameMatch[1].trim() : (text.match(/detergent|tea|cooking\s+oil|edible\s+oil|food|beverage|cosmetic|soap|medicine|snack|spice/i)?.[0] || 'Not detected');
  const quantityFallback = lines.find((line) => /\b(?:net\s+)?(?:quantity|contents?|qty|wt|weight)\b/i.test(line))?.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|mg|l|ml|pcs?|units?)\b/i)?.[0];
  const resolvedQuantity = quantityMatch ? quantityMatch[0].trim() : quantityFallback || 'Not detected';
  const manufacturer = findLineValue([/manufactured\s*by/i, /packed\s*by/i, /manufacturer/i]);
  const manufacturerAddress = findLineValue([/manufacturer\s*address/i, /address/i, /factory/i]);
  const originCountry = findLineValue([/country\s+of\s+origin/i, /made\s+in/i, /product\s+of/i]);
  const data = {
    productName: productName.slice(0, 80),
    commonNameOfCommodity: commonNameOfCommodity.slice(0, 80),
    quantity: resolvedQuantity,
    manufacturer: manufacturer === 'Not detected' ? findLineValue([/manufactured/i, /packed/i]) : manufacturer,
    manufacturerAddress: manufacturerAddress === 'Not detected' ? findLineValue([/address/i, /factory/i]) : manufacturerAddress,
    originCountry: originCountry === 'Not detected' ? findLineValue([/country\s+of\s+origin/i, /made\s+in/i, /origin/i]) : originCountry,
    mrp: resolvedMrp,
    unitSalePrice: unitSalePriceValue,
    manufactureDate,
    expiryDate: calculatedExpiryDate,
    shelfLife,
    dates,
    care: findValue(/(?:customer\s+care|consumer\s+care|care\s*no)[\s:.-]*([^\n]+)/i) === 'Not detected'
      ? findLineValue([/customer\s+care/i, /consumer\s+care/i, /care\s*no/i])
      : findValue(/(?:customer\s+care|consumer\s+care|care\s*no)[\s:.-]*([^\n]+)/i),
    fontSizeReadability: 'Readable',
    rawText: text.trim()
  };
  const checks = [data.manufacturer, data.manufacturerAddress, data.originCountry, data.quantity, data.mrp, data.unitSalePrice, data.commonNameOfCommodity, data.dates, data.care, data.fontSizeReadability];
  const detectedCount = checks.filter((value) => value !== 'Not detected' && value !== 'Not readable').length;
  const missingCount = checks.filter((value) => value === 'Not detected' || value === 'Not readable').length;
  data.score = Math.round((detectedCount / checks.length) * 100);
  data.status = data.score >= 90 ? 'Compliant' : data.score >= 60 ? 'Review needed' : 'Non-compliant';
  data.findings = checks.map((value, index) => ({
    label: ['Manufacturer / packer details', 'Manufacturer address', 'Country of origin', 'Net quantity', 'MRP declaration', 'Unit sale price', 'Common name of commodity', 'Manufacture and expiry dates', 'Consumer care information', 'Font size readability'][index],
    detected: value !== 'Not detected' && value !== 'Not readable',
    value
  }));
  data.reviewRole = data.findings.some((finding) => !finding.detected) ? 'Enforcement officer' : 'Senior inspector';
  data.enforcementAction = data.score < 40 || missingCount >= 6
    ? 'Fine'
    : data.findings.some((finding) => !finding.detected)
      ? 'Notice to manufacturer / manufacturing company'
      : 'No action required';
  return data;
}
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
}
function prepareImageForOcr(file) {
  return loadImage(file).then((image) => {
    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = Math.min(2, Math.max(1, 1800 / longestSide));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const gray = new Uint8Array(canvas.width * canvas.height);
    let brightnessTotal = 0;
    for (let index = 0; index < gray.length; index += 1) {
      const offset = index * 4;
      const value = Math.round(pixels.data[offset] * .299 + pixels.data[offset + 1] * .587 + pixels.data[offset + 2] * .114);
      gray[index] = value;
      brightnessTotal += value;
    }
    let edgeTotal = 0;
    let edgeCount = 0;
    for (let y = 1; y < canvas.height - 1; y += 2) {
      for (let x = 1; x < canvas.width - 1; x += 2) {
        const index = y * canvas.width + x;
        edgeTotal += Math.abs(gray[index - 1] + gray[index + 1] + gray[index - canvas.width] + gray[index + canvas.width] - gray[index] * 4);
        edgeCount += 1;
      }
    }
    const averageEdge = edgeCount ? edgeTotal / edgeCount : 0;
    const averageBrightness = gray.length ? brightnessTotal / gray.length : 0;
    context.filter = 'grayscale(1) contrast(1.45) brightness(1.08)';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const enhanced = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < enhanced.data.length; index += 4) {
      const value = enhanced.data[index];
      const threshold = value > 185 ? 255 : value < 80 ? 0 : value;
      enhanced.data[index] = threshold;
      enhanced.data[index + 1] = threshold;
      enhanced.data[index + 2] = threshold;
    }
    context.putImageData(enhanced, 0, 0);
    URL.revokeObjectURL(image.src);
    return { canvas, blurScore: averageEdge, averageBrightness };
  });
}
function inspectionScore() { return Number.isFinite(inspectionData.score) ? inspectionData.score : 0; }
function inspectionStatusClass() { return inspectionData.status === 'Compliant' ? 'compliant' : inspectionData.status === 'Non-compliant' ? 'noncompliant' : 'review'; }
function escapedInspectionStatus() { return escapeHtml(inspectionData.status || 'Review needed'); }
function currentProductImage() {
  const imageFile = selectedFiles.find((file) => file && file.type && file.type.startsWith('image/'));
  return imageFile ? URL.createObjectURL(imageFile) : '';
}
function repositoryTabMarkup() {
  if (repositoryTab === 'evidence') {
    if (!selectedFiles.length) return '<div class="empty-state">No image evidence has been captured yet. Start an inspection to add label photos.</div>';
    return `<div class="evidence-grid">${selectedFiles.map((file, index) => `<article class="evidence-card"><div class="evidence-image"><img src="${URL.createObjectURL(file)}" alt="Label evidence ${index + 1}"></div><div><strong>${escapeHtml(file.name)}</strong><small>${index === 0 ? 'Front label' : index === 1 ? 'Back label' : 'Additional label panel'}</small></div></article>`).join('')}</div>`;
  }
  if (repositoryTab === 'violations') {
    const violations = (inspectionData.findings || []).filter((finding) => !finding.detected);
    return violations.length
      ? `<div class="finding-list">${violations.map((finding) => `<div class="finding danger"><i data-lucide="x-circle"></i><div><strong>${escapeHtml(finding.label)}</strong><span>${escapeHtml(finding.value || 'Manual verification required.')}</span></div></div>`).join('')}</div>`
      : '<div class="empty-state">No violations were detected in the latest inspection.</div>';
  }
  if (repositoryTab === 'history') {
    const rows = getFilteredHistoryRows();
    return rows.length
      ? `<div class="history-summary"><small>Inspection history</small><strong>${rows.length} recorded inspection${rows.length === 1 ? '' : 's'}</strong></div>${rows.slice(0, 6).map((item) => `<div class="history-row"><div class="product-cell"><div class="product-thumb oil">${escapeHtml((item.productName || 'SC').slice(0, 2).toUpperCase())}</div><div><strong>${escapeHtml(item.productName || 'Scanned label')}</strong><small>${escapeHtml(item.date || 'Recently')}</small></div></div><span class="status-pill ${item.status === 'Compliant' ? 'compliant' : item.status === 'Non-compliant' ? 'noncompliant' : 'review'}"><i></i>${escapeHtml(item.status || 'Review needed')}</span><strong class="score-text">${item.score || 0}<small>/100</small></strong></div>`).join('')}`
      : '<div class="empty-state">No inspection history is available yet.</div>';
  }
  const declarations = [
    ['Common name of commodity', inspectionData.commonNameOfCommodity],
    ['Manufacturer / packer', inspectionData.manufacturer],
    ['Manufacturer address', inspectionData.manufacturerAddress],
    ['Country of origin', inspectionData.originCountry],
    ['Net quantity', inspectionData.quantity],
    ['MRP', inspectionData.mrp],
    ['Unit sale price', inspectionData.unitSalePrice],
    ['Manufacture date', inspectionData.manufactureDate],
    ['Expiry date', inspectionData.expiryDate],
    ['Consumer care', inspectionData.care]
  ];
  return `<div class="declaration-list">${declarations.map(([label, value]) => `<div class="declaration-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || 'Not detected')}</strong></div>`).join('')}</div>`;
}
async function analyzeInspection() {
  if (!selectedFiles.length) return;
  scanStage = 'processing';
  renderScan();
  try {
    if (!window.Tesseract) throw new Error('Text recognition is unavailable.');
    const preparedImages = await Promise.all(selectedFiles.map((file) => prepareImageForOcr(file)));
    const results = await Promise.all(preparedImages.map(({ canvas }) => Tesseract.recognize(canvas, ocrLanguage, {
      logger: (message) => {
        if (message.status === 'recognizing text' && message.progress > .1) notify(`Reading label ${Math.round(message.progress * 100)}%`);
      }
    })));
    const fontReadabilityChecks = results.map((result) => evaluateFontReadability(result.data.text, result.data.words || []));
    const fontReadable = fontReadabilityChecks.every((check) => check.readable);
    const combinedText = results.map((result) => result.data.text).join('\n');
    inspectionData = extractInspectionData(combinedText);
    inspectionData.fontSizeReadability = fontReadable ? 'Readable' : 'Not readable';
    inspectionData.fontReadabilityReason = fontReadabilityChecks.filter((check) => !check.readable).map((check) => check.reason).join(' ');
    inspectionData.blurWarnings = preparedImages.filter(({ blurScore, averageBrightness }) => blurScore < 18 || averageBrightness < 18 || averageBrightness > 242).length;
    if (!fontReadable) {
      inspectionData.findings.unshift({ label: 'Font size readability', detected: false, value: 'Text is too small or unreadable. Reject this item and relabel with legible font size.' });
      inspectionData.status = 'Non-compliant';
      inspectionData.score = Math.min(inspectionData.score || 0, 39);
    }
    if (inspectionData.blurWarnings) {
      inspectionData.findings.unshift({ label: `${inspectionData.blurWarnings} image${inspectionData.blurWarnings === 1 ? '' : 's'} may be blurry or poorly lit`, detected: false, value: 'Retake this label image in steady, even light for a more reliable reading.' });
    }
    inspectionData.date = 'Just now';
    inspectionData.inspector = currentUserName || 'Jay Chauhan';
    inspectionData.featureScope = featureScope;
    inspectionData.featureScopeLabel = {
      essentials: 'Essentials review',
      'full-compliance': 'Full compliance review',
      'evidence-first': 'Evidence-first review',
      'customer-scan': 'Customer scan product'
    }[featureScope] || 'Full compliance review';

    const newInspectionEntry = {
      productName: inspectionData.productName || 'Latest uploaded image',
      quantity: inspectionData.quantity || 'Just now',
      status: inspectionData.status || 'Review needed',
      score: inspectionScore(),
      date: 'Just now',
      featureScope: featureScope
    };
    scanHistory = [newInspectionEntry, ...scanHistory].slice(0, 8);

    fetch(`${API_BASE}/api/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inspectorName: currentUserName || 'Jay Chauhan',
        inspectorEmail: currentUserEmail || 'jay.chauhan@aletheia.gov.in',
        productName: inspectionData.productName || 'Scanned Product',
        commodity: inspectionData.commonNameOfCommodity || 'Not detected',
        quantity: inspectionData.quantity || 'Not detected',
        mrp: inspectionData.mrp || 'Not detected',
        unitSalePrice: inspectionData.unitSalePrice || 'Not detected',
        manufacturer: inspectionData.manufacturer || 'Not detected',
        manufacturerAddress: inspectionData.manufacturerAddress || 'Not detected',
        originCountry: inspectionData.originCountry || 'Not detected',
        manufactureDate: inspectionData.manufactureDate || 'Not detected',
        expiryDate: inspectionData.expiryDate || 'Not detected',
        shelfLife: inspectionData.shelfLife || 'Not detected',
        careDetails: inspectionData.care || 'Not detected',
        rawText: inspectionData.rawText || '',
        score: inspectionScore(),
        status: inspectionData.status || 'Review needed',
        findings: (inspectionData.findings || []).map(f => ({
          label: f.label,
          detected: f.detected,
          value: f.value
        }))
      })
    }).then(res => res.json()).then(data => {
      console.log('Saved to database:', data);
      addNotification('Inspection completed', `${data.productName || inspectionData.productName || 'New inspection'} was analyzed and saved.`, { icon: 'scan-check', tone: 'blue' });
      fetchInspectionsFromBackend();
    }).catch(err => console.error('Failed to save inspection:', err));

  } catch (error) {
    inspectionData = { productName: 'Scanned product', commonNameOfCommodity: 'Not detected', quantity: 'Not detected', manufacturer: 'Not detected', manufacturerAddress: 'Not detected', originCountry: 'Not detected', mrp: 'Not detected', unitSalePrice: 'Not detected', manufactureDate: 'Not detected', expiryDate: 'Not detected', shelfLife: 'Not detected', dates: 'Not detected', care: 'Not detected', rawText: '', score: 0, status: 'Review needed', reviewRole: 'Enforcement officer', enforcementAction: 'Notice to manufacturer / manufacturing company', findings: [{ label: 'Label text could not be read', detected: false, value: 'Check focus, lighting and the selected language, then retake the image.' }], date: 'Just now', inspector: currentUserName || 'Jay Chauhan' };
    const failedEntry = { productName: inspectionData.productName || 'Latest uploaded image', quantity: inspectionData.quantity || 'Just now', status: inspectionData.status || 'Review needed', score: inspectionScore(), date: 'Just now' };
    scanHistory = [failedEntry, ...scanHistory].slice(0, 8);
    notify('Image captured, but label text could not be read');
  }
  scanStage = 'result';
  renderScan();
}

let currentPage = 'overview';

async function fetchInspectionsFromBackend(loadAll = false) {
  try {
    let url = `${API_BASE}/api/inspections`;
    if (!loadAll && currentRole === 'Senior inspector' && currentPage === 'repository') {
      url = `${API_BASE}/api/inspections/review-queue`;
    } else if (!loadAll && currentRole === 'Field inspector' && currentPage === 'history') {
      url = `${API_BASE}/api/inspections/my-inspections?email=${encodeURIComponent(currentUserEmail)}`;
    }
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const nextSnapshot = new Map(data.map((scan) => [String(scan.id), scan.status || 'Review needed']));
        if (inspectionSnapshotReady) {
          data.forEach((scan) => {
            const previousStatus = inspectionStatusSnapshot.get(String(scan.id));
            if (previousStatus && previousStatus !== scan.status) {
              addNotification('Inspection status updated', `${scan.productName || 'Inspection'} is now ${scan.status || 'Review needed'}.`, {
                icon: scan.status === 'Compliant' ? 'check-circle-2' : 'triangle-alert',
                tone: scan.status === 'Compliant' ? 'blue' : 'coral'
              });
            }
          });
        }
        inspectionStatusSnapshot = nextSnapshot;
        inspectionSnapshotReady = true;
        scanHistory = data.map(scan => ({
          id: scan.id,
          productName: scan.productName,
          quantity: scan.quantity,
          status: scan.status,
          score: scan.score,
          date: scan.scannedAt ? new Date(scan.scannedAt).toLocaleDateString() : 'Recently',
          inspectorName: scan.inspectorName,
          inspectorEmail: scan.inspectorEmail,
          commodity: scan.commodity,
          mrp: scan.mrp,
          manufacturer: scan.manufacturer,
          manufacturerAddress: scan.manufacturerAddress,
          originCountry: scan.originCountry,
          manufactureDate: scan.manufactureDate,
          expiryDate: scan.expiryDate,
          shelfLife: scan.shelfLife,
          care: scan.careDetails,
          unitSalePrice: scan.unitSalePrice,
          commonNameOfCommodity: scan.commodity,
          rawText: scan.rawText,
          findings: scan.findings || []
        }));
        if (currentPage === 'history' || currentPage === 'repository' || currentPage === 'reports' || currentPage === 'overview') {
          if (!workflowPage.classList.contains('hidden')) renderWorkflow(currentPage);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching inspections from backend:', err);
  }
}

async function fetchTeamFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/api/team`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        teamMembers = data;
        if (currentPage === 'team' && !workflowPage.classList.contains('hidden')) {
          renderWorkflow('team');
        }
      }
    }
  } catch (err) {
    console.error('Error fetching team from backend:', err);
  }
}

async function updateInspectionStatusInBackend(scanId, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/api/inspections/${scanId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      const updatedScan = await res.json();
      scanHistory = scanHistory.map((item) => String(item.id) === String(scanId)
        ? { ...item, status: updatedScan.status || newStatus }
        : item);
      if (String(inspectionData.id) === String(scanId) || inspectionData.id == null && inspectionData.productName === updatedScan.productName) {
        inspectionData = { ...inspectionData, id: scanId, status: updatedScan.status || newStatus };
      }
      notify(`Inspection updated to ${newStatus}`);
      addNotification(`Inspection ${newStatus === 'Compliant' ? 'approved' : 'flagged'}`, `${updatedScan.productName || 'Inspection'} was marked ${newStatus}.`, {
        icon: newStatus === 'Compliant' ? 'check-circle-2' : 'flag',
        tone: newStatus === 'Compliant' ? 'blue' : 'coral'
      });
      inspectionStatusSnapshot.set(String(scanId), updatedScan.status || newStatus);
      await fetchInspectionsFromBackend(true);
      if (!overviewPage.classList.contains('hidden')) renderRoleTasks();
      if (!scanPage.classList.contains('hidden')) renderScan();
      if (!workflowPage.classList.contains('hidden')) renderWorkflow(currentPage);
    } else {
      notify(`Could not update inspection to ${newStatus}`);
    }
  } catch (err) {
    console.error('Failed to update status in backend:', err);
    notify('Could not connect to the backend while updating status');
  }
}

function pageTitle(page) {
  if (page === 'repository') {
    if (currentRole === 'Senior inspector') return 'Review queue';
    if (currentRole === 'Field inspector') return 'Evidence repository';
    return 'Product detail';
  }
  if (page === 'history' && currentRole === 'Field inspector') return 'My inspections';
  return { repository: 'Product detail', reports: 'Reports', history: 'Inspection history', analytics: 'Analytics', team: 'Inspection team', settings: 'Settings', documentation: 'Technical documentation' }[page] || 'Workspace';
}

function getRoleNoticeMarkup(page) {
  if (currentRole === 'Administrator') {
    return `<div class="role-banner admin"><i data-lucide="shield-check"></i><div><strong>Administrator Control Panel</strong><span>Full administrative access across workspace operations, team members, analytics, and repositories.</span></div></div>`;
  }
  if (currentRole === 'Senior inspector') {
    if (page === 'scan') {
      return `<div class="role-banner info"><i data-lucide="info"></i><div><strong>Role Guidance — Senior Inspector</strong><span>Label scanning is primarily performed by ground Field Inspectors. As a Senior Inspector, you can run test scans here or proceed to the <strong>Review queue</strong> to triage and approve submitted field scans.</span></div></div>`;
    }
    if (page === 'repository') {
      return `<div class="role-banner info"><i data-lucide="clipboard-check"></i><div><strong>Senior Inspector — Priority Review Queue</strong><span>You are reviewing priority cases submitted by field staff. Verify evidence and click <strong>Approve</strong> or <strong>Flag</strong> to sign off on findings.</span></div></div>`;
    }
  }
  if (currentRole === 'Field inspector') {
    if (page === 'reports') {
      return `<div class="role-banner info"><i data-lucide="info"></i><div><strong>Role Guidance — Field Inspector</strong><span>Official compliance notices & legal enforcement reports are reviewed and authorized by Senior Inspectors and Enforcement Officers. Draft reports generated from your field evidence are accessible below.</span></div></div>`;
    }
    if (page === 'team') {
      return `<div class="role-banner info"><i data-lucide="info"></i><div><strong>Role Guidance — Field Inspector</strong><span>Team management and user permissions are handled by Administrators. Below is the active inspection team list.</span></div></div>`;
    }
    if (page === 'repository') {
      return `<div class="role-banner info"><i data-lucide="image"></i><div><strong>Field Inspector — Evidence Repository</strong><span>You are viewing captured label image evidence. Use <strong>Capture inspection</strong> to add new photos to the workspace repository.</span></div></div>`;
    }
    if (page === 'history') {
      return `<div class="role-banner info"><i data-lucide="history"></i><div><strong>Field Inspector — My Inspections</strong><span>Displaying inspection scans and label evidence submitted by <strong>${escapeHtml(currentUserName || 'Field staff')}</strong>.</span></div></div>`;
    }
  }
  return '';
}

function renderWorkflow(page) {
  let repoTemplate = productMarkup();
  if (currentRole === 'Senior inspector' && page === 'repository') {
    repoTemplate = reviewQueueMarkup();
  }
  const templates = {
    repository: repoTemplate,
    reports: reportMarkup(),
    history: historyMarkup(),
    analytics: analyticsMarkup(),
    team: teamMarkup(),
    settings: settingsMarkup(),
    documentation: documentationMarkup()
  };
  const notice = getRoleNoticeMarkup(page);
  const contentMarkup = templates[page] || historyMarkup();
  workflowPage.innerHTML = notice + contentMarkup;
  refreshIcons();
}

function showPage(page) {
  currentPage = page;
  if (page === 'repository' && currentRole === 'Field inspector') {
    repositoryTab = 'evidence';
  }
  const isOverview = page === 'overview';
  const isScan = page === 'scan';
  overviewPage.classList.toggle('hidden', !isOverview);
  scanPage.classList.toggle('hidden', !isScan);
  workflowPage.classList.toggle('hidden', isOverview || isScan);

  if (page === 'team') {
    fetchTeamFromBackend();
  } else if (['overview', 'repository', 'history', 'reports'].includes(page)) {
    fetchInspectionsFromBackend();
  }

  if (isScan) renderScan();
  if (!isOverview && !isScan) renderWorkflow(page);
  if (isOverview) renderRoleTasks();
  breadcrumbCurrent.textContent = isOverview ? 'Overview' : isScan ? 'New inspection' : pageTitle(page);
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.page === page));
  sidebar.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderScan() {
  const heading = scanStage === 'result' ? 'Inspection result' : 'New product inspection';
  const copy = { capture: 'Capture or upload clear images of every label panel.', preview: 'Check image quality before running the compliance review.', processing: 'Our review engine is reading declarations and comparing rule checks.', result: 'Review findings, supporting evidence and declaration details.' }[scanStage];
  const content = scanStage === 'capture' ? captureMarkup() : scanStage === 'preview' ? previewMarkup() : scanStage === 'processing' ? processingMarkup() : resultMarkup();
  const notice = getRoleNoticeMarkup('scan');
  scanPage.innerHTML = `${notice}<div class="page-heading"><div><p class="eyebrow">INSPECTION WORKSPACE</p><h1>${heading}</h1><p class="subheading">${copy}</p></div><button class="secondary-btn" data-action="overview"><i data-lucide="arrow-left"></i> Back to dashboard</button></div>${content}`;
  refreshIcons();
  if (scanStage === 'result') window.renderDetectedProductData?.(inspectionData);
}
function captureMarkup() {
  const files = selectedFiles.map((file) => `<span>${file.name}</span>`).join('');
  return `<div class="inspection-grid"><div class="panel capture-panel"><div class="workflow-steps"><b class="current">01 <span>Capture</span></b><i data-lucide="chevron-right"></i><b>02 <span>Preview</span></b><i data-lucide="chevron-right"></i><b>03 <span>Review</span></b></div><div class="capture-options"><button class="capture-card" data-action="camera"><span class="capture-icon blue"><i data-lucide="camera"></i></span><strong>Use camera</strong><small>Take front, back or side label photos</small></button><label class="capture-card"><span class="capture-icon green"><i data-lucide="image-plus"></i></span><strong>Upload images</strong><small>JPG, PNG or WEBP up to 10 MB each<input id="workflowFileInput" type="file" accept="image/*" multiple hidden></small></label></div><div class="ocr-language"><label for="ocrLanguage">Label language</label><select id="ocrLanguage"><option value="eng" ${ocrLanguage === 'eng' ? 'selected' : ''}>English</option><option value="hin" ${ocrLanguage === 'hin' ? 'selected' : ''}>Hindi</option><option value="eng+hin" ${ocrLanguage === 'eng+hin' ? 'selected' : ''}>English + Hindi</option><option value="ben" ${ocrLanguage === 'ben' ? 'selected' : ''}>Bengali</option><option value="eng+ben" ${ocrLanguage === 'eng+ben' ? 'selected' : ''}>English + Bengali</option><option value="guj" ${ocrLanguage === 'guj' ? 'selected' : ''}>Gujarati</option><option value="eng+guj" ${ocrLanguage === 'eng+guj' ? 'selected' : ''}>English + Gujarati</option><option value="mar" ${ocrLanguage === 'mar' ? 'selected' : ''}>Marathi</option><option value="eng+mar" ${ocrLanguage === 'eng+mar' ? 'selected' : ''}>English + Marathi</option><option value="tam" ${ocrLanguage === 'tam' ? 'selected' : ''}>Tamil</option><option value="eng+tam" ${ocrLanguage === 'eng+tam' ? 'selected' : ''}>English + Tamil</option><option value="tel" ${ocrLanguage === 'tel' ? 'selected' : ''}>Telugu</option><option value="eng+tel" ${ocrLanguage === 'eng+tel' ? 'selected' : ''}>English + Telugu</option><option value="kan" ${ocrLanguage === 'kan' ? 'selected' : ''}>Kannada</option><option value="eng+kan" ${ocrLanguage === 'eng+kan' ? 'selected' : ''}>English + Kannada</option><option value="mal" ${ocrLanguage === 'mal' ? 'selected' : ''}>Malayalam</option><option value="eng+mal" ${ocrLanguage === 'eng+mal' ? 'selected' : ''}>English + Malayalam</option><option value="pan" ${ocrLanguage === 'pan' ? 'selected' : ''}>Punjabi</option><option value="eng+pan" ${ocrLanguage === 'eng+pan' ? 'selected' : ''}>English + Punjabi</option><option value="ori" ${ocrLanguage === 'ori' ? 'selected' : ''}>Odia</option><option value="eng+ori" ${ocrLanguage === 'eng+ori' ? 'selected' : ''}>English + Odia</option><option value="asm" ${ocrLanguage === 'asm' ? 'selected' : ''}>Assamese</option><option value="eng+asm" ${ocrLanguage === 'eng+asm' ? 'selected' : ''}>English + Assamese</option><option value="urd" ${ocrLanguage === 'urd' ? 'selected' : ''}>Urdu</option><option value="eng+urd" ${ocrLanguage === 'eng+urd' ? 'selected' : ''}>English + Urdu</option></select></div><div class="dropzone compact" data-action="browse"><div class="upload-icon"><i data-lucide="upload-cloud"></i></div><h2>Drop images here</h2><p>or click to browse from your device</p><div class="file-list">${files}</div></div><div class="capture-footer"><span><i data-lucide="shield-check"></i> Secure, browser-based processing</span><button class="primary-btn" data-action="preview" ${selectedFiles.length ? '' : 'disabled'}>Continue to preview <i data-lucide="arrow-right"></i></button></div></div><aside class="panel inspection-side"><p class="eyebrow">CAPTURE GUIDE</p><h2>Build a complete evidence set</h2><p>Photograph the label straight on, with all text visible and enough light to read fine print.</p><div class="guide-item"><i data-lucide="sun"></i><span><strong>Good lighting</strong><small>Avoid glare across MRP and quantity.</small></span></div><div class="guide-item"><i data-lucide="scan-line"></i><span><strong>Fit the whole label</strong><small>Keep the edges inside the frame.</small></span></div><div class="guide-item"><i data-lucide="layers-3"></i><span><strong>All sides matter</strong><small>Front, back and side panels are useful.</small></span></div></aside></div>`;
}
function previewMarkup() {
  return `<div class="panel preview-panel"><div class="panel-heading"><div><p class="eyebrow">IMAGE PREVIEW</p><h2>Review before analysis</h2><p>Remove blurred images or retake a panel if declarations are hard to read.</p></div><span class="status-pill compliant"><i></i> ${selectedFiles.length} images ready</span></div><div class="preview-grid">${selectedFiles.map((file, index) => `<article class="preview-card"><div class="preview-image"><img src="${URL.createObjectURL(file)}" alt="Uploaded label ${index + 1}"><span>${index === 0 ? 'Front label' : index === 1 ? 'Back label' : 'Side label'}</span></div><div class="preview-meta"><strong>${file.name}</strong><button class="icon-btn" data-action="remove-file" data-index="${index}" title="Remove image"><i data-lucide="trash-2"></i></button></div></article>`).join('')}</div><div class="preview-footer"><button class="secondary-btn" data-action="retake"><i data-lucide="rotate-ccw"></i> Retake / add images</button><button class="primary-btn" data-action="process"><i data-lucide="sparkles"></i> Start inspection</button></div></div>`;
}
function processingMarkup() {
  const scopeLabel = {
    essentials: 'Essentials review',
    'full-compliance': 'Full compliance review',
    'evidence-first': 'Evidence-first review',
    'customer-scan': 'Customer scan product'
  }[featureScope] || 'Full compliance review';
  return `<div class="panel processing-panel"><div class="processing-orbit"><i data-lucide="scan-search"></i></div><p class="eyebrow">ANALYSIS IN PROGRESS</p><h2>Reading your product labels</h2><p>Running a ${scopeLabel.toLowerCase()} against the Packaged Commodities Rules, 2011.</p><div class="progress-track"><span></span></div><div class="processing-list"><span class="done"><i data-lucide="check"></i> Image quality check</span><span class="active"><i data-lucide="loader-circle"></i> Declaration detection</span><span><i data-lucide="circle"></i> Rule comparison</span></div></div>`;
}
function resultMarkup() {
  const productName = escapeHtml(inspectionData.productName);
  const quantity = escapeHtml(inspectionData.quantity);
  const score = inspectionScore();
  const statusClass = inspectionStatusClass();
  const findings = inspectionData.findings.length ? inspectionData.findings.map((finding) => {
    const ruleStatus = finding.detected
      ? 'Compliant with the Packaged Commodities Rules, 2011.'
      : 'Not followed as per the Legal Metrology (Packaged Commodities) Rules, 2011.';
    return `<div class="finding ${finding.detected ? 'success' : 'danger'}"><i data-lucide="${finding.detected ? 'check-circle-2' : 'x-circle'}"></i><div><strong>${escapeHtml(finding.label)}</strong><span>${escapeHtml(ruleStatus)} ${escapeHtml(finding.value === 'Not detected' ? 'Missing declaration requires manual review.' : finding.value)}</span></div></div>`;
  }).join('') : '<div class="finding warning"><i data-lucide="triangle-alert"></i><div><strong>Manual verification required</strong><span>No readable declaration text was extracted from the uploaded images.</span></div></div>';
  const reviewRole = escapeHtml(inspectionData.reviewRole || 'Enforcement officer');
  const enforcementAction = escapeHtml(inspectionData.enforcementAction || 'Notice to manufacturer / manufacturing company');
  return `<div class="result-hero"><div><p class="eyebrow">ANALYSIS COMPLETE · MC-26034-0084</p><h2>${productName}</h2><p>Label scan · ${quantity} · Inspected just now</p></div><span class="status-pill ${statusClass}"><i></i> ${escapedInspectionStatus()}</span></div><div class="result-grid"><div class="panel score-panel"><div class="score-ring" style="background: conic-gradient(var(--blue) 0 ${score}%, #eaf0f7 ${score}% 100%)"><div class="score-value"><strong>${score}</strong><span>/ 100</span></div><small>Compliance score</small></div><div><h2>${score >= 90 ? 'Ready for approval' : 'Attention required'}</h2><p>Recommended reviewer: <strong>${reviewRole}</strong>. Verify the original label before issuing a report.</p><p class="enforcement-action"><strong>Action:</strong> ${enforcementAction}</p><button class="text-btn" data-action="declarations">View declaration details <i data-lucide="arrow-up-right"></i></button></div></div><div class="panel findings-panel"><div class="panel-heading"><div><h2>Violations & findings</h2><p>Based on this product scan</p></div><button class="text-btn" data-action="evidence">Evidence <i data-lucide="image"></i></button></div>${findings}</div></div><div id="detectedProductData"></div><div class="result-actions"><button class="secondary-btn" data-action="retake"><i data-lucide="rotate-ccw"></i> Retake images</button><button class="secondary-btn" data-action="declarations"><i data-lucide="list-checks"></i> Declaration details</button><button class="primary-btn" data-action="report"><i data-lucide="file-output"></i> Generate report</button></div>`;
}
function reviewQueueMarkup() {
  const pendingRows = scanHistory.filter(item => (item.status || '').toLowerCase().includes('review') || (item.status || '').toLowerCase().includes('pending'));
  const rowsToDisplay = pendingRows;

  return `<div class="page-heading"><div><p class="eyebrow">SENIOR INSPECTOR WORKFLOW</p><h1>Review queue</h1><p class="subheading">Triage flagged inspections, verify evidence and approve compliance findings.</p></div><button class="primary-btn" data-action="scan"><i data-lucide="plus"></i> New inspection</button></div><div class="panel history-panel"><div class="panel-heading"><div><h2>Pending Review Items (${rowsToDisplay.length})</h2><p>Scans submitted by field staff waiting for senior officer sign-off</p></div></div>${rowsToDisplay.length ? rowsToDisplay.map((item, index) => `<div class="history-row" style="grid-template-columns: 2fr 1fr 1fr 1fr auto;"><div class="product-cell"><div class="product-thumb oil">${(item.productName || 'SC').slice(0, 2).toUpperCase()}</div><div><strong>${escapeHtml(item.productName || 'Scanned label')}</strong><small>Inspector: ${escapeHtml(item.inspectorName || 'Field staff')} (${escapeHtml(item.inspectorEmail || 'Field')})</small></div></div><span class="status-pill ${item.status === 'Compliant' ? 'compliant' : item.status === 'Non-compliant' ? 'noncompliant' : 'review'}"><i></i>${escapeHtml(item.status || 'Review needed')}</span><strong class="score-text">${item.score || 85}<small>/100</small></strong><span>${escapeHtml(item.date || 'Recently')}</span><div style="display: flex; gap: 6px;"><button class="primary-btn" style="padding: 6px 12px; font-size: 11px; background: #2e7d32;" data-action="approve-scan" data-scan-id="${item.id || ''}"><i data-lucide="check-circle-2"></i> Approve</button><button class="primary-btn" style="padding: 6px 12px; font-size: 11px; background: #c05656;" data-action="flag-scan" data-scan-id="${item.id || ''}"><i data-lucide="alert-triangle"></i> Flag</button></div></div>`).join('') : '<div class="empty-state">No pending inspections in queue.</div>'}</div>`;
}

function productMarkup() {
  const productName = escapeHtml(inspectionData.productName);
  const quantity = escapeHtml(inspectionData.quantity);
  const image = currentProductImage();
  return `<div class="page-heading"><div><p class="eyebrow">${currentRole === 'Field inspector' ? 'EVIDENCE REPOSITORY' : 'PRODUCT REPOSITORY'}</p><h1>${currentRole === 'Field inspector' ? 'Evidence repository' : 'Product detail'}</h1><p class="subheading">The latest scanned product, its evidence and review trail.</p></div><button class="primary-btn" data-action="scan"><i data-lucide="plus"></i> Inspect another product</button></div><div class="product-detail-grid"><div class="panel product-identity">${image ? `<img class="product-detail-image" src="${image}" alt="${productName} label">` : '<div class="product-bottle">SCAN</div>'}<div><span class="status-pill ${inspectionStatusClass()}"><i></i> ${escapedInspectionStatus()}</span><h2>${productName}</h2><p>Label scan · ${quantity}</p><small>Latest inspection from the current workspace</small></div></div><div class="panel detail-stats"><span><small>Images</small><strong>${selectedFiles.length}</strong></span><span><small>Score</small><strong>${inspectionScore()}</strong></span><span><small>Open issues</small><strong>${inspectionData.findings.filter((finding) => !finding.detected).length}</strong></span></div></div><div class="panel detail-tabs"><div class="tabs"><button class="${repositoryTab === 'declarations' ? 'active' : ''}" data-action="repository-tab" data-tab="declarations">Declarations</button><button class="${repositoryTab === 'violations' ? 'active' : ''}" data-action="repository-tab" data-tab="violations">Violations</button><button class="${repositoryTab === 'evidence' ? 'active' : ''}" data-action="repository-tab" data-tab="evidence">Image evidence</button><button class="${repositoryTab === 'history' ? 'active' : ''}" data-action="repository-tab" data-tab="history">History</button></div>${repositoryTabMarkup()}</div>`;
}
function reportMarkup() {
  const reports = scanHistory.length ? scanHistory : [{
    id: inspectionData.id,
    productName: inspectionData.productName,
    quantity: inspectionData.quantity,
    status: inspectionData.status,
    score: inspectionScore(),
    date: inspectionData.date || 'Just now'
  }];
  const latest = reports[0];
  const latestName = escapeHtml(latest.productName || 'Scanned product');
  const latestQuantity = escapeHtml(latest.quantity || 'Not detected');
  const latestStatus = escapeHtml(latest.status || 'Review needed');
  const latestStatusClass = latest.status === 'Compliant' ? 'compliant' : latest.status === 'Non-compliant' ? 'noncompliant' : 'review';
  return `<div class="page-heading"><div><p class="eyebrow">DOCUMENTS</p><h1>Reports</h1><p class="subheading">Issue, download and share inspection summaries.</p></div><button class="primary-btn" data-action="download" data-report-id="${latest.id || ''}"><i data-lucide="file-plus-2"></i> Generate report</button></div><div class="panel report-banner"><div class="report-icon"><i data-lucide="file-check-2"></i></div><div><h2>MC-26034-${latest.id || '0084'} · ${latestName}</h2><p>${latestStatus} · ${latestQuantity} · ${latest.score || 0} / 100</p></div><button class="secondary-btn" data-action="download" data-report-id="${latest.id || ''}"><i data-lucide="download"></i> Download</button></div><div class="panel report-table"><div class="panel-heading"><div><h2>Inspection reports</h2><p>Generated from inspections stored in the compliance database</p></div></div>${reports.map((report) => { const statusClass = report.status === 'Compliant' ? 'compliant' : report.status === 'Non-compliant' ? 'noncompliant' : 'review'; return `<div class="report-row"><strong>${escapeHtml(report.productName || 'Scanned product')} <small>MC-26034-${report.id || '0084'}</small></strong><span class="status-pill ${statusClass}"><i></i> ${escapeHtml(report.status || 'Review needed')}</span><span>${escapeHtml(report.date || 'Recently')}</span><button class="icon-btn" data-action="download" data-report-id="${report.id || ''}" title="Download report"><i data-lucide="download"></i></button></div>`; }).join('')}</div>`;
}
function getFilteredHistoryRows() {
  let rows = scanHistory.length ? scanHistory : [{ productName: inspectionData.productName || 'Latest uploaded image', quantity: inspectionData.quantity || 'Just now', status: inspectionData.status || 'Review needed', score: inspectionScore(), date: 'Just now' }];
  if (currentRole === 'Field inspector') {
    rows = rows.filter(item => !item.inspectorEmail || item.inspectorEmail === currentUserEmail || item.inspectorName === currentUserName);
  }
  if (historyFilter === 'all') return rows;
  return rows.filter((item) => (item.status || 'Review needed').toLowerCase() === historyFilter.toLowerCase());
}
function historyMarkup() {
  const rows = getFilteredHistoryRows();
  const filterLabel = historyFilter === 'all' ? 'All results' : historyFilter.charAt(0).toUpperCase() + historyFilter.slice(1);
  return `<div class="page-heading"><div><p class="eyebrow">${currentRole === 'Field inspector' ? 'MY INSPECTIONS' : 'AUDIT TRAIL'}</p><h1>${currentRole === 'Field inspector' ? 'My inspections' : 'Inspection history'}</h1><p class="subheading">${currentRole === 'Field inspector' ? 'Scans and evidence submitted by you.' : 'Every inspection, decision and evidence set in one place.'}</p></div><button class="primary-btn" data-action="scan"><i data-lucide="plus"></i> New inspection</button></div><div class="panel history-panel"><div class="history-toolbar"><div class="search-box"><i data-lucide="search"></i><input placeholder="Search products or scan IDs"></div><div class="status-menu-wrap"><button class="select-btn" data-action="history-filter-toggle" aria-expanded="false">${filterLabel} <i data-lucide="chevron-down"></i></button><div class="status-menu" id="historyFilterMenu"><button type="button" data-action="history-filter" data-history-filter="all"><span>All results</span></button><button type="button" data-action="history-filter" data-history-filter="review"><span>Review needed</span></button><button type="button" data-action="history-filter" data-history-filter="compliant"><span>Compliant</span></button><button type="button" data-action="history-filter" data-history-filter="non-compliant"><span>Non-compliant</span></button></div></div></div>${rows.length ? rows.map((item, index) => `<div class="history-row"><div class="product-cell"><div class="product-thumb oil">${(item.productName || 'LT').slice(0, 2).toUpperCase()}</div><div><strong>${escapeHtml(item.productName || 'Latest uploaded image')}</strong><small>MC-26034-00${index + 81}</small></div></div><span class="status-pill ${item.status === 'Compliant' ? 'compliant' : item.status === 'Non-compliant' ? 'noncompliant' : 'review'}"><i></i>${escapeHtml(item.status || 'Review needed')}</span><strong class="score-text">${item.score || inspectionScore()}<small>/100</small></strong><span>${escapeHtml(item.date || 'Just now')}</span><button class="icon-btn" data-action="product"><i data-lucide="arrow-up-right"></i></button></div>`).join('') : '<div class="empty-state">No inspection results match this filter.</div>'}</div>`;
}
function analyticsMarkup() { return `<div class="page-heading"><div><p class="eyebrow">PERFORMANCE</p><h1>Analytics</h1><p class="subheading">Understand inspection volume and recurring declaration gaps.</p></div><button class="select-btn">Last 30 days <i data-lucide="chevron-down"></i></button></div><div class="stat-grid"><article class="stat-card"><p>Total inspections</p><strong>248</strong><small class="trend up">+12.8% vs last month</small></article><article class="stat-card"><p>Compliance rate</p><strong>74.2%</strong><small class="trend up">+8.4% vs last month</small></article><article class="stat-card"><p>Avg. review time</p><strong>04:32</strong><small>minutes per product</small></article><article class="stat-card"><p>Evidence captured</p><strong>1,186</strong><small>across all inspections</small></article></div><div class="analytics-grid"><div class="panel analytics-chart"><div class="panel-heading"><div><h2>Inspection volume</h2><p>Daily scans over the selected period</p></div></div><div class="bar-chart">${[42, 58, 48, 74, 63, 88, 69, 94, 81, 66, 78, 100].map((height) => `<i style="height:${height}%"></i>`).join('')}</div></div><div class="panel gap-panel"><h2>Common declaration gaps</h2><p>Most frequent issues requiring manual review</p><div><span>Importer address</span><strong>32%</strong><i><b style="width:32%"></b></i></div><div><span>MRP font size</span><strong>24%</strong><i><b style="width:24%"></b></i></div><div><span>Consumer care</span><strong>14%</strong><i><b style="width:14%"></b></i></div></div></div>`; }
function teamMarkup() {
  const isAdmin = currentRole === 'Administrator';
  const activeCount = teamMembers.filter((member) => member.status === 'Active').length;
  return `<div class="page-heading"><div><p class="eyebrow">MANAGEMENT</p><h1>Inspection team</h1><p class="subheading">${isAdmin ? 'Monitor employee activity and manage workspace access.' : 'People reviewing packaged commodity labels across your workspace.'}</p></div>${isAdmin ? '<button class="primary-btn" data-action="invite"><i data-lucide="user-plus"></i> Add member</button>' : ''}</div><div class="team-summary"><div class="panel"><span>Team members</span><strong>${teamMembers.length}</strong></div><div class="panel"><span>Active now</span><strong>${activeCount}</strong></div><div class="panel"><span>Scans this month</span><strong>${teamMembers.reduce((total, member) => total + member.scans, 0)}</strong></div></div><div class="team-grid">${teamMembers.map((member) => `<article class="panel team-card"><div class="team-avatar">${member.name.split(' ').map((part) => part[0]).join('')}</div><h2>${escapeHtml(member.name)}</h2><p>${escapeHtml(member.role)}</p><strong>${member.scans} <small>scans completed</small></strong><span class="status-pill ${member.status === 'Active' ? 'compliant' : 'review'}"><i></i>${member.status}</span><small class="team-last-active"><i data-lucide="clock-3"></i> Last active ${member.lastActive}</small></article>`).join('')}</div>${isAdmin ? '<p class="admin-note"><i data-lucide="shield-check"></i> Administrator access: you can add employees and review activity across the workspace.</p>' : '<p class="admin-note"><i data-lucide="lock"></i> Employee management is available only to administrators.</p>'}`;
}
function settingsMarkup() { return `<div class="page-heading"><div><p class="eyebrow">WORKSPACE</p><h1>Settings</h1><p class="subheading">Manage your inspection workspace preferences.</p></div><button class="primary-btn" data-action="save"><i data-lucide="save"></i> Save changes</button></div><div class="settings-grid"><div class="panel settings-card"><h2>Workspace profile</h2><label>Workspace name<input value="Aletheia Enforcement"></label><label>Default jurisdiction<select><option>India · Packaged Commodities Rules, 2011</option></select></label><label>Feature scope<select id="featureScope"><option value="essentials" ${featureScope === 'essentials' ? 'selected' : ''}>Essentials review</option><option value="full-compliance" ${featureScope === 'full-compliance' ? 'selected' : ''}>Full compliance review</option><option value="evidence-first" ${featureScope === 'evidence-first' ? 'selected' : ''}>Evidence-first review</option><option value="customer-scan" ${featureScope === 'customer-scan' ? 'selected' : ''}>Customer scan product</option></select><small class="field-help">Choose how much context the inspection workflow surfaces during review.</small></label></div><div class="panel settings-card"><h2>Notifications</h2><label class="toggle-row"><span><strong>Inspection completed</strong><small>Notify me when analysis is ready</small></span><input type="checkbox" checked></label><label class="toggle-row"><span><strong>High priority violations</strong><small>Alert the team when a critical issue is found</small></span><input type="checkbox" checked></label></div></div>`; }
function documentationMarkup() { return `<div class="page-heading"><div><p class="eyebrow">TECHNICAL DOCUMENTATION</p><h1>metra<span>lens</span> technical guide</h1><p class="subheading">Deployment framework, system behavior and the daily inspection workflow.</p></div><button class="primary-btn" data-action="download-documentation"><i data-lucide="download"></i> Download guide</button></div><div class="documentation-grid"><article class="panel documentation-card"><h2>1. System overview</h2><p>metraLens is a browser-based packaged-commodity label inspection workspace. It uses client-side OCR to read uploaded label images, extracts key declarations, calculates an assistive compliance score and keeps the evidence available for review.</p><h2>2. Technical framework</h2><ul><li>Frontend: semantic HTML, CSS and vanilla JavaScript.</li><li>UI icons: Lucide.</li><li>OCR engine: Tesseract.js running in the browser.</li><li>Report generation: jsPDF creates a PDF locally in the browser.</li><li>Data handling: selected images and inspection state remain in the current browser session.</li></ul><h2>3. Deployment framework</h2><ol><li>Place <strong>index.html</strong>, <strong>styles.css</strong> and <strong>script.js</strong> in the same web directory.</li><li>Serve the directory through a static web server. HTTPS is recommended for camera access.</li><li>Open the site in a current Chrome, Edge or Firefox browser.</li><li>Ensure the deployment can reach the CDN resources for Lucide, Tesseract.js and jsPDF, or host those libraries locally for an offline deployment.</li></ol></article><aside class="panel documentation-card"><h2>How to use</h2><ol><li>Register or sign in and choose your officer role.</li><li>Open <strong>Scan product</strong> or <strong>Capture inspection</strong>.</li><li>Upload label images or use the camera. Include front, back and side panels where available.</li><li>Choose the label language, preview the images and start the inspection.</li><li>Review detected declarations, evidence and warnings. Confirm results against the original label.</li><li>Open <strong>Reports</strong> and choose <strong>Download</strong> to save the inspection as a PDF.</li></ol><div class="documentation-note"><i data-lucide="info"></i><span>OCR results are assistive. An authorized officer must verify the physical label before taking enforcement action.</span></div><h2>Browser requirements</h2><p>Use a modern browser with JavaScript enabled. Camera capture requires permission and a secure origin such as HTTPS or localhost.</p></aside></div>`; }

function handleFiles(files) {
  const images = [...files].filter((file) => file.type.startsWith('image/'));
  if (!images.length) return;
  selectedFiles = images;
  renderScan();
}
function addRulesLibraryFile(file) {
  if (!file) return;
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'];
  const allowedExtension = /\.(pdf|docx?|txt|rtf)$/i.test(file.name);
  if (!allowedTypes.includes(file.type) && !allowedExtension) {
    notify('Please choose a PDF, Word, TXT or RTF rules file');
    return;
  }
  rulesLibraryFiles = [...rulesLibraryFiles.filter((item) => item.name !== file.name), file];
  renderRulesLibraryFiles();
  notify(`${file.name} added to the Rules library`);
}
function renderRulesLibraryFiles() {
  const container = document.querySelector('#rulesLibraryFiles');
  const addButton = document.querySelector('#addRulesLibraryFile');
  if (!container || !addButton) return;
  const canUploadRules = currentRole === 'Administrator' || currentRole === 'Senior inspector';
  addButton.classList.toggle('hidden', !canUploadRules);
  document.querySelector('#rulesLibrarySummary').textContent = `${rulesLibraryFiles.length} rule${rulesLibraryFiles.length === 1 ? '' : 's'} file${rulesLibraryFiles.length === 1 ? '' : 's'} available`;
  container.innerHTML = rulesLibraryFiles.length
    ? rulesLibraryFiles.map((file, index) => `<div class="rules-library-file"><i data-lucide="file-text"></i><div><strong>${escapeHtml(file.name)}</strong><small>${file.sizeLabel || `${Math.ceil(file.size / 1024)} KB`}</small></div><button class="icon-btn" data-action="open-rules-file" data-index="${index}" title="Open ${escapeHtml(file.name)}" aria-label="Open ${escapeHtml(file.name)}"><i data-lucide="external-link"></i></button></div>`).join('')
    : '<p class="empty-state">No additional rule files have been added yet.</p>';
  refreshIcons();
}
document.addEventListener('click', (event) => {
  const navItem = event.target.closest('.nav-item');
  if (navItem) {
    showPage(navItem.dataset.page);
    return;
  }
  const element = event.target.closest('[data-action]');
  if (!element) return;
  const action = element.dataset.action;
  if (action === 'rules-library') {
    document.querySelector('#rulesLibraryModal').classList.remove('hidden');
    renderRulesLibraryFiles();
  }
  if (action === 'add-rules-file') {
    document.querySelector('#rulesLibraryInput').click();
  }
  if (action === 'open-rules-file') {
    const file = rulesLibraryFiles[Number(element.dataset.index)];
    if (file?.url) window.open(file.url, '_blank', 'noopener');
    else if (file) window.open(URL.createObjectURL(file), '_blank', 'noopener');
  }
  if (action === 'close-rules-library') {
    document.querySelector('#rulesLibraryModal').classList.add('hidden');
  }
  if (action === 'overview') showPage('overview');
  if (action === 'show-login') showAuthForm(loginForm);
  if (action === 'show-registration') showAuthForm(registrationForm);
  if (action === 'scan') { resetSelectedFiles(); scanStage = 'capture'; showPage('scan'); }
  if (action === 'repository') { repositoryTab = 'violations'; showPage('repository'); }
  if (action === 'team') { showPage('team'); }
  if (action === 'camera') openCamera();
  if (action === 'browse') document.querySelector('#workflowFileInput')?.click();
  if (action === 'preview' && selectedFiles.length) { scanStage = 'preview'; renderScan(); }
  if (action === 'retake') { resetSelectedFiles(); scanStage = 'capture'; renderScan(); }
  if (action === 'process') analyzeInspection();
  if (action === 'remove-file') { selectedFiles.splice(Number(element.dataset.index), 1); renderScan(); }
  if (action === 'repository-tab') { repositoryTab = element.dataset.tab; renderWorkflow('repository'); }
  if (action === 'history-filter-toggle') {
    const menu = document.querySelector('#historyFilterMenu');
    const button = element.closest('.select-btn');
    const isOpen = menu?.classList.toggle('open');
    button?.setAttribute('aria-expanded', String(isOpen));
    return;
  }
  if (action === 'history-filter') {
    historyFilter = element.dataset.historyFilter || 'all';
    const button = document.querySelector('[data-action="history-filter-toggle"]');
    const menu = document.querySelector('#historyFilterMenu');
    menu?.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
    if (document.querySelector('#historyPage')) {
      renderWorkflow('history');
      return;
    }
    renderWorkflow('history');
    return;
  }
  if (action === 'recent-history') {
    const selectedInspection = recentInspectionDetails[element.dataset.product];
    if (selectedInspection) inspectionData = { ...inspectionData, ...selectedInspection, findings: inspectionData.findings || [] };
    repositoryTab = 'history';
    showPage('repository');
    notify(`Opening ${selectedInspection?.productName || 'product'} history`);
  }
  if (action === 'approve-scan') {
    const scanId = element.dataset.scanId;
    if (scanId) {
      updateInspectionStatusInBackend(scanId, 'Compliant');
    } else {
      notify('Scan approved as Compliant');
    }
  }
  if (action === 'flag-scan') {
    const scanId = element.dataset.scanId;
    if (scanId) {
      updateInspectionStatusInBackend(scanId, 'Non-compliant');
    } else {
      notify('Scan flagged as Non-compliant');
    }
  }
  if (action === 'declarations' || action === 'evidence' || action === 'product') { repositoryTab = action === 'evidence' ? 'evidence' : action === 'declarations' ? 'declarations' : repositoryTab; showPage('repository'); if (action !== 'product') notify('Showing details for the selected inspection'); }
  if (action === 'report') { showPage('reports'); notify('Report draft created from the inspection'); }
  if (action === 'search-repository') {
    showPage('history');
    setTimeout(() => document.querySelector('.search-box input')?.focus(), 50);
    notify('Repository search is ready');
  }
  if (action === 'forgot-password') {
    document.querySelector('#recoveryModal').classList.remove('hidden');
    refreshIcons();
  }
  if (action === 'send-code') {
    const phone = document.querySelector('#recoveryPhone');
    if (!phone.value.trim()) { phone.reportValidity(); return; }
    document.querySelector('#recoveryStepPhone').classList.add('hidden');
    document.querySelector('#recoveryStepCode').classList.remove('hidden');
    refreshIcons();
    notify('Verification code sent');
  }
  if (action === 'verify-code') {
    const code = document.querySelector('#recoveryCode');
    if (code.value.trim().length !== 6) { code.focus(); notify('Enter the 6-digit verification code'); return; }
    document.querySelector('#recoveryModal').classList.add('hidden');
    document.querySelector('#recoveryStepPhone').classList.remove('hidden');
    document.querySelector('#recoveryStepCode').classList.add('hidden');
    document.querySelector('#loginForm input[type="password"]').focus();
    notify('Phone verified. You can set a new password.');
  }
  if (action === 'close-modal') {
    document.querySelector('#recoveryModal').classList.add('hidden');
    document.querySelector('#recoveryStepPhone').classList.remove('hidden');
    document.querySelector('#recoveryStepCode').classList.add('hidden');
  }
  if (action === 'close-camera') closeCamera();
  if (action === 'take-photo') takePhoto();
  if (action === 'notifications') {
    document.querySelector('#notificationPopover').classList.toggle('open');
    document.querySelector('#accountPopover').classList.remove('open');
  }
  if (action === 'account') {
    document.querySelector('#accountPopover').classList.toggle('open');
    document.querySelector('#notificationPopover').classList.remove('open');
  }
  if (action === 'mark-notifications') {
    notificationItems = notificationItems.map((item) => ({ ...item, unread: false }));
    renderNotifications();
    notify('Notifications marked as read');
  }
  if (action === 'account-settings') { document.querySelector('#accountPopover').classList.remove('open'); showPage('settings'); }
  if (action === 'logout') {
    document.querySelector('#accountPopover').classList.remove('open');
    currentRole = 'Enforcement officer';
    renderRoleNavigation();
    loginScreen.classList.remove('hidden');
    showPage('overview');
  }
  if (action === 'download') downloadReport(element.dataset.reportId);
  if (action === 'download-documentation') downloadDocumentation();
  if (action === 'save') notify('Workspace settings saved');
  if (action === 'status-summary') {
    const menu = document.querySelector('#statusMenu');
    const button = element.closest('.status-menu-wrap').querySelector('.more-btn');
    const isOpen = menu.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
  }
  if (action === 'status-details') {
    document.querySelector('#statusMenu')?.classList.remove('open');
    notify('184 compliant · 48 review needed · 16 non-compliant');
  }
  if (action === 'status-review') {
    document.querySelector('#statusMenu')?.classList.remove('open');
    showPage('history');
    notify('Showing inspections that need attention');
  }
  if (action === 'status-analytics') {
    document.querySelector('#statusMenu')?.classList.remove('open');
    showPage('analytics');
  }
  if (action === 'invite') {
    if (currentRole !== 'Administrator') { notify('Administrator access is required to add members'); return; }
    document.querySelector('#memberModal').classList.remove('hidden');
    refreshIcons();
  }
  if (action === 'close-member') document.querySelector('#memberModal').classList.add('hidden');
});
document.addEventListener('change', (event) => {
  if (event.target.id === 'workflowFileInput') {
    handleFiles(event.target.files);
    event.target.value = '';
  }
  if (event.target.id === 'activityRange') {
    document.querySelector('#activityRangeLabel').textContent = event.target.selectedOptions[0].textContent;
    updateActivityChart(event.target.value);
  }
  if (event.target.id === 'ocrLanguage') {
    ocrLanguage = event.target.value;
    notify('Label language updated');
  }
  if (event.target.id === 'rulesLibraryInput') {
    addRulesLibraryFile(event.target.files[0]);
    event.target.value = '';
  }
  if (event.target.id === 'featureScope') {
    featureScope = event.target.value;
    notify('Feature scope updated');
  }
});
document.addEventListener('input', (event) => {
  if (!event.target.matches('.search-box input')) return;
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll('.history-row').forEach((row) => row.classList.toggle('hidden', query && !row.textContent.toLowerCase().includes(query)));
});
document.addEventListener('dragover', (event) => { const zone = event.target.closest('.dropzone'); if (zone) { event.preventDefault(); zone.classList.add('dragging'); } });
document.addEventListener('drop', (event) => { const zone = event.target.closest('.dropzone'); if (zone) { event.preventDefault(); zone.classList.remove('dragging'); handleFiles(event.dataTransfer.files); } });
document.querySelector('#startScan').addEventListener('click', () => { scanStage = 'capture'; showPage('scan'); });
document.querySelector('#quickScan').addEventListener('click', () => { scanStage = 'capture'; showPage('scan'); });
document.querySelectorAll('[data-page-target]').forEach((button) => button.addEventListener('click', () => showPage(button.dataset.pageTarget || 'repository')));
document.querySelector('#mobileMenu').addEventListener('click', () => sidebar.classList.toggle('open'));
document.addEventListener('click', (event) => {
  if (!event.target.closest('.top-actions') && !event.target.closest('.profile')) {
    document.querySelector('#notificationPopover').classList.remove('open');
    document.querySelector('#accountPopover').classList.remove('open');
  }
  if (!event.target.closest('.status-menu-wrap')) {
    const menu = document.querySelector('#statusMenu');
    const button = document.querySelector('.status-menu-wrap .more-btn');
    menu?.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
  }
  if (!event.target.closest('#historyFilterMenu') && !event.target.closest('[data-action="history-filter-toggle"]')) {
    const menu = document.querySelector('#historyFilterMenu');
    const button = document.querySelector('[data-action="history-filter-toggle"]');
    menu?.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
  }
});
function downloadReport(reportId) {
  const selectedReport = reportId
    ? scanHistory.find((report) => String(report.id) === String(reportId))
    : scanHistory[0];
  if (selectedReport) {
    inspectionData = {
      ...inspectionData,
      ...selectedReport,
      inspector: selectedReport.inspectorName || selectedReport.inspector || currentUserName,
      inspectorEmail: selectedReport.inspectorEmail || currentUserEmail,
      findings: selectedReport.findings || []
    };
  }
  const declarations = [
    ['Common name of commodity', inspectionData.commonNameOfCommodity || 'Not detected'],
    ['Manufacturer / packer details', inspectionData.manufacturer || 'Not detected'],
    ['Manufacturer address', inspectionData.manufacturerAddress || 'Not detected'],
    ['Country of origin', inspectionData.originCountry || 'Not detected'],
    ['Net quantity', inspectionData.quantity || 'Not detected'],
    ['MRP declaration', inspectionData.mrp || 'Not detected'],
    ['Unit sale price', inspectionData.unitSalePrice || 'Not detected'],
    ['Manufacture date', inspectionData.manufactureDate || 'Not detected'],
    ['Expiry date', inspectionData.expiryDate || 'Not detected'],
    ['Shelf life', inspectionData.shelfLife || 'Not detected'],
    ['Consumer care information', inspectionData.care || 'Not detected'],
    ['Font size readability', inspectionData.fontSizeReadability || 'Not detected']
  ];
  const findings = inspectionData.findings && inspectionData.findings.length
    ? inspectionData.findings
    : [{ label: 'No readable declarations were extracted', detected: false, value: 'Retake the label image in clear light for a more reliable inspection.' }];
  const images = selectedFiles.length ? selectedFiles.map((file, index) => `${index + 1}. ${file.name}`) : ['No image files recorded.'];

  const pdfConstructor = window.jspdf?.jsPDF;
  if (pdfConstructor) {
    try {
      const pdf = new pdfConstructor();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const statusTone = inspectionData.status === 'Compliant' ? [80, 155, 90] : inspectionData.status === 'Non-compliant' ? [197, 72, 59] : [240, 160, 46];
      const accentGray = [90, 98, 110];
      let y = 18;
      const newPage = () => {
        if (y > pageHeight - 30) {
          pdf.addPage();
          y = 18;
        }
      };
      const addHeading = (heading, size = 12) => {
        newPage();
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(size);
        pdf.text(heading, 14, y);
        y += 8;
      };
      const addParagraph = (text, fontSize = 9, bold = false) => {
        newPage();
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, 180);
        lines.forEach((line) => {
          if (y > pageHeight - 18) {
            pdf.addPage();
            y = 18;
          }
          pdf.text(line, 14, y);
          y += 5;
        });
      };
      const addSummaryCard = (label, value, x, width, fill) => {
        pdf.setFillColor(...fill);
        pdf.roundedRect(x, y, width, 16, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.2);
        pdf.text(label, x + 5, y + 6);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10.5);
        pdf.text(String(value), x + 5, y + 13);
        pdf.setTextColor(25, 25, 25);
      };
      const addFieldRow = (label, value) => {
        const safeLabel = String(label || 'Field');
        const safeValue = String(value || 'Not detected');
        newPage();
        pdf.setFillColor(245, 247, 250);
        pdf.roundedRect(14, y, 182, 11, 1.5, 1.5, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.text(safeLabel, 18, y + 7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(safeValue, 92, y + 7.5);
        y += 13;
      };

      pdf.setFillColor(17, 79, 123);
      pdf.rect(10, 10, pageWidth - 20, 18, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('METRALENS INSPECTION REPORT', 15, 22);
      pdf.setTextColor(25, 25, 25);
      y = 36;
      addSummaryCard('Status', inspectionData.status || 'Review needed', 14, 52, statusTone);
      addSummaryCard('Score', `${inspectionScore()} / 100`, 72, 42, [32, 105, 160]);
      addSummaryCard('Images', String(selectedFiles.length), 120, 30, [109, 109, 109]);
      addSummaryCard('Scan ID', 'MC-26034-0084', 156, 44, [75, 99, 135]);
      y = 58;
      addParagraph(`Product: ${inspectionData.productName || 'Scanned product'}`, 10, true);
      addParagraph(`Inspector: ${inspectionData.inspector || currentUserName || 'Jay Chauhan'}`, 9);
      addParagraph(`Compliance status: ${inspectionData.status || 'Review needed'} | Recommended review: ${inspectionData.reviewRole || 'Enforcement officer'}`, 9);
      y += 2;
      addHeading('DECLARATION SUMMARY', 12);
      declarations.forEach(([label, value]) => addFieldRow(label, value));
      addHeading('FINDINGS', 12);
      findings.forEach((finding) => {
        const statusText = finding.detected ? 'Detected' : 'Not detected';
        const content = `${finding.label}: ${statusText} - ${finding.value || 'No value reported'}`;
        const lines = pdf.splitTextToSize(content, 170);
        pdf.setFont('helvetica', finding.detected ? 'bold' : 'normal');
        pdf.setFontSize(8.8);
        lines.forEach((line) => {
          newPage();
          pdf.text(line, 14, y);
          y += 5;
        });
        y += 2;
      });
      addHeading('IMAGE EVIDENCE', 12);
      images.forEach((imageEntry) => {
        const lines = pdf.splitTextToSize(`• ${imageEntry}`, 170);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.8);
        lines.forEach((line) => {
          newPage();
          pdf.text(line, 14, y);
          y += 5;
        });
      });
      addHeading('OFFICER NOTE', 12);
      addParagraph('This report is an assistive review and must be verified by an authorized officer before final compliance action is taken.', 8.8);
      pdf.setDrawColor(...accentGray);
      pdf.line(14, y + 8, 80, y + 8);
      pdf.line(120, y + 8, 186, y + 8);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.text('Inspector signature', 14, y + 16);
      pdf.text('Authorized officer', 120, y + 16);
      pdf.save(`metra-lens-report-${(inspectionData.productName || 'product').toLowerCase().replace(/\s+/g, '-')}.pdf`);
      addNotification('Report generated', `${inspectionData.productName || 'Inspection'} report is ready to download.`, { icon: 'file-check-2', tone: 'blue' });
      notify('PDF report downloaded successfully');
      return;
    } catch (err) {
      console.warn('jsPDF error, using fallback download:', err);
    }
  }

  const reportText = `=================================================\n` +
    `METRALENS LEGAL METROLOGY INSPECTION REPORT\n` +
    `=================================================\n` +
    `Product Name : ${inspectionData.productName || 'Scanned product'}\n` +
    `Scan ID      : MC-26034-0084\n` +
    `Inspector    : ${inspectionData.inspector || currentUserName}\n` +
    `Role         : ${currentRole}\n` +
    `Status       : ${inspectionData.status || 'Review needed'}\n` +
    `Score        : ${inspectionScore()} / 100\n` +
    `Date         : ${new Date().toLocaleString()}\n` +
    `-------------------------------------------------\n\n` +
    `DECLARATION DETAILS:\n` +
    declarations.map(([l, v]) => `  - ${l.padEnd(30, ' ')}: ${v}`).join('\n') +
    `\n\nFINDINGS & VIOLATIONS:\n` +
    findings.map(f => `  - ${f.label}: ${f.detected ? 'COMPLIANT' : 'VIOLATION'} (${f.value})`).join('\n') +
    `\n\nOFFICER REMARKS:\n` +
    `This report is generated by MetraLens Legal Metrology Inspection Suite.\n` +
    `Verified by authorized officer: ${currentUserName}\n` +
    `=================================================\n`;

  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `metra-lens-report-${(inspectionData.productName || 'product').toLowerCase().replace(/\s+/g, '-')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  addNotification('Report generated', `${inspectionData.productName || 'Inspection'} report is ready to download.`, { icon: 'file-check-2', tone: 'blue' });
  notify('Inspection report downloaded as text file');
}
function downloadDocumentation() {
  const pdfConstructor = window.jspdf?.jsPDF;
  if (!pdfConstructor) { notify('PDF generator is unavailable. Check your internet connection.'); return; }
  const pdf = new pdfConstructor();
  const content = ['METRALENS TECHNICAL DOCUMENTATION', '', 'SYSTEM OVERVIEW', 'metraLens is a browser-based packaged-commodity label inspection workspace. It uses client-side OCR to read label images, extracts declarations and calculates an assistive compliance score.', '', 'TECHNICAL FRAMEWORK', 'Frontend: semantic HTML, CSS and vanilla JavaScript.', 'Icons: Lucide.', 'OCR: Tesseract.js in the browser.', 'PDF reports: jsPDF in the browser.', 'Data: current browser session.', '', 'DEPLOYMENT', '1. Place index.html, styles.css and script.js in one web directory.', '2. Serve the directory through a static web server; HTTPS is recommended for camera access.', '3. Open the site in a current Chrome, Edge or Firefox browser.', '4. Allow access to the CDN resources, or host the libraries locally for offline deployment.', '', 'HOW TO USE', '1. Register or sign in and choose an officer role.', '2. Open Scan product or Capture inspection.', '3. Upload or capture front, back and side label images.', '4. Select the label language, preview images and start inspection.', '5. Review declarations and warnings against the physical label.', '6. Open Reports and download the inspection as a PDF.', '', 'OCR results are assistive and must be verified by an authorized officer.'];
  const lines = pdf.splitTextToSize(content.join('\n'), 175);
  let y = 16;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  lines.forEach((line) => { if (y > 282) { pdf.addPage(); y = 16; } pdf.text(line, 15, y); y += 5; });
  pdf.save('metra-lens-technical-documentation.pdf');
  notify('Technical documentation downloaded as PDF');
}
document.querySelector('#exportReport')?.addEventListener('click', downloadReport);
const API_BASE = (window.location.port === '5500' || window.location.port === '3000') ? 'http://localhost:8080' : '';

function clearLoginFieldErrors() {
  ['#loginEmail', '#loginPhone', '#loginPassword', '#loginRole'].forEach(id => {
    const el = document.querySelector(id);
    if (el) el.classList.remove('input-invalid');
  });
  ['#loginEmailError', '#loginPhoneError', '#loginPasswordError', '#loginRoleError'].forEach(id => {
    const el = document.querySelector(id);
    if (el) {
      el.textContent = '';
      el.classList.remove('visible');
    }
  });
}

function showLoginFieldError(fieldId, errorSpanId, message) {
  const field = document.querySelector(fieldId);
  const errorSpan = document.querySelector(errorSpanId);
  if (field) field.classList.add('input-invalid');
  if (errorSpan) {
    errorSpan.textContent = message;
    errorSpan.classList.add('visible');
  }
}

['#loginEmail', '#loginPhone', '#loginPassword', '#loginRole'].forEach(id => {
  const el = document.querySelector(id);
  if (el) {
    el.addEventListener('input', () => {
      el.classList.remove('input-invalid');
      const errSpan = document.querySelector(`${id}Error`);
      if (errSpan) {
        errSpan.textContent = '';
        errSpan.classList.remove('visible');
      }
    });
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearLoginFieldErrors();

  const loginFormElement = event.currentTarget;
  const mobileInput = document.querySelector('#loginPhone');
  const mobile = sanitizePhoneValue(mobileInput.value);

  if (mobile.length !== 10) {
    showLoginFieldError('#loginPhone', '#loginPhoneError', 'Please enter a valid 10-digit mobile number.');
    return;
  }
  mobileInput.value = mobile;
  if (!loginFormElement.reportValidity()) return;

  const email = document.querySelector('#loginEmail').value.trim();
  const password = document.querySelector('#loginPassword').value;
  const selectedRole = document.querySelector('#loginRole').value;

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        phone: mobile,
        password: password,
        role: selectedRole
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      const lowerErr = (errorText || '').toLowerCase();

      let mapped = false;
      if (lowerErr.includes('role')) {
        showLoginFieldError('#loginRole', '#loginRoleError', errorText);
        mapped = true;
      }
      if (lowerErr.includes('phone')) {
        showLoginFieldError('#loginPhone', '#loginPhoneError', errorText);
        mapped = true;
      }
      if (lowerErr.includes('password')) {
        showLoginFieldError('#loginPassword', '#loginPasswordError', errorText);
        mapped = true;
      }
      if (lowerErr.includes('email')) {
        showLoginFieldError('#loginEmail', '#loginEmailError', errorText);
        mapped = true;
      }
      if (!mapped) {
        showLoginFieldError('#loginPassword', '#loginPasswordError', errorText || 'Invalid credentials.');
      }

      notify(errorText || 'Login failed. Please check your credentials.');
      return;
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('metraLensToken', data.token);
    }
    if (data.name) {
      applyUserProfile(data.name, data.email);
    }
    currentRole = data.role || selectedRole;

    renderRoleNavigation();
    loginScreen.classList.add('hidden');
    showPage('overview');
    notify(`Welcome back, ${currentUserName}`);
  } catch (err) {
    console.error('Login connection error:', err);
    notify('Unable to connect to login service. Please check your backend connection.');
  }
});

registrationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const phoneInput = document.querySelector('#registrationPhone');
  const phone = sanitizePhoneValue(phoneInput.value);
  if (phone.length !== 10) {
    phoneInput.setCustomValidity('Please enter a valid 10-digit mobile number.');
    phoneInput.reportValidity();
    phoneInput.setCustomValidity('');
    return;
  }
  phoneInput.value = phone;
  if (!registrationForm.reportValidity()) return;
  const password = document.querySelector('#registrationPassword');
  const enteredName = document.querySelector('#registrationName').value.trim();
  const enteredEmail = document.querySelector('#registrationEmail').value.trim();
  const role = document.querySelector('#registrationRole').value;

  if (password.value.length < 8) {
    password.setCustomValidity('Password must be at least 8 characters.');
    password.reportValidity();
    password.setCustomValidity('');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: enteredName,
        email: enteredEmail,
        phone: phone,
        password: password.value,
        role: role
      })
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      notify(errorMsg || 'Registration failed');
      return;
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('metraLensToken', data.token);
    }

    if (enteredName) {
      applyUserProfile(enteredName, enteredEmail || currentUserEmail);
    }
    document.querySelector('#loginEmail').value = enteredEmail || currentUserEmail;
    document.querySelector('#loginPhone').value = phone;
    document.querySelector('#loginForm input[type="password"]').value = password.value;
    document.querySelector('#loginRole').value = role;
    localStorage.setItem(registrationStorageKey, 'true');
    showAuthForm(loginForm);
    notify('Registration complete & saved to database. Sign in to enter your workspace.');
  } catch (err) {
    console.error('Registration error:', err);
    notify('Could not connect to backend database server.');
  }
});
document.querySelector('#memberForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (currentRole !== 'Administrator') return;
  const name = document.querySelector('#memberName').value.trim();
  const role = document.querySelector('#memberRole').value;
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}@aletheia.gov.in`;

  try {
    const res = await fetch(`${API_BASE}/api/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role })
    });
    if (!res.ok) {
      const errText = await res.text();
      notify(errText || 'Failed to add team member');
      return;
    }
    const savedMember = await res.json();
    teamMembers.unshift(savedMember);
    addNotification('Team member added', `${savedMember.name || name} joined the inspection team.`, { icon: 'user-plus', tone: 'blue' });
    document.querySelector('#memberForm').reset();
    document.querySelector('#memberModal').classList.add('hidden');
    showPage('team');
    notify(`${name} added to the inspection team in database`);
  } catch (err) {
    console.error('Failed to save team member:', err);
    notify('Failed to connect to backend server');
  }
});
document.addEventListener('input', (event) => {
  if (!event.target.matches('input[type="tel"]')) return;
  event.target.value = sanitizePhoneValue(event.target.value);
  event.target.setCustomValidity(event.target.value.length === 10 ? '' : 'Please enter a valid 10-digit mobile number.');
});

document.addEventListener('click', (event) => {
  const passwordToggle = event.target.closest('.password-toggle');
  if (!passwordToggle) return;
  const input = document.querySelector(`#${passwordToggle.dataset.passwordTarget}`);
  if (!input) return;
  const shouldShow = input.type === 'password';
  setPasswordVisibility(passwordToggle, input, shouldShow);
});

function startNotificationPolling() {
  if (notificationPollingTimer) clearInterval(notificationPollingTimer);
  notificationPollingTimer = setInterval(() => {
    if (!document.hidden) fetchInspectionsFromBackend(true);
  }, 15000);
}

renderNotifications();
updateActivityChart('30');
fetchInspectionsFromBackend();
fetchTeamFromBackend();
startNotificationPolling();
