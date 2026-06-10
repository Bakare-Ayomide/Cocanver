import { Project, Page, CanvasElement } from "../types";

// Dynamic SVG backdrops representing a realistic modern UI screenshot
export const getAuthBackdrop = () => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%231e1b4b" />
        <stop offset="50%" stop-color="%23311042" />
        <stop offset="100%" stop-color="%230f172a" />
      </linearGradient>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%231e293b" />
        <stop offset="100%" stop-color="%230f172a" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(%23g1)" />
    
    <!-- Background dots design -->
    <g fill="%234338ca" opacity="0.15">
      <circle cx="100" cy="100" r="2" />
      <circle cx="300" cy="150" r="2" />
      <circle cx="150" cy="400" r="3" />
      <circle cx="900" cy="200" r="2.5" />
      <circle cx="1000" cy="600" r="3" />
      <circle cx="500" cy="700" r="2" />
    </g>
    
    <!-- Grid -->
    <path d="M 0,0 L 1200,0 M 0,50 L 1200,50 M 0,100 L 1200,100 M 0,150 L 1200,150 M 0,200 L 1200,200 M 0,250 L 1200,250 M 0,300 L 1200,300 M 0,350 L 1200,350 M 0,400 L 1200,400 M 0,450 L 1200,450 M 0,500 L 1200,500 M 0,550 L 1200,550 M 0,600 L 1200,600 M 0,650 L 1200,650 M 0,700 L 1200,700 M 0,750 L 1200,750" stroke="%23ffffff" stroke-width="1" opacity="0.03" />
    <path d="M 0,0 L 0,800 M 100,0 L 100,800 M 200,0 L 200,800 M 300,0 L 300,800 M 400,0 L 400,800 M 500,0 L 500,800 M 600,0 L 600,800 M 700,0 L 700,800 M 800,0 L 800,800 M 900,0 L 900,800 M 1000,0 L 1000,800 M 1100,0 L 1100,800" stroke="%23ffffff" stroke-width="1" opacity="0.03" />

    <!-- Card frame -->
    <rect x="400" y="150" width="400" height="500" rx="24" fill="url(%23cardGrad)" stroke="%233b82f6" stroke-width="2" opacity="0.9" />
    
    <!-- Header visual -->
    <circle cx="600" cy="220" r="30" fill="%232563eb" />
    <path d="M 590,225 L 600,210 L 610,225 Z" fill="%23ffffff" />
    
    <text x="600" y="280" font-family="'Inter', sans-serif" font-weight="bold" font-size="28" fill="%23ffffff" text-anchor="middle">Welcome Back</text>
    <text x="600" y="305" font-family="'Inter', sans-serif" font-size="14" fill="%2394a3b8" text-anchor="middle">Sign in to manage your spaces</text>

    <!-- Visual field rectangles for design context -->
    <rect x="440" y="350" width="320" height="48" rx="8" fill="%231e293b" stroke="%23334155" stroke-width="1.5" />
    <text x="456" y="378" font-family="'Inter', sans-serif" font-size="14" fill="%23475569">Email Address</text>

    <rect x="440" y="420" width="320" height="48" rx="8" fill="%231e293b" stroke="%23334155" stroke-width="1.5" />
    <text x="456" y="448" font-family="'Inter', sans-serif" font-size="14" fill="%23475569">Password</text>
    
    <!-- Checkbox placeholder -->
    <rect x="444" y="490" width="16" height="16" rx="4" fill="%231e293b" stroke="%23475569" stroke-width="1.5" />
    <text x="470" y="503" font-family="'Inter', sans-serif" font-size="13" fill="%2394a3b8">Remember me</text>

    <!-- Login Button visual -->
    <rect x="440" y="530" width="320" height="48" rx="8" fill="%232563eb" />
    <text x="600" y="559" font-family="'Inter', sans-serif" font-weight="600" font-size="16" fill="%23ffffff" text-anchor="middle">Access Account</text>
    
    <!-- Links visual -->
    <text x="760" y="503" font-family="'Inter', sans-serif" font-size="13" fill="%233b82f6" text-anchor="end">Forgot Password?</text>
    <text x="600" y="615" font-family="'Inter', sans-serif" font-size="13" fill="%2364748b" text-anchor="middle">Don't have an account? <tspan fill="%233b82f6">Create free</tspan></text>
  </svg>`;
};

export const getDashboardBackdrop = () => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="sidebarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%230f172a" />
        <stop offset="100%" stop-color="%231e293b" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="%23f8fafc" />
    
    <!-- Sidebar -->
    <rect width="250" height="800" fill="url(%23sidebarGrad)" />
    
    <!-- Brand -->
    <circle cx="50" cy="40" r="14" fill="%233b82f6" />
    <rect x="45" y="32" width="10" height="16" rx="2" fill="%23ffffff" />
    <text x="80" y="46" font-family="'Inter', sans-serif" font-weight="900" font-size="20" fill="%23ffffff">CanvasPay</text>
    
    <!-- Navigation Links visual -->
    <rect x="15" y="100" width="220" height="40" rx="8" fill="%232563eb" opacity="0.3" />
    <text x="30" y="125" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="%2360a5fa">✦ Dashboard</text>
    <text x="30" y="175" font-family="'Inter', sans-serif" font-size="14" fill="%2394a3b8">☵ Transactions</text>
    <text x="30" y="225" font-family="'Inter', sans-serif" font-size="14" fill="%2394a3b8">⎙ Invoices</text>
    <text x="30" y="275" font-family="'Inter', sans-serif" font-size="14" fill="%2394a3b8">⚙ Settings</text>
    <text x="30" y="730" font-family="'Inter', sans-serif" font-size="13" fill="%23ef4444">➔ Log Out</text>
    
    <!-- Top Header -->
    <rect x="250" width="950" height="70" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1" />
    <text x="280" y="42" font-family="'Inter', sans-serif" font-weight="700" font-size="22" fill="%230f172a">Financial Analytics Overview</text>
    <text x="1150" y="42" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="%23334155" text-anchor="end">Sarah Jenkins</text>
    <circle cx="1170" cy="38" r="16" fill="%23cbd5e1" />
    
    <!-- Dynamic Bento Cards -->
    <!-- Card 1: Balance -->
    <rect x="280" y="100" width="280" height="140" rx="16" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5" />
    <text x="310" y="140" font-family="'Inter', sans-serif" font-size="14" fill="%2364748b">Current Net Worth</text>
    <text x="310" y="180" font-family="'Inter', sans-serif" font-weight="800" font-size="30" fill="%230f172a">$145,280.50</text>
    <text x="310" y="212" font-family="'Inter', sans-serif" font-size="12" fill="%2322c55e">▲ +12.4% from last month</text>
    
    <!-- Card 2: Revenue -->
    <rect x="580" y="100" width="280" height="140" rx="16" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5" />
    <text x="610" y="140" font-family="'Inter', sans-serif" font-size="14" fill="%2364748b">Monthly Sales Volume</text>
    <text x="610" y="180" font-family="'Inter', sans-serif" font-weight="800" font-size="30" fill="%230f172a">$48,930.22</text>
    <text x="610" y="212" font-family="'Inter', sans-serif" font-size="12" fill="%2322c55e">▲ +8.2% vs target</text>
    
    <!-- Card 3: Invoices Status -->
    <rect x="880" y="100" width="280" height="140" rx="16" fill="%232563eb" />
    <text x="910" y="140" font-family="'Inter', sans-serif" font-size="14" fill="%2393c5fd">Open Invoices</text>
    <text x="910" y="180" font-family="'Inter', sans-serif" font-weight="800" font-size="30" fill="%23ffffff">14</text>
    <text x="910" y="212" font-family="'Inter', sans-serif" font-size="12" fill="%2393c5fd">⏳ 3 require immediate attention</text>
    
    <!-- Content Section -->
    <rect x="280" y="270" width="880" height="490" rx="16" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5" />
    
    <text x="310" y="320" font-family="'Inter', sans-serif" font-weight="700" font-size="18" fill="url(%23g1)">Billing Workspace</text>
    <text x="310" y="342" font-family="'Inter', sans-serif" font-size="13" fill="%2364748b">Use this test portal to draft quick interactive client payouts</text>

    <!-- Action panel lines -->
    <rect x="310" y="380" width="820" height="1" fill="%23e2e8f0" />
    
    <text x="310" y="420" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="%23334155">Recipient Name</text>
    <rect x="310" y="435" width="250" height="40" rx="8" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1.5" />
    
    <text x="590" y="420" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="%23334155">Payout Amount ($)</text>
    <rect x="590" y="435" width="180" height="40" rx="8" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1.5" />
    
    <text x="800" y="420" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="%23334155">Transfer Method</text>
    <rect x="800" y="435" width="200" height="40" rx="8" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1.5" />
    
    <rect x="1030" y="435" width="100" height="40" rx="8" fill="%2322c55e" />
    <text x="1080" y="460" font-family="'Inter', sans-serif" font-weight="bold" font-size="14" fill="%23ffffff" text-anchor="middle">Execute</text>
    
    <text x="310" y="530" font-family="'Inter', sans-serif" font-weight="700" font-size="15" fill="%230f172a">Recent Payments</text>
    
    <!-- Table Mockup lines -->
    <rect x="310" y="550" width="820" height="180" rx="8" fill="%23f8fafc" stroke="%23e2e8f0" stroke-width="1" />
    <line x1="310" y1="590" x2="1130" y2="590" stroke="%23e2e8f0" stroke-width="1" />
    <line x1="310" y1="630" x2="1130" y2="630" stroke="%23e2e8f0" stroke-width="1" />
    <line x1="310" y1="670" x2="1130" y2="670" stroke="%23e2e8f0" stroke-width="1" />
    
    <text x="330" y="575" font-family="'Inter', sans-serif" font-weight="600" font-size="12" fill="%2364748b">RECIPIENT</text>
    <text x="600" y="575" font-family="'Inter', sans-serif" font-weight="600" font-size="12" fill="%2364748b">METHOD</text>
    <text x="820" y="575" font-family="'Inter', sans-serif" font-weight="600" font-size="12" fill="%2364748b">STATUS</text>
    <text x="1110" y="575" font-family="'Inter', sans-serif" font-weight="600" font-size="12" fill="%2364748b" text-anchor="end">AMOUNT</text>
    
    <text x="330" y="612" font-family="'Inter', sans-serif" font-size="13" fill="%231e293b">Vance Refrigeration Inc.</text>
    <text x="600" y="612" font-family="'Inter', sans-serif" font-size="13" fill="%23475569">Bank Transfer</text>
    <rect x="820" y="598" width="60" height="20" rx="10" fill="%23dcfce7" />
    <text x="850" y="612" font-family="'Inter', sans-serif" font-size="11" fill="%23166534" font-weight="600" text-anchor="middle">Settled</text>
    <text x="1110" y="612" font-family="'Inter', sans-serif" font-weight="bold" font-size="13" fill="%231e293b" text-anchor="end">$4,250.00</text>
    
    <text x="330" y="652" font-family="'Inter', sans-serif" font-size="13" fill="%231e293b">Dunder Mifflin Paper Co.</text>
    <text x="600" y="652" font-family="'Inter', sans-serif" font-size="13" fill="%23475569">ACH AutoPay</text>
    <rect x="820" y="638" width="60" height="20" rx="10" fill="%23dcfce7" />
    <text x="850" y="652" font-family="'Inter', sans-serif" font-size="11" fill="%23166534" font-weight="600" text-anchor="middle">Settled</text>
    <text x="1110" y="652" font-family="'Inter', sans-serif" font-weight="bold" font-size="13" fill="%231e293b" text-anchor="end">$1,890.12</text>

    <!-- Third row editable dynamically -->
    <text id="user_recipient" x="330" y="692" font-family="'Inter', sans-serif" font-size="13" fill="%233b82f6" font-weight="600">[Waiting for input...]</text>
    <text id="user_method" x="600" y="692" font-family="'Inter', sans-serif" font-size="13" fill="%23475569">Direct Wire</text>
    <rect x="820" y="678" width="65" height="20" rx="10" fill="%23fef9c3" />
    <text x="852" y="692" font-family="'Inter', sans-serif" font-size="11" fill="%23854d0e" font-weight="600" text-anchor="middle">Processing</text>
    <text id="user_amount" x="1110" y="692" font-family="'Inter', sans-serif" font-weight="bold" font-size="13" fill="%230f172a" text-anchor="end">$0.00</text>
  </svg>`;
};

