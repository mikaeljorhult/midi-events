/*!
 * MIDI Events 0.1.5
 * 
 * @author Mikael Jorhult 
 * @license https://github.com/mikaeljorhult/midi-events MIT
*/
define("PubSub",[],function(){var e={};return{trigger:function(t,n,r){if(e[t]){var i=e[t],s=i.length-1;for(s;s>=0;s-=1)i[s].apply(r||this,n||[])}},on:function(t,n){return e[t]||(e[t]=[]),e[t].push(n),[t,n]},off:function(t,n){var r=t[0],i=e[r].length-1;if(e[r])for(i;i>=0;i-=1)e[r][i]===t[1]&&(e[r].splice(e[r][i],1),n&&delete e[r])}}}),define("Device",["require","PubSub"],function(e,t){function n(e,t){this.inputs=e!==undefined?e:[],this.outputs=t!==undefined?t:[]}return n.prototype.send=function(t){var n=e("midi-events");return n.send(this.outputs,t),this},n.prototype.listen=function(e){var n,r=this.inputs.length;for(n=0;n<r;n++)t.on("port:"+this.inputs[n],e);return this},n.prototype.unlisten=function(e){var n,r=this.inputs.length;for(n=0;n<r;n++)t.off(t.on("port:"+this.inputs[n],e));return this},n}),define("midi-events",["Device","PubSub"],function(e,t){function u(e){r.then(function(n){i=n,s=i.inputs(),o=i.outputs(),t.trigger("connected"),typeof e=="function"&&e()},g)}function a(){return s=i.inputs(),s}function f(){return o=i.outputs(),o}function l(e){var t=p(e),n=t.length,r;for(r=0;r<n;r++)t[r].addEventListener("midimessage",h,!1)}function c(e){var t=p(e),n=t.length,r;for(r=0;r<n;r++)t[r].removeEventListener("midimessage",h,!1)}function h(e){var n={port:v(e.target.id),type:"unsupported",channel:0};n.note=e.data[1],n.value=e.data[2];switch(!0){case e.data[0]<128:break;case e.data[0]<144||e.data[0]<160&&e.data[2]===0:n.type="noteoff",n.channel=e.data[0]-(e.data[0]>143?144:128);break;case e.data[0]<160:n.type="noteon",n.channel=e.data[0]-144;break;case e.data[0]<176:n.type="polyphonic-aftertouch",n.channel=e.data[0]-160;break;case e.data[0]<192:n.type="controller",n.channel=e.data[0]-176;break;case e.data[0]<208:n.type="controlchange",n.channel=e.data[0]-192,n.note=0,n.value=e.data[1];break;case e.data[0]<224:n.type="aftertouch",n.channel=e.data[0]-208,n.note=0,n.value=e.data[1]}t.trigger("message",[n]),t.trigger(n.type,[n]),t.trigger(n.type+":"+n.note,[n]),t.trigger("port:"+n.port,[n])}function p(e){var t=[],n=[],r=a(),i=r.length,s;if(typeof e=="number")t=[e];else if(Object.prototype.toString.call(e)==="[object Array]")t=e;else if(typeof e=="string"&&e.toLowerCase()==="all"||e===undefined)n=a();if(t.length>0)for(s=0;s<i;s++)typeof t[s]=="number"&&t[s]<i&&n.push(r[t[s]]);return n}function d(e){var t=[],n=[],r=f(),i=r.length,s;typeof e=="number"?t=[e]:Object.prototype.toString.call(e)==="[object Array]"?t=e:typeof e=="string"&&e.toLowerCase()==="all"&&(n=f());if(t.length>0)for(s=0;s<i;s++)typeof t[s]=="number"&&t[s]<i&&n.push(r[t[s]]);return n}function v(e){var t,n=s.length;for(t=0;t<n;t++)if(s[t].id===e)return t}function m(e,t){var n=d(e),r,i;Object.prototype.toString.call(t)!=="[object Array]"&&(t=[t]);for(r=0;r<t.length;r++)switch(t[r].type){case"noteon":t[r].type=144;break;case"noteoff":t[r].type=128}for(r=0;r<n.length;r++)for(i=0;i<t.length;i++)n[r].send([t[i].type,t[i].note,t[i].value])}function g(e){console.log(e)}function y(t,n){return new e(t,n)}var n={},r=navigator.requestMIDIAccess(),i=null,s=[],o=[];return n={connect:u,inputs:a,outputs:f,listen:l,unlisten:c,send:m,createDevice:y,on:t.on,off:t.off},n});