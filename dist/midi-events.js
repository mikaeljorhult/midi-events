/*!
 * MIDI Events 0.1.8
 * 
 * @author Mikael Jorhult 
 * @license https://github.com/mikaeljorhult/midi-events MIT
*/
define("PubSub",[],function(){var e={};return{trigger:function(t,n,r){if(e[t]){var i=e[t],s=i.length-1;for(s;s>=0;s-=1)i[s].apply(r||this,n||[])}},on:function(t,n){return e[t]||(e[t]=[]),e[t].push(n),[t,n]},off:function(t,n){var r=t[0],i=e[r].length-1;if(e[r])for(i;i>=0;i-=1)e[r][i]===t[1]&&(e[r].splice(e[r][i],1),n&&delete e[r])}}}),define("Device",["require","PubSub"],function(e,t){function n(t,n){var r=e("midi-events");this.inputs=r.inputs(t),this.outputs=r.outputs(n)}return n.prototype.send=function(t,n){var r=e("midi-events");return r.send(this.outputs,t,n),this},n.prototype.listen=function(e){var n,r=this.inputs.length;for(n=0;n<r;n++)t.on("id:"+this.inputs[n].id,e);return this},n.prototype.unlisten=function(e){var n,r=this.inputs.length;for(n=0;n<r;n++)t.off(t.on("port:"+this.inputs[n],e));return this},n}),define("midi-events",["Device","PubSub"],function(e,t){function a(e){i.then(function(n){s=n,o=s.inputs(),u=s.outputs(),t.trigger("connected"),typeof e=="function"&&e()},g)}function f(e){return d("input",e)}function l(e){return d("output",e)}function c(e){var t=f(e),n=t.length,r;for(r=0;r<n;r++)t[r].addEventListener("midimessage",p,!1)}function h(e){var t=f(e),n=t.length,r;for(r=0;r<n;r++)t[r].removeEventListener("midimessage",p,!1)}function p(e){var n={port:v(e.target.id),type:"unsupported",channel:0};n.note=e.data[1],n.value=e.data[2],n.originalEvent=e;switch(!0){case e.data[0]<128:break;case e.data[0]<144||e.data[0]<160&&e.data[2]===0:n.type="noteoff",n.channel=e.data[0]-(e.data[0]>143?144:128);break;case e.data[0]<160:n.type="noteon",n.channel=e.data[0]-144;break;case e.data[0]<176:n.type="polyphonic-aftertouch",n.channel=e.data[0]-160;break;case e.data[0]<192:n.type="controller",n.channel=e.data[0]-176;break;case e.data[0]<208:n.type="controlchange",n.channel=e.data[0]-192,n.note=0,n.value=e.data[1];break;case e.data[0]<224:n.type="aftertouch",n.channel=e.data[0]-208,n.note=0,n.value=e.data[1]}t.trigger("message",[n]),t.trigger(n.type,[n]),t.trigger(n.type+":"+n.note,[n]),t.trigger("port:"+n.port,[n]),t.trigger("id:"+e.target.id,[n])}function d(e,t){var n=e==="output"?u:o,r=[],i=[],s;if(typeof t=="number")t<n.length&&i.push(n[t]);else if(Object.prototype.toString.call(t).match(/^\[object MIDI(Input|Output)]$/))i.push(t);else if(Object.prototype.toString.call(t)==="[object Array]")r=t;else if(typeof t=="string"&&t.toLowerCase()==="all"||t===undefined)i=n;if(r.length>0)for(s=0;s<r.length;s++)typeof r[s]=="number"?r[s]<n.length&&i.push(n[t]):Object.prototype.toString.call(r[s]).match(/^\[object MIDI(Input|Output)]$/)&&i.push(t);return i}function v(e){var t,n=o.length;for(t=0;t<n;t++)if(o[t].id===e)return t}function m(e,t,n){var r=l(e),i,s;Object.prototype.toString.call(t)!=="[object Array]"&&(t=[t]);for(i=0;i<t.length;i++)switch(t[i].type){case"noteon":t[i].type=144;break;case"noteoff":t[i].type=128}for(i=0;i<r.length;i++)for(s=0;s<t.length;s++)r[i].send([t[s].type,t[s].note,t[s].value],n===undefined?window.performance.now():n)}function g(e){console.log(e)}function y(t,n){return new e(t,n)}var n={},r=!!window.navigator.requestMIDIAccess,i=r?navigator.requestMIDIAccess():null,s=null,o=[],u=[];return n={supported:r,connect:a,inputs:f,outputs:l,listen:c,unlisten:h,send:m,createDevice:y,on:t.on,off:t.off},n});