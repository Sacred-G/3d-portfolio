import { Html } from '@react-three/drei'

const Start = ({ handleStart }: { handleStart: () => void }) => {
	return (
		<Html center position={[0, 50, 0]}>
			<div className="bg-black font-light w-screen h-screen flex flex-col justify-center items-center gap-8">
			<div className="flex flex-col items-center gap-3 text-center px-6">
				<p className="text-yellow-400 font-mono md:text-[20px] text-[15px]">
					⚠️ Music plays automatically — turn down your volume before starting!
				</p>
				<p className="text-gray-400 font-mono md:text-[16px] text-[13px] max-w-[500px]">
					This is my first 3D project as a developer using 3D rendering. Hope you enjoy the experience!
				</p>
			</div>
			<button
				type="button"
				onClick={handleStart}
				className="hover:text-black font-mono hover:bg-primary border-[2px] rounded-[20px] border-primary text-primary md:w-[200px] w-[150px] md:text-[50px] text-[40px] flex items-center justify-center"
			>
				Start
			</button>
		</div>
		</Html>
	)
}

export default Start
