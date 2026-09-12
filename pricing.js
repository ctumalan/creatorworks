// Shared display and filter policy. Free + paid options is its own pricing category.
globalThis.CWPricing = {
 labels: {free:'Free',freemium:'Free + paid options',paid:'Paid'},
 kind(value){const label=String(value||'').trim().toLowerCase();return /freemium|free\s*\+\s*paid|free and paid/.test(label)?'freemium':label==='free'?'free':'paid';}
};
