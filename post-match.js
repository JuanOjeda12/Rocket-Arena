import {ReplayBuffer} from './match-flow.js';
const visual=s=>({cars:s.cars.map(c=>({...c,position:[...c.position],quaternion:[...c.quaternion]})),ball:{...s.ball,position:[...s.ball.position],quaternion:[...s.ball.quaternion]},pads:s.pads});
export class PostMatch{
 constructor(){this.reset()}
 reset(){this.matchId=null;this.history=new ReplayBuffer(7);this.clips=[];this.seen=new Set();this.time=0;this.captureAt=0;this.pending=[];this.finished=false;this.clock=0;this.mode='highlights';this.poses=new Map()}
 observe(state,dt){
  if(state.matchId!==this.matchId){this.reset();this.matchId=state.matchId}
  if(this.finished)return;
  if(state.phase==='live'){
   this.time+=dt;this.captureAt-=dt;if(this.captureAt<=0){this.history.record(this.time,visual(state),true);this.captureAt=1/12}
  }
  for(const event of state.events||[]){
   if(this.seen.has(event.id))continue;this.seen.add(event.id);
   if(event.type==='goal'){this.history.record(this.time,visual(state),true);this.addClip('GOL',3)}
   else if(['save','epic-save'].includes(event.type))this.pending.push({due:this.time+1.5,title:event.type==='epic-save'?'SALVADA ÉPICA':'SALVADA',weight:event.type==='epic-save'?3:2});
  }
  this.pending=this.pending.filter(p=>{if(this.time<p.due)return true;this.addClip(p.title,p.weight);return false});
 }
 addClip(title,weight){const clip=this.history.clip();if(clip.duration<.25)return;this.clips.push({...clip,title,weight});if(this.clips.length>6){const lowest=this.clips.reduce((a,c,i)=>c.weight<this.clips[a].weight?i:a,0);this.clips.splice(lowest,1)}}
 finish(state,slot){
  if(this.finished)return;for(const p of this.pending)this.addClip(p.title,p.weight);this.pending=[];
  if(!this.clips.length)this.addClip('MEJORES JUGADAS',1);
  this.finished=true;this.clock=0;this.mode=this.clips.length?'highlights':'podium';this.state=structuredClone(state);this.slot=slot;
  this.winner=state.score[0]>state.score[1]?0:1;
  this.winners=state.cars.filter(c=>c.team===this.winner).sort((a,b)=>(state.stats.find(s=>s.slot===b.slot)?.points||0)-(state.stats.find(s=>s.slot===a.slot)?.points||0));
 }
 toggle(){this.mode=this.mode==='podium'&&this.clips.length?'highlights':'podium';this.clock=0}
 update(dt,input={}){if(!this.finished)return null;this.clock+=dt;
  if(this.mode==='highlights'){
   let at=this.clock;for(const clip of this.clips){const duration=clip.duration/.8+.6;if(at<duration)return{mode:'highlights',title:clip.title,sample:ReplayBuffer.sample(clip,at*.8)};at-=duration}
   this.mode='podium';this.clock=0;
  }
  const pose=this.poses.get(this.slot)||{yaw:0,jump:0,v:0,held:false,flip:0};
  pose.yaw+=(input.steer||input.roll||0)*dt*2.4;
  if(input.jump&&!pose.held){if(pose.jump>.05)pose.flip=Math.PI*2;else pose.v=3.8}pose.held=!!input.jump;
  pose.v-=10*dt;pose.jump=Math.max(0,pose.jump+pose.v*dt);if(!pose.jump)pose.v=0;pose.flip=Math.max(0,pose.flip-dt*9);this.poses.set(this.slot,pose);
  return{mode:'podium',title:'EQUIPO GANADOR',pose};
 }
 achievement(car){const s=this.state?.stats.find(s=>s.slot===car.slot)||{},mvp=this.winners?.[0]?.slot===car.slot;
  return mvp?'MVP · '+(s.points||0)+' PTS':s.saves?'GUARDIÁN · '+s.saves+' SALVADAS':s.goals?'GOLEADOR · '+s.goals+' GOLES':s.assists?'ASISTENTE · '+s.assists+' ASIST.':'COMPAÑERO DE EQUIPO';
 }
}
