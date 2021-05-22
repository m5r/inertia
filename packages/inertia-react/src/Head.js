import React, { useContext, useEffect, useMemo } from 'react'
import HeadContext from './HeadContext'

export default function InertiaLink({ children }) {
  const headManager = useContext(HeadContext)
  const provider = useMemo(() => headManager.createProvider(), [headManager])

  useEffect(() => {
    return () => { provider.disconnect() }
  }, [provider])

  function renderStartTag(node) {
    // TODO: Remove children
    // TODO: Remove dangerouslySetInnerHTML
    const attrs = Object.keys(node.props).reduce((carry, name) => {
      const value = node.props[name]
      if (value === '') {
        return carry + ` ${name}`
      } else {
        return carry + ` ${name}="${value}"`
      }
    }, '')

    return `<${node.type}${attrs}>`
  }

  function renderChildren(node) {
    return typeof node.props.children === 'string'
      ? node.props.children
      : node.props.children.reduce((html, child) => html + renderFullTag(child), '')
  }

  function isUnaryTag(node) {
    return [
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
      'input', 'keygen', 'link', 'meta', 'param', 'source',
      'track', 'wbr',
    ].indexOf(node.type) > -1
  }

  function renderFullTag(node) {
    let html = renderStartTag(node)
    if (node.props.children) {
      html += renderChildren(node)
    }
    if (!isUnaryTag(node)) {
      html += `</${node.type}>`
    }
    return html
  }

  function ensureNodeHasInertiaProp(node) {
    return React.cloneElement(node, { inertia: node.props.inertia || '' })
  }

  function renderNode(node) {
    return renderFullTag(ensureNodeHasInertiaProp(node))
  }

  function renderNodes(nodes) {
    return (Array.isArray(nodes) ? nodes : [nodes]).map(node => renderNode(node))
  }

  provider.update(renderNodes(children))

  return null
}
