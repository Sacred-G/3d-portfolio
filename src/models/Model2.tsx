import { useRef, useEffect, useState, useCallback } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Group } from 'three'

import build2Model from '../assets/3d/build2.glb'
import buildModel from '../assets/3d/build.glb'
import { screens } from '../constants'
import { usePhotoMaterials } from '../hooks/usePhotoMaterials'

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
	
	// Load both models and choose which to use
	const { nodes: nodes2, materials: materials2, animations: animations2 } = useGLTF(build2Model) as any
	const { nodes: nodes1, materials: materials1, animations: animations1 } = useGLTF(buildModel) as any
	
	// Determine which model data to use based on fallback state
	const nodes = useFallback ? nodes1 : nodes2
	const materials = useFallback ? materials1 : materials2
	const animations = useFallback ? animations1 : animations2
	const group = useRef<Group>(null)
	const { actions } = useAnimations(animations, group)
	const hasNodes = Boolean(nodes && Object.keys(nodes).length > 0)
	const hideNameSign = false

	// Helper function to safely check if node exists
	const safeNode = (nodeName: string) => {
		return nodes?.[nodeName]?.geometry !== undefined
	}

	// Stop pointer events from bubbling up to the canvas so OrbitControls / Html
	// overlays don't enter drag mode when these screens are clicked.
	const makeClickHandler = useCallback((fn: () => void) => ({
		onPointerDown: (e: any) => { e.stopPropagation() },
		onPointerUp:   (e: any) => { e.stopPropagation() },
		onClick:       (e: any) => { e.stopPropagation(); fn() },
	}), [])

	// Replace baked photo materials with custom images
	const { textureMap } = usePhotoMaterials(materials)

	// Disable emission from specific glow materials to remove purple glow
	// Remove name_sign completely, keep burger_sign
	useEffect(() => {
		if (!hasNodes || !materials) return

		const glowMaterials = ['light_purple', 'light_burger_red.005']
		
		Object.values(materials).forEach((material: any) => {
			if (material.emissive && glowMaterials.some(glowMat => material.name?.includes(glowMat))) {
				material.emissive.setHex(0x000000) // Set emissive to black
				material.emissiveIntensity = 0 // Disable emission
			}
		})

		const signMat = materials['Material.003'] ?? materials['material.003']
		if (signMat?.emissive) {
			signMat.emissive.setHex(0xffffff)
			signMat.emissiveIntensity = Math.max(signMat.emissiveIntensity ?? 0, 5)
			signMat.toneMapped = false
		}
		
		// Completely remove name_sign
		const nameSignNode = nodes?.name_sign ?? nodes?.Name_sign
		if (nameSignNode) {
			nameSignNode.visible = !hideNameSign
		}
		
		// Restore burger_sign with proper lighting
		if (nodes.burger_sign) {
			nodes.burger_sign.visible = true
			if (materials['light_burger_red.005']) {
				materials['light_burger_red.005'].emissive.setHex(0xff4444) // Red emissive
				materials['light_burger_red.005'].emissiveIntensity = 0.8 // Bright glow
				materials['light_burger_red.005'].color.setHex(0xff6666) // Red color
			}
		}
	}, [materials, nodes, hasNodes, hideNameSign])

	// Debug: Log what's loaded and handle fallback logic
	useEffect(() => {
		if (!useFallback && (!nodes2 || Object.keys(nodes2).length === 0)) {
			console.warn('Model2: build2.glb failed to load, switching to fallback')
			setUseFallback(true)
			return
		}

		if (!hasNodes || !materials || !animations) return

		console.log('Model2 loaded:', {
			modelPath: useFallback ? 'build.glb (fallback)' : 'build2.glb',
			nodeCount: Object.keys(nodes).length,
			materialCount: Object.keys(materials).length,
			animationCount: animations.length,
			nodes: Object.keys(nodes),
			materials: Object.keys(materials)
		})
		
		// Check for name_sign related nodes
		const nameSignNodes = Object.keys(nodes).filter(nodeName => 
			nodeName.toLowerCase().includes('name') || nodeName.toLowerCase().includes('sign')
		)
		console.log('Name/Sign related nodes:', nameSignNodes)
	}, [nodes2, nodes, materials, animations, useFallback, hasNodes])

	const screenNodeCandidates: Record<string, string[]> = {
		pic1: ['pic_sign_screen'],
		pic2: ['pic_sign_screen1', 'pic_sign_screen1001'],
		pic3: ['pic_sign_screen2', 'pic_sign_screen2001'],
		pic4: ['pic_sign_screen3'],
	}

	const missingRequiredScreenNodes = Object.entries(screenNodeCandidates)
		.filter(([, candidates]) => !candidates.some((name) => nodes?.[name]?.geometry))
		.map(([key]) => key)

	const resolveScreenNode = (candidates: string[]) => {
		return candidates
			.map((name) => nodes?.[name])
			.find((node: any) => Boolean(node?.geometry))
	}

	const signNodeCandidates = [
		'name_sign',
		'Name_sign',
		'nameSign',
		'NameSign',
		'Text.001',
		'Text001',
		'Text',
		'text.001',
		'text001',
		'text',
	]

	const resolveSignNode = () => {
		const direct = signNodeCandidates
			.map((name) => nodes?.[name])
			.find((node: any) => Boolean(node?.geometry))
		if (direct) return direct

		const keys = Object.keys(nodes ?? {})
		const lcKeyByKey = new Map(keys.map((k) => [k.toLowerCase(), k]))
		const matchKey = signNodeCandidates
			.map((n) => lcKeyByKey.get(n.toLowerCase()))
			.find(Boolean)

		return matchKey ? nodes[matchKey] : undefined
	}

	useEffect(() => {
		if (!useFallback && missingRequiredScreenNodes.length > 0) {
			console.warn(
				'Model2: Missing required screen nodes in build2.glb, switching to fallback build.glb',
				missingRequiredScreenNodes
			)
			setUseFallback(true)
		}
	}, [useFallback, missingRequiredScreenNodes.length])

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

	// Error handling for missing data (must be after hooks)
	if (!hasNodes) {
		if (!useFallback) {
			return null
		}
		console.error('Model2: Both models failed to load')
		return null
	}

	if (missingRequiredScreenNodes.length > 0 && !useFallback) {
		return null
	}

	return (
		<group ref={group} dispose={null}>
			<group name="Scene" onClick={(ev) => ev.stopPropagation()}>
				<mesh
					name="arcade_neon"
					onClick={() => funcs.changeScene(3)}
					geometry={nodes.arcade_neon.geometry}
					material={materials.light_purple}
				/>
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
				<mesh
					name="holo2"
					geometry={nodes.holo2.geometry}
					material={
						ghosted ? materials['light_purple'] : materials['light_holo']
					}
					position={[-0.49, 0, -0.3]}
				/>
				<mesh
					name="left_btn"
					onClick={() => funcs.changeMusic(-1)}
					geometry={nodes.left_btn.geometry}
					material={materials.light_purple}
				/>
				<mesh
					name="neom_anthena"
					geometry={nodes.neom_anthena.geometry}
					material={
						ghosted ? materials['light_purple'] : materials['light_blue']
					}
					position={[2.876, 14.748, -7.175]}
					scale={[0.483, 0.137, 0.483]}
				/>
				<mesh
					name="neon_power"
					geometry={nodes.neon_power.geometry}
					material={
						ghosted ? materials['light_purple'] : materials['light_blue']
					}
				/>
				<mesh
					name="neon_proj"
					onClick={funcs.holoClick}
					geometry={nodes.neon_proj.geometry}
					material={
						ghosted ? materials['light_purple'] : materials['light_blue']
					}
				/>
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
				{(() => {
					const node = resolveScreenNode(screenNodeCandidates.pic1)
					if (!node) return null
					return (
						<mesh
							name="pic_sign_screen"
							{...makeClickHandler(() => funcs.changePic(1))}
							geometry={node.geometry}
						>
							<meshStandardMaterial
								map={textureMap[screens.s1[ind.pic1]] ?? null}
								emissiveMap={textureMap[screens.s1[ind.pic1]] ?? null}
								emissive={[1, 1, 1]}
								emissiveIntensity={0.3}
							/>
						</mesh>
					)
				})()}
				{(() => {
					const node = resolveScreenNode(screenNodeCandidates.pic2)
					if (!node) return null
					return (
						<mesh
							name="pic_sign_screen1"
							{...makeClickHandler(() => funcs.changePic(2))}
							geometry={node.geometry}
						>
							<meshStandardMaterial
								map={textureMap[screens.s2[ind.pic2]] ?? null}
								emissiveMap={textureMap[screens.s2[ind.pic2]] ?? null}
								emissive={[1, 1, 1]}
								emissiveIntensity={0.3}
							/>
						</mesh>
					)
				})()}
				{(() => {
					const node = resolveScreenNode(screenNodeCandidates.pic3)
					if (!node) return null
					return (
						<mesh
							name="pic_sign_screen2"
							{...makeClickHandler(() => funcs.changePic(3))}
							geometry={node.geometry}
						>
							<meshStandardMaterial
								map={textureMap[screens.s3[ind.pic3]] ?? null}
								emissiveMap={textureMap[screens.s3[ind.pic3]] ?? null}
								emissive={[1, 1, 1]}
								emissiveIntensity={0.3}
							/>
						</mesh>
					)
				})()}
				{(() => {
					const node = resolveScreenNode(screenNodeCandidates.pic4)
					if (!node) return null
					return (
						<mesh
							name="pic_sign_screen3"
							{...makeClickHandler(() => funcs.changePic(4))}
							geometry={node.geometry}
						>
							<meshStandardMaterial
								map={textureMap[screens.s4[ind.pic4]] ?? null}
								emissiveMap={textureMap[screens.s4[ind.pic4]] ?? null}
								emissive={[1, 1, 1]}
								emissiveIntensity={0.3}
							/>
						</mesh>
					)
				})()}
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
				<mesh
					name="right_btn"
					onClick={() => funcs.changeMusic(1)}
					geometry={nodes.right_btn.geometry}
					material={materials.light_purple}
				/>
				<mesh
					name="screen_bill"
					geometry={nodes.screen_bill.geometry}
					material={ghosted ? materials['screen_gp2'] : materials['screen_pic']}
				/>
								<mesh
					name="stop_btn"
					onClick={() => funcs.changeMusic(0)}
					geometry={nodes.stop_btn.geometry}
					material={materials.light_purple}
				/>
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
				{/* Burger sign restored */}
				{safeNode('burger_sign') && (
					<mesh
						name="burger_sign"
						geometry={nodes.burger_sign.geometry}
						material={nodes.burger_sign.material ?? materials['light_burger_red.005']}
					/>
				)}
				{(() => {
					const node = resolveSignNode()
					if (!node) return null
					if (node?.name === 'burger_sign') return null
					// Use primitive so we preserve transforms from the GLB (position/rotation/scale)
					node.visible = true
					return <primitive object={node} />
				})()}
			</group>
		</group>
	)
}

export default Model2
