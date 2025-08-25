import React from 'react'
import { useNavigation } from '../contexts/NavigationContext'

/**
 * IconBar Component
 * 
 * Responsibilities:
 * - Display left navigation icons
 * - Handle icon bar interactions
 * - Manage active icon state
 */
const IconBar = () => {
  const { iconBarItems, activeIconBarItem, setActiveIconBarItem } = useNavigation()

  const handleIconClick = (itemId) => {
    setActiveIconBarItem(itemId)
  }

  return (
    <div className="icon-bar">
      {iconBarItems.map((item) => (
        <div
          key={item.id}
          className={`icon-item ${activeIconBarItem === item.id ? 'active' : ''}`}
          onClick={() => handleIconClick(item.id)}
          title={item.label}
        >
          <span>{item.icon}</span>
        </div>
      ))}
    </div>
  )
}

export default IconBar 