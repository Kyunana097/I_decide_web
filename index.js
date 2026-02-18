class Wheel{
    constructor(options){
    
    }
    startSpin(){

    }
    //扇形采样
    computeSectorStyle(percent, angle){
      const ratio = Math.max(0.01, Math.min(1, percent / 100));
      const centerAngle = 360 * ratio;
      const half = centerAngle / 2;
    
    } 
}