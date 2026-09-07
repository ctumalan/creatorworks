// Shared browser/server rule. Whitespace separates words; punctuation alone is not a word.
(()=>{const count=value=>String(value||'').trim().split(/\s+/u).filter(word=>/[\p{L}\p{N}]/u.test(word)).length;globalThis.CWListingRules={count,valid:value=>{const n=count(value);return n>=4&&n<=10;}};})();
