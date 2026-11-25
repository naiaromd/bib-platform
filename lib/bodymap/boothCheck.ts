// สคริปต์ตรวจจอบูธ (ES5 ล้วน ให้จอ Android รุ่นเก่ารันได้)
// 1) เติมฟังก์ชันที่เบราว์เซอร์รุ่นเก่าไม่มี  2) จับ error  3) ถ้าหน้าเว็บไม่พร้อมใน 12 วิ (ปุ่มจะกดไม่ได้) ขึ้นแถบบอกเวอร์ชันเบราว์เซอร์ + error ให้ถ่ายรูปส่งทีม
// เปิด ?check=1 ต่อท้ายลิงก์ เพื่อดูผลตรวจทุกครั้ง
export const BOOTH_CHECK = `(function(){
var W=window,errs=[];W.__bmErr=errs;
W.addEventListener('error',function(e){errs.push((e.message||'error')+' @'+String(e.filename||'').split('/').pop()+':'+e.lineno)});
W.addEventListener('unhandledrejection',function(e){var r=e.reason;errs.push('promise: '+(r&&r.message?r.message:r))});
var AP=Array.prototype;
function def(o,k,v){if(!o[k])Object.defineProperty(o,k,{configurable:true,writable:true,value:v})}
def(AP,'flat',function(d){d=d===undefined?1:d;return d>0?this.reduce(function(a,v){return a.concat(Array.isArray(v)?v.flat(d-1):v)},[]):this.slice()});
def(AP,'flatMap',function(f,t){return this.map(f,t).flat()});
def(Object,'fromEntries',function(it){var o={};Array.from(it).forEach(function(p){o[p[0]]=p[1]});return o});
if(typeof W.globalThis==='undefined')W.globalThis=W;
if(typeof W.queueMicrotask!=='function')W.queueMicrotask=function(f){Promise.resolve().then(f)};
def(AP,'at',function(n){n=Math.trunc(n)||0;if(n<0)n+=this.length;return this[n]});
def(String.prototype,'at',function(n){n=Math.trunc(n)||0;if(n<0)n+=this.length;return this.charAt(n)});
def(Object,'hasOwn',function(o,k){return Object.prototype.hasOwnProperty.call(o,k)});
def(String.prototype,'replaceAll',function(a,b){return typeof a==='string'?this.split(a).join(b):this.replace(a,b)});
def(Promise,'allSettled',function(ps){return Promise.all(Array.from(ps).map(function(p){return Promise.resolve(p).then(function(v){return{status:'fulfilled',value:v}},function(r){return{status:'rejected',reason:r}})}))});
try{var g=document.createElement('div');g.style.cssText='display:flex;flex-direction:column;gap:1px;position:absolute';g.appendChild(document.createElement('div'));g.appendChild(document.createElement('div'));document.documentElement.appendChild(g);if(g.scrollHeight!==1)document.documentElement.className+=' nfg';g.parentNode.removeChild(g)}catch(e){}
var force=/[?&]check=1/.test(location.search);
function show(){
 var ok=!!W.__bmReady,m=navigator.userAgent.match(/Chrome\\/(\\d+)/),a=navigator.userAgent.match(/Android ([\\d.]+)/);
 if(ok&&!force)return;
 var d=document.getElementById('bm-check')||document.createElement('div');d.id='bm-check';
 d.style.cssText='position:fixed;left:0;right:0;top:0;z-index:99999;white-space:pre-line;font:18px/1.6 sans-serif;padding:18px 22px;color:#fff;background:'+(ok?'#2E6B4F':'#8C3A2A');
 d.textContent=(ok?'✓ จอพร้อมใช้งาน ปุ่มกดได้':'✕ จอยังโหลดระบบไม่สำเร็จ ปุ่มจะกดไม่ได้ · ถ่ายรูปข้อความนี้ส่งทีม BIB')
  +'\\nเบราว์เซอร์: '+(m?'Chrome/WebView '+m[1]:'ไม่ทราบ')+' · Android '+(a?a[1]:'?')+' · '+(navigator.onLine?'ออนไลน์':'ออฟไลน์')+' · ระบบเก็บหน้าไว้ในเครื่อง: '+('serviceWorker' in navigator?'รองรับ':'ไม่รองรับ')
  +(errs.length?'\\nError: '+errs.slice(0,3).join(' | '):'')+'\\n'+navigator.userAgent;
 if(!d.parentNode)document.body.appendChild(d);
}
setTimeout(show,force?6000:12000);
})();`;
