// mods/exusiai-arc/client.mjs
// 「圣环 · 能天使（齿轮版）」
//
// 左边是一组真的会转的齿轮：大盘、两个小盘，转速按半径反比、方向相反，
// 后面垫一张半透明的封面方片。歌词沿一段大弧排开（弧心在画面左外），
// 换句时整排滑动而不是硬切。右边是立绘，头顶光环同时是进度环。

import { CHARACTER_URL } from './character.mjs';
import { GUN_URL } from './gun.mjs';

const DESIGN_HEIGHT = 1041;
const STEP_DEG = 5;

const u = (n) => `calc(${n} * var(--u))`;

const CSS = `
.fx-root{position:absolute;inset:0;overflow:hidden;color:#fff;user-select:none;pointer-events:none;
  font-family:var(--fx-font,"Noto Sans SC",system-ui,sans-serif);}
.fx-base{position:absolute;inset:0;background:#140a0b;}
.fx-cover{position:absolute;inset:-8%;background-size:cover;background-position:center;
  filter:blur(3.2em) saturate(.88) brightness(.62);transform:scale(1.06);}
.fx-ritual{position:absolute;left:56%;top:50%;width:150vmax;height:150vmax;
  transform:translate(-50%,-50%);pointer-events:none;mix-blend-mode:screen;opacity:.55;
  -webkit-mask-image:radial-gradient(closest-side, #000 30%, rgba(0,0,0,.5) 62%, transparent 88%);
  mask-image:radial-gradient(closest-side, #000 30%, rgba(0,0,0,.5) 62%, transparent 88%);}
.fx-ritual svg{display:block;width:100%;height:100%;}

.fx-sigil{position:absolute;left:41%;top:52%;width:34vmin;height:34vmin;pointer-events:none;
  mix-blend-mode:screen;opacity:.30;}
.fx-sigil svg{display:block;width:100%;height:100%;overflow:visible;}
.fx-debris{position:absolute;left:54%;top:12%;width:34%;height:70%;pointer-events:none;
  -webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 14%,#000 64%,transparent 92%),
    linear-gradient(180deg,transparent 0%,#000 8%,#000 88%,transparent 100%);
  -webkit-mask-composite:source-in;
  mask-image:linear-gradient(90deg,transparent 0%,#000 14%,#000 64%,transparent 92%),
    linear-gradient(180deg,transparent 0%,#000 8%,#000 88%,transparent 100%);
  mask-composite:intersect;}
.fx-debris i{position:absolute;display:block;border-radius:1px;
  animation:fx-debris ease-out infinite;will-change:transform,opacity;}
@keyframes fx-debris{
  0%{transform:translate3d(0,0,0) rotate(var(--r)) scale(.45);opacity:0}
  6%{opacity:.95}
  16%{transform:translate3d(calc(var(--dx) * .6), calc(var(--dy) * .18), 0) rotate(var(--r)) scale(1)}
  62%{transform:translate3d(calc(var(--dx) * .95), calc(var(--dy) * .62), 0) rotate(calc(var(--r) * 1.6)) scale(.92);opacity:.55}
  100%{transform:translate3d(var(--dx), var(--dy), 0) rotate(calc(var(--r) * 2.2)) scale(.7);opacity:0}
}
.fx-curtain{position:absolute;left:55.5%;top:24%;width:13%;height:60%;pointer-events:none;
  background:linear-gradient(180deg,rgba(246,208,150,0) 0%,rgba(246,208,150,.05) 22%,rgba(246,208,150,.07) 62%,rgba(246,208,150,0) 100%);
  -webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 30%,#000 62%,transparent 100%);
  mask-image:linear-gradient(90deg,transparent 0%,#000 30%,#000 62%,transparent 100%);}
.fx-curtain i{position:absolute;display:block;border-radius:50%;
  background:radial-gradient(circle,rgba(255,236,196,.95),rgba(255,196,128,0) 72%);
  animation:fx-curtain-fall linear infinite;}
@keyframes fx-curtain-fall{
  0%{transform:translate3d(0,-8%,0);opacity:0}
  14%{opacity:.85}
  50%{transform:translate3d(3px,42%,0);opacity:.6}
  86%{opacity:.35}
  100%{transform:translate3d(-2px,132%,0);opacity:0}
}
.fx-stardust{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
.fx-stardust i{position:absolute;display:block;border-radius:50%;
  background:radial-gradient(circle,rgba(226,182,118,.85),rgba(226,182,118,0) 70%);
  will-change:transform;}
.fx-bgreath{position:absolute;inset:0;pointer-events:none;opacity:0;
  background:radial-gradient(circle at var(--bx,50%) var(--by,50%),
    rgba(196,58,48,.55), rgba(126,26,24,.24) 38%, rgba(60,12,12,.10) 62%, transparent 78%);}
.fx-radial{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;}
.fx-radial i{position:absolute;display:block;border-radius:50%;transform:translate(-50%,-50%);
  background:radial-gradient(circle,rgba(198,66,54,.55),rgba(120,26,24,.20) 46%,transparent 72%);
  opacity:0;will-change:transform,opacity;}
.fx-trail{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible;}
.fx-trail path{fill:none;stroke:rgba(255,214,150,.85);stroke-linecap:round;}
.fx-shots{position:absolute;left:50%;top:26%;width:48%;height:60%;pointer-events:none;overflow:hidden;
  -webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 12%,#000 94%,transparent 100%),
    linear-gradient(180deg,#000 0%,#000 88%,transparent 100%);
  -webkit-mask-composite:source-in;
  mask-image:linear-gradient(90deg,transparent 0%,#000 12%,#000 94%,transparent 100%),
    linear-gradient(180deg,#000 0%,#000 88%,transparent 100%);
  mask-composite:intersect;}
.fx-shots .case{position:absolute;width:2px;height:7px;border-radius:1px;
  background:linear-gradient(180deg,#efc67f,#7d5a22 78%,#5d4318);
  box-shadow:0 0 3px rgba(255,198,120,.5);animation:fx-case ease-out forwards;}
@keyframes fx-case{
  0%{opacity:0;transform:translate3d(0,0,0) rotate(0deg)}
  12%{opacity:.45}
  32%{transform:translate3d(var(--px),var(--py),0) rotate(96deg)}
  100%{opacity:0;transform:translate3d(calc(var(--px) * 1.3),calc(var(--py) + 52px),0) rotate(250deg)}
}
.fx-halo-pulse{position:absolute;inset:0;border-radius:50%;pointer-events:none;
  border:1px solid rgba(255,206,140,.5);animation:fx-pulse 1.8s ease-out forwards;}
@keyframes fx-pulse{
  0%{transform:scale(1);opacity:.5}
  100%{transform:scale(1.55);opacity:0}
}
.fx-particles{position:absolute;left:0;top:0;width:17%;height:100%;pointer-events:none;
  -webkit-mask-image:linear-gradient(90deg,#000 0%,#000 55%,transparent 100%);
  mask-image:linear-gradient(90deg,#000 0%,#000 55%,transparent 100%);}
.fx-particles i{position:absolute;display:block;border-radius:50%;
  background:radial-gradient(circle,rgba(246,214,166,.85),rgba(246,190,120,0) 70%);
  animation:fx-float linear infinite;}
@keyframes fx-float{0%{transform:translateY(0);opacity:0}
  12%{opacity:1} 78%{opacity:.7} 100%{transform:translateY(-46vh);opacity:0}}



.fx-scrim{position:absolute;inset:0;
  background:radial-gradient(52% 68% at 11% 50%,rgba(150,16,24,.66) 0%,rgba(110,12,18,.32) 42%,transparent 70%),
             linear-gradient(100deg,rgba(14,6,8,.62) 0%,rgba(12,6,8,.68) 55%,rgba(8,4,6,.78) 100%);}
.fx-dial{position:absolute;left:0;top:0;overflow:visible;}
.fx-char-wrap{position:absolute;right:-1%;bottom:-4%;height:min(92%, 62vw);aspect-ratio:1344/1792;
  transition:transform .6s cubic-bezier(.22,.61,.36,1);}
.fx-char{display:block;width:100%;height:100%;object-fit:contain;position:relative;}
.fx-wings{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;}
.fx-wings svg{display:block;width:100%;height:100%;overflow:visible;}
.fx-bounce{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;
  background:radial-gradient(42% 34% at 30% 44%, rgba(255,186,120,.18), rgba(255,146,92,.06) 48%, transparent 74%);}
.fx-rule{position:absolute;left:6%;bottom:9.2%;width:24%;height:1px;
  background:linear-gradient(90deg,rgba(232,188,128,0),rgba(232,188,128,.38) 45%,rgba(232,188,128,0));}
.fx-halo-box{position:absolute;left:64.5%;top:24.4%;width:31%;aspect-ratio:1;transform:translate(-50%,-50%) rotate(1.6deg);pointer-events:none;}
.fx-halo{display:block;width:100%;height:100%;overflow:visible;}
.fx-char-halo{position:absolute;right:0;top:6%;width:46%;height:92%;background:radial-gradient(closest-side,rgba(232,188,128,.20),rgba(255,90,70,.08) 55%,transparent 78%);filter:blur(3em);}
.fx-halo-glow{position:absolute;left:64.5%;top:24.4%;width:27%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;
  background:radial-gradient(closest-side,rgba(255,226,180,.92),rgba(255,170,120,.55) 48%,rgba(255,120,90,.18) 72%,transparent 88%);
  filter:blur(1.1em);}
.fx-arc{position:absolute;left:0;top:0;width:0;height:0;}
.fx-arc-out{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;}
.fx-line{position:absolute;left:0;top:0;transform-origin:0 0;white-space:nowrap;
  font-weight:var(--fx-w,norm);letter-spacing:.06em;will-change:transform,color,opacity;
  transition:transform .9s cubic-bezier(.16,.84,.24,1),color .8s ease,opacity .8s ease;}
.fx-line::before{content:'';position:absolute;left:-.55em;right:-.55em;top:-.35em;bottom:-.35em;
  background:radial-gradient(60% 60% at 50% 50%, rgba(6,3,3,.55), rgba(6,3,3,0) 78%);
  filter:blur(.4em);z-index:-1;}
.fx-line .ln{display:block;white-space:nowrap;line-height:1.12;}
.fx-line .ln:only-child{line-height:1;}
.fx-line .tr{position:absolute;left:0;top:100%;margin-top:.16em;font-size:.46em;font-weight:400;
  letter-spacing:.10em;color:rgba(232,214,188,.62);-webkit-text-stroke:0;
  filter:drop-shadow(0 .1em .3em rgba(6,3,3,.8));}
.fx-line .fill{position:absolute;left:0;top:50%;transform:translateY(-50%);white-space:nowrap;display:block;
  background-image:linear-gradient(180deg,#fff8e8 0%,#f4e3c8 48%,#e9cd9a 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  font-weight:inherit;-webkit-text-stroke:.5px rgba(232,196,138,.45);
  filter:drop-shadow(0 0 .3em rgba(8,4,4,.85)) drop-shadow(0 0 1.1em rgba(6,3,3,.65))
         drop-shadow(0 0 .5em rgba(255,206,158,.18));}
@keyframes fx-sheen{0%{background-position:-120% 0}100%{background-position:220% 0}}
.fx-line.current .fill{background-size:220% 100%;animation:fx-sheen 7.5s linear infinite;}
.fx-needle{position:absolute;left:0;top:0;height:1px;transform-origin:0 50%;}
.fx-brand{position:absolute;left:${u(5.6)};top:${u(4.6)};font-size:${u(0.6)};letter-spacing:.52em;color:rgba(255,225,220,.42);}
.fx-brand b{font-weight:400;color:rgba(232,188,128,.75);letter-spacing:0;margin-left:1.2em;}
.fx-op{position:absolute;left:${u(5.6)};top:${u(6.2)};font-family:ui-monospace,Consolas,monospace;
  font-size:${u(0.46)};letter-spacing:.32em;color:rgba(255,200,195,.38);}
.fx-cap{position:absolute;right:${u(5.6)};bottom:${u(4.4)};font-family:ui-monospace,Consolas,monospace;
  font-size:${u(0.42)};letter-spacing:.30em;color:rgba(255,210,205,.34);}
`;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 齿轮外轮廓：在齿根半径和齿顶半径之间来回折。 */
const gearPath = (cx, cy, rRoot, rTip, teeth, phase = 0) => {
  const step = (Math.PI * 2) / teeth;
  const pts = [];
  for (let i = 0; i < teeth; i += 1) {
    const a = phase + i * step;
    pts.push([rRoot, a - step * 0.26]);
    pts.push([rTip, a - step * 0.15]);
    pts.push([rTip, a + step * 0.15]);
    pts.push([rRoot, a + step * 0.26]);
  }
  return `M ${pts.map(([r, a]) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`).join(' L ')} Z`;
};

const starPath = (cx, cy, r) => {
  const pts = [];
  for (let i = 0; i < 10; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.44;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

const mountStage = (folium, container, ctx) => {
  const style = document.createElement('style');
  style.textContent = CSS;
  const root = document.createElement('div');
  root.className = 'fx-root';
  root.innerHTML = `
    <div class="fx-base"></div>
    <div class="fx-cover"></div>
    <!-- [MOD] 背景径向渐变呼吸（最底层） -->
    <div class="fx-bgreath"></div>
    <!-- [MOD] 背景星尘漂移（刻度下层） -->
    <div class="fx-stardust"></div>
    <div class="fx-scrim"></div>
    <!-- [MOD] 低频径向光晕层 -->
    <div class="fx-radial"><i></i></div>
    <div class="fx-ritual"><svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet"><g class="fx-ritual-g"></g></svg></div>
    <div class="fx-sigil"><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><g class="fx-sigil-g"></g></svg></div>
    <svg class="fx-dial" xmlns="http://www.w3.org/2000/svg">
      <g class="g-ring"></g>
      <g class="g-big"></g>
      <g class="g-mid"></g>
      <g class="g-small"></g>
      <g class="g-star"></g>
      <!-- [MOD] 时序刻度脉动 · 环层 -->
      <g class="g-pulse"></g>
      <!-- [MOD] 刻度环形扫光 -->
      <defs><filter id="fx-sweep-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>
      <g class="g-sweep"></g>
    </svg>
    <div class="fx-char-wrap">
      <div class="fx-wings"><svg viewBox="0 0 75 100" preserveAspectRatio="none"><g class="fx-wing-shards"></g></svg></div>
      <img class="fx-char" alt="" draggable="false">
      <div class="fx-bounce"></div>
      <div class="fx-halo-glow"></div>
      <div class="fx-halo-box">
        <svg class="fx-halo" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="fx-hb" x="-60%" y="-260%" width="220%" height="620%">
              <feGaussianBlur stdDeviation="5"/>
            </filter>
          </defs>
          <ellipse class="fx-halo-track" cx="100" cy="100" rx="70" ry="18" fill="none"
                   stroke="rgba(255,214,190,.42)" stroke-width="1"/>
          <ellipse class="fx-halo-prog" cx="100" cy="100" rx="70" ry="18" fill="none"
                   stroke="rgba(255,246,240,.95)" stroke-width="1.8" stroke-linecap="round"
                   pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="100"/>
          <ellipse class="fx-halo-bloom" cx="100" cy="100" rx="70" ry="18" fill="none"
                   stroke="rgba(232,188,128,.38)" stroke-width="9" filter="url(#fx-hb)"
                   pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="100"/>
          <circle class="fx-halo-dot" r="2.2" fill="#fff2ea"/>
        </svg>
      </div>
    </div>
    <div class="fx-particles"></div>
    <div class="fx-debris"></div>
    <div class="fx-curtain"></div>
    <div class="fx-shots"></div>
    <!-- [MOD] 圆弧流光拖尾 -->
    <svg class="fx-trail" preserveAspectRatio="none"><path class="fx-trail-p"/></svg>
    <div class="fx-arc">
      <div class="fx-needle"></div>
      <div class="fx-arc-out"></div>
    </div>
    <div class="fx-brand">FOLIA<b>✝</b></div>
    <div class="fx-op">OPERATOR · EXUSIAI · PL-05</div>
    <div class="fx-rule"></div>
    <div class="fx-cap">ARC · THEME 02</div>
  `;
  container.appendChild(style);
  container.appendChild(root);

  const $ = (s) => root.querySelector(s);
  const wrap = $('.fx-char-wrap');
  const img = $('.fx-char');
  const wingsSvg = $('.fx-wings svg');
  const wingShards = $('.fx-wing-shards');
  const cover = $('.fx-cover');
  const dial = $('.fx-dial');
  const gRing = $('.g-ring');
  const gBig = $('.g-big');
  const gMid = $('.g-mid');
  const gSmall = $('.g-small');
  const gStar = $('.g-star');
  const gPulse = $('.g-pulse');   // [MOD] 时序刻度脉动
  const gSweep = $('.g-sweep');   // [MOD] 刻度环形扫光
  const radialEl = $('.fx-radial i');   // [MOD] 低频径向光晕
  const bgBreathEl = $('.fx-bgreath');  // [MOD] 背景径向渐变呼吸
  const gPhase = $('.g-phase');         // [MOD] 多层刻度相位差转动
  const starHost = $('.fx-stardust');   // [MOD] 背景星尘漂移
  const trailPath = $('.fx-trail-p');   // [MOD] 圆弧流光拖尾
  const haloBox = $('.fx-halo-box');
  const haloGlow = $('.fx-halo-glow');
  const track = $('.fx-halo-track');
  const prog = $('.fx-halo-prog');
  const bloom = $('.fx-halo-bloom');
  const dot = $('.fx-halo-dot');
  const arc = $('.fx-arc');
  const needle = $('.fx-needle');

  img.src = CHARACTER_URL;

  let settings = { character: true, charScale: 100, charDim: 30, halo: true };
  let height = 0;
  let width = 0;
  let k = 1;
  let currentIndex = -2;
  let lineEls = [];
  let fillEl = null;
  let geom = null;
  let gearSpin = 0;
  let lastTime = 0;
  let tick = 0;
  let beatCount = 0;
  let lastBeat = -1;
  let energy = 0.12;

  const FONTS = {
    sans:  { stack: '"Noto Sans SC","Microsoft YaHei","PingFang SC",sans-serif', w: 400, strong: 600 },
    serif: { stack: '"Noto Serif SC","Source Han Serif SC","STSong","SimSun",serif', w: 500, strong: 800 },
    kai:   { stack: '"STKaiti","KaiTi","楷体","Noto Serif SC",serif', w: 400, strong: 600 },
    hei:   { stack: '"SimHei","黑体","Microsoft YaHei",sans-serif', w: 400, strong: 700 },
    blade: { stack: '"FangSong","STFangsong","仿宋","NSimSun","SimSun","Noto Serif SC",serif',
             w: 600, strong: 700 },
  };

  const readSettings = () => {
    const raw = ctx.getSettings() || {};
    settings = {
      character: raw.character !== false,
      charScale: Number(raw.charScale) || 100,
      charDim: Number.isFinite(Number(raw.charDim)) ? Number(raw.charDim) : 30,
      halo: raw.halo !== false,
      font: typeof raw.font === 'string' && FONTS[raw.font] ? raw.font : 'blade',
      drum: raw.drum !== false,
      drumStrength: Number.isFinite(Number(raw.drumStrength))
        ? Math.min(2, Math.max(0, Number(raw.drumStrength))) : 1,
      // [MOD] 时序刻度脉动
      tickPulse: raw.tickPulse === true,
      tickStrength: Number.isFinite(Number(raw.tickStrength))
        ? Math.min(2, Math.max(0, Number(raw.tickStrength))) : 0.6,
      tickDecay: Number.isFinite(Number(raw.tickDecay))
        ? Math.min(3, Math.max(0.2, Number(raw.tickDecay))) : 1,
      // [MOD] 刻度环形扫光
      sweep: raw.sweep === true,
      sweepBright: Number.isFinite(Number(raw.sweepBright))
        ? Math.min(2, Math.max(0, Number(raw.sweepBright))) : 0.7,
      sweepSpeed: Number.isFinite(Number(raw.sweepSpeed))
        ? Math.min(3, Math.max(0, Number(raw.sweepSpeed))) : 1.2,
      // [MOD] 辉光 / 旋动 / 文字 / 光晕 / 拖尾
      glowBreath: raw.glowBreath === true,
      glowRange: Number.isFinite(Number(raw.glowRange)) ? Math.min(2, Math.max(0, Number(raw.glowRange))) : 0.7,
      glowBright: Number.isFinite(Number(raw.glowBright)) ? Math.min(2, Math.max(0, Number(raw.glowBright))) : 0.8,
      ringSpin: raw.ringSpin === true,
      ringSpeed: Number.isFinite(Number(raw.ringSpeed)) ? Math.min(1, Math.max(0, Number(raw.ringSpeed))) : 0.25,
      ringDrive: Number.isFinite(Number(raw.ringDrive)) ? Math.min(1, Math.max(0, Number(raw.ringDrive))) : 0.4,
      textPulse: raw.textPulse === true,
      textAmp: Number.isFinite(Number(raw.textAmp)) ? Math.min(0.3, Math.max(0, Number(raw.textAmp))) : 0.08,
      textDamp: Number.isFinite(Number(raw.textDamp)) ? Math.min(15, Math.max(2, Number(raw.textDamp))) : 8,
      radialGlow: raw.radialGlow === true,
      radialRadius: Number.isFinite(Number(raw.radialRadius)) ? Math.min(2, Math.max(0, Number(raw.radialRadius))) : 0.8,
      radialAlpha: Number.isFinite(Number(raw.radialAlpha)) ? Math.min(1, Math.max(0, Number(raw.radialAlpha))) : 0.3,
      arcTrail: raw.arcTrail === true,
      trailLength: Number.isFinite(Number(raw.trailLength)) ? Math.min(2, Math.max(0, Number(raw.trailLength))) : 0.6,
      trailBright: Number.isFinite(Number(raw.trailBright)) ? Math.min(2, Math.max(0, Number(raw.trailBright))) : 0.7,
      // [MOD] 相位差 / 星尘
      phaseRot: raw.phaseRot === true,
      phaseDiff: Number.isFinite(Number(raw.phaseDiff)) ? Math.min(0.6, Math.max(0, Number(raw.phaseDiff))) : 0.15,
      phaseDrive: Number.isFinite(Number(raw.phaseDrive)) ? Math.min(1, Math.max(0, Number(raw.phaseDrive))) : 0.3,
      stardust: raw.stardust === true,
      starCount: Number.isFinite(Number(raw.starCount)) ? Math.min(80, Math.max(0, Math.round(Number(raw.starCount)))) : 25,
      starSpeed: Number.isFinite(Number(raw.starSpeed)) ? Math.min(1, Math.max(0, Number(raw.starSpeed))) : 0.2,
      // [MOD] 背景呼吸 / 分层颜色
      bgBreath: raw.bgBreath === true,
      bgStrength: Number.isFinite(Number(raw.bgStrength)) ? Math.min(2, Math.max(0, Number(raw.bgStrength))) : 0.5,
      bgWeight: Number.isFinite(Number(raw.bgWeight)) ? Math.min(1, Math.max(0, Number(raw.bgWeight))) : 0.6,
      ringTint: raw.ringTint === true,
      tintShift: Number.isFinite(Number(raw.tintShift)) ? Math.min(2, Math.max(0, Number(raw.tintShift))) : 0.4,
      tintDrive: Number.isFinite(Number(raw.tintDrive)) ? Math.min(1, Math.max(0, Number(raw.tintDrive))) : 0.35,
    };
    const theme = ctx.getTheme();
    const face = FONTS[settings.font] || FONTS.blade;
    root.style.setProperty('--fx-font', face.stack || folium.theme.resolveFontStack(theme));
    root.style.setProperty('--fx-w', String(face.w));
    root.style.setProperty('--fx-w-strong', String(face.strong));
    wrap.style.display = settings.character ? '' : 'none';
    wrap.style.transform = `scale(${settings.charScale / 100})`;
    wrap.style.transformOrigin = '100% 100%';
    const dim = Math.min(100, Math.max(0, settings.charDim));
    img.style.filter = `brightness(${(0.94 - dim * 0.0032).toFixed(3)}) `
      + `contrast(${(1.03 - dim * 0.0008).toFixed(3)}) saturate(${(1.02 - dim * 0.0014).toFixed(3)})`;
    img.style.opacity = (1 - dim * 0.0045).toFixed(3);
    haloBox.style.display = settings.halo && settings.character ? '' : 'none';
    haloGlow.style.display = settings.halo && settings.character ? '' : 'none';
    const url = ctx.getCoverUrl();
    cover.style.backgroundImage = url ? `url("${url}")` : 'none';
    layout();
  };

  let mood = [255, 190, 120];
  let climax = 0;
  let avgPower = 0.42;
  let lastCover = '';
  let wingStops = [];
  let wingRoot = null;
  let gunSpinEl = null;
  let gunImg = null;
  let scanEl = null;
  let tickEls = [];
  const drum = { dent: 0, vel: 0, env: 0, sm: 0, cool: 0, last: 0 };
  // ===== [MOD] 时序刻度脉动 · 状态 =====
  const tickPulse = { age: -1, last: 0, els: [] };
  const TICK_PULSE_STAGGER = 0.055;   // 每环之间的扩散间隔（秒）
  // ===== [MOD] 刻度环形扫光 · 状态 =====
  const sweep = { angle: 0, last: 0, ticks: [], spin: 0 };
  // ===== [MOD] 新增五效 · 状态 =====
  let fxTicks = null;
  const fx = { beat: 0, last: 0, ringAng: 0, scale: 0, scaleV: 0, radialAge: 9, trailOff: 0 };
  // ===== [MOD] 背景呼吸 / 分层颜色 · 状态 =====
  let bgLp = 0;          // 低通后的低频能量
  // ===== [MOD] 相位差 / 星尘 · 状态 =====
  const phase = { ang: [0, 0, 0], groups: [] };
  const stars = { els: [], base: [], phase: [], count: -1, push: 0 };
  // ===== [MOD] 相位差 / 星尘 · 状态结束 =====
  let ringInEl = null;   // 内层同心圆
  let ringMidEl = null;  // 中层同心圆
  // ===== [MOD] 背景呼吸 / 分层颜色 · 状态结束 =====
  // ===== [MOD] 新增五效 · 状态结束 =====
  // ===== [MOD] 刻度环形扫光 · 状态结束 =====
  // ===== [MOD] 时序刻度脉动 · 状态结束 =====
  let lastVolley = -99;
  let volleyGap = 0.9;
  let lastPulse = -99;
  let tipEls = [];
  let wingParts = [];
  const WING_CX = 40.0;
  const WING_CY = 56.0;

  // 取不到封面颜色时的兜底：用曲名/封面地址的哈希定一个色相，保证换歌就换色
  const hashMood = (url) => {
    let h = 0;
    for (let i = 0; i < url.length; i += 1) h = (h * 31 + url.charCodeAt(i)) % 360;
    const s = 0.72;
    const l = 0.56;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0) * 255, f(8) * 255, f(4) * 255];
  };

  const sampleMood = (url) => {
    mood = hashMood(url);
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = 16;
        cv.height = 16;
        const g = cv.getContext('2d');
        g.drawImage(im, 0, 0, 16, 16);
        const d = g.getImageData(0, 0, 16, 16).data;
        let r = 0;
        let gg = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < d.length; i += 4) {
          const mx = Math.max(d[i], d[i + 1], d[i + 2]);
          const mn = Math.min(d[i], d[i + 1], d[i + 2]);
          if (mx - mn < 18) continue;
          r += d[i];
          gg += d[i + 1];
          b += d[i + 2];
          n += 1;
        }
        if (n) mood = [r / n, gg / n, b / n].map((v) => Math.min(255, 50 + v * 1.2));
      } catch (e) { /* 跨域取不到就沿用上一首 */ }
    };
    im.src = url;
  };


  const _cv = document.createElement('canvas');
  const _cx = _cv.getContext('2d');
  let _fontKey = '';
  const measure = (txt, fontPx, weight, stack) => {
    const key = `${weight}|${fontPx}|${stack}`;
    if (key !== _fontKey) {
      _fontKey = key;
      _cx.font = `${weight} ${fontPx}px ${stack}`;
    }
    return _cx.measureText(txt).width;
  };

  const CJK = /[\u3400-\u9fff\u3040-\u30ff\uff00-\uffef]/;
  // 中文优先按标点断句；英文只在空格/标点后断，绝不拆单词
  const wrapText = (text, maxW, fontPx, weight, stack) => {
    const src = String(text || '').trim();
    if (!src) return [''];
    if (measure(src, fontPx, weight, stack) <= maxW) return [src];

    let tokens;
    if (CJK.test(src)) {
      const parts = src.split(/(?<=[，。、；：！？…—·,.;:!?])\s*/g).filter(Boolean);
      tokens = [];
      for (const part of parts) {
        if (measure(part, fontPx, weight, stack) <= maxW) {
          tokens.push({ t: part, cjk: true });
        } else {
          for (const ch of part) tokens.push({ t: ch, cjk: true });
        }
      }
    } else {
      tokens = src.split(/\s+/).map((w) => ({ t: w, cjk: false }));
    }

    const rows = [];
    let cur = '';
    let curCjk = null;
    const join = (a, tok) => {
      if (!a) return tok.t;
      if (tok.cjk) return a + tok.t;
      return `${a} ${tok.t}`;
    };
    for (const tok of tokens) {
      const next = join(cur, tok);
      if (cur && measure(next, fontPx, weight, stack) > maxW) {
        rows.push(cur);
        cur = tok.t;
        curCjk = tok.cjk;
      } else {
        cur = next;
        curCjk = tok.cjk;
      }
    }
    if (cur) rows.push(cur);
    return rows.length ? rows : [src];
  };

  const buildWings = () => {
    const blade = (deg, len, half) => {
      const a = (deg * Math.PI) / 180;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const nx = -dy;
      const ny = dx;
      const p = (t, w) => [(WING_CX + dx * t + nx * w).toFixed(2), (WING_CY + dy * t + ny * w).toFixed(2)];
      const a0 = p(0, -len * 0.016);
      const b0 = p(len * 0.15, -half * 0.66);
      const c0 = p(len * 0.46, -half);
      const tip = p(len, 0);
      const d0 = p(len * 0.46, half);
      const e0 = p(len * 0.15, half * 0.66);
      const f0 = p(0, len * 0.016);
      return `M ${a0} L ${b0} L ${c0} L ${tip} L ${d0} L ${e0} L ${f0} Z`;
    };

    // 只保留左翼，尺寸再放大一倍
    const MAIN = [[146, 76], [165, 68], [184, 60], [203, 52], [238, 54]];
    const SUB = [[133, 44], [152, 40], [171, 38], [190, 34], [209, 30]];

    const defs = '<defs>'
      + '<radialGradient id="fx-tipg">'
      + '<stop offset="0" stop-color="#fff4d8" stop-opacity=".95"/>'
      + '<stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient>'
      + '<radialGradient id="fx-wrootg">' + '<stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
      + '<linearGradient id="fx-wg" x1="1" y1="0" x2="0" y2="0">'
      + '<stop class="wm0" offset="0" stop-color="#fff8e6"/><stop class="wm1" offset=".42" stop-color="#ffd48f"/>'
      + '<stop offset="1" stop-color="#ff8a42"/></linearGradient>'
      + '<linearGradient id="fx-wg2" x1="1" y1="0" x2="0" y2="0">'
      + '<stop offset="0" stop-color="#ffe8bd"/><stop offset="1" stop-color="#ff7a35"/></linearGradient>'
      + '<linearGradient id="fx-ws" x1="0" y1="0" x2="1" y2="0">'
      + '<stop offset="0" stop-color="#fff" stop-opacity="0"/>'
      + '<stop offset=".5" stop-color="#fff" stop-opacity=".8"/>'
      + '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
      + '<filter id="fx-wglow" x="-60%" y="-60%" width="220%" height="220%">'
      + '<feGaussianBlur stdDeviation=".8"/></filter>'
      + '<filter id="fx-wcore" x="-200%" y="-200%" width="500%" height="500%">'
      + '<feGaussianBlur stdDeviation="2"/></filter>'
      + '</defs>';

    let subLayer = '';
    let mainLayer = '';
    wingParts = [];

    SUB.forEach(([deg, len], i) => {
      const half = 0.34 + len * 0.007;
      const d = blade(deg, len, half);
      subLayer += `<path class="qs${i}" d="${d}" fill="url(#fx-wg2)" `
        + `stroke="rgba(255,236,196,.7)" stroke-width=".14"/>`
        + `<path class="qs${i}b" d="${d}" fill="url(#fx-ws)" opacity="0"/>`;
      wingParts.push({ i, open: deg, folded: 180 + (deg - 180) * 0.42, sub: true,
        el: null, sh: null, cls: `qs${i}` });
    });

    MAIN.forEach(([deg, len], i) => {
      const half = (1.1 + len * 0.026) * (i === 4 ? 1.35 : 1);
      const d = blade(deg, len, half);
      mainLayer += `<path class="qm${i}" d="${d}" fill="none" stroke="rgba(255,200,120,.5)" `
        + `stroke-width="1.1" filter="url(#fx-wglow)"/>`
        + `<path class="qm${i}" d="${d}" fill="url(#fx-wg)" `
        + `stroke="rgba(255,248,232,.8)" stroke-width=".22"/>`
        + `<path class="qm${i}b" d="${d}" fill="url(#fx-ws)" opacity="0"/>`;
      const ang = (deg * Math.PI) / 180;
      const tipx = WING_CX + Math.cos(ang) * len;
      const tipy = WING_CY + Math.sin(ang) * len;
      mainLayer += `<circle class="qt${i}" cx="${tipx.toFixed(2)}" cy="${tipy.toFixed(2)}" `
        + `r="${(1.1 + len * 0.045).toFixed(2)}" fill="url(#fx-tipg)" opacity="0"/>`;
      wingParts.push({ i: i + 10, open: deg, folded: 180 + (deg - 180) * 0.42, sub: false,
        el: null, sh: null, cls: `qm${i}` });
    });

    const core = `<circle cx="${WING_CX}" cy="${WING_CY}" r="4.2" fill="rgba(255,170,90,.55)" filter="url(#fx-wcore)"/>`
      + `<circle cx="${WING_CX}" cy="${WING_CY}" r="1.6" fill="none" stroke="rgba(255,226,170,.95)" stroke-width=".18"/>`
      + `<circle cx="${WING_CX}" cy="${WING_CY}" r=".6" fill="#fff8e6"/>`;

    wingShards.innerHTML = defs + subLayer + mainLayer + core + `<circle class="fx-wroot" cx="${WING_CX}" cy="${WING_CY}" r="14" fill="url(#fx-wrootg)" opacity="0"/>`;
    wingStops = [];
    wingRoot = wingShards.querySelector('.fx-wroot');
    for (const st of wingShards.querySelectorAll('#fx-wg stop')) wingStops.push(st);
    for (const w of wingParts) {
      w.el = wingShards.querySelectorAll(`.${w.cls}`)[w.sub ? 0 : 1] || wingShards.querySelector(`.${w.cls}`);
      if (w.el) w.el.setAttribute('opacity', w.sub ? '0.58' : '0.86');
      w.sh = wingShards.querySelector(`.${w.cls}b`);
      w.tip = wingShards.querySelector(`.qt${w.i - 10}`);
    }
  };

  const buildDebris = () => {
    const host = $('.fx-debris');
    if (!host || host.childElementCount) return;
    let seed = 77123;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    let html = '';
    for (let i = 0; i < 40; i += 1) {
      const slim = rnd() < 0.45;                       // 细长薄光片 / 小颗粒
      const wpx = (slim ? 1.0 + rnd() * 1.2 : 1.8 + rnd() * 2.8).toFixed(1);
      const hpx = (slim ? 5 + rnd() * 6 : 2 + rnd() * 3.4).toFixed(1);
      const left = (2 + rnd() * 40).toFixed(1);
      const top = (10 + rnd() * 62).toFixed(1);
      const dx = (-10 - rnd() * 26).toFixed(0);
      const dy = (48 + rnd() * 70).toFixed(0);
      const dur = (6 + rnd() * 5).toFixed(1);
      const delay = (rnd() * 7).toFixed(1);
      const rot = (rnd() * 90 - 45).toFixed(0);
      const hue = 34 + rnd() * 14;
      const light = 72 + rnd() * 16;
      html += `<i style="left:${left}%;top:${top}%;width:${wpx}px;height:${hpx}px;`
        + `--dx:${dx}px;--dy:${dy}px;--r:${rot}deg;`
        + `background:linear-gradient(180deg,hsl(${hue.toFixed(0)} 88% ${light.toFixed(0)}% / .95),`
        + `hsl(${hue.toFixed(0)} 80% ${(light - 12).toFixed(0)}% / .25));`
        + `box-shadow:0 0 4px hsla(${hue.toFixed(0)},90%,70%,.45);`
        + `animation-duration:${dur}s;animation-delay:${delay}s;"></i>`;
    }
    host.innerHTML = html;
  };

  let shotSeed = 20261026;
  const srnd = () => {
    shotSeed = (shotSeed * 1664525 + 1013904223) % 4294967296;
    return shotSeed / 4294967296;
  };

  const fireVolley = () => {
    const host = $('.fx-shots');
    if (!host) return;
    const m = 2 + Math.floor(srnd() * 3);           // 2~4 枚弹壳
    for (let i = 0; i < m; i += 1) {
      const el = document.createElement('i');
      el.className = 'case';
      el.style.left = `${(6 + srnd() * 14).toFixed(1)}%`;
      el.style.top = `${(52 + srnd() * 14).toFixed(1)}%`;
      el.style.setProperty('--px', `${(-6 - srnd() * 16).toFixed(0)}px`);
      el.style.setProperty('--py', `${(-14 - srnd() * 10).toFixed(0)}px`);
      el.style.animationDuration = `${(0.9 + srnd() * 0.5).toFixed(2)}s`;
      el.addEventListener('animationend', () => el.remove());
      host.appendChild(el);
    }
  };

  // ===== [MOD] 背景星尘漂移 · 构建 =====
  const buildStars = (count) => {
    if (!starHost) return;
    if (stars.count === count) return;
    stars.count = count;
    let seed = 90210;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    stars.els = [];
    stars.base = [];
    stars.phase = [];
    let html = '';
    for (let i = 0; i < count; i += 1) {
      const bx = 4 + rnd() * 58;          // 只铺在左侧与中部，避开立绘
      const by = 6 + rnd() * 86;
      const size = (1 + rnd() * 1.6).toFixed(1);
      const op = (0.18 + rnd() * 0.42).toFixed(2);
      stars.base.push([bx, by]);
      stars.phase.push([rnd() * 6.28, rnd() * 6.28]);
      html += `<i style="left:${bx.toFixed(1)}%;top:${by.toFixed(1)}%;width:${size}px;height:${size}px;opacity:${op};"></i>`;
    }
    starHost.innerHTML = html;
    stars.els = Array.from(starHost.children);
  };
  // ===== [MOD] 背景星尘漂移 · 构建结束 =====

  const buildCurtain = () => {
    const host = $('.fx-curtain');
    if (!host || host.childElementCount) return;
    let seed = 51207;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    let html = '';
    for (let i = 0; i < 84; i += 1) {
      const size = (1.1 + rnd() * 2.4).toFixed(1);
      const left = (rnd() * 100).toFixed(1);
      const top = (-6 + rnd() * 40).toFixed(1);
      const dur = (12 + rnd() * 10).toFixed(1);
      const delay = (rnd() * 20).toFixed(1);
      const op = (0.26 + rnd() * 0.5).toFixed(2);
      html += `<i style="left:${left}%;top:${top}%;width:${size}px;height:${size}px;`
        + `opacity:${op};animation-duration:${dur}s;animation-delay:${delay}s;"></i>`;
    }
    host.innerHTML = html;
  };

  const buildParticles = () => {
    const host = $('.fx-particles');
    if (!host || host.childElementCount) return;
    let seed = 20261025;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    let html = '';
    for (let i = 0; i < 26; i += 1) {
      const size = (1.2 + rnd() * 2.4).toFixed(2);
      const left = (4 + rnd() * 88).toFixed(2);
      const top = (18 + rnd() * 74).toFixed(2);
      const dur = (16 + rnd() * 14).toFixed(1);
      const delay = (-rnd() * 24).toFixed(1);
      html += `<i style="left:${left}%;top:${top}%;width:${size}px;height:${size}px;`
        + `animation-duration:${dur}s;animation-delay:${delay}s;"></i>`;
    }
    host.innerHTML = html;
  };

  const buildSigil = () => {
    const g = $('.fx-sigil-g');
    if (!g || g.childElementCount) return;
    const C = 50;
    const gold = 'rgba(234,196,138,.62)';
    const dim = 'rgba(234,196,138,.34)';
    const p = [];

    p.push(`<circle cx="${C}" cy="${C}" r="46" fill="none" stroke="${dim}" stroke-width=".35"/>`);
    p.push(`<circle cx="${C}" cy="${C}" r="40" fill="none" stroke="${gold}" stroke-width=".45" stroke-dasharray="18 7"/>`);
    p.push(`<circle cx="${C}" cy="${C}" r="33" fill="none" stroke="${dim}" stroke-width=".35"/>`);
    p.push(`<circle cx="${C}" cy="${C}" r="21" fill="none" stroke="${dim}" stroke-width=".3" stroke-dasharray="3 4"/>`);

    for (let i = 0; i < 72; i += 1) {
      const a = (i / 72) * Math.PI * 2;
      const long = i % 6 === 0;
      const r1 = 33;
      const r2 = 33 + (long ? 4 : 2);
      p.push(`<line x1="${(C + Math.cos(a) * r1).toFixed(2)}" y1="${(C + Math.sin(a) * r1).toFixed(2)}" `
        + `x2="${(C + Math.cos(a) * r2).toFixed(2)}" y2="${(C + Math.sin(a) * r2).toFixed(2)}" `
        + `class="fx-tk" stroke="${long ? gold : dim}" stroke-width=".3"/>`);
    }

    for (let k = 0; k < 4; k += 1) {
      const a0 = ((k * 90 + 12) * Math.PI) / 180;
      const a1 = a0 + 0.5;
      const r = 26;
      p.push(`<path d="M ${(C + Math.cos(a0) * r).toFixed(2)} ${(C + Math.sin(a0) * r).toFixed(2)} `
        + `A ${r} ${r} 0 0 1 ${(C + Math.cos(a1) * r).toFixed(2)} ${(C + Math.sin(a1) * r).toFixed(2)}" `
        + `fill="none" stroke="${dim}" stroke-width=".35"/>`);
    }

    // 维克托线稿：直接用参考图的线，淡金着色；镜像后枪口指向右上
    p.push(`<g class="fx-gunspin">`
      + `<g transform="rotate(-27 ${C} ${C}) translate(${C} ${C}) scale(-1 1) translate(${-C} ${-C})">`
      + `<image x="13" y="30.2" width="74" height="39.9" preserveAspectRatio="xMidYMid meet" `
      + `href="${GUN_URL}" opacity=".92"/>`
      + `</g></g>`);

    p.push(`<g class="fx-scan">`
      + `<line x1="${C}" y1="${C - 33}" x2="${C}" y2="${C - 46}" stroke="rgba(248,216,164,.55)" stroke-width=".45"/>`
      + `<circle cx="${C}" cy="${C - 45}" r="1.1" fill="rgba(255,228,180,.75)"/>`
      + `</g>`);
    g.innerHTML = p.join('');
    gunSpinEl = g.querySelector('.fx-gunspin');
    gunImg = g.querySelector('image');
    scanEl = g.querySelector('.fx-scan');
    tickEls = Array.from(g.querySelectorAll('.fx-tk'));
  };

  const buildRitual = () => {
    const g = $('.fx-ritual-g');
    if (!g || g.childElementCount) return;
    const parts = [];
    const C = 100;
    const ring = (r, op, dash) => `<circle cx="${C}" cy="${C}" r="${r}" fill="none" `
      + `stroke="rgba(232,190,130,${op})" stroke-width=".35"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
    parts.push(ring(96, 0.10));
    parts.push(ring(92, 0.06, '1 5'));
    parts.push(ring(80, 0.09, '6 10'));
    parts.push(ring(66, 0.07));
    parts.push(ring(48, 0.06, '2 8'));
    parts.push(ring(26, 0.08));
    // 刻度
    for (let i = 0; i < 96; i += 1) {
      const a = (i / 96) * Math.PI * 2;
      const long = i % 8 === 0;
      const r1 = 92;
      const r2 = 92 + (long ? 4.5 : 2);
      parts.push(`<line x1="${(C + Math.cos(a) * r1).toFixed(2)}" y1="${(C + Math.sin(a) * r1).toFixed(2)}" `
        + `x2="${(C + Math.cos(a) * r2).toFixed(2)}" y2="${(C + Math.sin(a) * r2).toFixed(2)}" `
        + `stroke="rgba(232,190,130,${long ? 0.12 : 0.05})" stroke-width=".3"/>`);
    }
    // 六芒：两枚倒三角
    for (const rot of [0, 180]) {
      const pts = [0, 120, 240].map((d) => {
        const a = ((d + rot) * Math.PI) / 180;
        return `${(C + Math.cos(a) * 66).toFixed(2)},${(C + Math.sin(a) * 66).toFixed(2)}`;
      });
      parts.push(`<polygon points="${pts.join(' ')}" fill="none" `
        + `stroke="rgba(232,190,130,.07)" stroke-width=".35"/>`);
    }
    // 12 道辐条
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      parts.push(`<line x1="${(C + Math.cos(a) * 48).toFixed(2)}" y1="${(C + Math.sin(a) * 48).toFixed(2)}" `
        + `x2="${(C + Math.cos(a) * 66).toFixed(2)}" y2="${(C + Math.sin(a) * 66).toFixed(2)}" `
        + `stroke="rgba(232,190,130,.05)" stroke-width=".3"/>`);
    }
    g.innerHTML = parts.join('');
  };

  const buildGears = () => {
    const { dcx, dcy } = geom;
    const R = Math.min(height * 0.35, width * 0.26);
    const rc = R * 0.86;
    const bigPath = gearPath(dcx, dcy, rc * 0.955, rc, 72);
    const midR = R * 0.30;
    const midPath = gearPath(0, 0, midR * 0.90, midR, 26);
    const smallR = R * 0.19;
    const smallPath = gearPath(0, 0, smallR * 0.88, smallR, 18);

    gBig.innerHTML =
      `<path d="${bigPath}" fill="none" stroke="rgba(232,188,128,.32)" stroke-width="1.2" stroke-dasharray="4 7"/>`
      + `<circle class="fx-ring-mid" cx="${dcx}" cy="${dcy}" r="${rc * 0.72}" fill="none" stroke="rgba(232,188,128,.16)" stroke-dasharray="3 8"/>`
      + `<circle class="fx-ring-in" cx="${dcx}" cy="${dcy}" r="${rc * 0.52}" fill="none" stroke="rgba(232,188,128,.12)"/>`;

    gMid.innerHTML = `<path d="${midPath}" fill="none" stroke="rgba(232,188,128,.38)" stroke-width="1.2" stroke-dasharray="3 6"/>`
      + `<circle cx="0" cy="0" r="${midR * 0.55}" fill="none" stroke="rgba(232,188,128,.18)"/>`
      + `<circle cx="0" cy="0" r="${midR * 0.18}" fill="rgba(232,188,128,.34)"/>`;

    gSmall.innerHTML = `<path d="${smallPath}" fill="none" stroke="rgba(232,188,128,.34)" stroke-width="1.1" stroke-dasharray="3 5"/>`
      + `<circle cx="0" cy="0" r="${smallR * 0.16}" fill="rgba(232,188,128,.38)"/>`;

    const sr = R * 0.17;
    // ===== [MOD] 时序刻度脉动 · 环形轨道 =====
    if (gPulse) {
      const radii = [0.30, 0.46, 0.62, 0.78, 1.02];
      gPulse.innerHTML = radii.map((f) =>
        `<circle cx="${dcx}" cy="${dcy}" r="${(R * f).toFixed(1)}" fill="none"`
        + ` stroke="rgba(238,192,128,.9)" stroke-width="1" stroke-dasharray="2 6" opacity="0"/>`).join('');
      tickPulse.els = Array.from(gPulse.children);
    }
    // ===== [MOD] 时序刻度脉动 · 环形轨道结束 =====

    // ===== [MOD] 刻度环形扫光 · 光弧 =====
    if (gSweep) {
      const sr = R * 1.06;
      const a0 = -0.16;
      const a1 = 0;
      const arc = `M ${(dcx + sr * Math.cos(a0)).toFixed(2)} ${(dcy + sr * Math.sin(a0)).toFixed(2)} `
        + `A ${sr.toFixed(2)} ${sr.toFixed(2)} 0 0 1 ${(dcx + sr * Math.cos(a1)).toFixed(2)} ${(dcy + sr * Math.sin(a1)).toFixed(2)}`;
      gSweep.innerHTML =
        `<path d="${arc}" fill="none" stroke="rgba(255,206,140,.85)" stroke-width="9"`
        + ` stroke-linecap="round" filter="url(#fx-sweep-blur)"/>`
        + `<path d="${arc}" fill="none" stroke="rgba(255,238,206,.95)" stroke-width="2" stroke-linecap="round"/>`
        + `<circle cx="${(dcx + sr * Math.cos(-0.02)).toFixed(2)}" cy="${(dcy + sr * Math.sin(-0.02)).toFixed(2)}"`
        + ` r="1.8" fill="rgba(255,244,214,.95)"/>`;
      sweep.ticks = Array.from(dial.querySelectorAll('.fx-tick'));
    }
    // ===== [MOD] 刻度环形扫光 · 光弧结束 =====

    gStar.innerHTML = `<circle cx="0" cy="0" r="${sr}" fill="none" stroke="rgba(232,188,128,.36)" stroke-width="1.2"/>`
      + `<circle cx="0" cy="0" r="${sr * 1.16}" fill="none" stroke="rgba(232,188,128,.20)"/>`
      + `<path d="${starPath(0, 0, sr * 0.62)}" fill="none" stroke="rgba(232,188,128,.46)" stroke-width="1.5"/>`;

    const parts = [];
    parts.push(`<circle cx="${dcx}" cy="${dcy}" r="${R * 1.02}" fill="none" stroke="rgba(255,90,90,.10)"/>`);
    // [MOD] 刻度同心圆旋动 · 刻度先收进独立数组
    const tickParts = [];
    for (let i = 0; i < 72; i += 1) {
      const a = (i / 72) * Math.PI * 2;
      const long = i % 6 === 0;
      const r1 = R * 1.02;
      const r2 = R * (long ? 1.10 : 1.06);
      tickParts.push(`<line x1="${dcx + r1 * Math.cos(a)}" y1="${dcy + r1 * Math.sin(a)}" `
        + `x2="${dcx + r2 * Math.cos(a)}" y2="${dcy + r2 * Math.sin(a)}" `
        + `class="fx-tick" data-a="${((i / 72) * 360).toFixed(2)}" `
        + `stroke="rgba(232,188,128,${long ? 0.30 : 0.13})"/>`);
    }
    for (const deg of [18, 96, 154, 232]) {
      const a = (deg * Math.PI) / 180;
      parts.push(`<line x1="${dcx}" y1="${dcy}" x2="${dcx + R * 1.35 * Math.cos(a)}" y2="${dcy + R * 1.35 * Math.sin(a)}" stroke="rgba(232,188,128,.07)"/>`);
    }
    parts.push(`<g class="g-ticks">${tickParts.join('')}</g>`);
    gRing.innerHTML = parts.join('');
    // [MOD] 刻度同心圆旋动 · 组引用
    fxTicks = $('.g-ticks');
    // [MOD] 齿轮刻度分层颜色 · 引用
    // ===== [MOD] 多层刻度相位差转动 · 三圈刻度 =====
    if (gPhase) {
      const layers = [
        { r: R * 0.44, n: 36, len: 3.4, w: 0.8 },
        { r: R * 0.63, n: 48, len: 4.6, w: 0.9 },
        { r: R * 0.82, n: 60, len: 6.0, w: 1.0 },
      ];
      gPhase.innerHTML = layers.map((L, li) => {
        let ticks = '';
        for (let i = 0; i < L.n; i += 1) {
          const a = (i / L.n) * Math.PI * 2;
          const long = i % 5 === 0;
          const r1 = L.r;
          const r2 = L.r + L.len * (long ? 1 : 0.55);
          ticks += `<line x1="${(dcx + r1 * Math.cos(a)).toFixed(1)}" y1="${(dcy + r1 * Math.sin(a)).toFixed(1)}"`
            + ` x2="${(dcx + r2 * Math.cos(a)).toFixed(1)}" y2="${(dcy + r2 * Math.sin(a)).toFixed(1)}"`
            + ` stroke="rgba(236,192,126,${(0.10 + li * 0.05).toFixed(2)})" stroke-width="${L.w}"/>`;
        }
        return `<g class="fx-phase">${ticks}</g>`;
      }).join('');
      phase.groups = Array.from(gPhase.children);
      gPhase.setAttribute('opacity', '0');
    }
    // ===== [MOD] 多层刻度相位差转动 · 三圈刻度结束 =====

    ringInEl = $('.fx-ring-in');
    ringMidEl = $('.fx-ring-mid');

    dial.setAttribute('width', String(width));
    dial.setAttribute('height', String(height));
    dial.setAttribute('viewBox', `0 0 ${width} ${height}`);
  };

  const layout = () => {
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width;
    height = rect.height;
    k = height / DESIGN_HEIGHT;
    root.style.setProperty('--u', `${16 * k}px`);

    geom = {
      cx: -width * 0.39,
      cy: height * 0.49,
      r: Math.min(width * 0.68, height * 1.05),
      dcx: 0,
      dcy: height * 0.50,
      R: Math.min(height * 0.42, width * 0.30),
    };
    buildGears();
    // [MOD] 圆弧流光拖尾 · 沿歌词弧生成一条路径
    if (trailPath && geom) {
      const { cx, cy, r } = geom;
      const a0 = -0.62;
      const a1 = 0.62;
      const p0 = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r];
      const p1 = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r];
      trailPath.setAttribute('d',
        `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} `
        + `A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`);
      const len = r * (a1 - a0);
      trailPath.dataset.len = String(len);
      const svgEl = trailPath.ownerSVGElement;
      if (svgEl) svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    buildRitual();
    buildSigil();
    buildParticles();
    buildDebris();
    buildCurtain();
    if (!wingShards.childElementCount) buildWings();

    if (currentIndex !== -2) build(currentIndex, true);
  };

  const build = (index, instant) => {
    const lines = ctx.lines || [];
    const outLayer = arc.querySelector('.fx-arc-out');
    [...arc.querySelectorAll('.fx-line')].forEach((el) => {
      const ghost = el.cloneNode(true);
      ghost.style.transition = 'opacity .5s ease';
      ghost.style.willChange = 'opacity';
      outLayer.appendChild(ghost);
      requestAnimationFrame(() => { ghost.style.opacity = '0'; });
      setTimeout(() => ghost.remove(), 640);
    });
    [...arc.querySelectorAll('.fx-line')].forEach((n) => n.remove());
    lineEls = [];
    fillEl = null;
    if (!lines.length) return;

    const from = Math.max(0, index - 3);
    const to = Math.min(lines.length - 1, index + 3);
    for (let i = from; i <= to; i += 1) {
      const el = document.createElement('div');
      el.className = 'fx-line';
      const off = i - index;
      const isCurrent = i === index;
      const font = (isCurrent ? 36 : 21) * k;
      el.style.fontSize = `${font}px`;
      el.style.left = `${geom.cx}px`;
      el.style.top = `${geom.cy}px`;
      const target = `rotate(${off * STEP_DEG}deg) translateX(${geom.r}px) translateY(-50%) skewX(-7deg)`;
      el.style.transform = instant ? target
        : `rotate(${(off + 0.6) * STEP_DEG}deg) translateX(${geom.r * 0.995}px) translateY(-50%) skewX(-7deg)`;
      const maxW = Math.min(width * 0.33, 620 * k);
      const stack = (FONTS[settings.font] || FONTS.blade).stack;
      const weight = isCurrent ? (FONTS[settings.font] || FONTS.blade).strong
        : (FONTS[settings.font] || FONTS.blade).w;
      const rows = wrapText(lines[i].fullText, maxW, font, weight, stack);
      el.textContent = '';
      for (const r of rows) {
        const ln = document.createElement('span');
        ln.className = 'ln';
        ln.textContent = r;
        el.appendChild(ln);
      }
      const trText = lines[i].translation || lines[i].translationText || '';
      if (trText) {
        const tr = document.createElement('span');
        tr.className = 'tr';
        const trRows = wrapText(trText, maxW, font * 0.46, 400, stack);
        tr.textContent = '';
        for (const r of trRows) {
          const ln = document.createElement('span');
          ln.className = 'ln';
          ln.textContent = r;
          tr.appendChild(ln);
        }
        el.appendChild(tr);
      }
      el.style.color = isCurrent ? 'rgba(246,216,152,.86)'
        : (i < index ? 'rgba(242,230,212,.50)' : 'rgba(242,230,212,.26)');
      if (isCurrent) {
        el.style.fontWeight = 'var(--fx-w-strong)';
        el.style.letterSpacing = '.06em';
        const fill = document.createElement('span');
        fill.className = 'fill';
        fill.style.fontSize = `${font}px`;
        fill.textContent = '';
        for (const r of rows) {
          const ln = document.createElement('span');
          ln.className = 'ln';
          ln.textContent = r;
          fill.appendChild(ln);
        }
        el.appendChild(fill);
        fillEl = fill;
      } else {
        el.style.fontWeight = 'var(--fx-w)';
      }
      arc.appendChild(el);
      lineEls.push(el);
      if (!instant) {
        requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = target; }));
      }
    }

    const startX = geom.cx + geom.r;
    needle.style.left = `${geom.dcx}px`;
    needle.style.top = `${geom.dcy}px`;
    needle.style.width = `${Math.max(60, startX - geom.dcx - 26)}px`;
    needle.style.background = 'linear-gradient(90deg,rgba(255,90,90,.10),rgba(255,90,90,.75))';
    needle.style.boxShadow = '0 0 8px rgba(255,90,90,.45)';

  };

  const stepDrum = (time) => {
    const dt = Math.min(0.05, Math.max(0.0015, drum.last ? time - drum.last : 0.016));
    drum.last = time;
    drum.cool = Math.max(0, drum.cool - dt);
    if (!settings.drum || settings.drumStrength <= 0) {
      drum.vel += -150 * drum.dent * dt;
      drum.vel *= Math.exp(-11 * dt);
      drum.dent += drum.vel * dt;
      if (Math.abs(drum.dent) < 1e-4) { drum.dent = 0; drum.vel = 0; }
      return drum.dent;
    }
    const raw = ctx.audio ? ctx.audio.getBands().bass : 0;
    const bass = raw > 1 ? raw / 255 : Math.max(0, Math.min(1, raw));
    // 慢均值（约 1 秒）当作“底噪”，起振 = 瞬时值高于它
    drum.sm += (bass - drum.sm) * 0.018;
    const tr = bass - drum.sm;
    if (tr > 0.10 && drum.cool === 0) {
      drum.vel -= Math.min(1, (tr - 0.10) / 0.30) * 3.4 * settings.drumStrength;
      drum.cool = 0.09;
    }
    drum.vel += -150 * drum.dent * dt;
    drum.vel *= Math.exp(-11 * dt);
    drum.dent += drum.vel * dt;
    drum.dent = Math.max(-0.45, Math.min(0.25, drum.dent));
    return drum.dent;
  };

  const spinGears = (time, power) => {
    const dt = lastTime ? Math.min(0.12, Math.max(0, time - lastTime)) : 0;
    lastTime = time;

    // 小节脉冲：低频起音算拍，四拍一小节，每小节给大盘一记“咔”
    const bass = ctx.audio ? ctx.audio.getBands().bass : 0;
    energy = energy * 0.97 + bass * 0.03;
    const threshold = Math.max(0.05, energy * 1.22) + 0.02;
    if (bass > threshold && (lastBeat < 0 || time - lastBeat > 0.24)) {
      lastBeat = time;
      beatCount += 1;
      if (settings.tickPulse) tickPulse.age = 0;   // [MOD] 时序刻度脉动 · 触发
      fx.beat = 1;                                 // [MOD] 新增五效 · 节拍脉冲
      if (beatCount % 4 === 1) tick = 1;
    }
    tick *= 0.88;
    gearSpin += dt * (3.2 + power * 8) + tick * 0.55;
    const R = geom.R;
    gBig.setAttribute('transform', `rotate(${gearSpin.toFixed(2)} ${geom.dcx} ${geom.dcy})`);
    gMid.setAttribute('transform',
      `translate(${geom.dcx + R * 0.62} ${geom.dcy + R * 0.62}) rotate(${(-gearSpin * 2.46).toFixed(2)})`);
    gSmall.setAttribute('transform',
      `translate(${geom.dcx + R * 0.80} ${geom.dcy - R * 0.55}) rotate(${(gearSpin * 4.6).toFixed(2)})`);
    gStar.setAttribute('transform',
      `translate(${geom.dcx + R * 0.26} ${geom.dcy - R * 0.86}) rotate(${(-gearSpin * 0.4).toFixed(2)})`);
  };

  const paint = (time) => {
    const SEC = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    const lines = ctx.lines || [];
    const cur = lines[currentIndex];
    if (cur && fillEl) {
      const dur = Math.max(0.01, cur.endTime - cur.startTime);
      const p = clamp01((time - cur.startTime) / dur);
      const a = (p * 92).toFixed(1);
      const b = (p * 92 + 4).toFixed(1);
      const c = (p * 92 + 7).toFixed(1);
      fillEl.style.setProperty('-webkit-mask-image',
        `linear-gradient(90deg,#000 0%,#000 ${a}%,rgba(0,0,0,.3) ${b}%,transparent ${c}%)`);
      fillEl.style.setProperty('mask-image',
        `linear-gradient(90deg,#000 0%,#000 ${a}%,rgba(0,0,0,.3) ${b}%,transparent ${c}%)`);
    }

    const power = ctx.audio ? ctx.audio.getPower() : 0;
    spinGears(time, power);
    const dent = stepDrum(time);
    // ===== [MOD] 时序刻度脉动 · 每帧 =====
    if (tickPulse.els.length) {
      const pdt = Math.min(0.05, Math.max(0.0015, tickPulse.last ? time - tickPulse.last : 0.016));
      tickPulse.last = time;
      if (!settings.tickPulse) {
        for (const el of tickPulse.els) if (el.getAttribute('opacity') !== '0') el.setAttribute('opacity', '0');
        tickPulse.age = -1;
      } else if (tickPulse.age >= 0) {
        tickPulse.age += pdt;
        const amp = settings.tickStrength * 0.85;
        for (let i = 0; i < tickPulse.els.length; i += 1) {
          const age = tickPulse.age - i * TICK_PULSE_STAGGER;
          const v = age <= 0 ? 0
            : Math.exp(-settings.tickDecay * age * 2.2) * Math.min(1, age / 0.04);
          tickPulse.els[i].setAttribute('opacity', (v * amp).toFixed(3));
        }
        if (tickPulse.age > 3.2) tickPulse.age = -1;
      }
    }
    // ===== [MOD] 时序刻度脉动 · 每帧结束 =====

    // ===== [MOD] 刻度环形扫光 · 每帧 =====
    if (gSweep) {
      const sdt = Math.min(0.05, Math.max(0.0015, sweep.last ? time - sweep.last : 0.016));
      sweep.last = time;
      sweep.spin = sweep.spin * 0.9 + (tick * 1.6) * 0.1;   // 节拍给一点加速
      if (settings.sweep) {
        const degPerSec = 26 + settings.sweepSpeed * 54 + sweep.spin * 40;
        sweep.angle = (sweep.angle + degPerSec * sdt) % 360;
        gSweep.style.display = '';
        gSweep.setAttribute('transform', `rotate(${sweep.angle.toFixed(2)} ${geom.dcx} ${geom.dcy})`);
        const bright = settings.sweepBright;
        for (const el of sweep.ticks) {
          const a = Number(el.dataset.a) || 0;
          let d = (a - sweep.angle) % 360;
          if (d > 180) d -= 360;
          if (d < -180) d += 360;
          const boost = Math.exp(-(d * d) / (2 * 7 * 7)) * bright;
          const base = a % 30 < 0.5 ? 0.30 : 0.13;
          el.setAttribute('stroke', `rgba(255,226,178,${Math.min(1, base + boost * 0.72).toFixed(3)})`);
        }
      } else if (gSweep.style.display !== 'none') {
        gSweep.style.display = 'none';
        for (const el of sweep.ticks) {
          const a = Number(el.dataset.a) || 0;
          const base = a % 30 < 0.5 ? 0.30 : 0.13;
          el.setAttribute('stroke', `rgba(232,188,128,${base})`);
        }
      }
    }
    // ===== [MOD] 刻度环形扫光 · 每帧结束 =====

    // ===== [MOD] 相位差 / 星尘 · 每帧 =====
    {
      const bdt = Math.min(0.05, Math.max(0.0015, fx.last ? time - fx.last : 0.016));
      const bassNow = ctx.audio ? ctx.audio.getBands().bass : 0;
      const bn = bassNow > 1 ? bassNow / 255 : Math.max(0, Math.min(1, bassNow));

      // ① 多层刻度相位差转动
      if (phase.groups.length && gPhase && geom) {
        if (settings.phaseRot) {
          gPhase.setAttribute('opacity', '1');
          const base = 3 + bn * 46 * settings.phaseDrive;      // deg/s
          const d = settings.phaseDiff;
          const speeds = [base * (1 - d), -base * (0.45 + d), base * (0.75 + d * 1.4)];
          for (let i = 0; i < phase.groups.length; i += 1) {
            phase.ang[i] = (phase.ang[i] + speeds[i] * bdt) % 360;
            phase.groups[i].setAttribute('transform',
              `rotate(${phase.ang[i].toFixed(2)} ${geom.dcx} ${geom.dcy})`);
          }
        } else if (gPhase.getAttribute('opacity') !== '0') {
          gPhase.setAttribute('opacity', '0');
        }
      }

      // ② 背景星尘漂移
      if (starHost) {
        if (settings.stardust) {
          buildStars(settings.starCount);
          starHost.style.display = '';
          stars.push *= Math.exp(-2.2 * bdt);
          if (fx.beat > 0.9) stars.push = Math.min(26, stars.push + 9);   // 鼓点向外吹
          const sp = 0.15 + settings.starSpeed * 0.9;
          for (let i = 0; i < stars.els.length; i += 1) {
            const [bx, by] = stars.base[i];
            const [p1, p2] = stars.phase[i];
            const wob = Math.sin(time * sp + p1) * 5;
            const wob2 = Math.cos(time * sp * 0.8 + p2) * 4;
            let dx = (bx - 35) * (stars.push / 100);       // 以左侧中部为原点向外
            let dy = (by - 50) * (stars.push / 100);
            stars.els[i].style.transform =
              `translate3d(${(wob + dx).toFixed(2)}px,${(wob2 + dy).toFixed(2)}px,0)`;
          }
        } else if (starHost.style.display !== 'none') {
          starHost.style.display = 'none';
          starHost.innerHTML = '';
          stars.count = -1;
        }
      }
    }
    // ===== [MOD] 相位差 / 星尘 · 每帧结束 =====

    // ===== [MOD] 背景呼吸 / 分层颜色 · 每帧 =====
    {
      const bassNow = ctx.audio ? ctx.audio.getBands().bass : 0;
      const bn = bassNow > 1 ? bassNow / 255 : Math.max(0, Math.min(1, bassNow));
      // 低通：0.045 约 0.4 秒时间常数，够慢才不会有闪动
      bgLp += (bn - bgLp) * 0.045;

      // ① 背景径向渐变呼吸（最底层，刻度线之下）
      if (bgBreathEl && geom) {
        if (settings.bgBreath) {
          const k = Math.min(1, bgLp * settings.bgWeight * settings.bgStrength);
          bgBreathEl.style.setProperty('--bx', `${((geom.cx + geom.r * 0.62) / Math.max(1, width) * 100).toFixed(1)}%`);
          bgBreathEl.style.setProperty('--by', `${(geom.cy / Math.max(1, height) * 100).toFixed(1)}%`);
          bgBreathEl.style.opacity = (0.10 + 0.72 * k).toFixed(3);
        } else if (bgBreathEl.style.opacity !== '0') {
          bgBreathEl.style.opacity = '0';
        }
      }

      // ② 齿轮刻度分层颜色（内暗红 / 中橙红 / 外暖金）
      if (ringInEl && ringMidEl) {
        if (settings.ringTint) {
          const t = Math.min(1, Math.max(0, (0.10 + bgLp * settings.tintDrive) * settings.tintShift));
          const mix = (a, b) => Math.round(a + (b - a) * t);
          // 内层：暗红
          ringInEl.setAttribute('stroke', `rgba(${mix(232, 186)},${mix(188, 62)},${mix(128, 54)},.24)`);
          // 中层：橙红
          ringMidEl.setAttribute('stroke', `rgba(${mix(232, 236)},${mix(188, 132)},${mix(128, 70)},.22)`);
          // 外层：暖金（刻度线）
          if (fxTicks && !settings.sweep) {
            const gold = `rgba(${mix(232, 255)},${mix(188, 206)},${mix(128, 132)},`;
            for (const el of fxTicks.children) {
              const a = Number(el.dataset.a) || 0;
              const base = a % 30 < 0.5 ? 0.30 : 0.13;
              el.setAttribute('stroke', `${gold}${Math.min(1, base + t * 0.16).toFixed(3)})`);
            }
          }
        } else if (!settings.sweep) {
          // 关掉时还原原本统一暗调
          const done = ringInEl.getAttribute('stroke').indexOf('186') !== -1;
          if (done) {
            ringInEl.setAttribute('stroke', 'rgba(232,188,128,.12)');
            ringMidEl.setAttribute('stroke', 'rgba(232,188,128,.16)');
            if (fxTicks) {
              for (const el of fxTicks.children) {
                const a = Number(el.dataset.a) || 0;
                const base = a % 30 < 0.5 ? 0.30 : 0.13;
                el.setAttribute('stroke', `rgba(232,188,128,${base})`);
              }
            }
          }
        }
      }
    }
    // ===== [MOD] 背景呼吸 / 分层颜色 · 每帧结束 =====

    // ===== [MOD] 新增五效 · 每帧 =====
    {
      const fdt = Math.min(0.05, Math.max(0.0015, fx.last ? time - fx.last : 0.016));
      fx.last = time;
      fx.beat *= 0.90;

      // ① 歌词辉光呼吸
      if (fillEl) {
        if (settings.glowBreath) {
          const e = Math.min(1, Math.max(0, power));
          const rng = (0.28 + settings.glowRange * 0.9 * e).toFixed(2);
          const alp = (0.10 + settings.glowBright * 0.42 * e).toFixed(2);
          fillEl.style.filter = 'drop-shadow(0 0 .3em rgba(8,4,4,.85))'
            + ` drop-shadow(0 0 ${rng}em rgba(255,206,158,${alp}))`
            + ` drop-shadow(0 0 ${(rng * 2.1).toFixed(2)}em rgba(255,150,90,${(alp * 0.55).toFixed(2)}))`;
        } else if (fillEl.style.filter) {
          fillEl.style.filter = '';
        }
      }

      // ② 刻度同心圆旋动
      if (fxTicks) {
        if (settings.ringSpin) {
          const spd = 6 * settings.ringSpeed + power * settings.ringDrive * 90;
          fx.ringAng = (fx.ringAng + spd * fdt) % 360;
          fxTicks.setAttribute('transform',
            `rotate(${fx.ringAng.toFixed(2)} ${geom.dcx} ${geom.dcy})`);
        } else if (fx.ringAng) {
          fx.ringAng = 0;
          fxTicks.removeAttribute('transform');
        }
      }

      // ③ 文字弹性缩放（只作用当前句）
      if (settings.textPulse) {
        if (fx.beat > 0.85) fx.scaleV += settings.textAmp * 9;
        fx.scaleV += -160 * fx.scale * fdt;
        fx.scaleV *= Math.exp(-settings.textDamp * fdt);
        fx.scale += fx.scaleV * fdt;
        fx.scale = Math.max(-0.02, Math.min(0.3, fx.scale));
        if (fillEl && fillEl.parentElement) {
          fillEl.parentElement.style.scale = String(1 + fx.scale);
        }
      } else if (fx.scale) {
        fx.scale = 0;
        fx.scaleV = 0;
        if (fillEl && fillEl.parentElement) fillEl.parentElement.style.scale = '';
      }

      // ④ 低频径向光晕
      if (radialEl && geom) {
        if (settings.radialGlow) {
          if (fx.beat > 0.9) fx.radialAge = 0;
          fx.radialAge += fdt;
          const life = 1.25;
          const k = Math.min(1, fx.radialAge / life);
          const size = (240 + k * 620 * settings.radialRadius).toFixed(0);
          radialEl.style.left = `${(geom.cx + geom.r * 0.78).toFixed(0)}px`;
          radialEl.style.top = `${geom.cy.toFixed(0)}px`;
          radialEl.style.width = `${size}px`;
          radialEl.style.height = `${size}px`;
          radialEl.style.opacity = (settings.radialAlpha * (1 - k)).toFixed(3);
        } else if (radialEl.style.opacity !== '0') {
          radialEl.style.opacity = '0';
        }
      }

      // ⑤ 圆弧流光拖尾
      if (trailPath) {
        if (settings.arcTrail) {
          const len = Number(trailPath.dataset.len) || 600;
          const dash = Math.max(24, len * 0.22 * settings.trailLength);
          trailPath.setAttribute('stroke-dasharray', `${dash.toFixed(1)} ${len.toFixed(1)}`);
          fx.trailOff = (fx.trailOff - (len / 6) * fdt * (0.6 + fx.beat)) % len;
          trailPath.setAttribute('stroke-dashoffset', fx.trailOff.toFixed(1));
          trailPath.style.opacity = (0.35 + 0.65 * Math.min(1, fx.beat))
            .toFixed(3) * Math.min(1, settings.trailBright);
        } else if (trailPath.style.opacity !== '0') {
          trailPath.style.opacity = '0';
        }
      }
    }
    // ===== [MOD] 新增五效 · 每帧结束 =====
    if (geom) {
      arc.style.transform = `translate3d(0,${(-dent * 26).toFixed(2)}px,0) `
        + `scale(${(1 + dent * 0.022).toFixed(4)})`;
      arc.style.transformOrigin = `${geom.cx + geom.r * 0.55}px ${geom.cy}px`;
      dial.style.transform = `translate3d(0,${(-dent * 12).toFixed(2)}px,0) `
        + `scale(${(1 - dent * 0.035).toFixed(4)})`;
      dial.style.transformOrigin = `${geom.dcx}px ${geom.dcy}px`;
    }

    const duration = ctx.getDuration() || 0;
    const start = lines.length ? lines[0].startTime : 0;
    const end = duration > 0 ? duration : (lines.length ? lines[lines.length - 1].endTime : 0);
    const ratio = end > start ? clamp01((time - start) / (end - start)) : 0;
    needle.style.transform = `rotate(${(Math.sin(time * 1.6) * 0.45 + (power - 0.35) * 1.8).toFixed(2)}deg)`;

    prog.setAttribute('stroke-dashoffset', (100 - ratio * 100).toFixed(2));
    bloom.setAttribute('stroke-dashoffset', (100 - ratio * 100).toFixed(2));
    const ang = -Math.PI / 2 + ratio * Math.PI * 2;
    dot.setAttribute('cx', (100 + Math.cos(ang) * 70).toFixed(2));
    dot.setAttribute('cy', (100 + Math.sin(ang) * 18).toFixed(2));
    dot.setAttribute('opacity', ratio > 0.001 ? '0.95' : '0');
    const breath = 1 + Math.sin(time * 1.15) * 0.006 + power * 0.03;
    haloBox.style.transform = `translate(-50%,-50%) rotate(1.6deg) scale(${breath.toFixed(4)})`;
    // 高潮：能量持续高于均值 → 光翼从根部染色
    if (ctx.getCoverUrl) {
      const cov = ctx.getCoverUrl();
      if (cov && cov !== lastCover) {
        lastCover = cov;
        sampleMood(cov);
      }
    }
    avgPower += (power - avgPower) * 0.02;
    const hot = power > Math.max(avgPower * 1.32, 0.5);
    climax += ((hot ? 1 : 0) - climax) * (hot ? 0.10 : 0.015);
    if (wingStops.length === 3) {
      const t = climax;
      const mx = (a, b) => Math.round(a + (b - a) * t);
      wingStops[0].setAttribute('stop-color', `rgb(${mx(255, mood[0])},${mx(248, mood[1])},${mx(230, mood[2])})`);
      wingStops[1].setAttribute('stop-color', `rgb(${mx(255, mood[0])},${mx(212, mood[1])},${mx(143, mood[2])})`);
      wingStops[2].setAttribute('stop-color', `rgb(${mx(255, mood[0])},${mx(138, mood[1])},${mx(66, mood[2])})`);
    }
    // 光翼挥动 + 刃身流光
    for (const w of wingParts) {
      const lag = w.sub ? 0.05 : 0;
      const raw = (0.55 + power * 0.85 - Math.abs(w.i - 10) * 0.012 - lag) / 0.6;
      const u = raw <= 0 ? 0 : raw >= 1 ? 1 : raw * raw * (3 - 2 * raw);
      const flap = Math.sin(time * Math.PI * 2 * 0.45 - w.i * 0.4) * 1.5 * u;
      const rot = (w.folded - w.open) * (1 - u) + flap;
      const tf = `rotate(${rot.toFixed(2)} ${WING_CX} ${WING_CY})`;
      if (w.el) {
        w.el.setAttribute('transform', tf);
        w.el.setAttribute('opacity', ((w.sub ? 0.42 : 0.55) + 0.45 * u).toFixed(3));
      }
      if (w.sh) {
        w.sh.setAttribute('transform', tf);
        const shi = (Math.sin(time * Math.PI * 2 + w.i * 0.6) + 1) / 2;
        w.sh.setAttribute('opacity', (0.06 + 0.34 * shi * u).toFixed(3));
      }
    }

    // 特效A/B：间歇性连射
    if (SEC - lastVolley > volleyGap) {
      lastVolley = SEC;
      volleyGap = 0.5 + srnd() * 0.8;
      fireVolley();
    }
    // 特效C：光环脉冲，每 3~4 秒一圈
    if (SEC - lastPulse > 3.4) {
      lastPulse = SEC;
      const hb = $('.fx-halo-box');
      if (hb) {
        const ring = document.createElement('i');
        ring.className = 'fx-halo-pulse';
        ring.addEventListener('animationend', () => ring.remove());
        hb.appendChild(ring);
      }
    }
    if (gunSpinEl) {
      // 10 秒一圈，顺时针；挂钟驱动，暂停也匀速
      const deg = ((SEC % 10) / 10) * 360;
      gunSpinEl.setAttribute('transform', `rotate(${deg.toFixed(2)} 50 50)`);
      // 枪线稿呼吸发光：幅度很小
      if (gunImg) {
        gunImg.setAttribute('opacity', (0.30 + 0.30 * (0.5 + 0.5 * Math.sin((SEC * Math.PI * 2) / 3))).toFixed(3));
      }
      // 环上扫描线：14 秒一圈
      if (scanEl) {
        const sdeg = (SEC % 14) / 14 * 360;
        scanEl.setAttribute('transform', `rotate(${sdeg.toFixed(2)} 50 50)`);
        const abs = sdeg - 90;
        const n = tickEls.length || 1;
        for (let i = 0; i < tickEls.length; i += 1) {
          const tickDeg = (i / n) * 360;
          let d = (tickDeg - abs) % 360;
          if (d > 180) d -= 360;
          if (d < -180) d += 360;
          const boost = Math.max(0, 1 - Math.abs(d) / 10);
          tickEls[i].setAttribute('opacity', (0.55 + 0.45 * boost).toFixed(2));
        }
      }
    }
    if (wingRoot) {
      wingRoot.setAttribute('opacity', (climax * 0.6).toFixed(3));
      wingRoot.setAttribute('r', (12 + climax * 20).toFixed(1));
    }

  };

  const frame = () => {
    if (!height) layout();
    const index = ctx.staticMode && ctx.staticLineIndex != null ? ctx.staticLineIndex : ctx.getLineIndex();
    if (index >= 0 && index !== currentIndex) {
      currentIndex = index;
      build(index, false);
    }
    paint(ctx.lyricTime.get());
  };

  readSettings();
  layout();
  currentIndex = ctx.staticMode && ctx.staticLineIndex != null
    ? ctx.staticLineIndex
    : Math.max(0, ctx.getLineIndex());
  if (!height) layout();
  build(currentIndex, true);
  frame();

  ctx.onResize(() => layout());
  ctx.onChange(() => readSettings());
  ctx.onFrame(() => {
    if (ctx.isPaused()) return;
    frame();
  });
};

