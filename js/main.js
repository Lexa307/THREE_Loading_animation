const THREE = require('three');
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.001, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
let geometry = new THREE.RingGeometry( 4, 5, 64, 32 );
const lineGeometry = new THREE.EdgesGeometry(geometry, 15);
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 0, 900 );
// controls.update();
// geometry = new THREE.BufferGeometry().fromGeometry( geometry );
let numFaces = lineGeometry.attributes.position.count / 3;
let displacement = new Float32Array( numFaces * 9);
for ( let f = 0; f < numFaces; f ++ ) {
    let index = 9 * f;
    let d = 10 * (  0.5 - Math.random() );
    for ( let i = 0; i < 3; i ++ ) {
        displacement[ index + ( 3 * i )     ] = d;
        displacement[ index + ( 3 * i ) + 1 ] = d;
        displacement[ index + ( 3 * i ) + 2 ] = d;
    }
}

let offsets = [];
for (let i = 0; i < (lineGeometry.attributes.position.count * 3); i+= 9) {
    let rand = Math.random();
    offsets.push(lineGeometry.attributes.position.array[i], lineGeometry.attributes.position.array[i], lineGeometry.attributes.position.array[i]);
}

lineGeometry.setAttribute( 'displacement', new THREE.Float32BufferAttribute( displacement, 3 ) );

const material = new THREE.ShaderMaterial( {

	uniforms: {

		time: { value: 1.0 },
		resolution: { value: new THREE.Vector2() }

	},

    vertexShader: `
    uniform float time;
    attribute vec3 displacement;
    void main() {
        // gl_Position = projectionMatrix * modelViewMatrix * vec4( position  * clamp(fract(cos(time * displacement.z)),  0.1,  3.14 ) , 1.0 );
        //dist = distance( projectionMatrix * modelViewMatrix * vec4( position  *  abs(cos(time * displacement.y) ), 1.0 ), vec4(0., 0., 0., 1.));
        // projectionMatrix * modelViewMatrix * vec4( position  * clamp(tan(time * displacement.z),  0.1,  3.14 * displacement.x ) , 1.0 ); //wow in center
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position  * clamp(sin(time * displacement.z),  0.1,  3.14 ) , 1.0 );
    }
`,

    fragmentShader: 
    `
    void main() {
        gl_FragColor = vec4( 0.9, 0.9, 1.0, 1.0 );
    }`

} );
const line = new THREE.LineSegments( lineGeometry, material );

scene.add(line );

camera.position.z = 5;
window.addEventListener( 'resize', onWindowResize );

const animate = function () {
    requestAnimationFrame( animate );

    // line.rotation.x += 0.01;
    line.rotation.z += 0.01;
    material.uniforms.time.value += 0.005
    renderer.render( scene, camera );
};

animate();

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    controls.update();
    renderer.setSize( window.innerWidth, window.innerHeight );

}