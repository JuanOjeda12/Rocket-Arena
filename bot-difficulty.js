// One progressive curve for competitive MMR and local/LAN/online private ranks.
const LEVELS=[.06,.10,.18,.28,.43,.62,.82,1];
export function rankBotSkill(rank){const t=Math.max(0,Math.min(7,Number(rank)||0)),i=Math.floor(t);return i===7?1:LEVELS[i]+(LEVELS[i+1]-LEVELS[i])*(t-i)}
export const mmrBotSkill=mmr=>rankBotSkill(Math.max(0,Number(mmr)||0)/240);
export const nextoDecisionTicks=skill=>8+Math.round(18*Math.pow(1-Math.max(0,Math.min(1,skill)),1.4));

// Convert the existing continuous rank curve back to a tier; no hard controller jump.
export function botRankFromSkill(skill){const s=Math.max(0,Math.min(1,Number(skill)||0));if(s<=LEVELS[0])return 0;for(let i=0;i<7;i++)if(s<LEVELS[i+1])return i+(s-LEVELS[i])/(LEVELS[i+1]-LEVELS[i]);return 7}
export function nextoAssistance(skill){const rank=botRankFromSkill(skill),i=Math.floor(rank),weights=[0,0,0,.12,.35,.65,.87,1];return i===7?1:weights[i]+(weights[i+1]-weights[i])*(rank-i)}
export function blendRankedControls(basic,neural,weight){
 if(weight<=0)return basic;if(weight>=1)return neural;
 const result={};for(const key of ['throttle','steer','pitch','yaw','roll'])result[key]=(basic[key]||0)*(1-weight)+(neural[key]||0)*weight;
 // Advanced aerial commitments appear only in the upper ranks.
 for(const key of ['jump','boost','handbrake'])result[key]=!!(weight>=.5?neural[key]:basic[key]);return result;
}
