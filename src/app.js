function Emotion(
		pupilIdleMinSize,
		eyelidsMinSpacing,
		pupilSize, 
		eyelidsSpacing, 
		eyelidsDesiredOffset,
		eyelidsChangeRate, 
		pupilChangeRate,
		eyelidsBehaviour, 
		pupilBehaviour
	) {
	this.pupilIdleMinSize = pupilIdleMinSize
	this.eyelidsMinSpacing = eyelidsMinSpacing

	this.pupilDesiredSize = pupilSize
	this.eyelidsDesiredSpacing = eyelidsSpacing
	this.eyelidsDesiredOffset = eyelidsDesiredOffset
	this.pupilChangeRate = pupilChangeRate
	this.eyelidsChangeRate = eyelidsChangeRate

	this.eyelidsBehaviour = eyelidsBehaviour
	this.pupilBehaviour = pupilBehaviour

	this.propagateEmotion = function (pupilFrame, pupilMin, eyelidsFrame, eyelidsMin, eyelidsOffMin, idle) {
		const eyeSpecs = {pupilSize: 0, eyelidsSpacing: 0}
		if (idle) {
			pupilMin = this.pupilIdleMinSize
			eyelidsMin = this.eyelidsMinSpacing
		}
		eyeSpecs.pupilSize = this.pupilBehaviour(
				pupilFrame,
				this.pupilDesiredSize,
				pupilMin
			)
		eyeSpecs.eyelidsSpacing = this.eyelidsBehaviour(
				eyelidsFrame,
				this.eyelidsDesiredSpacing,
				eyelidsMin
		)
		eyeSpecs.eyelidsOffset = this.eyelidsBehaviour(
				eyelidsFrame,
				this.eyelidsDesiredOffset,
				eyelidsOffMin
		)
		return eyeSpecs
	}
}

const changeFunctions = {
	easeInOut: (x, max, min) => {
		//if (x < max && x > min) {
			return ((Math.sin((x*3) - (Math.PI / 2)) + 1)/2) * (max - min) + min
		//}
		//if (x < min) return 0
		return max
	}
		
}

const emotions = {
	scared: new Emotion(
		6,
		550,
		6,
		600,
		0,
		0.1,
		0.1,
		changeFunctions.easeInOut,
		changeFunctions.easeInOut
	),
	happy: new Emotion(
		38,
		220,
		40,
		260,
		-140,
		0.07,
		0.02,
		changeFunctions.easeInOut,
		changeFunctions.easeInOut
	),
	tired: new Emotion(
		38,
		0,
		30,
		120,
		150,
		0.006,
		0.006,
		changeFunctions.easeInOut,
		changeFunctions.easeInOut
	),
	annoyed: new Emotion(
		38,
		110,
		30,
		120,
		120,
		0.006,
		0.006,
		changeFunctions.easeInOut,
		changeFunctions.easeInOut
	)
}

const eyeBckg = new Image()
eyeBckg.src = 'eye.png'
let timestamp = new Date().getTime() 
let cnv, ctx, eye
function renderFrame() {
	if (timestamp + 20 < new Date().getTime()) {
		timestamp = new Date().getTime()
		ctx.clearRect(0, 0, cnv.width, cnv.height)
		eye.render()
		//console.log(eye.pupilSize)
		eye.update()
		//console.log(eye.pupilSize)
		requestAnimationFrame(renderFrame)
	}
	requestAnimationFrame(renderFrame)
}


