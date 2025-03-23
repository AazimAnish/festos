"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Engine, Render, World, Bodies, Body, Composite, Mouse, MouseConstraint, Events } from 'matter-js'

type GravityProps = {
  children: React.ReactNode
  className?: string
  gravity?: { x: number; y: number }
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
  gravity = { x: 0, y: 1 }
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const worldRef = useRef<Matter.World | null>(null)
  const bodiesRef = useRef<{ [key: string]: Matter.Body }>({})
  const [mounted, setMounted] = useState(false)

  // Initialize the physics engine
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Create engine and world
    const engine = Engine.create({
      gravity: gravity,
    })
    engineRef.current = engine
    worldRef.current = engine.world

    // Create renderer
    const render = Render.create({
      element: container,
      engine: engine,
      options: {
        width: containerWidth,
        height: containerHeight,
        wireframes: false,
        background: 'transparent',
      },
    })

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

    // Add mouse control
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

    // Start the engine and renderer
    Engine.run(engine)
    Render.run(render)

    // Cleanup
    return () => {
      Render.stop(render)
      Engine.clear(engine)
      render.canvas.remove()
      render.textures = {}
    }
  }, [gravity])

  // Add or update physics bodies for each child
  useEffect(() => {
    if (!engineRef.current || !worldRef.current || !containerRef.current) return

    setMounted(true)

    return () => {
      // Cleanup bodies on unmount
      if (worldRef.current && Object.keys(bodiesRef.current).length > 0) {
        const bodiesToRemove = Object.values(bodiesRef.current)
        Composite.remove(worldRef.current, bodiesToRemove)
        bodiesRef.current = {}
      }
    }
  }, [children])

  // Create a body for each MatterBody component
  useEffect(() => {
    if (!mounted || !containerRef.current || !worldRef.current) return

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
        
        // Attach element to body
        const updateEl = () => {
          if (!body.position) return
          
          el.style.transform = `translate(${body.position.x - rect.width / 2}px, ${body.position.y - rect.height / 2}px) rotate(${body.angle}rad)`
          el.style.position = 'absolute'
          el.style.top = '0'
          el.style.left = '0'
          el.style.zIndex = '10'
        }
        
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
  }, [mounted, children])

  // Render MatterBody children with proper elements for physics
  const renderPhysicsChildren = () => {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child
      
      if (child.type === MatterBody) {
        const { x, y, angle, matterBodyOptions, children: bodyChildren } = child.props
        
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
              transform: `translate(${xPos}px, ${yPos}px) rotate(${angle || 0}rad)`,
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