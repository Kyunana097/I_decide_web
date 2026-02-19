class Wheel{
  constructor(options){
    // 初始化状态
    this.state = {
      rotateAngle: 0,      // 当前旋转角度
      isSpinning: false,   // 是否正在旋转
      duration: 4000,      // 动画时长（毫秒）
      // 用户配置：分区1占整圈的百分比（n%），分区2为 100-n
      sectorPercent: 15,
      // 两个分区的文字
      sector1Text: '打游戏',
      sector2Text: '干活',
      // 显示在转盘上的两个分区文字（会做长度截断）
      sector1Label: '',
      sector2Label: '',
      // 配置窗口相关
      editUserPercent: 50,
      editSector1Text: '选项一',
      editSector2Text: '选项二',
    };

    // 获取转盘和指针的 DOM 元素
    this.wheelSection = document.getElementById('wheelSection');
    this.pointer = document.getElementById('pointer');
    this.spinBtn = document.getElementById('spinBtn');
    this.resultEl = document.getElementById('result');
    this.githubLink = document.getElementById('githubLink');
    this.confettiMask = document.getElementById('confettiMask');

    // 获取配置弹窗的 DOM 元素
    this.configMask = document.getElementById('configMask');
    this.configBtn = document.getElementById('configBtn');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.confirmBtn = document.getElementById('confirmBtn');

    // 获取输入框
    this.inputSector1 = document.getElementById('editSector1Text');
    this.inputSector2 = document.getElementById('editSector2Text');
    this.inputPercent = document.getElementById('editUserPercent');
    this.percent2El = document.getElementById('percent2');

    // 绑定配置按钮事件
    this.configBtn.addEventListener('click', () => this.openConfig());
    this.cancelBtn.addEventListener('click', () => this.closeConfig());
    this.confirmBtn.addEventListener('click', () => this.applyConfig());

    // 绑定输入事件（实时更新分区2比例）
    this.inputPercent.addEventListener('input', (e) => this.onEditPercent(e));

    // 绑定旋转事件
    this.spinBtn.addEventListener('click', () => {
      this.startSpin();
    });

    this.githubLink.addEventListener('click', () => {
      window.open('https://github.com/Kyunana097/I_decide_web', '_blank');
    });

    // 初始样式
    this.updateSectorStyle();
  }

  startSpin(){
    if (this.state.isSpinning) return;

    const minSpins = 5;
    const randomAngle = Math.floor(Math.random() * 270);
    const totalAngle = this.state.rotateAngle + minSpins * 360 + randomAngle;

    this.state.isSpinning = true;
    this.state.rotateAngle = totalAngle;
    this.resultEl.textContent = '';

    this.spinBtn.disabled = true;
    this.spinBtn.textContent = '决策中...';

    this.pointer.style.transform = `rotate(${this.state.rotateAngle}deg)`;
    this.updateSectorStyle();

    setTimeout(() => {
    this.state.isSpinning = false;
    this.spinBtn.disabled = false;
    this.spinBtn.textContent = '决策';
    
    this.resultEl.textContent = this.state.sector1Text;
    this.resultEl.classList.add('show');  // ✅ 添加显示动画
    
    this.launchConfetti();
}, this.state.duration);
  }

  //扇形采样
  updateSectorStyle(){
    const ratio = Math.max(0.01, Math.min(1, this.state.sectorPercent / 100));
    const centerAngle = 360 * ratio;
    const half = centerAngle / 2;
  
    // 采样点数量：角度越大点越多，最少 6 个
    const steps = Math.max(6, Math.round(centerAngle / 6));
    const points = [];

    // 圆心
    points.push('50% 50%');

    // 从左边界 (-half) 到右边界 (+half) 依次采样
    for (let i = 0; i <= steps; i++) {
      const angle = -half + (centerAngle * i / steps); // 以指针方向为 0° 的偏移角
      const rad = angle * Math.PI / 180;

      // 以圆心(50,50)为原点，半径 50；0° 取正上方
      const x = 50 + 50 * Math.sin(rad);
      const y = 50 - 50 * Math.cos(rad);

      points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }

    const clipPath = `polygon(${points.join(', ')})`;

    // 扇形跟随指针旋转，保证指针始终在扇形中心
    this.wheelSection.style.cssText = `
        transform: rotate(${this.state.rotateAngle}deg);
        background: linear-gradient(135deg, #00f5d4 0%, #00bbf9 50%, #9b5de5 100%);
        clip-path: ${clipPath};
        box-shadow: inset 0 0 40px rgba(0,0,0,0.4), 0 0 30px rgba(0, 245, 212, 0.3);
    `;
  } 

  // 打开配置窗口
  openConfig() {
    this.state.editUserPercent = this.state.sectorPercent;
    this.state.editSector1Text = this.state.sector1Text;
    this.state.editSector2Text = this.state.sector2Text;

    this.syncConfigPanelToDOM();

    this.configMask.classList.add('show');
  }
  
  // 关闭配置窗口（不保存）
  closeConfig() {
    this.configMask.classList.remove('show');  
  }

  // 编辑分区1比例（n%，分区2自动为 100-n）
  onEditPercent(e) {
    this.state.editUserPercent = e.target.value;
    const value = e.target.value;
    const p = parseInt(value, 10);
    if (p >= 0 && p <= 100) {
        this.percent2El.textContent = 100 - p;
    }
  }

  // 编辑分区1文字
  onEditSector1Text(e) {
    this.state.editSector1Text = e.target.value;
  }

  // 编辑分区2文字
  onEditSector2Text(e) {
    this.state.editSector2Text = e.target.value;
  }

  syncConfigPanelToDOM() {
    this.inputPercent.value = this.state.sectorPercent;
    this.inputSector1.value = this.state.sector1Text;
    this.inputSector2.value = this.state.sector2Text;
    this.percent2El.textContent = 100 - this.state.sectorPercent;
  }

  makeLabel(text) {
    const t = (text || '').trim() || '';
    // 按字符遍历，避免把一个 emoji 截成两半
    const chars = [];
    for (const ch of t) {
      chars.push(ch);
    }
    if (chars.length > 3) {
      return chars.slice(0, 3).join('') + '…';
    }
    return t;
  }

  launchConfetti() {
    if (!this.confettiMask) return;

    const colors = [
      '#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', 
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3',
      '#ff9f43', '#ee5a24', '#0abde3', '#10ac84',
      '#ff7675', '#fdcb6e', '#74b9ff', '#55efc4'
    ];

    const shapes = ['square', 'circle', 'rect', 'strip'];
    const animations = ['confetti-fall', 'confetti-sway-1', 'confetti-sway-2', 'confetti-spiral'];
    const count = 100;

    this.confettiMask.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const left = 5 + Math.random() * 90;
      const delay = Math.random() * 600;
      const duration = 2 + Math.random() * 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      let width, height, borderRadius;
      switch (shape) {
        case 'circle':
          width = 8 + Math.random() * 6;
          height = width;
          borderRadius = '50%';
          break;
        case 'rect':
          width = 12 + Math.random() * 8;
          height = 4 + Math.random() * 4;
          borderRadius = '2px';
          break;
        case 'strip':
          width = 4 + Math.random() * 4;
          height = 16 + Math.random() * 12;
          borderRadius = '2px';
          break;
        default:
          width = 6 + Math.random() * 6;
          height = width;
          borderRadius = '1px';
      }

      const animClass = animations[Math.floor(Math.random() * animations.length)];
      const startRotate = Math.floor(Math.random() * 360);
      const endRotate = startRotate + 360 + Math.floor(Math.random() * 720);
      const driftX = (Math.random() - 0.5) * 30;

      const div = document.createElement('div');
      div.className = `confetti-item ${animClass}`;
      div.style.left = `${left}%`;
      div.style.top = '0';
      div.style.marginTop = '-30px';
      div.style.width = `${width}px`;
      div.style.height = `${height}px`;
      div.style.background = color;
      div.style.borderRadius = borderRadius;
      div.style.animationDelay = `${delay}ms`;
      div.style.animationDuration = `${duration}s`;
      div.style.setProperty('--start-rotate', `${startRotate}deg`);
      div.style.setProperty('--end-rotate', `${endRotate}deg`);
      div.style.setProperty('--drift-x', `${driftX}vw`);

      this.confettiMask.appendChild(div);
    }

    setTimeout(() => {
      if (this.confettiMask) {
        this.confettiMask.innerHTML = '';
      }
    }, 4500);
  }

  // 应用配置
  applyConfig() {
    const raw = this.inputPercent.value.trim();
    const text1 = this.inputSector1.value.trim();
    const text2 = this.inputSector2.value.trim();

    // 只允许整数：如果包含小数点/非数字，则不更改，直接提示
    if (!/^\d+$/.test(raw) || parseInt(raw) < 1 || parseInt(raw) > 99) {
      alert('请输入整数百分比（1-99之间）');
      // 还原输入框显示为当前生效的比例
      this.syncConfigPanelToDOM();
      return;
    }

    let p = parseInt(raw, 10);
    if (isNaN(p)) {
      p = this.state.sectorPercent;
    }
    // 限制在 1%~99%，保证两个分区都有面积
    p = Math.max(1, Math.min(99, p));

    const sector1Label = this.makeLabel(text1);
    const sector2Label = this.makeLabel(text2);

    this.state.sectorPercent = p;
    this.state.sector1Text = text1 || '选项一';
    this.state.sector2Text = text2 || '选项二';

    document.getElementById('sector1Label').textContent = this.state.sector1Text;
    document.getElementById('sector2Label').textContent = this.state.sector2Text;
    this.updateSectorStyle(); 

    this.closeConfig();
  }
}

//在 DOM 加载完成后实例化
document.addEventListener('DOMContentLoaded', () => {
    const wheel = new Wheel();
});