'use strict'

window.addEventListener('load', init);
window.addEventListener('resize', init);

function init(){
    const line = document.querySelector('.line');
    const handle = document.querySelector('.handle');
    const elements = document.querySelectorAll('li');

    if(!line || !handle || !elements) return;

    // PC
    handle.addEventListener('mousedown', addEvent);
    window.addEventListener('mouseup', removeEvent);

    // iPhone Android
    handle.addEventListener('touchstart', addEvent);
    window.addEventListener('touchend', removeEvent);
    
    // ジッパーの歯のサイズを調整する
    const max = line.clientHeight;
    const height = max / 10;
    elements.forEach(e => e.style.height = `${height}px`);
}

function addEvent() {
    // PC
    window.addEventListener('mousemove', slide, false);
    
    // iPhone Android
    window.addEventListener('touchmove', mergeEventDifferenceForTouch, { passive: false });
}

function removeEvent() {
    // PC
    window.removeEventListener('mousemove', slide, false);

    // iPhone Android
    window.addEventListener('touchmove', mergeEventDifferenceForTouch, { passive: false });

    // スライダーの傾きをリセットする
    resetSlider();
}

function mergeEventDifferenceForTouch(event) {
    // スクロールを無効にする
    event.preventDefault();

    const x = event.changedTouches[0].pageX;
    const y = event.changedTouches[0].pageY;
    const position = {clientX: x, clientY: y};
    slide(position);
}

function slide(event) {
    rotateHandle(event);
    moveSlider(event);
    setStatus(event);
}

function rotateHandle(event) {
    const handle = document.querySelector('.handle');

    if(!handle) return;

    // マウスの座標を取得する
    const mx = event.clientX;
    const my = event.clientY;

    // ハンドルの座標を取得する
    const position = getPosition(handle);
    const tx = position.x;
    const ty = position.y;

    // ハンドルとマウスの座標環の角度を取得する
    const radian = Math.atan2(tx - mx, my - ty);
    const angle = radian * (180 / Math.PI);

    // ハンドルを変形する
    handle.rotate = angle;
    handle.style.transition = null;
    handle.style.transformOrigin = `50% 0`;
    handle.style.transform = `translateX(-50%) rotate(${angle}deg)`;

}

function moveSlider(event){
    const slider = document.querySelector('.slider');
    const handle = document.querySelector('.handle');

    if(!slider || !handle) return;

    // マウスの座標を取得する
    const my = event.clientY;

    // 引手の座標を取得する
    const adjust = -50;
    const hy = my - handle.clientHeight + adjust;

    // スライダーを移動する
    slider.style.position = 'absolute';
    slider.style.top = `${hy}px`
}

function setStatus(event) {
    const slider = document.querySelector('.slider');
    const elements = document.querySelectorAll('li');

    if(!slider || !elements) return;

    const progress = getProgress(event);

    // ジッパーの歯を開いていく演出
    elements.forEach(e => {
        if(Number(e.innerText <= progress)){
            e.classList.add('open');
        } else {
            e.classList.remove('open');
        }
    });

    // ジッパーが開ききった演出
    if(progress === 100) {
        slider.classList.add('end')
    } else {
        slider.classList.remove('end')
    }
}

function resetSlider() {
    const handle = document.querySelector('.handle');

    if(!handle) return;

    // 引手を変形する
    handle.rotate = 0;
    handle.style.transformOrigin = `50% 0`;
    handle.style.transform = `translateX(-50%) rotate(0deg)`;
    handle.style.transition=  'all .5s ease';
}

function getPosition(target) {
    if(!target) return null;

    const position = {x: 0, y: 0};

    // デフォルトでは要素の上部中心の座標を取得する
    const tr = target.getBoundingClientRect();
    position.x = window.pageXOffset + tr.left + target.clientWidth / 2;
    position.y = window.pageYOffset + tr.top;

    // 要素の回転に応じて取得する座標を変更する
    if(!target.rotate) {
        return position;
    }

    if(target.rotate > 90) {
        position.x = window.pageXOffset + tr.right;
        position.y = window.pageYOffset + tr.bottom;
    }

    if(target.rotate < -90) {
        position.x = window.pageXOffset + tr.left;
        position.y = window.pageYOffset + tr.bottom;
    }

    return position;
}

function getProgress(event) {
    const line = document.querySelector('.line');
    const slider = document.querySelector('.slider');

    if(!line || !slider) return result;

    // スクロール位置を取得する
    const my = event.clientY;

    // スライダーの位置を取得する
    const sp = getPosition(slider);

    // スライダーの位置に応じて進捗率を計算する
    let progress = (sp.y / line.clientHeight) * 100;

    // 画面の最下部までスクロールされた場合進捗を100%とする
    if(my >= line.clientHeight - 1) {
        progress = 100;
    }

    return progress;
}