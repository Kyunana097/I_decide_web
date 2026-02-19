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
      showConfig: false,
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
      // 这里直接固定结果为 sector1Text
      this.resultEl.textContent = this.state.sector1Text;
      // 彩纸动画、配置弹窗等你可以参考小程序 index.js 继续往下迁
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
    this.wheelSection.style.cssText = `transform: rotate(${this.state.rotateAngle}deg); background: #0077ff; clip-path: ${clipPath};`;
  } 

  // 打开配置窗口
  openConfig() {
    this.state.showConfig = true;
    this.state.editUserPercent = this.state.sectorPercent;
    this.state.editSector1Text = this.state.sector1Text;
    this.state.editSector2Text = this.state.sector2Text;
    this.configMask.classList.add('show');
  }
  

  // 关闭配置窗口（不保存）
  closeConfig() {
    this.state.showConfig = false;
    this.configMask.classList.remove('show');  
  }

  // 编辑分区1比例（n%，分区2自动为 100-n）
  onEditPercent(e) {
    this.state.editUserPercent = e.target.value;
  }

  // 编辑分区1文字
  onEditSector1Text(e) {
    this.state.editSector1Text = e.target.value;
  }

  // 编辑分区2文字
  onEditSector2Text(e) {
    this.state.editSector2Text = e.target.value;
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

  // 应用配置
  applyConfig() {
    const raw = this.inputPercent.value.trim();
    const text1 = this.inputSector1.value.trim();
    const text2 = this.inputSector2.value.trim();

    // 只允许整数：如果包含小数点/非数字，则不更改，直接提示
    if (!/^\d+$/.test(raw)) {
      alert('请输入整数百分比');
      // 还原输入框显示为当前生效的比例
      this.state.editUserPercent = this.state.sectorPercent;
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