const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

let projectilefire = new Audio("music/blaster.mp3")
let asteroidsburst = new Audio("music/asteroids_burst.wav")
let gameover = new Audio("music/game_over.mp3")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// Canvas Bg
c.fillStyle = 'black'
c.fillRect(0, 0, canvas.width, canvas.height)

// PLAYER CLASS -------------------------------------------------------------->
class Player {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.rotation = 0
    }

    draw(){
        c.save()

        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)

        c.beginPath()
        c.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false)
        c.fillStyle = 'red'
        c.fill()
        c.closePath()

        c.beginPath()
        c.moveTo(this.position.x + 30, this.position.y)
        c.lineTo(this.position.x -10, this.position.y -10)
        c.lineTo(this.position.x -10, this.position.y +10)
        c.closePath()


        c.strokeStyle = 'white'
        c.stroke()
        c.restore()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }

    getVertices() {
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)
    
        return [
          {
            x: this.position.x + cos * 30 - sin * 0,
            y: this.position.y + sin * 30 + cos * 0,
          },
          {
            x: this.position.x + cos * -10 - sin * 10,
            y: this.position.y + sin * -10 + cos * 10,
          },
          {
            x: this.position.x + cos * -10 - sin * -10,
            y: this.position.y + sin * -10 + cos * -10,
          },
        ]
      }
}

// PROJECTILE CLASS -------------------------------------------------------------->
class Projectile {
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity
        this.radius = 5
    }

    draw(){
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
        c.closePath()
        c.fillStyle = 'White'
        c.fill()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// ASTEROID CLASS -------------------------------------------------------------->
class Asteroid {
    constructor({position, velocity, radius}){
        this.position = position
        this.velocity = velocity
        this.radius = radius
    }

    draw(){
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
        c.closePath()
        c.strokeStyle = 'White'
        c.stroke()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

const player1 = new Player({ 
    position: { x: canvas.width/2 , y: canvas.height/2},
    velocity: { x: 0, y: 0 }
 })

const keys = {
   w: {
    pressed: false,
   },
   d: {
    pressed: false,
   },
   a: {
    pressed: false,
   }
}

// SPEED VARIABLES
const SPEED = 3
const ROTATION_SPEED = 0.05
const FRICTION = 0.97
const PROJECTILE_SPEED = 3

// PROJECTILES, ASTEROIDS 
const projectiles = []
const asteroids = []

// SPAWNING ASTEROIDS -------------------------------------------------------------->
const IntervalId = window.setInterval(() => {
    const index = Math.floor(Math.random() * 4)
    let px, py
    let vx, vy
    let radius = 50 * Math.random() + 10

    switch (index) {
        case 0: // left side of the screen
            px = 0 - radius
            py = Math.random() * canvas.height
            vx = 1
            vy = 0
            break
        case 1: // bottom side of the screen
            px = Math.random() * canvas.width
            py = canvas.height + radius
            vx = 0
            vy = -1
            break
        case 2: // right side of the screen
            px = canvas.width + radius
            py = Math.random() * canvas.height
            vx = -1
            vy = 0
            break
        case 3: // top side of the screen
            px = Math.random() * canvas.width
            py = 0 - radius
            vx = 0
            vy = 1
            break
    }

    asteroids.push(new Asteroid({
        position: {
            x: px,
            y: py,
        },
        velocity: {
            x: vx,
            y: vy,
        },
        radius,
    })
    )
}, 3000)

// ASTEROIDS BURSTING -------------------------------------------------------------->
function circleCollison(circle1, circle2){
    const xdifference = circle2.position.x - circle1.position.x
    const ydifference = circle2.position.y - circle1.position.y

    const distance = Math.sqrt(xdifference * xdifference + ydifference * ydifference)
    
    if (distance <= circle1.radius + circle2.radius){
        return true
    }
    return false
}

// GAME OVER -------------------------------------------------------------->
function circleTriangleCollision(circle, triangle) {
    // Check if the circle is colliding with any of the triangle's edges
    for (let i = 0; i < 3; i++) {
      let start = triangle[i]
      let end = triangle[(i + 1) % 3]
  
      let dx = end.x - start.x
      let dy = end.y - start.y
      let length = Math.sqrt(dx * dx + dy * dy)
  
      let dot =
        ((circle.position.x - start.x) * dx +
          (circle.position.y - start.y) * dy) /
        Math.pow(length, 2)
  
      let closestX = start.x + dot * dx
      let closestY = start.y + dot * dy
  
      if (!isPointOnLineSegment(closestX, closestY, start, end)) {
        closestX = closestX < start.x ? start.x : end.x
        closestY = closestY < start.y ? start.y : end.y
      }
  
      dx = closestX - circle.position.x
      dy = closestY - circle.position.y
  
      let distance = Math.sqrt(dx * dx + dy * dy)
  
      if (distance <= circle.radius) {
        return true
      }
    }
  
    // No collision
    return false
  }
  
  function isPointOnLineSegment(x, y, start, end) {
    return (
      x >= Math.min(start.x, end.x) &&
      x <= Math.max(start.x, end.x) &&
      y >= Math.min(start.y, end.y) &&
      y <= Math.max(start.y, end.y)
    )
  }

// ANIMATIONS -------------------------------------------------------------->
function animate(){
    const AnimationId = window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)

    player1.update()
    
    // garbage collection for projectiles
    for(let i = projectiles.length-1; i>=0; i--){
        const projectile = projectiles[i]
        projectile.update()

        if (projectile.position.x + projectile.radius < 0
            || projectile.position.x - projectile.radius > canvas.width
            || projectile.position.y - projectile.radius > canvas.height
            || projectile.position.y + projectile.radius < 0) {
            projectiles.splice(i, 1)
        }
    }

    // asteroids management 
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i]
        asteroid.update()

        if(circleTriangleCollision(asteroid, player1.getVertices())){
            window.cancelAnimationFrame(AnimationId)
            clearInterval(IntervalId)
            gameover.play()
        }

        if (asteroid.position.x + asteroid.radius < 0
            || asteroid.position.x - asteroid.radius > canvas.width
            || asteroid.position.y - asteroid.radius > canvas.height
            || asteroid.position.y + asteroid.radius < 0) {
            asteroids.splice(i, 1)
        }

        // projectiles
        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j]

            if (circleCollison(asteroid, projectile)) {
                asteroidsburst.play()
                asteroids.splice(i, 1)
                projectiles.splice(j, 1)
            }
        }
    }

    if(keys.w.pressed) {
        player1.velocity.x = Math.cos(player1.rotation) * SPEED
        player1.velocity.y = Math.sin(player1.rotation) * SPEED
    }else if (!keys.w.pressed){
        player1.velocity.x *= FRICTION
        player1.velocity.y *= FRICTION
    }
    

    if(keys.d.pressed) player1.rotation += ROTATION_SPEED

    else if(keys.a.pressed) player1.rotation -= ROTATION_SPEED
    
}
animate()
player1.draw()

