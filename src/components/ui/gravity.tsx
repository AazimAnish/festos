"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Engine, Render, World, Bodies, Body, Composite, Mouse, MouseConstraint, Events } from 'matter-js'

type GravityProps = {
  children: React.ReactNode
  className?: string
  gravity?: { x: number; y: number }
  enablePhysics?: boolean
}

type MatterBodyProps = {
  children: React.ReactNode
  x?: string | number
  y?: string | number
  angle?: number
  matterBodyOptions?: any
}

export const MatterBody = ({ children }: MatterBodyProps) => {
  return <div>{children}</div>
}

const Gravity: React.FC<GravityProps> = ({ 
  children, 
  className = '',
  gravity = { x: 0, y: 1 },
  enablePhysics = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const worldRef = useRef<Matter.World | null>(null)
  const bodiesRef = useRef<{ [key: string]: Matter.Body }>({})
  const renderRef = useRef<Matter.Render | null>(null)
  const [mounted, setMounted] = useState(false)

  // Initialize the physics engine
  useEffect(() => {
    if (!containerRef.current || !enablePhysics) return

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Create engine and world with reduced physics detail
    const engine = Engine.create({
      gravity: gravity,
      positionIterations: 4, // Reduced from default 6
      velocityIterations: 3, // Reduced from default 4
    })
    engineRef.current = engine
    worldRef.current = engine.world

    // Create renderer with optimized settings
    const render = Render.create({
      element: container,
      engine: engine,
      options: {
        width: containerWidth,
        height: containerHeight,
        wireframes: false,
        background: 'transparent',
        pixelRatio: Math.min(1, window.devicePixelRatio), // Limit to lower resolution
      },
    })
    renderRef.current = render

    // Add walls to keep bodies inside
    const wallThickness = 50
    const walls = [
      // Bottom wall
      Bodies.rectangle(
        containerWidth / 2,
        containerHeight + wallThickness / 2,
        containerWidth,
        wallThickness,
        { isStatic: true, render: { visible: false } }
      ),
      // Left wall
      Bodies.rectangle(
        -wallThickness / 2,
        containerHeight / 2,
        wallThickness,
        containerHeight,
        { isStatic: true, render: { visible: false } }
      ),
      // Right wall
      Bodies.rectangle(
        containerWidth + wallThickness / 2,
        containerHeight / 2,
        wallThickness,
        containerHeight,
        { isStatic: true, render: { visible: false } }
      ),
    ]
    Composite.add(engine.world, walls)

    // Add mouse control with performance optimizations
    const mouse = Mouse.create(render.canvas)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    })

    Composite.add(engine.world, mouseConstraint)

    // Use slower update rate for better performance
    let lastTime = 0
    const fixedTimeStep = 1000 / 30; // 30 FPS instead of 60
    
    const engineLoop = (time: number) => {
      if (!engineRef.current) return;
      
      const delta = time - lastTime;
      if (delta > fixedTimeStep) {
        Engine.update(engineRef.current, fixedTimeStep);
        lastTime = time;
      }
      
      requestAnimationFrame(engineLoop);
    };

    // Start the renderer
    Render.run(render)
    requestAnimationFrame(engineLoop);

    // Cleanup
    return () => {
      if (renderRef.current) {
        Render.stop(render)
        render.canvas.remove()
        render.textures = {}
        renderRef.current = null
      }
      
      if (engineRef.current) {
        Engine.clear(engineRef.current)
        engineRef.current = null
      }
      
      worldRef.current = null
    }
  }, [gravity, enablePhysics])

  // Add or update physics bodies for each child
  useEffect(() => {
    if (!enablePhysics || !engineRef.current || !worldRef.current || !containerRef.current) return

    setMounted(true)

    return () => {
      // Cleanup bodies on unmount
      if (worldRef.current && Object.keys(bodiesRef.current).length > 0) {
        const bodiesToRemove = Object.values(bodiesRef.current)
        Composite.remove(worldRef.current, bodiesToRemove)
        bodiesRef.current = {}
      }
    }
  }, [children, enablePhysics])

  // Optimized update function
  const updateElement = useCallback((el: Element, body: Matter.Body, rect: DOMRect) => {
    if (!body.position) return
    
    const htmlEl = el as HTMLElement;
    const translateX = body.position.x - rect.width / 2;
    const translateY = body.position.y - rect.height / 2;
    htmlEl.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotate(${body.angle}rad)`;
    htmlEl.style.position = 'absolute';
    htmlEl.style.top = '0';
    htmlEl.style.left = '0';
    htmlEl.style.zIndex = '10';
  }, []);

  // Create a body for each MatterBody component
  useEffect(() => {
    if (!mounted || !enablePhysics || !containerRef.current || !worldRef.current || !engineRef.current) return

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Get all MatterBody elements
    const physicsElements = container.querySelectorAll('.physics-element')
    const existingKeys = Object.keys(bodiesRef.current)
    const currentKeys: string[] = []

    physicsElements.forEach((el, index) => {
      const key = el.getAttribute('data-key') || `physics-${index}`
      currentKeys.push(key)
      
      const rect = el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      
      const x = rect.left - containerRect.left + rect.width / 2
      const y = rect.top - containerRect.top + rect.height / 2
      
      // Create or update body
      if (!bodiesRef.current[key]) {
        // Create new body
        const body = Bodies.rectangle(
          x,
          y,
          rect.width,
          rect.height,
          {
            restitution: 0.3,
            friction: 0.1,
            frictionAir: 0.01,
            render: { visible: false }
          }
        )
        
        Composite.add(worldRef.current!, body)
        bodiesRef.current[key] = body
        
        // Use a cached update function and requestAnimationFrame for smoother updates
        let rafId: number | null = null;
        
        const scheduleUpdate = () => {
          updateElement(el, body, rect);
          rafId = null;
        };
        
        const updateEl = () => {
          if (rafId === null) {
            rafId = requestAnimationFrame(scheduleUpdate);
          }
        };
        
        // Use fewer update events
        Events.on(engineRef.current!, 'afterUpdate', updateEl)
      } else {
        // Update existing body position if element moved
        const body = bodiesRef.current[key]
        Body.setPosition(body, { x, y })
      }
    })

    // Remove bodies for elements that no longer exist
    existingKeys.forEach(key => {
      if (!currentKeys.includes(key) && bodiesRef.current[key] && worldRef.current) {
        Composite.remove(worldRef.current, bodiesRef.current[key])
        delete bodiesRef.current[key]
      }
    })
  }, [mounted, children, enablePhysics, updateElement])

  // Render MatterBody children with proper elements for physics
  const renderPhysicsChildren = () => {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child
      
      if (child.type === MatterBody) {
        const { x, y, angle, matterBodyOptions, children: bodyChildren } = child.props as MatterBodyProps;
        
        const getPosition = (pos: string | number, dimension: 'width' | 'height'): number => {
          if (typeof pos === 'number') return pos
          if (!containerRef.current) return 0
          
          const containerSize = dimension === 'width' 
            ? containerRef.current.clientWidth 
            : containerRef.current.clientHeight
          
          if (typeof pos === 'string' && pos.endsWith('%')) {
            return (parseInt(pos) / 100) * containerSize
          }
          
          return 0
        }
        
        const xPos = getPosition(x || '50%', 'width')
        const yPos = getPosition(y || '50%', 'height')
        
        return (
          <div
            key={index}
            className="physics-element"
            data-key={`physics-${index}`}
            data-angle={angle || 0}
            data-options={JSON.stringify(matterBodyOptions || {})}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: `translate3d(${xPos}px, ${yPos}px, 0) rotate(${angle || 0}rad)`,
              willChange: 'transform'
            }}
          >
            {bodyChildren}
          </div>
        )
      }
      
      return child
    })
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {renderPhysicsChildren()}
    </div>
  )
}

export default Gravity 