export const getCheckoutBackdrop = () => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <rect width="100%" height="100%" fill="%23faf8f6" />
    
    <!-- Top banner -->
    <rect width="1200" height="80" fill="%23debc85" />
    <text x="100" y="48" font-family="'Playfair Display', Georgia, serif" font-weight="bold" font-size="24" fill="%231c1917">LUMIÈRE Maison </text>
    <text x="1100" y="48" font-family="'Inter', sans-serif" font-size="14" fill="%231c1917" text-anchor="end">Shopping Bag (1) — $245.00</text>
    
    <!-- Layout Grid -->
    <!-- Column 1: Review Form -->
    <rect x="100" y="120" width="620" height="600" rx="12" fill="%23ffffff" stroke="%23ebd5c4" stroke-width="1.5" />
    <text x="140" y="170" font-family="'Inter', sans-serif" font-weight="800" font-size="20" fill="%231c1917">Secure Premium Checkout</text>
    <text x="140" y="195" font-family="'Inter', sans-serif" font-size="13" fill="%2378716c">Items ship within 24 hours with Priority delivery.</text>
    
    <rect x="140" y="220" width="540" height="1" fill="%23ebd5c4" />
    
    <!-- Form Steps: Shipping info -->
    <text x="140" y="260" font-family="'Inter', sans-serif" font-weight="bold" font-size="13" fill="%23ae2c20">01. DELIVERY DETAILS</text>
    
    <text x="140" y="300" font-family="'Inter', sans-serif" font-weight="600" font-size="13" fill="%2344403c">Full Name</text>
    <rect x="140" y="315" width="250" height="42" rx="6" fill="%23fafaf9" stroke="%23ebd5c4" stroke-width="1" />
    
    <text x="420" y="300" font-family="'Inter', sans-serif" font-weight="600" font-size="13" fill="%2344403c">Phone Number</text>
    <rect x="420" y="315" width="260" height="42" rx="6" fill="%23fafaf9" stroke="%23ebd5c4" stroke-width="1" />
    
    <text x="140" y="390" font-family="'Inter', sans-serif" font-weight="600" font-size="13" fill="%2344403c">Shipping Address</text>
    <rect x="140" y="405" width="540" height="42" rx="6" fill="%23fafaf9" stroke="%23ebd5c4" stroke-width="1" />
    
    <text x="140" y="480" font-family="'Inter', sans-serif" font-weight="bold" font-size="13" fill="%23ae2c20">02. VERIFY METHOD</text>
    
    <!-- Checkboxes -->
    <rect x="140" y="510" width="18" height="18" rx="4" fill="%23ffffff" stroke="%231c1917" stroke-width="1.5" />
    <text x="170" y="524" font-family="'Inter', sans-serif" font-size="13" fill="%2344403c">Priority Air Courier (Free)</text>
    
    <rect x="420" y="510" width="18" height="18" rx="4" fill="%23ffffff" stroke="%23ae2c20" stroke-width="1.5" />
    <text x="450" y="524" font-family="'Inter', sans-serif" font-size="13" fill="%23ae2c20" font-weight="600">Agree to Terms &amp; Policies</text>
    
    <!-- Button -->
    <rect x="140" y="580" width="540" height="50" rx="8" fill="%231c1917" />
    <text x="410" y="611" font-family="'Inter', sans-serif" font-weight="bold" font-size="15" fill="%23ffffff" text-anchor="middle">Purchase Ticket &amp; Order</text>
    
    <!-- Column 2: Cart Summary -->
    <rect x="760" y="120" width="340" height="340" rx="12" fill="%23f5ebe2" stroke="%23ebd5c4" stroke-width="1" />
    <text x="790" y="165" font-family="'Inter', sans-serif" font-weight="700" font-size="16" fill="%231c1917">Order Summary</text>
    
    <text x="790" y="210" font-family="'Inter', sans-serif" font-size="14" fill="%2357534e">Bougie Parfumée No. IV</text>
    <text x="1070" y="210" font-family="'Inter', sans-serif" font-weight="bold" font-size="14" fill="%231c1917" text-anchor="end">$220.00</text>
    
    <text x="790" y="250" font-family="'Inter', sans-serif" font-size="14" fill="%2357534e">Premium Gift Box Wrapping</text>
    <text x="1070" y="250" font-family="'Inter', sans-serif" font-weight="bold" font-size="14" fill="%231c1917" text-anchor="end">$25.00</text>
    
    <text x="790" y="290" font-family="'Inter', sans-serif" font-size="14" fill="%2357534e">Eco Direct Delivery</text>
    <text x="1070" y="290" font-family="'Inter', sans-serif" font-size="14" fill="%2322c55e" font-weight="600" text-anchor="end">FREE</text>
    
    <line x1="790" y1="320" x2="1070" y2="320" stroke="%23ebd5c4" stroke-width="1.5" />
    
    <text x="790" y="360" font-family="'Inter', sans-serif" font-weight="bold" font-size="17" fill="%231c1917">Grand Total</text>
    <text x="1070" y="360" font-family="'Inter', sans-serif" font-weight="900" font-size="20" fill="%23ae2c20" text-anchor="end">$245.00</text>
    
    <rect x="790" y="390" width="280" height="42" rx="6" fill="%23ffffff" stroke="%23ebd5c4" stroke-width="1" />
    <text x="810" y="416" font-family="'Inter', sans-serif" font-size="13" fill="%23c2b8b2">Enter Promo Code...</text>
  </svg>`;
};

// Procedural Template list
export const PRESET_TEMPLATES: Project[] = [
  {
    id: "template-auth",
    name: "Interactive Login Form",
    description: "Multi-click logic, form validators, popup warnings, and secure route shifts.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    selectedPageId: "auth-p1",
    pages: [
      {
        id: "auth-p1",
        name: "Login Portal",
        backgroundImage: getAuthBackdrop(),
        elements: [
          {
            id: "emailInput",
            type: "Email Input",
            label: "duwit.online.dev@gmail.com",
            placeholder: "Enter user email address",
            x: 36.6,
            y: 43.7,
            width: 26.6,
            height: 6.0,
            zIndex: 10,
            visible: true,
            locked: false,
            styles: { fontSize: "14px", borderRadius: "8px", backgroundColor: "transparent" },
            clickSequences: [],
            conditions: []
          },
          {
            id: "passwordInput",
            type: "Password Input",
            label: "••••••••",
            placeholder: "Enter account password",
            x: 36.6,
            y: 52.5,
            width: 26.6,
            height: 6.0,
            zIndex: 11,
            visible: true,
            locked: false,
            styles: { fontSize: "14px", borderRadius: "8px", backgroundColor: "transparent" },
            clickSequences: [],
            conditions: []
          },
          {
            id: "rememberMe",
            type: "Checkbox",
            label: "Remember Device",
            x: 37.0,
            y: 61.2,
            width: 1.5,
            height: 2.2,
            zIndex: 12,
            visible: true,
            locked: false,
            styles: {},
            clickSequences: [],
            conditions: []
          },
          {
            id: "submitButton",
            type: "Button",
            label: "Access Account",
            x: 36.6,
            y: 66.2,
            width: 26.6,
            height: 6.0,
            zIndex: 13,
            visible: true,
            locked: false,
            styles: { fontSize: "16px", borderRadius: "8px", backgroundColor: "#2563eb", color: "#ffffff" },
            clickSequences: [
              {
                clickIndex: 0,
                actions: [
                  {
                    id: "act-toast-log",
                    type: "DisplayNotification",
                    params: {
                      notificationMessage: "Accessing authentication cluster...",
                      notificationType: "info"
                    }
                  }
                ]
              },
              {
                clickIndex: 1,
                actions: [
                  {
                    id: "act-main-nav",
                    type: "Navigate",
                    params: {
                      targetPageId: "auth-p2"
                    }
                  }
                ]
              }
            ],
            conditions: [
              {
                id: "cond-email-check",
                name: "Email Empty Validator",
                sourceElementId: "emailInput",
                conditionType: "Empty",
                successActions: [
                  {
                    id: "act-toast-email",
                    type: "DisplayNotification",
                    params: {
                      notificationMessage: "Validation error: Email cannot be left empty!",
                      notificationType: "error"
                    }
                  }
                ],
                failActions: []
              },
              {
                id: "cond-pass-len",
                name: "Password Space Guardian",
                sourceElementId: "passwordInput",
                conditionType: "LessThan",
                valueThreshold: "4",
                successActions: [
                  {
                    id: "act-toast-pass",
                    type: "DisplayPopup",
                    params: {
                      popupTitle: "Security Halt",
                      popupMessage: "Your password mockup does not meet the minimum safety threshold (must be at least 4 chars long in test conditions)!"
                    }
                  }
                ],
                failActions: []
              }
            ]
          }
        ]
      },
      {
        id: "auth-p2",
        name: "Dashboard Home",
        backgroundImage: getDashboardBackdrop(),
        elements: [
          {
            id: "logoutLink",
            type: "Link",
            label: "➔ Log Out Portal",
            x: 2.5,
            y: 91.2,
            width: 18.0,
            height: 3.5,
            zIndex: 5,
            visible: true,
            locked: true,
            styles: {},
            clickSequences: [
              {
                clickIndex: 0,
                actions: [
                  {
                    id: "act-nav-back",
                    type: "Navigate",
                    params: {
                      targetPageId: "auth-p1"
                    }
                  },
                  {
                    id: "act-out-toast",
                    type: "DisplayNotification",
                    params: {
                      notificationMessage: "Safely logged out of sandbox container.",
                      notificationType: "success"
                    }
                  }
                ]
              }
            ],
            conditions: []
          }
        ]
      }
    ]
  },
  {
    id: "template-dashboard",
    name: "Financial Workspace",
    description: "Dynamic recipient forms, instant volume submit, and visual locked zones.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    selectedPageId: "dash-p1",
    pages: [
      {
        id: "dash-p1",
        name: "Dashboard Home",
        backgroundImage: getDashboardBackdrop(),
        elements: [
          {
            id: "recipientInput",
            type: "Text Input",
            label: "Thomas Anderson",
            placeholder: "Enter payout recipient name",
            x: 25.8,
            y: 54.4,
            width: 20.8,
            height: 5.0,
            zIndex: 10,
            visible: true,
            locked: false,
            styles: { fontSize: "14px", borderRadius: "8px", backgroundColor: "transparent" },
            clickSequences: [],
            conditions: []
          },
          {
            id: "amountInput",
            type: "Number Input",
            label: "850.50",
            placeholder: "0.00",
            x: 49.2,
            y: 54.4,
            width: 15.0,
            height: 5.0,
            zIndex: 11,
            visible: true,
            locked: false,
            styles: { fontSize: "14px", borderRadius: "8px", backgroundColor: "transparent" },
            clickSequences: [],
            conditions: []
          },
          {
            id: "executePayout",
            type: "Button",
            label: "Execute Invoice Payout",
            x: 85.8,
            y: 54.4,
            width: 8.3,
            height: 5.0,
            zIndex: 12,
            visible: true,
            locked: false,
            styles: { fontSize: "14px", borderRadius: "8px", backgroundColor: "#22c55e", color: "#ffffff" },
            clickSequences: [
              {
                clickIndex: 0,
                actions: [
                  {
                    id: "notif-exec",
                    type: "DisplayNotification",
                    params: {
                      notificationMessage: "Processing real-time ledger settlement of $850.50...",
                      notificationType: "info"
                    }
                  }
                ]
              },
              {
                clickIndex: 1,
                actions: [
                  {
                    id: "alert-exec",
                    type: "DisplayPopup",
                    params: {
                      popupTitle: "Settlement Confirmed",
                      popupMessage: "Transaction successfully committed to CanvasPay Block-Ledger. Recipient Vance Refrigeration will receive notifications."
                    }
                  }
                ]
              }
            ],
            conditions: [
              {
                id: "empty-recip",
                name: "Recipient Empty Shield",
                sourceElementId: "recipientInput",
                conditionType: "Empty",
                successActions: [
                  {
                    id: "warn-rec",
                    type: "DisplayNotification",
                    params: {
                      notificationMessage: "Please specify a Recipient before payout dispatch!",
                      notificationType: "warning"
                    }
                  }
                ],
                failActions: []
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "template-checkout",
    name: "Elite Checkout Funnel",
    description: "Terms validation switches, checkbox status listeners, and animated cart checkout.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    selectedPageId: "checkout-p1",
    pages: [
      {
        id: "checkout-p1",
        name: "Lumiere Checkout",
        backgroundImage: getCheckoutBackdrop(),
        elements: [
          {
            id: "fullNameCheckout",
            type: "Text Input",
            label: "Arthur Pendragon",
            placeholder: "Enter full legal name",
            x: 11.6,
            y: 39.4,
            width: 20.8,
            height: 5.2,
            zIndex: 10,
            visible: true,
            locked: false,
            styles: { fontSize: "13px", borderRadius: "6px" },
            clickSequences: [],
            conditions: []
          },
          {
            id: "phoneCheckout",
            type: "Phone Input",
            label: "+44 7911 123456",
            placeholder: "Enter contact callback phone",
            x: 35.0,
            y: 39.4,
            width: 21.6,
            height: 5.2,
            zIndex: 11,
            visible: true,
            locked: false,
            styles: { fontSize: "13px", borderRadius: "6px" },
            clickSequences: [],
            conditions: []
          },
          {
            id: "addressField",
            type: "Text Area",
            label: "12 Camelot Castle, Cornwall, TR11 4PR",
            placeholder: "Type full door-shipping street address",
            x: 11.6,
            y: 50.6,
            width: 45.0,
            height: 5.2,
            zIndex: 12,
            visible: true,
            locked: false,
            styles: { fontSize: "13px", borderRadius: "6px" },
            clickSequences: [],
            conditions: []
          },
          {
            id: "agreeTerms",
            type: "Checkbox",
            label: "Accept Policies",
            x: 35.0,
            y: 63.7,
            width: 1.5,
            height: 2.2,
            zIndex: 13,
            visible: true,
            locked: false,
            styles: {},
            clickSequences: [],
            conditions: []
          },
          {
            id: "purchaseBtn",
            type: "Button",
            label: "Purchase Ticket & Order",
            x: 11.6,
            y: 72.5,
            width: 45.0,
            height: 6.2,
            zIndex: 14,
            visible: true,
            locked: false,
            styles: { fontSize: "15px", borderRadius: "8px", backgroundColor: "#1c1917" },
            clickSequences: [
              {
                clickIndex: 0,
                actions: [
                  {
                    id: "thank-notif",
                    type: "DisplayPopup",
                    params: {
                      popupTitle: "Order Success!",
                      popupMessage: "Your order for 'Bougie Parfumée No. IV' ($245.00) has been placed under Arthur Pendragon! Check your email for shipping tracking."
                    }
                  }
                ]
              }
            ],
            conditions: [
              {
                id: "terms-uncheck",
                name: "Policies Required Guardian",
                sourceElementId: "agreeTerms",
                conditionType: "Unchecked",
                successActions: [
                  {
                    id: "toast-err-check",
                    type: "DisplayNotification",
                    params: {
                      notificationMessage: "Purchase failed! You must agree to the Terms & Conditions of Lumière Maison.",
                      notificationType: "error"
                    }
                  }
                ],
                failActions: []
              }
            ]
          }
        ]
      }
    ]
  }
];
