let size, y, x, xv, w, h, c, targetspeed, score, playing
let images = []
let map, trees, trail
let skier = {}
let scream, skisound
let fixedcolor = false

function preload() {
    for(let i=0; i<=4; i++) {
        images.push(loadImage(`images/snow-${i}.png`))
    }
    for(i=0; i<=1; i++) {
        images.push(loadImage(`images/tree_${i}.png`))
    }
    for(i=0; i<=13; i++) {
        images.push(loadImage(`images/skier-${i}.png`))
    }
    scream = loadSound("girl-scream-45657.wav")
    skisound = loadSound("ski-67717.mp3")
}

function setup() {
    if(canvas.innerHTML == "") {
        let cnvs = createCanvas(windowWidth, windowHeight)
        cnvs.parent("canvas")
    }
    size = (width+height)/2/20
    noSmooth()
    imageMode(CENTER)
    rectMode(CENTER)
    angleMode(DEGREES)
    textAlign(CENTER, BOTTOM)

    w=ceil(width/size)
    h=ceil(height/size)+2

    score = 0
    c=size/10
    targetspeed = c
    playing = false
    y=0
    x=0
    xv=0
    //make map
    map = []
    for(let iy=0; iy<h; iy++) {
        let temp = []
        for(let ix=0; ix<w; ix++) {
            let image = {}
            image.r = round(random(0, 3))*90
            image.i = images[round(random(0, 3))]
            temp.push(image)
        }
        map.push(temp)
    }
    trees = []
    trail = []

    skier.image = 0
    skier.dir = 0
    skier.alive = true

    if(!fixedcolor) {
        for(let i=0; i<2; i++) {
            images[5+i].loadPixels()
            for (let z = 0; z < images[5+i].pixels.length; z += 4) {
                images[5+i].pixels[z] = min(images[5+i].pixels[z] * 1.4, 255)
                images[5+i].pixels[z + 1] = min(images[5+i].pixels[z + 1] * 1.4, 255)
                images[5+i].pixels[z + 2] = min(images[5+i].pixels[z + 2] * 1.75, 255)
            }
            images[5+i].updatePixels()
        }
        fixedcolor = true
    }
    startbox.style.display = "block"
}

function draw() {
    background(0)

    //tiles
    push()
    translate(0, y)
    let iy = 0
    let ix = 0
    map.forEach((my) => {
        my.forEach((mx) => {
            push()
            translate((ix+0.5)*size, (iy+0.5)*size)
            rotate(mx.r)
            image(mx.i, 0, 0, size, size)
            pop()
            ix++
        })
        ix=0
        iy++
    })

    while((map.length-0.5)*size+y<height+c) {
        map.splice(0, 1)
        y+=size
        let temp = []
        for(let x=0; x<w; x++) {
            let image = {}
            image.r = round(random(0, 3))*90
            image.i = images[round(random(0, 3))]
            if(random(0, 1/score*1000) < 0.05) image.i = images[4]
            temp.push(image)
        }
        map.push(temp)
    }
    pop()

    //skier
    if(playing && skier.alive) {
        //trail
        push()
        noStroke()
        let i = 0
        trail.forEach((t) => {
            fill(t.w, t.w*1.17, t.w*1.2)
            rect(t.x, t.y, size/5, size/5)
            t.y -= c
            if(t.y < -size) trail.splice(i, 1)
            i++
        })
        let t = {}
        t.x = width/2+x+random(-0.5, 0.5)*size-xv
        t.y = floor(h/4+0.25)*size
        t.w = random(170, 200)
        trail.push(t)
        pop()

        if(!skisound.isPlaying()) skisound.play()
        push()
        image(images[skier.image+7], width/2+x, floor(h/4)*size, size*2, size*2)
        if(skier.alive) {
            if(skier.dir === 0) {
                if(skier.image>4) {
                    if(frameCount%7 === 0) {
                        if(skier.image === 9) skier.image = 0
                        else skier.image--
                    }
                    c = (c+targetspeed)/2
                } else {
                    if(frameCount%10 === 0) skier.image = (skier.image+1)%4
                    if(round(skier.image/2) != skier.image/2) c *= 1.02
                    c = (c*99+targetspeed)/100
                }
                xv*=0.9
            } else if(skier.dir>0) {
                if(frameCount%7 === 0) skier.image++
                if(skier.image<5) skier.image = 5
                if(skier.image > 9) skier.image = 4
                if(skier.image >= 8) skier.image = 8
                c *= 1.003
                xv+=size/300
            } else if(skier.dir<0) {
                if(frameCount%7 === 0) skier.image++
                if(skier.image<9) skier.image = 9
                if(skier.image > 13) skier.image = 13
                c *= 1.003
                xv-=size/300
            }
            if(!mouseIsPressed && !keyIsPressed) {
                skier.dir = 0
            }
            c = (c+targetspeed)/2
        }
        pop()

        //hitbox
        ix = 0
        iy = 0
        map.forEach((my) => {
            my.forEach((mx) => {
                if(mx.i === images[4] && (ix+0.5)*size < width) {
                    if(abs((width/2+x)-(ix+0.5)*size) < size) {
                        if(abs((floor(h/4)*size+size*2)-(iy+0.5)*size) < size) {
                            skier.alive = false
                            scream.play()
                            setup()
                        }
                    }
                }
                ix++
            })
            ix = 0
            iy++
        })

        trees.forEach((t) => {
            if((ix+0.5)*size < width) {
                if(abs((width/2+x)-t.x) < size) {
                    if(abs((floor(h/4)*size+size*2)-(t.y+size*3)) < size) {
                        skier.alive = false
                        c /= 1.3
                        xv /= 1.3
                        scream.play()
                        setup()
                    }
                }
            }
        })
        //trees
        if(random(0, 25)<0.1*c) {
            let tree = {}
            tree.i = round(random(5, 6))
            tree.y = height+size*3
            tree.x = size*(w*random(0, 1))
            trees.push(tree)
        }
    } else skisound.stop()
    push()
    trees.forEach((t) => {
        image(images[t.i], t.x, t.y, size*2.5, size*5)
        t.y -= c
    })
    pop()

    //offscreen
    if(x > width/2) x = -width/2
    if(x < -width/2) x = width/2

    if(playing) {
        fill('#3b154a')
        textSize(width/20)
        text(round(score), width/2, height-width/80)
        score += c/50
        score = score
    }

    y -= c
    x+=xv
    if(skier.alive) {
        if(playing) {
            c /= 1.01
            targetspeed += 0.002
        } else c = 1
    }
}

function mousePressed() {
    if(mouseX > x+width/2) {
        skier.dir = 1
    } else if(mouseX < x+width/2) {
        skier.dir = -1
    } else {
        skier.dir = 0
    }
}

function keyPressed() {
    if(keyCode == 39) skier.dir = 1
    if(keyCode == 37) skier.dir = -1
}

start.addEventListener("click", () => {
    startbox.style.display = "none"
    playing = true
})