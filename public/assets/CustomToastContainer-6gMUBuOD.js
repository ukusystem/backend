import{K as Ce,J as xe,s as H,ax as Ft,U as C,R as Q,r as p,M as Se,j as i,N as se,P as ke,aZ as nt,cR as gt,$ as Dn,a0 as jn,_ as On,dm as Oe,dn as Mn,V as mt,dp as Bn,dq as Rn,c as ue,S as q,u as rt,a as ot,dr as Nn,aH as zt,ds as $n,B as j,a2 as Pn,dt as Ln,f as Hn,du as Vn,w as Fn,b as zn,l as E,aX as Un,ar as Me,Q as Wn,aF as Be,T as I,p as Ge,bB as Kn,bC as qn,bD as Gn,D as Ut,bE as Yn,as as Zn,dv as Jn,dw as Xn,bG as Qn,bo as er,dx as tr,dy as nr,dz as rr,dA as or,dB as ir,dC as ar,dD as sr,dE as cr,dF as lr,dG as dr,dH as ur,dI as pr,bN as hr,dJ as fr,a8 as N,dK as gr,dL as mr,dM as br,dN as wr,aI as yr,dO as vr,dh as Cr,by as xr,dP as Sr}from"./index-ClgYl7I5.js";import{M as Wt}from"./MainSimpleCard-DuS9dp1p.js";import{C as kr}from"./CardContent-C_LoNV3o.js";import{S as Ir}from"./SpeedCameraIcon-DzMK3Tsd.js";import{c as Kt}from"./capitalizeFirstLetter-D3I3Kuho.js";import{u as qt}from"./usePreviousProps-4yHjJTzK.js";function Er(e){return Ce("MuiAppBar",e)}xe("MuiAppBar",["root","positionFixed","positionAbsolute","positionSticky","positionStatic","positionRelative","colorDefault","colorPrimary","colorSecondary","colorInherit","colorTransparent","colorError","colorInfo","colorSuccess","colorWarning"]);const _r=e=>{const{color:t,position:n,classes:r}=e,o={root:["root",`color${C(t)}`,`position${C(n)}`]};return ke(o,Er,r)},bt=(e,t)=>e?`${e==null?void 0:e.replace(")","")}, ${t})`:t,Tr=H(Ft,{name:"MuiAppBar",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,t[`position${C(n.position)}`],t[`color${C(n.color)}`]]}})(Q(({theme:e})=>({display:"flex",flexDirection:"column",width:"100%",boxSizing:"border-box",flexShrink:0,variants:[{props:{position:"fixed"},style:{position:"fixed",zIndex:(e.vars||e).zIndex.appBar,top:0,left:"auto",right:0,"@media print":{position:"absolute"}}},{props:{position:"absolute"},style:{position:"absolute",zIndex:(e.vars||e).zIndex.appBar,top:0,left:"auto",right:0}},{props:{position:"sticky"},style:{position:"sticky",zIndex:(e.vars||e).zIndex.appBar,top:0,left:"auto",right:0}},{props:{position:"static"},style:{position:"static"}},{props:{position:"relative"},style:{position:"relative"}},{props:{color:"inherit"},style:{"--AppBar-color":"inherit"}},{props:{color:"default"},style:{"--AppBar-background":e.vars?e.vars.palette.AppBar.defaultBg:e.palette.grey[100],"--AppBar-color":e.vars?e.vars.palette.text.primary:e.palette.getContrastText(e.palette.grey[100]),...e.applyStyles("dark",{"--AppBar-background":e.vars?e.vars.palette.AppBar.defaultBg:e.palette.grey[900],"--AppBar-color":e.vars?e.vars.palette.text.primary:e.palette.getContrastText(e.palette.grey[900])})}},...Object.entries(e.palette).filter(nt(["contrastText"])).map(([t])=>({props:{color:t},style:{"--AppBar-background":(e.vars??e).palette[t].main,"--AppBar-color":(e.vars??e).palette[t].contrastText}})),{props:t=>t.enableColorOnDark===!0&&!["inherit","transparent"].includes(t.color),style:{backgroundColor:"var(--AppBar-background)",color:"var(--AppBar-color)"}},{props:t=>t.enableColorOnDark===!1&&!["inherit","transparent"].includes(t.color),style:{backgroundColor:"var(--AppBar-background)",color:"var(--AppBar-color)",...e.applyStyles("dark",{backgroundColor:e.vars?bt(e.vars.palette.AppBar.darkBg,"var(--AppBar-background)"):null,color:e.vars?bt(e.vars.palette.AppBar.darkColor,"var(--AppBar-color)"):null})}},{props:{color:"transparent"},style:{"--AppBar-background":"transparent","--AppBar-color":"inherit",backgroundColor:"var(--AppBar-background)",color:"var(--AppBar-color)",...e.applyStyles("dark",{backgroundImage:"none"})}}]}))),vs=p.forwardRef(function(t,n){const r=Se({props:t,name:"MuiAppBar"}),{className:o,color:a="primary",enableColorOnDark:s=!1,position:c="fixed",...u}=r,l={...r,color:a,position:c,enableColorOnDark:s},d=_r(l);return i.jsx(Tr,{square:!0,component:"header",ownerState:l,elevation:4,className:se(d.root,o,c==="fixed"&&"mui-fixed"),ref:n,...u})});function Ar(e){const{badgeContent:t,invisible:n=!1,max:r=99,showZero:o=!1}=e,a=qt({badgeContent:t,max:r});let s=n;n===!1&&t===0&&!o&&(s=!0);const{badgeContent:c,max:u=r}=s?a:e,l=c&&Number(c)>u?`${u}+`:c;return{badgeContent:c,invisible:s,max:u,displayValue:l}}function Dr(e){return Ce("MuiBadge",e)}const z=xe("MuiBadge",["root","badge","dot","standard","anchorOriginTopRight","anchorOriginBottomRight","anchorOriginTopLeft","anchorOriginBottomLeft","invisible","colorError","colorInfo","colorPrimary","colorSecondary","colorSuccess","colorWarning","overlapRectangular","overlapCircular","anchorOriginTopLeftCircular","anchorOriginTopLeftRectangular","anchorOriginTopRightCircular","anchorOriginTopRightRectangular","anchorOriginBottomLeftCircular","anchorOriginBottomLeftRectangular","anchorOriginBottomRightCircular","anchorOriginBottomRightRectangular"]),Re=10,Ne=4,jr=e=>{const{color:t,anchorOrigin:n,invisible:r,overlap:o,variant:a,classes:s={}}=e,c={root:["root"],badge:["badge",a,r&&"invisible",`anchorOrigin${C(n.vertical)}${C(n.horizontal)}`,`anchorOrigin${C(n.vertical)}${C(n.horizontal)}${C(o)}`,`overlap${C(o)}`,t!=="default"&&`color${C(t)}`]};return ke(c,Dr,s)},Or=H("span",{name:"MuiBadge",slot:"Root",overridesResolver:(e,t)=>t.root})({position:"relative",display:"inline-flex",verticalAlign:"middle",flexShrink:0}),Mr=H("span",{name:"MuiBadge",slot:"Badge",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.badge,t[n.variant],t[`anchorOrigin${C(n.anchorOrigin.vertical)}${C(n.anchorOrigin.horizontal)}${C(n.overlap)}`],n.color!=="default"&&t[`color${C(n.color)}`],n.invisible&&t.invisible]}})(Q(({theme:e})=>({display:"flex",flexDirection:"row",flexWrap:"wrap",justifyContent:"center",alignContent:"center",alignItems:"center",position:"absolute",boxSizing:"border-box",fontFamily:e.typography.fontFamily,fontWeight:e.typography.fontWeightMedium,fontSize:e.typography.pxToRem(12),minWidth:Re*2,lineHeight:1,padding:"0 6px",height:Re*2,borderRadius:Re,zIndex:1,transition:e.transitions.create("transform",{easing:e.transitions.easing.easeInOut,duration:e.transitions.duration.enteringScreen}),variants:[...Object.entries(e.palette).filter(nt(["contrastText"])).map(([t])=>({props:{color:t},style:{backgroundColor:(e.vars||e).palette[t].main,color:(e.vars||e).palette[t].contrastText}})),{props:{variant:"dot"},style:{borderRadius:Ne,height:Ne*2,minWidth:Ne*2,padding:0}},{props:({ownerState:t})=>t.anchorOrigin.vertical==="top"&&t.anchorOrigin.horizontal==="right"&&t.overlap==="rectangular",style:{top:0,right:0,transform:"scale(1) translate(50%, -50%)",transformOrigin:"100% 0%",[`&.${z.invisible}`]:{transform:"scale(0) translate(50%, -50%)"}}},{props:({ownerState:t})=>t.anchorOrigin.vertical==="bottom"&&t.anchorOrigin.horizontal==="right"&&t.overlap==="rectangular",style:{bottom:0,right:0,transform:"scale(1) translate(50%, 50%)",transformOrigin:"100% 100%",[`&.${z.invisible}`]:{transform:"scale(0) translate(50%, 50%)"}}},{props:({ownerState:t})=>t.anchorOrigin.vertical==="top"&&t.anchorOrigin.horizontal==="left"&&t.overlap==="rectangular",style:{top:0,left:0,transform:"scale(1) translate(-50%, -50%)",transformOrigin:"0% 0%",[`&.${z.invisible}`]:{transform:"scale(0) translate(-50%, -50%)"}}},{props:({ownerState:t})=>t.anchorOrigin.vertical==="bottom"&&t.anchorOrigin.horizontal==="left"&&t.overlap==="rectangular",style:{bottom:0,left:0,transform:"scale(1) translate(-50%, 50%)",transformOrigin:"0% 100%",[`&.${z.invisible}`]:{transform:"scale(0) translate(-50%, 50%)"}}},{props:({ownerState:t})=>t.anchorOrigin.vertical==="top"&&t.anchorOrigin.horizontal==="right"&&t.overlap==="circular",style:{top:"14%",right:"14%",transform:"scale(1) translate(50%, -50%)",transformOrigin:"100% 0%",[`&.${z.invisible}`]:{transform:"scale(0) translate(50%, -50%)"}}},{props:({ownerState:t})=>t.anchorOrigin.vertical==="bottom"&&t.anchorOrigin.horizontal==="right"&&t.overlap==="circular",style:{bottom:"14%",right:"14%",transform:"scale(1) translate(50%, 50%)",transformOrigin:"100% 100%",[`&.${z.invisible}`]:{transform:"scale(0) translate(50%, 50%)"}}},{props:({ownerState:t})=>t.anchorOrigin.vertical==="top"&&t.anchorOrigin.horizontal==="left"&&t.overlap==="circular",style:{top:"14%",left:"14%",transform:"scale(1) translate(-50%, -50%)",transformOrigin:"0% 0%",[`&.${z.invisible}`]:{transform:"scale(0) translate(-50%, -50%)"}}},{props:({ownerState:t})=>t.anchorOrigin.vertical==="bottom"&&t.anchorOrigin.horizontal==="left"&&t.overlap==="circular",style:{bottom:"14%",left:"14%",transform:"scale(1) translate(-50%, 50%)",transformOrigin:"0% 100%",[`&.${z.invisible}`]:{transform:"scale(0) translate(-50%, 50%)"}}},{props:{invisible:!0},style:{transition:e.transitions.create("transform",{easing:e.transitions.easing.easeInOut,duration:e.transitions.duration.leavingScreen})}}]})));function wt(e){return{vertical:(e==null?void 0:e.vertical)??"top",horizontal:(e==null?void 0:e.horizontal)??"right"}}const Br=p.forwardRef(function(t,n){const r=Se({props:t,name:"MuiBadge"}),{anchorOrigin:o,className:a,classes:s,component:c,components:u={},componentsProps:l={},children:d,overlap:f="rectangular",color:v="default",invisible:b=!1,max:g=99,badgeContent:h,slots:w,slotProps:S,showZero:_=!1,variant:G="standard",...B}=r,{badgeContent:O,invisible:A,max:R,displayValue:V}=Ar({max:g,invisible:b,badgeContent:h,showZero:_}),pe=qt({anchorOrigin:wt(o),color:v,overlap:f,variant:G,badgeContent:h}),oe=A||O==null&&G!=="dot",{color:Ae=v,overlap:De=f,anchorOrigin:je,variant:Y=G}=oe?pe:r,he=wt(je),ie=Y!=="dot"?V:void 0,ae={...r,badgeContent:O,invisible:oe,max:R,displayValue:ie,showZero:_,anchorOrigin:he,color:Ae,overlap:De,variant:Y},fe=jr(ae),ge=(w==null?void 0:w.root)??u.Root??Or,me=(w==null?void 0:w.badge)??u.Badge??Mr,m=(S==null?void 0:S.root)??l.root,k=(S==null?void 0:S.badge)??l.badge,M=gt({elementType:ge,externalSlotProps:m,externalForwardedProps:B,additionalProps:{ref:n,as:c},ownerState:ae,className:se(m==null?void 0:m.className,fe.root,a)}),x=gt({elementType:me,externalSlotProps:k,ownerState:ae,className:se(fe.badge,k==null?void 0:k.className)});return i.jsxs(ge,{...M,children:[d,i.jsx(me,{...x,children:ie})]})});function yt(e){return e.substring(2).toLowerCase()}function Rr(e,t){return t.documentElement.clientWidth<e.clientX||t.documentElement.clientHeight<e.clientY}function Nr(e){const{children:t,disableReactTree:n=!1,mouseEvent:r="onClick",onClickAway:o,touchEvent:a="onTouchEnd"}=e,s=p.useRef(!1),c=p.useRef(null),u=p.useRef(!1),l=p.useRef(!1);p.useEffect(()=>(setTimeout(()=>{u.current=!0},0),()=>{u.current=!1}),[]);const d=Dn(jn(t),c),f=On(g=>{const h=l.current;l.current=!1;const w=Oe(c.current);if(!u.current||!c.current||"clientX"in g&&Rr(g,w))return;if(s.current){s.current=!1;return}let S;g.composedPath?S=g.composedPath().includes(c.current):S=!w.documentElement.contains(g.target)||c.current.contains(g.target),!S&&(n||!h)&&o(g)}),v=g=>h=>{l.current=!0;const w=t.props[g];w&&w(h)},b={ref:d};return a!==!1&&(b[a]=v(a)),p.useEffect(()=>{if(a!==!1){const g=yt(a),h=Oe(c.current),w=()=>{s.current=!0};return h.addEventListener(g,f),h.addEventListener("touchmove",w),()=>{h.removeEventListener(g,f),h.removeEventListener("touchmove",w)}}},[f,a]),r!==!1&&(b[r]=v(r)),p.useEffect(()=>{if(r!==!1){const g=yt(r),h=Oe(c.current);return h.addEventListener(g,f),()=>{h.removeEventListener(g,f)}}},[f,r]),p.cloneElement(t,b)}function $r(e){return Ce("MuiSwitch",e)}const D=xe("MuiSwitch",["root","edgeStart","edgeEnd","switchBase","colorPrimary","colorSecondary","sizeSmall","sizeMedium","checked","disabled","input","thumb","track"]),Pr=e=>{const{classes:t,edge:n,size:r,color:o,checked:a,disabled:s}=e,c={root:["root",n&&`edge${C(n)}`,`size${C(r)}`],switchBase:["switchBase",`color${C(o)}`,a&&"checked",s&&"disabled"],thumb:["thumb"],track:["track"],input:["input"]},u=ke(c,$r,t);return{...t,...u}},Lr=H("span",{name:"MuiSwitch",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,n.edge&&t[`edge${C(n.edge)}`],t[`size${C(n.size)}`]]}})({display:"inline-flex",width:34+12*2,height:14+12*2,overflow:"hidden",padding:12,boxSizing:"border-box",position:"relative",flexShrink:0,zIndex:0,verticalAlign:"middle","@media print":{colorAdjust:"exact"},variants:[{props:{edge:"start"},style:{marginLeft:-8}},{props:{edge:"end"},style:{marginRight:-8}},{props:{size:"small"},style:{width:40,height:24,padding:7,[`& .${D.thumb}`]:{width:16,height:16},[`& .${D.switchBase}`]:{padding:4,[`&.${D.checked}`]:{transform:"translateX(16px)"}}}}]}),Hr=H(Mn,{name:"MuiSwitch",slot:"SwitchBase",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.switchBase,{[`& .${D.input}`]:t.input},n.color!=="default"&&t[`color${C(n.color)}`]]}})(Q(({theme:e})=>({position:"absolute",top:0,left:0,zIndex:1,color:e.vars?e.vars.palette.Switch.defaultColor:`${e.palette.mode==="light"?e.palette.common.white:e.palette.grey[300]}`,transition:e.transitions.create(["left","transform"],{duration:e.transitions.duration.shortest}),[`&.${D.checked}`]:{transform:"translateX(20px)"},[`&.${D.disabled}`]:{color:e.vars?e.vars.palette.Switch.defaultDisabledColor:`${e.palette.mode==="light"?e.palette.grey[100]:e.palette.grey[600]}`},[`&.${D.checked} + .${D.track}`]:{opacity:.5},[`&.${D.disabled} + .${D.track}`]:{opacity:e.vars?e.vars.opacity.switchTrackDisabled:`${e.palette.mode==="light"?.12:.2}`},[`& .${D.input}`]:{left:"-100%",width:"300%"}})),Q(({theme:e})=>({"&:hover":{backgroundColor:e.vars?`rgba(${e.vars.palette.action.activeChannel} / ${e.vars.palette.action.hoverOpacity})`:mt(e.palette.action.active,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},variants:[...Object.entries(e.palette).filter(nt(["light"])).map(([t])=>({props:{color:t},style:{[`&.${D.checked}`]:{color:(e.vars||e).palette[t].main,"&:hover":{backgroundColor:e.vars?`rgba(${e.vars.palette[t].mainChannel} / ${e.vars.palette.action.hoverOpacity})`:mt(e.palette[t].main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},[`&.${D.disabled}`]:{color:e.vars?e.vars.palette.Switch[`${t}DisabledColor`]:`${e.palette.mode==="light"?Bn(e.palette[t].main,.62):Rn(e.palette[t].main,.55)}`}},[`&.${D.checked} + .${D.track}`]:{backgroundColor:(e.vars||e).palette[t].main}}}))]}))),Vr=H("span",{name:"MuiSwitch",slot:"Track",overridesResolver:(e,t)=>t.track})(Q(({theme:e})=>({height:"100%",width:"100%",borderRadius:14/2,zIndex:-1,transition:e.transitions.create(["opacity","background-color"],{duration:e.transitions.duration.shortest}),backgroundColor:e.vars?e.vars.palette.common.onBackground:`${e.palette.mode==="light"?e.palette.common.black:e.palette.common.white}`,opacity:e.vars?e.vars.opacity.switchTrack:`${e.palette.mode==="light"?.38:.3}`}))),Fr=H("span",{name:"MuiSwitch",slot:"Thumb",overridesResolver:(e,t)=>t.thumb})(Q(({theme:e})=>({boxShadow:(e.vars||e).shadows[1],backgroundColor:"currentColor",width:20,height:20,borderRadius:"50%"}))),zr=p.forwardRef(function(t,n){const r=Se({props:t,name:"MuiSwitch"}),{className:o,color:a="primary",edge:s=!1,size:c="medium",sx:u,...l}=r,d={...r,color:a,edge:s,size:c},f=Pr(d),v=i.jsx(Fr,{className:f.thumb,ownerState:d});return i.jsxs(Lr,{className:se(f.root,o),sx:u,ownerState:d,children:[i.jsx(Hr,{type:"checkbox",icon:v,checkedIcon:v,ref:n,ownerState:d,...l,classes:{...f,root:f.switchBase}}),i.jsx(Vr,{className:f.track,ownerState:d})]})});function Ur(e){return Ce("MuiToolbar",e)}xe("MuiToolbar",["root","gutters","regular","dense"]);const Wr=e=>{const{classes:t,disableGutters:n,variant:r}=e;return ke({root:["root",!n&&"gutters",r]},Ur,t)},Kr=H("div",{name:"MuiToolbar",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,!n.disableGutters&&t.gutters,t[n.variant]]}})(Q(({theme:e})=>({position:"relative",display:"flex",alignItems:"center",variants:[{props:({ownerState:t})=>!t.disableGutters,style:{paddingLeft:e.spacing(2),paddingRight:e.spacing(2),[e.breakpoints.up("sm")]:{paddingLeft:e.spacing(3),paddingRight:e.spacing(3)}}},{props:{variant:"dense"},style:{minHeight:48}},{props:{variant:"regular"},style:e.mixins.toolbar}]}))),Cs=p.forwardRef(function(t,n){const r=Se({props:t,name:"MuiToolbar"}),{className:o,component:a="div",disableGutters:s=!1,variant:c="regular",...u}=r,l={...r,component:a,disableGutters:s,variant:c},d=Wr(l);return i.jsx(Kr,{as:a,className:se(d.root,o),ref:n,ownerState:l,...u})}),qr=ue(i.jsx("path",{d:"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"}),"ArrowBack"),Gr=ue(i.jsx("path",{d:"M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1"}),"DarkModeOutlined"),Yr=ue(i.jsx("path",{d:"M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z"}),"Fullscreen"),Zr=ue(i.jsx("path",{d:"M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z"}),"FullscreenExit"),Jr=ue(i.jsx("path",{d:"M12 9c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3m0-2c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1m0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1M5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0z"}),"LightModeOutlined"),Xr=({...e})=>i.jsx(q,{...e,children:i.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:[i.jsx("mask",{id:"mask0_2799_6900",style:{maskType:"alpha"},maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"24",height:"24",children:i.jsx("rect",{width:"24",height:"24",fill:"#D9D9D9"})}),i.jsx("g",{mask:"url(#mask0_2799_6900)",children:i.jsx("path",{d:"M4 19V17H6V10C6 8.61667 6.41667 7.3875 7.25 6.3125C8.08333 5.2375 9.16667 4.53333 10.5 4.2V2H13.5V4.2C14.8333 4.53333 15.9167 5.2375 16.75 6.3125C17.5833 7.3875 18 8.61667 18 10V17H20V19H4ZM12 22C11.45 22 10.9792 21.8042 10.5875 21.4125C10.1958 21.0208 10 20.55 10 20H14C14 20.55 13.8042 21.0208 13.4125 21.4125C13.0208 21.8042 12.55 22 12 22ZM8 17H16V10C16 8.9 15.6083 7.95833 14.825 7.175C14.0417 6.39167 13.1 6 12 6C10.9 6 9.95833 6.39167 9.175 7.175C8.39167 7.95833 8 8.9 8 10V17Z",fill:"currentColor"})})]})}),$e=({isCanceled:e,...t})=>i.jsx(q,{...t,children:i.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:[e&&i.jsx("rect",{x:"2.21313",y:"2",width:"28.0306",height:"1.72918",transform:"rotate(44.5535 2.21313 2)",fill:"currentColor"}),i.jsx("mask",{id:"mask0_2799_6804",style:{maskType:"alpha"},maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"24",height:"24",children:i.jsx("rect",{width:"24",height:"24",fill:"#D9D9D9"})}),i.jsx("g",{mask:"url(#mask0_2799_6804)",children:i.jsx("path",{d:"M12 17C12.2833 17 12.5208 16.9042 12.7125 16.7125C12.9042 16.5208 13 16.2833 13 16C13 15.7167 12.9042 15.4792 12.7125 15.2875C12.5208 15.0958 12.2833 15 12 15C11.7167 15 11.4792 15.0958 11.2875 15.2875C11.0958 15.4792 11 15.7167 11 16C11 16.2833 11.0958 16.5208 11.2875 16.7125C11.4792 16.9042 11.7167 17 12 17ZM12 13C12.2833 13 12.5208 12.9042 12.7125 12.7125C12.9042 12.5208 13 12.2833 13 12C13 11.7167 12.9042 11.4792 12.7125 11.2875C12.5208 11.0958 12.2833 11 12 11C11.7167 11 11.4792 11.0958 11.2875 11.2875C11.0958 11.4792 11 11.7167 11 12C11 12.2833 11.0958 12.5208 11.2875 12.7125C11.4792 12.9042 11.7167 13 12 13ZM12 9C12.2833 9 12.5208 8.90417 12.7125 8.7125C12.9042 8.52083 13 8.28333 13 8C13 7.71667 12.9042 7.47917 12.7125 7.2875C12.5208 7.09583 12.2833 7 12 7C11.7167 7 11.4792 7.09583 11.2875 7.2875C11.0958 7.47917 11 7.71667 11 8C11 8.28333 11.0958 8.52083 11.2875 8.7125C11.4792 8.90417 11.7167 9 12 9ZM2 20V14C2.55 14 3.02083 13.8042 3.4125 13.4125C3.80417 13.0208 4 12.55 4 12C4 11.45 3.80417 10.9792 3.4125 10.5875C3.02083 10.1958 2.55 10 2 10V4H22V10C21.45 10 20.9792 10.1958 20.5875 10.5875C20.1958 10.9792 20 11.45 20 12C20 12.55 20.1958 13.0208 20.5875 13.4125C20.9792 13.8042 21.45 14 22 14V20H2ZM4 18H20V15.45C19.3833 15.0833 18.8958 14.5958 18.5375 13.9875C18.1792 13.3792 18 12.7167 18 12C18 11.2833 18.1792 10.6208 18.5375 10.0125C18.8958 9.40417 19.3833 8.91667 20 8.55V6H4V8.55C4.61667 8.91667 5.10417 9.40417 5.4625 10.0125C5.82083 10.6208 6 11.2833 6 12C6 12.7167 5.82083 13.3792 5.4625 13.9875C5.10417 14.5958 4.61667 15.0833 4 15.45V18Z",fill:"currentColor"})})]})}),vt=({...e})=>i.jsx(q,{...e,children:i.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:[i.jsx("mask",{id:"mask0_2799_6824",style:{maskType:"alpha"},maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"24",height:"24",children:i.jsx("rect",{width:"24",height:"24",fill:"#D9D9D9"})}),i.jsx("g",{mask:"url(#mask0_2799_6824)",children:i.jsx("path",{d:"M4 19H20V17H4V19ZM8 13H10V10C10 9.45 10.1958 8.97917 10.5875 8.5875C10.9792 8.19583 11.45 8 12 8V6C10.9 6 9.95833 6.39167 9.175 7.175C8.39167 7.95833 8 8.9 8 10V13ZM7 15H17V10C17 8.61667 16.5125 7.4375 15.5375 6.4625C14.5625 5.4875 13.3833 5 12 5C10.6167 5 9.4375 5.4875 8.4625 6.4625C7.4875 7.4375 7 8.61667 7 10V15ZM2 21V15H5V10C5 8.05 5.67917 6.39583 7.0375 5.0375C8.39583 3.67917 10.05 3 12 3C13.95 3 15.6042 3.67917 16.9625 5.0375C18.3208 6.39583 19 8.05 19 10V15H22V21H2Z",fill:"currentColor"})})]})}),Qr=({...e})=>i.jsx(q,{...e,children:i.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:[i.jsx("mask",{id:"mask0_2799_6901",style:{maskType:"alpha"},maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"24",height:"24",children:i.jsx("rect",{width:"24",height:"24",fill:"#D9D9D9"})}),i.jsx("g",{mask:"url(#mask0_2799_6901)",children:i.jsx("path",{d:"M19.775 22.625L8.125 10.975C8.09167 11.1417 8.0625 11.3083 8.0375 11.475C8.0125 11.6417 8 11.8167 8 12C8 12.55 8.10417 13.0667 8.3125 13.55C8.52083 14.0333 8.80833 14.4583 9.175 14.825L7.75 16.25C7.21667 15.7 6.79167 15.0625 6.475 14.3375C6.15833 13.6125 6 12.8333 6 12C6 11.5333 6.05 11.0833 6.15 10.65C6.25 10.2167 6.39167 9.80832 6.575 9.42499L5.1 7.94999C4.75 8.54999 4.47917 9.18749 4.2875 9.86249C4.09583 10.5375 4 11.25 4 12C4 13.1167 4.20833 14.1583 4.625 15.125C5.04167 16.0917 5.61667 16.9333 6.35 17.65L4.925 19.075C4.025 18.1583 3.3125 17.0958 2.7875 15.8875C2.2625 14.6792 2 13.3833 2 12C2 10.9667 2.14583 9.99165 2.4375 9.07499C2.72917 8.15832 3.13333 7.29999 3.65 6.49999L1.375 4.22499L2.8 2.79999L21.2 21.2L19.775 22.625ZM20.35 17.5L18.9 16.05C19.25 15.45 19.5208 14.8125 19.7125 14.1375C19.9042 13.4625 20 12.75 20 12C20 10.8833 19.7917 9.84165 19.375 8.87499C18.9583 7.90832 18.3833 7.06665 17.65 6.34999L19.075 4.92499C19.975 5.82499 20.6875 6.87915 21.2125 8.08749C21.7375 9.29582 22 10.6 22 12C22 13.0167 21.8542 13.9875 21.5625 14.9125C21.2708 15.8375 20.8667 16.7 20.35 17.5ZM17.425 14.575L15.875 13.025C15.9083 12.8583 15.9375 12.6917 15.9625 12.525C15.9875 12.3583 16 12.1833 16 12C16 11.45 15.8958 10.9333 15.6875 10.45C15.4792 9.96665 15.1917 9.54165 14.825 9.17499L16.25 7.74999C16.7833 8.28332 17.2083 8.91249 17.525 9.63749C17.8417 10.3625 18 11.15 18 12C18 12.4667 17.95 12.9167 17.85 13.35C17.75 13.7833 17.6083 14.1917 17.425 14.575Z",fill:"currentColor"})})]})}),eo=({...e})=>i.jsx(q,{...e,children:i.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:[i.jsx("mask",{id:"mask0_6109_70900",style:{maskType:"alpha"},maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"24",height:"24",children:i.jsx("rect",{width:"24",height:"24",fill:"#D9D9D9"})}),i.jsx("g",{mask:"url(#mask0_6109_70900)",children:i.jsx("path",{d:"M4 21C3.45 21 2.97917 20.8042 2.5875 20.4125C2.19583 20.0208 2 19.55 2 19V8C2 7.45 2.19583 6.97917 2.5875 6.5875C2.97917 6.19583 3.45 6 4 6H8V4C8 3.45 8.19583 2.97917 8.5875 2.5875C8.97917 2.19583 9.45 2 10 2H14C14.55 2 15.0208 2.19583 15.4125 2.5875C15.8042 2.97917 16 3.45 16 4V6H20C20.55 6 21.0208 6.19583 21.4125 6.5875C21.8042 6.97917 22 7.45 22 8V19C22 19.55 21.8042 20.0208 21.4125 20.4125C21.0208 20.8042 20.55 21 20 21H4ZM10 6H14V4H10V6ZM20 15H15V17H9V15H4V19H20V15ZM11 15H13V13H11V15ZM4 13H9V11H15V13H20V8H4V13Z",fill:"currentColor"})})]})}),to=({...e})=>i.jsx(q,{...e,children:i.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:[i.jsx("mask",{id:"mask0_2799_6755",style:{maskType:"alpha"},maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"24",height:"24",children:i.jsx("rect",{width:"24",height:"24",fill:"#D9D9D9"})}),i.jsx("g",{mask:"url(#mask0_2799_6755)",children:i.jsx("path",{d:"M5 17.85C5.9 16.9667 6.94583 16.2708 8.1375 15.7625C9.32917 15.2542 10.6167 15 12 15C13.3833 15 14.6708 15.2542 15.8625 15.7625C17.0542 16.2708 18.1 16.9667 19 17.85V5H5V17.85ZM12 13C12.9667 13 13.7917 12.6583 14.475 11.975C15.1583 11.2917 15.5 10.4667 15.5 9.5C15.5 8.53333 15.1583 7.70833 14.475 7.025C13.7917 6.34167 12.9667 6 12 6C11.0333 6 10.2083 6.34167 9.525 7.025C8.84167 7.70833 8.5 8.53333 8.5 9.5C8.5 10.4667 8.84167 11.2917 9.525 11.975C10.2083 12.6583 11.0333 13 12 13ZM3 21V3H21V21H3ZM12 11C11.5833 11 11.2292 10.8542 10.9375 10.5625C10.6458 10.2708 10.5 9.91667 10.5 9.5C10.5 9.08333 10.6458 8.72917 10.9375 8.4375C11.2292 8.14583 11.5833 8 12 8C12.4167 8 12.7708 8.14583 13.0625 8.4375C13.3542 8.72917 13.5 9.08333 13.5 9.5C13.5 9.91667 13.3542 10.2708 13.0625 10.5625C12.7708 10.8542 12.4167 11 12 11ZM6.725 19H17.275C16.5417 18.35 15.7125 17.8542 14.7875 17.5125C13.8625 17.1708 12.9333 17 12 17C11.0667 17 10.1292 17.1708 9.1875 17.5125C8.24583 17.8542 7.425 18.35 6.725 19Z",fill:"currentColor"})})]})}),no=({...e})=>i.jsx(q,{...e,children:i.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:[i.jsx("mask",{id:"mask0_2799_6762",style:{maskType:"alpha"},maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"24",height:"24",children:i.jsx("rect",{width:"24",height:"24",fill:"#D9D9D9"})}),i.jsx("g",{mask:"url(#mask0_2799_6762)",children:i.jsx("path",{d:"M19.95 21C17.8667 21 15.8042 20.55 13.7625 19.65C11.7208 18.75 9.86667 17.4667 8.2 15.8C6.53333 14.1333 5.25 12.2833 4.35 10.25C3.45 8.21667 3 6.15 3 4.05V3H8.9L9.825 8.025L6.975 10.9C7.34167 11.55 7.75 12.1667 8.2 12.75C8.65 13.3333 9.13333 13.875 9.65 14.375C10.1333 14.8583 10.6625 15.3208 11.2375 15.7625C11.8125 16.2042 12.4333 16.6167 13.1 17L16 14.1L21 15.125V21H19.95ZM6.025 9L7.675 7.35L7.25 5H5.025C5.10833 5.75 5.23333 6.45417 5.4 7.1125C5.56667 7.77083 5.775 8.4 6.025 9ZM14.975 17.95C15.6417 18.2333 16.3125 18.4583 16.9875 18.625C17.6625 18.7917 18.3333 18.9 19 18.95V16.75L16.65 16.275L14.975 17.95Z",fill:"currentColor"})})]})}),ro=({...e})=>i.jsx(q,{...e,children:i.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:[i.jsx("mask",{id:"mask0_2799_7012",style:{maskType:"alpha"},maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"24",height:"24",children:i.jsx("rect",{width:"24",height:"24",fill:"#D9D9D9"})}),i.jsx("g",{mask:"url(#mask0_2799_7012)",children:i.jsx("path",{d:"M2 20V4H22V20H2ZM12 13L4 8V18H20V8L12 13ZM12 11L20 6H4L12 11ZM4 8V6V18V8Z",fill:"currentColor"})})]})}),oo=H(e=>i.jsx(zr,{focusVisibleClassName:".Mui-focusVisible",disableRipple:!0,...e,checkedIcon:i.jsx(Gr,{sx:{width:24,height:24,color:"text.primary"}}),icon:i.jsx(Jr,{sx:{width:24,height:24,color:"text.primary"}})}))(({theme:e})=>({width:80,height:40,padding:0,"& .MuiSwitch-switchBase":{padding:0,width:40,height:40,transitionDuration:"300ms","&.Mui-checked":{transform:"translateX(40px)",color:"#fff","& + .MuiSwitch-track":{opacity:1,border:`1px solid ${e.palette.custom.outlineBoder}`,backgroundColor:e.palette.background.default},"&.Mui-disabled + .MuiSwitch-track":{opacity:.5}}},"& .MuiSwitch-track":{borderRadius:40/2,backgroundColor:e.palette.background.default,border:`1px solid ${e.palette.custom.outlineBoder}`,opacity:1,transition:e.transitions.create(["background-color"],{duration:500})}})),xs=()=>{const e=rt(),{mode:t}=ot(r=>r.themeStore),n=()=>{e(Nn({mode:t==="dark"?"light":"dark"}))};return i.jsx(i.Fragment,{children:i.jsx(oo,{checked:t==="dark",onChange:n,inputProps:{"aria-label":"toggle_theme_switch",id:"theme_toogle"}})})},Ss=()=>{const[e,t]=p.useState(!1),n=rt(),r=()=>{e?document.exitFullscreen&&document.exitFullscreen():document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()},o=()=>{const s=document.fullscreenElement!==null;t(s),n($n({isFullScreen:s}))},a=s=>{s.key==="F11"?(s.preventDefault(),r()):s.key==="Escape"&&e&&r()};return p.useEffect(()=>(document.addEventListener("fullscreenchange",o),()=>{document.removeEventListener("fullscreenchange",o)}),[]),p.useEffect(()=>(window.addEventListener("keydown",a),()=>{window.removeEventListener("keydown",a)}),[e]),i.jsxs(zt,{onClick:r,size:"small",children:[!e&&i.jsx(Yr,{sx:{fontSize:{md:28,xs:24},color:"text.primary"}}),e&&i.jsx(Zr,{sx:{fontSize:{md:28,xs:24},color:"text.primary"}})]})},io=p.forwardRef(({children:e,type:t="grow",position:n="top-left",...r},o)=>{let a={transformOrigin:"0 0 0"};switch(n){case"top-right":case"top":case"bottom-left":case"bottom-right":case"bottom":case"top-left":default:a={transformOrigin:"0 0 0"};break}return i.jsxs(j,{ref:o,children:[t==="grow"&&i.jsx(Pn,{...r,children:i.jsx(j,{sx:a,children:e})}),t==="fade"&&i.jsx(Ln,{...r,timeout:{appear:0,enter:300,exit:150},children:i.jsx(j,{sx:a,children:e})})]})}),ks=()=>{const e=Hn(),t=rt(),n=ot(_=>_.authStore.user),[r]=Vn(),[o,a]=p.useState(n&&n.foto!==void 0?`${Fn}/${encodeURIComponent(n.foto)}`:void 0),s=()=>{a(Zn)},c=()=>{r(),t(Jn(void 0)),t(Xn(!1)),t(Qn()),t(er()),t(tr()),t(nr()),t(rr()),t(or.util.resetApiState()),t(ir.util.resetApiState()),t(ar.util.resetApiState()),t(sr.util.resetApiState()),t(cr.util.resetApiState()),t(lr.util.resetApiState()),t(dr.util.resetApiState()),t(ur.util.resetApiState()),t(pr.util.resetApiState()),e("/auth/login")},u=zn(),l=p.useRef(null),[d,f]=p.useState(!1),[v,b]=p.useState(!1),g=()=>{f(_=>!_)},h=_=>{l.current&&l.current.contains(_.target)||f(!1)},w=()=>{b(!0)},S=()=>{b(!1)};return i.jsxs(i.Fragment,{children:[i.jsx(E,{direction:"row",spacing:2,alignItems:"center",sx:{p:.5},children:i.jsx(Un,{sx:{borderColor:d?u.palette.primary.main:"transparent",borderWidth:3,borderStyle:"solid",borderRadius:"50%","&:hover":{borderColor:u.palette.primary.main}},"aria-label":"open profile",ref:l,"aria-controls":d?"profile-grow":void 0,"aria-haspopup":"true",onClick:g,children:i.jsx(E,{justifyContent:"center",alignItems:"center",children:i.jsx(Me,{alt:"profile user",src:o,slotProps:{img:{onError:s}},sx:{width:38,height:38}})})})}),i.jsx(Wn,{placement:"bottom-end",open:d,anchorEl:l.current,role:void 0,transition:!0,disablePortal:!0,popperOptions:{modifiers:[{name:"offset",options:{offset:[0,11.4]}}]},children:({TransitionProps:_})=>i.jsx(io,{type:"fade",in:d,..._,children:d&&i.jsx(Ft,{sx:{minWidth:240,maxWidth:400,[u.breakpoints.down("md")]:{maxWidth:250},backgroundColor:"transparent",backgroundImage:"inherit",border:"none",boxShadow:"none"},children:i.jsx(Nr,{onClickAway:h,children:i.jsx(Wt,{sx:{boxShadow:"0px 4px 18px 0px rgba(42, 55, 60, 0.16)",":hover":{boxShadow:"0px 4px 18px 0px rgba(42, 55, 60, 0.16)"}},children:i.jsx(kr,{children:i.jsxs(Be,{container:!0,justifyContent:"space-between",alignItems:"center",rowSpacing:2,children:[i.jsx(Be,{size:12,sx:{borderRadius:3,":hover":{backgroundColor:"tertiary.opacityLight"},padding:1,cursor:"pointer"},onClick:w,children:i.jsxs(E,{direction:"row",spacing:1.25,alignItems:"center",children:[i.jsx(Me,{alt:"profile user",src:o,slotProps:{img:{onError:s}},sx:{width:52,height:52}}),i.jsx(E,{sx:{width:"100%",overflow:"hidden"},children:n&&i.jsxs(i.Fragment,{children:[i.jsx(I,{variant:"body2",color:"textSecondary",sx:{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"},children:n.rol}),i.jsx(I,{variant:"h6",color:"textPrimary",sx:{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"},children:`${n.nombre}  ${n.apellido}`})]})})]})}),i.jsx(Be,{size:12,children:i.jsx(Ge,{variant:"label",fullWidth:!0,color:"tertiary",size:"medium",startIcon:i.jsx(qr,{}),onClick:c,children:"Cerrar sesión"})})]})})})})})})}),i.jsxs(Kn,{open:v,onClose:S,maxWidth:"sm",fullWidth:!0,sx:{"& .MuiDialog-paper":{backgroundColor:"background.paper",borderRadius:6,borderWidth:1,borderStyle:"solid",borderColor:"custom.outlineBoder",boxShadow:"0px 3px 12px 0px rgba(42, 55, 60, 0.14)"}},children:[i.jsx(qn,{children:i.jsx(I,{variant:"h5",children:"Datos de la cuenta"})}),i.jsx(Gn,{children:i.jsx(E,{spacing:2,children:i.jsxs(E,{direction:"row",spacing:2,children:[i.jsx(Me,{alt:"profile user",src:o,slotProps:{img:{onError:s}},sx:{width:84,height:84}}),i.jsxs(E,{sx:{width:"100%",overflow:"hidden"},children:[n&&i.jsxs(i.Fragment,{children:[i.jsx(I,{variant:"body1",color:"textSecondary",sx:{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"},children:n.rol}),i.jsx(I,{variant:"h5",color:"textPrimary",sx:{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"},children:`${n.nombre}  ${n.apellido}`}),i.jsx(I,{variant:"body1",color:"textSecondary",sx:{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"},children:`${n.cargo}`})]}),i.jsxs(E,{spacing:1,mt:2,children:[i.jsx(be,{icon:i.jsx(eo,{}),title:"Empresa:",value:`${n==null?void 0:n.contrata}`}),i.jsx(be,{icon:i.jsx(to,{}),title:"DNI:",value:`${n==null?void 0:n.dni}`}),i.jsx(be,{icon:i.jsx(no,{}),title:"Teléfono:",value:`${n==null?void 0:n.telefono}`}),i.jsx(be,{icon:i.jsx(ro,{}),title:"Email:",value:`${n==null?void 0:n.correo}`})]})]})]})})}),i.jsx(Ut,{}),i.jsx(Yn,{children:i.jsx(Ge,{variant:"text",color:"tertiary",size:"medium",onClick:S,children:"Volver"})})]})]})},be=({title:e,value:t,icon:n})=>i.jsx(i.Fragment,{children:i.jsxs(E,{direction:"row",spacing:1,alignItems:"center",children:[n,i.jsx(I,{variant:"subtitle1",color:"textPrimary",children:e}),i.jsx(I,{variant:"body1",color:"textSecondary",sx:{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"},children:t})]})});var we={exports:{}},ao=we.exports,Ct;function so(){return Ct||(Ct=1,function(e,t){(function(n,r){e.exports=r()})(ao,function(){return function(n,r,o){n=n||{};var a=r.prototype,s={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function c(l,d,f,v){return a.fromToBase(l,d,f,v)}o.en.relativeTime=s,a.fromToBase=function(l,d,f,v,b){for(var g,h,w,S=f.$locale().relativeTime||s,_=n.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],G=_.length,B=0;B<G;B+=1){var O=_[B];O.d&&(g=v?o(l).diff(f,O.d,!0):f.diff(l,O.d,!0));var A=(n.rounding||Math.round)(Math.abs(g));if(w=g>0,A<=O.r||!O.r){A<=1&&B>0&&(O=_[B-1]);var R=S[O.l];b&&(A=b(""+A)),h=typeof R=="string"?R.replace("%d",A):R(A,d,O.l,w);break}}if(d)return h;var V=w?S.future:S.past;return typeof V=="function"?V(h):V.replace("%s",h)},a.to=function(l,d){return c(l,d,this,!0)},a.from=function(l,d){return c(l,d,this)};var u=function(l){return l.$u?o.utc():o()};a.toNow=function(l){return this.to(u(this),l)},a.fromNow=function(l){return this.from(u(this),l)}}})}(we)),we.exports}var co=so();const lo=hr(co),uo=()=>{};var xt={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gt=function(e){const t=[];let n=0;for(let r=0;r<e.length;r++){let o=e.charCodeAt(r);o<128?t[n++]=o:o<2048?(t[n++]=o>>6|192,t[n++]=o&63|128):(o&64512)===55296&&r+1<e.length&&(e.charCodeAt(r+1)&64512)===56320?(o=65536+((o&1023)<<10)+(e.charCodeAt(++r)&1023),t[n++]=o>>18|240,t[n++]=o>>12&63|128,t[n++]=o>>6&63|128,t[n++]=o&63|128):(t[n++]=o>>12|224,t[n++]=o>>6&63|128,t[n++]=o&63|128)}return t},po=function(e){const t=[];let n=0,r=0;for(;n<e.length;){const o=e[n++];if(o<128)t[r++]=String.fromCharCode(o);else if(o>191&&o<224){const a=e[n++];t[r++]=String.fromCharCode((o&31)<<6|a&63)}else if(o>239&&o<365){const a=e[n++],s=e[n++],c=e[n++],u=((o&7)<<18|(a&63)<<12|(s&63)<<6|c&63)-65536;t[r++]=String.fromCharCode(55296+(u>>10)),t[r++]=String.fromCharCode(56320+(u&1023))}else{const a=e[n++],s=e[n++];t[r++]=String.fromCharCode((o&15)<<12|(a&63)<<6|s&63)}}return t.join("")},Yt={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let o=0;o<e.length;o+=3){const a=e[o],s=o+1<e.length,c=s?e[o+1]:0,u=o+2<e.length,l=u?e[o+2]:0,d=a>>2,f=(a&3)<<4|c>>4;let v=(c&15)<<2|l>>6,b=l&63;u||(b=64,s||(v=64)),r.push(n[d],n[f],n[v],n[b])}return r.join("")},encodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(e):this.encodeByteArray(Gt(e),t)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):po(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();const n=t?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let o=0;o<e.length;){const a=n[e.charAt(o++)],c=o<e.length?n[e.charAt(o)]:0;++o;const l=o<e.length?n[e.charAt(o)]:64;++o;const f=o<e.length?n[e.charAt(o)]:64;if(++o,a==null||c==null||l==null||f==null)throw new ho;const v=a<<2|c>>4;if(r.push(v),l!==64){const b=c<<4&240|l>>2;if(r.push(b),f!==64){const g=l<<6&192|f;r.push(g)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}};class ho extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const fo=function(e){const t=Gt(e);return Yt.encodeByteArray(t,!0)},Zt=function(e){return fo(e).replace(/\./g,"")},go=function(e){try{return Yt.decodeString(e,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mo(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bo=()=>mo().__FIREBASE_DEFAULTS__,wo=()=>{if(typeof process>"u"||typeof xt>"u")return;const e=xt.__FIREBASE_DEFAULTS__;if(e)return JSON.parse(e)},yo=()=>{if(typeof document>"u")return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const t=e&&go(e[1]);return t&&JSON.parse(t)},vo=()=>{try{return uo()||bo()||wo()||yo()}catch(e){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);return}},Jt=()=>{var e;return(e=vo())===null||e===void 0?void 0:e.config};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Co{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,n)=>{this.resolve=t,this.reject=n})}wrapCallback(t){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(n):t(n,r))}}}function Xt(){try{return typeof indexedDB=="object"}catch{return!1}}function Qt(){return new Promise((e,t)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",o=self.indexedDB.open(r);o.onsuccess=()=>{o.result.close(),n||self.indexedDB.deleteDatabase(r),e(!0)},o.onupgradeneeded=()=>{n=!1},o.onerror=()=>{var a;t(((a=o.error)===null||a===void 0?void 0:a.message)||"")}}catch(n){t(n)}})}function xo(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const So="FirebaseError";class re extends Error{constructor(t,n,r){super(n),this.code=t,this.customData=r,this.name=So,Object.setPrototypeOf(this,re.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ie.prototype.create)}}class Ie{constructor(t,n,r){this.service=t,this.serviceName=n,this.errors=r}create(t,...n){const r=n[0]||{},o=`${this.service}/${t}`,a=this.errors[t],s=a?ko(a,r):"Error",c=`${this.serviceName}: ${s} (${o}).`;return new re(o,c,r)}}function ko(e,t){return e.replace(Io,(n,r)=>{const o=t[r];return o!=null?String(o):`<${r}?>`})}const Io=/\{\$([^}]+)}/g;function Ye(e,t){if(e===t)return!0;const n=Object.keys(e),r=Object.keys(t);for(const o of n){if(!r.includes(o))return!1;const a=e[o],s=t[o];if(St(a)&&St(s)){if(!Ye(a,s))return!1}else if(a!==s)return!1}for(const o of r)if(!n.includes(o))return!1;return!0}function St(e){return e!==null&&typeof e=="object"}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function it(e){return e&&e._delegate?e._delegate:e}class K{constructor(t,n,r){this.name=t,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const J="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eo{constructor(t,n){this.name=t,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){const n=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(n)){const r=new Co;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const o=this.getOrInitializeService({instanceIdentifier:n});o&&r.resolve(o)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(t){var n;const r=this.normalizeInstanceIdentifier(t==null?void 0:t.identifier),o=(n=t==null?void 0:t.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(a){if(o)return null;throw a}else{if(o)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(To(t))try{this.getOrInitializeService({instanceIdentifier:J})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const o=this.normalizeInstanceIdentifier(n);try{const a=this.getOrInitializeService({instanceIdentifier:o});r.resolve(a)}catch{}}}}clearInstance(t=J){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){const t=Array.from(this.instances.values());await Promise.all([...t.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...t.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=J){return this.instances.has(t)}getOptions(t=J){return this.instancesOptions.get(t)||{}}initialize(t={}){const{options:n={}}=t,r=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const o=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[a,s]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(a);r===c&&s.resolve(o)}return o}onInit(t,n){var r;const o=this.normalizeInstanceIdentifier(n),a=(r=this.onInitCallbacks.get(o))!==null&&r!==void 0?r:new Set;a.add(t),this.onInitCallbacks.set(o,a);const s=this.instances.get(o);return s&&t(s,o),()=>{a.delete(t)}}invokeOnInitCallbacks(t,n){const r=this.onInitCallbacks.get(n);if(r)for(const o of r)try{o(t,n)}catch{}}getOrInitializeService({instanceIdentifier:t,options:n={}}){let r=this.instances.get(t);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:_o(t),options:n}),this.instances.set(t,r),this.instancesOptions.set(t,n),this.invokeOnInitCallbacks(r,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,r)}catch{}return r||null}normalizeInstanceIdentifier(t=J){return this.component?this.component.multipleInstances?t:J:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function _o(e){return e===J?void 0:e}function To(e){return e.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ao{constructor(t){this.name=t,this.providers=new Map}addComponent(t){const n=this.getProvider(t.name);if(n.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);n.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);const n=new Eo(t,this);return this.providers.set(t,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var y;(function(e){e[e.DEBUG=0]="DEBUG",e[e.VERBOSE=1]="VERBOSE",e[e.INFO=2]="INFO",e[e.WARN=3]="WARN",e[e.ERROR=4]="ERROR",e[e.SILENT=5]="SILENT"})(y||(y={}));const Do={debug:y.DEBUG,verbose:y.VERBOSE,info:y.INFO,warn:y.WARN,error:y.ERROR,silent:y.SILENT},jo=y.INFO,Oo={[y.DEBUG]:"log",[y.VERBOSE]:"log",[y.INFO]:"info",[y.WARN]:"warn",[y.ERROR]:"error"},Mo=(e,t,...n)=>{if(t<e.logLevel)return;const r=new Date().toISOString(),o=Oo[t];if(o)console[o](`[${r}]  ${e.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class Bo{constructor(t){this.name=t,this._logLevel=jo,this._logHandler=Mo,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in y))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?Do[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,y.DEBUG,...t),this._logHandler(this,y.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,y.VERBOSE,...t),this._logHandler(this,y.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,y.INFO,...t),this._logHandler(this,y.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,y.WARN,...t),this._logHandler(this,y.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,y.ERROR,...t),this._logHandler(this,y.ERROR,...t)}}const Ro=(e,t)=>t.some(n=>e instanceof n);let kt,It;function No(){return kt||(kt=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function $o(){return It||(It=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const en=new WeakMap,Ze=new WeakMap,tn=new WeakMap,Pe=new WeakMap,at=new WeakMap;function Po(e){const t=new Promise((n,r)=>{const o=()=>{e.removeEventListener("success",a),e.removeEventListener("error",s)},a=()=>{n(P(e.result)),o()},s=()=>{r(e.error),o()};e.addEventListener("success",a),e.addEventListener("error",s)});return t.then(n=>{n instanceof IDBCursor&&en.set(n,e)}).catch(()=>{}),at.set(t,e),t}function Lo(e){if(Ze.has(e))return;const t=new Promise((n,r)=>{const o=()=>{e.removeEventListener("complete",a),e.removeEventListener("error",s),e.removeEventListener("abort",s)},a=()=>{n(),o()},s=()=>{r(e.error||new DOMException("AbortError","AbortError")),o()};e.addEventListener("complete",a),e.addEventListener("error",s),e.addEventListener("abort",s)});Ze.set(e,t)}let Je={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return Ze.get(e);if(t==="objectStoreNames")return e.objectStoreNames||tn.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return P(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function Ho(e){Je=e(Je)}function Vo(e){return e===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...n){const r=e.call(Le(this),t,...n);return tn.set(r,t.sort?t.sort():[t]),P(r)}:$o().includes(e)?function(...t){return e.apply(Le(this),t),P(en.get(this))}:function(...t){return P(e.apply(Le(this),t))}}function Fo(e){return typeof e=="function"?Vo(e):(e instanceof IDBTransaction&&Lo(e),Ro(e,No())?new Proxy(e,Je):e)}function P(e){if(e instanceof IDBRequest)return Po(e);if(Pe.has(e))return Pe.get(e);const t=Fo(e);return t!==e&&(Pe.set(e,t),at.set(t,e)),t}const Le=e=>at.get(e);function Ee(e,t,{blocked:n,upgrade:r,blocking:o,terminated:a}={}){const s=indexedDB.open(e,t),c=P(s);return r&&s.addEventListener("upgradeneeded",u=>{r(P(s.result),u.oldVersion,u.newVersion,P(s.transaction),u)}),n&&s.addEventListener("blocked",u=>n(u.oldVersion,u.newVersion,u)),c.then(u=>{a&&u.addEventListener("close",()=>a()),o&&u.addEventListener("versionchange",l=>o(l.oldVersion,l.newVersion,l))}).catch(()=>{}),c}function He(e,{blocked:t}={}){const n=indexedDB.deleteDatabase(e);return t&&n.addEventListener("blocked",r=>t(r.oldVersion,r)),P(n).then(()=>{})}const zo=["get","getKey","getAll","getAllKeys","count"],Uo=["put","add","delete","clear"],Ve=new Map;function Et(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(Ve.get(t))return Ve.get(t);const n=t.replace(/FromIndex$/,""),r=t!==n,o=Uo.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(o||zo.includes(n)))return;const a=async function(s,...c){const u=this.transaction(s,o?"readwrite":"readonly");let l=u.store;return r&&(l=l.index(c.shift())),(await Promise.all([l[n](...c),o&&u.done]))[0]};return Ve.set(t,a),a}Ho(e=>({...e,get:(t,n,r)=>Et(t,n)||e.get(t,n,r),has:(t,n)=>!!Et(t,n)||e.has(t,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wo{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(Ko(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function Ko(e){const t=e.getComponent();return(t==null?void 0:t.type)==="VERSION"}const Xe="@firebase/app",_t="0.13.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L=new Bo("@firebase/app"),qo="@firebase/app-compat",Go="@firebase/analytics-compat",Yo="@firebase/analytics",Zo="@firebase/app-check-compat",Jo="@firebase/app-check",Xo="@firebase/auth",Qo="@firebase/auth-compat",ei="@firebase/database",ti="@firebase/data-connect",ni="@firebase/database-compat",ri="@firebase/functions",oi="@firebase/functions-compat",ii="@firebase/installations",ai="@firebase/installations-compat",si="@firebase/messaging",ci="@firebase/messaging-compat",li="@firebase/performance",di="@firebase/performance-compat",ui="@firebase/remote-config",pi="@firebase/remote-config-compat",hi="@firebase/storage",fi="@firebase/storage-compat",gi="@firebase/firestore",mi="@firebase/ai",bi="@firebase/firestore-compat",wi="firebase";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qe="[DEFAULT]",yi={[Xe]:"fire-core",[qo]:"fire-core-compat",[Yo]:"fire-analytics",[Go]:"fire-analytics-compat",[Jo]:"fire-app-check",[Zo]:"fire-app-check-compat",[Xo]:"fire-auth",[Qo]:"fire-auth-compat",[ei]:"fire-rtdb",[ti]:"fire-data-connect",[ni]:"fire-rtdb-compat",[ri]:"fire-fn",[oi]:"fire-fn-compat",[ii]:"fire-iid",[ai]:"fire-iid-compat",[si]:"fire-fcm",[ci]:"fire-fcm-compat",[li]:"fire-perf",[di]:"fire-perf-compat",[ui]:"fire-rc",[pi]:"fire-rc-compat",[hi]:"fire-gcs",[fi]:"fire-gcs-compat",[gi]:"fire-fst",[bi]:"fire-fst-compat",[mi]:"fire-vertex","fire-js":"fire-js",[wi]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ye=new Map,vi=new Map,et=new Map;function Tt(e,t){try{e.container.addComponent(t)}catch(n){L.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,n)}}function ee(e){const t=e.name;if(et.has(t))return L.debug(`There were multiple attempts to register component ${t}.`),!1;et.set(t,e);for(const n of ye.values())Tt(n,e);for(const n of vi.values())Tt(n,e);return!0}function st(e,t){const n=e.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),e.container.getProvider(t)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ci={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},U=new Ie("app","Firebase",Ci);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xi{constructor(t,n,r){this._isDeleted=!1,this._options=Object.assign({},t),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new K("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw U.create("app-deleted",{appName:this._name})}}function nn(e,t={}){let n=e;typeof t!="object"&&(t={name:t});const r=Object.assign({name:Qe,automaticDataCollectionEnabled:!0},t),o=r.name;if(typeof o!="string"||!o)throw U.create("bad-app-name",{appName:String(o)});if(n||(n=Jt()),!n)throw U.create("no-options");const a=ye.get(o);if(a){if(Ye(n,a.options)&&Ye(r,a.config))return a;throw U.create("duplicate-app",{appName:o})}const s=new Ao(o);for(const u of et.values())s.addComponent(u);const c=new xi(n,r,s);return ye.set(o,c),c}function Si(e=Qe){const t=ye.get(e);if(!t&&e===Qe&&Jt())return nn();if(!t)throw U.create("no-app",{appName:e});return t}function W(e,t,n){var r;let o=(r=yi[e])!==null&&r!==void 0?r:e;n&&(o+=`-${n}`);const a=o.match(/\s|\//),s=t.match(/\s|\//);if(a||s){const c=[`Unable to register library "${o}" with version "${t}":`];a&&c.push(`library name "${o}" contains illegal characters (whitespace or "/")`),a&&s&&c.push("and"),s&&c.push(`version name "${t}" contains illegal characters (whitespace or "/")`),L.warn(c.join(" "));return}ee(new K(`${o}-version`,()=>({library:o,version:t}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ki="firebase-heartbeat-database",Ii=1,ce="firebase-heartbeat-store";let Fe=null;function rn(){return Fe||(Fe=Ee(ki,Ii,{upgrade:(e,t)=>{switch(t){case 0:try{e.createObjectStore(ce)}catch(n){console.warn(n)}}}}).catch(e=>{throw U.create("idb-open",{originalErrorMessage:e.message})})),Fe}async function Ei(e){try{const n=(await rn()).transaction(ce),r=await n.objectStore(ce).get(on(e));return await n.done,r}catch(t){if(t instanceof re)L.warn(t.message);else{const n=U.create("idb-get",{originalErrorMessage:t==null?void 0:t.message});L.warn(n.message)}}}async function At(e,t){try{const r=(await rn()).transaction(ce,"readwrite");await r.objectStore(ce).put(t,on(e)),await r.done}catch(n){if(n instanceof re)L.warn(n.message);else{const r=U.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});L.warn(r.message)}}}function on(e){return`${e.name}!${e.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _i=1024,Ti=30;class Ai{constructor(t){this.container=t,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new ji(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var t,n;try{const o=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=Dt();if(((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(s=>s.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:o}),this._heartbeatsCache.heartbeats.length>Ti){const s=Oi(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(s,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){L.warn(r)}}async getHeartbeatsHeader(){var t;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=Dt(),{heartbeatsToSend:r,unsentEntries:o}=Di(this._heartbeatsCache.heartbeats),a=Zt(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,o.length>0?(this._heartbeatsCache.heartbeats=o,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),a}catch(n){return L.warn(n),""}}}function Dt(){return new Date().toISOString().substring(0,10)}function Di(e,t=_i){const n=[];let r=e.slice();for(const o of e){const a=n.find(s=>s.agent===o.agent);if(a){if(a.dates.push(o.date),jt(n)>t){a.dates.pop();break}}else if(n.push({agent:o.agent,dates:[o.date]}),jt(n)>t){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class ji{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Xt()?Qt().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Ei(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){var n;if(await this._canUseIndexedDBPromise){const o=await this.read();return At(this.app,{lastSentHeartbeatDate:(n=t.lastSentHeartbeatDate)!==null&&n!==void 0?n:o.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){var n;if(await this._canUseIndexedDBPromise){const o=await this.read();return At(this.app,{lastSentHeartbeatDate:(n=t.lastSentHeartbeatDate)!==null&&n!==void 0?n:o.lastSentHeartbeatDate,heartbeats:[...o.heartbeats,...t.heartbeats]})}else return}}function jt(e){return Zt(JSON.stringify({version:2,heartbeats:e})).length}function Oi(e){if(e.length===0)return-1;let t=0,n=e[0].date;for(let r=1;r<e.length;r++)e[r].date<n&&(n=e[r].date,t=r);return t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mi(e){ee(new K("platform-logger",t=>new Wo(t),"PRIVATE")),ee(new K("heartbeat",t=>new Ai(t),"PRIVATE")),W(Xe,_t,e),W(Xe,_t,"esm2017"),W("fire-js","")}Mi("");var Bi="firebase",Ri="11.8.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */W(Bi,Ri,"app");const an="@firebase/installations",ct="0.6.17";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sn=1e4,cn=`w:${ct}`,ln="FIS_v2",Ni="https://firebaseinstallations.googleapis.com/v1",$i=60*60*1e3,Pi="installations",Li="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hi={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},te=new Ie(Pi,Li,Hi);function dn(e){return e instanceof re&&e.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function un({projectId:e}){return`${Ni}/projects/${e}/installations`}function pn(e){return{token:e.token,requestStatus:2,expiresIn:Fi(e.expiresIn),creationTime:Date.now()}}async function hn(e,t){const r=(await t.json()).error;return te.create("request-failed",{requestName:e,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function fn({apiKey:e}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e})}function Vi(e,{refreshToken:t}){const n=fn(e);return n.append("Authorization",zi(t)),n}async function gn(e){const t=await e();return t.status>=500&&t.status<600?e():t}function Fi(e){return Number(e.replace("s","000"))}function zi(e){return`${ln} ${e}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ui({appConfig:e,heartbeatServiceProvider:t},{fid:n}){const r=un(e),o=fn(e),a=t.getImmediate({optional:!0});if(a){const l=await a.getHeartbeatsHeader();l&&o.append("x-firebase-client",l)}const s={fid:n,authVersion:ln,appId:e.appId,sdkVersion:cn},c={method:"POST",headers:o,body:JSON.stringify(s)},u=await gn(()=>fetch(r,c));if(u.ok){const l=await u.json();return{fid:l.fid||n,registrationStatus:2,refreshToken:l.refreshToken,authToken:pn(l.authToken)}}else throw await hn("Create Installation",u)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mn(e){return new Promise(t=>{setTimeout(t,e)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wi(e){return btoa(String.fromCharCode(...e)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ki=/^[cdef][\w-]{21}$/,tt="";function qi(){try{const e=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(e),e[0]=112+e[0]%16;const n=Gi(e);return Ki.test(n)?n:tt}catch{return tt}}function Gi(e){return Wi(e).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _e(e){return`${e.appName}!${e.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bn=new Map;function wn(e,t){const n=_e(e);yn(n,t),Yi(n,t)}function yn(e,t){const n=bn.get(e);if(n)for(const r of n)r(t)}function Yi(e,t){const n=Zi();n&&n.postMessage({key:e,fid:t}),Ji()}let X=null;function Zi(){return!X&&"BroadcastChannel"in self&&(X=new BroadcastChannel("[Firebase] FID Change"),X.onmessage=e=>{yn(e.data.key,e.data.fid)}),X}function Ji(){bn.size===0&&X&&(X.close(),X=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xi="firebase-installations-database",Qi=1,ne="firebase-installations-store";let ze=null;function lt(){return ze||(ze=Ee(Xi,Qi,{upgrade:(e,t)=>{switch(t){case 0:e.createObjectStore(ne)}}})),ze}async function ve(e,t){const n=_e(e),o=(await lt()).transaction(ne,"readwrite"),a=o.objectStore(ne),s=await a.get(n);return await a.put(t,n),await o.done,(!s||s.fid!==t.fid)&&wn(e,t.fid),t}async function vn(e){const t=_e(e),r=(await lt()).transaction(ne,"readwrite");await r.objectStore(ne).delete(t),await r.done}async function Te(e,t){const n=_e(e),o=(await lt()).transaction(ne,"readwrite"),a=o.objectStore(ne),s=await a.get(n),c=t(s);return c===void 0?await a.delete(n):await a.put(c,n),await o.done,c&&(!s||s.fid!==c.fid)&&wn(e,c.fid),c}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dt(e){let t;const n=await Te(e.appConfig,r=>{const o=ea(r),a=ta(e,o);return t=a.registrationPromise,a.installationEntry});return n.fid===tt?{installationEntry:await t}:{installationEntry:n,registrationPromise:t}}function ea(e){const t=e||{fid:qi(),registrationStatus:0};return Cn(t)}function ta(e,t){if(t.registrationStatus===0){if(!navigator.onLine){const o=Promise.reject(te.create("app-offline"));return{installationEntry:t,registrationPromise:o}}const n={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},r=na(e,n);return{installationEntry:n,registrationPromise:r}}else return t.registrationStatus===1?{installationEntry:t,registrationPromise:ra(e)}:{installationEntry:t}}async function na(e,t){try{const n=await Ui(e,t);return ve(e.appConfig,n)}catch(n){throw dn(n)&&n.customData.serverCode===409?await vn(e.appConfig):await ve(e.appConfig,{fid:t.fid,registrationStatus:0}),n}}async function ra(e){let t=await Ot(e.appConfig);for(;t.registrationStatus===1;)await mn(100),t=await Ot(e.appConfig);if(t.registrationStatus===0){const{installationEntry:n,registrationPromise:r}=await dt(e);return r||n}return t}function Ot(e){return Te(e,t=>{if(!t)throw te.create("installation-not-found");return Cn(t)})}function Cn(e){return oa(e)?{fid:e.fid,registrationStatus:0}:e}function oa(e){return e.registrationStatus===1&&e.registrationTime+sn<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ia({appConfig:e,heartbeatServiceProvider:t},n){const r=aa(e,n),o=Vi(e,n),a=t.getImmediate({optional:!0});if(a){const l=await a.getHeartbeatsHeader();l&&o.append("x-firebase-client",l)}const s={installation:{sdkVersion:cn,appId:e.appId}},c={method:"POST",headers:o,body:JSON.stringify(s)},u=await gn(()=>fetch(r,c));if(u.ok){const l=await u.json();return pn(l)}else throw await hn("Generate Auth Token",u)}function aa(e,{fid:t}){return`${un(e)}/${t}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ut(e,t=!1){let n;const r=await Te(e.appConfig,a=>{if(!xn(a))throw te.create("not-registered");const s=a.authToken;if(!t&&la(s))return a;if(s.requestStatus===1)return n=sa(e,t),a;{if(!navigator.onLine)throw te.create("app-offline");const c=ua(a);return n=ca(e,c),c}});return n?await n:r.authToken}async function sa(e,t){let n=await Mt(e.appConfig);for(;n.authToken.requestStatus===1;)await mn(100),n=await Mt(e.appConfig);const r=n.authToken;return r.requestStatus===0?ut(e,t):r}function Mt(e){return Te(e,t=>{if(!xn(t))throw te.create("not-registered");const n=t.authToken;return pa(n)?Object.assign(Object.assign({},t),{authToken:{requestStatus:0}}):t})}async function ca(e,t){try{const n=await ia(e,t),r=Object.assign(Object.assign({},t),{authToken:n});return await ve(e.appConfig,r),n}catch(n){if(dn(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await vn(e.appConfig);else{const r=Object.assign(Object.assign({},t),{authToken:{requestStatus:0}});await ve(e.appConfig,r)}throw n}}function xn(e){return e!==void 0&&e.registrationStatus===2}function la(e){return e.requestStatus===2&&!da(e)}function da(e){const t=Date.now();return t<e.creationTime||e.creationTime+e.expiresIn<t+$i}function ua(e){const t={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},e),{authToken:t})}function pa(e){return e.requestStatus===1&&e.requestTime+sn<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ha(e){const t=e,{installationEntry:n,registrationPromise:r}=await dt(t);return r?r.catch(console.error):ut(t).catch(console.error),n.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fa(e,t=!1){const n=e;return await ga(n),(await ut(n,t)).token}async function ga(e){const{registrationPromise:t}=await dt(e);t&&await t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ma(e){if(!e||!e.options)throw Ue("App Configuration");if(!e.name)throw Ue("App Name");const t=["projectId","apiKey","appId"];for(const n of t)if(!e.options[n])throw Ue(n);return{appName:e.name,projectId:e.options.projectId,apiKey:e.options.apiKey,appId:e.options.appId}}function Ue(e){return te.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sn="installations",ba="installations-internal",wa=e=>{const t=e.getProvider("app").getImmediate(),n=ma(t),r=st(t,"heartbeat");return{app:t,appConfig:n,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},ya=e=>{const t=e.getProvider("app").getImmediate(),n=st(t,Sn).getImmediate();return{getId:()=>ha(n),getToken:o=>fa(n,o)}};function va(){ee(new K(Sn,wa,"PUBLIC")),ee(new K(ba,ya,"PRIVATE"))}va();W(an,ct);W(an,ct,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ca="/firebase-messaging-sw.js",xa="/firebase-cloud-messaging-push-scope",kn="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",Sa="https://fcmregistrations.googleapis.com/v1",In="google.c.a.c_id",ka="google.c.a.c_l",Ia="google.c.a.ts",Ea="google.c.a.e",Bt=1e4;var Rt;(function(e){e[e.DATA_MESSAGE=1]="DATA_MESSAGE",e[e.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(Rt||(Rt={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var le;(function(e){e.PUSH_RECEIVED="push-received",e.NOTIFICATION_CLICKED="notification-clicked"})(le||(le={}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $(e){const t=new Uint8Array(e);return btoa(String.fromCharCode(...t)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function _a(e){const t="=".repeat((4-e.length%4)%4),n=(e+t).replace(/\-/g,"+").replace(/_/g,"/"),r=atob(n),o=new Uint8Array(r.length);for(let a=0;a<r.length;++a)o[a]=r.charCodeAt(a);return o}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const We="fcm_token_details_db",Ta=5,Nt="fcm_token_object_Store";async function Aa(e){if("databases"in indexedDB&&!(await indexedDB.databases()).map(a=>a.name).includes(We))return null;let t=null;return(await Ee(We,Ta,{upgrade:async(r,o,a,s)=>{var c;if(o<2||!r.objectStoreNames.contains(Nt))return;const u=s.objectStore(Nt),l=await u.index("fcmSenderId").get(e);if(await u.clear(),!!l){if(o===2){const d=l;if(!d.auth||!d.p256dh||!d.endpoint)return;t={token:d.fcmToken,createTime:(c=d.createTime)!==null&&c!==void 0?c:Date.now(),subscriptionOptions:{auth:d.auth,p256dh:d.p256dh,endpoint:d.endpoint,swScope:d.swScope,vapidKey:typeof d.vapidKey=="string"?d.vapidKey:$(d.vapidKey)}}}else if(o===3){const d=l;t={token:d.fcmToken,createTime:d.createTime,subscriptionOptions:{auth:$(d.auth),p256dh:$(d.p256dh),endpoint:d.endpoint,swScope:d.swScope,vapidKey:$(d.vapidKey)}}}else if(o===4){const d=l;t={token:d.fcmToken,createTime:d.createTime,subscriptionOptions:{auth:$(d.auth),p256dh:$(d.p256dh),endpoint:d.endpoint,swScope:d.swScope,vapidKey:$(d.vapidKey)}}}}}})).close(),await He(We),await He("fcm_vapid_details_db"),await He("undefined"),Da(t)?t:null}function Da(e){if(!e||!e.subscriptionOptions)return!1;const{subscriptionOptions:t}=e;return typeof e.createTime=="number"&&e.createTime>0&&typeof e.token=="string"&&e.token.length>0&&typeof t.auth=="string"&&t.auth.length>0&&typeof t.p256dh=="string"&&t.p256dh.length>0&&typeof t.endpoint=="string"&&t.endpoint.length>0&&typeof t.swScope=="string"&&t.swScope.length>0&&typeof t.vapidKey=="string"&&t.vapidKey.length>0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ja="firebase-messaging-database",Oa=1,de="firebase-messaging-store";let Ke=null;function En(){return Ke||(Ke=Ee(ja,Oa,{upgrade:(e,t)=>{switch(t){case 0:e.createObjectStore(de)}}})),Ke}async function Ma(e){const t=_n(e),r=await(await En()).transaction(de).objectStore(de).get(t);if(r)return r;{const o=await Aa(e.appConfig.senderId);if(o)return await pt(e,o),o}}async function pt(e,t){const n=_n(e),o=(await En()).transaction(de,"readwrite");return await o.objectStore(de).put(t,n),await o.done,t}function _n({appConfig:e}){return e.appId}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ba={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},T=new Ie("messaging","Messaging",Ba);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ra(e,t){const n=await ft(e),r=Tn(t),o={method:"POST",headers:n,body:JSON.stringify(r)};let a;try{a=await(await fetch(ht(e.appConfig),o)).json()}catch(s){throw T.create("token-subscribe-failed",{errorInfo:s==null?void 0:s.toString()})}if(a.error){const s=a.error.message;throw T.create("token-subscribe-failed",{errorInfo:s})}if(!a.token)throw T.create("token-subscribe-no-token");return a.token}async function Na(e,t){const n=await ft(e),r=Tn(t.subscriptionOptions),o={method:"PATCH",headers:n,body:JSON.stringify(r)};let a;try{a=await(await fetch(`${ht(e.appConfig)}/${t.token}`,o)).json()}catch(s){throw T.create("token-update-failed",{errorInfo:s==null?void 0:s.toString()})}if(a.error){const s=a.error.message;throw T.create("token-update-failed",{errorInfo:s})}if(!a.token)throw T.create("token-update-no-token");return a.token}async function $a(e,t){const r={method:"DELETE",headers:await ft(e)};try{const a=await(await fetch(`${ht(e.appConfig)}/${t}`,r)).json();if(a.error){const s=a.error.message;throw T.create("token-unsubscribe-failed",{errorInfo:s})}}catch(o){throw T.create("token-unsubscribe-failed",{errorInfo:o==null?void 0:o.toString()})}}function ht({projectId:e}){return`${Sa}/projects/${e}/registrations`}async function ft({appConfig:e,installations:t}){const n=await t.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e.apiKey,"x-goog-firebase-installations-auth":`FIS ${n}`})}function Tn({p256dh:e,auth:t,endpoint:n,vapidKey:r}){const o={web:{endpoint:n,auth:t,p256dh:e}};return r!==kn&&(o.web.applicationPubKey=r),o}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pa=7*24*60*60*1e3;async function La(e){const t=await Va(e.swRegistration,e.vapidKey),n={vapidKey:e.vapidKey,swScope:e.swRegistration.scope,endpoint:t.endpoint,auth:$(t.getKey("auth")),p256dh:$(t.getKey("p256dh"))},r=await Ma(e.firebaseDependencies);if(r){if(Fa(r.subscriptionOptions,n))return Date.now()>=r.createTime+Pa?Ha(e,{token:r.token,createTime:Date.now(),subscriptionOptions:n}):r.token;try{await $a(e.firebaseDependencies,r.token)}catch(o){console.warn(o)}return $t(e.firebaseDependencies,n)}else return $t(e.firebaseDependencies,n)}async function Ha(e,t){try{const n=await Na(e.firebaseDependencies,t),r=Object.assign(Object.assign({},t),{token:n,createTime:Date.now()});return await pt(e.firebaseDependencies,r),n}catch(n){throw n}}async function $t(e,t){const r={token:await Ra(e,t),createTime:Date.now(),subscriptionOptions:t};return await pt(e,r),r.token}async function Va(e,t){const n=await e.pushManager.getSubscription();return n||e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:_a(t)})}function Fa(e,t){const n=t.vapidKey===e.vapidKey,r=t.endpoint===e.endpoint,o=t.auth===e.auth,a=t.p256dh===e.p256dh;return n&&r&&o&&a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pt(e){const t={from:e.from,collapseKey:e.collapse_key,messageId:e.fcmMessageId};return za(t,e),Ua(t,e),Wa(t,e),t}function za(e,t){if(!t.notification)return;e.notification={};const n=t.notification.title;n&&(e.notification.title=n);const r=t.notification.body;r&&(e.notification.body=r);const o=t.notification.image;o&&(e.notification.image=o);const a=t.notification.icon;a&&(e.notification.icon=a)}function Ua(e,t){t.data&&(e.data=t.data)}function Wa(e,t){var n,r,o,a,s;if(!t.fcmOptions&&!(!((n=t.notification)===null||n===void 0)&&n.click_action))return;e.fcmOptions={};const c=(o=(r=t.fcmOptions)===null||r===void 0?void 0:r.link)!==null&&o!==void 0?o:(a=t.notification)===null||a===void 0?void 0:a.click_action;c&&(e.fcmOptions.link=c);const u=(s=t.fcmOptions)===null||s===void 0?void 0:s.analytics_label;u&&(e.fcmOptions.analyticsLabel=u)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ka(e){return typeof e=="object"&&!!e&&In in e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qa(e){if(!e||!e.options)throw qe("App Configuration Object");if(!e.name)throw qe("App Name");const t=["projectId","apiKey","appId","messagingSenderId"],{options:n}=e;for(const r of t)if(!n[r])throw qe(r);return{appName:e.name,projectId:n.projectId,apiKey:n.apiKey,appId:n.appId,senderId:n.messagingSenderId}}function qe(e){return T.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ga{constructor(t,n,r){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;const o=qa(t);this.firebaseDependencies={app:t,appConfig:o,installations:n,analyticsProvider:r}}_delete(){return Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ya(e){try{e.swRegistration=await navigator.serviceWorker.register(Ca,{scope:xa}),e.swRegistration.update().catch(()=>{}),await Za(e.swRegistration)}catch(t){throw T.create("failed-service-worker-registration",{browserErrorMessage:t==null?void 0:t.message})}}async function Za(e){return new Promise((t,n)=>{const r=setTimeout(()=>n(new Error(`Service worker not registered after ${Bt} ms`)),Bt),o=e.installing||e.waiting;e.active?(clearTimeout(r),t()):o?o.onstatechange=a=>{var s;((s=a.target)===null||s===void 0?void 0:s.state)==="activated"&&(o.onstatechange=null,clearTimeout(r),t())}:(clearTimeout(r),n(new Error("No incoming service worker found.")))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ja(e,t){if(!t&&!e.swRegistration&&await Ya(e),!(!t&&e.swRegistration)){if(!(t instanceof ServiceWorkerRegistration))throw T.create("invalid-sw-registration");e.swRegistration=t}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xa(e,t){t?e.vapidKey=t:e.vapidKey||(e.vapidKey=kn)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function An(e,t){if(!navigator)throw T.create("only-available-in-window");if(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission!=="granted")throw T.create("permission-blocked");return await Xa(e,t==null?void 0:t.vapidKey),await Ja(e,t==null?void 0:t.serviceWorkerRegistration),La(e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qa(e,t,n){const r=es(t);(await e.firebaseDependencies.analyticsProvider.get()).logEvent(r,{message_id:n[In],message_name:n[ka],message_time:n[Ia],message_device_time:Math.floor(Date.now()/1e3)})}function es(e){switch(e){case le.NOTIFICATION_CLICKED:return"notification_open";case le.PUSH_RECEIVED:return"notification_foreground";default:throw new Error}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ts(e,t){const n=t.data;if(!n.isFirebaseMessaging)return;e.onMessageHandler&&n.messageType===le.PUSH_RECEIVED&&(typeof e.onMessageHandler=="function"?e.onMessageHandler(Pt(n)):e.onMessageHandler.next(Pt(n)));const r=n.data;Ka(r)&&r[Ea]==="1"&&await Qa(e,n.messageType,r)}const Lt="@firebase/messaging",Ht="0.12.21";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ns=e=>{const t=new Ga(e.getProvider("app").getImmediate(),e.getProvider("installations-internal").getImmediate(),e.getProvider("analytics-internal"));return navigator.serviceWorker.addEventListener("message",n=>ts(t,n)),t},rs=e=>{const t=e.getProvider("messaging").getImmediate();return{getToken:r=>An(t,r)}};function os(){ee(new K("messaging",ns,"PUBLIC")),ee(new K("messaging-internal",rs,"PRIVATE")),W(Lt,Ht),W(Lt,Ht,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function is(){try{await Qt()}catch{return!1}return typeof window<"u"&&Xt()&&xo()&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window&&"fetch"in window&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function as(e,t){if(!navigator)throw T.create("only-available-in-window");return e.onMessageHandler=t,()=>{e.onMessageHandler=null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ss(e=Si()){return is().then(t=>{if(!t)throw T.create("unsupported-browser")},t=>{throw T.create("indexed-db-unsupported")}),st(it(e),"messaging").getImmediate()}async function cs(e,t){return e=it(e),An(e,t)}function ls(e,t){return e=it(e),as(e,t)}os();const ds=({onMessageReceived:e,isInitFCM:t,firebaseConfig:n,vapidKey:r})=>{const[o,a]=p.useState(null),[s,c]=p.useState(!1),[u,l]=p.useState(null),[d,f]=p.useState(null),[v]=fr();return p.useEffect(()=>{if(t)try{const b=nn(n),g=ss(b);l(b),f(g)}catch(b){console.error("Error al inicializar Firebase o FCM:",b)}},[t,n]),p.useEffect(()=>{if(!d||!t)return;(async()=>{if(!("Notification"in window)){console.warn("Este navegador no soporta notificaciones.");return}if(await Notification.requestPermission()==="granted"){c(!0);try{const h=await cs(d,{vapidKey:r});h?(await v({fcmToken:h}).unwrap(),a(h)):console.warn("FCM: No se pudo obtener el token.")}catch(h){console.error("FCM: Error al obtener o manejar el token:",h)}}else console.warn("FCM: Permiso de notificación denegado."),c(!1)})()},[d,t,r]),p.useEffect(()=>{if(!d||!t)return;const b=ls(d,g=>{const{data:h}=g;if(e){const w={n_uuid:h.n_uuid,evento:h.evento,titulo:h.titulo,mensaje:h.mensaje,data:void 0,fecha:h.fecha};e(w)}});return()=>{b()}},[d,t,e]),{fcmToken:o,permissionGranted:s}};N.extend(lo);const Is=()=>{const{data:n,isSuccess:r}=gr({limit:10,offset:0}),o=ot(a=>a.authStore);return i.jsx(i.Fragment,{children:r&&n&&o.fcm&&i.jsx(us,{lastNotifications:n.data,newOffset:10,limitValue:10,config:{fcm_web:o.fcm.web}})})},us=({lastNotifications:e,limitValue:t,newOffset:n,config:r})=>{const[o,a]=p.useState(e),[s]=p.useState(t),[c,u]=p.useState(n),[l,d]=p.useState(!0),[f,v]=p.useState(!0),[b,g]=p.useState(!1),[h,w]=p.useState(null),[S,_]=p.useState(!1),[G]=mr(),[B]=br(),[O]=wr(),A=p.useRef(null),R=p.useRef(null),V=p.useRef(null),[pe,oe]=p.useState(null),Ae=m=>{oe(m.currentTarget)},De=()=>{oe(null)},je=async()=>{try{await B().unwrap(),a(m=>m.map(k=>({...k,leido:1})))}catch(m){console.error(m)}},Y=!!pe,he=Y?"notification-popover":void 0,ie=p.useCallback(async()=>{if(!(b||!l||h)){g(!0),w(null);try{const m=await O({limit:s,offset:c,unread:f?void 0:!0}).unwrap();m.data.length===0?d(!1):(a(k=>[...k,...m.data]),u(k=>k+s),d(m.data.length===s))}catch{w("Error al cargar notificaciones")}finally{g(!1)}}},[c,s,f,b,l,h]),ae=async m=>{try{if(o.some(x=>x.n_uuid===m.n_uuid))return;const M=await G({n_uuid:m.n_uuid}).unwrap();xr.success(()=>i.jsx(j,{children:i.jsx(I,{variant:"body1",children:M.notificacion.mensaje})})),a(x=>[M,...x])}catch(k){console.error(k)}},fe=m=>{a(k=>k.map(M=>M.nu_id===m?{...M,leido:1}:M))},ge=p.useMemo(()=>{const m=o.reduce((x,F)=>{const Z=N(F.notificacion.fecha).format("YYYY-MM-DD");return x[Z]||(x[Z]=[]),x[Z].push(F),x},{});Object.keys(m).forEach(x=>{m[x].sort((F,Z)=>N(Z.notificacion.fecha).unix()-N(F.notificacion.fecha).unix())});const k=Object.keys(m).sort((x,F)=>N(F,"YYYY-MM-DD").unix()-N(x,"YYYY-MM-DD").unix()),M={};return k.forEach(x=>{M[x]=m[x]}),M},[o]),me=p.useMemo(()=>o.filter(m=>m.leido===0).length,[o]);return p.useEffect(()=>{_(!0)},[e]),p.useEffect(()=>(A.current&&A.current.disconnect(),Y&&R.current&&(A.current=new IntersectionObserver(m=>{m[0].isIntersecting&&ie()},{root:V.current,threshold:.1}),A.current.observe(R.current)),()=>{A.current&&A.current.disconnect()}),[ie,Y]),ds({onMessageReceived:ae,isInitFCM:S,firebaseConfig:{apiKey:r.fcm_web.apiKey,authDomain:r.fcm_web.authDomain,projectId:r.fcm_web.projectId,storageBucket:r.fcm_web.storageBucket,messagingSenderId:r.fcm_web.messagingSenderId,appId:r.fcm_web.appId},vapidKey:r.fcm_web.vapId}),i.jsxs(i.Fragment,{children:[i.jsx(zt,{onClick:Ae,"aria-describedby":he,children:i.jsx(Br,{color:"error",className:"cursor-pointer",variant:"dot",overlap:"circular",invisible:me===0,anchorOrigin:{vertical:"top",horizontal:"right"},children:i.jsx(Xr,{})})}),i.jsx(yr,{id:he,open:Y,anchorEl:pe,onClose:De,anchorOrigin:{vertical:"bottom",horizontal:"right"},transformOrigin:{vertical:"top",horizontal:"right"},disablePortal:!0,slotProps:{paper:{sx:{backgroundColor:"transparent",backgroundImage:"inherit",border:"none",boxShadow:"none",mt:m=>`calc((${m.mixins.toolbar.minHeight}px - 40px) / 2)`}}},children:i.jsx(Wt,{sx:{boxShadow:"0px 4px 18px 0px rgba(42, 55, 60, 0.16)",":hover":{boxShadow:"0px 4px 18px 0px rgba(42, 55, 60, 0.16)"}},children:i.jsxs(E,{spacing:1,children:[i.jsxs(E,{spacing:1,px:2,pt:2,children:[i.jsx(I,{variant:"h5",children:"Notificaciones"}),i.jsxs(E,{direction:"row",spacing:2,alignItems:"center",justifyContent:"space-between",children:[i.jsxs(E,{direction:"row",spacing:2,children:[i.jsx(Vt,{selected:f===!0,onClick:()=>{v(!0),a([]),u(0),d(!0)},children:"Todo"}),i.jsx(Vt,{selected:f===!1,onClick:()=>{v(!1),a([]),u(0),d(!0)},children:"No leídos"})]}),i.jsx(Ge,{variant:"contained",color:"primary",size:"medium",onClick:je,sx:{whiteSpace:"nowrap"},children:"Leer todos"})]})]}),i.jsxs("div",{ref:V,style:{maxHeight:"400px",width:"400px",overflowY:"auto",padding:"1rem",display:"flex",flexDirection:"column",gap:10},children:[Object.entries(ge).map(([m,k],M)=>i.jsxs(E,{spacing:1,children:[i.jsx(I,{variant:"subtitle1",color:"textPrimary",children:Kt(`${N().format("YYYY-MM-DD")===m?"Hoy, ":""}${N(m,"YYYY-MM-DD").format("dddd D [de] MMMM , YYYY")}`)}),i.jsx(E,{spacing:1,children:k.map((x,F,Z)=>i.jsx(ps,{data:x,hasDivider:F<Z.length-1,onReadNotification:fe},x.nu_id))})]},M)),i.jsx("div",{ref:R}),b&&i.jsx(I,{variant:"body1",color:"textSecondary",children:"Cargando más notificaciones..."}),h&&i.jsxs(I,{variant:"body1",color:"error",children:["Error: ",String(h)]}),!l&&!b&&!h&&i.jsx(I,{variant:"body1",color:"textSecondary",children:"No existen registros adicionales de notificaciones."})]},JSON.stringify(f))]})})})]})},ps=({hasDivider:e,data:t,onReadNotification:n})=>{const[r,o]=p.useState(t),[a]=vr(),s=async()=>{if(r.leido===0)try{await a({n_uuid:r.n_uuid}).unwrap(),o(c=>({...c,leido:1})),n(r.nu_id)}catch(c){console.error(c)}};return p.useEffect(()=>{o(t)},[t]),i.jsxs(i.Fragment,{children:[i.jsxs(E,{direction:"row",spacing:1,padding:1,sx:{borderRadius:"10px",cursor:r.leido===0?"pointer":void 0,":hover":{backgroundColor:"tertiary.opacityLight"}},onClick:s,children:[hs(r.notificacion.evento),i.jsxs(E,{spacing:.5,flex:1,children:[i.jsx(I,{variant:"body2",sx:{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"},children:Kt(N(r.notificacion.fecha).fromNow())}),i.jsx(I,{variant:"subtitle1",sx:{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"},children:r.notificacion.titulo}),i.jsx(I,{variant:"body1",children:r.notificacion.mensaje})]}),r.leido===0&&i.jsx(j,{width:12,height:12,sx:{borderRadius:"50%",backgroundColor:"primary.700"}})]}),e&&i.jsx(Ut,{})]})},hs=e=>{switch(e){case"ticket.not.attended":return i.jsx(j,{width:40,height:40,sx:{borderRadius:"50%",display:"grid",placeContent:"center",backgroundColor:"warning.opacityDarker",color:"text.warning"},children:i.jsx($e,{})});case"ticket.requested":return i.jsx(j,{width:40,height:40,sx:{borderRadius:"50%",display:"grid",placeContent:"center",backgroundColor:"tertiary.opacityDarker",color:"text.tertiary"},children:i.jsx($e,{})});case"ticket.cancelled":return i.jsx(j,{width:40,height:40,sx:{borderRadius:"50%",display:"grid",placeContent:"center",backgroundColor:"error.opacityDarker",color:"text.error"},children:i.jsx($e,{isCanceled:!0})});case"alarm.camera.disconnected":return i.jsx(j,{width:40,height:40,sx:{borderRadius:"50%",display:"grid",placeContent:"center",backgroundColor:"error.opacityDarker",color:"text.error"},children:i.jsx(Ir,{})});case"alarm.controller.disconnected":return i.jsx(j,{width:40,height:40,sx:{borderRadius:"50%",display:"grid",placeContent:"center",backgroundColor:"error.opacityDarker",color:"text.error"},children:i.jsx(Qr,{})});case"alarm.pinsalida.activated":return i.jsx(j,{width:40,height:40,sx:{borderRadius:"50%",display:"grid",placeContent:"center",backgroundColor:"error.opacityDarker",color:"text.error"},children:i.jsx(vt,{})});case"max.temperature.exceeded":return i.jsx(j,{width:40,height:40,sx:{borderRadius:"50%",display:"grid",placeContent:"center",backgroundColor:"error.opacityDarker",color:"text.error"},children:i.jsx(Cr,{state:"high"})});default:return i.jsx(j,{width:40,height:40,sx:{borderRadius:"50%",display:"grid",placeContent:"center",backgroundColor:"tertiary.opacityDarker",color:"text.tertiary"},children:i.jsx(vt,{})})}},Vt=({children:e,selected:t,onClick:n})=>i.jsx(j,{sx:{py:1,px:2,borderRadius:"10px",border:"1px solid",borderColor:"custom.outlineBoder",":hover":{...t&&{backgroundColor:"primary.opacityDark"},...!t&&{backgroundColor:"primary.opacityLight"}},...t&&{backgroundColor:"primary.opacityDark",borderColor:"transparent"},cursor:"pointer"},onClick:n,children:i.jsx(I,{variant:"subtitle1",color:"textPrimary",sx:{whiteSpace:"nowrap"},children:e})}),Es=()=>i.jsx(Sr,{position:"bottom-right"});export{vs as A,Es as C,Ss as F,ks as P,xs as T,Is as a,Cs as b};
