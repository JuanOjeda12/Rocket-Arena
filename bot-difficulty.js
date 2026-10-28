// One progressive curve for competitive MMR and local/LAN/online private ranks.
const LEVELS=[.06,.10,.18,.28,.43,.62,.82,1];
export function rankBotSkill(rank){const t=Math.max(0,Math.min(7,Number(rank)||0)),i=Math.floor(t);return i===7?1:LEVELS[i]+(LEVELS[i+1]-LEVELS[i])*(t-i)}
export const mmrBotSkill=mmr=>rankBotSkill(Math.max(0,Number(mmr)||0)/240);
export const nextoDecisionTicks=skill=>8+Math.round(18*Math.pow(1-Math.max(0,Math.min(1,skill)),1.4));
