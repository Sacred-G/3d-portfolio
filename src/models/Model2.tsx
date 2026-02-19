import { useRef, useEffect, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Group, MeshStandardMaterial } from 'three'

import build2Model from '../assets/3d/build2.glb'
import buildModel from '../assets/3d/build.glb'
import { screens } from '../constants'

// Preload both models
useGLTF.preload(build2Model)
useGLTF.preload(buildModel)

const Model2 = ({
	funcs,
	ind,
	ghosted,
}: {
	funcs: any
	ind: { pic1: number; pic2: number; pic3: number; pic4: number }
	ghosted: boolean
}) => {
	const [useFallback, setUseFallback] = useState(false)
	
	// Try build2.glb first, fallback to build.glb if it fails
	const modelPath = useFallback ? buildModel : build2Model
	const { nodes, materials, animations } = useGLTF(modelPath) as any
	const group = useRef<Group>(null)
	const { actions } = useAnimations(animations, group)

	// Disable emission from ALL materials to remove any glow
	useEffect(() => {
		Object.values(materials).forEach((material: any) => {
			if (material.emissive) {
				material.emissive.setHex(0x000000) // Set emissive to black
				material.emissiveIntensity = 0 // Disable emission
			}
		})
	}, [materials])

	// Debug: Log what's loaded
	useEffect(() => {
		console.log('Model2 loaded:', {
			modelPath: useFallback ? 'build.glb (fallback)' : 'build2.glb',
			nodeCount: Object.keys(nodes).length,
			materialCount: Object.keys(materials).length,
			animationCount: animations.length,
			nodes: Object.keys(nodes),
			materials: Object.keys(materials)
		})
		
		// If no nodes loaded, try fallback
		if (!useFallback && (!nodes || Object.keys(nodes).length === 0)) {
			console.warn('Model2: build2.glb failed to load, switching to fallback')
			setUseFallback(true)
		}
	}, [nodes, materials, animations, useFallback])

	// Error handling for missing data
	if (!nodes || Object.keys(nodes).length === 0) {
		if (!useFallback) {
			return null // Trying fallback
		} else {
			console.error('Model2: Both models failed to load')
			return null
		}
	}

	// Helper function to safely check if node exists (only for name-related nodes)
	const safeNode = (nodeName: string) => {
		return nodes[nodeName] && nodes[nodeName].geometry
	}

	useEffect(() => {
		if (!ghosted) {
			if (actions['neom_anthenaAction']) actions['neom_anthenaAction'].play()
			if (actions['bcubeAction']) actions['bcubeAction'].play()
			if (actions['pcubeAction']) actions['pcubeAction'].play()
			if (actions['bfanAction']) actions['bfanAction'].play()
			if (actions['pfanAction']) actions['pfanAction'].play()
			if (actions['holo2Action']) actions['holo2Action'].play()
		} else {
			if (actions['neom_anthenaAction']) actions['neom_anthenaAction'].stop()
			if (actions['bcubeAction']) actions['bcubeAction'].stop()
			if (actions['pcubeAction']) actions['pcubeAction'].stop()
			if (actions['bfanAction']) actions['bfanAction'].stop()
			if (actions['pfanAction']) actions['pfanAction'].stop()
			if (actions['holo2Action']) actions['holo2Action'].stop()
		}
	}, [ghosted, actions])

	return (
		<group ref={group} dispose={null}>
			<group name="Scene" onClick={(ev) => ev.stopPropagation()}>
				{/* Disabled arcade_neon to test for purple glow source */}
				{/* <mesh
					name="arcade_neon"
					onClick={() => funcs.changeScene(3)}
					geometry={nodes.arcade_neon.geometry}
					material={materials.light_purple}
				/> */}
				<mesh
					name="arcade_screen"
					onClick={() => funcs.changeScene(3)}
					geometry={nodes.arcade_screen.geometry}
					material={ghosted ? materials['screen_gp'] : materials['screenm.005']}
				/>
				<mesh
					name="bcube"
					geometry={nodes.bcube.geometry}
					material={materials['light_bcube.005']}
					position={[-9.8, 13.797, 7.029]}
					rotation={[0, -1.571, 0]}
					scale={[0.301, 1.262, 5.648]}
				/>
				<group
					name="bfan"
					position={[-0.5, 12.137, -9.429]}
					rotation={[0, 0, 0.106]}
					scale={[0.029, 0.005, 0.012]}
				>
					<mesh
						name="Cube019"
						geometry={nodes.Cube019.geometry}
						material={materials['light_bfan.005']}
					/>
					<mesh
						name="Cube019_1"
						geometry={nodes.Cube019_1.geometry}
						material={materials['fan2_gray.005']}
					/>
				</group>
				<mesh
					name="blener"
					geometry={nodes.blener.geometry}
					material={materials.light_blue}
				/>
				<mesh
					name="cpp"
					geometry={nodes.cpp.geometry}
					material={materials.light_blue}
				/>
				<mesh
					name="Electric_Guitar_Cube001"
					onClick={funcs.riff}
					geometry={nodes.Electric_Guitar_Cube001.geometry}
					material={materials.light_purple}
				/>
				<group name="frame21" onClick={() => funcs.changeScene(1)}>
					<mesh
						name="Cube003"
						geometry={nodes.Cube003.geometry}
						material={materials['light_sign_green.005']}
					/>
					<mesh
						name="Cube003_1"
						geometry={nodes.Cube003_1.geometry}
						material={materials['light_text.001']}
					/>
				</group>
				<group
					name="frame31"
					onClick={(ev) => {
						ev.stopPropagation()
						funcs.changeScene(2)
					}}
				>
					<mesh
						name="Cube004"
						geometry={nodes.Cube004.geometry}
						material={materials['light_sign_pink.005']}
					/>
					<mesh
						name="Cube004_1"
						geometry={nodes.Cube004_1.geometry}
						material={materials['light_text.001']}
					/>
				</group>
				<group name="frame41" onClick={() => funcs.changeScene(4)}>
					<mesh
						name="Cube020"
						geometry={nodes.Cube020.geometry}
						material={materials['light_sign_blue.005']}
					/>
					<mesh
						name="Cube020_1"
						geometry={nodes.Cube020_1.geometry}
						material={materials['light_text.001']}
					/>
				</group>
				<group name="frame51" onClick={() => funcs.changeScene(3)}>
					<mesh
						name="Cube034"
						geometry={nodes.Cube034.geometry}
						material={materials['light_sign_orange.005']}
					/>
					<mesh
						name="Cube034_1"
						geometry={nodes.Cube034_1.geometry}
						material={materials['light_text.001']}
					/>
				</group>
				{/* Disabled holo2 to test for purple glow source */}
				{/* <mesh
					name="holo2"
					geometry={nodes.holo2.geometry}
					material={
						ghosted ? materials['light_purple'] : materials['light_holo']
					}
					position={[-0.49, 0, -0.3]}
				/> */}
				{/* Disabled left_btn to test for purple glow source */}
				{/* <mesh
					name="left_btn"
					onClick={() => funcs.changeMusic(-1)}
					geometry={nodes.left_btn.geometry}
					material={materials.light_purple}
				/> */}
				{/* Disabled neom_anthena to test for purple glow source */}
				{/* <mesh
					name="neom_anthena"
					geometry={nodes.neom_anthena.geometry}
					material={
						ghosted ? materials['light_purple'] : materials['light_blue']
					}
					position={[2.876, 14.748, -7.175]}
					scale={[0.483, 0.137, 0.483]}
				/> */}
				{/* Disabled neon_power to test for purple glow source */}
				{/* <mesh
					name="neon_power"
					geometry={nodes.neon_power.geometry}
					material={
						ghosted ? materials['light_purple'] : materials['light_blue']
					}
				/> */}
				{/* Disabled neon_proj to test for purple glow source */}
				{/* <mesh
					name="neon_proj"
					onClick={funcs.holoClick}
					geometry={nodes.neon_proj.geometry}
					material={
						ghosted ? materials['light_purple'] : materials['light_blue']
					}
				/> */}
				<mesh
					name="neon_tv"
					onClick={() => funcs.changeScene(1)}
					geometry={nodes.neon_tv.geometry}
					material={materials['light_blue.001']}
				/>
				<mesh
					name="neon_vending"
					onClick={() => funcs.changeScene(2)}
					geometry={nodes.neon_vending.geometry}
					material={materials.light_blue}
				/>
				<mesh
					name="neon_welcome"
					geometry={nodes.neon_welcome.geometry}
					material={materials.light_blue}
				/>
				<mesh
					name="pcube"
					geometry={nodes.pcube.geometry}
					material={materials['light_pcube.005']}
					position={[-8.998, 13.883, 7.029]}
					rotation={[0, -1.571, 0]}
					scale={[0.301, 1.262, 5.648]}
				/>
				<group
					name="pfan"
					position={[-8.688, 12.137, -0.529]}
					rotation={[-0.106, 0, 0]}
					scale={[0.029, 0.005, 0.012]}
				>
					<mesh
						name="Cube024"
						geometry={nodes.Cube024.geometry}
						material={materials.light_purple}
					/>
					<mesh
						name="Cube024_1"
						geometry={nodes.Cube024_1.geometry}
						material={materials['fan2_gray.005']}
					/>
				</group>
				<mesh
					name="pic_sign_screen"
					onClick={() => funcs.changePic(1)}
					geometry={nodes.pic_sign_screen.geometry}
					material={materials[screens.s1[ind.pic1]]}
				/>
				<mesh
					name="pic_sign_screen1"
					onClick={() => funcs.changePic(2)}
					geometry={nodes.pic_sign_screen1.geometry}
					material={materials[screens.s2[ind.pic2]]}
				/>
				<mesh
					name="pic_sign_screen2"
					onClick={() => funcs.changePic(3)}
					geometry={nodes.pic_sign_screen2.geometry}
					material={materials[screens.s3[ind.pic3]]}
				/>
				<mesh
					name="pic_sign_screen3"
					onClick={() => funcs.changePic(4)}
					geometry={nodes.pic_sign_screen3.geometry}
					material={materials[screens.s4[ind.pic4]]}
				/>
				<mesh
					name="python"
					geometry={nodes.python.geometry}
					material={materials.light_blue}
				/>
				<mesh
					name="react"
					geometry={nodes.react.geometry}
					material={materials.light_blue}
				/>
				{/* Disabled right_btn to test for purple glow source */}
				{/* <mesh
					name="right_btn"
					onClick={() => funcs.changeMusic(1)}
					geometry={nodes.right_btn.geometry}
					material={materials.light_purple}
				/> */}
				<mesh
					name="screen_bill"
					geometry={nodes.screen_bill.geometry}
					material={ghosted ? materials['screen_gp2'] : materials['screen_pic']}
				/>
								{/* Disabled stop_btn to test for purple glow source */}
				{/* <mesh
					name="stop_btn"
					onClick={() => funcs.changeMusic(0)}
					geometry={nodes.stop_btn.geometry}
					material={materials.light_purple}
				/> */}
				<mesh
					name="tv_screen"
					onClick={() => funcs.changeScene(1)}
					geometry={nodes.tv_screen.geometry}
					material={ghosted ? materials['screen_gb'] : materials['screena.005']}
				/>
				<mesh
					name="vending_screen"
					onClick={() => funcs.changeScene(2)}
					geometry={nodes.vending_screen.geometry}
					material={ghosted ? materials['screen21'] : materials['screenp.005']}
				/>
				{safeNode('titles') && (
					<mesh
						name="titles"
						geometry={nodes.titles.geometry}
						material={materials['light_text.005']}
					/>
				)}
				{safeNode('drag_text') && (
					<mesh
						name="drag_text"
						geometry={nodes.drag_text.geometry}
						material={materials['shader_white.006']}
					/>
				)}
				<mesh
					name="kl"
					geometry={nodes.kl.geometry}
					material={materials['light_ktchen.006']}
				/>
				<mesh
					name="kl001"
					geometry={nodes.kl001.geometry}
					material={materials['light_ktchen.006']}
				/>
				<mesh
					name="kl002"
					geometry={nodes.kl002.geometry}
					material={materials['light_ktchen.006']}
				/>
				<mesh
					name="kl003"
					geometry={nodes.kl003.geometry}
					material={materials['light_ktchen.006']}
				/>
				<mesh
					name="kl004"
					geometry={nodes.kl004.geometry}
					material={materials['light_ktchen.006']}
				/>
				<group name="neon_shows_left" onClick={() => funcs.changeScene(2)}>
					<mesh
						name="mesh1848869498002"
						geometry={nodes.mesh1848869498002.geometry}
						material={materials['mrrobot.005']}
					/>
					<mesh
						name="mesh1848869498002_1"
						geometry={nodes.mesh1848869498002_1.geometry}
						material={materials['mindhunter.005']}
					/>
					<mesh
						name="mesh1848869498002_2"
						geometry={nodes.mesh1848869498002_2.geometry}
						material={materials['severance.005']}
					/>
				</group>
				<group name="neon_shows_right" onClick={() => funcs.changeScene(2)}>
					<mesh
						name="mesh1848869498003"
						geometry={nodes.mesh1848869498003.geometry}
						material={materials['blackmirror.005']}
					/>
					<mesh
						name="mesh1848869498003_1"
						geometry={nodes.mesh1848869498003_1.geometry}
						material={materials['theoffice.005']}
					/>
					<mesh
						name="mesh1848869498003_2"
						geometry={nodes.mesh1848869498003_2.geometry}
						material={materials['truedet.005']}
					/>
				</group>
				<group name="neon_burger">
					<mesh
						name="bread001"
						geometry={nodes.bread001.geometry}
						material={materials['light_bread_orange.005']}
					/>
					<mesh
						name="bread001_1"
						geometry={nodes.bread001_1.geometry}
						material={materials['light_bread_middle.005']}
					/>
				</group>
			</group>
		</group>
	)
}

export default Model2
