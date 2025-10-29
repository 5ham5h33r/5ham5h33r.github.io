/**
 * 2D Endless Runner Game Mode for Portfolio - Mario Style!
 * A fun, interactive way to explore Shamsheer's portfolio
 */

class PortfolioGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.isActive = false;
    
    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Player properties (Mario-style)
    this.player = {
      x: 150,
      y: 300,
      width: 32,
      height: 48,
      speed: 5,
      velocityY: 0,
      gravity: 0.8,
      jumpPower: -16,
      isJumping: false,
      direction: 'right'
    };
    
    // Controls
    this.keys = {};
    this.setupControls();
    
    // Current room
    this.currentRoom = 'hub';
    
    // Coins collected
    this.coins = 0;
    
    // Distance traveled
    this.distance = 0;
    
    // Death system
    this.isDead = false;
    this.deathMessages = [
      "GAME OVER!<br>You fell into the void!",
      "OOPS!<br>Watch your step!",
      "OH NO!<br>Gravity wins!",
      "YIKES!<br>That's a long fall!",
      "WHOOPS!<br>Better luck next jump!",
      "UH OH!<br>The abyss got you!",
      "DANG IT!<br>So close!",
      "OUCH!<br>That had to hurt!"
    ];
    
    // Camera/world offset for scrolling
    this.cameraX = 0;
    
    // Animation frame counter
    this.frame = 0;
    
    // Floating coins
    this.floatingCoins = [];
    
    // Clouds for background
    this.clouds = [];
    
    // Platforms
    this.platforms = [];
    this.lastPlatformX = 0;
    
    // Generate initial world
    this.generateClouds();
    this.generateInitialPlatforms();
    this.generateInitialCoins();
    
    // Info panels content
    this.infoContent = this.setupInfoContent();
    
    // Current active panel
    this.activePanel = null;
  }
  
  generateClouds() {
    for (let i = 0; i < 15; i++) {
      this.clouds.push({
        x: i * 300 + Math.random() * 150,
        y: 50 + Math.random() * 100,
        width: 100 + Math.random() * 40,
        height: 40 + Math.random() * 20
      });
    }
  }
  
  generateInitialCoins() {
    for (let i = 0; i < 30; i++) {
      this.floatingCoins.push({
        x: i * 250 + 200 + Math.random() * 100,
        y: 200 + Math.random() * 200,
        width: 20,
        height: 20,
        collected: false
      });
    }
  }
  
  generateInitialPlatforms() {
    // Starting ground - extra long and easy
    this.platforms.push({ 
      x: 0, y: 550, width: 600, height: 50, 
      color: '#8B4513', type: 'ground', texture: 'grass' 
    });
    
    // Info platforms at the start - MUCH EASIER to reach
    this.platforms.push({ 
      x: 250, y: 480, width: 100, height: 150, 
      color: '#48bb78', label: 'ABOUT', door: 'about', type: 'pipe', icon: '👤' 
    });
    
    this.platforms.push({ 
      x: 420, y: 480, width: 120, height: 40, 
      color: '#FFD700', label: 'SKILLS', door: 'skills', type: 'question', icon: '⚡' 
    });
    
    this.platforms.push({ 
      x: 620, y: 480, width: 140, height: 40, 
      color: '#C04000', label: 'EXP', door: 'experience', type: 'brick', icon: '💼' 
    });
    
    this.platforms.push({ 
      x: 840, y: 480, width: 120, height: 40, 
      color: '#FFD700', label: 'PROJECTS', door: 'projects', type: 'coin', icon: '🎮' 
    });
    
    this.lastPlatformX = 1000;
    
    // Generate more platforms
    for (let i = 0; i < 50; i++) {
      this.generateNewPlatform();
    }
  }
  
  generateNewPlatform() {
    const gap = 100 + Math.random() * 100; // Moderate gaps (100-200 pixels) - challenging but jumpable
    const x = this.lastPlatformX + gap;
    const y = 350 + Math.random() * 120; // More vertical variation (350-470) for challenge
    const width = 90 + Math.random() * 70; // Moderate platform width (90-160 pixels)
    
    const types = ['block', 'question', 'brick'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let platform = { x, y, width, height: 30, type };
    
    if (type === 'question') {
      platform.color = '#FFD700';
      platform.icon = '?';
    } else if (type === 'brick') {
      platform.color = '#C04000';
    } else {
      platform.color = '#A0522D';
    }
    
    this.platforms.push(platform);
    this.lastPlatformX = x + width;
    
    // Add coin above platform - positioned to be reachable during jump arc
    if (Math.random() < 0.5) {
      this.floatingCoins.push({
        x: x + width/2 - 10,
        y: y - 50, // Closer to platform (was -70) so it's reachable mid-jump
        width: 20,
        height: 20,
        collected: false
      });
    }
    
    // Sometimes add coins between platforms at jump arc height
    if (Math.random() < 0.3 && gap > 120) {
      this.floatingCoins.push({
        x: x - gap/2 - 10,
        y: Math.min(y, 400) - 60, // At typical jump arc height
        width: 20,
        height: 20,
        collected: false
      });
    }
  }
  
  handleDeath() {
    this.isDead = true;
    const message = this.deathMessages[Math.floor(Math.random() * this.deathMessages.length)];
    
    // Show death screen
    const panel = document.querySelector('.info-panel');
    panel.innerHTML = `
      <div class="info-panel-header">
        <h2>💀 ${message}</h2>
      </div>
      <div class="info-panel-content">
        <h3>📊 Your Stats:</h3>
        <p style="font-size: 14px; margin: 10px 0;">Distance: <span style="color: #FFD700;">${Math.floor(this.distance)}m</span></p>
        <p style="font-size: 14px; margin: 10px 0;">Coins: <span style="color: #FFD700;">${this.coins}</span></p>
        <p style="font-size: 16px; margin: 15px 0; color: #FFD700;">Final Score: ${Math.floor(this.distance + this.coins * 50)}</p>
      </div>
      <div class="info-panel-footer">
        <button class="close-panel" onclick="event.stopPropagation(); game.respawn(); return false;">★ PRESS R TO RETRY ★</button>
      </div>
    `;
    panel.classList.add('active');
  }
  
  respawn() {
    // Reset player position
    this.player.x = 150;
    this.player.y = 300;
    this.player.velocityY = 0;
    this.player.velocityX = 0;
    this.cameraX = 0;
    this.isDead = false;
    
    // Reset distance AND coins on death
    this.distance = 0;
    this.coins = 0;
    
    // Regenerate platforms from start
    this.platforms = [];
    this.floatingCoins = [];
    this.lastPlatformX = 0;
    this.generateInitialPlatforms();
    
    // Close death panel
    document.querySelector('.info-panel').classList.remove('active');
  }
  
  setupInfoContent() {
    return {
      about: {
        title: '👨‍💻 About Me',
        content: `
          <div class="info-panel-header">
            <h2>👨‍💻 ABOUT ME</h2>
          </div>
          <div class="info-panel-content">
            <h3>Welcome to my World!</h3>
            <p>I'm Shamsheer Abdul Rahiman, a Data Scientist and ML Engineer with extensive experience in building production-grade AI/ML systems at ION Group, a global leader in FinTech solutions.</p>
            
            <h3>📍 Current Status</h3>
            <p>🎓 Pursuing MS in Computer Science at USC</p>
            <p>📧 shamsheerkhalid99@gmail.com</p>
            <p>📱 +1 (213) 301-7940</p>
            <p>📍 Los Angeles, California</p>
            
            <h3>🎯 Specialization</h3>
            <p>Developing innovative solutions including lead scoring systems, agentic AI frameworks, automated risk flagging, and sentiment analysis with strong foundation in PySpark, LLMs, and cloud technologies.</p>
          </div>
          <div class="info-panel-footer">
            <button class="close-panel" onclick="event.stopPropagation(); game.closeInfo(); return false;">★ PRESS E TO CLOSE ★</button>
          </div>
        `
      },
      skills: {
        title: '⚡ Skills & Technologies',
        content: `
          <div class="info-panel-header">
            <h2>⚡ POWER-UPS COLLECTED!</h2>
          </div>
          <div class="info-panel-content">
            <h3>💻 Programming Languages</h3>
            <p>Python • Java • C • C++ • R • SQL • HTML • CSS • JavaScript</p>
            
            <h3>🤖 Data Science & ML</h3>
            <p>PySpark • TensorFlow • PyTorch • Scikit-learn • Pandas • Keras • LangChain • NLP • Deep Learning • Computer Vision • LLMs</p>
            
            <h3>☁️ Cloud & Big Data</h3>
            <p>Azure • Databricks • Spark • Hadoop • MongoDB • REST APIs • MLFlow</p>
            
            <h3>🛠️ Tools & Frameworks</h3>
            <p>Flask • Django • Streamlit • Tableau • Power BI • Git • Docker • Kubernetes</p>
          </div>
          <div class="info-panel-footer">
            <button class="close-panel" onclick="event.stopPropagation(); game.closeInfo(); return false;">★ PRESS E TO CLOSE ★</button>
          </div>
        `
      },
      experience: {
        title: '💼 Professional Experience',
        content: `
          <div class="info-panel-header">
            <h2>💼 LEVEL PROGRESS</h2>
          </div>
          <div class="info-panel-content">
            <h3>🏢 ION Group (Jan 2024 - Jul 2025)</h3>
            <p><strong>Data Scientist / Software Engineer (ML/AI)</strong></p>
            <ul>
              <li>Built predictive lead scoring model - 25% conversion increase</li>
              <li>Developed agentic AI framework - 60% research time reduction</li>
              <li>Created automated risk flagging system - 92% accuracy</li>
              <li>Designed BI chatbot - 15 hours saved weekly</li>
              <li>Optimized data pipelines - 3 hours to 15 minutes runtime</li>
              <li>Deployed Flask app on Azure - 80% latency reduction</li>
            </ul>
            
            <h3>💻 rFund.ai (Dec 2022 - Jun 2023)</h3>
            <p><strong>Software Development Intern</strong></p>
            <ul>
              <li>Automated API mapping for 10K+ records</li>
              <li>Built Slack bots - 40% delay reduction</li>
              <li>Created 15+ performance metrics</li>
              <li>Developed Streamlit Dashboard for backend monitoring</li>
            </ul>
          </div>
          <div class="info-panel-footer">
            <button class="close-panel" onclick="event.stopPropagation(); game.closeInfo(); return false;">★ PRESS E TO CLOSE ★</button>
          </div>
        `
      },
      projects: {
        title: '🎮 Featured Projects',
        content: `
          <div class="info-panel-header">
            <h2>🎮 ACHIEVEMENTS UNLOCKED!</h2>
          </div>
          <div class="info-panel-content">
            <h3>🎤 Dysarthria Detection</h3>
            <p>CNN+LSTM model with 91% accuracy for speech defect detection. Built real-time Streamlit app with integrated Speech-To-Text (Whisper) and Text-To-Speech pipelines.</p>
            
            <h3>📚 Book-Bae</h3>
            <p>Full-stack Django platform integrated with Google Play Books API. Personalized recommendations for 5K+ books, deployed on Azure with responsive UX.</p>
            
            <h3>🎌 Anime Recommendation System</h3>
            <p>Hybrid recommender combining collaborative and content-based filtering. Packaged as PyPi library, handling 10K+ anime entries.</p>
            
            <h3>🎯 More Achievements</h3>
            <p>Checkers AI with minimax algorithm • CodeBreaker Android puzzle game • Treasure Hunter adventure • Alien Invasion arcade shooter</p>
          </div>
          <div class="info-panel-footer">
            <button class="close-panel" onclick="event.stopPropagation(); game.closeInfo(); return false;">★ PRESS E TO CLOSE ★</button>
          </div>
        `
      }
    };
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  setupControls() {
    document.addEventListener('keydown', (e) => {
      // Only handle keys when game is active
      if (!this.isActive) return;
      
      // Prevent spacebar from activating focused buttons
      if (e.key === ' ') {
        e.preventDefault(); // Prevent page scroll AND button activation
        if (!this.player.isJumping) {
          this.player.velocityY = this.player.jumpPower;
          this.player.isJumping = true;
        }
        return; // Exit early to prevent other handling
      }
      
      this.keys[e.key.toLowerCase()] = true;
      
      // E to interact or close panel
      if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (this.activePanel) {
          // Close the panel if one is open
          this.closeInfo();
        } else {
          // Check for interaction
          this.checkInteraction();
        }
      }
      
      // R to respawn
      if (e.key.toLowerCase() === 'r' && this.isDead) {
        this.respawn();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (!this.isActive) return;
      this.keys[e.key.toLowerCase()] = false;
    });
  }
  
  checkInteraction() {
    // Don't check interaction if panel is already open or dead
    if (this.activePanel || this.isDead) return;
    
    const playerScreenX = this.player.x - this.cameraX;
    const playerCenter = playerScreenX + this.player.width / 2;
    const playerBottom = this.player.y + this.player.height;
    
    // Check if player is on a platform with a door
    // Must be grounded (not jumping) to interact
    if (this.player.isJumping) return;
    
    this.platforms.forEach(platform => {
      if (platform.door) {
        const platformScreenX = platform.x - this.cameraX;
        if (playerCenter > platformScreenX &&
            playerCenter < platformScreenX + platform.width &&
            Math.abs(playerBottom - platform.y) < 10) {
          this.showInfo(platform.door);
        }
      }
    });
  }
  
  showInfo(type) {
    const panel = document.querySelector('.info-panel');
    const content = this.infoContent[type];
    
    if (content) {
      panel.innerHTML = content.content;
      panel.classList.add('active');
      this.activePanel = type;
      console.log('Info panel opened:', type);
    }
  }
  
  closeInfo() {
    const panel = document.querySelector('.info-panel');
    panel.classList.remove('active');
    this.activePanel = null;
    console.log('Info panel closed');
  }
  
  update() {
    if (!this.isActive || this.isDead) return;
    
    // Movement
    if (this.keys['a'] || this.keys['arrowleft']) {
      this.player.x -= this.player.speed;
      this.player.direction = 'left';
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      this.player.x += this.player.speed;
      this.player.direction = 'right';
      this.distance += 0.1; // Increase distance when moving right
    }
    
    // Camera follows player - always centered
    const centerX = this.canvas.width / 2;
    this.cameraX = Math.max(0, this.player.x - centerX);
    
    // Gravity
    this.player.velocityY += this.player.gravity;
    this.player.y += this.player.velocityY;
    
    // Platform collision
    this.player.isJumping = true;
    
    this.platforms.forEach(platform => {
      const platformScreenX = platform.x - this.cameraX;
      const playerScreenX = this.player.x - this.cameraX;
      
      if (playerScreenX + this.player.width > platformScreenX &&
          playerScreenX < platformScreenX + platform.width &&
          this.player.y + this.player.height > platform.y &&
          this.player.y + this.player.height < platform.y + 30 &&
          this.player.velocityY > 0) {
        this.player.y = platform.y - this.player.height;
        this.player.velocityY = 0;
        this.player.isJumping = false;
      }
    });
    
    // Coin collection
    this.floatingCoins.forEach(coin => {
      if (!coin.collected) {
        const coinScreenX = coin.x - this.cameraX;
        const playerScreenX = this.player.x - this.cameraX;
        if (playerScreenX + this.player.width > coinScreenX &&
            playerScreenX < coinScreenX + coin.width &&
            this.player.y + this.player.height > coin.y &&
            this.player.y < coin.y + coin.height) {
          coin.collected = true;
          this.coins++;
        }
      }
    });
    
    // Generate new platforms as player progresses
    if (this.lastPlatformX - this.cameraX < this.canvas.width + 500) {
      for (let i = 0; i < 3; i++) {
        this.generateNewPlatform();
      }
    }
    
    // Generate new clouds
    if (this.clouds.length < 20) {
      this.clouds.push({
        x: this.cameraX + this.canvas.width + Math.random() * 200,
        y: 50 + Math.random() * 100,
        width: 100 + Math.random() * 40,
        height: 40 + Math.random() * 20
      });
    }
    
    // Death by falling
    if (this.player.y > this.canvas.height + 100) {
      this.handleDeath();
    }
    
    // Boundaries - prevent going too far left
    if (this.player.x < this.cameraX) {
      this.player.x = this.cameraX;
    }
    
    // Increment frame counter
    this.frame++;
  }
  
  draw() {
    if (!this.isActive) return;
    
    const ctx = this.ctx;
    
    // Clear canvas with Mario sky blue
    ctx.fillStyle = '#5C94FC';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw clouds
    this.drawClouds();
    
    // Draw platforms
    this.platforms.forEach(platform => {
      const platformScreenX = platform.x - this.cameraX;
      if (platformScreenX + platform.width > -100 && platformScreenX < this.canvas.width + 100) {
        this.drawPlatform(platform, platformScreenX);
      }
    });
    
    // Draw floating coins
    this.floatingCoins.forEach(coin => {
      if (!coin.collected) {
        const coinScreenX = coin.x - this.cameraX;
        if (coinScreenX > -50 && coinScreenX < this.canvas.width + 50) {
          this.drawCoin(coinScreenX, coin.y, coin.width);
        }
      }
    });
    
    // Draw player (fixed position on screen)
    this.drawPlayer();
    
    // Draw UI
    this.drawUI();
  }
  
  drawClouds() {
    const ctx = this.ctx;
    ctx.fillStyle = '#FFFFFF';
    
    this.clouds.forEach(cloud => {
      const cloudX = cloud.x - this.cameraX * 0.5; // Parallax effect
      if (cloudX + cloud.width > -100 && cloudX < this.canvas.width + 100) {
        ctx.fillRect(cloudX + 10, cloud.y, cloud.width - 20, cloud.height - 10);
        ctx.fillRect(cloudX, cloud.y + 10, cloud.width, cloud.height - 20);
        ctx.fillRect(cloudX + 5, cloud.y + 5, 10, 10);
        ctx.fillRect(cloudX + cloud.width - 15, cloud.y + 5, 10, 10);
      }
    });
  }
  
  drawPlatform(platform, screenX) {
    const ctx = this.ctx;
    
    if (platform.texture === 'grass') {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(screenX, platform.y, platform.width, platform.height);
      ctx.fillStyle = '#228B22';
      ctx.fillRect(screenX, platform.y, platform.width, 10);
      ctx.fillStyle = '#32CD32';
      for (let i = 0; i < platform.width; i += 20) {
        ctx.fillRect(screenX + i, platform.y + 2, 8, 4);
      }
    } else if (platform.type === 'pipe') {
      ctx.fillStyle = platform.color;
      ctx.fillRect(screenX + 10, platform.y, platform.width - 20, platform.height);
      ctx.fillStyle = '#5fd68a';
      ctx.fillRect(screenX, platform.y - 10, platform.width, 20);
      ctx.fillStyle = '#2d8659';
      ctx.fillRect(screenX + 15, platform.y + 5, platform.width - 30, platform.height - 10);
      
      ctx.font = '32px Arial';
      ctx.fillText(platform.icon, screenX + platform.width/2 - 16, platform.y + platform.height/2 + 10);
      
      ctx.fillStyle = '#FFD700';
      ctx.font = '10px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(platform.label, screenX + platform.width/2, platform.y - 15);
      ctx.shadowBlur = 0;
    } else if (platform.type === 'question') {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(screenX, platform.y, platform.width, platform.height);
      ctx.fillStyle = '#FFA500';
      ctx.fillRect(screenX, platform.y, platform.width, 4);
      ctx.fillRect(screenX, platform.y + platform.height - 4, platform.width, 4);
      ctx.fillRect(screenX, platform.y, 4, platform.height);
      ctx.fillRect(screenX + platform.width - 4, platform.y, 4, platform.height);
      
      ctx.fillStyle = '#000';
      ctx.font = 'bold 20px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('?', screenX + platform.width/2, platform.y + platform.height/2 + 7);
      
      if (platform.label) {
        ctx.fillStyle = '#FFD700';
        ctx.font = '10px "Press Start 2P"';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(platform.label, screenX + platform.width/2, platform.y - 15);
        ctx.shadowBlur = 0;
      }
    } else if (platform.type === 'brick') {
      ctx.fillStyle = '#C04000';
      ctx.fillRect(screenX, platform.y, platform.width, platform.height);
      
      const brickWidth = 35;
      const brickHeight = 15;
      ctx.strokeStyle = '#8B0000';
      ctx.lineWidth = 2;
      
      for (let row = 0; row < Math.ceil(platform.height / brickHeight); row++) {
        for (let col = 0; col < Math.ceil(platform.width / brickWidth); col++) {
          const offsetX = (row % 2) * (brickWidth / 2);
          ctx.strokeRect(screenX + col * brickWidth + offsetX, platform.y + row * brickHeight, brickWidth, brickHeight);
        }
      }
      
      if (platform.label) {
        ctx.fillStyle = '#FFD700';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(platform.label, screenX + platform.width/2, platform.y - 15);
        ctx.shadowBlur = 0;
      }
    } else if (platform.type === 'coin') {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(screenX, platform.y, platform.width, platform.height);
      ctx.fillStyle = '#FFED4E';
      ctx.fillRect(screenX + 5, platform.y + 5, platform.width - 10, platform.height/2 - 5);
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 3;
      ctx.strokeRect(screenX, platform.y, platform.width, platform.height);
      
      if (platform.label) {
        ctx.fillStyle = '#FFD700';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(platform.label, screenX + platform.width/2, platform.y - 15);
        ctx.shadowBlur = 0;
      }
    } else {
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(screenX, platform.y, platform.width, platform.height);
      ctx.fillStyle = '#D2691E';
      ctx.fillRect(screenX + 3, platform.y + 3, platform.width - 6, 8);
    }
    
    // Interaction prompt
    if (platform.door) {
      const playerScreenX = this.player.x - this.cameraX;
      const playerCenter = playerScreenX + this.player.width / 2;
      const playerBottom = this.player.y + this.player.height;
      
      if (playerCenter > screenX &&
          playerCenter < screenX + platform.width &&
          Math.abs(playerBottom - platform.y) < 10) {
        this.drawInteractionPrompt(screenX + platform.width/2, platform.y - 40);
      }
    }
  }
  
  drawCoin(x, y, size) {
    const ctx = this.ctx;
    const frame = Math.floor(this.frame / 10) % 4;
    const scaleX = [1, 0.7, 0.3, 0.7][frame];
    
    ctx.save();
    ctx.translate(x + size/2, y + size/2);
    ctx.scale(scaleX, 1);
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#FFA500';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('$', 0, 4);
    
    ctx.restore();
  }
  
  drawPlayer() {
    const p = this.player;
    const ctx = this.ctx;
    
    // Draw player at screen position (accounting for camera)
    const screenX = p.x - this.cameraX;
    
    ctx.save();
    
    if (p.direction === 'left') {
      ctx.translate(screenX + p.width, p.y);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(screenX, p.y);
    }
    
    // Body (red shirt)
    ctx.fillStyle = '#E52521';
    ctx.fillRect(0, 20, 32, 20);
    
    // Overalls (blue)
    ctx.fillStyle = '#0066CC';
    ctx.fillRect(6, 24, 20, 24);
    
    // Buttons
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(12, 26, 4, 4);
    ctx.fillRect(16, 26, 4, 4);
    
    // Head
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(8, 8, 16, 16);
    
    // Hat
    ctx.fillStyle = '#E52521';
    ctx.fillRect(6, 4, 20, 8);
    ctx.fillRect(10, 0, 12, 6);
    
    // Hat logo
    ctx.fillStyle = '#FFF';
    ctx.fillRect(14, 2, 4, 4);
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(12, 14, 3, 3);
    ctx.fillRect(18, 14, 3, 3);
    
    // Mustache
    ctx.fillStyle = '#4A2511';
    ctx.fillRect(10, 18, 12, 3);
    
    // Shoes
    ctx.fillStyle = '#4A2511';
    ctx.fillRect(4, 44, 10, 4);
    ctx.fillRect(18, 44, 10, 4);
    
    ctx.restore();
  }
  
  drawUI() {
    const ctx = this.ctx;
    
    // Coin counter
    ctx.fillStyle = '#000';
    ctx.fillRect(this.canvas.width - 150, 15, 135, 45);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.canvas.width - 150, 15, 135, 45);
    
    this.drawCoin(this.canvas.width - 140, 25, 20);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 3;
    ctx.fillText(`x ${this.coins}`, this.canvas.width - 110, 43);
    ctx.shadowBlur = 0;
    
    // Distance and Coins counter (top-left)
    ctx.fillStyle = '#000';
    ctx.fillRect(20, 15, 250, 65);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 15, 250, 65);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(`DISTANCE: ${Math.floor(this.distance)}m`, 30, 35);
    
    // Show coins on top-left too
    this.drawCoin(30, 45, 15);
    ctx.font = '14px "Press Start 2P"';
    ctx.fillText(`x ${this.coins}`, 55, 60);
    
    // Hint arrow (keep running right)
    if (this.distance < 100 && this.frame % 60 < 30) {
      ctx.fillStyle = '#FFD700';
      ctx.font = '14px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText('RUN RIGHT! →', this.canvas.width/2, 100);
      ctx.shadowBlur = 0;
    }
  }
  
  drawInteractionPrompt(x, y) {
    const ctx = this.ctx;
    
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x - 30, y, 60, 30);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 30, y, 60, 30);
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 30);
    ctx.lineTo(x, y + 40);
    ctx.lineTo(x + 5, y + 30);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#000';
    ctx.font = '9px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS', x, y + 14);
    ctx.fillText('E', x, y + 25);
  }
  
  gameLoop() {
    this.update();
    this.draw();
    if (this.isActive) {
      requestAnimationFrame(() => this.gameLoop());
    }
  }
  
  start() {
    this.isActive = true;
    document.querySelector('.game-container').classList.add('active');
    const header = document.getElementById('header');
    const main = document.getElementById('main');
    const hero = document.getElementById('hero');
    if (header) header.style.display = 'none';
    if (main) main.style.display = 'none';
    if (hero) hero.style.display = 'none';
    
    document.body.style.overflow = 'hidden';
    
    const toggleButton = document.querySelector('.game-mode-toggle');
    if (toggleButton) toggleButton.blur();
    
    this.canvas.focus();
    
    console.log('Game started');
    this.gameLoop();
  }
  
  stop() {
    this.isActive = false;
    document.querySelector('.game-container').classList.remove('active');
    this.closeInfo();
    const header = document.getElementById('header');
    const main = document.getElementById('main');
    const hero = document.getElementById('hero');
    if (header) header.style.display = '';
    if (main) main.style.display = '';
    if (hero) hero.style.display = '';
    
    document.body.style.overflow = '';
    
    console.log('Game stopped');
  }
}

// Initialize game
let game;

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    game = new PortfolioGame();
  }, 100);
});

function toggleGameMode() {
  const button = document.querySelector('.game-mode-toggle');
  const icon = button.querySelector('i');
  const text = button.querySelector('.toggle-text');
  
  if (game.isActive) {
    game.stop();
    icon.className = 'bx bx-game';
    text.textContent = 'Game Mode';
  } else {
    game.start();
    icon.className = 'bx bx-x';
    text.textContent = 'Exit Game';
  }
}