function init() {
	console.log('Initialization')
	cnv = document.getElementById('cnv')
	ctx = cnv.getContext('2d')
	const timestamp = new Date().getTime()

	eye = {
		pupilSize: 100,
		eyelidsSpacing: 50,
		eyelidsOffset: 0,
		emotion: emotions.happy,
		eyePic: eyeBckg,
		pupilsAnimFrame: 0,
		eyelidsAnimFrame: 0,
		startPupilSize: 10,
		startEyelidsSpacing: 0,
		startEyelidsOffset: 0,
		idle: false,
		changeEmotion(emotion) {
			this.startPupilSize = this.pupilSize
			this.startEyelidsSpacing = this.eyelidsSpacing
			this.startEyelidsOffset  = this.eyelidsOffset
			this.emotion = emotion
			this.pupilsAnimFrame = 0
			this.eyelidsAnimFrame = 0
			this.idle = false
		},
		update() {
			if (this.idle) {
				if (this.pupilsAnimFrame < 2){
					this.pupilsAnimFrame += this.emotion.pupilChangeRate / 4
				} else {
					this.pupilsAnimFrame = 0
				}
				if (this.eyelidsAnimFrame < 2){
					this.eyelidsAnimFrame += this.emotion.eyelidsChangeRate / 4
				} else {
					this.eyelidsAnimFrame = 0	
				}

					
			} else {
				if (this.pupilsAnimFrame < 1){
					this.pupilsAnimFrame += this.emotion.pupilChangeRate
				} else {
					this.pupilsAnimFrame = 1
				}
				if (this.eyelidsAnimFrame < 1){
					this.eyelidsAnimFrame += this.emotion.eyelidsChangeRate
				} else {
					this.eyelidsAnimFrame = 1
				}	
				if (this.eyelidsAnimFrame === 1 && this.pupilsAnimFrame === 1){
					this.idle = true
				}
			}


			const newState = this.emotion.propagateEmotion(this.pupilsAnimFrame, this.startPupilSize, this.eyelidsAnimFrame, this.startEyelidsSpacing, this.startEyelidsOffset, this.idle)
			//console.log(`this.emotion.propagateEmotion(${this.pupilsAnimFrame}, ${this.startPupilSize}, ${this.eyelidsAnimFrame}, ${this.startEyelidsSpacing})  ->  ${newState.pupilSize}`)
			this.pupilSize = newState.pupilSize 
			this.eyelidsSpacing = newState.eyelidsSpacing
			if (!this.idle) this.eyelidsOffset = newState.eyelidsOffset
			
		},
		render() {
			let centerX = cnv.width / 2
			let centerY = cnv.height / 2
			ctx.drawImage(this.eyePic, 0, 0, cnv.width, cnv.height)
			let radgrad = ctx.createRadialGradient(60,60,0,60,60,60)
			//ctx.fillRect((cnv.width / 2) - this.pupilSize, (cnv.height / 2) - this.pupilSize,this.pupilSize,this.pupilSize)
			ctx.shadowColor = 'rgb(253, 223, 112)'
			ctx.beginPath()
			ctx.shadowBlur = 60
			//ctx.arc(cnv.width / 2, cnv.height / 2, cnv.width * (this.pupilSize / 100) + 50, 0, 2 * Math.PI)
			ctx.fill()
      		ctx.shadowBlur = 15
			ctx.beginPath()
			ctx.arc(centerX, centerY, cnv.width * (this.pupilSize / 100), 0, 2 * Math.PI)
			ctx.fill()
			ctx.shadowBlur = 0 
			ctx.beginPath()
			ctx.arc(centerX, centerY, cnv.width * (this.pupilSize / 100), 0, 2 * Math.PI)
			ctx.fill()

			ctx.strokeStyle = 'rgba(75, 67, 48,1 )'
			ctx.shadowBlur = this.pupilSize
			ctx.lineWidth = this.pupilSize / 5
			ctx.beginPath()
			ctx.arc(centerX, centerY, cnv.width * (this.pupilSize / 120), 0, 2 * Math.PI)
			ctx.stroke()
			ctx.strokeStyle = 'rgb(253, 223, 112)'
			
			ctx.shadowBlur = 60 
			ctx.beginPath()
			ctx.arc(centerX, centerY, cnv.width * (this.pupilSize / 120) + ctx.lineWidth/2, 0, 2 * Math.PI)
			ctx.lineWidth = 2 
			ctx.stroke()
			//+ this.eyelidsOffset
			ctx.shadowBlur = 0
			ctx.fillRect(0, 0, cnv.width, centerY - (this.eyelidsSpacing / 2) + this.eyelidsOffset )
			ctx.fillRect(0, cnv.height, cnv.width, (((this.eyelidsSpacing + this.eyelidsOffset * 2) / 2) - centerY))
		}
	}
	requestAnimationFrame(renderFrame)
}

Promise.all([
	new Promise( (resolve, reject) => 
		document.addEventListener(
			'DOMContentLoaded',
			() => resolve()
		)
	),
	new Promise( (resolve, reject) => 
		eyeBckg.onload = () => resolve()
	)
]).then( () => init())