export default function activate(folium) {
  folium.registries.visualizers.register({
    id: 'arc',
    label: { 'zh-CN': '圣环 · 弧线（齿轮）', en: 'Exusiai · Arc & Gears' },
    order: 330,
    hostLayers: { background: false, subtitles: false },
    settings: [
      { key: 'character', type: 'boolean', label: { 'zh-CN': '显示立绘', en: 'Character' }, defaultValue: true, description: { 'zh-CN': '显示右侧能天使立绘', en: 'Show the character' }, },
      { key: 'charScale', type: 'number', label: { 'zh-CN': '立绘大小', en: 'Character size' }, min: 60, max: 130, step: 1, defaultValue: 100, description: { 'zh-CN': '立绘整体大小，100 为原始比例', en: 'Character size, 100 = original' }, },
      { key: 'charDim', type: 'number', label: { 'zh-CN': '立绘淡化', en: 'Character fade' }, min: 0, max: 100, step: 1, defaultValue: 30, description: { 'zh-CN': '立绘压暗程度，越高越融入背景', en: 'How much the character fades into the background' }, },
      { key: 'halo', type: 'boolean', label: { 'zh-CN': '光环', en: 'Halo' }, defaultValue: true, description: { 'zh-CN': '头顶光环，同时是整首进度环', en: 'Halo above the head; it doubles as the progress ring' }, },
      { key: 'drum', type: 'boolean', label: { 'zh-CN': '仿真鼓面', en: 'Drumhead' }, defaultValue: true, description: { 'zh-CN': '低频鼓点让圆弧与歌词弹性下陷再回弹', en: 'Bass kicks dent the arc and lyrics, then they spring back' }, },
      { key: 'drumStrength', type: 'number', label: {  'zh-CN': '鼓面强度', en: 'Drumhead strength' }, description: { 'zh-CN': '鼓面凹陷深度与回弹力度，1.00x 为基准', en: 'Dent depth and rebound force; 1.00x is the tuned default' },
        min: 0, max: 2, step: 0.05, defaultValue: 1 },
      // [MOD] 时序刻度脉动
      { key: 'tickPulse', type: 'boolean', label: { 'zh-CN': '时序刻度脉动', en: 'Tick pulse' }, defaultValue: false, description: { 'zh-CN': '鼓点触发时，背景刻度环由内向外依次亮起', en: 'On a beat the background rings light up from the inside out' }, },
      { key: 'tickStrength', type: 'number', label: {  'zh-CN': '脉动强度', en: 'Pulse strength' }, description: { 'zh-CN': '刻度环被点亮的亮度，0 为不亮', en: 'How bright the rings light up; 0 = off' },
        min: 0, max: 2, step: 0.05, defaultValue: 0.6 },
      { key: 'tickDecay', type: 'number', label: {  'zh-CN': '衰减速度', en: 'Pulse decay' }, description: { 'zh-CN': '刻度亮点消失的快慢，越大消失越快', en: 'How fast the lit rings fade; higher = faster' },
        min: 0.2, max: 3, step: 0.05, defaultValue: 1 },
      // [MOD] 刻度环形扫光
      { key: 'sweep', type: 'boolean', label: { 'zh-CN': '刻度环形扫光', en: 'Ring sweep' }, defaultValue: false, description: { 'zh-CN': '一道暖金流光沿背景刻度环顺时针扫过', en: 'A warm-gold streak sweeps clockwise along the tick ring' }, },
      { key: 'sweepBright', type: 'number', label: {  'zh-CN': '扫光亮度', en: 'Sweep brightness' }, description: { 'zh-CN': '扫光与途经刻度的提亮程度', en: 'Brightness of the streak and the ticks it passes' },
        min: 0, max: 2, step: 0.05, defaultValue: 0.7 },
      { key: 'sweepSpeed', type: 'number', label: {  'zh-CN': '扫光速度', en: 'Sweep speed' }, description: { 'zh-CN': '扫光转动的速度，0 为停住', en: 'Streak rotation speed; 0 = stopped' },
        min: 0, max: 3, step: 0.05, defaultValue: 1.2 },
      // [MOD] 歌词辉光呼吸
      { key: 'glowBreath', type: 'boolean', label: { 'zh-CN': '歌词辉光呼吸', en: 'Lyric glow breath' }, defaultValue: false, description: { 'zh-CN': '当前句歌词的外发光随音量舒展、收窄', en: 'The active line’s glow expands and fades with the volume' }, },
      { key: 'glowRange', type: 'number', label: { 'zh-CN': '辉光范围', en: 'Glow range' }, min: 0, max: 2, step: 0.05, defaultValue: 0.7, description: { 'zh-CN': '辉光向外扩散的范围', en: 'How far the glow spreads' }, },
      { key: 'glowBright', type: 'number', label: { 'zh-CN': '辉光亮度', en: 'Glow brightness' }, min: 0, max: 2, step: 0.05, defaultValue: 0.8, description: { 'zh-CN': '辉光的浓淡', en: 'Glow intensity' }, },
      // [MOD] 刻度同心圆旋动
      { key: 'ringSpin', type: 'boolean', label: { 'zh-CN': '刻度旋动', en: 'Ring spin' }, defaultValue: false, description: { 'zh-CN': '背景多层刻度圆环缓慢自转', en: 'The background tick rings rotate slowly' }, },
      { key: 'ringSpeed', type: 'number', label: { 'zh-CN': '旋转速度', en: 'Spin speed' }, min: 0, max: 1, step: 0.01, defaultValue: 0.25, description: { 'zh-CN': '基础转速，不受音量影响的部分', en: 'Base rotation speed, independent of the audio' }, },
      { key: 'ringDrive', type: 'number', label: { 'zh-CN': '音频驱动权重', en: 'Audio drive' }, min: 0, max: 1, step: 0.01, defaultValue: 0.4, description: { 'zh-CN': '音量对转速的加成，0 为纯匀速', en: 'How much audio energy speeds the rings up; 0 = constant' }, },
      // [MOD] 文字弹性缩放
      { key: 'textPulse', type: 'boolean', label: { 'zh-CN': '文字弹性缩放', en: 'Text pulse' }, defaultValue: false, description: { 'zh-CN': '鼓点瞬间当前句轻微放大再弹回', en: 'On a hit the active line grows a touch and springs back' }, },
      { key: 'textAmp', type: 'number', label: { 'zh-CN': '缩放幅度', en: 'Pulse amount' }, min: 0, max: 0.3, step: 0.005, defaultValue: 0.08, description: { 'zh-CN': '放大的幅度，0.08 约等于 8%', en: 'Pulse amount; 0.08 is about 8%' }, },
      { key: 'textDamp', type: 'number', label: { 'zh-CN': '回弹阻尼', en: 'Rebound damping' }, min: 2, max: 15, step: 0.1, defaultValue: 8, description: { 'zh-CN': '回弹阻尼，越大回得越快越干脆', en: 'Rebound damping; higher = snappier return' }, },
      // [MOD] 低频径向光晕
      { key: 'radialGlow', type: 'boolean', label: { 'zh-CN': '低频径向光晕', en: 'Radial glow' }, defaultValue: false, description: { 'zh-CN': '低频触发一圈暗红光晕从圆弧中心散开', en: 'A soft dark-red glow spreads from the arc centre on bass hits' }, },
      { key: 'radialRadius', type: 'number', label: { 'zh-CN': '光晕半径', en: 'Glow radius' }, min: 0, max: 2, step: 0.05, defaultValue: 0.8, description: { 'zh-CN': '光晕最终扩散到多大', en: 'How far the glow spreads' }, },
      { key: 'radialAlpha', type: 'number', label: { 'zh-CN': '光晕透明度', en: 'Glow opacity' }, min: 0, max: 1, step: 0.02, defaultValue: 0.3, description: { 'zh-CN': '光晕最亮时的不透明度', en: 'Opacity at its brightest' }, },
      // [MOD] 圆弧流光拖尾
      { key: 'arcTrail', type: 'boolean', label: { 'zh-CN': '圆弧流光拖尾', en: 'Arc trail' }, defaultValue: false, description: { 'zh-CN': '暖金光带沿歌词弧滑动，带淡出拖尾', en: 'A warm-gold band slides along the lyric arc with a fading tail' }, },
      { key: 'trailLength', type: 'number', label: { 'zh-CN': '拖尾长度', en: 'Trail length' }, min: 0, max: 2, step: 0.05, defaultValue: 0.6, description: { 'zh-CN': '拖尾长度，越长光带越连贯', en: 'Trail length; longer = a more continuous band' }, },
      // [MOD] 多层刻度相位差转动
      { key: 'phaseRot', type: 'boolean', label: { 'zh-CN': '刻度相位差旋转', en: 'Phase rotation' }, defaultValue: false,
        description: { 'zh-CN': '内中外三圈刻度以不同转速（含反向）转动', en: 'Inner, mid and outer rings turn at different speeds, some reversed' } },
      { key: 'phaseDiff', type: 'number', label: { 'zh-CN': '转速差', en: 'Speed difference' }, min: 0, max: 0.6, step: 0.01, defaultValue: 0.15,
        description: { 'zh-CN': '圈层之间转速的差距，0 为同速', en: 'How far the layers drift apart in speed; 0 = locked' } },
      { key: 'phaseDrive', type: 'number', label: { 'zh-CN': '音频加速权重', en: 'Audio drive' }, min: 0, max: 1, step: 0.01, defaultValue: 0.3,
        description: { 'zh-CN': '低频对整体转速的加成', en: 'How much bass speeds the rings up' } },
      // [MOD] 背景星尘漂移
      { key: 'stardust', type: 'boolean', label: { 'zh-CN': '星尘漂移', en: 'Stardust drift' }, defaultValue: false,
        description: { 'zh-CN': '背景极细暗金星尘缓慢漂浮，鼓点时被吹散再回归', en: 'Tiny dark-gold specks drift and are blown outward on hits' } },
      { key: 'starCount', type: 'number', label: { 'zh-CN': '星尘数量', en: 'Stardust count' }, min: 0, max: 80, step: 1, defaultValue: 25,
        description: { 'zh-CN': '星尘点的个数', en: 'How many specks' } },
      { key: 'starSpeed', type: 'number', label: { 'zh-CN': '漂移速度', en: 'Drift speed' }, min: 0, max: 1, step: 0.01, defaultValue: 0.2,
        description: { 'zh-CN': '平时漂浮的快慢', en: 'Ambient drift speed' } },
      // [MOD] 背景径向渐变呼吸
      { key: 'bgBreath', type: 'boolean', label: { 'zh-CN': '背景径向渐变呼吸', en: 'Background breath' }, defaultValue: false,
        description: { 'zh-CN': '低频升高时底层背景中心缓慢透出暗红柔光', en: 'Bass raises a soft dark-red glow in the background centre' } },
      { key: 'bgStrength', type: 'number', label: { 'zh-CN': '呼吸强度', en: 'Breath strength' }, min: 0, max: 2, step: 0.05, defaultValue: 0.5,
        description: { 'zh-CN': '中心提亮的幅度，0 为不亮', en: 'How much the centre brightens; 0 = off' } },
      { key: 'bgWeight', type: 'number', label: { 'zh-CN': '响应权重', en: 'Response weight' }, min: 0, max: 1, step: 0.01, defaultValue: 0.6,
        description: { 'zh-CN': '低频对亮度的驱动占比，越低越迟钝', en: 'How much bass drives it; lower = lazier' } },
      // [MOD] 齿轮刻度分层颜色
      { key: 'ringTint', type: 'boolean', label: { 'zh-CN': '齿轮刻度分层颜色', en: 'Layered tick colour' }, defaultValue: false,
        description: { 'zh-CN': '内层暗红、中层橙红、外层暖金，音量越大差距越明显', en: 'Inner dark red, mid orange-red, outer warm gold; louder = stronger split' } },
      { key: 'tintShift', type: 'number', label: { 'zh-CN': '色彩偏移强度', en: 'Colour shift' }, min: 0, max: 2, step: 0.05, defaultValue: 0.4,
        description: { 'zh-CN': '各层颜色之间的分离程度', en: 'How far the layers separate in colour' } },
      { key: 'tintDrive', type: 'number', label: { 'zh-CN': '音频驱动权重', en: 'Audio drive' }, min: 0, max: 1, step: 0.01, defaultValue: 0.35,
        description: { 'zh-CN': '音量对颜色差距的加成，0 为固定分层', en: 'How much audio widens the split; 0 = fixed' } },
      { key: 'trailBright', type: 'number', label: { 'zh-CN': '流光亮度', en: 'Trail brightness' }, min: 0, max: 2, step: 0.05, defaultValue: 0.7, description: { 'zh-CN': '光带亮度，也影响随节拍闪动的强度', en: 'Band brightness; also how strongly it reacts to hits' }, },
      {
        key: 'font', type: 'select', label: { 'zh-CN': '歌词字体', en: 'Lyric font' }, defaultValue: 'serif',
        options: [
          { value: 'serif', label: { 'zh-CN': '宋体（粗）', en: 'Serif heavy' }, description: { 'zh-CN': '歌词字体，只影响文字，不影响排布', en: 'Lyric typeface; layout is not affected' }, },
          { value: 'kai', label: { 'zh-CN': '楷体（笔锋）', en: 'Kai brush' } },
          { value: 'hei', label: { 'zh-CN': '黑体（硬朗）', en: 'Hei' } },
          { value: 'sans', label: { 'zh-CN': '黑体（跟随主题）', en: 'Theme sans' } },
        ],
      },
    ],
    mount: (container, ctx) => mountStage(folium, container, ctx),
  });
}
