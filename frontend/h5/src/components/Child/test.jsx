import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import PropTypes from 'prop-types'

function Balloon({ position, color }){
    // 3D 객체(메시)에 대한 참조 저장
    const meshRef = useRef()
    // 불필요한 계산 방지(메모이제이션)
    const initialPosition = useMemo(() => new THREE.Vector3(...position), [position])
    // 마우스와 상호작용
    const velocity = useRef(new THREE.Vector3(0, 0, 0))

    // 화면이 갱신될때마다 호출되는 함수
    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        
        // 자연스러운 부유 효과
        meshRef.current.position.y = initialPosition.y + Math.sin(time * 0.5 + position[0]) * 0.3
        meshRef.current.position.x = initialPosition.x + Math.sin(time * 0.3 + position[2]) * 0.2
        meshRef.current.position.z = initialPosition.z + Math.cos(time * 0.4 + position[1]) * 0.2
        
        // 마우스와의 상호작용으로 인한 움직임 적용
        meshRef.current.position.add(velocity.current)
        velocity.current.multiplyScalar(0.95)
      })
      
      // 마우스 포인터가 객체에 오버될 때 호출
      const handlePointerOver = () => {
        // 마우스를 갖다 대면 위쪽으로 날아가는 효과
        velocity.current.set(
          (Math.random() - 0.5) * 0.6,
          Math.random() * 1 + 1,
          (Math.random() - 0.5) * 0.6
        )
      }
        return(
            <mesh
                ref={meshRef}
                position={position}
                onPointerOver={handlePointerOver}
                >
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshPhysicalMaterial
                    color={color}
                    metalness={0.1}
                    roughness={0.2}
                    clearcoat={0.8}
                    clearcoatRoughness={0.2}
                />
                </mesh>
        )
}
// position 과 color에 대한 propTypes 검사를 추가
Balloon.propTypes = {
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    color: PropTypes.string.isRequired,
}

function Element3D() {
    const balloons = useMemo(() => {
    const colors = ['#ff4757', '#ff6348', '#1e90ff', '#fffa65', '#ff4dff', '#ff6b81', '#01a9b4']
    return Array.from({ length: 12 }, (_, i) => ({
        position: [
        (Math.random() - 0.5) * 20, // x
        Math.random() * 8 + 2,      // y
        (Math.random() - 0.5) * 20  // z
        ],
        color: colors[i % colors.length]
    }))
    }, [])

    return (
    <>
        <OrbitControls />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        
        {balloons.map((balloon, index) => (
        <Balloon
            key={index}
            position={balloon.position}
            color={balloon.color}
        />
        ))}
    </>
    )
}
export default Element3D