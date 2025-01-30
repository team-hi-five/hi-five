function Element3D(){

        return(
            <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            <mesh position={[0, 0.2, 0]} rotation={[0, 45 * Math.PI / 180, 0]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshPhysicalMaterial 
                    color="#e67e22"
                    metalness={0.1}
                    roughness={0.2}
                    clearcoat={0.8}
                    clearcoatRoughness={0.2}
                />
            </mesh>

            </>
        )
}
export default Element3D