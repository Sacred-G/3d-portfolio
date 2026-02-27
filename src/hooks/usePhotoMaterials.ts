import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import {
	photo1,
	photo2,
	photo3,
	photo4,
	photo5,
	photo6,
	photo7,
	photo8,
	// photo9,  // Temporarily disabled (1.8M - too large)
	photo10,
	// photo11, // Temporarily disabled (2.2M - too large)
	photo12,
	photo13,
} from '../assets/photos'

const photoTextures = {
	light_pic1: photo1,
	light_pic2: photo2,
	light_pic3: photo3,
	light_pic4: photo4,
	light_pic5: photo5,
	light_pic6: photo6,
	light_pic7: photo7,
	light_pic8: photo8,
	// light_pic9: photo9,  // Temporarily disabled
	light_pic10: photo10,
	// light_pic11: photo11, // Temporarily disabled
	light_pic12: photo12,
	light_pic13: photo13,
}

export const usePhotoMaterials = (materials: any) => {
	const photoMaterialRefs = useRef<Record<string, THREE.MeshStandardMaterial>>({})

	// Load all photo textures
	const textures = useTexture(Object.values(photoTextures))
	
	// Fix upside-down images
	Object.values(textures).forEach(texture => {
		texture.flipY = false
	})
	
	// Create texture map by material name
	const textureMap: Record<string, THREE.Texture> = {}
	Object.keys(photoTextures).forEach((key, index) => {
		textureMap[key] = textures[index]
	})

	useEffect(() => {
		if (!materials) return

		// Create new materials for each photo using loaded textures
		Object.entries(photoTextures).forEach(([matName, _]) => {
			const texture = textureMap[matName]
			if (texture && materials[matName]) {
				const originalMat = materials[matName] as THREE.MeshStandardMaterial
				
				// Directly override the material properties
				originalMat.map = texture
				originalMat.emissive = new THREE.Color(0xffffff)
				originalMat.emissiveMap = texture
				originalMat.emissiveIntensity = 0.3
				originalMat.needsUpdate = true
				
				// Mark as replaced
				photoMaterialRefs.current[matName] = originalMat
			}
		})

		// Re-apply drag prevention after materials load
		const preventDrag = (e: Event) => {
			e.preventDefault()
			return false
		}
		
		// Add multiple listeners to catch all drag events
		setTimeout(() => {
			document.addEventListener('dragstart', preventDrag)
			document.addEventListener('drag', preventDrag)
			document.addEventListener('dragend', preventDrag)
			document.addEventListener('dragover', preventDrag)
			document.addEventListener('drop', preventDrag)
		}, 100)

		return () => {
			document.removeEventListener('dragstart', preventDrag)
			document.removeEventListener('drag', preventDrag)
			document.removeEventListener('dragend', preventDrag)
			document.removeEventListener('dragover', preventDrag)
			document.removeEventListener('drop', preventDrag)
		}
	}, [materials, textureMap])

	return { photoMaterials: photoMaterialRefs.current, textureMap }
}
