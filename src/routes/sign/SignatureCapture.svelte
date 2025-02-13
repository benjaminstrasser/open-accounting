<script lang="ts">
	let videoRef: HTMLVideoElement;
	let canvasRef: HTMLCanvasElement;

	const startCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			videoRef.srcObject = stream;
			videoRef.play();
		} catch (error) {
			console.error('Error accessing camera:', error);
		}
	};

	const takePhoto = () => {
		if (videoRef && canvasRef) {
			const context = canvasRef.getContext('2d');
			canvasRef.width = videoRef.videoWidth;
			canvasRef.height = videoRef.videoHeight;
			context?.drawImage(videoRef, 0, 0);
		}
	};
</script>

<main>
	<button on:click={startCamera}>Start Camera</button>
	<!-- svelte-ignore a11y_media_has_caption -->
	<video bind:this={videoRef} autoplay></video>
	<canvas bind:this={canvasRef}></canvas>
	<button on:click={takePhoto}>Take Photo</button>
</main>

<style>
	video {
		max-width: 100%;
		margin-bottom: 20px;
	}
</style>
