import * as THREE from 'three'


// 장면
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// 카메라라
const camera = new THREE.PerspectiveCamera(
  90,                                       // 수직 방향으로 보이는 시야각
  window.innerWidth / window.innerHeight,   // 가로/세로 비율율
  0.1,                                      // 카메라에서부터 얼마나 가까이 있는 것 까지 렌더링
  1000                                      // 얼마나 머리있는 것까지 렌더링링
);
camera.position.set(0, 0, 3);

// 렌덜
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,      //아무것도 없는 공간은 투명하게
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//mesh
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  cube.rotation.y += 0.01;
}
animate();

// 반응형 처리
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);