// EVENT LISTENERS -------------------------------------------------------------->
window.addEventListener('keydown',(event)=>{
    switch(event.code){
        case 'KeyW': 
        keys.w.pressed = true
        break
        case 'KeyA':
        keys.a.pressed = true
        break
        case 'KeyD':
        keys.d.pressed = true
        break
        case 'Space':
            projectiles.push(
                new Projectile({
                    position: {
                        x: player1.position.x + Math.cos(player1.rotation) * 30,
                        y: player1.position.y + Math.sin(player1.rotation) * 30,
                    },
                    velocity: {
                        x: Math.cos(player1.rotation) * PROJECTILE_SPEED,
                        y: Math.sin(player1.rotation) * PROJECTILE_SPEED,
                    },
                })
            )
            projectilefire.play()
        break
    }
})

window.addEventListener('keydown',(event)=>{
    switch(event.code){
        case 'KeyW': 
        keys.w.pressed = true
        break
        case 'KeyA':
        keys.a.pressed = true
        break
        case 'KeyD':
        keys.d.pressed = true
        break
    }
})

window.addEventListener('keyup',(event)=>{
    switch(event.code){
        case 'KeyW': 
        keys.w.pressed = false
        break
        case 'KeyA':
        keys.a.pressed = false
        break
        case 'KeyD':
        keys.d.pressed = false
        break
    }
})