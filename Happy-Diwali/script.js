window.onload = function() {
    const canvas = document.getElementById('fireworks-canvas');
    const ctx = canvas.getContext('2d');
    const diwaliMessage = document.getElementById('diwali-message');

    // Audio elements
    const backgroundMusic = document.getElementById('background-music');
    const fireworkSound = document.getElementById('firework-sound');
    const launchSound = document.getElementById('launch-sound');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let fireworks = [];
    let particles = [];
    const colors = ['#FFD700', '#FFB300', '#FFFFFF', '#FF6F00', '#FFC107', '#E53935', '#D81B60', '#8E24AA'];

    function startShow() {
        backgroundMusic.play().catch(e => console.log("Playback was prevented. Please interact with the page to enable sound."));

        let launchCount = 0;
        const interval = setInterval(() => {
            if (launchCount < 30) { // Increased to 30 sky shots
                const fireworkType = Math.random() > 0.5 ? 'willow' : 'crackle';
                const speed = Math.random() * 3 + 4; // Random speed between 4 and 7
                fireworks.push(new Firework(fireworkType, speed));
                launchSound.currentTime = 0;
                launchSound.play();
                launchCount++;
            } else {
                clearInterval(interval);
                setTimeout(showDiwaliMessage, 4000);
            }
        }, 400); // Adjusted interval for a more dynamic show
    }

    startShow();

    class Firework {
        constructor(type = 'burst', speed = 7) {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.targetX = this.x;
            this.targetY = Math.random() * (canvas.height / 2);
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.trail = [];
            this.type = type;
            this.speed = speed;
        }

        update() {
            this.trail.push({x: this.x, y: this.y});
            if(this.trail.length > 10) this.trail.shift();

            const distance = Math.sqrt(Math.pow(this.targetX - this.x, 2) + Math.pow(this.targetY - this.y, 2));
            if (distance < 5) {
                for (let i = 0; i < 200; i++) { // More particles for a fuller burst
                    particles.push(new Particle(this.x, this.y, this.color, this.type));
                }
                fireworkSound.currentTime = 0;
                fireworkSound.play();
                return true;
            }
            
            const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;

            return false;
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.trail[0]?.x || this.x, this.trail[0]?.y || this.y);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `hsl(${Math.random() * 360}, 100%, 75%)`; // Rainbow trail
            ctx.lineWidth = 4;
            ctx.stroke();
        }
    }

    class Particle {
        constructor(x, y, color, type) {
            this.x = x;
            this.y = y;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speed = Math.random() * 10 + 2;
            this.angle = Math.random() * Math.PI * 2;
            this.friction = type === 'willow' ? 0.92 : 0.95;
            this.gravity = type === 'willow' ? 0.2 : 0.15;
            this.alpha = 1;
            this.decay = type === 'willow' ? Math.random() * 0.01 + 0.005 : Math.random() * 0.015 + 0.01;
            this.trail = [];
            this.type = type;
        }

        update() {
            this.trail.push({x: this.x, y: this.y});
            if(this.trail.length > 7) this.trail.shift();

            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;
            
            if (this.type === 'crackle' && Math.random() < 0.05 && this.alpha > 0.5) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, this.color, 'burst'));
                }
            }
            
            return this.alpha <= this.decay;
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.trail[0]?.x || this.x, this.trail[0]?.y || this.y);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = this.alpha;
            ctx.lineWidth = 3; 
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
    
    function animate() {
        requestAnimationFrame(animate);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Slower fade for longer trails
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        fireworks = fireworks.filter(fw => !fw.update());
        particles = particles.filter(p => !p.update());

        fireworks.forEach(fw => fw.draw());
        particles.forEach(p => p.draw());
    }

    function showDiwaliMessage() {
        diwaliMessage.classList.remove('hide');
        setTimeout(() => {
            diwaliMessage.classList.add('hide');
            // Restart the show after the message
            setTimeout(startShow, 2000); 
        }, 8000);
    }

    animate();
};