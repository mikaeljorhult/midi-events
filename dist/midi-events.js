/*!
 * MIDI Events 0.1.0
 * 
 * @author Mikael Jorhult 
 * @license https://github.com/mikaeljorhult/midi-events MIT
*/
define("midi-events",[],function(){function i(r){t.then(function(t){n=t,e.trigger("connected"),typeof r=="function"&&r()},h)}function s(){return n.inputs()}function o(){return n.outputs()}function u(e){f(e,l)}function a(e){f(e,function(){})}function f(e,t){var n=c(e),r=n.length,i;for(i=0;i<r;i++)n[i].onmidimessage=t}function l(e){console.log(e)}function c(e){var t=[],n=[],r=s(),i=r.length,o;typeof e=="number"?t=[e]:Object.prototype.toString.call(e)==="[object Array]"?t=e:typeof e=="string"&&e.toLowerCase()==="all"&&(n=s());if(t.length>0)for(o=0;o<i;o++)typeof t[o]=="number"&&t[o]<i&&n.push(r[t[o]]);return n}function h(e){console.log(e)}var e={},t=navigator.requestMIDIAccess(),n=null,r={};return e={trigger:function(e,t,n){if(r[e]){var i=r[e],s=i.length-1;for(s;s>=0;s-=1)i[s].apply(n||this,t||[])}},on:function(e,t){return r[e]||(r[e]=[]),r[e].push(t),[e,t]},off:function(e,t){var n=e[0],i=r[n].length-1;if(r[n])for(i;i>=0;i-=1)r[n][i]===e[1]&&(r[n].splice(r[n][i],1),t&&delete r[n])}},e.connect=i,e.inputs=s,e.outputs=o,e.listen=u,e.unlisten=a,e});