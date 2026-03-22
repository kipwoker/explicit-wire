// ==================== LAYOUT CONSTANTS ====================
export const LAYOUT = {
    // Column positions
    columns: {
        render: 60,      // Render phase column
        eventBinding: 350, // Event binding phase column  
        execution: 640,  // Execution phase column
    },
    
    // Row positions
    rows: {
        row1: 80,    // First row
        row2: 200,   // Second row
        row3: 320,   // Third row
        row4: 440,   // Fourth row
    },
    
    // Node dimensions
    node: {
        width: 180,
        height: 60,
    },
    
    // Legend position
    legend: {
        x: 850,
        y: 120,
    },
} as const

// ==================== COLOR CONSTANTS ====================
export const COLORS = {
    // Phase colors
    render: '#667eea',
    eventBinding: '#f093fb',
    execution: '#38ef7d',
    domChanges: '#f5576c',
    
    // Fill colors (with alpha)
    fills: {
        render: 'rgba(102, 126, 234, 0.3)',
        eventBinding: 'rgba(240, 147, 251, 0.3)',
        execution: 'rgba(56, 239, 125, 0.3)',
        domChanges: 'rgba(245, 87, 108, 0.3)',
        handlerPool: 'rgba(255, 255, 255, 0.05)',
    },
    
    // Text colors
    text: {
        primary: '#fff',
        secondary: '#888',
        subtext: '#aaa',
    },
} as const

// ==================== NODE IDS ====================
export const NODE_IDS = {
    // Render phase
    viewManager: 'vm',
    control: 'control',
    htmlString: 'html',
    domInjection: 'dom',
    
    // Event binding phase
    onFunction: 'on-func',
    collectedHandlers: 'collected',
    mutationObserver: 'observer',
    registeredHandlers: 'registered',
    
    // Execution phase
    userClicks: 'click',
    proxy: 'proxy',
    handler: 'handler',
} as const

// ==================== ARROW IDS ====================
export const ARROW_IDS = {
    // Render phase arrows
    vmToControl: 'arrow-vm-control',
    controlToHtml: 'arrow-control-html',
    htmlToDom: 'arrow-html-dom',
    
    // Event binding arrows
    controlToOn: 'arrow-control-on',
    onToCollected: 'arrow-on-collected',
    domToObserver: 'arrow-dom-observer',
    collectedToObserver: 'arrow-collected-observer',
    observerToRegistered: 'arrow-observer-registered',
    
    // Execution arrows
    registeredToClick: 'arrow-registered-click',
    clickToProxy: 'arrow-click-proxy',
    proxyToHandler: 'arrow-proxy-handler',
} as const

// ==================== MARKER IDS ====================
export const MARKER_IDS = {
    blue: 'arrow-blue',
    green: 'arrow-green',
    purple: 'arrow-purple',
    red: 'arrow-red',
} as const

// ==================== STEP NUMBERS ====================
export const STEP_NUMBERS = [
    { x: LAYOUT.columns.render - 15, y: LAYOUT.rows.row1 + LAYOUT.node.height / 2, num: '1', color: COLORS.render },
    { x: LAYOUT.columns.render - 15, y: LAYOUT.rows.row2 + LAYOUT.node.height / 2, num: '2', color: COLORS.render },
    { x: LAYOUT.columns.eventBinding - 15, y: LAYOUT.rows.row1 + LAYOUT.node.height / 2, num: '3', color: COLORS.eventBinding },
    { x: LAYOUT.columns.eventBinding - 15, y: LAYOUT.rows.row2 + LAYOUT.node.height / 2, num: '4', color: COLORS.eventBinding },
    { x: LAYOUT.columns.render - 15, y: LAYOUT.rows.row3 + LAYOUT.node.height / 2, num: '5', color: COLORS.render },
    { x: LAYOUT.columns.render - 15, y: LAYOUT.rows.row4 + LAYOUT.node.height / 2, num: '6', color: COLORS.domChanges },
    { x: LAYOUT.columns.eventBinding - 15, y: LAYOUT.rows.row3 + LAYOUT.node.height / 2, num: '7', color: COLORS.eventBinding },
    { x: LAYOUT.columns.eventBinding - 15, y: LAYOUT.rows.row4 + LAYOUT.node.height / 2, num: '8', color: COLORS.execution },
    { x: LAYOUT.columns.execution - 15, y: LAYOUT.rows.row2 + LAYOUT.node.height / 2, num: '9', color: COLORS.domChanges },
    { x: LAYOUT.columns.execution - 15, y: LAYOUT.rows.row3 + LAYOUT.node.height / 2, num: '10', color: COLORS.execution },
    { x: LAYOUT.columns.execution - 15, y: LAYOUT.rows.row4 + LAYOUT.node.height / 2, num: '11', color: COLORS.execution },
]

// ==================== STEP INDICATOR IDS ====================
export const STEP_INDICATOR_IDS = {
    step1: 'step-1',
    step2: 'step-2',
    step3: 'step-3',
    step4: 'step-4',
    step5: 'step-5',
    step6: 'step-6',
    step7: 'step-7',
    step8: 'step-8',
} as const

// ==================== LEGEND ITEMS ====================
export const LEGEND_ITEMS = [
    { color: COLORS.render, label: 'Render flow' },
    { color: COLORS.eventBinding, label: 'Event binding' },
    { color: COLORS.domChanges, label: 'DOM changes' },
    { color: COLORS.execution, label: 'Handler execution' },
]

// ==================== PHASE LABELS ====================
export const PHASE_LABELS = [
    { x: LAYOUT.columns.render + LAYOUT.node.width / 2, color: COLORS.render, text: 'RENDER PHASE' },
    { x: LAYOUT.columns.eventBinding + LAYOUT.node.width / 2, color: COLORS.eventBinding, text: 'EVENT BINDING' },
    { x: LAYOUT.columns.execution + LAYOUT.node.width / 2, color: COLORS.execution, text: 'EXECUTION' },
]