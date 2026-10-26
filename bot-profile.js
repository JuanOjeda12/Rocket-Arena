export function botProfile(difficulty='competitive',skill=.55){
 const hard=difficulty==='competitive',s=hard?Math.max(0,Math.min(1,Number.isFinite(skill)?skill:.55)):0;
 return{skill:s,think:hard?.075-s*.045:.13,topSpeed:hard?21+s*2:17,prediction:hard?1.8+s*1.1:1.8,accuracy:hard?3+s*.8:2.7,air:hard&&s>=.62,speedFlip:hard&&s>=.72,jumpHeight:hard?2.5+s*4:2,boostAngle:hard?.15+s*.1:.16};
}
