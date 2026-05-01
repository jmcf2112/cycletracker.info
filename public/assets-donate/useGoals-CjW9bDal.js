import{c as o,r as c,K as g,M as A,S}from"./index-CYenZCOw.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=o("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=o("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]),i="userGoals",G=[{id:"sleep_default",type:"sleep",name:"Sleep Duration",target:8,unit:"hours",frequency:"daily",currentProgress:0,isActive:!0,createdAt:new Date().toISOString()},{id:"exercise_default",type:"exercise",name:"Weekly Exercise",target:150,unit:"minutes",frequency:"weekly",currentProgress:0,isActive:!0,createdAt:new Date().toISOString()},{id:"water_default",type:"water",name:"Daily Water Intake",target:8,unit:"glasses",frequency:"daily",currentProgress:0,isActive:!0,createdAt:new Date().toISOString()}],v=a=>S(a)&&a.every(r=>typeof r=="object"&&r!==null&&typeof r.id=="string"&&typeof r.name=="string"),P=()=>{const[a,r]=c.useState(()=>g(i,G,v));c.useEffect(()=>{A(i,a)},[a]);const u=e=>{const s={...e,id:`goal_${Date.now()}`,currentProgress:0,createdAt:new Date().toISOString()};return r(t=>[...t,s]),s},l=(e,s)=>{r(t=>t.map(n=>n.id===e?{...n,...s}:n))},d=e=>{r(s=>s.filter(t=>t.id!==e))},p=(e,s)=>{r(t=>t.map(n=>n.id===e?{...n,currentProgress:s}:n))},y=e=>{r(s=>s.map(t=>t.id===e?{...t,isActive:!t.isActive}:t))},f=e=>e.target===0?0:Math.min(e.currentProgress/e.target*100,100),m=a.filter(e=>e.isActive);return{goals:a,activeGoals:m,addGoal:u,updateGoal:l,removeGoal:d,updateProgress:p,toggleGoal:y,getProgressPercentage:f}};export{k as C,w as T,P as u};
